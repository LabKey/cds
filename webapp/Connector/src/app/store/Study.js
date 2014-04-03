/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Study', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.Study',

    cache : [],

    loadSlice : function(slice) {

        var cells = slice.cells, row;
        var studySet = [], study;
        for (var c=0; c < cells.length; c++) {
            row = cells[c][0];
            study = row.positions[row.positions.length-1][0];
            if (row.value > 0) {
                studySet.push(study.name);
            }
        }
        study = studySet.join(';');

        if (studySet.length > 0) {
            var queryConfig = {
                schemaName: 'Study',
                queryName: 'StudyProperties',
                success: this.onLoadQuery,
                scope: this
            };

            if (study.length > 0) {
                queryConfig.filterArray = [ LABKEY.Filter.create('Label', study, LABKEY.Filter.Types.IN) ]
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
