/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.MabStatus', {

    extend: 'Ext.data.Store',

    alias: 'store.mabstatus',

    model: 'Connector.model.MabDetail',

    constructor(config) {
        this.fetchCount = 0;
        this.loadCount = 0;
        this.results = {};

        this.callParent([config]);
    },

    createModel : function(config) {
        return Ext.create(this.model, Ext.applyIf(config, {
            activeCountLink: true,
            modelClass: 'Connector.model.MabPane',
            subcount: -1,
            viewClass: 'Connector.view.MabPane'
        }));
    },

    executeAll : function(queries) {
        this.fetchCount++;
        var fetchCount = this.fetchCount;
        var queryCount = Object.keys(queries).length;

        for (var q in queries) {
            if (queries.hasOwnProperty(q)) {
                console.log(q, queries[q]);
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
        Connector.getState().onReady(function(state) {

            // listen to state for mab filter changes
            if (!this.filterListener) {
                this.filterListener = true;
                state.on('mabfilterchange', this.load.bind(this));
            }

            Connector.getQueryService().onQueryReady(function() {
                var gridBaseWhere = MabQueryUtils._buildWhere(MabQueryUtils._getMabStateFilterWhere(false, false));

                this.executeAll({
                    gridBase: `
                    SELECT 
                    COUNT(DISTINCT mab_mix_id) as mabCount,
                    COUNT(DISTINCT mab_mix_name_std) as mixCount,
                    COUNT(DISTINCT study) as studyCount,
                    COUNT(DISTINCT virus) as virusCount
                    ${MabQueryUtils._getAssayFrom()}
                    ${gridBaseWhere}
                `,
                    mabVirus: `
                    SELECT
                    COUNT(*) as mabVirusCount
                    FROM (
                        SELECT
                        mab_mix_name_std, 
                        virus,
                        COUNT(*) as mabVirusCount
                        ${MabQueryUtils._getAssayFrom()}
                        ${gridBaseWhere}
                        GROUP BY mab_mix_name_std, virus
                    )
                `, // TODO: Still require the filter mechanism for "metaGridBase"
                    metaGridBase: `
                    SELECT 
                    COUNT(DISTINCT mab_donor_species) as donorSpeciesCount
                    ${MabQueryUtils._getMabMixMetaFrom()}
                `,
                }, this.onLoadCounts.bind(this));
            }, this);
        }, this);
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
            this.createModel({
                count: gridBaseRow.mixCount,
                highlight: true,
                name: 'mixCount',
                label: 'MAbs/Mixtures',
                value: gridBaseRow.mixCount
            }),
            this.createModel({
                count: gridBaseRow.mabCount,
                name: 'mabCount',
                label: 'MAbs',
                value: gridBaseRow.mabCount
            }),
            this.createModel({
                count: metaGridBaseRow.donorSpeciesCount,
                name: 'donorCount',
                label: 'Donor species',
                value: metaGridBaseRow.donorSpeciesCount
            }),
            this.createModel({
                count: gridBaseRow.studyCount,
                highlight: true,
                name: 'studyCount',
                label: 'Studies',
                value: gridBaseRow.studyCount,
            }),
            this.createModel({
                count: mabVirusRow.mabVirusCount,
                name: 'mabVirusCount',
                label: 'MAb-virus pairs',
                value: mabVirusRow.mabVirusCount
            }),
            this.createModel({
                count: gridBaseRow.virusCount,
                name: 'virusCount',
                label: 'Viruses',
                value: gridBaseRow.virusCount
            })
        ];

        this.removeAll();
        this.add(rows);
        this.fireEvent('load', this);
    }
});