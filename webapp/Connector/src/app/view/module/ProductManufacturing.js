/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.ProductManufacturing', {

    xtype : 'app.module.productmanufacturing',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl>',
            Connector.constant.Templates.module.title,
            '<tpl if="model.get(\'Manufacturer\')"><p class="item-row">Manufacturer: {[values.model.get("Manufacturer")]}</p></tpl>',
            '<tpl if="model.get(\'Production\')"><p class="item-row">Production: {[values.model.get("Production")]}</p></tpl>',
        '</tpl>')
});
