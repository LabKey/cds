/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyDataSets', {

    xtype : 'app.module.studydatasets',

    // Override default module class so that it can instead be used on each div
    cls: '',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl><p>',
            // Connector.constant.Templates.module.title,
            '<tpl if="!values.categories">',
                '<div class="module">',
                    Connector.constant.Templates.module.loadingData,
                '</div>',
            '</tpl>',
            '<tpl if="values.categories">',
                '<tpl for="categories">',
                    '<div class="module">',
                        '<h3>{category}</h3>',
                        Connector.constant.Templates.module.availableDataLegend,
                        '<tpl for="dataSets">',
                            '<div class="item-row">',
                                '<div class="checkbox">',

                                    // '<pre>',
                                    //     '{[JSON.stringify(this.values)]}',
                                    // '</pre>',
                                    '<tpl if="values.hasDataFromStudy(parent.model.get(\'Label\'))">',
                                        '&#10003',
                                    '</tpl>',
                                '</div>',
                                '<p>{[values.get("Label").value]}</p>',
                            '</div>',
                        '</tpl>',
                    '</div>',
                '</tpl>',
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
            var categoriesById = {};
            data.categories = [];
            Ext.each(records, function(record) {
                var category = record.get('CategoryId');
                if (category.value) {
                    if (!categoriesById[category.value]) {
                        var o = {
                            category: category.displayValue,
                            dataSets: [],
                            model: data.model
                        }
                        categoriesById[category.value] = o;
                        data.categories.push(o);
                    }
                    categoriesById[category.value].dataSets.push(record);
                    record.queryDataFromStudy(studyId, function(hasData) {
                        me.update(data);
                    });
                }
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
