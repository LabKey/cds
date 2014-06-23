/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AssayVariableList', {

    xtype : 'app.module.assayvariablelist',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl>',
            Connector.constant.Templates.module.title,
            '<tpl if="!values.variables">',
                Connector.constant.Templates.module.loadingData,
            '<tpl else>',
	            '<tpl if="variables.key.length">',
		            '<tpl if="showNames"><h4>RECOMMENDED</h4></tpl>',
		            '<tpl for="variables.key">',
			            '<p class="item-row">{label}</p>',
		            '</tpl>',
	            '</tpl>',
	            '<tpl if="variables.other.length">',
		            '<tpl if="showNames"><h4>ADDITIONAL</h4></tpl>',
		            '<tpl for="variables.other">',
			            '<p class="item-row">{label}</p>',
		            '</tpl>',
		        '<tpl else>',
		            '<p class="item-row">No antigens</p>',
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
    },

    initComponent : function() {
        var data = this.data;

        var store = StoreCache.getStore('Connector.app.store.DataSet');
        var me = this;

        var assayName = data.model.get('Name');

        function dataSetsLoaded(store, records) {
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
            store.on('load', dataSetsLoaded, this, {
                single: true
            });
            store.load();
        } else {
            dataSetsLoaded.call(this, store, store.data.items);
        }

        this.callParent();
    }
});
