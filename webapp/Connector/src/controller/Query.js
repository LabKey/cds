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

        if (!this.GRID_MEASURES)
        {
            this.GRID_MEASURES = [];
        }

        // include only GridBase and study datasets
        var filters = [
            LABKEY.Query.Visualization.Filter.create({
                schemaName: Connector.studyContext.gridBaseSchema,
                queryName: Connector.studyContext.gridBase
            }),
            LABKEY.Query.Visualization.Filter.create({
                schemaName: 'study',
                queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS
            })
        ];

        LABKEY.Query.Visualization.getMeasures({
            allColumns: true,
            showHidden: true,
            filters: filters,
            success: function(measures)
            {
                var defaultGridAliases = this.getDefaultGridAliases(false, true);

                // add all of the response measures to the cached store
                Ext.each(measures, function(measure)
                {
                    this.addMeasure(measure);

                    // separate the set of default grid measures
                    if (defaultGridAliases[measure.alias.toLowerCase()])
                    {
                        this.GRID_MEASURES.push(Ext.clone(measure));
                    }
                }, this);

                // bootstrap client-defined measures
                Ext.iterate(Connector.measure.Configuration.context.measures, function(alias, measure)
                {
                    measure.alias = alias;
                    var visMeasure = new LABKEY.Query.Visualization.Measure(measure);
                    this.addMeasure(visMeasure);

                    // separate the set of default grid measures
                    if (defaultGridAliases[measure.alias.toLowerCase()])
                    {
                        this.GRID_MEASURES.push(Ext.clone(visMeasure));
                    }
                }, this);

                this._ready = true;
                this.application.fireEvent('queryready', this);
            },
            endpoint : LABKEY.ActionURL.buildURL('visualization', 'getMeasuresStatic'),
            scope: this
        });
    },

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
        return this.getGridBaseColumnAlias(Connector.studyContext.subjectColumn);
    },

    getGridBaseColumnAlias : function(colName) {
        return Connector.studyContext.gridBaseSchema + '_' + Connector.studyContext.gridBase + '_' + colName;
    },

    /**
     * @param {boolean} [asArray=false]
     * @param {boolean} [lowerCase=false]
     */
    getDefaultGridAliases : function(asArray, lowerCase)
    {
        var _getAlias = function(alias)
        {
            return lowerCase === true ? alias.toLowerCase() : alias;
        };

        var keys = [
            _getAlias(this.getSubjectColumnAlias()),
            _getAlias(this.getGridBaseColumnAlias('Study')),
            _getAlias(this.getGridBaseColumnAlias('TreatmentSummary')),
            _getAlias(QueryUtils.STUDY_ALIAS_PREFIX + 'Days')
        ];

        var result;
        if (asArray === true)
        {
            result = keys;
        }
        else
        {
            result = {};
            for (var i=0; i < keys.length; i++)
            {
                result[keys[i]] = i + 1; // position 1-based for truthy
            }
        }

        return result;
    },

    getDefaultGridMeasures : function()
    {
        return this.GRID_MEASURES;
    },

    getTimeAliases : function()
    {
        if (!this.timeAliases)
        {
            this.timeAliases = {};
            this.timeAliases[QueryUtils.STUDY_ALIAS_PREFIX + 'Days'] = 1;
            this.timeAliases[QueryUtils.STUDY_ALIAS_PREFIX + 'Weeks'] = 1;
            this.timeAliases[QueryUtils.STUDY_ALIAS_PREFIX + 'Months'] = 1;
        }

        return this.timeAliases;
    },

    addMeasure : function(measure)
    {
        if (!Ext.isObject(this.MEASURE_STORE.getById(measure.alias.toLowerCase())))
        {
            var sourceKey = measure.schemaName + '|' + measure.queryName,
                datas = this.getModelClone(measure, Connector.model.Measure.getFields()),
                context = Connector.measure.Configuration.context;

            // overlay any source metadata
            datas = Ext.apply(datas, context.sources[sourceKey]);
            // overlay any measure metadata
            datas = Ext.apply(datas, context.measures[measure.alias]);
            // overlay any dimension metadata (used for Advanced Options panel of Variable Selector)
            datas = Ext.apply(datas, context.dimensions[measure.alias]);

            this.MEASURE_STORE.add(datas);
            this.addSource(datas);
        }
    },

    addSource : function(measure) {
        var key = measure.schemaName + '|' + measure.queryName;
        if (!Ext.isObject(this.SOURCE_STORE.getById(key)))
        {
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
        return Ext.copyTo({}, record, Ext.Array.pluck(fields, 'name'));
    },

    getMeasureRecordByAlias : function(alias) {
        if (!this._ready) {
            console.warn('Requested measure before measure caching prepared.');
        }
        return this.MEASURE_STORE.getById(alias.toLowerCase());
    },

    getMeasureNameFromAlias : function(alias) {
        var record = this.getMeasureRecordByAlias(alias);
        return record ? record.get('name') : null;
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

    /** Query the SOURCE_STORE for a given set of records
     * @param property
     * @param value
     * @returns collection of matched records
     */
    getSources : function(property, value)
    {
        return this.SOURCE_STORE.query(property, value, false, true, true).items;
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
     * Use the cds getData API call with a set of measures and filters (SubjectIn and data filters) to create a temp query to use
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
            Connector.getFilterService().getSubjects(function(subjectFilter) {
                subjectMeasure = new LABKEY.Query.Visualization.Measure({
                    schemaName: dimension.get('schemaName'),
                    queryName: dimension.get('queryName'),
                    name: Connector.studyContext.subjectColumn,
                    type: 'VARCHAR'
                });

                subjectMeasure.alias = LABKEY.Utils.getMeasureAlias(subjectMeasure);
                if (subjectFilter.hasFilters) {
                    subjectMeasure.values = subjectFilter.subjects;
                }

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
                Ext.each(filterMeasures, function(filterMeasure)
                {
                    alias = LABKEY.Utils.getMeasureAlias(filterMeasure.measure);
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

                QueryUtils.getData({
                    measures: wrappedMeasureSet,
                    metaDataOnly: true,
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
     * Use the cds getData API call with a set of measures and filters (SubjectIn and data filters) to create a temp query to use
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

        // get the temp query information from the cds getData API call for the measureSet with the application filters added in
        this.getMeasureSetGetDataResponse(dimension, measureSet, filterValuesMap, function(response) {
            var alias = dimension.getFilterMeasure().get('alias'), sql;

            // SQL to get the subject count for each value of the filter measure
            sql = 'SELECT COUNT(DISTINCT "' + QueryUtils.SUBJECT_ALIAS + '") AS SubjectCount, '
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
            hiddenMatch, notSubjectColMatch, userFilterMatch, requiredVarMatch,
            key, source, sourceContextMap = Connector.measure.Configuration.context.sources;

        Ext.each(this.MEASURE_STORE.getRange(), function(record) {
            queryTypeMatch = !config.queryType || record.get('queryType') == config.queryType;
            measureOnlyMatch = !config.measuresOnly || record.get('isMeasure');
            timepointMatch = config.includeTimpointMeasures && (record.get('variableType') == 'TIME' || record.get('variableType') == 'USER_GROUPS');
            requiredVarMatch = config.includeAssayRequired && record.get('recommendedVariableGrouper') == '1_AssayRequired';
            hiddenMatch = config.includeHidden || (!record.get('hidden') || requiredVarMatch);
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

    getData : function(measures, success, failure, scope, applyCompound, extraFilters)
    {
        var config = {
            measures: measures,
            metaDataOnly: true,
            success: success,
            failure: failure,
            scope: scope
        };

        // include any compound filters defined in the application filters.
        // If they are included the measures which each compound filter relies on must also
        // be included in the request
        if (applyCompound)
        {
            Ext.apply(config, this._includeCompoundMeasures(config.measures, Connector.getState().getFilters()));
        }

        if (Ext.isArray(extraFilters))
        {
            if (config.extraFilters)
            {
                config.extraFilters = config.extraFilters.concat(extraFilters);
            }
            else
            {
                config.extraFilters = extraFilters;
            }
        }

        QueryUtils.getData(config);
    },

    getMeasureStore : function(measures, success, failure, scope)
    {
        LABKEY.Query.experimental.MeasureStore.getData({
            measures: measures,
            success: success,
            failure: failure,
            scope: scope
        }, QueryUtils.getData, QueryUtils);
    },

    /**
     * Get a LABKEY.Query.Visualization.getData configuration back based on the LABKEY.app.model.Filter given.
     * @param mdx The object which will be added as a COUNT/WHERE filter.
     * @param filters {Connector.model.Filter} or an appFilterData
     * @param subjectName {String} or an appFilterData
     * @returns {Array}
     */
    configureOlapFilters : function(mdx, filters, subjectName)
    {
        var olapFilters = [],
            measures = [];

        Ext.each(filters, function(filter)
        {
            // we want to INTERSECT application filters, this is accomplished
            // by specifying a different axisName property per filter
            var axisId = Ext.id(undefined, 'axis-');
            if (filter.get('filterSource') === 'GETDATA')
            {
                Ext.each(filter.getMeasureSet(), function(filter)
                {
                    filter.measure.axisName = axisId;
                    measures.push(filter);
                });
            }
            else
            {
                olapFilters.push(filter.getOlapFilter(mdx, subjectName));
            }
        });

        if (measures.length > 0)
        {
            olapFilters.push({
                level: '[Subject].[Subject]', // TODO: Retrieve from application metadata (cube.js)
                sql: QueryUtils.getSubjectIntersectSQL({
                    measures: measures
                })
            });
        }

        return olapFilters;
    },

    /**
     * Given a set of LABKEY.app.model.Filter filters this method will return the set of measures that are used
     * in all whereFilters with the appropriate configuration.
     * @param filters
     * @param includeDemographic true to include all filters from demographic queries
     * @param relevantQueryKeys array of relevant query keys (schema|query) for which filters to be included from
     */
    getWhereFilterMeasures : function(filters, includeDemographic, relevantQueryKeys)
    {
        var whereFilterMeasures = [],
            measure,
            wrapped,
            queryKeys = Ext.Array.toMap(relevantQueryKeys, function(key) {
                return key.toLowerCase();
            });

        // TODO: Adjust this, it either needs to be "like the plot" or "like the grid" or have a way to be either.
        // Currently, it is "like the grid"
        Ext.each(filters, function(filter)
        {
            if (filter.isGrid())
            {
                Ext.iterate(filter.getDataFilters(), function(alias, filters)
                {
                    if (alias !== Connector.Filter.COMPOUND_ALIAS)
                    {
                        measure = this.getMeasure(alias);
                        wrapped = {measure: measure};
                        if (measure && this._includeMeasureFilterForQueryKeys(wrapped, includeDemographic, queryKeys))
                        {
                            wrapped.filterArray = filters;
                            whereFilterMeasures.push(wrapped);
                        }
                    }
                }, this);
            }
        }, this);

        return whereFilterMeasures;
    },

    _includeMeasureFilterForQueryKeys : function(m, includeDemographic, queryKeysMap)
    {
        var queryKey = m.measure.schemaName + '|' + m.measure.queryName,
            include = Ext.isDefined(queryKeysMap[queryKey.toLowerCase()]);

        if (m.measure.isDemographic)
        {
            include = !Ext.isBoolean(includeDemographic) || includeDemographic;
        }

        return include;
    },

    clearSourceCountsCache : function() {
        this.SOURCE_COUNTS = undefined;
    },

    getSourceCounts : function(sourceModels, callback, scope) {

        Connector.getFilterService().getSubjects(function(subjectFilter) {

            // we cache the source count results so they can share between variable sectors
            if (Ext.isDefined(this.SOURCE_COUNTS)) {
                callback.call(scope || this, sourceModels, this.SOURCE_COUNTS);
                return;
            }

            var json = {
                schema: 'study',
                members: subjectFilter.hasFilters ? subjectFilter.subjects : undefined,
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
        }, this);
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
            alias = measure.measure.alias || LABKEY.Utils.getMeasureAlias(measure.measure);
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
     * Appends any measures that are declared by compound filters to the getDataConfig.
     * This is used so that each caller of getData doesn't need to account for compound filters on their
     * own.
     * @param wrappedMeasures
     * @param {Connector.model.Filter[]} filters Filters to look at for resolving compound filters
     * @returns {*}
     * @private
     */
    _includeCompoundMeasures : function(wrappedMeasures, filters)
    {
        // build a map of aliases
        var aliasMap = {},
            extraFilters = [];

        Ext.each(wrappedMeasures, function(measure)
        {
            aliasMap[measure.measure.alias] = true;
        });

        // add any additional measures to the configuration that come from the compound filters
        Ext.each(filters, function(appFilter)
        {
            Ext.iterate(appFilter.getDataFilters(), function(alias, filters)
            {
                if (alias === Connector.Filter.COMPOUND_ALIAS)
                {
                    Ext.each(filters, function(compound)
                    {
                        // process each measure alias from this compound filter
                        Ext.iterate(compound.getAliases(), function(cAlias)
                        {
                            if (!aliasMap[cAlias])
                            {
                                // clear to append this measure result
                                var m = Connector.getQueryService().getMeasure(cAlias);
                                if (m)
                                {
                                    wrappedMeasures.push({
                                        measure: Ext.clone(m),
                                        filterArray: []
                                    });

                                    aliasMap[cAlias] = true;
                                }
                                else
                                {
                                    throw 'Unable to find measure "' + cAlias + '" included in compound filter.';
                                }
                            }
                        });

                        extraFilters.push(compound);
                    });
                }
            });
        });

        return {
            measures: wrappedMeasures,
            extraFilters: extraFilters
        };
    }
});

Ext.define('Connector.controller.HttpInterceptor', {
    extend: 'LABKEY.app.controller.HttpInterceptor'
});

Ext.define('Connector.controller.Messaging', {
    extend: 'LABKEY.app.controller.Messaging'
});
