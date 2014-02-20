/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Site', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.Site',

    cache : [],

    loadSlice : function(slice) {

        var cells = slice.cells, row;
        var siteSet = [], site;
        for (var c=0; c < cells.length; c++) {
            row = cells[c][0];
            site = row.positions[row.positions.length-1][0];
            if (row.value > 0) {
                siteSet.push(site.name);
            }
        }
        site = siteSet.join(';');

        if (siteSet.length > 0) {
            var queryConfig = {
                schemaName: 'CDS',
                queryName: 'labs',
                success: this.onLoadQuery,
                scope: this
            };

            if (site.length > 0) {
                queryConfig.filterArray = [ LABKEY.Filter.create('Id', site, LABKEY.Filter.Types.IN) ]
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
