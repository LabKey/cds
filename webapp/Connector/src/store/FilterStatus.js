/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.FilterStatus', {

    extend: 'Ext.data.Store',

    model: 'Connector.model.Detail',

    // initial data record to show loading spinner on page load
    data: [{
        label: "Subjects",
        count: -1,
        subcount: -1,
        highlight: true
    }],

    plotCountRecordsCache: [{
        label: 'Timepoints',
        count: -1,
        subcount: -1,
        plotBasedCount: true,
        activeCountLink: true,
        infoPaneViewClass: 'Connector.view.TimepointPane'
    }],

    constructor : function(config) {

        this.flight = 0;
        this.loadTask = new Ext.util.DelayedTask(this._load, this);

        this.callParent([config]);
    },

    load : function() {
        this.loadTask.delay(50);
    },

    _load : function() {
        Connector.getState().onMDXReady(function(mdx) {
            this.fireEvent('beforeload', this);
            this.makeRequest(mdx);
        }, this);
    },

    makeRequest : function(mdx) {

        var rows = [],
            configs = [],
            selConfigs = [],
            hasSelections = Connector.getState().hasSelections(),
            dims = mdx.getDimensions(),
            hiers,
            lvls, lvl,
            d, h, l;

        //
        // Binds cube metadata on a per level basis
        //
        for (d=0; d < dims.length; d++) {
            hiers = dims[d].getHierarchies();
            for (h=0; h < hiers.length; h++) {
                lvls = hiers[h].levels;
                for (l=0; l < lvls.length; l++) {
                    lvl = lvls[l];
                    if (lvl.activeCount) {

                        configs.push({
                            level: lvl.uniqueName,
                            dd: dims[d].uniqueName,
                            hh: hiers[h].uniqueName,
                            label: {
                                singular: lvl.countSingular,
                                plural: lvl.countPlural
                            },
                            highlight: lvl.activeCount === 'highlight',
                            activeCountLink: lvl.activeCountLink === true,
                            plotBasedCount: lvl.plotBasedCount,
                            cellbased: lvl.cellbased,
                            priority: Ext.isDefined(lvl.countPriority) ? lvl.countPriority : 1000
                        });

                        if (hasSelections) {
                            selConfigs.push({
                                level: lvl.uniqueName
                            });
                        }
                    }
                }
            }
        }

        var querySelections = hasSelections && selConfigs.length > 0,
            flight = ++this.flight,
            countResult, selResult;

        var _load = function() {
            if (querySelections) {
                if (Ext.isDefined(countResult) && Ext.isDefined(selResult)) {
                    if (this.flight === configs[0].flight &&
                        this.flight === selConfigs[0].flight) {
                        this.loadResults(mdx, countResult, configs, selResult);
                    }
                }
            }
            else {
                if (Ext.isDefined(countResult)) {
                    if (this.flight === configs[0].flight) {
                        this.loadResults(mdx, countResult, configs);
                    }
                }
            }
        };

        var handleCounts = function(results) {
            countResult = results; _load.call(this);
        };

        var handleSelections = function(results) {
            selResult = results; _load.call(this);
        };

        if (configs.length > 0) {

            configs.sort(function(a, b) {
                return a.priority - b.priority;
            });

            for (d=0; d < configs.length; d++) {
                rows.push({
                    level: configs[d].level
                });
            }

            configs[0].flight = flight;
            mdx.query({
                onRows: [{
                    operator: 'UNION',
                    arguments: rows
                }],
                useNamedFilters: [LABKEY.app.constant.STATE_FILTER],
                success: handleCounts,
                scope: this
            });

            if (querySelections) {

                selConfigs[0].flight = flight;
                mdx.query({
                    onRows: [{
                        operator: 'UNION',
                        arguments: selConfigs
                    }],
                    useNamedFilters: [LABKEY.app.constant.STATE_FILTER, LABKEY.app.constant.SELECTION_FILTER],
                    success: handleSelections,
                    scope: this
                });
            }
            else {
                handleSelections.call(this);
            }
        }
    },

    loadResults : function(mdx, result, configs, selResult) {

        var lvlCounts = {},
            selLvlCounts = {},
            lvlUniqueName,
            recs = [],
            rec,
            _rows = result.axes[1].positions,
            _cells = result.cells,
            hasSelections = Ext.isDefined(selResult),

            // If we have selections, but no results are returned there are no rows returned.
            // Thus, when this is true we'll display (0 / count) instead of just (count)
            zeroSelections = false,
            _counts, r;

        //
        // process counts by level
        //
        for (r=0; r < _rows.length; r++) {
            lvlUniqueName = _rows[r][0].level.uniqueName;
            if (lvlCounts[lvlUniqueName]) {
                lvlCounts[lvlUniqueName].rowCount++;
            }
            else {
                lvlCounts[lvlUniqueName] = {
                    count: _cells[r][0].value,
                    subCount: -1,
                    rowCount: 1,
                    subRowCount: -1
                }
            }
        }

        if (hasSelections) {

            _rows = selResult.axes[1].positions;
            _cells = selResult.cells;

            if (_rows.length > 0) {
                for (r=0; r < _rows.length; r++) {
                    lvlUniqueName = _rows[r][0].level.uniqueName;
                    if (selLvlCounts[lvlUniqueName]) {
                        selLvlCounts[lvlUniqueName].rowCount++;
                    }
                    else {
                        selLvlCounts[lvlUniqueName] = {
                            count: _cells[r][0].value,
                            rowCount: 1
                        }
                    }
                }
            }
            else {
                zeroSelections = true;
            }
        }

        Ext.each(configs, function(ca) {
            _counts = lvlCounts[ca.level];

            rec = {
                dimension: ca.dd,
                hierarchy: ca.hh,
                level: ca.level,
                highlight: ca.highlight,
                activeCountLink: ca.activeCountLink,
                plotBasedCount: ca.plotBasedCount
            };

            if (_counts) {
                rec.count = ca.cellbased ? _counts.rowCount : _counts.count;

                if (hasSelections && selLvlCounts[ca.level]) {
                    rec.subcount = ca.cellbased ? selLvlCounts[ca.level].rowCount : selLvlCounts[ca.level].count;
                }
                else {
                    rec.subcount = zeroSelections ? 0 : -1;
                }
            }
            else {
                rec.count = 0;
                rec.subcount = zeroSelections ? 0 : -1;
            }

            rec.label = rec.count != 1 ? ca.label.plural : ca.label.singular;

            recs.push(rec);
        });

        recs = recs.concat(this.plotCountRecordsCache);

        this.loadData(recs);
        this.fireEvent('load', this);
    },

    updatePlotRecordCount : function(label, count)
    {
        var recIndex = this.findPlotCountRecordCache(label),
                record;

        if (recIndex > -1)
        {
            this.plotCountRecordsCache[recIndex].count = count;

            // if the store has already been loaded, update that count as well
            record = this.getById(label);
            if (record != null)
            {
                record.set('count', count);
            }

            // anytime the count is updated, reset the subcount
            this.updatePlotRecordSubcount('Timepoints', -1);
        }
        else
        {
            console.warn('Requested update for plot record that is not defined: ' + label);
        }
    },

    updatePlotRecordSubcount : function(label, subcount)
    {
        var recIndex = this.findPlotCountRecordCache(label),
            record;

        if (recIndex > -1)
        {
            this.plotCountRecordsCache[recIndex].subcount = subcount;

            // if the store has already been loaded, update that count as well
            record = this.getById(label);
            if (record != null)
            {
                record.set('subcount', subcount);
            }
        }
        else
        {
            console.warn('Requested update for plot record that is not defined: ' + label);
        }
    },

    findPlotCountRecordCache : function(label)
    {
        for (var i = 0; i < this.plotCountRecordsCache.length; i++)
        {
            var recData = this.plotCountRecordsCache[i];
            if (Ext.isObject(recData) && recData.label == label)
            {
                return i;
            }
        }

        return -1;
    }
});
