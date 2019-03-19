/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.ProductHeader', {

    xtype : 'app.module.productheader',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl>',
            Connector.constant.Templates.module.title,
            '<table class="learn-study-info">',
                '<tpl if="product_type">',
                    '<tr>',
                        '<td class="item-label">Product Type:</td>',
                        '<td class="item-value">{product_type:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="product_class_label">',
                    '<tr>',
                        '<td class="item-label">Class:</td>',
                        '<td class="item-value">{product_class:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="product_subclass">',
                    '<tr>',
                        '<td class="item-label">Subclass:</td>',
                        '<td class="item-value">{product_subclass:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="mab_mix_name_std">',
                    '<tr>',
                        '<td class="item-label">MAb standard name:</td>',
                        '<td class="item-value"><a class="learn-product-mab-link" href="#learn/learn/MAb/{mab_mix_name_std}">{mab_mix_name_std:htmlEncode}</a></td>',
                    '</tr>',
                '</tpl>',
            '</table>',
        '</tpl>'
    ),

    initComponent : function() {
        var data = this.initialConfig.data.model.data;
        data['title'] = this.initialConfig.data.title;
        this.update(data);
    }
});
