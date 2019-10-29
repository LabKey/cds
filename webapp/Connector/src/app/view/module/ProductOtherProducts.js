/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.ProductOtherProducts', {

    xtype : 'app.module.productotherproducts',

    extend : 'Connector.view.module.ShowList',

    showAll : false,

    initComponent : function() {

        var data = this.getListData();
        data['other_products_title_related'] = this.initialConfig.data.title;
        data['showAll'] = this.showAll;
        this.update(data);

        this.tpl = new Ext.XTemplate(
                '<tpl><p>',
                    '<tpl if="other_products.length &gt; 0">',
                        '<h3 id="other_products_listing_title" class="listing_title">{other_products_title_related}</h3>',
                        '<tpl for="other_products">',
                            '<tpl if="xindex &lt; 11">',
                                '<div class="item-row">',
                                    '<p><a href="#learn/learn/Study%20Product/{product_id}">{product_name:htmlEncode}</a></p>',
                                '</div>',
                            '</tpl>',
                        '</tpl>',

                        '<tpl if="other_products.length &gt; 10">',
                            '<div class="item-row">',
                                'and {other_products.length - 10} more ',
                                '<tpl if="showAll">',
                                    '<span class="show-hide-toggle-other-products">(show less)</span>',
                                '<tpl else>',
                                    '<span class="show-hide-toggle-other-products">(show all)</span>',
                                '</tpl>',
                            '</div>',
                        '</tpl>',

                        '<tpl for="other_products">',
                            '<tpl if="parent.showAll && (xindex &gt; 10)">',
                                '<div class="item-row">',
                                    '<p><a href="#learn/learn/Study%20Product/{product_id}">{product_name:htmlEncode}</a></p>',
                                '</div>',
                            '</tpl>',
                        '</tpl>',

                    '<tpl else if="!other_products || other_products.length === 0">',
                        Connector.constant.Templates.module.title,
                        '<div class="item-row">',
                            '<p>Not used with other products</p>',
                        '</div>',
                    '</tpl>',
                '</p></tpl>'
        );

        this.callParent();

        this.on('afterrender', function(ps) {
            ps.update(data);
            ps.fireEvent('hideLoad', ps);
        });
    },

    hasContent : function() {
        var products = this.initialConfig.data.model.get('other_products');
        if (products) {
            return products.length > 0;
        }
        return false;
    },

    getListData : function () {
        return this.initialConfig.data.model.data;
    },

    scrollListIntoView: function() {
        Ext.get('other-products_listing_title').el.dom.scrollIntoView();
    },

    getToggleId : function () {
        return Ext.query('.show-hide-toggle-other-products');
    }
});
