/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.window.SystemMessage', {

    extend : 'Ext.window.Window',

    cls : 'sysmsg',

    constructor : function(config) {

        Ext4.applyIf(config, {
            autoShow : true,
            ui       : 'swmsg',
            closable : false,
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