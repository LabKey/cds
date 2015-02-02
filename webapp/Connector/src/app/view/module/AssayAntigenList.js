/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AssayAntigenList', {

    xtype : 'app.module.assayantigenlist',

    extend : 'Connector.view.module.BaseModule',

    cls : 'module assaylist',

    tpl : new Ext.XTemplate(
        '<tpl>',
            Connector.constant.Templates.module.title,
            '<tpl if="values.antigens">',
	            '<tpl if="values.antigens.length">',
		            '<tpl for="antigens">',
			            '<p class="item-row interactive">{[values.get("Name")]}</p>',
		            '</tpl>',
		        '<tpl else>',
		            '<p class="item-row">No or unknown data</p>',
	            '</tpl>',
            '</tpl>',
        '</tpl>'),

    assayDataLoaded : function(data) {
        this.update(data);
        this.fireEvent('hideLoad', this);
    },

    initComponent : function() {
        var data = this.data;

        var store = StoreCache.getStore('Connector.app.store.Dataset');
        var me = this;

        var assayName = data.model.get('Name');

        function datasetsLoaded(store, records) {
        	var assayData;
        	var queryCount = records.length;
            Ext.each(records, function(record) {
                record.dataForAssayByName(assayName, assayData, {
                	antigens: true	// Include antigen data
                }, Ext.bind(function(updatedData) {
                	assayData = updatedData;
                	if (--queryCount == 0) {
                		data.antigens = assayData.antigens;
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
        } else {
            datasetsLoaded.call(this, store, store.data.items);
        }

        this.callParent();

        this.on('render', function(){
            if (!data.antigens) {
                this.fireEvent('showLoad', this);
            }
        });
    }
});
