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
    width: 340,
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

        Ext.apply(this, {
            store: this.dataView.getStore(),
            boundColumn: this.dataView.getColumnMetadata(this.col.dataIndex)
        });

        this.items = this.getItems();

        this.buttons =  [{
            xtype : 'roundedbutton',
            ui    : 'rounded-inverted-accent',
            text  : 'OK',
            width : 70,
            handler: this.applyFiltersAndColumns,
            scope: this
        },{
            xtype : 'roundedbutton',
            ui    : 'rounded-inverted-accent',
            text : 'Cancel',
            width : 70,
            handler : this.close,
            scope : this
        },{
            xtype : 'roundedbutton',
            ui    : 'rounded-inverted-accent',
            text : 'Clear Filters',
            width : 80,
            handler : this.onClearFilters,
            scope: this
        },{
            xtype : 'roundedbutton',
            ui    : 'rounded-inverted-accent',
            text : 'Clear All',
            width : 70,
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
//        this.store.filterArray = LABKEY.Filter.merge(this.store.filterArray, fieldKeyPath, null);
//        this.store.load();
//        this.dataView.removeGridFilter(fieldKeyPath);
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

    applyColumns : function () {

        var changed = false, newColumns = [], oldColumns = [];

        return {
            columnSetChange: changed,
            newColumns: newColumns,
            oldColumns: oldColumns
        };
    },

    applyFilters : function () {
        var filterPanel = this.down('labkey-default-filterpanel');
        var filterArray = [];
        if (filterPanel.isValid()) {
            var colFilters = filterPanel.getFilters();
            var fa = Ext.clone(this.store.filterArray);
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
            this.fireEvent('filter', this, this.boundColumn, filterArray, this.applyColumns());
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