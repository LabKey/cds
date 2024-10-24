/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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
                    success : function(cellset)
                    {
                        var subjects = Ext.Array.pluck(Ext.Array.flatten(cellset.axes[1].positions),'name');
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

    getParticipantIds : function() {
        return this.subjectFilterCache.subjects;
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

    getTimeFilter : function(wrappedTimeMeasure, timeFilters, callback, scope)
    {
        var queryService = Connector.getQueryService();

        queryService.onQueryReady(function()
        {
            var measuresArray = [];
            if (Ext.isArray(wrappedTimeMeasure)) {
                measuresArray = wrappedTimeMeasure;
            }
            else {
                measuresArray.push(wrappedTimeMeasure);
            }

            queryService.getData(measuresArray, function(metadata)
            {
                LABKEY.Query.selectRows({
                    schemaName: metadata.schemaName,
                    queryName: metadata.queryName,
                    filterArray: Ext.isArray(timeFilters) ? timeFilters : [],
                    success: function(data)
                    {
                        var subjectVisits = Ext.Array.pluck(data.rows, QueryUtils.SUBJECT_SEQNUM_ALIAS),
                            type, value;

                        if (Ext.isEmpty(subjectVisits))
                        {
                            type = LABKEY.Filter.Types.ISBLANK;
                        }
                        else
                        {
                            value = subjectVisits.join(';');
                            type = LABKEY.Filter.Types.IN;
                        }

                        callback.call(scope, LABKEY.Filter.create(QueryUtils.SUBJECT_SEQNUM_ALIAS, value, type));
                    },
                    scope: this
                });
            }, this);
        }, this);
    }
});