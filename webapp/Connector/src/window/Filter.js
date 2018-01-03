/*
 * Copyright (c) 2014-2015 LabKey Corporation
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

        var filters = [];

        Ext.each(model.getFilterArray(true), function(filter)
        {
            if (filter.getColumnName().toLowerCase() === this.columnMetadata.filterField.toLowerCase())
            {
                filters.push(filter);
            }
        }, this);

        var metadata = model.getActiveSheetMetadata();
        return [{
            xtype: 'labkey-default-filterpanel',
            itemId: 'filtered',
            cls: 'filterpanel',
            boundColumn: this.columnMetadata,
            filterArray: filters,
            schemaName: metadata.schemaName,
            queryName: metadata.queryName
        }];
    },

    applyFiltersAndColumns : function() {

        var view = this.getComponent('filtered');

        if (view.isValid()) {
            this.fireEvent('filter', this, this.columnMetadata, view.getOriginalFilters(), view.getFilters());
            this.close();
        }
    }
});

Ext.define('Connector.field.BooleanCombo', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.labkey-booleantextfield',

    initComponent : function()
    {
        this.callParent();

        this.validator = function(val){
            if(!val)
                return true;

            return LABKEY.Utils.isBoolean(val) ? true : val + " is not a valid boolean. Try true/false; yes/no; on/off; or 1/0.";
        }
    }
});