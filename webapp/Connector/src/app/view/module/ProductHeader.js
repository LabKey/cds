/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.ProductHeader', {

    xtype : 'module.productheader',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl>',
            '<tpl if="model.get(\'Type\')"><p class="item-row">Product Type: {[values.model.get("Type")]}</p></tpl>',
            '<tpl if="model.get(\'Class\')"><p class="item-row">Class: {[values.model.get("Class")]}</p></tpl>',
            '<tpl if="model.get(\'Subclass\')"><p class="item-row">Subclass: {[values.model.get("Subclass")]}</p></tpl>',
            '<tpl if="model.get(\'Inserts\')"><p class="item-row">Insert: {[values.model.get("Inserts")]}</p></tpl>',
        '</tpl>',
    {
        typeString : function(model) {
            var phase = model.get('Phase');
            var type = model.get('Type');
//            var start = model.get('StartDate');
//            var end = model.get('EndDate');
            var s = '';
            if (phase) {
                s = "Phase " + phase + " ";
            }
            if (type) {
                s += type;
            }
            return s;
        },
    })
});
