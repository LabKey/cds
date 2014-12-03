/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.StudyProducts', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.StudyProducts',

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadSlice : function(slice) {

        var cells = slice.cells, row;
        var productSet = [], products;
        for (var c=0; c < cells.length; c++) {
            row = cells[c][0];
            products = row.positions[row.positions.length-1][0];
            if (row.value > 0) {
                productSet.push(products.name);
            }
        }
        products = productSet.join(';');

        if (productSet.length > 0) {
            var queryConfig = {
                schemaName: Connector.studyContext.schemaName,
                queryName: 'Product',
                columns: Ext.Array.pluck(Connector.app.model.StudyProducts.getFields(), "name"),
                success: this.onLoadQuery,
                scope: this
            };

            if (products.length > 0) {
                queryConfig.filterArray = [ LABKEY.Filter.create('Label', products, LABKEY.Filter.Types.IN) ]
            }

            LABKEY.Query.selectRows(queryConfig);
        }
        else {
            this.onLoadQuery({rows: []});
        }
    },

    onLoadQuery : function(queryResult) {
        var rows = queryResult.rows;
        for (var r=0; r < rows.length; r++) {
            rows[r].internalId = r;
        }
        this.loadRawData(rows);
    }
});
