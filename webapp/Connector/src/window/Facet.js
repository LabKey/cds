/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.window.Facet', {

    extend: 'Connector.window.AbstractFilter',

    alias: 'widget.columnfacetwin',

    bodyStyle: 'margin: 8px; overflow-y: auto; padding: 10px 2px;',

    width: 290,

    height: 375,

    getItems : function() {
        var model = this.dataView.getModel();

        // the set of filters that match this column
        var matchingFilters = [];
        Ext.each(this.dataView.getModel().getFilterArray(), function(filter) {
            if (filter.getColumnName().toLowerCase() === this.columnMetadata.filterField.toLowerCase())
                matchingFilters.push(filter);
        }, this);
        this.hasFilters = matchingFilters.length > 0;

        var faceted = Ext.create('LABKEY.dataregion.filter.Faceted', {
            itemId: 'faceted',
            border: false,
            useGrouping: true,
            useStoreCache: false,
            filters: matchingFilters,
            groupFilters: model.getFilterArray(true),
            model: {
                column: this.columnMetadata,
                schemaName: model.get('metadata').schemaName,
                queryName: model.get('metadata').queryName
            }
        });

        return [faceted];
    },

    onAfterRender : function() {
        this.callParent(arguments);
        if (this.hasFilters) {
            this.getButton('dofilter').setText('Update');
        }
    },

    applyFiltersAndColumns : function() {
        var view = this.getComponent('faceted');
        if (view.checkValid()) {
            this.fireEvent('filter', this, view.getModel().get('column'), view.getFilters());
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
