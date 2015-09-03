/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AssayAntigenList', {

    xtype : 'app.module.assayantigenlist',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl>',
            '<tpl for=".">',
                '<div class="list-container">',
                    '<div class="list-entry-container">',
                        '<div class="list-entry-title">',
                            '<h2>{antigen_name:htmlEncode}</h2>',
                        '</div>',
                        '<div class="list-entry-description">',
                            '<div>{antigen_description:htmlEncode}</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</tpl>',
        '</tpl>'
    ),

    initComponent : function() {
        var assayName = this.data.model.data.assay_type,
            store = StoreCache.getStore('Connector.app.store.Assay');
        store.loadAntigens(assayName, function(results) {
            this.update(results);
        }, this);
    }
});
