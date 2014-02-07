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
