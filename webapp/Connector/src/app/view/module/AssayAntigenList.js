/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AssayAntigenList', {

    xtype : 'app.module.assayantigenlist',

    extend : 'Connector.view.module.BaseModule',

    cls : 'module assaylist',

    tpl : new Ext.XTemplate(
        '<tpl>',
            Connector.constant.Templates.module.title,
            '<p class="item-row"><i><h1>Antigens Coming Soon</h1></i></p>',
        '</tpl>'),

    initComponent : function() {

    }
});
