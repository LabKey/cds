/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.window.Filter', {

    extend: 'Connector.window.AbstractFilter',

    requires: ['Ext.form.field.ComboBox'],

    alias: 'widget.columnfilterwin',

    width: 360,

    bodyStyle: 'margin: 8px; overflow-y: auto; padding: 10px;',

    getBottomConfig : function() {
        return {
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            cls: 'dark-toolbar',
            height: 30,
            items: ['->',{
                text: 'Filter',
                handler: this.applyFiltersAndColumns,
                scope: this
            },{
                text: 'Cancel',
                handler: this.close,
                scope: this
            },{
                text: 'Clear',
                handler: this.onClear,
                scope: this
            }]
        };
    },

    onClear : function() {
        var fieldKeyPath = this.columnMetadata.displayField ? this.columnMetadata.displayField : this.columnMetadata.fieldKeyPath;

        this.fireEvent('clearfilter', this, fieldKeyPath);
        this.close();
    },

    getItems : function () {
        var model = this.dataView.getModel();

        return [{
            xtype: 'labkey-default-filterpanel',
            cls: 'filterpanel',
            boundColumn: this.columnMetadata,
            filterArray: model.getFilterArray(),
            schemaName: model.get('metadata').schemaName,
            queryName: model.get('metadata').queryName
        }];
    },

    applyFilters : function () {
        var filterPanel = this.down('labkey-default-filterpanel');
        var filterArray = [];
        if (filterPanel.isValid()) {
            var colFilters = filterPanel.getFilters();
            var fa = Ext.clone(this.dataView.getModel().getFilterArray());
            fa = fa.slice(1);
            filterArray = LABKEY.Filter.merge(fa, this.columnMetadata.displayField ? this.columnMetadata.displayField : this.columnMetadata.fieldKey, colFilters);
        }
        else {
            Ext.window.Msg.alert("Please fix errors in filter.");
        }

        return filterArray;
    },

    applyFiltersAndColumns : function () {

        var filterArray = this.applyFilters();

        if (filterArray.length > 0) {
            this.fireEvent('filter', this, this.columnMetadata, filterArray);
            this.ppx = this.getPosition();
            this.close();
        }
    }
});