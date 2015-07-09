/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.component.ActionTitle', {
    extend: 'Ext.Component',

    alias: 'widget.actiontitle',

    text: 'Action Title!',

    cls: 'titlepanel',

    colorCls: 'secondary',

    back: false,

    initComponent : function() {

        var template = '{text:htmlEncode}';

        if (this.back) {
            template = '<span class="iarrow">&nbsp;</span>' + template;
            this.colorCls = 'interactive';
        }

        this.tpl = new Ext.XTemplate(template);
        this.data = {
            text: this.text
        };

        this.addCls(this.colorCls);

        this.callParent();
    }
});
