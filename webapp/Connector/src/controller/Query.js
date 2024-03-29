/*
 * Copyright (c) 2014-2019 LabKey Corporation
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

        if (!this.GRID_DEMOGRAPHICS_MEASURES)
        {
            this.GRID_DEMOGRAPHICS_MEASURES = [];
        }

        // Issue 24670: allow a measure to specify what other measure it was sourced from and return
        // that measure if request made with altLookupType='parent' or altLookupType='child'
        if (!this.SOURCE_MEASURE_ALIAS_MAP)
        {
            this.SOURCE_MEASURE_ALIAS_MAP = {
                parent: {},
                child: {}
            };
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
                var defaultGridDemographicsAliases = this.getDefaultGridDemographicsAliases(false);

                // add all of the response measures to the cached store
                Ext.each(measures, function(measure)
                {
                    this.addMeasure(measure);
                    var alias = measure.alias.toLowerCase();
                    // separate the set of default grid measures
                    if (defaultGridAliases[alias])
                    {
                        this.GRID_MEASURES.push(Ext.clone(measure));
                    }
                    if (defaultGridDemographicsAliases[alias])
                    {
                        this.GRID_DEMOGRAPHICS_MEASURES.push(Ext.clone(measure));
                    }
                }, this);
                this.GRID_MEASURES.sort(function(a, b){
                    var aliasA = a.alias.toLowerCase(), aliasB = b.alias.toLowerCase();
                    return defaultGridAliases[aliasA] - defaultGridAliases[aliasB];
                });
                this.GRID_DEMOGRAPHICS_MEASURES.sort(function(a, b){
                    var aliasA = a.alias.toLowerCase(), aliasB = b.alias.toLowerCase();
                    return defaultGridDemographicsAliases[aliasA] - defaultGridDemographicsAliases[aliasB];
                });

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

    getDemographicsColumnAlias: function(colName) {
        return QueryUtils.DEMOGRAPHICS_ALIAS_PREFIX + colName;
    },

    getDemographicsSubjectColumnAlias: function(colName) {
        return this.getDemographicsColumnAlias(Connector.studyContext.subjectColumn);
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

        return this._formatResults(keys, asArray);
    },

    getDefaultGridDemographicsAliases: function(asArray)
    {
        var keys = [
            this.getDemographicsColumnAlias(Connector.studyContext.subjectColumn).toLowerCase(),
            this.getDemographicsColumnAlias('study_label').toLowerCase(),
            this.getDemographicsColumnAlias('study_arm_summary').toLowerCase()
        ];

        return this._formatResults(keys, asArray);
    },

    _formatResults: function(keys, asArray)
    {
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

    getDefaultDemographicsMeasures: function()
    {
        return this.GRID_DEMOGRAPHICS_MEASURES;
    },

    getTimeAliases : function()
    {
        if (!this.timeAliases)
        {
            this.timeAliases = {};
            this.timeAliases[QueryUtils.STUDY_ALIAS_PREFIX + 'Days'] = 1;
            this.timeAliases[QueryUtils.STUDY_ALIAS_PREFIX + 'Weeks'] = 1;
            this.timeAliases[QueryUtils.STUDY_ALIAS_PREFIX + 'Months'] = 1;
            // value of 0 indicates it should now show for "Time points in the plot" filter pane
            this.timeAliases[QueryUtils.STUDY_ALIAS_PREFIX + 'Days_Discrete'] = 0;
            this.timeAliases[QueryUtils.STUDY_ALIAS_PREFIX + 'Weeks_Discrete'] = 0;
            this.timeAliases[QueryUtils.STUDY_ALIAS_PREFIX + 'Months_Discrete'] = 0;
            this.timeAliases[QueryUtils.STUDY_ALIAS_PREFIX + 'Days_Enrollment'] = 0;
            this.timeAliases[QueryUtils.STUDY_ALIAS_PREFIX + 'Weeks_Enrollment'] = 0;
            this.timeAliases[QueryUtils.STUDY_ALIAS_PREFIX + 'Months_Enrollment'] = 0;
            this.timeAliases[QueryUtils.STUDY_ALIAS_PREFIX + 'Days_Last_Vaccination'] = 0;
            this.timeAliases[QueryUtils.STUDY_ALIAS_PREFIX + 'Weeks_Last_Vaccination'] = 0;
            this.timeAliases[QueryUtils.STUDY_ALIAS_PREFIX + 'Months_Last_Vaccination'] = 0;
        }

        return this.timeAliases;
    },

    addMeasure : function(measure)
    {
        if (!Ext.isObject(this.MEASURE_STORE.getById(measure.alias.toLowerCase())))
        {
            if (measure.alias.toLowerCase().indexOf("cds_gridbase") === 0)
            {
                measure.alias = measure.alias.replace("CDS_GridBase", "cds_GridBase");
                measure.schemaName = 'cds';
            }
            var sourceKey = measure.schemaName + '|' + measure.queryName,
                context = Connector.measure.Configuration.context;
            var datas = this.getModelClone(measure, Connector.model.Measure.getFields());

            // overlay any source metadata
            datas = Ext.apply(datas, context.sources[sourceKey]);
            // overlay any measure metadata
            datas = Ext.apply(datas, context.measures[measure.alias]);
            // overlay any dimension metadata (used for Advanced Options panel of Variable Selector)
            datas = Ext.apply(datas, context.dimensions[measure.alias]);

            this.MEASURE_STORE.add(datas);
            this.addSource(datas);
            this.addMeasureAliasMap(datas);
        }
    },

    addMeasureAliasMap : function(measure)
    {
        if (Ext.isString(measure.sourceMeasureAlias))
        {
            this.SOURCE_MEASURE_ALIAS_MAP.parent[measure.alias] = measure.sourceMeasureAlias;
            this.SOURCE_MEASURE_ALIAS_MAP.child[measure.sourceMeasureAlias] = measure.alias;
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

    getMeasureRecordByAlias : function(alias, altLookupType) {
        if (!this._ready) {
            console.warn('Requested measure before measure caching prepared.');
        }

        var record = this.MEASURE_STORE.getById(alias.toLowerCase());

        if (this.getMeasureSourceAlias(alias, altLookupType) != null)
        {
            record = this.MEASURE_STORE.getById(this.getMeasureSourceAlias(alias, altLookupType).toLowerCase());
        }

        return record;
    },

    getMeasureSourceAlias : function(alias, altLookupType)
    {
        if (altLookupType === 'parent' && Ext.isDefined(this.SOURCE_MEASURE_ALIAS_MAP.parent[alias]))
        {
            return this.SOURCE_MEASURE_ALIAS_MAP.parent[alias];
        }
        else if (altLookupType === 'child' && Ext.isDefined(this.SOURCE_MEASURE_ALIAS_MAP.child[alias]))
        {
            return this.SOURCE_MEASURE_ALIAS_MAP.child[alias];
        }

        return null;
    },

    getMeasureNameFromAlias : function(alias) {
        var record = this.getMeasureRecordByAlias(alias);
        return record ? record.get('name') : null;
    },

    /**
     * Returns the raw measure data for the specified measureAlias. If not found, returns undefined.
     * @param measureAlias
     * @param altLookupType - parent/child or undefined
     * @returns {*}
     */
    getMeasure : function(measureAlias, altLookupType) {
        if (!this._ready) {
            console.warn('Requested measure before measure caching prepared.');
        }

        // for lookups, just resolve the base column (e.g. study_Nab_Lab/PI becomes study_Nab_Lab)
        var cleanAlias = Ext.clone(measureAlias).split('/')[0];

        if (Ext.isString(cleanAlias) && Ext.isObject(this.getMeasureRecordByAlias(cleanAlias, altLookupType))) {
            return Ext.clone(this.getMeasureRecordByAlias(cleanAlias, altLookupType).getData());
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
     * @param isGrid {boolean} True if used for grid.
     * @returns {Array} An array of dimension objects
     */
    getDimensions : function(schema, query, isGrid) {
        var dimensionArray = [],
            index = this.SOURCE_STORE.findExact('key', schema + '|' + query);

        if (index > -1) {
            var source = this.SOURCE_STORE.getAt(index),
                dimensions = source.get('dimensions');

            Ext.each(dimensions, function(dimension) {
                var d = this.getMeasure(dimension);
                if (d.isDimension && (!d.hidden || (isGrid && d.requiredInGrid))) {
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
     * @param {Object} selectorMeasure
     * @param {Array} measureSet
     * @param {Array} filterValuesMap
     * @param {String} plotAxis
     * @param {Function} callback
     * @param {Object} [scope]
     * @returns {Object}
     */
    getMeasureSetGetDataResponse : function(dimension, selectorMeasure, measureSet, filterValuesMap, plotAxis, callback, scope) {
        var subjectMeasure,
            wrappedMeasureSet = [],
            applicableMeasures,
            measureData,
            alias;

        if (Ext.isDefined(measureSet))
        {
            if (!Ext.isArray(measureSet))
            {
                measureSet = [measureSet];
            }

            // get the cube subjectList, excluding the "In the plot" filter...see last param to configureOlapFilters,
            // so that we can filter the advanced option values accordingly (i.e. for antigen selection in variable
            // selector, get subject count for all filters except the antigen selection itself)
            this.getSubjectsForSpecificFilters(Connector.getState().getFilters(), plotAxis, function(subjectFilter) {
                subjectMeasure = new LABKEY.Query.Visualization.Measure({
                    schemaName: dimension.get('schemaName'),
                    queryName: dimension.get('queryName'),
                    name: Connector.studyContext.subjectColumn,
                    type: 'VARCHAR'
                });

                subjectMeasure.alias = LABKEY.Utils.getMeasureAlias(subjectMeasure);
                subjectMeasure.values = subjectFilter.subjects;
                wrappedMeasureSet.push({measure: subjectMeasure});

                Ext.each(measureSet, function(measure)
                {
                    measureData = Ext.clone(measure.data);
                    if (Ext.isArray(filterValuesMap[measure.get('alias')]))
                    {
                        measureData.values = filterValuesMap[measure.get('alias')];
                    }

                    wrappedMeasureSet.push({measure: measureData});
                });

                // Issue 24894: Brush filter doesn't get applied to variable selector antigen subject count
                Ext.each(Connector.getState().getFilters(), function(filter)
                {
                    if (filter.isGrid())
                    {
                        applicableMeasures = filter.getPlotAxisMeasures(null, selectorMeasure, ChartUtils.filterMeasureComparator);
                        if (applicableMeasures.length > 0)
                        {
                            wrappedMeasureSet = wrappedMeasureSet.concat(applicableMeasures);
                        }
                    }
                }, this);

                QueryUtils.getData({
                    measures: wrappedMeasureSet,
                    metaDataOnly: true,
                    scope: this,
                    success: function(response)
                    {
                        if (Ext.isFunction(callback))
                        {
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
    getMeasureValueSubjectCount : function(dimension, selectorMeasure, measureSet, filterValuesMap, plotAxis, callback, scope)
    {
        // get the temp query information from the cds getData API call for the measureSet with the application filters added in
        this.getMeasureSetGetDataResponse(dimension, selectorMeasure, measureSet, filterValuesMap, plotAxis, function(response) {
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
     * @param {Boolean} config.includeTimepointMeasures Whether or not to include the timepoint/group measures
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
            hiddenMatch, demogSubjectColMatch, userFilterMatch, requiredVarMatch,
            key, source, sourceContextMap = Connector.measure.Configuration.context.sources;

        Ext.each(this.MEASURE_STORE.getRange(), function(record) {
            queryTypeMatch = !config.queryType || record.get('queryType') == config.queryType;
            measureOnlyMatch = !config.measuresOnly || record.get('isMeasure');
            timepointMatch = config.includeTimepointMeasures && (record.get('variableType') == 'TIME' || record.get('variableType') == 'USER_GROUPS');
            requiredVarMatch = config.includeAssayRequired && record.get('recommendedVariableGrouper') == '1_AssayRequired';
            demogSubjectColMatch = config.includeAssayRequired && record.get('isDemographic') && record.get('name') == Connector.studyContext.subjectColumn;

            // config.includeHidden: module property show hidden fields
            hiddenMatch = config.includeHidden || !record.get('hidden') || requiredVarMatch || demogSubjectColMatch;
            if (hiddenMatch) {
                if (config.isGridSelector) {
                    hiddenMatch = config.includeHidden || !record.get('hiddenInGrid');
                }
                else {
                    if (record.get('recommendedVariableGrouper') == '1_AssayRequired')
                        hiddenMatch = !record.get('hiddenInPlot');
                    else
                        hiddenMatch = config.includeHidden || !record.get('hiddenInPlot');
                }
            }

            // The userFilter is a function used to further filter down the available measures.
            // Needed so the color picker only displays categorical measures.
            userFilterMatch = !Ext.isFunction(config.userFilter) || config.userFilter(record.data, false);

            if ((queryTypeMatch || timepointMatch) && measureOnlyMatch && hiddenMatch && userFilterMatch)
            {
                measures[record.get('alias')] = true;
                measureArray.push(Ext.clone(record.raw));

                key = record.get('schemaName') + '|' + record.get('queryName');
                source = this.SOURCE_STORE.getById(key);

                if (!sources[key] && source) {
                    sources[key] = true;

                    // check the 'allow list' of sources for the variable selector in the metadata
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

    getData : function(measures, success, failure, scope, extraFilters, gridOptions)
    {
        var config = {
            measures: measures,
            metaDataOnly: true,
            success: success,
            failure: failure,
            scope: scope,
            gridOptions: gridOptions
        };

        if (Ext.isArray(extraFilters))
        {
            config.extraFilters = extraFilters;
        }

        QueryUtils.getData(config);
    },

    getMeasureStore : function(measures, extraFilters, success, failure, scope)
    {
        LABKEY.Query.MeasureStore.getData({
            measures: measures,
            extraFilters: extraFilters,
            success: success,
            failure: failure,
            scope: scope
        }, QueryUtils.getData, QueryUtils);
    },

    /**
     * Get a LABKEY.Query.Visualization.getData configuration back based on the Connector.model.Filter given.
     * @param {LABKEY.query.olap.MDX} mdx - The object which will be added as a COUNT/WHERE filter.
     * @param {Connector.model.Filter} filters - or an appFilterData
     * @param {String} subjectName - or an appFilterData
     * @param {String} [excludeInThePlotAxis=undefined] - exclude the "in the plot" filter for the query from a specific axis
     * @returns {Array}
     */
    configureOlapFilters : function(mdx, filters, subjectName, excludeInThePlotAxis)
    {
        var olapFilters = [],
            measures = [];
        var extraFilters = null;

        Ext.each(filters, function(filter)
        {
            // we want to INTERSECT application filters, this is accomplished
            // by specifying a different axisName property per filter
            var axisId = Ext.id(undefined, 'axis-');
            if (filter.get('filterSource') === 'GETDATA')
            {
                if (filter.isPlot())
                {
                    // plot selection or "in the plot"

                    if (filter.get('isStudyAxis')) {
                        if (filter.get('studyAxisFilter') && filter.get('studyAxisFilter')['_COMPOUND']) {
                            if (!extraFilters) {
                                extraFilters = [];
                            }
                            extraFilters.push(filter.get('studyAxisFilter')['_COMPOUND'][0]);
                            extraFilters[0].isStudyAxis = true;
                            var queryService = Connector.getQueryService(),
                                    studyMeasure = queryService.getMeasure(QueryUtils.STUDY_ALIAS),
                                    armMeasure = queryService.getMeasure(QueryUtils.TREATMENTSUMMARY_ALIAS),
                                    subjectVisitMeasure = queryService.getMeasure(QueryUtils.SUBJECT_SEQNUM_ALIAS);

                            measures.push({measure: studyMeasure});
                            measures.push({measure: armMeasure});
                            measures.push({measure: subjectVisitMeasure});
                        }
                    }
                    else {
                        if (excludeInThePlotAxis !== 'x' || filter.isGrid())
                        {
                            Ext.each(filter.getMeasureSet('x'), function(filter)
                            {
                                filter.measure.axisName = axisId;
                                measures.push(filter);
                            });
                        }

                        if (excludeInThePlotAxis !== 'y' || filter.isGrid())
                        {
                            axisId = Ext.id(undefined, 'axis-');
                            Ext.each(filter.getMeasureSet('y'), function(filter)
                            {
                                filter.measure.axisName = axisId;
                                measures.push(filter);
                            });
                        }
                    }
                }
                else if (filter.isGrid() || filter.isAggregated())
                {
                    // grid / aggregated
                    Ext.each(filter.getMeasureSet(), function(filter)
                    {
                        filter.measure.axisName = axisId;
                        measures.push(filter);
                    });
                }
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
                    measures: measures,
                    extraFilters: extraFilters
                })
            });
        }

        return olapFilters;
    },

    getSourceCounts : function(sourceModels, plotAxis, callback, scope) {

        var json = {
            schema: 'study',
            sources: []
        };

        Ext.each(sourceModels, function(source) {
            var queryName = source.get('subjectCountQueryName') || source.get('queryName');
            if (json.sources.indexOf(queryName) == -1) {
                json.sources.push(queryName);
            }
        });

        this.getSubjectsForSpecificFilters(Connector.getState().getFilters(), plotAxis, function(subjectFilter) {
            json.members = subjectFilter.hasFilters ? subjectFilter.subjects : undefined;

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
        }, this);
    },

    /**
     * Get the array of subjects that match the specified application filters/selections, with the option to exclude
     * plot filters from a given axis.
     * @param {Array} filters - array of application filters and/or selections
     * @param {String} excludeInThePlotAxis - exclude the "in the plot" filter for the subject count from a specific axis (x/y)
     * @param {Function} callback
     * @param {Object} scope
     * @returns {boolean} indicates if the subject count request has filters or not
     * @returns {Array} subjects returned by the MDX query
     */
    getSubjectsForSpecificFilters : function(filters, excludeInThePlotAxis, callback, scope)
    {
        var state = Connector.getState(),
            queryService = Connector.getQueryService(),
            countFilters,
            subjects;

        state.onMDXReady(function(mdx)
        {
            countFilters = queryService.configureOlapFilters(mdx, filters, state.subjectName, excludeInThePlotAxis);

            mdx.query({
                onRows: {
                    level: '[Subject].[Subject]',
                    members: 'members'
                },
                countFilter: countFilters,
                success: function (cellset)
                {
                    subjects = Ext.Array.pluck(Ext.Array.flatten(cellset.axes[1].positions), 'name');

                    callback.call(scope || this, {
                        hasFilters: countFilters.length > 0,
                        subjects: subjects
                    });
                }
            });
        });
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
     * The members that user has permission to for any dimension/hierarchy/level will be stored in the cached map.
     * @returns the map that holds
     */
    getUserAccessibleMembersCache: function()
    {
        if (!this.USER_LEVEL_MEMBERS)
            this.USER_LEVEL_MEMBERS = {};
        return this.USER_LEVEL_MEMBERS;
    },

    getCachedUserLevelMembers: function(hierarchyUniqName, levelUniqName)
    {
        var dimMap = this.getUserAccessibleMembersCache();
        var hierarchy = dimMap[hierarchyUniqName];
        if (hierarchy)
            return hierarchy[levelUniqName];
        return null;
    },

    /**
     * Store member accessibility information for all levels of the hierarchy
     * @param hierarchyUniqName Cube hierarchy unique name
     * @param cellset The cube result for the hierarchy
     */
    setUserHierarchyMembers: function(hierarchyUniqName, cellset)
    {
        var memberDefinitions = cellset.axes[1].positions, counts = cellset.cells;

        var dimMap = this.getUserAccessibleMembersCache();
        if (!dimMap[hierarchyUniqName])
            dimMap[hierarchyUniqName] = {};
        var hierarchyMap = dimMap[hierarchyUniqName];

        Ext.each(memberDefinitions, function(definition, idx) {
            var def = definition[0], _count = counts[idx][0].value;
            if (!Ext.isArray(hierarchyMap[def.level.uniqueName]))
            {
                hierarchyMap[def.level.uniqueName] = [];
            }
            if (_count)
            {
                hierarchyMap[def.level.uniqueName].push(def.uniqueName);
            }

        }, this);
    },

    /**
     * Check the cache to see if a specific member is accessible (has permission to data) to user
     * @param hierarchyUniqName
     * @param levelUniqName
     * @param memberName
     * @returns {boolean}
     */
    isUserLevelAccessible: function(hierarchyUniqName, levelUniqName, memberName)
    {
        var dimMap = this.getUserAccessibleMembersCache();
        var hierarchyMap = dimMap[hierarchyUniqName];
        if (!hierarchyMap)
            return false;
        var levelList = hierarchyMap[levelUniqName];
        if (!levelList)
            return false;
        var accessible = false;
        Ext.each(levelList, function(member){
            if (member === memberName) {
                accessible = true;
                return false;
            }
        }, this);
        return accessible;
    },

    /**
     * Query the cube for members that's accessible to user for the specified hierarchy and level and store the result in cache
     * @param callback The callback function to call after members querying has completed
     * @param scope The callback scope
     * @param hierarchyUniqName The cube hierarchy unique name
     * @param levelUniqName The cube level unique name to query for
     */
    getUserLevelMember : function(callback, scope, hierarchyUniqName, levelUniqName) {
        var me = this;

        if (Ext.isArray(this.getCachedUserLevelMembers(hierarchyUniqName, levelUniqName))) {
            if (callback)
                callback.call(scope);
            return;
        }

        Connector.getState().onMDXReady(function(mdx) {
            mdx.query({
                onRows: [{
                    level: levelUniqName,
                    member: 'members'
                }],
                showEmpty: true,
                success: function (cellset)
                {
                    me._setUserLevelMembers(hierarchyUniqName, levelUniqName, cellset);

                    if (callback)
                        callback.call(scope);
                },
                scope: this
            });
        });
    },

    _setUserLevelMembers: function(hierarchyUniqName, levelUniqName, cellset)
    {
        var memberDefinitions = cellset.axes[1].positions, counts = cellset.cells;
        var dimMap = this.getUserAccessibleMembersCache();
        if (!dimMap[hierarchyUniqName])
            dimMap[hierarchyUniqName] = {};

        var hierarchyMap = dimMap[hierarchyUniqName];

        if (!hierarchyMap[levelUniqName])
        {
            hierarchyMap[levelUniqName] = [];
        }
        var levelList = hierarchyMap[levelUniqName];

        Ext.each(memberDefinitions, function(definition, idx) {
            var def = definition[0], _count = counts[idx][0].value;
            if (_count)
                levelList.push(def.uniqueName);
        });
    },

    getMabData : function(success, failure, scope) {
        MabQueryUtils.getData({
            success: success,
            failure: failure,
            scope: scope
        });
    },

    getMabMetaData : function(success, failure, scope) {
        MabQueryUtils.getMetaData({
            success: success,
            failure: failure,
            scope: scope
        });
    },

    getMabAllFieldValues : function(config) {
        MabQueryUtils.getMabUniqueValues(config);
    },

    getMabActiveFieldValues : function(config) {
        MabQueryUtils.getMabUniqueValues(config);
    },

    getMabViruses : function(config) {
        MabQueryUtils.getMabViruses(config);
    },

    prepareMAbReportQueries : function(config) {
        MabQueryUtils.prepareMAbReportQueries(config)
    },

    prepareMAbExportQueries : function(config) {
        MabQueryUtils.prepareMAbExportQueries(config)
    }
});
