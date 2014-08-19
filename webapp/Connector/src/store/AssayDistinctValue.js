/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.AssayDistinctValue', {

    extend : 'Ext.data.Store',

    alias: 'store.assaydistinctvalue',

    model : 'Connector.model.Antigen',

    autoLoad: true,

    sorters: [{property: 'Name'}],

    loadAntigens : function (data) {
        if (data && data.rows)
        {
            var rows = [];
            for (var i = 0; i < data.rows.length; i++)
            {
                if (data.rows[i]['Id'] != null)
                {
                    rows.push(Ext.create('Connector.model.Antigen', {
                        Name: data.rows[i]['Id'],
                        Description: data.rows[i]['ShortDescription']
                    }));
                }
            }

            this.removeAll();
            this.add(rows);
            this.fireEvent('load', this);
        }
    },

    load : function() {
        LABKEY.Query.executeSql({
            schemaName: this.schemaName,
            sql: 'SELECT DISTINCT ' + this.colName + '.Id, ' + this.colName + '.ShortDescription FROM "' + this.queryName + '"',
            success: this.loadAntigens,
            scope : this
        });
    }
});
