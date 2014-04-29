Ext.define('Connector.model.Grid', {
    extend: 'Ext.data.Model',

    fields: [
        {name: 'active', defaultValue: true},
        {name: 'columnSet', defaultValue: [
            'SubjectID', // Connector.studyContext.subjectColumn
            'StartDate'
        ]},

        /**
         * columns not reachable via getData API but joined in via the grid API.
         * Each lookup col has array of Connector.model.ColumnInfo objects.
         */
        {name: 'foreignColumns', defaultValue: {}},

        {name: 'subjectFilter', defaultValue: undefined},
        {name: 'filterArray', defaultValue: []},
        {name: 'filterState', defaultValue: {
            hasFilters: false,
            subjects: []
        }},

        {name: 'measures', defaultValue: []},

        {name: 'metadata', defaultValue: undefined},
        {name: 'wrappedMeasures', defaultValue: []},
        {name: 'schemaName', defaultValue: 'study'},
        {name: 'queryName', defaultValue: 'Demographics'},
        {name: 'sorts', defaultValue: []}
    ],

    statics: {
        addLookupColumns : function(gridModel, keyColumn, columns) {
            var foreignColumns = gridModel.get('foreignColumns');

            if (!foreignColumns[keyColumn.fieldKeyPath]) {
                return;
            }

            var names = foreignColumns[keyColumn.name];
            Ext.iterate(names, function(column, val) {
                columns.push(keyColumn.name + '/' + val.fieldKeyPath);
            });
        },

        findSourceMeasure : function(allMeasures, datasetName) {
            Ext.each(allMeasures, function(measure) {
                if (measure.name.toLowerCase() == "source/title" && measure.queryName == datasetName) {

                    var sourceMeasure = Ext.clone(measure);

                    return Ext.apply(sourceMeasure, {
                        name: sourceMeasure.name.substring(0, sourceMeasure.name.indexOf("/")), //Don't want the lookup
                        hidden: true,
                        isSourceURI: true,
                        alias: LABKEY.MeasureUtil.getAlias(sourceMeasure, true) //Can't change the name without changing the alias
                    });
                }
            });
        },

        getColumnList : function(gridModel) {
            var measures = gridModel.get('measures');
            var metadata = gridModel.get('metadata');

            var colMeasure = {};
            Ext.each(measures, function(measure) {
                colMeasure[measure.alias] = measure;
            });
            colMeasure[metadata.measureToColumn[Connector.studyContext.subjectColumn]] = {label: "Subject ID"};
            colMeasure[metadata.measureToColumn[Connector.studyContext.subjectVisitColumn + "/VisitDate"]] = {label : "Visit Date"};

            var columns = [];
            var foreignColumns = gridModel.get('foreignColumns');

            Ext.each(metadata.metaData.fields, function(column) {
                if (colMeasure[column.name]) {
                    columns.push(column.fieldKey);
                }
                if (foreignColumns[column.fieldKeyPath]) {
                    Connector.model.Grid.addLookupColumns(gridModel, column, columns);
                }
            });

            return columns;
        },

        getMetaData : function(gridModel, config) {

            var measures = gridModel.get('wrappedMeasures');
            var sorts = gridModel.getSorts();

            if (measures.length > 0 && sorts.length > 0) {
                LABKEY.Visualization.getData({
                    measures: measures,
                    sorts: sorts,
                    success: function(metadata)
                    {
                        if (Ext.isFunction(config.onSuccess)) {
                            config.onSuccess.call(config.scope, gridModel, metadata);
                        }
                    },
                    failure: config.onFailure,
                    scope: config.scope
                });
            }
            else
            {
                console.warn('0 length measures or sorts');
            }
        },

        getSubjectFilterState : function(model, callback, scope) {

            var state = model.olapProvider;

            var filterState = {
                hasFilters: state.hasFilters(),
                subjects: []
            };

            if (Ext.isFunction(callback))
            {
                if (filterState.hasFilters)
                {
                    var filters = state.getFilters(), nonGridFilters = [];

                    Ext.each(filters, function(filter)
                    {
                        if (!filter.get('isGrid'))
                        {
                            nonGridFilters.push(filter);
                        }
                    }, this);

                    if (nonGridFilters.length == 0)
                    {
                        filterState.hasFilters = false;
                        callback.call(scope || this, filterState);
                    }
                    else
                    {
                        state.onMDXReady(function(mdx)
                        {
                            state.addPrivateSelection(nonGridFilters, 'gridselection');

                            mdx.queryParticipantList({
                                useNamedFilters : ['gridselection'],
                                success : function(cs) {
                                    var ptids = [];
                                    var pos = cs.axes[1].positions;
                                    for (var a=0; a < pos.length; a++) {
                                        ptids.push(pos[a][0].name);
                                    }
                                    state.removePrivateSelection('gridselection');

                                    filterState.subjects = ptids;

                                    callback.call(scope || this, filterState);
                                },
                                scope: this
                            });
                        }, this);
                    }
                }
                else
                {
                    callback.call(scope || this, filterState);
                }
            }
        },

        queryMultiple : function(configs, success, failure, scope) {
            var outstandingQueries = configs.length,
                    results = new Array(configs.length),
                    failed = false,
                    flight = configs[0].flight;

            // map configIds to indexes
            var configMap = {}, config;
            for (var h=0; h < configs.length; h++) {
                configMap[configs[h].configId] = h;
            }

            var checkDone = function()
            {
                if (outstandingQueries == 0) {
                    if (Ext.isFunction(failure))
                        failure.call(scope);
                    else if (Ext.isFunction(success))
                        success.call(scope, results, flight);
                    else
                        console.warn('checkDone unable to find callback');
                }
            };

            var innerSuccess = function(qr, config)
            {
                var activeIdx = -1;
                for (var param in config.params) {
                    if (config.params.hasOwnProperty(param)) {
                        if (param in configMap) {
                            activeIdx = configMap[param];
                        }
                    }
                }
                results[activeIdx] = {
                    queryResult: qr,
                    configIndex: activeIdx
                };
                outstandingQueries--;
                checkDone();
            };

            var innerFailure = function()
            {
                console.error("NYI: finish failure handling");
                failed = true;
                outstandingQueries--;
                checkDone();
            };

            for (var c=0 ; c < configs.length ; c++) {
                config = Ext.apply(configs[c], {
                    success: innerSuccess,
                    failure: innerFailure
                });
                LABKEY.Query.selectDistinctRows(config);
            }
        }
    },

    constructor : function(config) {

        DGM = this;

        this.callParent([config]);

        this.flights = 0;
        this.filterMap = {}; // 'key' is column fieldKey, 'value' is Id of Connector.model.Filter instance
        this.idMap = {}; // inverse of the filterMap

        var columns = this.get('columnSet');
        var schema = this.get('schemaName');
        var query = this.get('queryName');

        var measures = [];
        Ext.each(columns, function(columnName) {
            measures.push({
                data: {
                    schemaName: schema,
                    queryName: query,
                    name: columnName
                }
            });
        });

        this.bindMeasures(measures, [], [], true);

        this.addEvents('filterchange', 'updatecolumns');
    },

    bindMeasures : function(measures, allMeasures, foreignColumns, silent) {

        var measureSet = [], sourceMeasure,
                item,
                sourceMeasuresRequired = {};  //Make sure we select the "source" measure for all datasets that have it

        Ext.each(measures, function(measure) {
            item = Ext.clone(measure.data);
            if (!(item.queryName in sourceMeasuresRequired))
                sourceMeasuresRequired[item.queryName] = true;

            //We don't want to lose foreign key info -- measure picker follows these by default
            if (item.name.indexOf("/") != -1) {
                if (item.name.toLowerCase() == "source/title") {
                    sourceMeasuresRequired[item.queryName] = false;
                    item.isSourceURI = true;
                }

                item.name = item.name.substring(0, item.name.indexOf("/"));
                item.alias = LABKEY.MeasureUtil.getAlias(item, true); //Since we changed the name need to recompute the alias
            }
            measureSet.push(item);
        });

        Ext.iterate(sourceMeasuresRequired, function(queryName, value) {
            if (value) {
                sourceMeasure = Connector.model.Grid.findSourceMeasure(allMeasures, queryName);
                if (null != sourceMeasure)
                    measureSet.push(sourceMeasure);
            }
        });

        var wrapped = [];
        Ext.each(measureSet, function(measure) {
            wrapped.push({
                measure: measure,
                time: 'visit'
            });
        });

        // set the raw measures
        this.set('measures', measureSet);

        // set the wrapped measures
        this.set('wrappedMeasures', wrapped);

        // set the foreign columns
        this.set('foreignColumns', foreignColumns);

        if (silent !== true)
        {
            this.requestMetaData();
        }
    },

    getSorts : function() {
        var measures = this.get('measures');
        var targetMeasure;

        for (var m=0; m < measures.length; m++)
        {
            if (!measures[m].isDemographic)
            {
                targetMeasure = measures[m];
                break;
            }
        }

        var schema = this.fields.map['schemaName'].defaultValue;
        var query = this.fields.map['queryName'].defaultValue;

        if (targetMeasure) {
            schema = targetMeasure.schemaName;
            query = targetMeasure.queryName;
        }

        return [{
            schemaName: schema,
            queryName: query,
            name: Connector.studyContext.subjectColumn
        },{
            schemaName: schema,
            queryName: query,
            name: Connector.studyContext.subjectVisitColumn + '/VisitDate'
        }];
    },

    /**
     * Called when the set of application filters update. Note: This will fire even when
     * the bound view might not be active
     * @param appFilters
     */
    onAppFilterChange : function(appFilters) {

        var filterArray = [], nonGridFilters = [];
        Ext.each(appFilters, function(filter) {

            if (filter.isGrid()) {
                var gridFilters = filter.get('gridFilter');
                Ext.each(gridFilters, function(gf) {
                    filterArray.push(gf);
                    this.addToFilters(gf, filter.id);
                }, this);
            }
            else {
                nonGridFilters.push(filter);
            }
        }, this);

        if (nonGridFilters.length > 0) {

            // calculate the subject filter
            Connector.model.Grid.getSubjectFilterState(this, function(filterState)
            {
                this.set('filterState', filterState);
                this.setSubjectFilter(filterState);
                this.set('filterArray', filterArray);
                if (this.isActive()) {
                    this.activeFilter = false;
                    this.fireEvent('filterchange', this, this.getFilterArray());
                }
                else {
                    this.activeFilter = true;
                }
            }, this);
        }
        else {

            this.set('filterState', {hasFilters: false, subjects: []});
            this.set('subjectFilter', undefined);
            this.set('filterArray', filterArray);
            if (this.isActive()) {
                this.activeFilter = false;
                this.fireEvent('filterchange', this, this.getFilterArray());
            }
            else {
                this.activeFilter = true;
            }
        }

    },

    setSubjectFilter : function(filterState) {
        var filter = undefined;

        if (filterState.hasFilters) {
            var subjectColumn = this.get('columnSet')[0];
            var subjects = filterState.subjects;
            filter = LABKEY.Filter.create(subjectColumn, subjects.join(';'), LABKEY.Filter.Types.IN);
        }

        this.set('subjectFilter', filter);
    },

    getFilterArray : function() {
        var _array = [];
        if (this.get('subjectFilter')) {
            _array.push(this.get('subjectFilter'));
        }
        _array = _array.concat(this.get('filterArray'));

        return _array;
    },

    /**
     * Called when a user creates/updates a filter via the grid filtering interface.
     * @param view
     * @param boundColumn
     * @param filterArray
     */
    onGridFilterChange : function(view, boundColumn, filterArray) {

        var newFilterArray = this.get('filterArray');
        newFilterArray = newFilterArray.concat(Ext.clone(filterArray));

        this.flights++;
        var configs = [],
                bins = {},
                keys = [],
                fa = newFilterArray,
                colname, f;

        for (f=0; f < fa.length; f++) {
            colname = fa[f].getColumnName();
            if (bins[colname]) {
                bins[colname].push(fa[f]);
            }
            else {
                keys.push(colname);
                bins[colname] = [fa[f]];
            }
        }

        // This must be done independently for each filter
        var schema = this.get('schemaName');
        var query = this.get('queryName');

        for (f=0; f < keys.length; f++) {
            configs.push({
                schemaName: schema,
                queryName: query,
                flight: this.flights,
                configId: bins[keys[f]][0].getURLParameterName(),
                column: this.get('columnSet')[0], // subject column?
                filterArray: bins[keys[f]],
                scope: this
            });
        }

        if (configs.length > 0) {
            Connector.model.Grid.queryMultiple(configs, function(result, flight) {
                if (flight != this.flights) {
                    return;
                }

                var groups = [], filterArrays = [];
                for (f=0; f < configs.length; f++) {
                    groups.push(result[f].queryResult.values);
                    filterArrays.push(configs[result[f].configIndex].filterArray);
                }

                if (this.gridLock) {
                    this.gridLock = false;
                    return;
                }

                this.mergeUpdatedFilters(filterArrays);

                var fa, group, found, newFilters = [];
                for (var r=0; r < groups.length; r++) {

                    fa = filterArrays[r];
                    group = groups[r];

                    if (fa.length == 0) {
                        this.removeAllGridFilters();
                        return;
                    }

                    found = false;
                    for (var f=0; f < fa.length; f++) {
                        if (!this.hasFilter(fa[f])) {
                            found = true;
                            fa[f].isNew = true;
                        }
                        else
                        {
                            var members = [];
                            for (var g=0; g < groups[r].length; g++) {
                                members.push({
                                    uniqueName: Connector.model.Filter.getSubjectUniqueName(groups[r][g])
                                });
                            }
                            this.olapProvider.updateFilterMembers(this.filterMap[this.getFilterId(fa[f])], members);
                        }
                    }

                    if (found) {
                        newFilters.push({
                            group: group,
                            filters: fa
                        });
                    }

                }

                if (newFilters.length > 0) {

                    var filters = [], filterIndexes = [], filter, f, i, grp, g;
                    for (f=0; f < newFilters.length; f++) {

                        for (i=0; i < newFilters[f].filters.length; i++) {

                            filter = {
                                hierarchy: 'Subject',
                                isGrid: true,
                                gridFilter: newFilters[f].filters[i],
                                members: []
                            };

                            grp = newFilters[f].group;
                            for (g=0; g < grp.length; g++) {
                                filter.members.push({
                                    uniqueName: Connector.model.Filter.getSubjectUniqueName(grp[g])
                                });

                            }

                            filters.push(filter);
                            filterIndexes.push([f,i]);
                        }
                    }

                    // filters are added to applicaton
                    var _newFilters = this.olapProvider.addFilters(filters);

                    // filters are tracked
                    // retrieve the ID of the last filter so we can track it for removal -- addFilter should possibly return this
                    for (f=0; f < _newFilters.length; f++) {
                        this.addToFilters(newFilters[filterIndexes[f][0]].filters[filterIndexes[f][1]], _newFilters[f].id);
                    }

                    this.gridFilter = false; // end lock
                    this.filterremove = false;
                }
            }, null, this);
        }
    },

    mergeUpdatedFilters : function(filterArrays) {

        var fa = [],
                filter,
                updated = [],
                found, f, g,
                matches = {};

        // Iterate over the set of incoming filters to determine if any filter on that column
        // already exists. If it does, place the column in the 'matches' mapping.
        Ext.each(filterArrays, function(first) {
            Ext.each(first, function(second) {
                fa.push(second);
                Ext.iterate(this.filterMap, function(urlParam, id) {
                    if (urlParam.indexOf(second.getColumnName()) > -1) {
                        matches[urlParam] = true;
                    }
                });
            }, this);
        }, this);

        // Examine the filters that met the match criteria above and determine if the current filter
        // should replace the existing filter(s) on their shared column.
        Ext.iterate(matches, function(m) {
            found = false;
            for (f=0; f < fa.length; f++) {
                if ((m == this.getFilterId(fa[f])) && !(m.indexOf(fa[f].getColumnName()) > -1))
                    found = true;
            }

            if (!found) {
                updated.push(this.filterMap[m]);
                this.clearFilter(m);
            }
        }, this);

        // Since we want to update all matching filters iterate across the entire set of application
        // filters and search for matches.
        matches = [];
        if (updated.length > 0) {
            filter = this.olapProvider.getFilters();

            for (f=0; f < filter.length; f++) {

                found = false;
                for (g=0; g < updated.length; g++) {
                    if (filter[f].id == updated[g])
                        found = true;
                }

                if (!found) {
                    matches.push(filter[f]);
                }
            }

            this.olapProvider.filters = matches;
        }
    },

    getFilterId : function(filter) {
        return filter.getURLParameterName() + '=' + filter.getValue();
    },

    hasFilter : function(filter) {
        return this.filterMap[this.getFilterId(filter)];
    },

    addToFilters : function(filter, id) {
        var key = this.getFilterId(filter);
        this.filterMap[key] = id;
        this.idMap[id] = key;
    },

    clearFilter : function(urlParam) {
        if (this.filterMap[urlParam]) {
            var id = this.filterMap[urlParam];
            delete this.filterMap[urlParam];
            delete this.idMap[id];
        }
    },

    /**
     * Called when a user clears a filter or all the filters via the grid filtering interface.
     * @param view
     * @param fieldKey
     * @param all
     */
    onGridFilterRemove : function(view, fieldKey, all) {
        if (all) {
            this.removeAllGridFilters();
        }
        else {
            Ext.iterate(this.filterMap, function(urlParam, id) {
                if (urlParam.indexOf(fieldKey) > -1) {
                    this.olapProvider.removeFilter(id, 'Subject');
                    this.clearFilter(urlParam);
                }
            }, this);
        }
    },

    removeAllGridFilters : function() {
        Ext.iterate(this.filterMap, function(urlParam, id) {
            this.olapProvider.removeFilter(id, 'Subject');
        }, this);

        this.filterMap = {};
        this.idMap = {};
    },

    /**
     * Called when measure selection is changed
     * @param selectedMeasures
     * @param allMeasures
     * @param foreignColumns
     */
    onMeasureSelected : function(selectedMeasures, allMeasures, foreignColumns) {
        this.bindMeasures(selectedMeasures, allMeasures, foreignColumns, false);
    },

    /**
     * A method that can be called for a bound view when the view is ready.
     * Normally, this would bind to a 'viewready' or 'boxready' event.
     * @param view
     */
    onViewReady : function(view) {
        this.requestMetaData();
    },

    requestMetaData : function() {
        // retrieve new column metadata based on the model configuration
        Connector.model.Grid.getMetaData(this, {
            onSuccess: this.onMetaData,
            onFailure: this.onFailure,
            scope: this
        });
    },

    /**
     * Called whenever the query metadata has been changed. Normally, this is a result
     * of a request to Connector.model.Grid.getMetaData
     * @param gridModel
     * @param metadata
     */
    onMetaData : function(gridModel, metadata) {

        this.set('metadata', metadata);

        Connector.model.Grid.getSubjectFilterState(gridModel, function(filterState)
        {
            this.set('filterState', filterState);
            this.updateColumnModel();
        }, this);
    },

    updateColumnModel : function() {
        var columns = Connector.model.Grid.getColumnList(this);
        var metadata = this.get('metadata');

        // The new columns will be available on the metadata query/schema
        this.set('schemaName', metadata.schemaName);
        this.set('queryName', metadata.queryName);
        this.set('columnSet', columns);

        this.setSubjectFilter(this.get('filterState'));

        if (this.isActive()) {
            this.activeColumn = false;
            this.fireEvent('updatecolumns', this);
        }
        else {
            this.activeColumn = true;
        }
    },

    setOlapProvider : function(olapProvider) {
        this.olapProvider = olapProvider;
    },

    setActive : function(active) {
        this.set('active', active);

        if (active) {
            if (this.activeColumn) {
                this.updateColumnModel();
            }
            else if (this.activeFilter) {
                this.onAppFilterChange(this.olapProvider.getFilters());
            }
        }
    },

    isActive : function() {
        return this.get('active') === true;
    }
});
