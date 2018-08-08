/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.MabStatus', {

    extend: 'Ext.data.Store',

    alias: 'store.mabstatus',

    model: 'Connector.model.Detail',

    // autoLoad: true,

    constructor(config) {
        this.fetchCount = 0;
        this.loadCount = 0;
        this.results = {};

        this.callParent([config]);
    },

    executeAll : function(queries) {
        this.fetchCount++;
        var fetchCount = this.fetchCount;
        var queryCount = Object.keys(queries).length;

        for (var q in queries) {
            if (queries.hasOwnProperty(q)) {
                LABKEY.Query.executeSql({
                    schemaName: 'cds',
                    sql: queries[q],
                    success: this.onExecute.bind(this, {
                        fetchCount: fetchCount,
                        key: q,
                        queryCount: queryCount
                    })
                })
            }
        }
    },

    load : function() {

        this.executeAll({
            gridBase: `
                SELECT 
                COUNT(DISTINCT mab_mix_id) as mabCount,
                COUNT(DISTINCT mab_mix_name_std) as mixCount,
                COUNT(DISTINCT study) as studyCount,
                COUNT(DISTINCT virus) as virusCount
                FROM cds.mAbGridBase
            `,
            mabVirus: `
                SELECT
                COUNT(*) as mabVirusCount
                FROM (
                    SELECT
                    mab_mix_name_std, 
                    virus,
                    COUNT(*) as mabVirusCount
                    FROM cds.mAbGridBase
                    GROUP BY mab_mix_name_std, virus
                )
            `,
            metaGridBase: `
                SELECT 
                COUNT(DISTINCT mab_mix_name_std) as mixCount,
                COUNT(DISTINCT mab_donor_species) as donorSpeciesCount
                FROM cds.mAbMetaGridBase
            `,
        }, this.onLoadCounts.bind(this));
    },

    onExecute : function(props, data) {
        if (this.fetchCount !== props.fetchCount) {
            this.loadCount = 0;
            this.results = {};
        }

        this.loadCount++;
        this.results[props.key] = data;

        if (this.loadCount === props.queryCount) {
            this.loadCount = 0;
            this.onLoadCounts(this.results);
        }
    },

    onLoadCounts : function(results) {
        var gridBaseRow = results.gridBase.rows[0];
        var metaGridBaseRow = results.metaGridBase.rows[0];
        var mabVirusRow = results.mabVirus.rows[0];

        var rows = [
            Ext.create('Connector.model.Detail', {
                count: gridBaseRow.mixCount,
                highlight: true,
                name: 'mixCount',
                label: 'MAbs/Mixtures',
                subcount: -1,
                value: gridBaseRow.mixCount
            }),
            Ext.create('Connector.model.Detail', {
                count: gridBaseRow.mabCount,
                highlight: false,
                name: 'mabCount',
                label: 'MAbs',
                subcount: -1,
                value: gridBaseRow.mabCount
            }),
            Ext.create('Connector.model.Detail', {
                count: metaGridBaseRow.donorSpeciesCount,
                highlight: false,
                name: 'donorCount',
                label: 'Donor species',
                subcount: -1,
                value: metaGridBaseRow.donorSpeciesCount
            }),
            Ext.create('Connector.model.Detail', {
                count: gridBaseRow.studyCount,
                highlight: true,
                name: 'studyCount',
                label: 'Studies',
                subcount: -1,
                value: gridBaseRow.studyCount
            }),
            Ext.create('Connector.model.Detail', {
                count: mabVirusRow.mabVirusCount,
                highlight: false,
                name: 'mabVirusCount',
                label: 'MAb-virus pairs',
                subcount: -1,
                value: mabVirusRow.mabVirusCount
            }),
            Ext.create('Connector.model.Detail', {
                count: gridBaseRow.virusCount,
                highlight: false,
                name: 'virusCount',
                label: 'Viruses',
                subcount: -1,
                value: gridBaseRow.virusCount
            })
        ];

        this.removeAll();
        this.add(rows);
        this.fireEvent('load', this);
    }
});