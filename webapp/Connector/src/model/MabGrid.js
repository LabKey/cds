/*
 * Copyright (c) 2014-2015 LabKey Corporation
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

    constructor : function(config)
    {
        this.callParent([config]);

        this.filterMap = {}; // 'key' is column fieldKey, 'value' is Id of Connector.model.Filter instance

        this.stateReady = false;
        this.viewReady = false;
        this._ready = false;

        this.queryTask = new Ext.util.DelayedTask(function () {
            Connector.getQueryService().getMabData(this.onMAbData, this.onFailure, this);
        }, this);

        Connector.getState().onReady(function ()
        {
            this.stateReady = true;
            this.applyFilters(this._init, this);
        }, this);

        this.addEvents('mabfilterchange');
    },

    updateData : function(onMAbData, cbScope)
    {
        this.queryTask.delay(50, null, this, [onMAbData, cbScope]);
    },

    loadMetaData: function()
    {
        Connector.getQueryService().getMabMetaData(this.processMetaMap, this.onFailure, this);
    },

    processMetaMap: function(response)
    {
        var rows = response.rows;
        var mabMap = {};
        Ext.each(rows, function(row){
            var name = row.mab_mix_name_std;
            if (!mabMap[name]) {
                mabMap[name] = {
                    mab_donor_species: [],
                    mab_hxb2_location: [],
                    mab_isotype: []
                }
            }
            var mab = mabMap[name];
            if (mab.mab_donor_species.indexOf(row.mab_donor_species) === -1)
                mab.mab_donor_species.push(row.mab_donor_species);
            if (mab.mab_hxb2_location.indexOf(row.mab_hxb2_location) === -1)
                mab.mab_hxb2_location.push(row.mab_hxb2_location);
            if (mab.mab_isotype.indexOf(row.mab_isotype) === -1)
                mab.mab_isotype.push(row.mab_isotype);
        });

        var mabMapProcessed = {};
        Ext.iterate(mabMap, function(key, val){
            val.mab_donor_species.sort();
            val.mab_hxb2_location.sort();
            val.mab_isotype.sort();
            mabMapProcessed[key] = {
                mab_donor_species: val.mab_donor_species.toString(),
                mab_hxb2_location: val.mab_hxb2_location.toString(),
                mab_isotype: val.mab_isotype.toString()
            };
        });

        this.mabMetaMap = mabMapProcessed;
        this.updateData();
    },

    onMAbData: function(response)
    {
        var rows = response.rows;
        var mabRows = [];
        Ext.each(rows, function(row) {
            var mabName = row.mab_mix_name_std;
            var metaObj = this.mabMetaMap[mabName];
            if (metaObj) {
                row.mab_donor_species = metaObj.mab_donor_species;
                row.mab_hxb2_location = metaObj.mab_hxb2_location;
                row.mab_isotype = metaObj.mab_isotype;
                mabRows.push(row);
            }
        }, this);
        this.getGridStore().loadRawData(mabRows);
    },

    getGridStore: function(sorters)
    {
        if (!this.gridStore)
        {
            this.gridStore = Ext.create('Ext.data.Store', {
                model: 'Connector.model.MabSummary',
                sorters: sorters ? sorters : Connector.view.MabGrid.getDefaultSort()
            });
        }
        return this.gridStore;
    },

    _init : function()
    {
        if (!this._ready && this.viewReady && this.stateReady)
        {
            Connector.getQueryService().onQueryReady(function(service)
            {
                this._ready = true;
                this.loadMetaData();
            }, this);
        }
    },

    applyFilters : function(callback, scope)
    {
        Ext.each(Connector.getState().getMabFilters(), function(appFilter) {
              // TODO
        }, this);
        if (Ext.isFunction(callback))
        {
            callback.call(scope || this);
        }
    },

    getFilterArray : function(includeBaseFilters)
    {
        return this.get('filterArray');
    },

    onGridFilterChange : function(view, boundColumn, oldFilters, newFilters)
    {
        if (Ext.isEmpty(oldFilters))
        {

        }
        else
        {

        }
    },

    buildFilter : function(filterArray, callback, scope)
    {

    },

    getFilterId : function(filter)
    {
        return filter.getURLParameterName() + '=' + filter.getValue();
    },

    addToFilters : function(filter, id)
    {
        var key = this.getFilterId(filter);
        this.filterMap[key] = id;
    },

    onGridFilterRemove : function(view, fieldKey)
    {
        var keysToDelete = [],
                idsToDelete = {},
                hasFilter = false;

        Ext.iterate(this.filterMap, function(urlParam, id)
        {
            if (urlParam.indexOf(fieldKey) > -1)
            {
                keysToDelete.push(urlParam);
                idsToDelete[id] = true;
                hasFilter = true;
            }
        }, this);

        if (hasFilter)
        {
            Ext.each(keysToDelete, function(key)
            {
                delete this.filterMap[key];
            }, this);

            Connector.getState().removeMabFilters(Ext.Object.getKeys(idsToDelete));
        }
    },

    onViewReady : function(view)
    {
        this.viewReady = true;
        this._init();
    },

    setActive : function(active)
    {
        this.set('active', active);

        //
    },

    isActive : function()
    {
        return this.get('active') === true && this.initialized === true;
    }

});

