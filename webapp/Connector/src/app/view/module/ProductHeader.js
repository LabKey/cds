/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.ProductHeader', {

    xtype : 'app.module.productheader',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl>',
            Connector.constant.Templates.module.title,
            '<tpl if="product_type"><p class="item-row">Product Type: {product_type:htmlEncode}</p></tpl>',
            '<tpl if="product_class_label"><p class="item-row">Class: {product_class_label:htmlEncode}</p></tpl>',
            '<tpl if="product_subclass"><p class="item-row">Subclass: {product_subclass:htmlEncode}</p></tpl>',
        '</tpl>'
    ),

    initComponent : function() {
        var data = this.initialConfig.data.model.data;
        data['title'] = this.initialConfig.data.title;
        this.update(data);
    }
});
