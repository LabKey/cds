Ext.define('Connector.controller.Query', {

    extend: 'Ext.app.Controller',

    isService: true,

    init : function() {
        if (LABKEY.user.isSignedIn) {
            this._initCache();
        }
    },

    _initCache : function() {
        if (!this.MEMBER_CACHE) {
            this.CACHE_LOADED = false;
            this.MEMBER_CACHE = {};
        }

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
                    this.CACHE_LOADED = true;
                }, this);
            },
            scope: this
        });
    },

    _gridMeasures : undefined,

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
                    'Visit'
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
        if (!this.CACHE_LOADED) {
            console.warn('Requested measure before measure caching prepared.');
        }

        var cleanAlias = measureAlias.replace(/\//g, '_');
        if (Ext.isString(cleanAlias) && Ext.isObject(this.MEMBER_CACHE[cleanAlias])) {
            return Ext.clone(this.MEMBER_CACHE[cleanAlias]);
        }
        else {
            console.warn('measure cache miss:', measureAlias);
        }
    }
});
