/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Filter', {
    extend: 'LABKEY.app.model.Filter',

    fields: [
        /**
         * Calculated field that is updated whenever the filter is modified (including creation).
         * Can be accessed using filter.getDataFilters()
         */
        {name : 'dataFilter', defaultValue: {}},
        {name : 'measureSet', defaultValue: []},
        {name : 'isAggregated', type: 'boolean', defaultValue: false},
        {name : 'xLabel', defaultValue: undefined},
        {name : 'yLabel', defaultValue: undefined},

        {name : 'isTime', type: 'boolean', defaultValue: false},
        {name : 'timeFilters', defaultValue: [], convert: function(raw)
        {
            var filters = [];
            if (Ext.isArray(raw))
            {
                Ext.each(raw, function(r)
                {
                    if (Ext.isString(r))
                    {
                        var build = LABKEY.Filter.getFiltersFromUrl(r, 'query');
                        if (Ext.isArray(build))
                        {
                            filters.push(build[0]); // assume single filters
                        }
                    }
                    else if (Ext.isDefined(r))
                    {
                        filters.push(r);
                    }
                });
            }
            else if (Ext.isDefined(raw))
            {
                filters.push(raw);
            }
            return filters;
        }}
    ],

    statics: {
        loaded: false,
        subjectMap: {},
        getSubjectUniqueName : function(subjectID) {
            return '[Subject].[' + Connector.model.Filter.getContainer(subjectID) + '].[' + subjectID + ']';
        },
        getContainer : function(subjectID) {
            return Connector.model.Filter.subjectMap[subjectID];
        },
        loadSubjectContainer : function(mdx) {

            if (!Connector.model.Filter.loaded) {
                // load from mdx
                var level = mdx.getDimension('Subject').getHierarchies()[0].levelMap['Subject'];
                var members = level.members;

                Ext.each(members, function(member) {
                    if (Connector.model.Filter.subjectMap[member.name]) {
                        var msg = 'Unable to process the same subject identifier in multiple studies.';
                        if (LABKEY.devMode) {
                            msg += " ID: " + member.name;
                        }
                        console.error(msg);
                    }
                    else {
                        var uniqueName = member.uniqueName.split('].'),
                            containerID = uniqueName[1].replace('[', '');

                        Connector.model.Filter.subjectMap[member.name] = containerID;
                    }
                });

                Connector.model.Filter.loaded = true;
            }
        },

        getGridLabel : function(gf) {
            if (gf.getFilterType().getURLSuffix() === 'dategte' || gf.getFilterType().getURLSuffix() === 'datelte') {
                return LABKEY.app.model.Filter.getShortFilter(gf.getFilterType().getDisplayText()) + ' ' + ChartUtils.tickFormat.date(gf.getValue());
            }
            return LABKEY.app.model.Filter.getGridLabel(gf);
        },

        getFilterValuesAsArray : function(gf) {
            var values = [];
            Ext.each(gf.getValue(), function(value) {
                Ext.each(value.split(';'), function(v) {
                    values.push(Ext.htmlEncode(v == '' ? ChartUtils.emptyTxt : v));
                });
            });

            return values;
        }
    },

    constructor : function(config)
    {
        this.callParent([config]);
        this._initFilter();
    },

    _initFilter : function()
    {
        Connector.getQueryService().onQueryReady(function()
        {
            this._generateMeasures();
            this._generateDataFilters();
        }, this);
    },

    getDataFilters : function()
    {
        return this.get('dataFilter');
    },

    getMeasureSet : function()
    {
        return Ext.clone(this.get('measureSet'));
    },

    getTimeFilters : function()
    {
        return this.get('timeFilters')
    },

    /**
     * Do not call this directly from within this model's implementation. Use this._set() instead.
     * @param fieldName
     * @param newValue
     */
    'set': function(fieldName, newValue)
    {
        this.callParent(arguments);

        if (!this.SET_LOCK)
        {
            this._initFilter();
        }
    },

    /**
     * An internal 'set' function that can be used to safely set values
     * @param fieldName
     * @param newValue
     * @private
     */
    _set : function(fieldName, newValue)
    {
        this.SET_LOCK = true;
        this.set(fieldName, newValue);
        this.SET_LOCK = false;
    },

    isAggregated : function()
    {
        return this.get('isAggregated') === true;
    },

    isTime : function()
    {
        return this.get('isTime') === true;
    },

    /**
     * Returns true iff the x and y plotMeasures are the same source (e.g. NAb and NAb)
     * @returns {*|boolean}
     */
    samePlotMeasureSources : function()
    {
        var plotMeasures = this.get('plotMeasures');
        return plotMeasures[0] && plotMeasures[1] &&
            plotMeasures[0].measure.queryName.toLowerCase() === plotMeasures[1].measure.queryName.toLowerCase();
    },

    /**
     * Generates the set of measures that can be used to express this filter as a count filter.
     * These measures are persisted in 'measureSet' property.
     * @private
     */
    _generateMeasures : function()
    {
        var queryService = Connector.getQueryService(),
            subjectMeasure = queryService.getMeasure(queryService.getSubjectColumnAlias()),
            measureMap = {};

        // add any default measures
        measureMap[subjectMeasure.alias] = {
            measure: Ext.clone(subjectMeasure),
            filterArray: []
        };

        if (this.isAggregated())
        {
            // aggregation filter

            /**
             * "Apply aggregate filters as subject filters from the brushed set of points."
             */
            var filter = this._generateFilter(subjectMeasure.alias, this.get('members'));
            measureMap[subjectMeasure.alias].filterArray.push(filter);
        }
        else if (this.isPlot() && this.isGrid())
        {
            // plot selection filter

            this._processPlotMeasures(measureMap);
            this._processGridMeasures(measureMap);
        }
        else if (this.isPlot())
        {
            // in the plot filter

            this._processPlotMeasures(measureMap);
        }
        else if (this.isGrid())
        {
            // grid filter

            this._processGridMeasures(measureMap);
        }
        else
        {
            // olap filter -- nothing to do
        }

        // convert the map into an array of 'wrapped' measures
        this._set('measureSet', this._mapToMeasures(measureMap));
    },

    /**
     * Used to process the 'plotMeasures' property to determine the set of measures to include
     * @param measureMap
     * @private
     */
    _processPlotMeasures : function(measureMap)
    {
        var queryService = Connector.getQueryService();

        Ext.each(this.get('plotMeasures'), function(plotMeasure)
        {
            if (plotMeasure)
            {
                var measure = queryService.getMeasure(plotMeasure.measure.alias);

                if (measure)
                {
                    // we still respect the value if it is set explicitly on the measure
                    if (!Ext.isDefined(measure.inNotNullSet))
                    {
                        measure.inNotNullSet = Connector.model.ChartData.isContinuousMeasure(measure);
                    }

                    measureMap[measure.alias] = {
                        measure: Ext.clone(measure),
                        filterArray: Ext.isArray(plotMeasure.filterArray) ? plotMeasure.filterArray : []
                    };

                    if (plotMeasure.time)
                    {
                        measureMap[measure.alias].time = plotMeasure.time;
                    }

                    if (plotMeasure.dimension)
                    {
                        measureMap[measure.alias].dimension = plotMeasure.dimension;
                    }

                    if (plotMeasure.dateOptions)
                    {
                        measureMap[measure.alias].dateOptions = plotMeasure.dateOptions;
                    }

                    // plotMeasures can have 'Advanced Options' (i.e. axis filters) which need to be added to the measure set
                    Ext.each(Connector.model.Measure.getPlotAxisFilterMeasureRecords(plotMeasure.measure), function(axisFilterRecord)
                    {
                        var optionAlias = LABKEY.Utils.getMeasureAlias(axisFilterRecord),
                            optionMeasure = queryService.getMeasure(optionAlias);

                        if (optionMeasure)
                        {
                            // ensure mapping
                            if (!measureMap[optionMeasure.alias])
                            {
                                measureMap[optionMeasure.alias] = {
                                    measure: optionMeasure,
                                    filterArray: []
                                }
                            }

                            // ensure filters
                            if (!Ext.isEmpty(axisFilterRecord.values))
                            {
                                if (Ext.isEmpty(measureMap[optionMeasure.alias].measure.values))
                                {
                                    measureMap[optionMeasure.alias].measure.values = [];
                                }

                                // Issue 24136: concatenate values array filters for measure aliases that exist on both x and y axis
                                measureMap[optionMeasure.alias].measure.values = Ext.Array.unique(measureMap[optionMeasure.alias].measure.values.concat(axisFilterRecord.values));
                            }
                        }
                        else
                        {
                            console.warn('Unable to resolve measure from filter option:', optionAlias);
                        }
                    }, this);
                }
            }
        }, this);
    },

    /**
     * Used to process the 'gridFilter' property to determine the set of measures to include
     * @param measureMap
     * @private
     */
    _processGridMeasures : function(measureMap) {
        var queryService = Connector.getQueryService();

        Ext.each(this.get('gridFilter'), function(gf) {
            if (gf && gf !== '_null') {

                if (Ext.isString(gf)) {
                    gf = LABKEY.Filter.getFiltersFromUrl(gf, 'query')[0];
                }

                var measure = queryService.getMeasure(gf.getColumnName());
                if (measure) {

                    var isTimeBased = measure.alias in queryService.getTimeAliases();

                    if (!measureMap[measure.alias]) {

                        // we still respect the value if it is set explicitly on the measure
                        if (!Ext.isDefined(measure.inNotNullSet)) {
                            measure.inNotNullSet = Connector.model.ChartData.isContinuousMeasure(measure);
                        }

                        measureMap[measure.alias] = {
                            measure: Ext.clone(measure),
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

                    measureMap[measure.alias].filterArray.push(gf);
                }
                else {
                    console.warn('Unable to find measure for query parameter', gf.getURLParameterName() + '=' + gf.getURLParameterValue());
                }
            }
        }, this);
    },

    _mapToMeasures : function(measureMap)
    {
        var measures = [];

        Ext.iterate(measureMap, function(alias, config)
        {
            var mc = {
                measure: config.measure
            };
            if (config.dimension)
            {
                mc.dimension = config.dimension;
            }
            if (config.dateOptions)
            {
                mc.dateOptions = config.dateOptions;
            }
            if (config.filterArray.length > 0)
            {
                mc.filterArray = config.filterArray;
            }

            measures.push(mc);
        }, this);

        return measures;
    },

    _dataFilterHelper : function(filterMap, alias, filter)
    {
        if (!Ext.isArray(filterMap[alias]))
        {
            filterMap[alias] = [];
        }
        filterMap[alias].push(filter);
    },

    _generateDataFilters : function()
    {

        var dataFilterMap = {};

        if (this.isAggregated())
        {
            // aggregation filter -- do nothing
        }
        else if (this.isPlot())
        {
            /**
             * "In the Plot filters, including the axis filters, are applied as a data filter globally."
             */

            /**
             * "Plot selection filters, including axis filters, are global data filters on the dragged measure
             * (each axis considered separately), unless both axes are the same source then plot selection filters,
             * including axis filters, are applied as a compound global data filter."
             */

            if (this.samePlotMeasureSources())
            {
                this._generateCompoundFilter(dataFilterMap);

                // TODO: and apply situational filters
            }
            else
            {
                // plot selection filter
                if (this.isGrid())
                {
                    Ext.each(this.get('gridFilter'), function(gridFilter)
                    {
                        if (gridFilter)
                        {
                            this._dataFilterHelper(dataFilterMap, gridFilter.getColumnName(), gridFilter);
                        }
                    }, this);
                }

                // in the plot filter
                Ext.each(this.get('plotMeasures'), function(plotMeasure, i)
                {
                    if (i < 2 /* do not include color */ && plotMeasure && plotMeasure.measure)
                    {
                        // axis filters -> data filters
                        var measure = plotMeasure.measure;
                        if (measure.options && measure.options.dimensions)
                        {
                            Ext.iterate(measure.options.dimensions, function(alias, values)
                            {
                                if (Ext.isArray(values) && !Ext.isEmpty(values))
                                {
                                    var genFilter = this._generateFilter(alias, values);
                                    if (genFilter)
                                    {
                                        this._dataFilterHelper(dataFilterMap, genFilter.getColumnName(), genFilter);
                                    }
                                }
                            }, this);
                        }

                        if (Ext.isArray(plotMeasure.filterArray))
                        {
                            Ext.each(plotMeasure.filterArray, function(filter)
                            {
                                if (filter)
                                {
                                    if (filter.getColumnName().toLowerCase() !== measure.alias.toLowerCase())
                                        throw 'A filter on "' + filter.getColumnName() + '" cannot be specified on the "' + measure.alias + '" measure.';

                                    this._dataFilterHelper(dataFilterMap, filter.getColumnName(), filter);
                                }
                            }, this);
                        }
                        // TODO: Might need to calculate compound filter for situational filters. The primary example case
                        // TODO: being if you filter log > 0, you end up inadvertently dropping "undefined" values on demographic axes

                        // TODO: #2. Also, what happens to situational filters when generating compound filters?
                    }
                }, this);
            }
        }
        else if (this.isGrid())
        {
            // grid filter

            /**
             * "Grid filters are global data filters."
             */
            Ext.each(this.get('gridFilter'), function(gridFilter)
            {
                if (gridFilter)
                {
                    this._dataFilterHelper(dataFilterMap, gridFilter.getColumnName(), gridFilter);
                }
            }, this);
        }
        else
        {
            // olap filter -- nothing to do
        }

        this._set('dataFilter', dataFilterMap);
    },

    /**
     * Attempts to generate a filter from the specified
     * @param alias
     * @param values
     * @private
     */
    _generateFilter : function(alias, values) {
        var filter;

        if (values.length > 1) {
            filter = LABKEY.Filter.create(alias, values.join(';'), LABKEY.Filter.Types.IN);
        }
        else if (values.length == 1) {
            filter = LABKEY.Filter.create(alias, values[0]);
        }
        else {
            filter = LABKEY.Filter.create(alias, undefined, LABKEY.Filter.Types.ISBLANK);
        }

        return filter;
    },

    /**
     * Generates a compound filter based on the current plot measures. Applies it to the filterMap.
     * @param filterMap
     * @private
     */
    _generateCompoundFilter : function(filterMap)
    {
        // create a compound filter
        var gridFilter = this.get('gridFilter'),
            plotMeasures = this.get('plotMeasures'),
            xGridFilter = [gridFilter[0], gridFilter[1]],
            yGridFilter = [gridFilter[2], gridFilter[3]],
            xMeasure = plotMeasures[0],
            yMeasure = plotMeasures[1],
            measure,
            xfilterSet = [],
            yfilterSet = [];

        // process grid filter(s)
        Ext.each(xGridFilter, function(gridFilter)
        {
            if (gridFilter)
            {
                xfilterSet.push(gridFilter);
            }
        }, this);

        Ext.each(yGridFilter, function(gridFilter)
        {
            if (gridFilter)
            {
                yfilterSet.push(gridFilter);
            }
        }, this);

        // axis filters -> data filters
        measure = xMeasure.measure;
        if (measure.options && measure.options.dimensions)
        {
            Ext.iterate(measure.options.dimensions, function(alias, values)
            {
                if (Ext.isArray(values) && !Ext.isEmpty(values))
                {
                    var genFilter = this._generateFilter(alias, values);
                    if (genFilter)
                    {
                        xfilterSet.push(genFilter);
                    }
                }
            }, this);
        }

        measure = yMeasure.measure;
        if (measure.options && measure.options.dimensions)
        {
            Ext.iterate(measure.options.dimensions, function(alias, values)
            {
                if (Ext.isArray(values) && !Ext.isEmpty(values))
                {
                    var genFilter = this._generateFilter(alias, values);
                    if (genFilter)
                    {
                        yfilterSet.push(genFilter);
                    }
                }
            }, this);
        }

        // create a compound filter
        var xFilter = Connector.Filter.compound(xfilterSet, 'AND'),
            yFilter = Connector.Filter.compound(yfilterSet, 'AND');

        filterMap[Connector.Filter.COMPOUND_ALIAS] = [Connector.Filter.compound([xFilter, yFilter], 'OR')];
    },

    jsonify : function()
    {
        var jsonable = this.callParent();

        if (Ext.isArray(this.getTimeFilters()))
        {
            var jsonGridFilters = [];
            Ext.each(this.getTimeFilters(), function(filter)
            {
                if (filter)
                {
                    if (Ext.isString(filter))
                    {
                        jsonGridFilters.push(filter);
                    }
                    else
                    {
                        jsonGridFilters.push(filter.getURLParameterName() + '=' + filter.getURLParameterValue());
                    }
                }
            });

            jsonable.timeFilters = jsonGridFilters;
        }

        return jsonable;
    }
});

