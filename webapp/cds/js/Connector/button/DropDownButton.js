/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.button.DropDownButton', {

    extend : 'Ext.button.Button',

    alias  : 'widget.dropdownbutton',

    ui : 'dropdown',

    cls : 'dropdown',

    isButton  : true,

    text : '&#9660;',

    renderTpl :
        '<em id="{id}-btnWrap" class="{splitCls}">' +
            '<tpl>' +
                '<button id="{id}-btnEl" type="{type}" hidefocus="true" role="button" autocomplete="off">' +
                    '<span id="{id}-btnInnerEl" class="{baseCls}-inner" style="{innerSpanStyle}">' +
                        '{text}' +
                    '</span>' +
                    '<span id="{id}-btnIconEl">&#160;</span>' +
                '</button>' +
            '</tpl>' +
        '</em>',

    initComponent : function() {
        this.callParent();

        this.on('menushow', function() { this.getEl().addCls('x4-btn-' + this.ui + '-hld') }, this);
        this.on('menuhide', function() { this.getEl().removeCls('x4-btn-' + this.ui + '-hld') }, this);
    }
});
