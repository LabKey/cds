Ext.define('Connector.controller.Filter', {

    extend: 'Ext.app.Controller',

    isService: true,

    SUBJECT_FILTER: 'GLOBAL_SUBJECT_FILTER',

    init : function() {

        this._resetCache(true /* valid */);

        if (LABKEY.devMode) {
            FILTER = this;
        }

        this.callParent();

        Connector.getState().on('filterchange', this.onFilterChange, this);
    },

    updateSubjects : function(mdx, filters, callback, scope) {

        this._resetCache(false /* valid */);

        // if there are not any filters present, forgo requesting
        if (Ext.isEmpty(filters)) {
            this._loadCache(false, undefined);
            callback.call(scope);
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

                        callback.call(scope);
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
        this.subjectFilterCache = {
            valid: valid,
            hasFilters: false,
            subjects: undefined,
            results: undefined
        };
    }
});