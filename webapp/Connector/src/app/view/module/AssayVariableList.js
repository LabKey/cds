/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AssayVariableList', {

    xtype : 'app.module.assayvariablelist',

    extend : 'Connector.view.module.BaseModule',

    cls : 'module assaylist',

    tpl : new Ext.XTemplate(
        '<tpl>',
            Connector.constant.Templates.module.title,
            '<tpl if="values.variables">',
	            '<tpl if="variables.key.length">',
		            '<tpl if="showNames"><p class="groupheader">Recommended</p></tpl>',
		            '<tpl for="variables.key">',
                        '<p class="item-row interactive">{label}</p>',
		            '</tpl>',
	            '</tpl>',
	            '<tpl if="variables.other.length">',
		            '<tpl if="showNames"><p class="groupheader">Additional</p></tpl>',
		            '<tpl for="variables.other">',
			            '<p class="item-row interactive">{label}</p>',
		            '</tpl>',
		        '<tpl else>',
                    '<p class="item-row">Data currently unavailable</p>',
	            '</tpl>',
            '</tpl>',
        '</tpl>'),

    assayDataLoaded : function(data) {
    	// TEST:
    	// if (data.variables.other.length && !data.variables.key.length) {
    	// 	var v = data.variables.other.pop();
    	// 	data.variables.key.push(v);
    	// }
		data.showNames = data.variables.key.length > 0;
        this.update(data);
        this.fireEvent('hideLoad', this);
    },

    initComponent : function() {
        var data = this.data,
            store = StoreCache.getStore('Connector.app.store.Dataset'),
            assayName = data.model.get('Name');

        function datasetsLoaded(store, records) {
        	var assayData;
        	var queryCount = records.length;
            Ext.each(records, function(record) {
                record.dataForAssayByName(assayName, assayData, {}, Ext.bind(function(updatedData) {
                	assayData = updatedData;
                	if (--queryCount == 0) {
                		data.variables = assayData.variables;
                		this.assayDataLoaded(data);
                	}
                }, this));
            }, this)
        }

        if (!store.data.length) {
            store.on('load', datasetsLoaded, this, {
                single: true
            });
            store.load();
        }
        else {
            datasetsLoaded.call(this, store, store.data.items);
        }

        this.callParent();

        this.on('render', function() {
            if (!data.variables) {
                this.fireEvent('showLoad', this);
            }
        });
    }
});
