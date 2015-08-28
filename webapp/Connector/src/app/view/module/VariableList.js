/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.VariableList', {

    xtype : 'app.module.variablelist',

    extend: 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
            '<tpl>',
                '<tpl for=".">',
                    '<div class="list-container">',
                        '<div class="list-entry-container">',
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
                '</tpl>',
            '</tpl>'
    ),

    initComponent : function() {
        var assayName = this.data.model.data.assay_type,
            store = StoreCache.getStore('Connector.app.store.VariableList');
        this.data = Ext.Array.pluck(store.getByAssayName(assayName), 'data');
    }
});