Ext.define('Connector.controller.Filter', {

    extend: 'Ext.app.Controller',

    isService: true,

    SUBJECT_FILTER: 'GLOBAL_SUBJECT_FILTER',

    init : function() {

        this._resetCache(false /* valid */);

        if (LABKEY.devMode) {
            FILTER = this;
        }

        this.callParent();

        // Start by initializing the cache on state ready
        // This requires executing the updateSubjects/onFilterChange chain
        Connector.getState().onReady(function(state) {
            state.onMDXReady(function(mdx) {
                this.updateSubjects(mdx, state.getFilters(), this.onFilterChange, this);
            }, this);
        }, this);

        this._tagCache = [];
        this._visitCache = [];

        Ext.create('Connector.store.VisitTag', {
            singleUseOnly: true,
            autoLoad: true,
            listeners: {
                load: {
                    fn: this.onVisitTagLoad,
                    scope: this,
                    single: true
                }
            }
        });

        this._loadSubjectVisits();
    },

    updateSubjects : function(mdx, filters, callback, scope) {

        this._resetCache(false /* valid */);

        // if there are not any filters present, forgo requesting
        if (Ext.isEmpty(filters)) {
            this._loadCache(false, undefined);

            if (Ext.isFunction(callback)) {
                callback.call(scope);
            }
        }
        else {
            // TODO: Get the subject filter specifically from each filter
            Connector.getState().addPrivateSelection(filters, this.SUBJECT_FILTER, function(mdx) {
                mdx.queryParticipantList({
                    useNamedFilters: [this.SUBJECT_FILTER],
                    success : function(cellset) {
                        var subjects = [],
                                pos = cellset.axes[1].positions,
                                a = 0;

                        for (; a < pos.length; a++) {
                            subjects.push(pos[a][0].name);
                        }

                        this._loadCache(true, subjects);

                        if (Ext.isFunction(callback)) {
                            callback.call(scope);
                        }
                    },
                    scope: this
                });
            }, this);
        }
    },

    getSubjects : function(callback, scope) {

        if (this.subjectFilterCache.valid) {
            // cache hit
            callback.call(scope, {
                hasFilters: this.subjectFilterCache.hasFilters,
                subjects: this.subjectFilterCache.subjects
            });
        }
        else if (Ext.isArray(this.subjectFilterCache.results)) {
            // cache miss -- in-flight
            this.subjectFilterCache.results.push({ fn: callback, scope: scope });
        }
        else {
            // cache miss -- prep cache
            this.subjectFilterCache.results = [{fn: callback, scope: scope}];
        }
    },

    onFilterChange : function() {
        if (!this.subjectFilterCache.valid) {
            throw 'Invalid filter change configuration. Subject Filter not ready.';
        }

        if (!Ext.isEmpty(this.subjectFilterCache.results)) {
            Ext.each(this.subjectFilterCache.results, function(result) {
                result.fn.call(result.scope, {
                    hasFilters: this.subjectFilterCache.hasFilters,
                    subjects: this.subjectFilterCache.subjects
                });
            }, this);

            // clear the callback cache
            this.subjectFilterCache.results = undefined;
        }
    },

    _loadCache : function(hasFilters, subjects) {
        this.subjectFilterCache.valid = true;
        this.subjectFilterCache.hasFilters = hasFilters === true;
        this.subjectFilterCache.subjects = subjects;
    },

    _resetCache : function(valid) {
        var currentResults = this.subjectFilterCache ? this.subjectFilterCache.results : undefined;

        this.subjectFilterCache = {
            valid: valid,
            hasFilters: false,
            subjects: undefined,
            results: currentResults
        };
    },

    getSubjectVisits : function(alignmentAlias, min, max, callback, scope)
    {
        if (this._visitsLoaded)
        {
            this._querySubjectVisits(alignmentAlias, min, max, callback, scope);
        }
        else
        {
            this._visitCache.push({
                alias: alignmentAlias,
                min: min,
                max: max,
                callback: callback,
                scope: scope
            });
        }
    },

    _querySubjectVisits : function(alias, min, max, callback, scope)
    {
        if (!this._visitsLoaded)
        {
            throw '_querySubjectVisits() cannot be called before the visit cache is loaded. Use getSubjectVisits()';
        }

        var subjectVisits = [],
            realMin = Ext.isNumber(min) ? min : -10000000,
            realMax = Ext.isNumber(max) ? max : 10000000,
            value, i;

        if (!Ext.isEmpty(this._visitData))
        {
            // spot check alias
            if (!alias in this._visitData[0])
            {
                console.warn('"' + alias + '" may be an invalid time alias.');
            }

            for (i=0; i < this._visitData.length; i++)
            {
                value = this._visitData[i][alias];

                if (value >= realMin && value <= realMax)
                {
                    subjectVisits.push(this._visitData[i][QueryUtils.SUBJECT_SEQNUM_ALIAS]);
                }
            }
        }

        callback.call(scope, subjectVisits);
    },

    _loadSubjectVisits : function()
    {
        Connector.getQueryService().onQueryReady(function(queryService)
        {
            var measures = [],
                timeMeasures = [];

            Ext.iterate(queryService.getTimeAliases(), function(alias)
            {
                timeMeasures.push(queryService.getMeasure(alias));
            });

            this.getVisitTags(function(tags)
            {
                Ext.each(timeMeasures, function(measure)
                {
                    // Day/Week/Month 0
                    measures.push({
                        measure: measure,
                        dateOptions: {
                            interval: measure.alias,
                            zeroDayVisitTag: null
                        }
                    });

                    Ext.iterate(tags, function(tag)
                    {
                        measures.push({
                            measure: measure,
                            dateOptions: {
                                interval: measure.alias,
                                zeroDayVisitTag: tag
                            }
                        });
                    });
                }, this);

                queryService.getData(measures, function(metadata)
                {
                    LABKEY.Query.selectRows({
                        schemaName: metadata.schemaName,
                        queryName: metadata.queryName,
                        filterArray: [
                            LABKEY.Filter.create(QueryUtils.SEQUENCENUM_ALIAS, 0, LABKEY.Filter.Types.GREATER_THAN_OR_EQUAL)
                        ],
                        success: function(data)
                        {
                            this._visitData = data.rows;
                            this._visitsLoaded = true;

                            Ext.each(this._visitCache, function(cached)
                            {
                                this._querySubjectVisits(cached.alias, cached.min, cached.max, cached.callback, cached.scope);
                            }, this);

                            this._visitCache = [];
                        },
                        scope: this
                    });
                }, undefined, this);
            }, this);
        }, this);
    },

    getVisitTags : function(callback, scope)
    {
        if (this._tagsLoaded)
        {
            callback.call(scope, Ext.clone(this._tags));
        }
        else
        {
            this._tagCache.push({
                fn: callback,
                scope: scope
            })
        }
    },

    onVisitTagLoad : function(store)
    {
        this._tags = {};

        Ext.each(store.getRange(), function(tag)
        {
            this._tags[tag.get('Name')] = 1;
        }, this);

        this._tagsLoaded = true;

        Ext.each(this._tagCache, function(cache)
        {
            cache.fn.call(cache.scope, Ext.clone(this._tags));
        }, this);

        this._tagCache = [];
    }
});