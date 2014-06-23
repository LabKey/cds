/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AssayAnalyteList', {

    xtype : 'app.module.assayanalytelist',

    extend : 'Connector.view.module.BaseModule',

    cls : 'module assaylist',

    // TODO:
    tpl : new Ext.XTemplate(
        '<tpl>',
            Connector.constant.Templates.module.title,
            '',
        '</tpl>')
});
