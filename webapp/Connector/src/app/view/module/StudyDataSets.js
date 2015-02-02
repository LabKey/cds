/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyDatasets', {

    xtype : 'app.module.studydatasets',

    // Override default module class so that it can instead be used on each div
    cls: '',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl><p>',
            // Connector.constant.Templates.module.title,
            '<tpl if="values.categories">',
                '<tpl for="categories">',
                    '<tpl if="datasets.length">',
                        '<div class="module">',
                            '<h3>{category}</h3>',
                            Connector.constant.Templates.module.availableDataLegend,
                            '<tpl for="datasets">',
                                '<tpl if="values.hasDataFromStudy(parent.model.get(\'Label\'))">',
                                    '<div class="item-row">',
                                        '<div class="checkbox">',

                                            // '<pre>',
                                            //     '{[JSON.stringify(this.values)]}',
                                            // '</pre>',
                                            '<tpl if="values.hasDataFromStudy(parent.model.get(\'Label\'))">',
                                                '&#10003',
                                            '</tpl>',
                                        '</div>',
                                        '<tpl if="assayId">',
                                            '<a href="#learn/learn/Assay/{[encodeURIComponent(values.assayId)]}">{[values.get("Label").value]}</a>',
                                        '<tpl else>',
                                            '<p>{[values.get("Label").value]}</p>',
                                        '</tpl>',
                                    '</div>',
                                '</tpl>',
                            '</tpl>',
                        '</div>',
                    '</tpl>',
                '</tpl>',
            '</tpl>',
        '</p></tpl>'),

    initComponent : function() {
        var data = this.data;

        var study = data.model;
        var studyId = study.get('Label');

        var store = StoreCache.getStore('Connector.app.store.Dataset');

        var me = this;

        function datasetsLoaded(store, records) {
            data.datasets = records;
            var categoriesById = {};
            data.categories = [];
            Ext.each(records, function(record) {
                var category = record.get('CategoryId');
                if (category.value) {
                    if (!categoriesById[category.value]) {
                        var o = {
                            category: category.displayValue,
                            datasets: [],
                            model: data.model
                        };
                        categoriesById[category.value] = o;
                        data.categories.push(o);
                    }
                    record.queryDataFromStudy(studyId, Ext.bind(function(hasData) {
                        if (record.hasDataFromStudy(studyId)) {
                            categoriesById[category.value].datasets.push(record);
                            this.update(data);

                            var assayName = record.getAssayName();
                            var assay;
                            if (assayName) {
                                var assayStore = StoreCache.getStore("Connector.app.store.Assay");
                                this.state.onMDXReady(function(mdx) {
                                    var config = {
                                        onRows: [{hierarchy: "Assay.Name", member: 'members'}],
                                        //useNamedFilters: [LABKEY.app.constant.STATE_FILTER],
                                        success: function(slice) {
                                            assayStore.on('load', function() {
                                                assayStore.each(function(o) {
                                                    if (o.get('Name') == assayName) {
                                                        assay = o;
                                                    }
                                                });
                                                if (assay) {
                                                    record.assayId = assay.getId();
                                                    this.update(data);
                                                }
                                            }, this, {
                                                single: true
                                            });
                                            assayStore.loadSlice(slice);
                                        },
                                        scope: this
                                    };
                                    mdx.query(config);

                                }, this);
                            }
                        }
                    }, this));
                }
            }, me);
            me.update(data);
            me.fireEvent('hideLoad', me);
        }

        if (!store.data.length) {
            store.on('load', datasetsLoaded, this, {
                single: true
            });
            store.load();
        } else {
            datasetsLoaded(store, store.data.items);
        }

        this.callParent();

        this.on('render', function(){
            if (!data.categories) {
                this.fireEvent('showLoad', this);
            }
        });
    }
});
