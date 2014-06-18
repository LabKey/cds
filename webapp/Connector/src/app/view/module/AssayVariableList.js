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
            'Variable data goes here',
            // '<tpl if="model.get(\'Category\')"><p class="item-row">Category: {[values.model.get("Category")]}</p></tpl>',
        '</tpl>'),

    initComponent : function() {
        var data = this.data;

        var store = StoreCache.getStore('Connector.app.store.DataSet');
        var me = this;

        var assayName = data.model.get('Name');

        function dataSetsLoaded(store, records) {
            Ext.each(records, function(record) {
//                record.hasDataForAssayByName(assayName);

                // record.getVariables(studyId, function(hasData) {
                //     console.log("GV");
                // })
            })
            me.update(data);
        }

        if (!store.data.length) {
            store.on('load', dataSetsLoaded, this, {
                single: true
            });
            store.load();
        } else {
            dataSetsLoaded(store, store.data.items);
        }

        this.callParent();
    }
});
