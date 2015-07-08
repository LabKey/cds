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
            '<tpl if="model.get(\'product_type\')"><p class="item-row">Product Type: {[values.model.get("product_type")]}</p></tpl>',
            //'<tpl if="model.get(\'Immunogen\')"><p class="item-row">Immunogen: {[values.model.get("Immunogen")]}</p></tpl>',
            '<tpl if="model.get(\'product_class_label\')"><p class="item-row">Class: {[values.model.get("product_class_label")]}</p></tpl>',
            //'<tpl if="model.get(\'VectorClass\')"><p class="item-row">Vector Class: {[values.model.get("Class")]}</p></tpl>',
            '<tpl if="model.get(\'product_subclass\')"><p class="item-row">Subclass: {[values.model.get("product_subclass")]}</p></tpl>',
            //'<tpl if="model.get(\'Clades\')"><p class="item-row">Clades: {[values.model.get("Clades")]}</p></tpl>',
            //'<tpl if="model.get(\'Inserts\')"><p class="item-row">Inserts: {[values.model.get("Inserts")]}</p></tpl>',
        '</tpl>'
    )
});
