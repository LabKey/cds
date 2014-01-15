Ext.define('Connector.button.DropDownButton', {

    extend: 'Ext.button.Button',

    alias: 'widget.dropdownbutton',

    ui: 'dropdown',

    cls: 'dropdown',

    isButton: true,

    text: '&#9660;',

    renderTpl :
//        '<em id="{id}-btnWrap" class="{splitCls}">' +
//            '<tpl>' +
//                '<button id="{id}-btnEl" type="{type}" hidefocus="true" role="button" autocomplete="off">' +
//                    '<span id="{id}-btnInnerEl" class="{baseCls}-inner" style="{innerSpanStyle}">' +
//                        '{text}' +
//                    '</span>' +
//                    '<span id="{id}-btnIconEl">&#160;</span>' +
//                '</button>' +
//            '</tpl>' +
//        '</em>',
            '<span id="{id}-btnWrap" class="{baseCls}-wrap' +
                '<tpl if="splitCls"> {splitCls}</tpl>' +
                '{childElCls}" unselectable="on">' +
                '<span id="{id}-btnEl" class="{baseCls}-button">' +
                    '<span id="{id}-btnInnerEl" class="{baseCls}-inner {innerCls}' +
                        '{childElCls}" unselectable="on">' +
                        '{text}' +
                    '</span>' +
//                    '<span role="img" id="{id}-btnIconEl" class="{baseCls}-icon-el {iconCls}' +
//                        '{childElCls} {glyphCls}" unselectable="on" style="' +
//                        '<tpl if="iconUrl">background-image:url({iconUrl});</tpl>' +
//                        '<tpl if="glyph && glyphFontFamily">font-family:{glyphFontFamily};</tpl>">' +
//                        '<tpl if="glyph">&#{glyph};</tpl><tpl if="iconCls || iconUrl">&#160;</tpl>' +
//                    '</span>' +
                '</span>' +
            '</span>',

    initComponent : function() {
        this.callParent();

        this.on('menushow', function() { this.getEl().addCls('x-btn-' + this.ui + '-hld') }, this);
        this.on('menuhide', function() { this.getEl().removeCls('x-btn-' + this.ui + '-hld') }, this);
    }
});
