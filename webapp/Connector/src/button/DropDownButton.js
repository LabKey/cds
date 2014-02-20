/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.button.DropDownButton', {

    extend: 'Ext.button.Button',

    alias: 'widget.dropdownbutton',

    ui: 'dropdown',

    cls: 'dropdown',

    text: '&#9660;',

    initComponent : function() {
        this.callParent();

        this.on('menushow', function() { this.getEl().addCls('x-btn-' + this.ui + '-hld') }, this);
        this.on('menuhide', function() { this.getEl().removeCls('x-btn-' + this.ui + '-hld') }, this);
    }
});
