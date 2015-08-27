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
            endpoint : LABKEY.ActionURL.buildURL("visualization", "getMeasuresStatic"),
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
            var sourceKey = measure.schemaName + '|' + measure.queryName;
            var datas = this.getModelClone(measure, Connector.model.Measure.getFields());

            // overlay any source metadata
            datas = Ext.apply(datas, Connector.measure.Configuration.context.sources[sourceKey]);
            // overlay any measure metadata
            datas = Ext.apply(datas, Connector.measure.Configuration.context.measures[measure.alias]);
            // overlay any dimension metadata (used for Advanced Options panel of Variable Selector)
            datas = Ext.apply(datas, Connector.measure.Configuration.context.dimensions[measure.alias]);

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

            // copy the queryDescription from the measure
            datas.description = measure.queryDescription;

            this.SOURCE_STORE.add(datas);
        }
    },

    getModelClone : function(record, fields) {
        // TODO: Consider using model.copy() instead
        return Ext.copyTo({}, record, Ext.Array.pluck(fields, 'name'))
    },

    getMeasureRecordByAlias : function(alias) {
        if (!this._ready) {
            console.warn('Requested measure before measure caching prepared.');
        }
        return this.MEASURE_STORE.getById(alias);
    },

    /**
     * Returns the raw measure data for the specified measureAlias. If not found, returns undefined.
     * @param measureAlias
     * @returns {*}
     */
    getMeasure : function(measureAlias) {
        if (!this._ready) {
            console.warn('Requested measure before measure caching prepared.');
        }

        // for lookups, just resolve the base column (e.g. study_Nab_Lab/PI becomes study_Nab_Lab)
        var cleanAlias = Ext.clone(measureAlias).split('/')[0];

        if (Ext.isString(cleanAlias) && Ext.isObject(this.getMeasureRecordByAlias(cleanAlias))) {
            return Ext.clone(this.getMeasureRecordByAlias(cleanAlias).getData());
        }

        console.warn('measure cache miss:', measureAlias, 'Resolved as:', cleanAlias);
        return undefined;
    },

    /**
     *  Given a schema this returns all the measures of each query in that schema that are not hidden.
     * @param schema The schema that will be searched.
     * @returns {Array} An array of copies of measure objects.
     */
    getVariables : function(schema) {

        var measures = [],
            _schema = schema.toLowerCase();

        Ext.each(this.MEASURE_STORE.getRange(), function(measure) {
            var schemaName = measure.get('schemaName');
            if (Ext.isString(schemaName) && schemaName.toLowerCase() === _schema && !measure.get('hidden')) {
                measures.push(measure.copy());
            }
        });

        return measures;
    },

    /**
     * This finds all the dimensions for a given schema and query and returns them as an array.
     * @param schema The name of the schema for the query
     * @param query The name of the query of the desired dimensions.
     * @returns {Array} An array of dimension objects
     */
    getDimensions : function(schema, query) {
        var dimensionArray = [],
            index = this.SOURCE_STORE.findExact('key', schema + '|' + query);

        if (index > -1) {
            var source = this.SOURCE_STORE.getAt(index),
                dimensions = source.get('dimensions');

            Ext.each(dimensions, function(dimension) {
                var d = this.getMeasure(dimension);
                if (d.isDimension && !d.hidden) {
                    dimensionArray.push(d);
                }
            }, this);
        }

        return dimensionArray;
    },

    /**
     * Returns the array of distinct rows for the measure set combination. The results are cached for the measure set using a key derived from the measure's aliases.
     * @param {Array} measureSet Array of measures to use in the SELECT DISTINCT query. It is expected that they are all from the same schema/query.
     * @param {Function} callback
     * @param {Object} [scope]
     * @returns {Array}
     */
    getMeasureSetDistinctValues : function(measureSet, callback, scope) {
        if (Ext.isDefined(measureSet))
        {
            if (!Ext.isArray(measureSet)) {
                measureSet = [measureSet];
            }

            // get the distinct values from the cache, by concatenating the measure set aliases, or query for the distinct values
            var key = Ext.Array.pluck(Ext.Array.pluck(measureSet, 'data'), 'alias').join('|');
            var cachedValues = this.MEASURE_DISTINCT_VALUES[key];
            if (Ext.isDefined(cachedValues))
            {
                if (Ext.isFunction(callback)) {
                    callback.call(scope || this, cachedValues);
                }
            }
            else
            {
                var columnNames = '', columnSep = '';
                Ext.each(measureSet, function(measure) {
                    columnNames += columnSep + measure.get('name') + ' AS ' + measure.get('alias');
                    columnSep = ', ';
                });

                LABKEY.Query.executeSql({
                    schemaName: measureSet[0].get('schemaName'),
                    sql: 'SELECT DISTINCT ' + columnNames + ' FROM ' + measureSet[0].get('queryName'),
                    scope: this,
                    success: function(data) {
                        // cache the distinct values array result
                        this.MEASURE_DISTINCT_VALUES[key] = data.rows;

                        if (Ext.isFunction(callback)) {
                            callback.call(scope || this, data.rows);
                        }
                    }
                });
            }
        }
    },

    /**
     * Use the cdsGetData API call with a set of measures and filters (SubjectIn and data filters) to create a temp query to use
     *      for showing which values are relevant in the variable selector Advanced Options panels.
     * @param {Object} dimension
     * @param {Array} measureSet
     * @param {Array} filterValuesMap
     * @param {Function} callback
     * @param {Object} [scope]
     * @returns {Object}
     */
    getMeasureSetGetDataResponse : function(dimension, measureSet, filterValuesMap, callback, scope) {
        var subjectMeasure, wrappedMeasureSet = [], aliases = [],
            measureData, filterMeasures, index, filterMeasureRecord, alias;

        if (Ext.isDefined(measureSet))
        {
            if (!Ext.isArray(measureSet)) {
                measureSet = [measureSet];
            }

            // get the cube subjectList so that we can filter the advanced option values accordingly
            ChartUtils.getSubjectsIn(function(subjectList) {
                subjectMeasure = new LABKEY.Query.Visualization.Measure({
                    schemaName: dimension.get('schemaName'),
                    queryName: dimension.get('queryName'),
                    name: Connector.studyContext.subjectColumn,
                    values: subjectList
                });

                aliases.push(Connector.studyContext.subjectColumn);
                wrappedMeasureSet.push({measure: subjectMeasure});

                Ext.each(measureSet, function(measure) {
                    measureData = Ext.clone(measure.data);
                    if (Ext.isArray(filterValuesMap[measure.get('alias')])) {
                        measureData.values = filterValuesMap[measure.get('alias')];
                    }

                    aliases.push(measure.get('alias'));
                    wrappedMeasureSet.push({measure: measureData});
                });

                // get the relevant application filters to add to the measure set
                filterMeasures = this.getWhereFilterMeasures(Connector.getState().getFilters());
                Ext.each(filterMeasures, function(filterMeasure) {

                    // a filter is only relevant to a dimension if it is from the same query or is from a demographic dataset
                    if (filterMeasure.measure.isDemographic ||
                        (dimension.get('schemaName') == filterMeasure.measure.schemaName && dimension.get('queryName') == filterMeasure.measure.queryName)) {

                        alias = LABKEY.MeasureUtil.getAlias(filterMeasure.measure);
                        index = aliases.indexOf(alias);

                        // if we already have this measure in our set, then just tack on the filterArray
                        if (index > -1) {
                            wrappedMeasureSet[index].filterArray = filterMeasure.filterArray;
                        }
                        else {
                            filterMeasureRecord = this.getMeasureRecordByAlias(alias);
                            if (Ext.isDefined(filterMeasureRecord)) {
                                wrappedMeasureSet.push({
                                    filterArray: filterMeasure.filterArray,
                                    measure: Ext.clone(filterMeasureRecord.data)
                                });
                            }
                        }
                    }
                }, this);

                LABKEY.Query.Visualization.getData({
                    measures: wrappedMeasureSet,
                    metaDataOnly: true,
                    endpoint: LABKEY.ActionURL.buildURL('visualization', 'cdsGetData.api'),
                    scope: this,
                    success: function(response) {
                        if (Ext.isFunction(callback)) {
                            callback.call(scope || this, response);
                        }
                    }
                });
            }, this);
        }
    },

    /**
     * Use the cdsGetData API call with a set of measures and filters (SubjectIn and data filters) to create a temp query to use
     *      for showing which values are relevant in the variable selector Advanced Options panels by returning the subject
     *      count for each distinct value of a specific column in the temp query.
     * @param {Object} dimension
     * @param {Array} measureSet
     * @param {Array} filterValuesMap
     * @param {Function} callback
     * @param {Object} [scope]
     * @returns {Object}
     */
    getMeasureValueSubjectCount : function(dimension, measureSet, filterValuesMap, callback, scope) {

        // get the temp query information from the cdsGetData API call for the measureSet with the application filters added in
        this.getMeasureSetGetDataResponse(dimension, measureSet, filterValuesMap, function(response) {
            var alias = dimension.getFilterMeasure().get('alias'), sql;

            // SQL to get the subject count for each value of the filter measure
            sql = 'SELECT COUNT(DISTINCT ' + dimension.get('schemaName') + '_' + dimension.get('queryName') + '_SubjectId) AS SubjectCount, '
                    + alias + ' FROM ' + response.queryName
                    + dimension.getDistinctValueWhereClause()
                    + ' GROUP BY ' + alias;

            LABKEY.Query.executeSql({
                schemaName: response.schemaName,
                sql: sql,
                success: function(data) {
                    var subjectCountMap = {};
                    Ext.each(data.rows, function(row){
                        subjectCountMap[row[alias]] = row['SubjectCount'];
                    }, this);

                    if (Ext.isFunction(callback)) {
                        callback.call(scope || this, subjectCountMap);
                    }
                },
                scope: this
            })
        }, this);
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

            // The userFilter is a function used to further filter down the available measures.
            // Needed so the color picker only displays categorical measures.
            var userFilterMatch = !Ext4.isFunction(config.userFilter) || config.userFilter(record.data);

            if ((queryTypeMatch || timepointMatch) && measureOnlyMatch && hiddenMatch && notSubjectColMatch && userFilterMatch)
            {
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

    getMeasureStore : function(measures, success, failure, scope) {
        LABKEY.Query.experimental.MeasureStore.getData({
            measures: measures,
            endpoint: LABKEY.ActionURL.buildURL('visualization', 'cdsGetData.api'),
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
     * Given a set of LABKEY.app.model.Filter filters this method will return the set of measures that are used
     * in plot brushing filters.
     * @param includeAxisFilters
     */
    getPlotBrushFilterMeasures : function(includeAxisFilters) {
        var measures = [], filters = Connector.getState().getFilters();

        Ext.each(filters, function(filter) {
            if (filter.get('isPlot') === true && filter.get('isWhereFilter') === true) {
                var ms = this._getMeasures(filter.data, true /* measure.filterArray is array of LABKEY.Filter */);
                Ext.each(ms, function(m) {
                    if (includeAxisFilters || Ext.isArray(m.filterArray)) {
                        measures.push(m);
                    }
                });
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

                        // plotMeasures can have 'Advanced Options' (i.e. axis filters) which need to be added to the measure set
                        Ext.each(Connector.model.Measure.getPlotAxisFilterMeasureRecords(plotMeasure.measure), function(axisFilterRecord) {
                            measureMap[LABKEY.MeasureUtil.getAlias(axisFilterRecord)] = {
                                measure: axisFilterRecord,
                                filterArray: []
                            };
                        }, this);
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
                            var schema = measure.schemaName,
                                query = measure.queryName,
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
                measure: this.cleanMeasure(config.measure)
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

    clearSourceCountsCache : function() {
        this.SOURCE_COUNTS = undefined;
    },

    getSourceCounts : function(sourceModels, callback, scope, membersFn, membersFnScope) {

        if (Ext.isFunction(callback)) {

            var makeRequest = function(members) {
                // we cache the source count results so they can share between variable sectors
                if (Ext.isDefined(this.SOURCE_COUNTS)) {
                    callback.call(scope || this, sourceModels, this.SOURCE_COUNTS);
                    return;
                }

                var json = {
                    schema: Connector.studyContext.schemaName,
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
                        this.SOURCE_COUNTS = Ext.decode(response.responseText).counts;
                        callback.call(scope || this, sourceModels, this.SOURCE_COUNTS);
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
    },

    /**
     * Takes in a set of measures and groups them according to alias. It will merge the filters and
     * retain any other properties from the first instance of an alias found.
     * @param measures
     * @returns {Array}
     */
    mergeMeasures : function(measures) {
        var merged = [], keyOrder = [], aliases = {}, alias;

        Ext.each(measures, function(measure) {
            alias = measure.measure.alias || LABKEY.MeasureUtil.getAlias(measure.measure);
            if (!aliases[alias]) {
                aliases[alias] = measure;
                keyOrder.push(alias);
            }
            else {
                if (!Ext.isEmpty(measure.filterArray)) {

                    if (!Ext.isArray(aliases[alias].filterArray)) {
                        aliases[alias].filterArray = [];
                    }

                    aliases[alias].filterArray = aliases[alias].filterArray.concat(measure.filterArray);
                    aliases[alias].measure.hasFilters = true;
                }
            }
        });

        Ext.each(keyOrder, function(key) {
            merged.push(aliases[key]);
        });

        return merged;
    }
});

Ext.define('Connector.controller.HttpInterceptor', {
    extend: 'LABKEY.app.controller.HttpInterceptor'
});

Ext.define('Connector.controller.Messaging', {
    extend: 'LABKEY.app.controller.Messaging'
});
