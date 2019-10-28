/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyProducts', {

    xtype : 'app.module.studyproducts',

    extend : 'Connector.view.module.ShowList',

    cls: 'module',

    tpl : new Ext.XTemplate(
            '<tpl>',
                '<tpl if="products.length &gt; 0">',
                    '<h3 id="products_listing_title" class="listing_title">{products_title_related}</h3>',
                    '<tpl for="products">',
                        '<tpl if="xindex &lt; 11">',
                            '<div class="item-row">',
                                '<p><a href="#learn/learn/Study%20Product/{product_id}">{product_name:htmlEncode}</a></p>',
                            '</div>',
                        '</tpl>',
                    '</tpl>',

                    '<tpl if="products.length &gt; 10">',
                        '<div class="item-row">',
                        'and {products.length - 10} more ',
                        '<tpl if="showAll">',
                            '<span class="show-hide-toggle-products">(show less)</span>',
                        '<tpl else>',
                            '<span class="show-hide-toggle-products">(show all)</span>',
                        '</tpl>',
                        '</div>',
                    '</tpl>',

                    '<tpl for="products">',
                        '<tpl if="parent.showAll && (xindex &gt; 10)">',
                            '<div class="item-row">',
                                '<p><a href="#learn/learn/Study%20Product/{product_id}">{product_name:htmlEncode}</a></p>',
                            '</div>',
                        '</tpl>',
                    '</tpl>',
                '</tpl>',
            '</tpl>'
    ),

    initComponent : function() {

        var data = this.getListData();
        data['products_title_related'] = this.initialConfig.data.title;
        data['showAll'] = false;
        this.update(data);

        this.callParent();
    },

    hasContent : function() {
        var products = this.initialConfig.data.model.get('products');
        if (products) {
            return products.length > 0;
        }
        return false;
    },

    getListData : function () {
        return this.initialConfig.data.model.data;
    },

    scrollListIntoView: function(renderTo) {
        Ext.get('products_listing_title').el.dom.scrollIntoView();
    },

    getToggleId : function () {
        return Ext.query('.show-hide-toggle-products');
    }
});
