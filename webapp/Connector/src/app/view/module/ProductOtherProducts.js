/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.ProductOtherProducts', {

    xtype : 'app.module.productotherproducts',

    extend : 'Connector.view.module.BaseModule',

    initComponent : function() {
        if (!Ext.isObject(this.data)) {
            this.data = {};
        }

        Ext.apply(this.data, {
            otherproducts: this.data.model ? this.data.model.get('other_products'): []
        });

        this.tpl = new Ext.XTemplate(
                '<tpl><p>',
                Connector.constant.Templates.module.title,
                '<tpl if="otherproducts.length &gt; 0">',
                '<tpl for="otherproducts">',
                '<div class="item-row">',
                '<p><a href="#learn/learn/Study%20Product/{product_id}">{product_name:htmlEncode}</a></p>',
                '</div>',
                '</tpl>',
                '<tpl else>',
                '<div class="item-row">',
                '<p>Not used with other products</p>',
                '</div>',
                '</tpl>',
                '</p></tpl>'
        );

        this.callParent();

        var data = this.data;
        this.on('afterrender', function(ps) {
            ps.update(data);
            ps.fireEvent('hideLoad', ps);
        });
    }
});
