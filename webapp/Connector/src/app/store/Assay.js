/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Assay', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.Assay',

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadSlice : function(slice) {

        var cells = slice.cells, row;
        var assaySet = [], assay;
        for (var c=0; c < cells.length; c++) {
            row = cells[c][0];
            assay = row.positions[row.positions.length-1][0];
            if (row.value > 0) {
                assaySet.push(assay.name);
            }
        }
        assay = assaySet.join(';');

        if (assaySet.length > 0) {
            var queryConfig = {
                schemaName: 'Study',
                queryName: 'StudyDesignAssays',
                success: this.onLoadQuery,
                scope: this
            };

            if (assay.length > 0) {
                queryConfig.filterArray = [ LABKEY.Filter.create('Label', assay, LABKEY.Filter.Types.IN) ]
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
