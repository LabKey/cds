/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.button.RoundedButton', {

    extend : 'Ext.button.Button',

    alias  : 'widget.roundedbutton',

    ui : 'rounded'
});

Ext4.define('Connector.button.InfoButton', {

    extend : 'Ext.button.Button',

    alias  : 'widget.infobutton',

    ui : 'rounded-inverted-accent-icon',

    cls : 'x4-box-item',

    iconCls : 'info',

    constructor : function(config) {

        if (!config.dimension)
            console.error('A dimension must be provided for InfoButton construction.');
        if (!config.record)
            console.error('A data record must be provided for InfoButton construction.');

        this.callParent([config]);
    }
});