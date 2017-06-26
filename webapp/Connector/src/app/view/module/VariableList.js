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

    viewConfig: {
        stripeRows: false,
        trackOver: false,
        selectedItemCls: '',

        getRowClass: function() {
            return 'variable-list-row';
        }
    },

    cls: 'learngrid variable-list-grid',

    columns : [{
        text: 'Name & Description',
        xtype: 'templatecolumn',
        flex: 1,
        resizable: false,
        dataIndex: 'label',
        tpl: new Ext.XTemplate(
                '<div class="variable-list-category-container">',
                    '<div class="variable-list-category-text">{[values.isRecommendedVariable ? "Recommended" : ""]}</div>',
                '</div>',
                '<div class="variable-list-title">',
                    '<h2>{label:htmlEncode}</h2>',
                '</div>',
                '<div class="variable-list-description">',
                    '{description:htmlEncode}',
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
                '<div class="detail-empty-text">No available variables meet your selection criteria.</div>'
        ).apply({});

        this.model.data.variable_store.loadVariables();
        this.store = this.model.data.variable_store;
        this.callParent();
    }
});