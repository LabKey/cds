/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AssayAnalyteList', {

    xtype : 'app.module.assayanalytelist',

    extend : 'Connector.view.module.BaseModule',

    cls : 'module assaylist',

    tpl : new Ext.XTemplate(
        '<tpl>',
            '<h3>Assay Analytes</h3>',
            '<tpl if="values.length &gt; 0">',
                '<table class="learn-study-info">',
                    '<tpl for=".">',
                        '<tr>',
                            '<td class="item-label">{col:htmlEncode}:</td>',
                            '<td class="item-value">{value:htmlEncode}</td>',
                        '</tr>',
                    '</tpl>',
                '</table>',
            '<tpl else>',
                '<p>There are no Analytes to Display</p>',
            '</tpl>',
        '</tpl>'
    ),

    initComponent : function() {
        var store = StoreCache.getStore('Connector.app.store.Assay'),
            assay_type = this.data.model.get('assay_type');

        store.loadAnalytes(assay_type, function(results) {
            this.update(results);
        }, this);
    }
});
