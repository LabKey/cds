/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Query', {

    extend: 'Ext.app.Controller',

    isService: true,

    _ready: false,

    init : function() {

        LABKEY.app.model.Filter.registerDataFilterProvider(this.getDataFilter, this);

        if (LABKEY.devMode) {
            QUERY = this;
        }

        if (LABKEY.user.isSignedIn) {
            this._initMeasures();
        }
    },

    _initMeasures : function() {
        if (!this.MEASURE_STORE) {
            this.MEASURE_STORE = Ext.create('Ext.data.Store', {model: 'Connector.model.Measure'});
        }

        if (!this.SOURCE_STORE) {
            this.SOURCE_STORE = Ext.create('Ext.data.Store', {model: 'Connector.model.Source'});
        }

        // map to cache the distinct values array for a measure alias
        if (!this.MEASURE_DISTINCT_VALUES) {
            this.MEASURE_DISTINCT_VALUES = {};
        }

        var cacheReady = false;
        var gridMeasuresReady = false;

        var doReady = function() {
            if (cacheReady && gridMeasuresReady) {
                this._ready = true;
                this.application.fireEvent('queryready', this);
            }
        };

        // Get all the study columns (including non-measures, weird, I know. Right?)
        LABKEY.Query.Visualization.getMeasures({
            allColumns: true,
            showHidden: true,
            filters: [LABKEY.Query.Visualization.Filter.create({
                schemaName: Connector.studyContext.schemaName,
                queryType: LABKEY.Query.Visualization.Filter.QueryType.ALL
            })],
            success: function(measures) {
                // add all of the response measures to the cached store
                Ext.each(measures, function(measure) {
                    this.addMeasure(measure);
                }, this);

                // bootstrap client-defined measures
                var measureContext = Connector.measure.Configuration.context.measures;
                Ext.iterate(measureContext, function(alias, measure) {
                    measure.alias = alias;
                    this.addMeasure(new LABKEY.Query.Visualization.Measure(measure));
                }, this);

                cacheReady = true;
                doReady.call(this);
            },
            scope: this
        });

        // Get the default set of grid columns ready
        this.getDefaultGridMeasures(function() {
            gridMeasuresReady = true;
            doReady.call(this);
        }, this);
    },

    _gridMeasures : undefined,

    onQueryReady : function(callback, scope) {
        if (Ext.isFunction(callback)) {
            if (this._ready === true) {
                callback.call(scope, this);
            }
            else {
                this.application.on('queryready', function() {
                    callback.call(scope, this);
                }, this, {single: true});
            }
        }
    },

    // This supplies the set of default columns available in the grid
    // to the provided callback as an array of Measure descriptors
    getDefaultGridMeasures : function(callback, scope) {
        if (!Ext.isDefined(this._gridMeasures)) {

            //
            // request the appropriate query details
            //
            LABKEY.Query.getQueryDetails({
                schemaName: Connector.studyContext.schemaName,
                queryName: Connector.studyContext.subjectVisit,
                fields: [
                    Connector.studyContext.subjectColumn,
                    Connector.studyContext.subjectColumn + '/Study',
                    Connector.studyContext.subjectColumn + '/Study/Label',
                    'Visit',
                    'Visit/Label'
                ],
                success : function(queryDetails) {
                    var columns = queryDetails.columns;
                    this._gridMeasures = [undefined, undefined, undefined]; // order matters

                    function mockUpMeasure(measure) {
                        Ext.apply(measure, {
                            schemaName: Connector.studyContext.schemaName,
                            queryName: Connector.studyContext.subjectVisit
                        });

                        // Add these into the MEASURE_STORE
                        measure['alias'] = LABKEY.MeasureUtil.getAlias(measure);
                        measure['variableType'] = 'GRID_DEFAULT';
                        this.addMeasure(new LABKEY.Query.Visualization.Measure(measure));
                    }

                    Ext.each(columns, function(col) {
                        if (col.name === Connector.studyContext.subjectColumn) {
                            this._gridMeasures[0] = col;
                        }
                        else if (col.name === Connector.studyContext.subjectColumn + '/Study') {
                            this._gridMeasures[1] = col;
                        }
                        else if (col.name === Connector.studyContext.subjectColumn + '/Study/Label') {
                            mockUpMeasure.call(this, col);
                        }
                        else if (col.name === 'Visit') {
                            this._gridMeasures[2] = col;
                        }
                    }, this);

                    Ext.each(this._gridMeasures, function(measure) {
                        mockUpMeasure.call(this, measure);
                    }, this);

                    if (Ext.isFunction(callback)) {
                        callback.call(scope, this._gridMeasures);
                    }
                },
                scope: this
            });
        }
        else {
            if (Ext.isFunction(callback)) {
                callback.call(scope, this._gridMeasures);
            }
        }
    },

    getTimeAliases : function() {
        if (!this.timeAliases) {
            this.timeAliases = {'Days': 1, 'Weeks': 1, 'Months': 1}
        }
        return this.timeAliases;
    },

    addMeasure : function(measure) {
        if (!Ext.isObject(this.MEASURE_STORE.getById(measure.alias))) {
            // overlay any measure metadata
            var datas = this.getModelClone(measure, Connector.model.Measure.getFields());
            datas = Ext.apply(datas, Connector.measure.Configuration.context.measures[measure.alias]);

            // overlay any dimension metadata (used for Advanced Options panel of Variable Selector)
            if (measure.isDimension === true) {
                datas = Ext.apply(datas, Connector.measure.Configuration.context.dimensions[measure.alias]);
            }

            this.MEASURE_STORE.add(datas);
            this.addSource(datas);
        }
    },

    addSource : function(measure) {
        var key = measure.schemaName + '|' + measure.queryName;
        if (!Ext.isObject(this.SOURCE_STORE.getById(key))) {
            // overlay any source metadata
            var datas = this.getModelClone(measure, Connector.model.Source.getFields());
            datas = Ext.apply(datas, Connector.measure.Configuration.context.sources[key]);
            datas.key = key;

            this.SOURCE_STORE.add(datas);
        }
    },

    getModelClone : function(record, fields) {
        return Ext.copyTo({}, record, Ext.Array.pluck(fields, 'name'))
    },

    getMeasureRecordByAlias : function(alias) {
        if (!this._ready) {
            console.warn('Requested measure before measure caching prepared.');
        }
        return this.MEASURE_STORE.getById(alias);
    },

    getMeasure : function(measureAlias) {
        if (!this._ready) {
            console.warn('Requested measure before measure caching prepared.');
        }

        // for lookups, just resolve the base column (e.g. study_Nab_Lab/PI becomes study_Nab_Lab)
        var cleanAlias = Ext.clone(measureAlias).split('/')[0];

        if (Ext.isString(cleanAlias) && Ext.isObject(this.getMeasureRecordByAlias(cleanAlias))) {
            return Ext.clone(this.getMeasureRecordByAlias(cleanAlias).raw);
        }

        console.warn('measure cache miss:', measureAlias, 'Resolved as:', cleanAlias);
        return null;
    },

    getMeasureDistinctValues : function(measure, callback, scope) {
        if (measure)
        {
            // get the distinct values from the cache, by measure alias, or query for the distinct values
            var cachedValues = this.MEASURE_DISTINCT_VALUES[measure.get('alias')];
            if (Ext.isDefined(cachedValues))
            {
                if (Ext.isFunction(callback)) {
                    callback.call(scope || this, cachedValues);
                }
            }
            else
            {
                LABKEY.Query.selectDistinctRows({
                    schemaName: measure.get('schemaName'),
                    queryName: measure.get('queryName'),
                    column: measure.get('name'),
                    filterArray: [LABKEY.Filter.create(measure.get('name'), null, LABKEY.Filter.Types.NOT_MISSING)],
                    scope: this,
                    success: function(data) {
                        // cache the distinct values array result by measure alias
                        this.MEASURE_DISTINCT_VALUES[measure.get('alias')] = data.values;

                        if (Ext.isFunction(callback)) {
                            callback.call(scope || this, data.values);
                        }
                    }
                });
            }
        }
    },

    /**
     * Returns an array of measure objects from the cached store data that match the filters based on the config parameters.
     * @param config An object which contains the following filterable properties.
     * @param {String} config.queryType Filter for a specific queryType (i.e. DATASET)
     * @param {Boolean} config.measuresOnly Whether or not to filter the measure objects to just those specifically declared as "measures" in the ColumnInfo
     * @param {Boolean} config.includeTimpointMeasures Whether or not to include the timepoint/group measures
     * @param {Boolean} config.includeHidden Whether or not the include hidden columns
     */
    getMeasuresStoreData : function(config) {
        if (!this._ready) {
            console.warn('Requested measure store data before measure caching prepared.');
        }

        var sources = {}, sourceArray = [];
        var measures = [];

        Ext.each(this.MEASURE_STORE.getRange(), function(record) {
            var queryTypeMatch = !config.queryType || record.get('queryType') == config.queryType;
            var measureOnlyMatch = !config.measuresOnly || record.get('isMeasure');
            var timepointMatch = config.includeTimpointMeasures && (record.get('variableType') == 'TIME' || record.get('variableType') == 'USER_GROUPS');
            var hiddenMatch = config.includeHidden || !record.get('hidden');
            var notSubjectColMatch = record.get('name') != Connector.studyContext.subjectColumn;

            if ((queryTypeMatch || timepointMatch) && measureOnlyMatch && hiddenMatch && notSubjectColMatch) {
                measures.push(Ext.clone(record.raw));

                var key = record.get('schemaName') + '|' + record.get('queryName');
                var source = this.SOURCE_STORE.getById(key);

                if (!sources[key] && source) {
                    sources[key] = true;
                    sourceArray.push(Ext.clone(source.data));
                }
                else if (!source) {
                    throw 'Unable to find source for \'' + key + '\'';
                }
            }
        }, this);

        return {
            sources: sourceArray,
            measures: measures
        };
    },

    getDataSorts : function() {
        if (!this._dataSorts) {
            this._dataSorts = [{
                name: 'Container',
                schemaName: Connector.studyContext.schemaName,
                queryName: Connector.studyContext.subjectVisit
            },{
                name: Connector.studyContext.subjectColumn,
                schemaName: Connector.studyContext.schemaName,
                queryName: Connector.studyContext.subjectVisit
            },{
                name: 'Day',
                schemaName: Connector.studyContext.schemaName,
                queryName: Connector.studyContext.subjectVisit
            }];
        }

        return this._dataSorts;
    },

    getDefaultMeasure : function(callback, scope) {
        if (Ext.isFunction(callback)) {
            this.onQueryReady(function() {
                this.getDefaultGridMeasures(function(measures) {
                    callback.call(scope || this, measures[0]);
                }, this);
            }, this);
        }
        else {
            console.error('ERROR: ' + this.$className + '.getDefaultMeasure() requires a callback be provided.');
        }
    },

    getData : function(measures, success, failure, scope) {

        LABKEY.Query.Visualization.getData({
            measures: measures,
            sorts: this.getDataSorts(),
            metaDataOnly: true,
            joinToFirst: true,
            success: success,
            failure: failure,
            scope: scope
        });

    },

    /**
     * Get a LABKEY.Query.Visualization.getData configuration back based on the LABKEY.app.model.Filter given.
     * @param filterConfig The object which will be added as a COUNT/WHERE filter.
     * @param appFilter {LABKEY.app.model.Filter} or an appFilterData
     * @returns LABKEY.Query.Visualization.getData configuration
     */
    getDataFilter : function(filterConfig, appFilter) {

        if (!Ext.isDefined(this._gridMeasures)) {
            console.error('called getDataFilter() too early. Unable to determine base measure');
        }

        var getDataConfig = {
            joinToFirst: true,
            measures: [{
                measure: this.cleanMeasure(this._gridMeasures[0]),
                time: 'date'
            }],
            sorts: this.getDataSorts()
        };

        // for each gridFilter, match it to a measure that will be used in the getData configuration
        var dataConfig = Ext.isDefined(appFilter.data) ? appFilter.data : appFilter;
        var measures = this._getMeasures(dataConfig, false /* measure.filterArray is an array of query strings */);

        Ext.each(measures, function(measure) {
            getDataConfig.measures.push(measure);
        });

        filterConfig.getData = getDataConfig;
        filterConfig.level = '[Subject].[Subject]'; // TODO: Retrieve from application metadata (cube.js)

        return filterConfig;
    },

    /**
     * Given a set of LABKEY.app.model.Filter filters this method will return the set of measures that are used
     * in all whereFilters with the appropriate configuration.
     * @param filters
     */
    getWhereFilterMeasures : function(filters) {
        var measures = [];

        Ext.each(filters, function(filter) {
            if (filter.get('isWhereFilter') === true) {
                var ms = this._getMeasures(filter.data, true /* measure.filterArray is array of LABKEY.Filter */);
                Ext.each(ms, function(m) { measures.push(m); });
            }
        }, this);

        return measures;
    },

    /**
     * Returns a set of measures based on an array of gridFilters (a.k.a. LABKEY.Filter objects)
     * @param filterConfig
     * @param filtersAreInstances
     * @returns {Array}
     * @private
     */
    _getMeasures : function(filterConfig, filtersAreInstances) {
        var measures = [], measureMap = {};

        if (filterConfig.isPlot === true) {
            // use the plotMeasures to determine the measure set
            Ext.each(filterConfig.plotMeasures, function(plotMeasure) {
                if (plotMeasure) {
                    var measure = this.getMeasure(plotMeasure.measure.alias);
                    if (measure) {

                        // we still respect the value if it is set explicitly on the measure
                        if (!Ext.isDefined(measure.inNotNullSet)) {
                            measure.inNotNullSet = Connector.model.ChartData.isContinuousMeasure(measure);
                        }

                        measureMap[measure.alias] = {
                            measure: measure,
                            filterArray: []
                        };

                        if (plotMeasure.time) {
                            measureMap[measure.alias].time = plotMeasure.time;
                        }
                        if (plotMeasure.dimension) {
                            measureMap[measure.alias].dimension = plotMeasure.dimension;
                        }
                        if (plotMeasure.dateOptions) {
                            measureMap[measure.alias].dateOptions = plotMeasure.dateOptions;
                        }
                    }

                    // issue 21601: include the measure's antigen selection
                    if (plotMeasure.measure.options && plotMeasure.measure.options.antigen) {
                        var antigenMeasure = this.getMeasure(Connector.model.Antigen.getAntigenAlias(plotMeasure.measure));
                        if (antigenMeasure) {
                            antigenMeasure.values = plotMeasure.measure.options.antigen.values;
                            measureMap[antigenMeasure.alias] = {
                                measure: antigenMeasure,
                                filterArray: []
                            };
                        }
                    }
                }
            }, this);
        }

        // look at the grid filters to determine measure set
        if (!Ext.isEmpty(filterConfig.gridFilter)) {
            var gridFilters = filterConfig.gridFilter, columnName, measure, stringFilter;

            for (var g=0; g < gridFilters.length; g++) {
                var gf = gridFilters[g];
                // At times the filter can be null/undefined (e.g. when the plot specifies x-axis filters only)
                if (gf && gf !== "_null") {

                    if (Ext.isString(gf)) {
                        gf = LABKEY.Filter.getFiltersFromUrl(gf, 'query')[0];
                    }

                    columnName = gf.getColumnName();
                    measure = this.getMeasure(columnName);
                    if (measure) {

                        var filterOnLookup = columnName.indexOf('/') > -1;

                        // process the filter itself, if it is a lookup then we just include it directly
                        if (filterOnLookup) {
                            // here we fake up a measure. The getData API accepts filters of the form
                            // "study_Nab_Lab/PI" as "Lab.PI"
                            var schema = measure.getSchemaName(),
                                query = measure.getQueryName(),
                                alias = columnName.replace(/\//g, '_');

                            // This avoids schemas/queries that have '_' in them
                            var columnNamePortion = columnName.replace([schema, query].join('_'), '');
                            if (columnNamePortion.indexOf('_') === 0) {
                                columnNamePortion = columnNamePortion.substring(1);
                            }

                            var parts = columnNamePortion.replace(/\//g, '.').split('_'),
                                safeColName;

                            // ["study", "SubjectVisit", "SubjectId", "Study/Label"] --> "SubjectId/Study/Label"
                            if (parts.length > 1) {
                                safeColName = parts.join('/');
                            }
                            else {
                                safeColName = parts[parts.length-1];
                            }

                            var nf = LABKEY.Filter.create(safeColName.replace(/\./g, '/'), gf.getValue(), gf.getFilterType());

                            if (!measureMap[alias]) {
                                measureMap[alias] = {
                                    measure: {
                                        alias: alias,
                                        schemaName: schema,
                                        queryName: query,
                                        name: safeColName,
                                        inNotNullSet: true // unfortunately, we don't know much about the lookup type
                                    },
                                    filterArray: []
                                };
                            }

                            if (nf.getFilterType().getURLSuffix() === LABKEY.Filter.Types.ISBLANK.getURLSuffix()) {
                                measureMap[alias].measure.inNotNullSet = false;
                            }

                            var nfString = nf.getURLParameterName() + '=' + nf.getURLParameterValue();
                            measureMap[alias].filterArray.push(filtersAreInstances ? nf : nfString);
                        }
                        else {

                            var isTimeBased = measure.alias in this.getTimeAliases();

                            if (!measureMap[measure.alias]) {

                                // we still respect the value if it is set explicitly on the measure
                                if (!Ext.isDefined(measure.inNotNullSet)) {
                                    measure.inNotNullSet = Connector.model.ChartData.isContinuousMeasure(measure);
                                }

                                measureMap[measure.alias] = {
                                    measure: measure,
                                    filterArray: []
                                };

                                if (isTimeBased) {
                                    measureMap[measure.alias].dateOptions = {
                                        interval: measure.alias,
                                        zeroDayVisitTag: null
                                    };
                                }
                            }

                            if (gf.getFilterType().getURLSuffix() === LABKEY.Filter.Types.ISBLANK.getURLSuffix()) {
                                measureMap[measure.alias].measure.inNotNullSet = false;
                            }

                            if (columnName === measure.name || isTimeBased) {
                                stringFilter = gf.getURLParameterName() + '=' + gf.getURLParameterValue();
                                measureMap[measure.alias].filterArray.push(filtersAreInstances ? gf : stringFilter);
                            }
                            else {
                                // create a filter with the measure 'name' rather than the 'alias' as the column
                                var _gf = LABKEY.Filter.create(measure.name, gf.getValue(), gf.getFilterType());
                                stringFilter = _gf.getURLParameterName() + '=' + _gf.getURLParameterValue();
                                measureMap[measure.alias].filterArray.push(filtersAreInstances ? _gf : stringFilter);
                            }
                        }
                    }
                    else {
                        console.warn('Unable to find measure for query parameter:', gf.getURLParameterName() + '=' + gf.getURLParameterValue());
                    }
                }
            }
        }

        Ext.iterate(measureMap, function (alias, config) {
            var mc = {
                measure: this.cleanMeasure(config.measure),
                time: config.time || 'date'
            };
            if (config.dimension) {
                mc.dimension = config.dimension;
            }
            if (config.dateOptions) {
                mc.dateOptions = config.dateOptions;
            }
            if (config.filterArray.length > 0) {
                mc.filterArray = config.filterArray;
            }

            measures.push(mc);
        }, this);

        return measures;
    },

    /**
     * The exclusive set of measure properties that will be sent across the wire
     */
    MEASURE_PROPERTIES: 'aggregate,alias,allowNullResults,defaultScale,inNotNullSet,isDemographic,name,queryName,requireLeftJoin,schemaName,values',

    cleanMeasure : function(measure) {
        return Ext.copyTo({}, measure, this.MEASURE_PROPERTIES)
    },

    getSourceCounts : function(sourceModels, callback, scope, membersFn, membersFnScope) {

        if (Ext.isFunction(callback)) {

            var makeRequest = function(members) {

                var json = {
                    schema: Connector.studyContext.schemaName,
                    //colName: undefined,
                    members: Ext.isArray(members) ? members : undefined,
                    sources: []
                };

                Ext.each(sourceModels, function(source) {
                    json.sources.push(source.get('queryName'));
                });

                Ext.Ajax.request({
                    url: LABKEY.ActionURL.buildURL('visualization', 'getSourceCounts.api'),
                    method: 'POST',
                    jsonData: json,
                    success: function(response) {
                        var counts = Ext.decode(response.responseText).counts;
                        callback.call(scope || this, sourceModels, counts);
                    },
                    scope: this
                });
            };

            if (Ext.isFunction(membersFn)) {
                membersFn.call(membersFnScope, makeRequest, this);
            }
            else {
                makeRequest();
            }
        }
    },

    /**
     * Retrieves the selectDistinct API results for a given data dimension
     * for the given set of filters.
     * @param measure - string (alias)|measure
     * @param filterSet
     * @param callback
     * @param scope
     */
    getDimensionData : function(measure, filterSet, callback, scope) {
        if (Ext.isFunction(callback)) {
            this.onQueryReady(function() {
                if (Ext.isString(measure)) {
                    measure = this.getMeasure(measure);
                }

                if (measure) {

                    var distinct = {
                        schemaName: measure.schemaName,
                        queryName: measure.queryName,
                        column: measure.name,
                        success: function(data) {
                            callback.call(scope, data.values);
                        },
                        failure: function() {
                            callback.call(scope, []);
                        }
                    };

                    if (Ext.isArray(filterSet) && !Ext.isEmpty(filterSet)) {
                        distinct.filterArray = filterSet;
                    }

                    LABKEY.Query.selectDistinctRows(distinct);
                }
                else {
                    callback.call(scope, []);
                }
            }, this);
        }
    }
});

Ext.define('Connector.controller.HttpInterceptor', {
    extend: 'LABKEY.app.controller.HttpInterceptor'
});

Ext.define('Connector.controller.Messaging', {
    extend: 'LABKEY.app.controller.Messaging'
});
