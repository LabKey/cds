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
            '<tpl if="model.get(\'Type\')"><p class="item-row">Product Type: {[values.model.get("Type")]}</p></tpl>',
            '<tpl if="model.get(\'Immunogen\')"><p class="item-row">Immunogen: {[values.model.get("Immunogen")]}</p></tpl>',
            '<tpl if="model.get(\'Class\')"><p class="item-row">Class: {[values.model.get("Class")]}</p></tpl>',
            '<tpl if="model.get(\'VectorClass\')"><p class="item-row">Vector Class: {[values.model.get("Class")]}</p></tpl>',
            '<tpl if="model.get(\'Subclass\')"><p class="item-row">Subclass: {[values.model.get("ProductSubclass")]}</p></tpl>',
            '<tpl if="model.get(\'Clades\')"><p class="item-row">Clades: {[values.model.get("Clades")]}</p></tpl>',
            '<tpl if="model.get(\'Inserts\')"><p class="item-row">Inserts: {[values.model.get("Inserts")]}</p></tpl>',
        '</tpl>')
});
