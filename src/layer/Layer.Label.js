/*
 * Adds label-related methods to all layers.
 */

L.Layer.include({

	bindLabel: function (content, options) {

		if (content instanceof L.Label) {
			L.setOptions(content, options);
			this._label = content;
			content._source = this;
		} else {
			if (!this._label || options) {
				this._label = L.label(options, this);
			}
			this._label.setContent(content);

		}
		// save the originally passed offset
		this._originalLabelOffset = this._label.options.offset;

		this._initLabelInteractions();

		if (this._label.options.static) { this.openLabel(); }

		return this;
	},

	unbindLabel: function () {
		if (this._label) {
			this._initLabelInteractions(true);
			this._label = null;
		}
		return this;
	},

	_initLabelInteractions: function (remove) {
		if (!remove && this._labelHandlersAdded) { return; }
		var onOff = remove ? 'off' : 'on',
		    events = {
			remove: this.closeLabel,
			move: this._moveLabel
		    };
		if (!this._label.options.static) {
			events.mouseover = this._openLabel;
			events.mouseout = this.closeLabel;
			if (this._label.options.followMouse) {
				events.mousemove = this._moveLabel;
			}
			if (L.Browser.touch) {
				events.click = this._openLabel;
			}
		}
		this[onOff](events);
		this._labelHandlersAdded = !remove;
	},

	openLabel: function (layer, latlng) {
		if (!(layer instanceof L.Layer)) {
			latlng = layer;
			layer = this;
		}

		if (layer instanceof L.FeatureGroup) {
			for (var id in this._layers) {
				layer = this._layers[id];
				break;
			}
		}

		if (!latlng) {
			latlng = layer.getCenter ? layer.getCenter() : layer.getLatLng();
		}

		if (this._label && this._map) {

			// set label source to this layer
			this._label._source = layer;

			// update the label (content, layout, ect...)
			this._label.update();

			// open the label on the map
			this._map.openLabel(this._label, latlng);

			if (this._label.options.interactive) {
				L.DomUtil.addClass(this._label._container, 'leaflet-clickable');
				this.addInteractiveTarget(this._label._container);
			}
		}

		return this;
	},

	closeLabel: function () {
		if (this._label) {
			this._label._close();
			if (this._label.options.interactive) {
				L.DomUtil.removeClass(this._label._container, 'leaflet-clickable');
				this.removeInteractiveTarget(this._label._container);
			}
		}
		return this;
	},

	toggleLabel: function (target) {
		if (this._label) {
			if (this._label._map) {
				this.closeLabel();
			} else {
				this.openLabel(target);
			}
		}
		return this;
	},

	isLabelOpen: function () {
		return this._label.isOpen();
	},

	setLabelContent: function (content) {
		if (this._label) {
			this._label.setContent(content);
		}
		return this;
	},

	getLabel: function () {
		return this._label;
	},

	_openLabel: function (e) {
		var layer = e.layer || e.target;

		if (!this._label || !this._map) {
			return;
		}
		this.openLabel(layer, this._label.options.followMouse ? e.latlng : undefined);
	},

	_moveLabel: function (e) {
		var latlng = e.latlng, containerPoint, layerPoint;
		if (this._label.options.followMouse && e.originalEvent) {
			containerPoint = this._map.mouseEventToContainerPoint(e.originalEvent);
			layerPoint = this._map.containerPointToLayerPoint(containerPoint);
			latlng = this._map.layerPointToLatLng(layerPoint);
		}
		this._label.setLatLng(latlng);
	}
});
