/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.window.Filter', {

    extend: 'Ext.window.Window',

    requires: ['Connector.model.ColumnInfo', 'Ext.form.field.ComboBox'],

    alias: 'widget.columnfilterwin',

    ui: 'custom',
    cls: 'filterwindow',
    modal: true,
    width: 360,
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
            console.error('\'col\' value must be provided to instantiate a', this.$className);
            return;
        }

        var trigger = Ext.get(this.col.triggerEl);
        if (trigger) {
            trigger.show();
            var box = trigger.getBox();

            Ext.apply(this, {
                x: box.x - 52,
                y: box.y + 45
            });
        }

        var columnName = this.col.dataIndex;

        Ext.apply(this, {
            store: this.dataView.getStore(),
            boundColumn: this.dataView.getColumnMetadata(columnName)
        });

        this.items = this.getItems();

        this.buttons =  [{
            text  : 'OK',
            handler: this.applyFiltersAndColumns,
            scope: this
        },{
            text : 'Cancel',
            handler : this.close,
            scope : this
        },{
            text : 'Clear Filters',
            handler : this.onClearFilters,
            scope: this
        },{
            text : 'Clear All',
            handler : function() {
                this.clearAll();
                this.close();
            },
            scope : this
        }];

        this.callParent(arguments);

        this.addListener('afterrender', this.onAfterRender, this);
    },

    onAfterRender : function () {
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

    onClearFilters : function() {
        var fieldKeyPath = this.boundColumn.displayField ? this.boundColumn.displayField : this.boundColumn.fieldKeyPath;

        this.fireEvent('clearfilter', this, fieldKeyPath);
        this.close();
    },

    clearAll : function() {
        this.fireEvent('clearall', this);
    },

    getItems : function () {

        var items = [{
            xtype : 'box',
            autoEl : {
                tag  : 'div',
                html : this.col.text,
                cls  : 'filterheader'
            }
        }];

        if (this.boundColumn.description) {
            items.push({xtype:'box', autoEl : {tag: 'div', cls:'x-body', html:Ext.htmlEncode(this.boundColumn.description)}});
        }

        var schema, query;

        if (Ext.isFunction(this.dataView.getModel)) {
            schema = this.dataView.getModel().get('metadata').schemaName;
            query = this.dataView.getModel().get('metadata').queryName;
        }
        else {
            schema = this.dataView.queryMetadata.schemaName;
            query = this.dataView.queryMetadata.queryName;
        }

        items.push({
            xtype: 'labkey-default-filterpanel',
            boundColumn: this.boundColumn,
            filterArray: this.store.filterArray,
            schemaName: schema,
            queryName: query
        });

        return items;
    },

    applyFilters : function () {
        var filterPanel = this.down('labkey-default-filterpanel');
        var filterArray = [];
        if (filterPanel.isValid()) {
            var colFilters = filterPanel.getFilters();
            var fa = Ext.clone(this.dataView.getStore().filterArray);
            fa = fa.slice(1);
            filterArray = LABKEY.Filter.merge(fa, this.boundColumn.displayField ? this.boundColumn.displayField : this.boundColumn.fieldKey, colFilters);
        }
        else {
            Ext.window.Msg.alert("Please fix errors in filter.");
        }

        return filterArray;
    },

    applyFiltersAndColumns : function () {

        var filterArray = this.applyFilters();

        if (filterArray.length > 0) {
            this.fireEvent('filter', this, this.boundColumn, filterArray);
            this.ppx = this.getPosition();
            this.close();
        }
    },

    equalColumnLists : function(oldCols, newCols) {
        oldCols = oldCols || [];
        newCols = newCols || [];

        if (oldCols.length != newCols.length) {
            return false;
        }

        for (var i = 0; i < newCols.length; i++) {
            if (newCols[i].get("fieldKeyPath") != oldCols[i].get("fieldKeyPath")) {
                return false;
            }
        }

        return true;
    }
});