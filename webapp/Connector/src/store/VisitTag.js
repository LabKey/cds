/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.VisitTag', {

    extend : 'Ext.data.Store',

    alias: 'store.visittag',

    model : 'Connector.model.VisitTag',

    autoLoad: true,

    sorters: [{property: 'Created'}],

    loadVisitTags : function (data) {
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
        LABKEY.Query.selectRows({
            schemaName: Connector.studyContext.schemaName,
            queryName: 'VisitTag',
            columns: 'Name,Caption,Created',
            filterArray: [LABKEY.Filter.create('SingleUse', true)],
            success: this.loadVisitTags,
            scope : this
        });
    }
});
