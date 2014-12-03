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

    onClear : function() {
        var fieldKeyPath = this.columnMetadata.displayField ? this.columnMetadata.displayField : this.columnMetadata.fieldKeyPath;

        this.fireEvent('clearfilter', this, fieldKeyPath);
        this.close();
    },

    getItems : function() {
        var model = this.dataView.getModel();

        return [{
            xtype: 'labkey-default-filterpanel',
            itemId: 'filtered',
            cls: 'filterpanel',
            boundColumn: this.columnMetadata,
            filterArray: model.getFilterArray(),
            schemaName: model.get('metadata').schemaName,
            queryName: model.get('metadata').queryName
        }];
    },

    applyFiltersAndColumns : function() {

        var view = this.getComponent('filtered');

        if (view.isValid()) {
            this.fireEvent('filter', this, this.columnMetadata, view.getFilters());
            this.close();
        }
    }
});