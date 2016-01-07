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
        {name : 'xSource'},
        {name : 'ySource'},

        {name : 'measureSet', defaultValue: []},
        {name : 'xMeasureSet', defaultValue: []},
        {name : 'yMeasureSet', defaultValue: []},

        {name : 'plotAxisMeasures', defaultValue: []},
        {name : 'isAggregated', type: 'boolean', defaultValue: false},

        {name : 'isTime', type: 'boolean', defaultValue: false},
        {name : 'isStudyAxis', type: 'boolean', defaultValue: false},
        {name : 'studyAxisKey', defaultValue: undefined},
        {name : 'timeMeasure', defaultValue: undefined},
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
        }},

        {name : 'filterDisplayString', defaultValue: undefined}
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

    _canMergeGridFilters : function(data, fdata)
    {
        var merge = true,
            pm, fpm, i=0;

        for (; i < data.gridFilter.length; i++)
        {
            pm = data.gridFilter[i];
            fpm = fdata.gridFilter[i];

            if (pm === null)
            {
                if (fpm !== null)
                {
                    merge = false;
                    break;
                }

                // they are both null, OK
            }
            else
            {
                // equivalent if they have the same URL prefix -- value can change
                if (fpm && pm.getURLParameterName().toLowerCase() !== fpm.getURLParameterName().toLowerCase())
                {
                    merge = false;
                    break;
                }
            }
        }

        return merge;
    },

    _canMergePlotMeasures : function(data, fdata)
    {
        var _merge = true, pm, fpm, i=0;

        for (; i < data.plotMeasures.length; i++)
        {
            pm = data.plotMeasures[i];
            fpm = fdata.plotMeasures[i];

            if (pm === null)
            {
                if (fpm !== null)
                {
                    _merge = false;
                    break;
                }

                // they are both null, OK
            }
            else if (fpm === null)
            {
                _merge = false;
                break;
            }
            else
            {
                // equivalent if they have the same alias
                if (pm.measure && fpm.measure)
                {
                    if (pm.measure.alias !== fpm.measure.alias)
                    {
                        _merge = false;
                        break;
                    }
                    //else if (ChartUtils.getAssayDimensionsWithDifferentValues(pm.measure, fpm.measure).length > 0)
                    //{
                    //    // compare the options to determine if the axis values are different
                    //    _merge = false;
                    //    break;
                    //}
                }
                else
                {
                    console.warn('Unknown plot measure configuration. Expected to have \'measure\' property on each \'plotMeasure\'. Unable to determine merge strategy.');
                    _merge = false;
                    break;
                }
            }
        }

        return _merge;
    },

    /**
     * Assumes both filters being inspected are time filters
     * @param data
     * @param fdata
     * @returns {boolean}
     * @private
     */
    _canMergeTimeFilters : function(data, fdata)
    {
        var _merge = false,
            dTimeMeasure = data.timeMeasure,
            fTimeMeasure = fdata.timeMeasure;

        if (data.isPlot === fdata.isPlot && dTimeMeasure.measure.alias === fTimeMeasure.measure.alias)
        {
            if (dTimeMeasure.dateOptions.interval === fTimeMeasure.dateOptions.interval)
            {
                if (dTimeMeasure.dateOptions.zeroDayVisitTag === fTimeMeasure.dateOptions.zeroDayVisitTag)
                {
                    _merge = true;
                }
            }
        }

        return _merge;
    },

    /**
     * Complex comparator that says two filters can be merged. This should always be called
     * in advance of calling merge() to be safe.
     * @param f
     */
    canMerge : function(f)
    {
        var data = this.data,
            fdata = f.data,
            _merge = false;

        if (data.isAggregated && fdata.isAggregated)
        {
            _merge = this._canMergeGridFilters(data, fdata);
        }
        else if (data.isTime || fdata.isTime)
        {
            if (data.isTime && fdata.isTime)
            {
                _merge = this._canMergeTimeFilters(data, fdata);
            }
        }
        else if (data.isPlot || fdata.isPlot || data.isGrid || fdata.isGrid)
        {
            if (data.isPlot === fdata.isPlot && data.isGrid === fdata.isGrid)
            {
                var _mergeMeasures = true;

                if (data.isPlot)
                {
                    _mergeMeasures = this._canMergePlotMeasures(data, fdata);
                    if (_mergeMeasures)
                    {
                        _mergeMeasures = this._canMergeGridFilters(data, fdata);
                    }
                }
                else
                {
                    // isGrid
                    _mergeMeasures = this._canMergeGridFilters(data, fdata);
                }

                _merge = _mergeMeasures;
            }
            // else they don't match
        }
        else if (data.hierarchy && fdata.hierarchy && data.hierarchy === fdata.hierarchy)
        {
            _merge = true;
        }

        return _merge;
    },

    merge : function(f)
    {

        var update = {
            members: this._mergeMembers(this.get('members'), f.get('members'))
        };

        if (this.isAggregated() || this.isPlot() || this.isTime())
        {
            update.gridFilter = this._mergeGridFilters(this.get('gridFilter'), f.get('gridFilter'));
        }

        if (this.isTime())
        {
            update.timeFilters = this._mergeGridFilters(this.get('timeFilters'), f.get('timeFilters'));
        }

        this.set(update);

        return this;
    },

    _mergeMembers : function(aMembers, bMembers)
    {
        if (this.isAggregated())
        {
            return bMembers;
        }

        return this.callParent(arguments);
    },

    getDataFilters : function()
    {
        return this.get('dataFilter');
    },

    getMeasureSet : function(axis)
    {
        if (axis)
        {
            if (axis.toLowerCase() === 'x')
                return Ext.clone(this.get('xMeasureSet'));
            else if (axis.toLowerCase() === 'y')
                return Ext.clone(this.get('yMeasureSet'));
            else
                throw 'Invalid axis requested. "' + axis + '"';
        }
        else
        {
            return Ext.clone(this.get('measureSet'));
        }
    },

    getTimeFilters : function()
    {
        return this.get('timeFilters')
    },

    getPlotAxisMeasures: function(axisName, compareMeasure, comparator)
    {
        var matchingMeasures = [],
            plotAxisMeasures = this.get('plotAxisMeasures');

        if (this.isTime() && plotAxisMeasures.length > 0)
        {
            matchingMeasures.push(plotAxisMeasures[0]);
        }

        Ext.each(plotAxisMeasures, function(m)
        {
            var paMeasure = Ext.clone(m);
            if (axisName)
            {
                paMeasure.measure.axisName = axisName;
            }

            if (compareMeasure)
            {
                if (Ext.isFunction(comparator))
                {
                    if (paMeasure && comparator(compareMeasure, paMeasure.measure))
                    {
                        matchingMeasures.push(paMeasure);
                    }
                }
                else
                {
                    throw 'A "comparator" function must be supplied when attempting to match a measure';
                }
            }
            else
            {
                matchingMeasures.push(paMeasure);
            }
        }, this);

        return matchingMeasures;
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
            measureMap = {},
            xMeasureMap = {},
            yMeasureMap = {};
        if (this.isAggregated())
        {
            // aggregation filter

            /**
             * "Apply aggregate filters as subject filters from the brushed set of points."
             */
            var subjectMeasure = queryService.getMeasure(queryService.getSubjectColumnAlias());

            measureMap[subjectMeasure.alias] = {
                measure: Ext.clone(subjectMeasure),
                filterArray: []
            };

            var filter = this._generateFilter(subjectMeasure.alias, this.get('members'));
            measureMap[subjectMeasure.alias].filterArray.push(filter);
        }
        else if (this.isPlot() && this.isGrid())
        {
            // plot selection filter

            this._processPlotMeasures(measureMap, xMeasureMap, yMeasureMap);
            this._processGridMeasures(measureMap, xMeasureMap, yMeasureMap);
        }
        else if (this.isPlot())
        {
            // in the plot filter

            this._processPlotMeasures(measureMap, xMeasureMap, yMeasureMap);
        }
        else if (this.isGrid())
        {
            // grid filter

            this._processGridMeasures(measureMap, xMeasureMap, yMeasureMap);
        }
        else
        {
            // olap filter -- nothing to do
        }

        // convert the map into an array of 'wrapped' measures
        this._set({
            measureSet: this._mapToMeasures(measureMap),
            xMeasureSet: this._mapToMeasures(xMeasureMap),
            yMeasureSet: this._mapToMeasures(yMeasureMap)
        });
    },

    /**
     * Used to process the 'plotMeasures' property to determine the set of measures to include
     * @param measureMap
     * @param xMeasureMap
     * @param yMeasureMap
     * @private
     */
    _processPlotMeasures : function(measureMap, xMeasureMap, yMeasureMap)
    {
        var queryService = Connector.getQueryService(),
            xSource, ySource;

        Ext.each(this.get('plotMeasures'), function(plotMeasure, i)
        {
            if (plotMeasure)
            {
                var measure = queryService.getMeasure(plotMeasure.measure.alias);

                if (measure)
                {
                    // index 0 => x-axis plot measure
                    if (i == 0)
                    {
                        measureMap[measure.alias] = {
                            measure: Ext.clone(measure),
                            filterArray: Ext.isArray(plotMeasure.filterArray) ? plotMeasure.filterArray : []
                        };

                        if (!xSource)
                        {
                            xSource = measure.schemaName + '|' + measure.queryName;
                        }
                        xMeasureMap[measure.alias] = {
                            measure: Ext.clone(measure),
                            filterArray: Ext.isArray(plotMeasure.filterArray) ? plotMeasure.filterArray : []
                        };
                    }
                    // index 1 => y-axis plot measure
                    else if (i == 1)
                    {
                        measureMap[measure.alias] = {
                            measure: Ext.clone(measure),
                            filterArray: Ext.isArray(plotMeasure.filterArray) ? plotMeasure.filterArray : []
                        };

                        if (!ySource)
                        {
                            ySource = measure.schemaName + '|' + measure.queryName;
                        }
                        yMeasureMap[measure.alias] = {
                            measure: Ext.clone(measure),
                            filterArray: Ext.isArray(plotMeasure.filterArray) ? plotMeasure.filterArray : []
                        };
                    }
                    // index 2 => color plot measure
                    else if (i == 2 && ChartUtils.hasValidColorMeasure(this.get('plotMeasures')))
                    {
                        measureMap[measure.alias] = {
                            measure: Ext.clone(measure),
                            filterArray: Ext.isArray(plotMeasure.filterArray) ? plotMeasure.filterArray : []
                        };
                    }

                    if (plotMeasure.time)
                    {
                        measureMap[measure.alias].time = plotMeasure.time;

                        if (i == 0)
                        {
                            xMeasureMap[measure.alias].time = plotMeasure.time;
                        }
                        else if (i == 1)
                        {
                            yMeasureMap[measure.alias].time = plotMeasure.time;
                        }
                    }

                    if (plotMeasure.dimension)
                    {
                        measureMap[measure.alias].dimension = plotMeasure.dimension;

                        if (i == 0)
                        {
                            xMeasureMap[measure.alias].dimension = plotMeasure.dimension;
                        }
                        else if (i == 1)
                        {
                            yMeasureMap[measure.alias].dimension = plotMeasure.dimension;
                        }
                    }

                    if (plotMeasure.dateOptions)
                    {
                        measureMap[measure.alias].dateOptions = plotMeasure.dateOptions;

                        if (i == 0)
                        {
                            xMeasureMap[measure.alias].dateOptions = plotMeasure.dateOptions;
                        }
                        else if (i == 1)
                        {
                            yMeasureMap[measure.alias].dateOptions = plotMeasure.dateOptions;
                        }
                    }

                    // plotMeasures can have 'Advanced Options' (i.e. axis filters) which need to be added to the measure set
                    Ext.each(Connector.model.Measure.getPlotAxisFilterMeasureRecords(plotMeasure.measure), function(axisFilterRecord)
                    {
                        var optionAlias = LABKEY.Utils.getMeasureAlias(axisFilterRecord),
                            optionMeasure = queryService.getMeasure(optionAlias);

                        if (optionMeasure)
                        {
                            // ensure mapping
                            if (!measureMap[optionAlias])
                            {
                                measureMap[optionAlias] = {
                                    measure: optionMeasure,
                                    filterArray: []
                                }
                            }

                            if (i == 0)
                            {
                                if (!xMeasureMap[optionAlias])
                                {
                                    xMeasureMap[optionAlias] = {
                                        measure: queryService.getMeasure(optionAlias), // Issue 24728: make sure to get a new clone of the measure from the queryService
                                        filterArray: []
                                    }
                                }
                            }
                            else if (i == 1)
                            {
                                if (!yMeasureMap[optionAlias])
                                {
                                    yMeasureMap[optionAlias] = {
                                        measure: queryService.getMeasure(optionAlias), // Issue 24728: make sure to get a new clone of the measure from the queryService
                                        filterArray: []
                                    }
                                }
                            }

                            // ensure filters
                            if (!Ext.isEmpty(axisFilterRecord.values))
                            {
                                if (Ext.isEmpty(measureMap[optionAlias].measure.values))
                                {
                                    measureMap[optionAlias].measure.values = [];
                                }

                                // Issue 24136: concatenate values array filters for measure aliases that exist on both x and y axis
                                measureMap[optionAlias].measure.values = Ext.Array.unique(measureMap[optionAlias].measure.values.concat(axisFilterRecord.values));

                                if (i == 0)
                                {
                                    if (Ext.isEmpty(xMeasureMap[optionAlias].measure.values))
                                    {
                                        xMeasureMap[optionAlias].measure.values = [];
                                    }

                                    xMeasureMap[optionAlias].measure.values = Ext.Array.unique(xMeasureMap[optionAlias].measure.values.concat(axisFilterRecord.values));
                                }
                                else if (i == 1)
                                {
                                    if (Ext.isEmpty(yMeasureMap[optionAlias].measure.values))
                                    {
                                        yMeasureMap[optionAlias].measure.values = [];
                                    }

                                    yMeasureMap[optionAlias].measure.values = Ext.Array.unique(yMeasureMap[optionAlias].measure.values.concat(axisFilterRecord.values));
                                }
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

        this._set({
            xSource: xSource ? xSource.toLowerCase() : undefined,
            ySource: ySource ? ySource.toLowerCase() : undefined
        });
    },

    /**
     * Used to process the 'gridFilter' property to determine the set of measures to include
     * @param measureMap
     * @param xMeasureMap
     * @param yMeasureMap
     * @private
     */
    _processGridMeasures : function(measureMap, xMeasureMap, yMeasureMap)
    {
        var queryService = Connector.getQueryService();

        Ext.each(this.get('gridFilter'), function(gf, i)
        {
            if (gf && gf !== '_null')
            {
                if (Ext.isString(gf))
                {
                    gf = LABKEY.Filter.getFiltersFromUrl(gf, 'query')[0];
                }

                var measure = queryService.getMeasure(gf.getColumnName());
                if (measure)
                {
                    var isTimeBased = measure.alias in queryService.getTimeAliases();

                    if (!measureMap[measure.alias])
                    {
                        measureMap[measure.alias] = {
                            measure: Ext.clone(measure),
                            filterArray: []
                        };

                        if (isTimeBased)
                        {
                            measureMap[measure.alias].dateOptions = {
                                interval: measure.alias,
                                zeroDayVisitTag: null
                            };
                        }
                    }

                    measureMap[measure.alias].filterArray.push(gf);

                    if (i < 2)
                    {
                        if (Ext.isDefined(xMeasureMap))
                        {
                            if (!xMeasureMap[measure.alias])
                            {
                                xMeasureMap[measure.alias] = {
                                    measure: Ext.clone(measure),
                                    filterArray: []
                                };

                                if (isTimeBased)
                                {
                                    xMeasureMap[measure.alias].dateOptions = {
                                        interval: measure.alias,
                                        zeroDayVisitTag: null
                                    };
                                }
                            }

                            xMeasureMap[measure.alias].filterArray.push(gf);
                        }
                    }
                    else if (i < 4)
                    {
                        if (Ext.isDefined(yMeasureMap))
                        {
                            if (!yMeasureMap[measure.alias])
                            {
                                yMeasureMap[measure.alias] = {
                                    measure: Ext.clone(measure),
                                    filterArray: []
                                };

                                if (isTimeBased)
                                {
                                    yMeasureMap[measure.alias].dateOptions = {
                                        interval: measure.alias,
                                        zeroDayVisitTag: null
                                    };
                                }
                            }

                            yMeasureMap[measure.alias].filterArray.push(gf);
                        }
                    }
                }
                else
                {
                    console.warn('Unable to find measure for query parameter', gf.getURLParameterName() + '=' + gf.getURLParameterValue());
                }
            }
        });
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
        var dataFilterMap = {},
            plotAxisMeasures = [];

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
            var sameSource = this.samePlotMeasureSources(),
                accountedForTime = false,
                xFilters = [],
                yFilters = [];

            if (sameSource)
            {
                this._generateCompoundFilter(dataFilterMap);
            }

            // plot selection filter
            if (this.isGrid())
            {
                Ext.each(this.get('gridFilter'), function(gridFilter, i)
                {
                    if (gridFilter)
                    {
                        if (i < 2)
                        {
                            xFilters.push(gridFilter);
                        }
                        else if (i < 4)
                        {
                            yFilters.push(gridFilter);
                        }

                        if (!sameSource)
                            this._dataFilterHelper(dataFilterMap, gridFilter.getColumnName(), gridFilter);
                    }
                }, this);
            }

            // in the plot filter
            Ext.each(this.get('plotMeasures'), function(plotMeasure, i)
            {
                if (i < 2 /* do not include color */ && plotMeasure && plotMeasure.measure)
                {
                    var measure = plotMeasure.measure;

                    if (!sameSource)
                    {
                        // axis filters -> data filters
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
                    }

                    if (this.isGrid())
                    {
                        // plot selection
                        var wrapped = {
                            measure: measure
                        };

                        if (plotMeasure.dateOptions)
                        {
                            wrapped.dateOptions = Ext.clone(plotMeasure.dateOptions);
                        }

                        if (this.isTime() && !accountedForTime)
                        {
                            accountedForTime = true;
                            Ext.each(this.getMeasureSet(), function(_wrapped)
                            {
                                if (_wrapped.measure.alias.toLowerCase() === QueryUtils.SUBJECT_SEQNUM_ALIAS.toLowerCase())
                                {
                                    plotAxisMeasures.push(_wrapped);
                                }
                            });
                        }
                        else if (wrapped.measure.variableType !== 'TIME')
                        {
                            wrapped.filterArray = i == 0 ? xFilters : yFilters;
                        }

                        plotAxisMeasures.push(wrapped);
                    }
                }
            }, this);
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

            // grid filters apply to both x/y
            var queryService = Connector.getQueryService();
            Ext.iterate(dataFilterMap, function(alias, filters)
            {
                var measure = queryService.getMeasure(alias);
                if (measure)
                {
                    plotAxisMeasures.push({
                        measure: measure,
                        filterArray: filters
                    });
                }
            }, this);
        }
        else
        {
            // olap filter -- nothing to do
        }

        this._set({
            dataFilter: dataFilterMap,
            plotAxisMeasures: plotAxisMeasures
        });
    },

    /**
     * Attempts to generate a filter from the specified
     * @param alias
     * @param values
     * @private
     */
    _generateFilter : function(alias, values)
    {
        var filter;

        if (values.length > 1)
        {
            filter = LABKEY.Filter.create(alias, values.join(';'), LABKEY.Filter.Types.IN);
        }
        else if (values.length == 1)
        {
            filter = LABKEY.Filter.create(alias, values[0]);
        }
        else
        {
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

        if (Ext.isEmpty(xfilterSet) && Ext.isEmpty(yfilterSet))
        {
            return;
        }

        var compounds = [];
        if (Ext.isEmpty(yfilterSet))
        {
            compounds.push(Connector.Filter.compound(xfilterSet, 'AND'));
        }
        else if (Ext.isEmpty(xfilterSet))
        {
            compounds.push(Connector.Filter.compound(yfilterSet, 'AND'));
        }
        else
        {
            compounds.push(Connector.Filter.compound([
                Connector.Filter.compound(xfilterSet, 'AND'),
                Connector.Filter.compound(yfilterSet, 'AND')
            ], 'OR'));
        }

        filterMap[Connector.Filter.COMPOUND_ALIAS] = compounds;
    },

    jsonify : function()
    {
        var jsonable = this.callParent();

        if (Ext.isArray(this.getTimeFilters()))
        {
            jsonable.timeFilters = this._convertToJsonFilters(this.getTimeFilters(), false);
        }

        if (Ext.isArray(this.get('gridFilter')))
        {
            jsonable.gridFilter = this._convertToJsonFilters(this.get('gridFilter'), true);
        }

        delete jsonable.dataFilter;
        delete jsonable.measureSet;
        delete jsonable.xMeasure;
        delete jsonable.yMeasure;
        delete jsonable.xSource;
        delete jsonable.ySource;

        return jsonable;
    },

    _convertToJsonFilters : function(origFilters, encodeValue)
    {
        var jsonFilters = [];
        Ext.each(origFilters, function(filter)
        {
            if (filter)
            {
                if (Ext.isString(filter))
                {
                    jsonFilters.push(filter);
                }
                else
                {
                    jsonFilters.push(filter.getURLParameterName() + '='
                            + (encodeValue ? encodeURIComponent(filter.getURLParameterValue()) : filter.getURLParameterValue()));
                }
            }
            else
            {
                jsonFilters.push(null);
            }
        });

        return jsonFilters;
    },

    /**
     * Allows for this filter to replace any data filters
     * @param {Array} oldFilters
     * @param {Array} newFilters
     * @param {Function} callback
     * @param {Object} [scope=undefined]
     */
    replace : function(oldFilters, newFilters, callback, scope)
    {
        var remove = false;

        if (Ext.isEmpty(oldFilters))
        {
            throw this.$className + '.replace() cannot be used to only add filters.';
        }

        if (this.isTime())
        {
            if (newFilters.length == 0)
            {
                remove = true;
                callback.call(scope, this, remove);
            }
            else
            {
                Connector.getFilterService().getTimeFilter(this.get('timeMeasure'), newFilters, function(_filter)
                {
                    this.data.gridFilter[0] = _filter;

                    this.set('timeFilters', newFilters);

                    callback.call(scope, this, remove);
                }, this);
            }
            return;
        }

        // Determine the sourcing measure
        var sourceMeasure = Connector.getQueryService().getMeasure(oldFilters[0].getColumnName());
        if (!sourceMeasure)
        {
            throw 'Unable to determine source measure';
        }

        if (this.isAggregated())
        {
            throw 'Aggregate filters do not support replace()';
        }
        else if (this.isPlot() && !this.isGrid())
        {
            // in the plot
            if (this.samePlotMeasureSources())
            {
                throw 'In the plot filter cannot replace() compound filters';
            }

            // examine plotMeasures
            remove = this._replacePlotMeasures(sourceMeasure, oldFilters, newFilters);
        }
        else if (this.isPlot())
        {
            // plot selection
            if (this.samePlotMeasureSources())
            {
                throw 'Plot selection filter cannot replace() compound filters';
            }

            // determine if the filters being replaced come from gridFilter
            var isGridFilter = false,
                gridFilter = [null, null, null, null];

            Ext.each(this.get('gridFilter'), function(gf, i)
            {
                // only examine indices 0/2
                if (i % 2 == 0)
                {
                    var filterA = null,
                        filterB = null;

                    if (gf && gf.getColumnName().toLowerCase() === oldFilters[0].getColumnName().toLowerCase())
                    {
                        isGridFilter = true;

                        // old matching filters + empty new filters means this filter is being removed
                        if (Ext.isEmpty(newFilters))
                        {
                            remove = true;
                            return false;
                        }
                        else
                        {
                            filterA = newFilters[0];
                            filterB = newFilters.length > 1 ? newFilters[1] : null;
                        }
                    }
                    else
                    {
                        var filters = this.get('gridFilter');
                        filterA = filters[i];
                        filterB = filters[i+1];
                    }

                    gridFilter[i] = filterA;
                    gridFilter[i+1] = filterB;
                }
            }, this);


            if (!remove)
            {
                if (isGridFilter)
                {
                    this.set('gridFilter', gridFilter);
                }
                else
                {
                    // determine if the filters being replaced come from plotMeasures
                    remove = this._replacePlotMeasures(sourceMeasure, oldFilters, newFilters);
                }
            }
        }
        else if (this.isGrid())
        {
            // grid filter
            this.set('gridFilter', newFilters);

            if (Ext.isEmpty(newFilters))
            {
                remove = true;
            }
        }
        else
        {
            throw this.$className + '.replace() is not supported for OLAP filters';
        }

        // This is a bit of an optimization, but there is no need to initialize
        // the filter if it is about to be removed
        if (!remove)
        {
            this._initFilter();
        }

        callback.call(scope, this, remove);
    },

    _replacePlotMeasures : function(sourceMeasure, oldFilters, newFilters)
    {
        var remove = false;

        Ext.each(this.get('plotMeasures'), function(plotMeasure, i)
        {
            if (plotMeasure && i < 2) // only examine x, y
            {
                if (plotMeasure.measure.options.dimensions[sourceMeasure.alias])
                {
                    if (Ext.isEmpty(newFilters))
                    {
                        remove = true;
                    }
                    else if (newFilters.length == 1)
                    {
                        var value = newFilters[0].getValue();
                        if (newFilters[0].getFilterType() === LABKEY.Filter.Types.IN)
                        {
                            value = value.split(';');
                        }
                        else
                        {
                            value = [value];
                        }

                        plotMeasure.measure.options.dimensions[sourceMeasure.alias] = value;
                    }
                    else
                    {
                        throw this.$className + '.replace() does not support multiple filters for a measure.option.dimension.';
                    }

                    return false;
                }

                // TODO: Support situational filters
            }
        }, this);

        return remove;
    },

    hasMultiLevelMembers: function() {
        var level = 0;
        var hasMultiLevel = false;
        var members = this.get('members');
        if (members) {
            Ext.each(members, function(member) {
                if (member) {
                    var levelCount = (member.uniqueName.match(/\[/g) || []).length;
                    if (levelCount > 0 && level === 0) {
                        level = levelCount;
                    }
                    if (levelCount !== level) {
                        hasMultiLevel = true;
                    }
                }
            });
        }
        return hasMultiLevel;
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
