/*
 * Copyright (c) 2014-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.VisitTag', {

    extend : 'Ext.data.Store',

    model : 'Connector.model.VisitTag',

    autoLoad: true,

    sorters: [{property: 'Created'}],

    singleUseOnly: undefined,

    loadVisitTags : function(data) {
        if (data && data.rows)
        {
            var rows = [];
            for (var i = 0; i < data.rows.length; i++)
            {
                rows.push(Ext.create('Connector.model.VisitTag', {
                    Name: data.rows[i].Name,
                    Caption: data.rows[i].Caption,
                    Created: data.rows[i].Created
                }));
            }

            this.removeAll();
            this.add(rows);
            this.fireEvent('load', this);
        }
    },

    load : function() {
        var filterArray = this.singleUseOnly != undefined ? [LABKEY.Filter.create('SingleUse', this.singleUseOnly)] : undefined;

        // Since we are pre-calculating the day values in cds.GridBase for the single-use visit tags
        // (i.e. Enrollment, Last Vaccination), restrict the VisitTagSingleUse store to exactly that set.
        if (this.singleUseOnly) {
            var preCalculatedAlignments = ['Enrollment', 'First Vaccination', 'Last Vaccination'];
            filterArray.push(LABKEY.Filter.create('Name', preCalculatedAlignments.join(';'), LABKEY.Filter.Types.IN))
        }

        LABKEY.Query.selectRows({
            schemaName: Connector.studyContext.schemaName,
            queryName: 'VisitTag',
            columns: 'Name,Caption,Created',
            filterArray: filterArray,
            success: this.loadVisitTags,
            scope : this
        });
    }
});


Ext.define('Connector.store.VisitTagSingleUse', {

    extend : 'Connector.store.VisitTag',

    alias: 'store.visittagsingle',

    singleUseOnly: true
});


Ext.define('Connector.store.VisitTagMultiUse', {

    extend : 'Connector.store.VisitTag',

    alias: 'store.visittagmulti',

    singleUseOnly: false
});
