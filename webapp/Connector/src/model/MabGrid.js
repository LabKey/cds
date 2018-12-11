/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.MabGrid', {
    extend: 'Ext.data.Model',

    fields: [
        {name: 'active', defaultValue: true},
        {name: 'columnSet', defaultValue: []},

        {name: 'filterArray', defaultValue: []}
    ],

    statics: {
        ic50Ranges: [
            {value: 'G0.1', displayValue: '< 0.1'},
            {value: 'G1', displayValue: '>= 0.1 to < 1'},
            {value: 'G10', displayValue: '>= 1 to < 10'},
            {value: 'G50', displayValue: '>= 10 to <= 50'},
            {value: 'G50+', displayValue: '> 50'}
        ]
    },

    constructor : function(config) {
        this.callParent([config]);

        this.stateReady = false;
        this.viewReady = false;
        this._ready = false;

        this.queryTask = new Ext.util.DelayedTask(function () {
            Connector.getQueryService().getMabData(this.onMAbData, this.onFailure, this);
        }, this);

        Connector.getState().onReady(function() {
            this.stateReady = true;
            this._init();
        }, this);

        this.addEvents('mabdataloaded', 'initmabgrid');
    },

    updateData : function() {
        this.queryTask.delay(50, null, this);
    },

    loadMetaData : function() {
        Connector.getQueryService().getMabMetaData(this.processMetaMap, this.onFailure, this);
    },

    processMetaMap : function(response) {
        var rows = response.rows, NO_VALUE = '[blank]';
        var mabMap = {}, nameMap = {}, speciesMap = {}, locationMap = {}, isotypeMap = {};
        Ext.each(rows, function(row) {
            var name = row.mab_mix_name_std;
            nameMap[name] = true;
            speciesMap[row.mab_donor_species ? row.mab_donor_species : NO_VALUE] = true;
            locationMap[row.mab_hxb2_location ? row.mab_hxb2_location : NO_VALUE] = true;
            isotypeMap[row.mab_isotype ? row.mab_isotype : NO_VALUE] = true;
            if (!mabMap[name]) {
                mabMap[name] = {
                    mab_donor_species: [],
                    mab_hxb2_location: [],
                    mab_isotype: []
                }
            }
            var mab = mabMap[name];
            if (row.mab_donor_species && mab.mab_donor_species.indexOf(row.mab_donor_species) === -1)
                mab.mab_donor_species.push(row.mab_donor_species);
            if (row.mab_hxb2_location && mab.mab_hxb2_location.indexOf(row.mab_hxb2_location) === -1)
                mab.mab_hxb2_location.push(row.mab_hxb2_location);
            if (row.mab_isotype && mab.mab_isotype.indexOf(row.mab_isotype) === -1)
                mab.mab_isotype.push(row.mab_isotype);
        });

        var mabMapProcessed = {};
        Ext.iterate(mabMap, function(key, val) {
            val.mab_donor_species.sort();
            val.mab_hxb2_location.sort();
            val.mab_isotype.sort();
            mabMapProcessed[key] = {
                mab_donor_species: val.mab_donor_species.join(", "),
                mab_hxb2_location: val.mab_hxb2_location.join(", "),
                mab_isotype: val.mab_isotype.join(", ")
            };
        });

        this['mab_mix_name_std_values'] = Ext.Object.getKeys(nameMap);
        this['mab_donor_species_values'] = Ext.Object.getKeys(speciesMap);
        this['mab_hxb2_location_values'] = Ext.Object.getKeys(locationMap);
        this['mab_isotype_values'] = Ext.Object.getKeys(isotypeMap);
        this.mabMetaMap = mabMapProcessed;
        this.updateData();
    },

    getUniqueFieldValues : function(field) {
        if (field === MabQueryUtils.IC50_GROUP_COLUMN) {
            return Connector.model.MabGrid.ic50Ranges;
        }

        var fieldName = Connector.utility.MabQuery.getParsedFieldName(field, true);
        var key = fieldName + '_values';
        if (this[key]) {
            return this[key];
        }
        return [];
    },

    getAllFacetValues : function(config) {
        Connector.getQueryService().getMabAllFieldValues(config);
    },

    getActiveFacetValues : function(config) {
        Connector.getQueryService().getMabActiveFieldValues(config);
    },

    onMAbData : function(geoMeanResponse, config) {
        var geoMeanMap = {};
        Ext.each(geoMeanResponse.rows, function(row) {
            geoMeanMap[row.mab_mix_name_std] = parseFloat(row.IC50geomean.toFixed(5));
        }, this);

        var mabRows = [];
        Ext.each(config.countsData.rows, function(row) {
            var mabName = row.mab_mix_name_std;
            var metaObj = this.mabMetaMap[mabName];
            if (metaObj) {
                row.mab_donor_species = metaObj.mab_donor_species;
                row.mab_hxb2_location = metaObj.mab_hxb2_location;
                row.mab_isotype = metaObj.mab_isotype;
                row.IC50geomean = geoMeanMap[mabName];
                mabRows.push(row);
            }
        }, this);
        this.getGridStore().loadRawData(mabRows);
    },

    getGridStore : function(sorters) {
        if (!this.gridStore) {
            this.gridStore = Ext.create('Ext.data.Store', {
                model: 'Connector.model.MabSummary',
                sorters: sorters ? sorters : Connector.view.MabGrid.getDefaultSort(),
                listeners: {
                    load: function() {
                        this.fireEvent('mabdataloaded', this);
                    },
                    scope: this
                }
            });
        }

        return this.gridStore;
    },

    _init : function() {
        if (!this._ready && this.viewReady && this.stateReady) {
            Connector.getQueryService().onQueryReady(function() {
                this._ready = true;
                this.loadMetaData();
                this.fireEvent('initmabgrid', this);
                Connector.getState().on('mabfilterchange', this.onMabFilterChange, this);
            }, this);
        }
    },

    onMabFilterChange: function() {
        this.updateData();
    },

    getFilterArray : function() {
        return this.get('filterArray');
    },

    getFieldStateFilter : function(fieldName) {
        var allFilters = Connector.getState().getMabFilters(true);
        var targetFilter = null;
        Ext.each(allFilters, function(filter) {
            var f = filter.gridFilter[0];
            if (f.getColumnName() === fieldName) {
                targetFilter = f;
                return false;
            }
        });
        return targetFilter;
    },

    onViewReady : function(view) {
        this.viewReady = true;
        this._init();
    },

    setActive : function(active) {
        this.set('active', active);
    },

    isActive : function() {
        return this.get('active') === true;
    },

    hasMAbSelected : function() {
        var selection = Connector.getState().getSelectedMAbs();
        return selection && selection.length > 0;
    }
});

