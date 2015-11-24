/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.button.InfoButton', {

    extend: 'Ext.button.Button',

    alias: 'widget.infobutton',

    ui: 'rounded-inverted-accent-icon',

    cls: 'x-box-item',

    iconCls: 'info',

    constructor : function(config) {
        this.callParent([config]);
    },

    setModel : function(model) {
        this.model = model;
    },

    clear : function() {
        this.model = undefined;
    }
});