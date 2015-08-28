/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Grid', {
    extend: 'Ext.data.Model',

    fields: [
        {name: 'active', defaultValue: true},
        {name: 'columnSet', defaultValue: []},

        /**
         * columns not reachable via getData API but joined in via the grid API.
         * Each lookup col has array of Connector.model.ColumnInfo objects.
         */
        {name: 'foreignColumns', defaultValue: {}},

        {name: 'filterArray', defaultValue: []},
        {name: 'baseFilterArray', defaultValue: []},
        {name: 'filterState', defaultValue: {
            hasFilters: false,
            subjects: []
        }},

        {name: 'defaultMeasures', defaultValue: []},
        {name: 'measures', defaultValue: []},
        {name: 'plotMeasures', defaultValue: []},
        {name: 'SQLMeasures', defaultValue: []},

        {name: 'metadata', defaultValue: undefined},
        {name: 'schemaName', defaultValue: 'study' },
        {name: 'queryName', defaultValue: 'GridBase' }
    ],

    statics: {
        addLookupColumns : function(gridModel, keyColumn, columns) {
            var foreignColumns = gridModel.get('foreignColumns');

            if (!foreignColumns[keyColumn.fieldKeyPath]) {
                return;
            }

            var names = foreignColumns[keyColumn.name];
            Ext.iterate(names, function(column, val) {
                columns.push(keyColumn.name + '/' + val.fieldKeyPath);
            });
        },

        createSubjectFilter : function(gridModel, filterState) {
            var filter = undefined;

            if (filterState.hasFilters) {
                var subjectColumn = Connector.getService('Query').getSubjectColumnAlias(),
                    subjects = filterState.subjects;
                filter = LABKEY.Filter.create(subjectColumn, subjects.join(';'), LABKEY.Filter.Types.IN);
            }

            return filter;
        },

        findSourceMeasure : function(allMeasures, datasetName) {
            Ext.each(allMeasures, function(measure) {
                if (measure.name.toLowerCase() == "source/title" && measure.queryName == datasetName) {

                    var sourceMeasure = Ext.clone(measure);

                    return Ext.apply(sourceMeasure, {
                        name: sourceMeasure.name.substring(0, sourceMeasure.name.indexOf("/")), //Don't want the lookup
                        hidden: true,
                        isSourceURI: true,
                        alias: LABKEY.MeasureUtil.getAlias(sourceMeasure, true) //Can't change the name without changing the alias
                    });
                }
            });
        },

        /**
         * These columns can be used to populate a models 'columnSet'
         * @param gridModel
         * @returns {Array}
         */
        generateColumnSet : function(gridModel) {

            var columns = Connector.getService('Query').getDefaultGridAliases(true /* asArray */),
                measures = gridModel.getMeasures();

            Ext.each(measures, function(measure) {
                columns.push(measure.alias);
            });

            return Ext.Array.unique(columns);
        },

        getSubjectFilterState : function(model, callback, scope) {

            var state = Connector.getState();

            var filterState = {
                hasFilters: state.hasFilters(),
                subjects: []
            };

            if (Ext.isFunction(callback)) {
                if (filterState.hasFilters) {
                    var filters = state.getFilters(), nonGridFilters = [];

                    Ext.each(filters, function(filter) {
                        if (!filter.get('isGrid')) {
                            nonGridFilters.push(filter);
                        }
                    }, this);

                    if (Ext.isEmpty(nonGridFilters)) {
                        filterState.hasFilters = false;
                        callback.call(scope || this, filterState);
                    }
                    else {
                        state.onMDXReady(function(mdx) {
                            state.addPrivateSelection(nonGridFilters, 'gridselection');

                            mdx.queryParticipantList({
                                useNamedFilters : ['gridselection'],
                                success : function(cs) {
                                    var ptids = [];
                                    var pos = cs.axes[1].positions;
                                    for (var a=0; a < pos.length; a++) {
                                        ptids.push(pos[a][0].name);
                                    }
                                    state.removePrivateSelection('gridselection');

                                    filterState.subjects = ptids;

                                    callback.call(scope || this, filterState);
                                },
                                scope: this
                            });
                        }, this);
                    }
                }
                else {
                    callback.call(scope || this, filterState);
                }
            }
        },

        getMaxRows : function() {

            var max = 25;
            var params = LABKEY.ActionURL.getParameters();

            if (Ext.isDefined(params['maxRows'])) {
                var num = parseInt(params['maxRows']);
                if (Ext.isNumber(num)) {
                    max = num;
                }
            }

            return max;
        }
    },

    constructor : function(config) {

        this.callParent([config]);

        this.filterMap = {}; // 'key' is column fieldKey, 'value' is Id of Connector.model.Filter instance

        this.stateReady = false;
        this.viewReady = false;
        this._ready = false;

        this.metadataTask = new Ext.util.DelayedTask(function() {
            Connector.getService('Query').getData(this.getWrappedMeasures(), this.onMetaData, this.onFailure, this);
        }, this);

        Connector.getState().onReady(function(state) {
            this.stateReady = true;
            this.applyFilters(this.bindFilters(state.getFilters()));
            this._init();
        }, this);

        this.addEvents('filterchange', 'updatecolumns');
    },

    _init : function() {
        if (this.viewReady && this.stateReady) {
            Connector.getService('Query').onQueryReady(function(service) {
                service.getDefaultGridMeasures(function(defaultMeasures) {

                    this.bindDefaultMeasures(defaultMeasures);

                    if (this._ready === false) {
                        this._ready = true;

                        // hook listeners
                        var state = Connector.getState();
                        state.on('filterchange', this.onAppFilterChange, this);
                        Connector.getApplication().on('plotmeasures', this.onPlotMeasureChange, this);

                        this.bindMeasures([], [], [], true);
                        this.bindApplicationMeasures(state.getFilters());
                    }

                    this.requestMetaData();

                }, this);
            }, this);
        }
    },

    onPlotMeasureChange : function() {
        this.bindApplicationMeasures(Connector.getState().getFilters());
    },

    bindDefaultMeasures : function(defaultMeasures) {
        // set the wrapped default measures
        var wrapped = [];
        Ext.each(defaultMeasures, function(measure) {
            wrapped.push({
                measure: measure,
                time: 'date'
            });
        });
        this.set('defaultMeasures', wrapped);
    },

    bindMeasures : function(measures, allMeasures, foreignColumns, silent) {

        var measureSet = [], sourceMeasure, item, wrapped =[],
            sourceMeasuresRequired = {};  //Make sure we select the "source" measure for all datasets that have it

        Ext.each(measures, function(measure) {
            item = Ext.clone(measure.data);

            if (!(item.queryName in sourceMeasuresRequired))
                sourceMeasuresRequired[item.queryName] = true;

            // We don't want to lose foreign key info -- measure picker follows these by default
            if (item.variableType !== "TIME" && item.name.indexOf("/") != -1) {
                if (item.name.toLowerCase() == "source/title") {
                    sourceMeasuresRequired[item.queryName] = false;
                    item.isSourceURI = true;
                }

                if (Ext.isDefined(item.alias)) {
                    item.name = item.name.substring(0, item.name.indexOf("/"));
                    item.alias = LABKEY.MeasureUtil.getAlias(item, true); //Since we changed the name need to recompute the alias
                }
            }

            measureSet.push(item);
        }, this);

        Ext.iterate(sourceMeasuresRequired, function(queryName, value) {
            if (value) {
                sourceMeasure = Connector.model.Grid.findSourceMeasure(allMeasures, queryName);
                if (null != sourceMeasure)
                    measureSet.push(sourceMeasure);
            }
        });

        wrapped = [];
        Ext.each(measureSet, function(measure) {
            var w = {
                measure: measure,
                time: 'date'
            };

            if (w.measure.variableType === "TIME") {
                w.measure.interval = w.measure.alias;
                w.dateOptions = {
                    interval: w.measure.alias,
                    zeroDayVisitTag: null
                }
            }

            wrapped.push(w);
        });

        // set the wrapped measures, foreign columns
        this.set({
            measures: wrapped,
            foreignColumns: Ext.isDefined(foreignColumns) ? foreignColumns : {}
        });

        if (silent !== true) {
            this.requestMetaData();
        }
    },

    /**
     * The 'raw' measures the grid receives are wrapped during processing so they can
     * be consumed by LABKEY.Query.Visualization.getData.
     * @param {String} measureType
     * @returns {Array}
     */
    getMeasures : function(measureType) {
        var measures = [];

        if (Ext.isString(measureType)) {
            Ext.each(this.get(measureType), function(m) {
                measures.push(m.measure);
            });
        }
        else {
            return Ext.Array.push(
                Ext.Array.pluck(this.get('defaultMeasures'), 'measure'),
                Ext.Array.pluck(this.get('plotMeasures'), 'measure'),
                Ext.Array.pluck(this.get('SQLMeasures'), 'measure'),
                Ext.Array.pluck(this.get('measures'), 'measure')
            );
        }
        return measures;
    },

    getWrappedMeasures : function() {
        return this.get('defaultMeasures')
                .concat(this.get('plotMeasures'))
                .concat(this.get('SQLMeasures'))
                .concat(this.get('measures'));
    },

    bindApplicationMeasures : function(filterSet) {
        //
        // Cross-reference application measures
        //
        var SQLMeasures = [],
            plotMeasures = [],
            queryService = Connector.getService('Query');

        Ext.each(filterSet, function(filter) {
            // respect plotted measures
            if (filter.isPlot() && !filter.isGrid()) {
                var plotMeasureSet = filter.get('plotMeasures');
                Ext.each(plotMeasureSet, function(pm) {
                    if (Ext.isObject(pm)) {
                        plotMeasures.push({
                            dateOptions: Ext.clone(pm.dateOptions),
                            measure: Ext.clone(pm.measure),
                            time: 'date'
                        });
                    }
                }, this);
            }
            else if (filter.isGrid() && !filter.isPlot()) {
                // For each grid filter find the associated measure
                var gridFilters = filter.get('gridFilter');
                Ext.each(gridFilters, function(gf) {

                    var measure = queryService.getMeasure(gf.getColumnName());
                    if (Ext.isDefined(measure)) {
                        SQLMeasures.push({
                            measure: Ext.clone(measure),
                            time: 'date',
                            filterArray: gridFilters
                        });
                        return false;
                    }

                }, this);
            }
        }, this);

        this.set({
            plotMeasures: plotMeasures,
            SQLMeasures: SQLMeasures
        });

        if (!this.isActive()) {
            this.activeMeasure = true;
        }
    },

    /**
     *
     * @param filterArray
     * @param callback
     * @param scope
     * @param [silent=false]
     */
    applyFilters : function(filterArray, callback, scope, silent) {
        //
        // calculate the subject filter
        //
        Connector.model.Grid.getSubjectFilterState(this, function(filterState) {
            var subjectFilter = Connector.model.Grid.createSubjectFilter(this, filterState);
            var baseFilterArray = [];
            if (subjectFilter) {
                baseFilterArray = [subjectFilter];
            }

            this.set({
                filterState: filterState,
                baseFilterArray: baseFilterArray,
                filterArray: filterArray
            });

            if (this.isActive()) {
                this.activeFilter = false;
                this.activeColumn = false;
                this.activeMeasure = false;

                if (!silent)
                    this.fireEvent('filterchange', this, this.getFilterArray());
            }
            else {
                this.activeFilter = true;
            }

            if (Ext.isFunction(callback)) {
                callback.call(scope || this);
            }

        }, this);
    },

    /**
     * Called when the set of application filters update. Note: This will fire even when
     * the bound view might not be active
     * @param appFilters
     */
    onAppFilterChange : function(appFilters) {
        if (this._ready === true) {
            var filterArray = this.bindFilters(appFilters);
            this.applyFilters(filterArray, function() {
                this.bindApplicationMeasures(appFilters);

                if (this.isActive()) {
                    this.requestMetaData();
                }
            }, this);
        }
    },

    bindFilters : function(appFilters) {
        var filterArray = [], nonGridFilters = [];
        Ext.each(appFilters, function(filter) {
            if (filter.isGrid()) {
                var gridFilters = filter.get('gridFilter');
                Ext.each(gridFilters, function(gf) {
                    if (gf !== null) {
                        filterArray.push(gf);
                        this.addToFilters(gf, filter.id);
                    }
                }, this);
            }
            else {
                nonGridFilters.push(filter);
            }
        }, this);
        return filterArray;
    },

    getBaseFilters : function() {
        return this.get('baseFilterArray');
    },

    getFilterArray : function(includeBaseFilters) {

        var _array = this.get('filterArray');

        if (includeBaseFilters === true) {
            _array = _array.concat(this.getBaseFilters());
        }

        return _array;
    },

    /**
     * Called when a user creates/updates a filter via the grid filtering interface.
     * @param view
     * @param boundColumn
     * @param filterArray - only contains new filters. That is, filters applied after the user's change
     */
    onGridFilterChange : function(view, boundColumn, filterArray) {

        var configs = [],
            bins = {},
            keys = [],
            fa = filterArray,
            schema = this.get('schemaName'),
            query = this.get('queryName'),
            queryService = Connector.getService('Query'),
            colname, f;

        for (f=0; f < fa.length; f++) {
            colname = fa[f].getColumnName();
            if (!bins[colname]) {
                keys.push(colname);
                bins[colname] = [];
            }
            bins[colname].push(fa[f]);
        }

        // This must be done independently for each filter
        for (f=0; f < keys.length; f++) {
            configs.push({
                schemaName: schema,
                queryName: query,
                configId: bins[keys[f]][0].getURLParameterName(),
                column: queryService.getSubjectColumnAlias(),
                filterArray: bins[keys[f]],
                scope: this
            });
        }

        if (!Ext.isEmpty(configs)) {

            var state = Connector.getState(),
                appFilters = state.getFilters(),
                newFilters = [], matched = false;

            // For each config do one of the following:
            // 1. Replacement, find the record id
            // 2. new, create a new app filter
            Ext.each(configs, function(config) {
                var match = this._generateMatch(config.filterArray, appFilters);
                if (match) {
                    matched = true;
                }
                else {
                    newFilters.push(this.buildFilter(filterArray));
                }
            }, this);

            if (matched) {
                state.updateFilterMembersComplete(true);
            }

            if (!Ext.isEmpty(newFilters) || matched) {
                state.setFilters(state.getFilters().concat(newFilters));

                this.filterMap = {};

                // filters are tracked
                // retrieve the ID of the last filter so we can track it for removal -- addFilter should possibly return this
                this.bindFilters(state.getFilters());
            }
        }
    },

    /**
     * Helper method that first determines if any of the filters in the filterArray are expressed in the filter set.
     * If not, it returns false. If so, then an updated Connector.model.Filter is returned.
     * @param filterArray
     * @param filterSet
     * @returns {boolean || Connector.model.Filter}
     * @private
     */
    _generateMatch : function(filterArray, filterSet) {
        var match = false;

        if (!Ext.isEmpty(filterArray)) {
            var columnMatch = filterArray[0].getColumnName();

            Ext.each(filterSet, function(filter) {
                if (filter.isGrid()) {
                    var newGridFilter = [], found = false, faIdx = 0;
                    Ext.each(filter.get('gridFilter'), function(gf) {
                        if (gf && gf.getColumnName() == columnMatch) {
                            found = true;
                            if (faIdx < filterArray.length) {
                                newGridFilter.push(filterArray[faIdx]);
                                faIdx++;
                            }
                        }
                        else {
                            newGridFilter.push(gf);
                        }
                    });

                    // found a match, now mutate it and return it
                    if (found) {

                        while (faIdx < filterArray.length) {
                            newGridFilter.push(filterArray[faIdx]); faIdx++;
                        }
                        match = filter;
                        match.set('gridFilter', newGridFilter);
                        return false; // break from Ext.each
                    }
                }
            });
        }

        return match;
    },

    buildFilter : function(filterArray) {
        return Ext.create('Connector.model.Filter', {
            hierarchy: 'Subject',
            gridFilter: filterArray,
            operator: LABKEY.app.model.Filter.OperatorTypes.OR,
            isGrid: true,
            filterSource: 'GETDATA',
            isWhereFilter: true
        });
    },

    getFilterId : function(filter) {
        return filter.getURLParameterName() + '=' + filter.getValue();
    },

    hasFilter : function(filter) {
        return this.filterMap[this.getFilterId(filter)];
    },

    addToFilters : function(filter, id) {
        var key = this.getFilterId(filter);
        this.filterMap[key] = id;
    },

    clearFilter : function(urlParam) {
        if (urlParam in this.filterMap) {
            delete this.filterMap[urlParam];
        }
    },

    /**
     * Called when a user clears a filter or all the filters via the grid filtering interface.
     * @param view
     * @param fieldKey
     * @param all
     */
    onGridFilterRemove : function(view, fieldKey, all) {
        var state = Connector.getState();
        Ext.iterate(this.filterMap, function(urlParam, id) {
            state.removeFilter(id, 'Subject');
            if (!all && urlParam.indexOf(fieldKey) > -1) {
                this.clearFilter(urlParam);
            }
        }, this);

        if (all) {
            this.filterMap = {};
        }
    },

    /**
     * Called when measure selection is changed
     * @param selectedMeasures
     * @param allMeasures
     * @param foreignColumns
     */
    onMeasureSelected : function(selectedMeasures, allMeasures, foreignColumns) {
        this.bindMeasures(selectedMeasures, allMeasures, foreignColumns, false);
    },

    /**
     * A method that can be called for a bound view when the view is ready.
     * Normally, this would bind to a 'viewready' or 'boxready' event.
     * @param view
     */
    onViewReady : function(view) {
        this.viewReady = true;
        this._init();
    },

    /**
     * retrieve new column metadata based on the model configuration
     */
    requestMetaData : function() {
        this.metadataTask.delay(50);
    },

    /**
     * Called whenever the query metadata has been changed.
     * @param metadata
     */
    onMetaData : function(metadata) {
        this.set('metadata', metadata);
        this.updateColumnModel();
    },

    updateColumnModel : function() {
        var metadata = this.get('metadata');

        // The new columns will be available on the metadata query/schema
        this.set({
            schemaName: metadata.schemaName,
            queryName: metadata.queryName,
            columnSet: Connector.model.Grid.generateColumnSet(this)
        });

        this.applyFilters(this.get('filterArray'), function() {
            this.initialized = true;

            if (this.isActive()) {
                this.activeColumn = false;
                this.activeFilter = false;
                this.activeMeasure = false;
                this.fireEvent('updatecolumns', this);
            }
            else {
                this.activeColumn = true;
            }
        }, this, true);
    },

    setActive : function(active) {
        this.set('active', active);

        if (active) {
            if (this.activeColumn || this.activeMeasure) {
                if (this.activeMeasure) {
                    this.requestMetaData();
                }
                else {
                    this.updateColumnModel();
                }
            }
            else if (this.activeFilter) {
                this.onAppFilterChange(Connector.getState().getFilters());
            }
        }
    },

    isActive : function() {
        return this.get('active') === true && this.initialized === true;
    }
});
