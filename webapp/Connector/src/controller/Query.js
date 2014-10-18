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
        if (!this.MEMBER_CACHE) {
            this.MEMBER_CACHE = {};
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
                schemaName: 'study',
                queryType: LABKEY.Query.Visualization.Filter.QueryType.ALL
            })],
            success: function(measures) {
                Ext.each(measures, function(measure) {
                    this.addMeasure(measure);
                }, this);
                cacheReady = true;
                doReady.call(this);
            },
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
                schemaName: 'study',
                queryName: 'SubjectVisit',
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
                            schemaName: 'study',
                            queryName: 'SubjectVisit'
                        });

                        // Add these into the MEMBER_CACHE
                        measure['alias'] = LABKEY.MeasureUtil.getAlias(measure);
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

    addMeasure : function(measure) {
        if (!Ext.isObject(this.MEMBER_CACHE[measure.alias])) {
            this.MEMBER_CACHE[measure.alias] = measure;
        }
    },

    getMeasure : function(measureAlias) {
        if (!this._ready) {
            console.warn('Requested measure before measure caching prepared.');
        }

        var cleanAlias = measureAlias.replace(/\//g, '_');
        if (Ext.isString(cleanAlias) && Ext.isObject(this.MEMBER_CACHE[cleanAlias])) {
            return Ext.clone(this.MEMBER_CACHE[cleanAlias]);
        }
        else {
            console.warn('measure cache miss:', measureAlias, 'Resolved as:', cleanAlias);
        }
    },

    getDataSorts : function() {
        var subjectVisitTableName = LABKEY.moduleContext.study.subject.tableName + 'Visit'; // SubjectVisit;

        return [{
            name: 'Container',
            schemaName: 'study',
            queryName: subjectVisitTableName
        },{
            name: Connector.studyContext.subjectColumn,
            schemaName: 'study',
            queryName: subjectVisitTableName
        },{
            name: 'Day',
            schemaName: 'study',
            queryName: subjectVisitTableName
        }];
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


    /**
     * Given a set of LABKEY.app.model.Filter filters this method will return the set of measures that are used
     * in all whereFilters with the appropriate configuration.
     * @param filters
     */
    getWhereFilterMeasures : function(filters) {
        var measures = [];

        Ext.each(filters, function(filter) {
            if (filter.get('isWhereFilter') === true) {
                var ms = this._getMeasures(filter.get('gridFilter'), true /* measure.filterArray is array of LABKEY.Filter */);
                Ext.each(ms, function(m) { measures.push(m); });
            }
        }, this);

        return measures;
    },

    /**
     * Get a LABKEY.Query.Visualization.getData configuration back based on the LABKEY.app.model.Filter given.
     * This also forces all measures to specify as 'allowNullResults' so that we only get the results back that match
     * the filters being applied.
     * @param appFilter {LABKEY.app.model.Filter} or an appFilterData
     * @returns LABKEY.Query.Visualization.getData configuration
     */
    getDataFilter : function(filterConfig, appFilter) {

        if (!Ext.isDefined(this._gridMeasures)) {
            console.error('called getDataFilter() too early. Unable to determine base measure');
        }

        var getDataConfig = {
//            joinToFirst: true,
            measures: [{
                measure: this._gridMeasures[0],
                time: 'date'
            }],
            sorts: this.getDataSorts()
        };

        getDataConfig.measures[0].measure.allowNullResults = false;

        // for each gridFilter, match it to a measure that will be used in the getData configuration
        var gridFilters = Ext.isDefined(appFilter.data) ? appFilter.get('gridFilter') : appFilter.gridFilter;
        var measures = this._getMeasures(gridFilters, false /* measure.filterArray is an array of query strings */);

        Ext.each(measures, function(measure) {
            getDataConfig.measures.push(measure);
        });

        filterConfig.getData = getDataConfig;
        filterConfig.level = '[SubjectVisit].[Day]'; // TODO: Retrieve from application metadata (cube.js)

        return filterConfig;
    },

    /**
     * Returns a set of measures based on an array of gridFilters (a.k.a. LABKEY.Filter objects)
     * @param gridFilters
     * @param filtersAreInstances
     * @returns {Array}
     * @private
     */
    _getMeasures : function(gridFilters, filtersAreInstances) {
        var measures = [];

        if (Ext.isArray(gridFilters)) {
            var measureMap = {};

            for (var g=0; g < gridFilters.length; g++) {
                var gf = gridFilters[g];
                // At times the filter can be null/undefined (e.g. when the plot specifies x-axis filters only)
                if (gf) {
                    var column = gf.getColumnName();
                    var measure = this.getMeasure(column);
                    if (measure) {
                        if (!measureMap[measure.alias]) {
                            measureMap[measure.alias] = {
                                measure: measure,
                                filterArray: []
                            };
                            measureMap[measure.alias].measure.allowNullResults = false;
                        }

                        // process the filter itself
                        if (column === measure.name) {
                            var stringFilter = gf.getURLParameterName() + '=' + gf.getURLParameterValue();
                            measureMap[measure.alias].filterArray.push(filtersAreInstances ? gf : stringFilter);
                        }
                        else {
                            // create a filter with the measure 'name' rather than the 'alias' as the column
                            var _gf = LABKEY.Filter.create(measure.name, gf.getValue(), gf.getFilterType());
                            var stringFilter = _gf.getURLParameterName() + '=' + _gf.getURLParameterValue();
                            measureMap[measure.alias].filterArray.push(filtersAreInstances ? _gf : stringFilter);
                        }

                    }
                    else {
                        console.warn('Unable to find measure for query parameter:', gf.getURLParameterName() + '=' + gf.getURLParameterValue());
                    }
                }
            }

            Ext.iterate(measureMap, function(alias, measureConfig) {
                measures.push({
                    measure: measureConfig.measure,
                    filterArray: measureConfig.filterArray,
                    time: 'date'
                });
            });
        }

        return measures;
    }
});
