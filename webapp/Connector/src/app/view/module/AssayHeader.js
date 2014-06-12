/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AssayHeader', {

    xtype : 'app.module.assayheader',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl>',
            '<tpl if="model.get(\'FullName\')"><p class="item-row">Full Name: {[values.model.get("FullName")]}</p></tpl>',
            '<tpl if="model.get(\'Lab\')"><p class="item-row">Lab: {[values.model.get("Lab")]}</p></tpl>',
            '<tpl if="model.get(\'Type\')"><p class="item-row">Type: {[values.model.get("Target")]}</p></tpl>',
            '<tpl if="model.get(\'Category\')"><p class="item-row">Category: {[values.model.get("Category")]}</p></tpl>',
            '<tpl if="model.get(\'Target\')"><p class="item-row">Target Type: {[values.model.get("TargetType")]}</p></tpl>',
            '<tpl if="model.get(\'TargetSubType\')"><p class="item-row">Target Type: {[values.model.get("TargetSubType")]}</p></tpl>',
            '<tpl if="model.get(\'TargetFunction\')"><p class="item-row">Function: {[values.model.get("TargetFunction")]}</p></tpl>',
            '<tpl if="model.get(\'Platform\')"><p class="item-row">Platform: {[values.model.get("Platform")]}</p></tpl>',
        '</tpl>')
});
