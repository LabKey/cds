/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.ProductProvidedBy', {

    xtype : 'app.module.productprovidedby',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl>',
            Connector.constant.Templates.module.title,
            '<tpl if="model.get(\'Developer\')"><p class="item-row">Developer: {[values.model.get("Manufacturer")]}</p></tpl>',
            '<tpl if="model.get(\'DeveloperContact\')"><p class="item-row">Contact: {[values.model.get("DeveloperContact")]}</p></tpl>',
        '</tpl>'),

    hasContent : function() {
        var data = this.data || this.initalConfig.data || {};
        return data.model.get('Developer') || data.model.get('DeveloperContact');
    }
});
