/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.window.Facet', {

    extend: 'Ext.window.Window',

    requires: ['Connector.model.ColumnInfo', 'Ext.form.field.ComboBox'],

    alias: 'widget.columnfacetwin',

    ui: 'facetwindow',
//    cls: 'arrow-window',
    modal: true,
    autoShow: true,
    draggable: false,
    resizable: false,
    closable: false,
    bodyStyle: 'margin: 8px;',

    width: 250,
    height: 400,

    shadowOffset: 18,

    constructor : function(config) {

        this.callParent([config]);

        this.addEvents('clearfilter', 'filter');
    },

    initComponent : function() {

        if (!this.col) {
            console.error("'col' value must be provided to instantiate a", this.$className);
            return;
        }

        var model = this.dataView.getModel();

        this.setDisplayPosition(this.col);

        var faceted = Ext.create('LABKEY.dataregion.filter.Faceted', {
            itemId: 'faceted',
            border: false,
            model: {
                column: this.columnMetadata,
                schemaName: model.get('metadata').schemaName,
                queryName: model.get('metadata').queryName
            }
        });

        this.items = [faceted];

        this.dockedItems = [{
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
        },{
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
        }];

        this.callParent(arguments);

        this.addListener('afterrender', this.onAfterRender, this, {single: true});
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

        this.getComponent('faceted').setFilters(this.dataView.getModel().getFilterArray());
    },

    applyFiltersAndColumns : function() {
        var view = this.getComponent('faceted');
        if (view.checkValid()) {
            var filters = view.getFilters();
            this.fireEvent('filter', this, view.getModel().get('column'), filters);
            this.close();
        }
    },

    onClear : function() {
        var column = this.columnMetadata;
        var fieldKeyPath = column.displayField ? column.displayField : column.fieldKeyPath;

        this.fireEvent('clearfilter', this, fieldKeyPath);
        this.close();
    }
});
