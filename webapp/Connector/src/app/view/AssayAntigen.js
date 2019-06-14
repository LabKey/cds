/*
 * Copyright (c) 2016-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.AssayAntigen', {

    xtype : 'app.view.assayantigengrid',

    extend : 'Connector.app.view.LearnGrid',

    cls: 'learngrid antigengrid',

    isDetailLearnGrid: true,

    statics: {
        searchFields: Ext.pluck(Connector.app.model.AssayAntigen.getFields(), 'name')
    },

    viewConfig: {
        stripeRows: false,
        overflowY: 'scroll',
        trackOver: false,
        resizable: false,

        getRowClass: function() {
            return 'detail-row';
        }
    },

    initComponent: function ()
    {
        if (this.learnViewConfig)
        {
            this.learnView = this.learnViewConfig.learnView;
            this.tabId = this.learnViewConfig.tabId;
            this.tabDimension = this.learnViewConfig.tabDimension;
            this.tabParams = this.learnViewConfig.tabParams;
        }
        this.emptyText = new Ext.XTemplate(
                '<div class="detail-empty-text">No available antigens meet your selection criteria.</div>'
        ).apply({});

        this.model.data.antigen_store.loadAntigens();
        this.store = this.model.data.antigen_store;
        this.columns = this.getAntigenColumns(this.model.data.assay_type);

        this.callParent();
    },

    getAntigenColumns: function(assay_type)
    {
        assay_type = assay_type.toUpperCase();
        if (assay_type === 'NAB' || assay_type === 'NABMAB') {
            return this.getNABColumns();
        }
        else if (assay_type === 'ICS' || assay_type === 'ELISPOT') {
            return this.getICSorELISPOTColumns();
        }
        else if (assay_type === 'BAMA') {
            return this.getBAMAColumns();
        }
        else if (assay_type === 'PKMAB') {
            return [];
        }
    },

    getCommonColumns: function(antigenNameLabel, flex)
    {
        return [{
            text: antigenNameLabel,
            xtype: 'templatecolumn',
            minWidth: 300,
            flex: 2*flex, // increased label & description flex to better reflect spec images.
            dataIndex: 'antigen_name',
            filterConfigSet: [{
                filterField: 'antigen_name',
                valueType: 'string',
                title: antigenNameLabel
            }],
            tpl: new Ext.XTemplate(
                    '<div class="detail-description">',
                        '<h2>{antigen_name:htmlEncode}</h2>',
                        '<div class="antigen-description detail-description-text">',
                            '<tpl if="antigen_description.length &gt; 0">',
                                '<p class="block-with-text">',
                                    '<tpl for="antigen_description">',
                                        '{.:htmlEncode}',
                                    '</tpl>',
                                '</p>',
                            '</tpl>',
                        '</div>',
                    '</div>'
            )
        },this.getSimpleValueColumn('Control', 'antigen_control_value', 'antigen_control_value', 150, flex)];
    },

    getSimpleValueColumn: function(label, dataIndex, filterIndex, minWidth, flex)
    {
        return {
            text: label,
            xtype: 'templatecolumn',
            minWidth: minWidth,
            flex: flex,
            resizable: false,
            dataIndex: dataIndex,
            filterConfigSet: [{
                filterField: filterIndex,
                valueType: 'string',
                title: label
            }],
            tpl: new Ext.XTemplate(
                    '<div class="detail-text">',
                        '<div class="detail-gray-text">{',
                        dataIndex,
                        ':htmlEncode}</div>',
                    '</div>'
            )
        };
    },

    getNABColumns: function()
    {
        var commonColumns = this.getCommonColumns('Virus', 1/7);
        var columns = [
            this.getSimpleValueColumn('Clade', 'antigen_clade', 'antigen_clade', 100, 1/7),
            this.getSimpleValueColumn('Tier', 'antigen_neutralization_tier', 'antigen_neutralization_tier', 100, 1/7),
            this.getSimpleValueColumn('Virus Type', 'antigen_virus_type', 'antigen_virus_type', 100, 1/7),
            this.getSimpleValueColumn('Target Cell', 'antigen_target_cell', 'antigen_target_cell', 100, 1/7)
        ];
        return commonColumns.concat(columns);
    },

    getBAMAColumns: function()
    {
        var commonColumns = this.getCommonColumns('Antigen', 1/6);
        var columns = [
            this.getSimpleValueColumn('Clade', 'antigen_clade', 'antigen_clade', 100, 1/6),
            this.getSimpleValueColumn('Protein', 'antigen_protein', 'antigen_protein', 100, 1/6),
            this.getSimpleValueColumn('Antigen Type', 'antigen_type', 'antigen_type', 100, 1/6)
        ];
        return commonColumns.concat(columns);
    },

    getICSorELISPOTColumns: function()
    {
        var commonColumns = this.getCommonColumns('Protein Panel', 20/100);
        var columns = [
            {
                text: 'Clade(s)',
                xtype: 'templatecolumn',
                minWidth: 100,
                flex: 20/100,
                resizable: false,
                filterConfigSet: [{
                    filterField: 'antigen_clades',
                    valueType: 'string',
                    title: 'Products'
                }],
                dataIndex: 'antigen_clades',
                tpl: new Ext.XTemplate(
                        '<div class="detail-text detail-description">',
                            '<ul>',
                                '<tpl if="antigen_clades.length &gt; 0">',
                                    '<tpl for="antigen_clades">',
                                        '<li class="detail-gray-text">{.:htmlEncode}</li>',
                                    '</tpl>',
                                '</tpl>',
                            '</ul>',
                        '</div>'
                )
            }, {
                text: 'Protein:Pools',
                xtype: 'templatecolumn',
                minWidth: 120,
                flex: 20/100,
                resizable: false,
                filterConfigSet: [{
                    filterField: 'antigen_proteins',
                    valueType: 'string',
                    title: 'Proteins'
                },{
                    filterField: 'antigen_pools',
                    valueType: 'string',
                    title: 'Pools'
                }],
                dataIndex: 'antigen_proteinAndPools',
                tpl: new Ext.XTemplate(
                        '<div class="detail-text detail-description">',
                            '<ul>',
                                '<tpl if="antigen_proteinAndPools.length &gt; 0">',
                                    '<tpl for="antigen_proteinAndPools">',
                                        '<div class="detail-gray-text">{protein}: {pools}</div>'+
                                    '</tpl>',
                                '</tpl>',
                            '</ul>',
                        '</div>'
                )
            }
        ];
        return commonColumns.concat(columns);
    }
});
