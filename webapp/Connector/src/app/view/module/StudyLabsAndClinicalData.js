/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyLabsAndClinicalData', {

    xtype : 'app.module.studylabsandclinicaldata',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl><p>',
            Connector.constant.Templates.module.title,
            '<tpl if="!values.dataSets">',
                '<p class="loading-data">Loading data...</p>',
            '</tpl>',
            '<div class="disabled"><div class="checkbox">&#10003</div> = available in the data connector</div>',
            '<tpl for="dataSets">',
                '<div>',
                    '<div class="checkbox">',
                        '<tpl if="values.hasDataFromStudy(parent.model.get(\'Label\'))">',
                            '&#10003',
                        '</tpl>',
                    '</div>',
                    '<a href="#">{[values.get("Label")]}</a>',
                '</div>',
            '</tpl>',
        '</p></tpl>'),

    initComponent : function() {
        var data = this.data;

        var study = data.model;
        var studyId = study.get('Label');

        var store = StoreCache.getStore('Connector.app.store.DataSet');

        var me = this;

        function dataSetsLoaded(store, records) {
            data.dataSets = records;
            me.update(data);
            Ext.each(records, function(record) {
                record.queryDataFromStudy(studyId, function(hasData) {
                    me.update(data);
                })
            })
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
