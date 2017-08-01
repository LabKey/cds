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

        rowIsSectionHeader : function(isRecommended) {
            if (this.inRecommendedSection ^ isRecommended)
            {
                this.inRecommendedSection = !this.inRecommendedSection;
                return true;
            }
        },

        getRowClass: function(record) {
            if (this.rowIsSectionHeader(record.get("isRecommendedVariable"))){
                return 'variable-list-row-header';
            }
            else {
                return 'variable-list-row-normal';
            }
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
                '{[this.getSectionHeader(values.isRecommendedVariable)]}',
                '<div class="variable-list-title">',
                    '<h2>{label:htmlEncode}</h2>',
                '</div>',
                '<div class="variable-list-description">',
                    '{description:htmlEncode}',
                '</div>',{
                    getSectionHeader : function(isRecommended) {
                        var pre = "<div class=\"variable-list-category-text\">";
                        var post = "</div>";
                        if (this.inRecommendedSection === undefined && isRecommended)
                        {
                            this.inRecommendedSection = true;
                            return pre + "Recommended" + post;
                        }
                        else if (this.inRecommendedSection && !isRecommended) {
                            this.inRecommendedSection = undefined;
                            return pre + "Additional" + post;
                        }
                    }
                })
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