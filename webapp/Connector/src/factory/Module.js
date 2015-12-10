/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.factory.Module', {
	singleton: true,

	defineView: function(moduleSpec, model) {
		var data = {},
			xtype = Connector.constant.ModuleViewsLookup[moduleSpec.type];

		if (xtype) {
			if (model) {
				data.model = model;

				Ext.iterate(moduleSpec.modelData, function(key, value) {
					if (key === 'model') {
						console.error('Invalid module spec. The model property is reserved, don\'t add it as a model spec property');
					}
					else {
						var o = model;
						Ext.each(value.split('.'), function(prop, i) {
							// The first access of a model requires a get query, otherwise, it's a
							// straight object dereference
							o = (!i && Ext.isFunction(o.get)) ? o.get(prop) : o[prop];
						});
						data[key] = o;
					}
				})
			}
			else if (moduleSpec.modelData) {
				console.error('Invalid module spec. modelData exists but this module didn\'t receive a model instance');
			}

			Ext.iterate(moduleSpec.staticData, function(key, value) {
				if (key === 'model') {
					console.error('Invalid module spec. The model property is reserved, don\'t add it as a model spec property');
				}
				else {
					data[key] = value;
				}
			});

			return {
				xtype: xtype,
				data: data
			};
		}

		// Unrecognized module spec
		return null;
	},

	defineViews: function(moduleSpecs, model) {
		return Ext.Array.map(moduleSpecs, function(spec) {
			return this.defineView(spec, model);
		}, this);
	},

	createView: function(moduleSpec, model) {
		return Ext.create(this.defineView(moduleSpec, model));
	},

	createViews: function(moduleSpecs, model) {
		return Ext.Array.map(moduleSpecs, function(spec) {
			return this.createView(spec, model)
		}, this);
	}
});
