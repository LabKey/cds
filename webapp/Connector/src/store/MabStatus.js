/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.MabStatus', {

    extend: 'Ext.data.Store',

    alias: 'store.mabstatus',

    model: 'Connector.model.MabDetail',

    constructor : function(config) {
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
        this.loadCount = 0;
        this.results = {};

        var fetchCount = this.fetchCount;
        var queryCount = Ext.Object.getKeys(queries).length;

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
        Connector.getState().onReady(function(state) {

            // listen to state for mab filter changes
            if (!this.filterListener) {
                this.filterListener = true;
                state.on('mabfilterchange', this.load.bind(this));
            }

            Connector.getQueryService().onQueryReady(function() {
                this.executeAll({
                    gridBase: MabQueryUtils.getBaseCountSQL(true),
                    mixType: MabQueryUtils.getMixTypeCountSQL(true),
                    mabCount: MabQueryUtils.getMabCountSQL(true),
                    mabVirus: MabQueryUtils.getMAbVirusPairCountSQL(true),
                    mixDonorSpecies: MabQueryUtils.getDonorSpeciesCountSQL(true)
                }, this.onLoadCounts.bind(this));
            }, this);
        }, this);
    },

    onExecute : function(props, data) {
        if (this.fetchCount === props.fetchCount) {
            this.loadCount++;
            this.results[props.key] = data;

            if (this.loadCount === props.queryCount) {
                this.loadCount = 0;
                this.onLoadCounts(this.results);
            }
        }
    },

    onLoadCounts : function(results) {
        var gridBaseRow = results.gridBase.rows[0];
        var mixTypeBaseRow = results.mixType.rows[0];
        var donorSpeciesBaseRow = results.mixDonorSpecies.rows[0];
        var mabCountRow = results.mabCount.rows[0];
        var mabVirusRow = results.mabVirus.rows[0];

        // Display order based on insertion order
        var rows = [
            this.createModel({
                count: gridBaseRow.mixCount,
                filterConfig: {
                    fieldName: 'mab_mix_name_std',
                    isMeta: false
                },
                dimension: 'MAb',
                highlight: true,
                name: 'mixCount',
                label: 'MAbs/Mixtures',
                value: gridBaseRow.mixCount
            }),
            this.createModel({
                count: mabCountRow.mabCount,
                filterConfig: {
                    fieldName: 'mab_name_std',
                    isMeta: false,
                    sql: MabQueryUtils.getMabValuesSQL.bind(MabQueryUtils)
                },
                name: 'mabCount',
                label: 'MAbs',
                value: mabCountRow.mabCount
            }),
            this.createModel({
                count: mixTypeBaseRow.mixTypeCount,
                filterConfig: {
                    fieldName: 'mab_mix_type',
                    isMeta: true
                },
                name: 'typeCount',
                label: 'Mixture types',
                value: mixTypeBaseRow.mixTypeCount
            }),
            this.createModel({
                count: donorSpeciesBaseRow.donorSpeciesCount,
                filterConfig: {
                    fieldName: 'mab_donor_species',
                    isMeta: true
                },
                name: 'donorCount',
                label: 'Donor species',
                value: donorSpeciesBaseRow.donorSpeciesCount
            }),
            this.createModel({
                count: gridBaseRow.studyCount,
                filterConfig: {
                    fieldName: 'study.label',
                    isMeta: false
                },
                dimension: 'Study',
                learnProp: 'label',
                highlight: true,
                name: 'studyCount',
                label: 'Studies',
                value: gridBaseRow.studyCount
            }),
            this.createModel({
                count: mabVirusRow[MabQueryUtils.MAB_VIRUS_PAIRS_COUNT_COLUMN],
                filterConfig: {
                    fieldName: MabQueryUtils.MAB_VIRUS_PAIRS_COLUMN,
                    isMeta: false,
                    sql: MabQueryUtils.getMAbVirusPairValuesSQL.bind(MabQueryUtils)
                },
                name: MabQueryUtils.MAB_VIRUS_PAIRS_COUNT_COLUMN,
                label: 'MAb-virus pairs',
                value: mabVirusRow[MabQueryUtils.MAB_VIRUS_PAIRS_COUNT_COLUMN]
            }),
            this.createModel({
                count: gridBaseRow.virusCount,
                filterConfig: {
                    fieldName: 'virus',
                    isMeta: false
                },
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