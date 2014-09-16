Ext.define('Connector.window.AbstractFilter', {

    extend: 'Ext.window.Window',

    autoShow: true,

    draggable: false,

    closable: false,

    modal: true,

    resizable: false,

    shadowOffset: 18,

    ui: 'filterwindow',

    constructor : function(config) {

        this.callParent([config]);

        this.addEvents('clearfilter', 'filter');
    },

    initComponent : function() {

        if (!this.col) {
            console.error("'col' value must be provided to instantiate a", this.$className);
            return;
        }

        this.setDisplayPosition(this.col);

        this.items = this.getItems();

        this.dockedItems = [this.getTopConfig(), this.getBottomConfig()];

        this.callParent(arguments);

        this.on('afterrender', this.onAfterRender, this, {single: true});
    },

    setDisplayPosition : function(column) {
        var trigger = Ext.get(column.triggerEl);
        if (trigger) {
            trigger.show();
            var box = trigger.getBox();

            Ext.apply(this, {
                x: box.x - 52,
                y: box.y + 45
            });
        }
    },

    onAfterRender : function() {
        var keymap = new Ext.util.KeyMap(this.el, [
            {
                key  : Ext.EventObject.ENTER,
                fn   : this.applyFiltersAndColumns,
                scope: this
            },{
                key  : Ext.EventObject.ESC,
                fn   : this.close,
                scope: this
            }
        ]);
    },

    getItems : function() {
        return [];
    },

    getTopConfig : function() {
        return {
            xtype: 'toolbar',
            dock: 'top',
            ui: 'footer',
            items: [
                {
                    xtype: 'tbtext',
                    style: 'font-size: 13.5pt; font-weight: bold; text-transform: uppercase; font-family: Arial;',
                    text: Ext.htmlEncode(this.columnMetadata.caption)
                },
                '->',
                {
                    text: '&#215;',
                    ui: 'custom',
                    style: 'font-size: 16pt; color: black; font-weight: bold;',
                    handler: this.close,
                    scope: this
                }
            ]
        };
    },

    getBottomConfig : function() {
        return {
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            cls: 'dark-toolbar',
            height: 30,
            items: ['->',{
                text  : 'Filter',
                handler: this.applyFiltersAndColumns,
                scope: this
            },{
                text : 'Cancel',
                handler : this.close,
                scope : this
            },{
                text : 'Clear',
                handler : this.onClear,
                scope: this
            }]
        };
    },

    applyFiltersAndColumns : function() {},

    onClear : function() {}
});
