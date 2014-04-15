/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.Person', {

    xtype : 'module.person',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl>',
            Connector.constant.Templates.module.title,
            '<tpl if="picture"><img style="float: left; width: 80px;" src="{picture}"></img></tpl>',
            '<tpl if="name"><h4>{name}</h4></tpl>',
            '<tpl if="line1"><p>{line1}</p></tpl>',
            '<tpl if="line2"><p>{line2}</p></tpl>',
            '<tpl if="line3"><p>{line3}</p></tpl>',
            '<tpl if="line4"><p>{line4}</p></tpl>',
        '</tpl>')
});
