/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.component.ActionTitle', {
    extend: 'Ext.Component',

    alias: 'widget.actiontitle',

    text: 'Action Title!',

    initComponent : function() {
        this.autoEl = {
            tag: 'div',
            cls: 'titlepanel',
            children: [{
                tag: 'span',
                html: this.text
            }]
        };
        this.callParent();
    }
});
