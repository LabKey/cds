/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.window.Facet', {

    extend: 'Ext.window.Window',

    requires: ['Connector.model.ColumnInfo', 'Ext.form.field.ComboBox'],

    alias: 'widget.columnfacetwin',

    ui: 'custom',
    cls: 'filterwindow',
    modal: true,
//    width: 360,
    autoShow: true,
    draggable: false,
    closable: false,
    bodyStyle: 'margin: 8px;',

    constructor : function(config) {

        this.callParent([config]);

        this.addEvents('clearall', 'filter');
    },

    initComponent : function() {

        if (!this.col) {
            console.error("'col' value must be provided to instantiate a", this.$className);
            return;
        }

        var column = this.dataView.getColumnMetadata(this.col.dataIndex);
        var model = this.dataView.getModel();

        var faceted = Ext.create('LABKEY.dataregion.filter.Faceted', {
            itemId: 'faceted',
            model: {
                column: this.dataView.getColumnMetadata(this.col.dataIndex),
                schemaName: model.get('metadata').schemaName,
                queryName: model.get('metadata').queryName
            }
        });

        this.items = [faceted];

        this.buttons =  [{
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
        }];

        this.callParent(arguments);

        this.addListener('afterrender', this.onAfterRender, this, {single: true});
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

    applyFiltersAndColumns : function() {
        var view = this.getComponent('faceted');
        if (view.checkValid()) {
            FF = view.getFilters();
        }
    },

    onClear : function() {}
});
