/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

(function(){

// private variables/constants

var SUBJECTVISIT_TABLE = "study.gridbase";
var DATASET_ALIAS = "http://cpas.labkey.com/Study#Dataset";
var SUBJECT_ALIAS = "http://cpas.labkey.com/Study#ParticipantId";
var SEQUENCENUM_ALIAS = "http://cpas.labkey.com/Study#SequenceNum";
var CONTAINER_ALIAS = "http://cpas.labkey.com/Study#Container";

function _toSqlNumber(v)
{
    if (!Ext4.isDefined(v) || null === v)
        return "NULL";
    if (Ext4.isNumber(v))
        return "" + v;
    if (Ext4.isNumeric(v))
    {
        var number = new Number(v);
        if (!isNaN(number))
            return number.toString();
    }
    if (Ext4.isString(v))
        return LABKEY.Query.sqlStringLiteral(v);
    if (Ext4.isDate(v))
        return LABKEY.Query.sqlDatetimeLiteral(v);
    throw "unsupported constant: " + v;
};

var _toSqlString = LABKEY.Query.sqlStringLiteral;

var _toSqlDateTime = LABKEY.Query.sqlDatetimeLiteral;

function _toSqlLiteral(v)
{
    if (!Ext4.isDefined(v) || null === v)
        return "NULL";
    if (Ext4.isNumber(v))
        return "" + v;
    if (Ext4.isString(v))
        return _toSqlString(v);
    if (Ext4.isDate(v))
        return _toSqlDateTime(v);
    throw "unsupported constant: " + v;
}


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

    getSubjectColumnAlias : function() {
        return this.getGridBaseColumnAlias('SubjectId');
    },

    getGridBaseColumnAlias : function(colName) {
        return Connector.studyContext.gridBaseSchema + '_' + Connector.studyContext.gridBase + '_' + colName;
    },

    /**
     *
     * @param {boolean} [asArray=false]
     */
    getDefaultGridAliases : function(asArray) {

        var keys = [
            this.getSubjectColumnAlias(),
            this.getGridBaseColumnAlias('Study'),
            this.getGridBaseColumnAlias('TreatmentSummary'),
            this.getGridBaseColumnAlias('SubjectVisit')
        ];

        var result;
        if (asArray === true) {
            result = keys;
        }
        else {
            result = {};
            for (var i=0; i < keys.length; i++) {
                result[keys[i]] = i+1; // position 1-based for truthy
            }
        }

        return result;
    },

    // This supplies the set of default columns available in the grid
    // to the provided callback as an array of Measure descriptors
    getDefaultGridMeasures : function(callback, scope) {
        if (!Ext.isDefined(this._gridMeasures)) {

            this._gridMeasures = [];

            var schema = Connector.studyContext.gridBaseSchema,
                query = Connector.studyContext.gridBase,
                defaultAliases = this.getDefaultGridAliases();

            //
            // request the appropriate query details
            //
            LABKEY.Query.getQueryDetails({
                schemaName: schema,
                queryName: query,
                success : function(queryDetails) {
                    var columns = queryDetails.defaultView.columns,
                        me = this;

                    function mockUpMeasure(measure) {
                        Ext.apply(measure, {
                            schemaName: schema,
                            queryName: query
                        });

                        // Add these into the MEASURE_STORE
                        measure.alias = LABKEY.MeasureUtil.getAlias(measure);
                        measure.variableType = 'GRID_DEFAULT';

                        if (measure.alias in defaultAliases) {
                            var m = new LABKEY.Query.Visualization.Measure(measure);
                            me.addMeasure(m);
                            return m;
                        }
                    }

                    Ext.each(columns, function(col) {
                        var visMeasure = mockUpMeasure.call(this, col);

                        if (visMeasure && visMeasure.hidden !== true) {
                            this._gridMeasures.push(col);
                        }

                    }, this);

                    if (Ext.isFunction(callback)) {
                        callback.call(scope, me._gridMeasures);
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
        if (!Ext.isObject(this.MEASURE_STORE.getById(measure.alias.toLowerCase()))) {
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
        return this.MEASURE_STORE.getById(alias.toLowerCase());
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
            measureData, filterMeasures, index, filterMeasureRecord, alias,
            dimQueryKey = dimension.get('schemaName') + '|' + dimension.get('queryName');

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
                // (i.e. if it is from the same query or is from a demographic dataset)
                filterMeasures = this.getWhereFilterMeasures(Connector.getState().getFilters(), true, [dimQueryKey]);
                Ext.each(filterMeasures, function(filterMeasure) {
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
                }, this);

                this._LABKEY_Query_Visualization_getData({
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
     * @param {Boolean} config.includeVirtualSources Whether or not the include sources defined as variableType VIRTUAL
     * @param {Boolean} config.includeDefinedMeasureSources Include sources defined as variableType DEFINED_MEASURES
     */
    getMeasuresStoreData : function(config) {
        if (!this._ready) {
            console.warn('Requested measure store data before measure caching prepared.');
        }

        var sources = {}, sourceArray = [], measures = {}, measureArray = [],
            queryTypeMatch, measureOnlyMatch, timepointMatch,
            hiddenMatch, notSubjectColMatch, userFilterMatch,
            key, source, sourceContextMap = Connector.measure.Configuration.context.sources;

        Ext.each(this.MEASURE_STORE.getRange(), function(record) {
            queryTypeMatch = !config.queryType || record.get('queryType') == config.queryType;
            measureOnlyMatch = !config.measuresOnly || record.get('isMeasure');
            timepointMatch = config.includeTimpointMeasures && (record.get('variableType') == 'TIME' || record.get('variableType') == 'USER_GROUPS');
            hiddenMatch = config.includeHidden || !record.get('hidden');
            notSubjectColMatch = record.get('name') != Connector.studyContext.subjectColumn;

            // The userFilter is a function used to further filter down the available measures.
            // Needed so the color picker only displays categorical measures.
            userFilterMatch = !Ext.isFunction(config.userFilter) || config.userFilter(record.data);

            if ((queryTypeMatch || timepointMatch) && measureOnlyMatch && hiddenMatch && notSubjectColMatch && userFilterMatch)
            {
                measures[record.get('alias')] = true;
                measureArray.push(Ext.clone(record.raw));

                key = record.get('schemaName') + '|' + record.get('queryName');
                source = this.SOURCE_STORE.getById(key);

                if (!sources[key] && source) {
                    sources[key] = true;

                    // check the 'white list' of sources for the variable selector in the metadata
                    if (Ext.isDefined(sourceContextMap[key])) {
                        sourceArray.push(Ext.clone(source.data));
                    }
                }
                else if (!source) {
                    throw 'Unable to find source for \'' + key + '\'';
                }
            }
        }, this);

        // Examples: for grid column chooser include 'Current columns' and 'All variables from this session'
        if (Ext.isBoolean(config.includeVirtualSources) && config.includeVirtualSources) {
            Ext.iterate(sourceContextMap, function(key, props) {
                if (props.variableType === 'VIRTUAL') {
                    props.key = key;
                    sourceArray.push(Ext.clone(props));
                }
            });
        }

        // Examples: instead of Demographics dataset, expose 'Subject characteristics' and 'Study and treatment arms'
        if (Ext.isBoolean(config.includeDefinedMeasureSources) && config.includeDefinedMeasureSources) {
            Ext.iterate(sourceContextMap, function(key, props) {
                if (props.variableType === 'DEFINED_MEASURES' && Ext.isArray(props.measures)) {
                    // only add the source if at least one of its defined measures are in the current matched set
                    for (var i = 0; i < props.measures.length; i++) {
                        if (Ext.isDefined(measures[props.measures[i]])) {
                            props.key = key;
                            sourceArray.push(Ext.clone(props));
                            break;
                        }
                    }
                }
            });
        }

        return {
            sources: sourceArray,
            measures: measureArray
        };
    },

    getDefinedMeasuresSourceTitleMap : function() {
        if (!this.DEFINED_MEASURE_SOURCE_MAP) {
            this.DEFINED_MEASURE_SOURCE_MAP = {};

            Ext.iterate(Connector.measure.Configuration.context.sources, function(key, props) {
                if (Ext.isArray(props.measures)) {
                    Ext.each(props.measures, function(measureAlias) {
                        this.DEFINED_MEASURE_SOURCE_MAP[measureAlias] = props.queryLabel;
                    }, this);
                }
            }, this);
        }

        return this.DEFINED_MEASURE_SOURCE_MAP;
    },

    getDataSorts : function() {
        if (!this._dataSorts) {
            // TODO: Source these differently? This is requiring us to split these out
            this._dataSorts = [{
                schemaName: Connector.studyContext.gridBaseSchema,
                queryName: Connector.studyContext.gridBase,
                name: 'Container'
            },{
                schemaName: Connector.studyContext.gridBaseSchema,
                queryName: Connector.studyContext.gridBase,
                name: 'SubjectId'
            },{
                schemaName: Connector.studyContext.gridBaseSchema,
                queryName: Connector.studyContext.gridBase,
                name: 'SubjectVisit'
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

        this._LABKEY_Query_Visualization_getData({
            endpoint: LABKEY.ActionURL.buildURL('visualization', 'cdsGetData.api'),
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

        filterConfig.getDataCDS = getDataConfig;
        filterConfig.level = '[Subject].[Subject]'; // TODO: Retrieve from application metadata (cube.js)

        return filterConfig;
    },

    /**
     * Given a set of LABKEY.app.model.Filter filters this method will return the set of measures that are used
     * in all whereFilters with the appropriate configuration.
     * @param filters
     * @param includeDemographic true to include all fitlers from demographic queries
     * @param relevantQueryKeys array of relevant query keys (schema|query) for which filters to be included from
     */
    getWhereFilterMeasures : function(filters, includeDemographic, relevantQueryKeys) {
        var measures = [], queryKey, include;

        Ext.each(filters, function(filter) {
            if (filter.get('isWhereFilter') === true) {
                var ms = this._getMeasures(filter.data, true /* measure.filterArray is array of LABKEY.Filter */);
                Ext.each(ms, function(m) {
                    queryKey = m.measure.schemaName + '|' + m.measure.queryName;

                    include = !Ext.isArray(relevantQueryKeys) || relevantQueryKeys.indexOf(queryKey) > -1;
                    if (m.measure.isDemographic) {
                        include = !Ext.isBoolean(includeDemographic) || includeDemographic;
                    }

                    if (include) {
                        measures.push(m);
                    }
                });
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
        var measures = [], measureMap = {}, alias;

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
                            alias = LABKEY.MeasureUtil.getAlias(axisFilterRecord);

                            // Issue 24136: concatenate values array filters for measure aliases that exist on both x and y axis
                            if (Ext.isDefined(measureMap[alias]) && Ext.isArray(measureMap[alias].measure.values)) {
                                measureMap[alias].measure.values = Ext.Array.unique(measureMap[alias].measure.values.concat(axisFilterRecord.values));
                            }
                            else {
                                measureMap[alias] = {
                                    measure: axisFilterRecord,
                                    filterArray: []
                                };
                            }
                        }, this);
                    }
                }
            }, this);
        }

        // look at the grid filters to determine measure set
        if (!Ext.isEmpty(filterConfig.gridFilter)) {
            var gridFilters = filterConfig.gridFilter, columnName, measure, encodedFilter;

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

                            encodedFilter = this.encodeURLFilter(nf);
                            measureMap[alias].filterArray.push(filtersAreInstances ? nf : encodedFilter);
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
                                encodedFilter = this.encodeURLFilter(gf);
                                measureMap[measure.alias].filterArray.push(filtersAreInstances ? gf : encodedFilter);
                            }
                            else {
                                // create a filter with the measure 'name' rather than the 'alias' as the column
                                var _gf = LABKEY.Filter.create(measure.name, gf.getValue(), gf.getFilterType());
                                encodedFilter = this.encodeURLFilter(_gf);
                                measureMap[measure.alias].filterArray.push(filtersAreInstances ? _gf : encodedFilter);
                            }
                        }
                    }
                    else {
                        console.warn('Unable to find measure for query parameter:', gf.getURLParameterName() + '=' + gf.getURLParameterValue());
                    }
                }
            }
        }

        Ext.iterate(measureMap, function(alias, config) {
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
                    var queryName = source.get('subjectCountQueryName') || source.get('queryName');
                    if (json.sources.indexOf(queryName) == -1) {
                        json.sources.push(queryName);
                    }
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
    },

    encodeURLFilter : function(filter) {
        return encodeURIComponent(filter.getURLParameterName()) + '=' + encodeURIComponent(filter.getURLParameterValue());
    },



    /**
     *  Private wrapper for LABKEY.Query.Visualization.getData()
     *
     *  only supports config.metaDataOnly=true,
     *
     *  TODO: make these underscore methods really private
     */

    _LABKEY_Query_Visualization_getData : function(config)
    {
        if (config.metaDataOnly!==true)
            throw "metaDataOnly must be set equal to true";
        try
        {
            this._generateSql(config.measures);
        }
        catch (error)
        {
            console.log(error);
        }
        LABKEY.Query.Visualization.getData(config);
    },


    _getTables : function()
    {
        var table = function(s,q,k,isAssayDataset)
        {
            this.displayName = q;
            this.queryName = q.toLowerCase();
            this.fullQueryName = s + "." + this.queryName;
            this.tableAlias = s + "_" + this.queryName;
            this.schemaName = s;
            this.isAssayDataset = isAssayDataset === true;
            this.joinKeys = k;
        };
        var tables =
        {
            "study.gridbase" :    new table("study","GridBase",["container","participantsequencenum"],false),
            "study.demographics": new table("study","Demographics",["container","subjectid"],false),
            "study.ics":          new table("study","ICS",["container","participantsequencenum"],true),
            "study.bama":         new table("study","BAMA",["container","participantsequencenum"],true),
            "study.elispot":      new table("study","Elispot",["container","participantsequencenum"],true),
            "study.nab":          new table("study","NAb",["container","participantsequencenum"],true)
        };
        return tables;
    },

    _acceptMeasureFn : function(datasetName, tables)
    {
        return function(m)
        {
            if (m.fullQueryName === datasetName)
                return true;
            var t = tables[m.fullQueryName];
            return t && !t.isAssayDataset;
        };
    },

    _sqlLiteralFn : function(type)
    {
        if (type == "VARCHAR" || type.startsWith("Text"))
            return LABKEY.Query.sqlStringLiteral;
        else if (type == "DOUBLE")
            return _toSqlNumber;
        else
            return _toSqlLiteral;
    },

    _generateSql : function(measuresIN)
    {
        var tables = this._getTables();

        // I want to modify these measures for internal bookkeeping, but I don't own this config, so clone here;
        // add .fullQueryName and .table to measure
        var measures = measuresIN.map(function(m)
        {
            var ret = Ext.apply({},m);
            if (ret.measure)
            {
                ret.measure = Ext.apply({}, ret.measure);
            }
            return ret;
        });
        measures.forEach(function(m)
        {
            var queryName = (m.measure.schemaName + "." + m.measure.queryName).toLowerCase();
            var axisQueryName = queryName + (m.measure.axisName ? "." + m.measure.axisName : "");
            var table = tables[axisQueryName];
            if (!table)
            {
                table = tables.get(queryName);
                if (null == table)
                    throw "table not found: " + queryName;
                var axisTable = Ext4.apply({},table);
                axisTable.tableAlias += "_" + m.measure.axisName;
                axisTable.displayName = m.measure.axisName;
                tables[axisQueryName] = axisTable;
                table = axisTable;
            }
            m.fullQueryName = axisQueryName;
            m.table = table;
        });

        // find the list of datasets
        var datasets = {};
        var hasAssayDataset = false;
        measures.forEach(function(m)
        {
            if (m.table && m.table.isAssayDataset)
            {
                hasAssayDataset = true;
                datasets[m.table.fullQueryName] = m.table;
            }
        });
        if (!hasAssayDataset)
            datasets[SUBJECTVISIT_TABLE] = tables[SUBJECTVISIT_TABLE];

        var unionSQL = "";
        var union = "";
        for (var name in datasets)
        {
            if (!datasets.hasOwnProperty(name)) continue;
            var term = this._generateSql1(measures, name, tables);
            unionSQL += union + term.sql;
            union = "\nUNION ALL\n";
        }

        console.log(unionSQL);
        return unionSQL;
    },

    /**
     * Generate SQL for a set of measures with 0-1 dataset
     * returns {sql:{sql}, aliases:['alias1',...]}
     *
     */
    _generateSql1 : function(allMeasures, datasetName, tables)
    {
        datasetName = datasetName || SUBJECTVISIT_TABLE;
        var rootTable = tables[datasetName];

        var acceptMeasure = this._acceptMeasureFn(datasetName, tables);
        var queryMeasures = allMeasures.filter(acceptMeasure);

        var gridBaseAliasableColumns = {"subjectid":true, "sequencenum":true};
        // look for aliases, e.g. study.gridbase.subjectid -> study.{dataset}.subjectid
        allMeasures
                .map(function (m) { m.sourceTable = m.table; return m;})
                .filter(function(m) { return m.table.fullQueryName === SUBJECTVISIT_TABLE &&  gridBaseAliasableColumns[m.measure.name.toLowerCase()];})
                .forEach(function(m) { m.sourceTable = rootTable;});

        //
        // SELECT
        //

        var seenAlias = {};
        var SELECT = "SELECT ";
        SELECT += LABKEY.Query.sqlStringLiteral(rootTable.displayName) + " AS " + "\"" + DATASET_ALIAS + "\"";
        var comma = ", ";
        allMeasures.forEach(function(m)
        {
            if (seenAlias[m.measure.alias])
                return;
            seenAlias[m.measure.alias] = true;

            if (!acceptMeasure(m))
            {
                SELECT += comma + "NULL AS " + m.measure.alias;
            }
            else
            {
                SELECT += comma + m.sourceTable.tableAlias + "." + m.measure.name + " AS " + m.measure.alias;
            }
            comma = ", ";
        });
        SELECT += "\n";

        //
        // FROM
        //

        var fromTables = {};
        queryMeasures.forEach(function(m)
        {
            if (m.sourceTable && m.sourceTable.fullQueryName !== datasetName)
                fromTables[m.sourceTable.fullQueryName] = m.sourceTable;
        });
        var FROM = "FROM " + rootTable.fullQueryName + " " + rootTable.tableAlias;
        for (var name in fromTables)
        {
            if (!fromTables.hasOwnProperty(name)) continue;
            var t = fromTables[name];
            var keys = t.joinKeys;
            FROM += " INNER JOIN " + t.fullQueryName + " " + t.tableAlias + " ON ";
            var and = "";
            keys.forEach(function (k) {
                FROM += and + rootTable.tableAlias + "." + k + "=" + t.tableAlias + "." + k;
                and = " AND ";
            });
            FROM += "\n";
        }

        //
        // WHERE
        //
        var operatorMap = {eq:"=",lt:"<",lte:"<=",gt:">",gte:">=",neq:"<>"};
        var WHERE = "WHERE ";
        and = "";
        var me = this;
        queryMeasures.forEach(function(mdef)
        {
            if (mdef.filterArray && mdef.filterArray.length > 0)
            {
                var columnName = mdef.table.tableAlias + "." + mdef.measure.name;
                var literalFn = me._sqlLiteralFn(mdef.measure.type);

                mdef.filterArray.forEach(function(f)
                {
                    var v, arr;
                    var operator = f.getFilterType().getURLSuffix();
                    switch (operator)
                    {
                        case 'eq':
                        case 'lt':
                        case 'lte':
                        case 'gt':
                        case 'gte':
                        case 'neq':
                            v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
                            WHERE += and + columnName + operatorMap[operator] + literalFn(v);
                            break;
                        case 'in':
                        case 'notin':
                            WHERE += and + columnName + (operator==='in' ? " IN (" : " NOT IN (");
                            v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
                            var arr = v.split(';');
                            var comma = "";
                            arr.forEach(function(v){
                                WHERE += comma + literalFn(v);
                                comma = ",";
                            });
                            WHERE += ")";
                            break;
                        case 'isblank':
                            WHERE += and + columnName + " IS NULL";
                            break;
                        case 'isnonblank':
                            WHERE += and + columnName + " IS NOT NULL";
                            break;
                        case 'between':
                        case 'notbetween':
                            v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
                            if (!Ext.isString(v))
                                throw "invalid value for between: " + v;
                            arr = v.split(",");
                            if (arr.length != 2)
                                throw "invalid value for between: " + v;
                            WHERE += and + columnName + (operator==='between'?" BETWEEN ":" NOT BETWEEN ") +
                                    literalFn(arr[0]) + " AND " + literalFn(arr[1]);
                            break;
                        case 'startswith':
                        case 'doesnotstartwith':
                            v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
                            v = v.replace(/([%_!])/g, "!$1") + '%';
                            WHERE += and + columnName + (operator==='like'?" LIKE ":" NOT LIKE ") +
                                    literalFn(v) + " ESCAPE '!'";
                            break;
                        case 'contains':
                        case 'doesnotcontain':
                            v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
                            v = '%' + v.replace(/([%_!])/g, "!$1") + '%';
                            WHERE += and + columnName + (operator==='like'?" LIKE ":" NOT LIKE ") +
                                    literalFn(v) + " ESCAPE '!'";
                            break;
                        case 'hasmvvalue':
                        case 'nomvvalue':
                        case 'dateeq':
                        case 'dateneq':
                        case 'datelt':
                        case 'datelte':
                        case 'dategt':
                        case 'dategte':
                        default:
                            throw "operator is not supported: " + operator;
                    }
                    and = " AND ";
                });
            }
        });
        if (WHERE === "WHERE ")
            WHERE = "";
        else
            WHERE += "\n";

        var sql = SELECT + FROM + WHERE;
        return {sql:sql, aliases:['one','two'], json:JSON.stringify(queryMeasures)};
    },
});


})();   // private scope function

Ext.define('Connector.controller.HttpInterceptor', {
    extend: 'LABKEY.app.controller.HttpInterceptor'
});

Ext.define('Connector.controller.Messaging', {
    extend: 'LABKEY.app.controller.Messaging'
});