Ext.define('Connector.Filter', {

    statics: {
        COMPOUND_ALIAS: '_COMPOUND',

        Types: (function() {
            var types = LABKEY.Filter.Types;
            types.COMPOUND = {
                // duck-typing LABKEY.Filter.FilterDefinition
                getDisplayText: function() {
                    return 'Compound Filter';
                }
            };
            return types;
        })(),

        create : function(columnName, value, filterType, operator) {
            return new Connector.Filter(columnName, value, filterType, operator);
        },

        compound : function(filters, operator) {
            return new Connector.Filter(undefined, filters, Connector.Filter.Types.COMPOUND, operator);
        },

        _initAliasMap : function(aliasMap, filter) {
            if (filter.$className) {
                for (var i=0; i < filter._filters.length; i++) {
                    Connector.Filter._initAliasMap(aliasMap, filter._filters[i]);
                }
            }
            else {
                aliasMap[filter.getColumnName()] = true;
            }
        }
    },

    _filters: undefined,

    _isCompound: false,

    constructor : function(columnName, value, filterType, operator) {

        this.operator = operator || 'AND';

        if (filterType === Connector.Filter.Types.COMPOUND) {
            if (Ext.isArray(value)) {
                this._filters = value;
            }
            else {
                this._filters = [value];
            }
            this._isCompound = true;
        }
        else {
            this._filters = [ LABKEY.Filter.create(columnName, value, filterType) ];
        }

        this.aliasMap = {};
        Connector.Filter._initAliasMap(this.aliasMap, this);
    },

    toJSON : function() {
        var value = [];

        if (this._isCompound) {
            Ext.each(this._filters, function(filter) {
                if (Ext.isDefined(filter.$className)) {
                    value.push(filter.toJSON());
                }
                else {
                    // LABKEY Filter
                    value.push(this.encodeFilter(filter));
                }
            }, this);
        }
        else {
            value.push(this.encodeFilter(this._filters[0]));
        }

        return {
            type: this._isCompound ? 'compound' : 'singular',
            op: this.operator,
            value: value
        };
    },

    isCompound : function() {
        return this._isCompound === true;
    },

    getAliases : function() {
        return Ext.clone(this.aliasMap);
    },

    encodeFilter : function(filter) {
        return encodeURIComponent(filter.getURLParameterName()) + '=' + encodeURIComponent(filter.getURLParameterValue());
    },

    getColumnName : function() {
        return this._filters[0].getColumnName();
    }
});
