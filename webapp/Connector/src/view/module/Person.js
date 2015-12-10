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
            '<div class="module-person" style="min-height: 80px;">',
                Connector.constant.Templates.module.title,
                '<img style="float: left; height: 80px;" src="{[values.picture || (LABKEY.contextPath + \'/Connector/images/pictures/default.png\')]}"></img>',
                '<tpl if="name"><h4>{name}</h4></tpl>',
                '<tpl if="line1"><p>{line1}</p></tpl>',
                '<tpl if="line2"><p>{line2}</p></tpl>',
                '<tpl if="line3"><p>{line3}</p></tpl>',
                '<tpl if="line4"><p>{line4}</p></tpl>',
            '</div>',
        '</tpl>'),

    hasContent : function() {
        var data = this.data || this.initalConfig.data || {};
        return !!data.name;
    }
});
