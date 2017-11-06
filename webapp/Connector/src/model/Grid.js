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

        {name: 'filterArray', defaultValue: []},
        {name: 'baseFilterArray', defaultValue: []},
        {name: 'subjectFilter', defaultValue: undefined},
        {name: 'extraFilters', defaultValue: []},

        {name: 'defaultMeasures', defaultValue: []},
        {name: 'defaultDemographicsMeasures', defaultValue: []},
        {name: 'gridColumnMeasures', defaultValue: []},
        {name: 'SQLMeasures', defaultValue: []},

        {name: 'metadata', defaultValue: undefined},
        {name: 'schemaName', defaultValue: Connector.studyContext.gridBaseSchema},
        {name: 'queryName', defaultValue: Connector.studyContext.gridBase}
    ],

    statics: {

        getMaxRows : function()
        {
            var max = 25,
                num,
                params = LABKEY.ActionURL.getParameters();

            if (Ext.isDefined(params.maxRows))
            {
                num = parseInt(params.maxRows);
                if (Ext.isNumber(num))
                {
                    max = num;
                }
            }

            return max;
        }
    },

    constructor : function(config)
    {
        if (LABKEY.devMode)
        {
            GRID = this;
        }

        this.callParent([config]);

        this.filterMap = {}; // 'key' is column fieldKey, 'value' is Id of Connector.model.Filter instance

        this.stateReady = false;
        this.viewReady = false;
        this._ready = false;

        this.metadataTask = new Ext.util.DelayedTask(function () {
            this.set('metadata', {});
            var scope = this, activeDataSource = this.get('dataSource');
            Ext.each(this.getSources(), function (s) {
                var source = s.source;
                var onMetadata = function (source) {
                    return function (metadata) {
                        /**
                         * Called whenever the query metadata has been changed.
                         * @param metadata
                         */
                        var metadatas = scope.get('metadata');
                        metadatas[source] = metadata;
                        scope.set('metadata', metadatas);
                        if (source === scope.get("dataSource") || (!activeDataSource && source === QueryUtils.DATA_SOURCE_STUDY_AND_TIME)) {
                            scope.updateColumnModel();
                        }
                    }
                }(source);

                var isDemographicsOnlyQuery = source === QueryUtils.DATA_SOURCE_SUBJECT_CHARACTERISTICS;
                var extraFilters = isDemographicsOnlyQuery ? this.getDemographicsSubjectFilters() : this.get('extraFilters');

                Connector.getQueryService().getData(this.getWrappedSourceMeasures(source), onMetadata, this.onFailure, this, extraFilters, {
                    dataSource: source,
                    demographicsOnly: isDemographicsOnlyQuery
                });
            }, this);
        }, this);

        Connector.getState().onReady(function ()
        {
            this.stateReady = true;
            this.applyFilters(this._init, this);
        }, this);

        this.addEvents('filterchange', 'updatecolumns');
    },

    getDemographicsSubjectFilters: function ()
    {
        var subjectValue, subjectAlias = Connector.getQueryService().getSubjectColumnAlias().toLowerCase();
        Ext.each(this.get('defaultMeasures'), function(defaultMeasure)
        {
            if (defaultMeasure.measure.alias.toLowerCase() === subjectAlias)
            {
                subjectValue = defaultMeasure.filterArray[0].getValue();
                return false;
            }
        });
        return [LABKEY.Filter.create(QueryUtils.DEMOGRAPHICS_SUBJECT_ALIAS, subjectValue, LABKEY.Filter.Types.IN)];
    },

    _init : function()
    {
        if (!this._ready && this.viewReady && this.stateReady)
        {
            Connector.getQueryService().onQueryReady(function(service)
            {
                this._ready = true;

                this.bindDefaultMeasures(service.getDefaultGridMeasures(), service.getDefaultDemographicsMeasures());

                // hook listeners
                Connector.getState().on('filterchange', this.onAppFilterChange, this);
                Connector.getApplication().on('plotmeasures', this.bindApplicationMeasures, this);

                this.bindApplicationMeasures();
                this.requestMetaData();
            }, this);
        }
    },

    bindDefaultMeasures: function (defaultMeasures, defaultDemographicsMeasures)
    {
        this.set('defaultMeasures', this._wrapMeasures(defaultMeasures));
        this.set('defaultDemographicsMeasures', this._wrapMeasures(defaultDemographicsMeasures));
        this._updateDefaultSubjectMeasure(this.get('subjectFilter'));
    },

    _wrapMeasures : function(measures)
    {
        var wrapped = [];

        Ext.each(measures, function(measure)
        {
            var w = {
                measure: measure
            };

            if (w.measure.variableType === 'TIME')
            {
                w.measure.interval = w.measure.alias;
                w.dateOptions = {
                    interval: w.measure.alias,
                    zeroDayVisitTag: null
                }
            }

            wrapped.push(w);
        });

        return wrapped;
    },

    _updateDefaultSubjectMeasure : function(subjectFilter)
    {
        var subjectMeasure,
            subjectAlias = Connector.getQueryService().getSubjectColumnAlias().toLowerCase();

        // find the subjectMeasure
        Ext.each(this.get('defaultMeasures'), function(defaultMeasure)
        {
            if (defaultMeasure.measure.alias.toLowerCase() === subjectAlias)
            {
                subjectMeasure = defaultMeasure;

                // respected by filter displays
                subjectMeasure.isBaseMeasure = true;
                return false;
            }
        });

        if (subjectMeasure)
        {
            if (subjectFilter)
            {
                subjectMeasure.filterArray = [subjectFilter];
            }
            else
            {
                subjectMeasure.filterArray = [];
            }
        }
    },


    /**
     * The 'raw' measures the grid receives are wrapped during processing so they can
     * be consumed by LABKEY.Query.Visualization.getData.
     * @param {String} [measureType=undefined]
     * @returns {Array}
     */
    getMeasures : function(measureType)
    {
        var measures = [];

        if (Ext.isString(measureType))
        {
            Ext.each(this.get(measureType), function(m)
            {
                measures.push(m.measure);
            });
        }
        else
        {
            return Ext.Array.push(
                    Ext.Array.pluck(this.get('defaultMeasures'), 'measure'),
                    Ext.Array.pluck(this.getCurrentSheetSQLMeasures(), 'measure'),
                    Ext.Array.pluck(this.getCurrentSheetGridColumnMeasures(), 'measure')
            );
        }
        return measures;
    },

    getDefaultWrappedMeasures: function(dataSource)
    {
        if (dataSource === QueryUtils.DATA_SOURCE_SUBJECT_CHARACTERISTICS || this.isDemographicsTab())
            return this.get('defaultDemographicsMeasures');
        return this.get('defaultMeasures');
    },

    getWrappedMeasures: function ()
    {
        return this.getDefaultWrappedMeasures()
                .concat(this.getCurrentSheetSQLMeasures())
                .concat(this.getCurrentSheetGridColumnMeasures());
    },

    getWrappedSourceMeasures: function (dataSource)
    {
        return this.getDefaultWrappedMeasures(dataSource)
                .concat(this.getDataSourceMeasures(this.getSQLMeasures(), dataSource))
                .concat(this.getDataSourceMeasures(this.getGridColumnMeasures(), dataSource));
    },

    getGridColumnMeasures: function ()
    {
        return this.get('gridColumnMeasures');
    },

    getCurrentSheetGridColumnMeasures: function ()
    {
        return this.getCurrentSheetMeasures(this.getGridColumnMeasures());
    },

    getSQLMeasures: function ()
    {
        return this.get('SQLMeasures');
    },

    getCurrentSheetSQLMeasures: function ()
    {
        return this.getCurrentSheetMeasures(this.getSQLMeasures());
    },

    getCurrentSheetMeasures: function (measures)
    {
        var activeSheet = this.get("dataSource");
        return this.getDataSourceMeasures(measures, activeSheet);
    },

    getDataSourceMeasures: function (measures, dataSource)
    {
        var measureGroups = Connector.grid.Panel.groupColumns(measures, true);
        var sourceMeasures = [];
        Ext.each(measureGroups, function (group) {
            var include = false;
            if (dataSource === group.text)
                include = true;
            else if (group.text === QueryUtils.DATA_SOURCE_STUDY_AND_TIME || group.text === QueryUtils.DATA_SOURCE_STUDY_AND_TREATMENT)
                include = dataSource !== QueryUtils.DATA_SOURCE_SUBJECT_CHARACTERISTICS;

            if (include)
                sourceMeasures = sourceMeasures.concat(group.columns);
        });
        return sourceMeasures;
    },

    getAllWrappedMeasures: function (includeDemographicDefaults)
    {
        var measures = includeDemographicDefaults ? this.get('defaultDemographicsMeasures') : [];
        return measures
                .concat(this.get('defaultMeasures'))
                .concat(this.getSQLMeasures())
                .concat(this.getGridColumnMeasures());
    },

    getSources: function ()
    {
        var allMeasures = this.getAllWrappedMeasures(false);
        var groups = Connector.grid.Panel.groupColumns(allMeasures, true);
        var sources = [];
        Ext.each(groups, function (group) {
            sources.push({
                source: group.text
            })
        });
        return sources;
    },

    getDataSource: function ()
    {
        return this.get("dataSource");
    },

    hasValidSource: function (targetSource)
    {
        var isValid = false;
        Ext.each(this.getSources(), function (source) {
            if (source.source === targetSource)
            {
                isValid = true;
                return false;
            }
        });
        return isValid;
    },

    isValidDataSource: function ()
    {
        var selectedDataSource = this.getDataSource();
        return this.hasValidSource(selectedDataSource);
    },

    isDemographicsTab: function()
    {
        return this.getDataSource() === QueryUtils.DATA_SOURCE_SUBJECT_CHARACTERISTICS;
    },

    hasDemographics: function()
    {
        return this.hasValidSource(QueryUtils.DATA_SOURCE_SUBJECT_CHARACTERISTICS);
    },

    bindApplicationMeasures : function()
    {
        //
        // Cross-reference application measures
        //
        var SQLMeasures = [],
            plotFilters = [],
            extraFilters = [],
            queryService = Connector.getQueryService(),
            measureMap = {},
            sourceMap = {};

        Ext.each(Connector.getState().getFilters(), function(filter)
        {
            // Always include the set of measures each filter describes
            Ext.each(filter.getMeasureSet(), function(wrapped)
            {
                var measure = queryService.getMeasure(wrapped.measure.alias, 'child');

                if (measure)
                {
                    var mapAlias = QueryUtils.ensureAlignmentAlias(wrapped),
                        includeDateOptions = measure.variableType === 'TIME';

                    if (!measureMap[mapAlias])
                    {
                        measureMap[mapAlias] = {
                            measure: measure,
                            filterArray: []
                        };

                        if (includeDateOptions)
                        {
                            measureMap[mapAlias].dateOptions = Ext.clone(wrapped.dateOptions);
                        }

                        sourceMap[measure.schemaName + '|' + measure.queryName] = true;
                    }
                }
                else
                {
                    console.warn('Unable to determine measure:', wrapped.measure.alias);
                }
            }, this);

            if (filter.isPlot())
            {
                plotFilters.push(filter);
            }
            else
            {
                extraFilters = this._processDataFilters(filter, measureMap, sourceMap, extraFilters);
            }
        }, this);

        if (plotFilters.length > 0)
        {
            // no need to compound a single filter
            if (plotFilters.length == 1)
            {
                extraFilters = this._processDataFilters(plotFilters[0], measureMap, sourceMap, extraFilters);
            }
            else
            {
                extraFilters = this._compound(plotFilters, measureMap, sourceMap, extraFilters);
            }
        }

        // gather required columns from each source
        Ext.iterate(sourceMap, function(sourceKey)
        {
            var dimensions = queryService.getDimensions.apply(queryService, sourceKey.split('|'));
            if (!Ext.isEmpty(dimensions))
            {
                Ext.each(dimensions, function(dim)
                {
                    if (!measureMap[dim.alias])
                    {
                        measureMap[dim.alias] = {
                            measure: dim,
                            filterArray: []
                        }
                    }
                });
            }
        });

        Ext.iterate(measureMap, function(alias, measureConfig)
        {
            SQLMeasures.push(measureConfig);
        });

        this.set({
            SQLMeasures: SQLMeasures,
            extraFilters: extraFilters
        });

        if (!this.isActive())
        {
            this.activeMeasure = true;
        }

        this.fireEvent('datasourceupdate');
    },

    _sourceKey : function(measure)
    {
        var source = measure.schemaName + '|' + measure.queryName;
        return source.toLowerCase();
    },

    /**
     * Takes an array of Connector.model.Filter instances and generates a set of compound filters
     * based on source type for a each dimension (x/y).
     * @private
     */
    _compound : function(appFilters, measureMap, sourceMap, extraFilters)
    {
        var filtersBySource = {},
            compound;

        Ext.each(appFilters, function(filter)
        {
            if (filter.isPlot())
            {
                var xSource = filter.get('xSource'),
                    ySource = filter.get('ySource'),
                    isTime = filter.isTime(),
                    compoundMap = Ext.Array.toValueMap(filter.getMeasureSet(), function(m)
                    {
                        return m.measure.alias.toLowerCase();
                    }),
                    xFilters = [],
                    yFilters = [],
                    sourceKey;

                if (xSource)
                {
                    if (!filtersBySource[xSource])
                    {
                        filtersBySource[xSource] = [];
                    }
                }

                if (ySource)
                {
                    if (!filtersBySource[ySource])
                    {
                        filtersBySource[ySource] = [];
                    }
                }

                Ext.iterate(filter.getDataFilters(), function(alias, dataFilters)
                {
                    if (alias === Connector.Filter.COMPOUND_ALIAS)
                    {
                        filtersBySource[xSource] = filtersBySource[xSource].concat(dataFilters);
                        return false;
                    }
                    else
                    {
                        var _alias = alias.toLowerCase();
                        if (compoundMap[_alias])
                        {
                            sourceKey = this._sourceKey(compoundMap[_alias].measure);

                            if (xSource && sourceKey === xSource)
                            {
                                if (isTime)
                                {
                                    var measure = Connector.getQueryService().getMeasure(_alias);

                                    if (measure)
                                    {
                                        // ensure this filtered measure is included in the grid
                                        if (!measureMap[_alias])
                                        {
                                            measureMap[_alias] = {
                                                measure: Ext.clone(measure),
                                                filterArray: []
                                            };
                                            sourceMap[measure.schemaName + '|' + measure.queryName] = true;
                                        }

                                        // apply the filters to the base request
                                        for (var i=0; i < dataFilters.length; i++)
                                        {
                                            measureMap[_alias].filterArray.push(dataFilters[i]);
                                        }
                                    }
                                    else
                                    {
                                        throw 'Unable to find measure: "' + _alias + '"';
                                    }
                                }
                                else
                                {
                                    xFilters = xFilters.concat(dataFilters);
                                }
                            }

                            if (ySource && sourceKey === ySource)
                            {
                                yFilters = yFilters.concat(dataFilters);
                            }
                        }
                        else
                        {
                            throw 'Invalid state. Expected "' + _alias + '" to be in measureSet';
                        }
                    }
                }, this);

                if (xFilters.length > 0)
                {
                    filtersBySource[xSource].push(Connector.Filter.compound(xFilters, 'AND'));
                }

                if (yFilters.length > 0)
                {
                    filtersBySource[ySource].push(Connector.Filter.compound(yFilters, 'AND'));
                }
            }
            else
            {
                throw 'Grid does not support compounding non-plot filters.';
            }
        }, this);

        Ext.iterate(filtersBySource, function(sourceKey, compoundFilters)
        {
            if (compoundFilters.length > 0)
            {
                if (compoundFilters.length == 1)
                {
                    compound = compoundFilters[0];
                }
                else
                {
                    compound = Connector.Filter.compound(compoundFilters, 'OR');
                }

                this._applyCompoundFilterMeasures(compound, measureMap, sourceMap);
                extraFilters.push(compound);
            }
        }, this);

        return extraFilters;
    },

    /**
     * Takes a compound filter and applies the measures that make up that compound filter to the
     * provided measureMap and sourceMap.
     * @private
     */
    _applyCompoundFilterMeasures : function(compound, measureMap, sourceMap)
    {
        // process each measure alias from this compound filter
        Ext.iterate(compound.getAliases(), function(cAlias)
        {
            if (!measureMap[cAlias])
            {
                // clear to append this measure result
                var m = Connector.getQueryService().getMeasure(cAlias);
                if (m)
                {
                    measureMap[cAlias] = {
                        measure: Ext.clone(m),
                        filterArray: []
                    };

                    sourceMap[m.schemaName + '|' + m.queryName] = true;
                }
                else
                {
                    throw 'Unable to find measure "' + cAlias + '" included in compound filter.';
                }
            }
        });
    },

    /**
     * Takes a Connector.modelFilter and applies the filters data filters (getDataFilters()) to
     * the provided measureMap and sourceMap. Additionally, if any extraFilters are declared they
     * are appended to extraFilters and returned (these would be appended for compound filters for
     * example)
     * @private
     */
    _processDataFilters : function(appFilter, measureMap, sourceMap, extraFilters)
    {
        // process all non-plot filter data filters
        Ext.iterate(appFilter.getDataFilters(), function(alias, filters)
        {
            if (alias === Connector.Filter.COMPOUND_ALIAS)
            {
                Ext.each(filters, function(compound)
                {
                    this._applyCompoundFilterMeasures(compound, measureMap, sourceMap);
                    extraFilters.push(compound);
                }, this);
            }
            else
            {
                var measure = Connector.getQueryService().getMeasure(alias);

                if (measure)
                {
                    // ensure this filtered measure is included in the grid
                    if (!measureMap[measure.alias])
                    {
                        measureMap[measure.alias] = {
                            measure: Ext.clone(measure),
                            filterArray: []
                        };
                        sourceMap[measure.schemaName + '|' + measure.queryName] = true;
                    }

                    // apply the filters to the base request
                    for (var i=0; i < filters.length; i++)
                    {
                        measureMap[measure.alias].filterArray.push(filters[i]);
                    }
                }
            }
        }, this);

        return extraFilters;
    },

    /**
     * @param callback
     * @param scope
     * @param [silent=false]
     * @param [useCurrentFilters=false]
     */
    applyFilters : function(callback, scope, silent, useCurrentFilters)
    {
        //
        // calculate the subject filter
        //
        Connector.getFilterService().getSubjects(function(filterState)
        {
            var subjectFilter = this._createSubjectFilter(filterState),
                baseFilterArray = [],
                setters = {};

            if (subjectFilter)
            {
                baseFilterArray.push(subjectFilter);
            }

            setters.subjectFilter = subjectFilter;
            setters.baseFilterArray = baseFilterArray;

            if (!useCurrentFilters)
            {
                setters.filterArray = this._applyFilterSet();
            }

            this.set(setters);

            // update the default measure if available
            this._updateDefaultSubjectMeasure(subjectFilter);

            if (this.isActive())
            {
                this.activeFilter = false;
                this.activeColumn = false;
                this.activeMeasure = false;

                if (!silent)
                {
                    this.fireEvent('filterchange', this, this.getFilterArray());
                }
            }
            else
            {
                this.activeFilter = true;
            }

            if (Ext.isFunction(callback))
            {
                callback.call(scope || this);
            }

        }, this);
    },

    _createSubjectFilter : function(filterState)
    {
        var filter = undefined;

        if (filterState.hasFilters)
        {
            var subjectColumn = Connector.getQueryService().getSubjectColumnAlias(),
                    subjects = filterState.subjects;
            filter = LABKEY.Filter.create(subjectColumn, subjects.join(';'), LABKEY.Filter.Types.IN);
        }

        return filter;
    },

    /**
     * Called when the set of application filters update. Note: This will fire even when
     * the bound view might not be active
     */
    onAppFilterChange : function()
    {
        if (this._ready === true)
        {
            this.applyFilters(function()
            {
                this.bindApplicationMeasures();

                if (this.isActive())
                {
                    this.requestMetaData();
                }
            }, this);
        }
    },

    _applyFilterSet : function()
    {
        var filterArray = [],
            filterMap = {};

        Ext.each(Connector.getState().getFilters(), function(appFilter)
        {
            if (appFilter.isTime())
            {
                Ext.each(appFilter.getTimeFilters(), function(filter)
                {
                    filterArray.push(filter);
                    filterMap[this.getFilterId(filter)] = appFilter.id;
                }, this)
            }
            else
            {
                Ext.iterate(appFilter.getDataFilters(), function(alias, filters)
                {
                    if (alias !== Connector.Filter.COMPOUND_ALIAS)
                    {
                        for (var i=0; i < filters.length; i++)
                        {
                            filterArray.push(filters[i]);
                            filterMap[this.getFilterId(filters[i])] = appFilter.id;
                        }
                    }
                }, this);
            }
        }, this);

        this.filterMap = filterMap;
        return filterArray;
    },

    getBaseFilters : function()
    {
        return this.get('baseFilterArray');
    },

    /**
     * @param {boolean} [includeBaseFilters=false]
     * @returns {Array}
     */
    getFilterArray : function(includeBaseFilters)
    {
        var _array = this.get('filterArray');

        if (includeBaseFilters === true)
        {
            _array = _array.concat(this.getBaseFilters());
        }

        return _array;
    },

    /**
     * Called when a user creates/updates a filter via the grid filtering interface.
     * @param view
     * @param boundColumn
     * @param oldFilters - Contains any original filters. That is, filters that were to be modified.
     * @param newFilters - only contains new filters. That is, filters applied after the user's change
     */
    onGridFilterChange : function(view, boundColumn, oldFilters, newFilters)
    {
        if (Ext.isEmpty(oldFilters))
        {
            // create a new grid filter
            if (!Ext.isEmpty(newFilters))
            {
                this.buildFilter(newFilters, function(newAppFilter)
                {
                    // Creating a new grid filter
                    Connector.getState().addFilter(newAppFilter);

                    this.fireEvent('usergridfilter', [newAppFilter]);
                }, this);
            }
        }
        else
        {
            var filterId;

            Ext.each(oldFilters, function(oldFilter)
            {
                var id = this.hasFilter(oldFilter);
                if (id)
                {
                    filterId = id;
                    return false;
                }
            }, this);

            if (filterId)
            {
                var found = false;
                Ext.each(Connector.getState().getFilters(), function(appFilter)
                {
                    if (appFilter.id === filterId)
                    {
                        found = true;

                        appFilter.replace(oldFilters, newFilters, function(filter, remove)
                        {
                            if (remove)
                            {
                                Connector.getState().removeFilter(appFilter.id);
                            }
                            else
                            {
                                Connector.getState().updateMDXFilter(false);

                                // filters are tracked
                                // retrieve the ID of the last filter so we can track it for removal -- addFilter should possibly return this
                                this.getDataFilters();

                                this.fireEvent('usergridfilter', [appFilter]);
                            }
                        }, this);

                        return false;
                    }
                });

                if (!found)
                {
                    throw 'Unable to determine filter to modify. Possible stale filterMap?';
                }
            }
            else
            {
                throw 'Unable to determine filter to modify. Possible stale filterMap?';
            }
        }
    },

    buildFilter : function(filterArray, callback, scope)
    {
        var alias = filterArray[0].getColumnName(),
            queryService = Connector.getQueryService(),
            timeAliases = queryService.getTimeAliases(),
            visitTag,
            filter,
            timeMeasure;

        Ext.iterate(timeAliases, function(timeAlias)
        {
            // search for time aliases (possibly aligned)
            if (alias.toLowerCase().indexOf(timeAlias.toLowerCase()) === 0)
            {
                timeMeasure = queryService.getMeasure(timeAlias);
                if (alias !== timeAlias)
                {
                    visitTag = alias.replace(timeAlias + '_', '').replace(/_/g, ' ');
                }
                return false;
            }
        });

        if (timeMeasure)
        {
            var wrappedTimeMeasure = {
                measure: timeMeasure,
                dateOptions: {
                    interval: timeMeasure.alias,
                    zeroDayVisitTag: visitTag ? visitTag : null
                }
            };

            Connector.getFilterService().getTimeFilter(wrappedTimeMeasure, filterArray, function(timeFilter)
            {
                filter = Ext.create('Connector.model.Filter', {
                    operator: LABKEY.app.model.Filter.OperatorTypes.OR,
                    isTime: true,
                    isGrid: true,
                    isWhereFilter: true,
                    timeMeasure: wrappedTimeMeasure,
                    filterSource: 'GETDATA',
                    gridFilter: [timeFilter],
                    timeFilters: filterArray
                });

                callback.call(scope, filter);
            });
        }
        else
        {
            filter = Ext.create('Connector.model.Filter', {
                hierarchy: 'Subject',
                gridFilter: filterArray,
                operator: LABKEY.app.model.Filter.OperatorTypes.OR,
                isGrid: true,
                filterSource: 'GETDATA',
                isWhereFilter: true
            });

            callback.call(scope, filter);
        }
    },

    getFilterId : function(filter)
    {
        return filter.getURLParameterName() + '=' + filter.getValue();
    },

    hasFilter : function(filter)
    {
        return this.filterMap[this.getFilterId(filter)];
    },

    addToFilters : function(filter, id)
    {
        var key = this.getFilterId(filter);
        this.filterMap[key] = id;
    },

    /**
     * Called when a user clears a filter or all the filters via the grid filtering interface.
     * @param view
     * @param fieldKey
     */
    onGridFilterRemove : function(view, fieldKey)
    {
        var keysToDelete = [],
            idsToDelete = {},
            hasFilter = false;

        Ext.iterate(this.filterMap, function(urlParam, id)
        {
            if (urlParam.indexOf(fieldKey) > -1)
            {
                keysToDelete.push(urlParam);
                idsToDelete[id] = true;
                hasFilter = true;
            }
        }, this);

        if (hasFilter)
        {
            Ext.each(keysToDelete, function(key)
            {
                delete this.filterMap[key];
            }, this);

            Connector.getState().removeFilters(Ext.Object.getKeys(idsToDelete));
        }
    },

    /**
     * Called when measure selection is changed
     * @param selectedMeasures
     */
    onMeasureSelected : function(selectedMeasures)
    {
        var measures = [];
        Ext.each(selectedMeasures, function(measure)
        {
            measures.push(Ext.clone(measure.data));
        });

        this.set({
            gridColumnMeasures: this._wrapMeasures(measures)
        });

        this.requestMetaData();
        this.fireEvent('datasourceupdate');
    },

    onSheetSelected: function(newSource)
    {
        this.set({
            dataSource: newSource
        });
        this.fireEvent('datasourceupdate');
        this.updateColumnModel();
    },

    /**
     * A method that can be called for a bound view when the view is ready.
     * Normally, this would bind to a 'viewready' or 'boxready' event.
     * @param view
     */
    onViewReady : function(view)
    {
        this.viewReady = true;
        this._init();
    },

    /**
     * retrieve new column metadata based on the model configuration
     */
    requestMetaData : function()
    {
        this.metadataTask.delay(50);
    },

    /**
     * These columns are used to populate 'columnSet'
     * @returns {Array}
     */
    generateColumnSet : function()
    {
        /**
         * Explicitly ask for just the columns in the model columnSet plus some
         * hardcoded ones (i.e. the dataset (checkerboard) column the generated cds getData subject column,
         * and the 'Folder' column that will only exist for multi table join queries)
         */
        var columns = [QueryUtils.SUBJECT_ALIAS, QueryUtils.DATASET_ALIAS];

        // include and default grid columns
        columns = columns.concat(Connector.getQueryService().getDefaultGridAliases(true /* asArray */));

        // include columns for all the measures
        Ext.each(this.getWrappedMeasures(), function(wrapped)
        {
            if (wrapped.measure.alias.toLowerCase() !== QueryUtils.SUBJECT_SEQNUM_ALIAS.toLowerCase())
            {
                columns.push(QueryUtils.ensureAlignmentAlias(wrapped));
            }
        });

        return Ext.Array.unique(columns);
    },

    updateColumnModel : function()
    {
        var dataSource = this.get('dataSource');
        if (!dataSource)
            dataSource = QueryUtils.DATA_SOURCE_STUDY_AND_TIME;
        var metadata = this.get('metadata')[dataSource];
        if (!metadata)
            throw "unable to query grid";

        // The new columns will be available on the metadata query/schema
        this.set({
            schemaName: metadata.schemaName,
            queryName: metadata.queryName,
            columnSet: this.generateColumnSet()
        });

        this.applyFilters(function()
        {
            this.initialized = true;

            if (this.isActive())
            {
                this.activeColumn = false;
                this.activeFilter = false;
                this.activeMeasure = false;
                this.fireEvent('updatecolumns', this);
            }
            else
            {
                this.activeColumn = true;
            }
        }, this, true /* silent */, true /* useCurrentFilters */);
    },

    setActive : function(active)
    {
        this.set('active', active);

        if (active)
        {
            if (this.activeColumn || this.activeMeasure)
            {
                if (this.activeMeasure)
                {
                    this.requestMetaData();
                }
                else
                {
                    this.updateColumnModel();
                }
            }
            else if (this.activeFilter)
            {
                this.onAppFilterChange(Connector.getState().getFilters());
            }
        }
    },

    isActive : function()
    {
        return this.get('active') === true && this.initialized === true;
    },

    getActiveSheetMetadata: function()
    {
        var metas = this.get('metadata'), activeDataSource = this.get('dataSource'), activeMeta = null;
        Ext.iterate(metas, function(dataSource, metadata){
            if (dataSource === activeDataSource)
                activeMeta = metadata;
            else if (!activeDataSource && dataSource == QueryUtils.DATA_SOURCE_STUDY_AND_TIME)
                activeMeta = metadata;
        });
        return activeMeta;
    }
});
