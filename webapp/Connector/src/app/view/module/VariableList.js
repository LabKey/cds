/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.VariableList', {

    xtype : 'app.module.variablelist',

    extend : 'Connector.app.view.LearnGrid',

    hideHeaders: true,

    isDetailLearnGrid: true,

    statics: {
        searchFields: ['alias', 'description', 'label']
    },

    columns : [{
        text: 'Name & Description',
        xtype: 'templatecolumn',
        flex: 1,
        resizable: false,
        dataIndex: 'label',
        tpl: new Ext.XTemplate(
                '<div class="list-container">',
                    '<div class="list-entry-container">',
                        '<div class="detail-left-column">',
                            '<div class="list-category-container">',
                                '<div class="list-category-detail">{[values.isRecommendedVariable ? "Recommended" : ""]}</div>',
                            '</div>',
                            '<div class="list-entry-title">',
                                '<h2>{label:htmlEncode}</h2>',
                            '</div>',
                            '<div class="list-entry-description">',
                                '<div>{description:htmlEncode}</div>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>')
    }],

    initComponent : function() {
        if (this.learnViewConfig)
        {
            this.learnView = this.learnViewConfig.learnView;
            this.tabId = this.learnViewConfig.tabId;
            this.tabDimension = this.learnViewConfig.tabDimension;
            this.tabParams = this.learnViewConfig.tabParams;
        }
        this.emptyText = new Ext.XTemplate(
                '<div class="detail-empty-text">No available Variables meet your selection criteria.</div>'
        ).apply({});

        var store = StoreCache.getStore('Connector.app.store.VariableList');
        store.loadVariables(this.model.data.assay_type);

        this.store = store;
        this.callParent();
    }
});