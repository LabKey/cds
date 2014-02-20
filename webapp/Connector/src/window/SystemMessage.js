/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.window.SystemMessage', {

    extend : 'Ext.window.Window',

    cls : 'sysmsg',

    minHeight: 0,

    minWidth: 0,

    constructor : function(config) {

        Ext.applyIf(config, {
            autoShow: true,
            ui: 'swmsg',
            closable: false,
            resizable: false,
            draggable: false
        });

        this.callParent([config]);
    },

    initComponent : function() {

        this.html = this.msg;

        this.callParent();
    }
});