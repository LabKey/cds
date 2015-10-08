/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Filter', {
    extend: 'LABKEY.app.model.Filter',

    fields: [
        {name : 'dataFilter', defaultValue: {}},
        {name : 'measureSet', defaultValue: []},
        {name : 'isAggregated', defaultValue: false}
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

    constructor : function(config) {
        this.callParent([config]);

        Connector.getQueryService().onQueryReady(function() {
            this._generateMeasures();
            this._generateDataFilters();
        }, this);
    },

    getDataFilters : function() {
        return this.get('dataFilter');
    },

    getMeasureSet : function() {
        return Ext.clone(this.get('measureSet'));
    },

    /**
     * Do not call this directly from within this model's implementation. Use this._set() instead.
     * @param fieldName
     * @param newValue
     */
    'set': function(fieldName, newValue) {
        this.callParent(arguments);

        if (!this.SET_LOCK) {
            Connector.getQueryService().onQueryReady(function() {
                this._generateMeasures();
                this._generateDataFilters();
            }, this);
        }
    },

    /**
     * An internal 'set' function that can be used to safely set values
     * @param fieldName
     * @param newValue
     * @private
     */
    _set : function(fieldName, newValue) {
        this.SET_LOCK = true;
        this.set(fieldName, newValue);
        this.SET_LOCK = false;
    },

    isAggregated : function() {
        return this.get('isAggregated') === true;
    },

    /**
     * Generates the set of measures that can be used to express this filter as a count filter.
     * These measures are persisted in 'measureSet' property.
     * @private
     */
    _generateMeasures : function() {

        var queryService = Connector.getQueryService(),
            subjectMeasure = queryService.getMeasure(queryService.getSubjectColumnAlias()),
            measureMap = {};

        // add any default measures
        measureMap[subjectMeasure.alias] = {
            measure: queryService.cleanMeasure(subjectMeasure),
            filterArray: []
        };

        if (this.isAggregated()) {
            // aggregation filter

            /**
             * "Apply aggregate filters as subject filters from the brushed set of points."
             */
            var filter = this._generateFilter(subjectMeasure, subjectMeasure.name, this.get('members'));
            measureMap[subjectMeasure.alias].filterArray.push(filter);
        }
        else if (this.isPlot() && this.isGrid()) {
            // plot selection filter

            this._processPlotMeasures(measureMap);
            this._processGridMeasures(measureMap);
        }
        else if (this.isPlot()) {
            // in the plot filter

            this._processPlotMeasures(measureMap);
        }
        else if (this.isGrid()) {
            // grid filter

            this._processGridMeasures(measureMap);
        }
        else {
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
    _processPlotMeasures : function(measureMap) {
        var queryService = Connector.getQueryService();

        Ext.each(this.get('plotMeasures'), function(plotMeasure) {
            if (plotMeasure) {

                var measure = queryService.getMeasure(plotMeasure.measure.alias),
                    alias;

                if (measure) {

                    // we still respect the value if it is set explicitly on the measure
                    if (!Ext.isDefined(measure.inNotNullSet)) {
                        measure.inNotNullSet = Connector.model.ChartData.isContinuousMeasure(measure);
                    }

                    measureMap[measure.alias] = {
                        measure: queryService.cleanMeasure(measure),
                        filterArray: Ext.isArray(plotMeasure.filterArray) ? plotMeasure.filterArray : []
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
                                measure: queryService.cleanMeasure(axisFilterRecord),
                                filterArray: []
                            };
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
                            measure: queryService.cleanMeasure(measure),
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

                    if (gf.getColumnName() === measure.name || isTimeBased) {
                        measureMap[measure.alias].filterArray.push(gf);
                    }
                    else {
                        // create a filter with the measure 'name' rather than the 'alias' as the column
                        var _gf = LABKEY.Filter.create(measure.name, gf.getValue(), gf.getFilterType());
                        measureMap[measure.alias].filterArray.push(_gf);
                    }
                }
                else {
                    console.warn('Unable to find measure for query parameter', gf.getURLParameterName() + '=' + gf.getURLParameterValue());
                }
            }
        }, this);
    },

    _mapToMeasures : function(measureMap) {
        var queryService = Connector.getQueryService(),
            measures = [];

        Ext.iterate(measureMap, function(alias, config) {
            var mc = {
                measure: queryService.cleanMeasure(config.measure)
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

    _dataFilterHelper : function(filterMap, alias, filter) {
        if (!Ext.isArray(filterMap[alias])) {
            filterMap[alias] = [];
        }
        filterMap[alias].push(filter);
    },

    _generateDataFilters : function() {

        var dataFilterMap = {};

        if (this.isAggregated()) {
            // aggregation filter -- do nothing
        }
        else if (this.isPlot() && this.isGrid()) {
            // plot selection filter

            /**
             * "Plot selection filters, including axis filters, are global data filters on the dragged measure
             * (each axis considered separately), unless both axes are the same source then plot selection filters,
             * including axis filters, are applied as a compound global data filter."
             */

            // TODO: Compare the axes to determine if they meet the "unless" condition stated above

            Ext.each(this.get('gridFilter'), function(gridFilter) {
                if (gridFilter) {
                    this._dataFilterHelper(dataFilterMap, gridFilter.getColumnName(), gridFilter);
                }
            }, this);

            Ext.each(this.get('plotMeasures'), function(plotMeasure) {
                if (plotMeasure && plotMeasure.measure) {

                    // axis filters -> data filters
                    var measure = plotMeasure.measure;
                    if (measure.options && measure.options.dimensions) {
                        Ext.iterate(measure.options.dimensions, function(columnName, values) {
                            if (Ext.isArray(values) && !Ext.isEmpty(values)) {
                                // TODO: Switch axis filters to using alias rather than column name.
                                var genFilter = this._generateFilter(measure, columnName, values);
                                if (genFilter) {
                                    this._dataFilterHelper(dataFilterMap, genFilter.getColumnName(), genFilter);
                                }
                            }
                        }, this);
                    }
                }
            }, this);
        }
        else if (this.isPlot()) {
            // in the plot filter

            /**
             * "In the Plot filters, including the axis filters, are applied as a data filter globally."
             */
            Ext.each(this.get('plotMeasures'), function(plotMeasure) {
                if (plotMeasure && plotMeasure.measure) {

                    // axis filters -> data filters
                    var measure = plotMeasure.measure;
                    if (measure.options && measure.options.dimensions) {
                        Ext.iterate(measure.options.dimensions, function(columnName, values) {
                            if (Ext.isArray(values) && !Ext.isEmpty(values)) {
                                // TODO: Switch axis filters to using alias rather than column name.
                                var genFilter = this._generateFilter(measure, columnName, values);
                                if (genFilter) {
                                    this._dataFilterHelper(dataFilterMap, genFilter.getColumnName(), genFilter);
                                }
                            }
                        }, this);
                    }

                    // TODO: Deal with situational filters (e.g. log plots use "measure > 0" filter)
                }
            }, this);
        }
        else if (this.isGrid()) {
            // grid filter

            /**
             * "Grid filters are global data filters."
             */
            Ext.each(this.get('gridFilter'), function(gridFilter) {
                if (gridFilter) {
                    this._dataFilterHelper(dataFilterMap, gridFilter.getColumnName(), gridFilter);
                }
            }, this);
        }
        else {
            // olap filter -- nothing to do
        }

        this._set('dataFilter', dataFilterMap);
    },

    /**
     * Attempts to generate a filter from the specified
     * @param measure
     * @param columnName
     * @param values
     * @private
     */
    _generateFilter : function(measure, columnName, values) {
        var alias = [measure.schemaName, measure.queryName, columnName].join('_'),
            queryMeasure = Connector.getQueryService().getMeasure(alias),
            filter;

        if (!queryMeasure) {
            throw 'Unable to resolve filter alias: ' + alias;
        }

        if (values.length > 1) {
            filter = LABKEY.Filter.create(queryMeasure.alias, values.join(';'), LABKEY.Filter.Types.IN);
        }
        else if (values.length == 1) {
            filter = LABKEY.Filter.create(queryMeasure.alias, values[0]);
        }
        else {
            filter = LABKEY.Filter.create(queryMeasure.alias, undefined, LABKEY.Filter.Types.ISBLANK);
        }

        return filter;
    }
});
