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

        {name: 'defaultMeasures', defaultValue: []},
        {name: 'measures', defaultValue: []},
        {name: 'SQLMeasures', defaultValue: []},

        {name: 'metadata', defaultValue: undefined},
        {name: 'schemaName', defaultValue: Connector.studyContext.gridBaseSchema },
        {name: 'queryName', defaultValue: Connector.studyContext.gridBase }
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

        this.metadataTask = new Ext.util.DelayedTask(function()
        {
            Connector.getQueryService().getData(this.getWrappedMeasures(), this.onMetaData, this.onFailure, this, true /* apply compound filters */);
        }, this);

        Connector.getState().onReady(function()
        {
            this.stateReady = true;
            this.applyFilters(this.getDataFilters(), this._init, this);
        }, this);

        this.addEvents('filterchange', 'updatecolumns');
    },

    _init : function()
    {
        if (!this._ready && this.viewReady && this.stateReady)
        {
            Connector.getQueryService().onQueryReady(function(service)
            {
                this._ready = true;

                this.bindDefaultMeasures(service.getDefaultGridMeasures());

                // hook listeners
                Connector.getState().on('filterchange', this.onAppFilterChange, this);
                Connector.getApplication().on('plotmeasures', this.bindApplicationMeasures, this);

                this.bindApplicationMeasures();
                this.requestMetaData();
            }, this);
        }
    },

    bindDefaultMeasures : function(defaultMeasures)
    {
        this.set('defaultMeasures', this._wrapMeasures(defaultMeasures));
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
                Ext.Array.pluck(this.get('SQLMeasures'), 'measure'),
                Ext.Array.pluck(this.get('measures'), 'measure')
            );
        }
        return measures;
    },

    getWrappedMeasures : function()
    {
        return this.get('defaultMeasures')
                .concat(this.get('SQLMeasures'))
                .concat(this.get('measures'));
    },

    bindApplicationMeasures : function()
    {
        //
        // Cross-reference application measures
        //
        var SQLMeasures = [],
            queryService = Connector.getQueryService(),
            measureMap = {},
            sourceMap = {};

        Ext.each(Connector.getState().getFilters(), function(filter)
        {
            Ext.each(filter.getMeasureSet(), function(wrapped)
            {
                var measure = queryService.getMeasure(wrapped.measure.alias);

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

            Ext.iterate(filter.getDataFilters(), function(alias, filters)
            {
                if (alias === Connector.Filter.COMPOUND_ALIAS)
                    return;

                var measure = queryService.getMeasure(alias);

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
            }, this);
        }, this);

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
            SQLMeasures: SQLMeasures
        });

        if (!this.isActive())
        {
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
    applyFilters : function(filterArray, callback, scope, silent)
    {
        //
        // calculate the subject filter
        //
        Connector.getFilterService().getSubjects(function(filterState)
        {
            var subjectFilter = this._createSubjectFilter(filterState),
                baseFilterArray = [];

            if (subjectFilter)
            {
                baseFilterArray.push(subjectFilter);
            }

            this.set({
                subjectFilter: subjectFilter,
                baseFilterArray: baseFilterArray,
                filterArray: filterArray
            });

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
            this.applyFilters(this.getDataFilters(), function()
            {
                this.bindApplicationMeasures();

                if (this.isActive())
                {
                    this.requestMetaData();
                }
            }, this);
        }
    },

    getDataFilters : function()
    {
        var filterArray = [];

        Ext.each(Connector.getState().getFilters(), function(appFilter)
        {
            if (appFilter.isTime())
            {
                Ext.each(appFilter.getTimeFilters(), function(filter)
                {
                    filterArray.push(filter);
                    this.addToFilters(filter, appFilter.id);
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
                            this.addToFilters(filters[i], appFilter.id);
                        }
                    }
                }, this);
            }
        }, this);

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
                var newAppFilter = this.buildFilter(newFilters);

                // Creating a new grid filter
                Connector.getState().addFilter(newAppFilter);

                this.fireEvent('usergridfilter', [newAppFilter]);
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

                        var remove = appFilter.replace(oldFilters, newFilters);
                        if (remove)
                        {
                            Connector.getState().removeFilter(appFilter.id);
                        }
                        else
                        {
                            Connector.getState().updateMDXFilter(false);

                            this.filterMap = {};

                            // filters are tracked
                            // retrieve the ID of the last filter so we can track it for removal -- addFilter should possibly return this
                            this.getDataFilters();

                            this.fireEvent('usergridfilter', [appFilter]);
                        }

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

    buildFilter : function(filterArray)
    {
        return Ext.create('Connector.model.Filter', {
            hierarchy: 'Subject',
            gridFilter: filterArray,
            operator: LABKEY.app.model.Filter.OperatorTypes.OR,
            isGrid: true,
            filterSource: 'GETDATA',
            isWhereFilter: true
        });
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

    clearFilter : function(urlParam)
    {
        if (urlParam in this.filterMap)
        {
            delete this.filterMap[urlParam];
        }
    },

    /**
     * Called when a user clears a filter or all the filters via the grid filtering interface.
     * @param view
     * @param fieldKey
     * @param all
     */
    onGridFilterRemove : function(view, fieldKey, all)
    {
        var state = Connector.getState();
        Ext.iterate(this.filterMap, function(urlParam, id)
        {
            state.removeFilter(id, 'Subject');
            if (!all && urlParam.indexOf(fieldKey) > -1)
            {
                this.clearFilter(urlParam);
            }
        }, this);

        if (all)
        {
            this.filterMap = {};
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
            measures: this._wrapMeasures(measures)
        });

        this.requestMetaData();
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
     * Called whenever the query metadata has been changed.
     * @param metadata
     */
    onMetaData : function(metadata)
    {
        this.set('metadata', metadata);
        this.updateColumnModel();
    },

    /**
     * These columns are used to populate 'columnSet'
     * @returns {Array}
     */
    generateColumnSet : function()
    {
        /**
         * Explicitly ask for just the columns in the model columnSet plus some
         * hardcoded ones (i.e. the dataset (checkboard) column the generated cdsGetData subject column,
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
        var metadata = this.get('metadata');

        // The new columns will be available on the metadata query/schema
        this.set({
            schemaName: metadata.schemaName,
            queryName: metadata.queryName,
            columnSet: this.generateColumnSet()
        });

        this.applyFilters(this.get('filterArray'), function()
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
        }, this, true);
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
    }
});
