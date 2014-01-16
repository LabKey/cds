Ext.define('Connector.view.FilterSave', {

    extend : 'Ext.panel.Panel',

    alias  : 'widget.filtersave',

    initComponent : function() {

        this.items = [{
            xtype : 'box',
            autoEl: {
                tag : 'div',
                cls : 'savetitle',
                html: 'Save filters'
            }
        },this.getForm()];

        this.callParent();

        this.on('show', function() { if (this.form) { this.form.setDefaultFocus(); } }, this);
    },

    getForm : function() {
        if (this.form)
            return this.form;

        this.form = Ext.create('Ext.form.Panel', {

            ui : 'custom',

            style : 'padding: 8px 0 0 27px',

            layout: {
                align : 'stretch'
            },
            defaults : {
                labelAlign : 'top',
                validateOnBlur   : false,
                validateOnChange : false,
                width : 225
            },

            // fields
            defaultType : 'textfield',
            items : [{
                fieldLabel : 'View name',
                name       : 'viewname',
                componentCls: 'xyz',
                cls        : 'abc',
                baseCls    : 'cbs',
                plain      : true,
                allowBlank : false,
                cls        : 'grouptop',
                flex : 1
            },{
//                xtype      : 'textareafield',
//                name       : 'groupdescription',
//                hideLabel  : true,
//                emptyText  : 'Group description',
//                flex : 1
//            },{
//                xtype      : 'radiogroup',
//                fieldLabel : 'Sync',
//                columns    : 1,
//                vertical   : true,
//                cls        : 'grouptop',
//                items      : [
//                    { boxLabel: 'Update my group with new data', name: 'sync', inputValue: 'dynamic', checked : true },
//                    { boxLabel: 'Keep this group static', name: 'sync', inputValue: 'static' }
//                ]
//            },{
//                fieldLabel : 'View',
                xtype      : 'textareafield',
                name       : 'viewdescription',
                emptyText  : 'View description',
//                cls        : 'grouptop',
                allowBlank : false,
                flex : 1
            }],

            // Save and Cancel Buttons
            buttons : [{
                itemId: 'dosave',
                xtype : 'roundedbutton',
                cls   : 'dark',
                text  : 'Save'
            },{
                itemId: 'cancelsave',
                xtype : 'roundedbutton',
                cls   : 'dark',
                text  : 'Cancel'
            }],
            buttonAlign : 'left',

            setDefaultFocus : function() {
                this.getComponent(0).focus();
            }
        });

        return this.form
    }
});