/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.State', {

    extend: 'Ext.app.Controller',
    requires : [
        'Connector.model.State'
    ],

    defaultTitle: 'CAVD DataSpace',

    subjectName: 'Subject',

    supportColumnServices: true,

    /**
     * Flag that determines if filters should use the merge strategy when joining groups of filters.
     * This can be overridden by subclasses if different behavior is desired.
     * @type {boolean} useMergeFilters
     */
    useMergeFilters: true,

    useMergeSelections: false,

    isService: true,

    modelClazz: 'Connector.model.State',

    olap: undefined,

    preventRedundantHistory: true,

    _ready: false,

    init : function() {
        if (LABKEY.devMode) {
            STATE = this;
        }

        if (this.application.olap) {
            this.olap = this.application.olap;
        }

        this.callbackCache = [];

        if (LABKEY.devMode) {
            this.onMDXReady(function(mdx) { MDX = mdx; });
        }

        this.state = Ext.create('Ext.data.Store', {
            model : this.modelClazz
        });

        this.customState = {};
        this.filters = []; this.selections = [];
        this.privatefilters = {};

        if (this.supportColumnServices) {
            this.initColumnService();
        }

        this.addStateNameFilter();

        this.state.load();

        this.application.on('route', function() { this.loadState(); }, this, {single: true});

        this.mabfilters = [];

        this.onMDXReady(function(mdx) {
            Connector.model.Filter.loadSubjectContainer(mdx);
        });
    },

    addStateNameFilter : function() {
        // issue 22475: if we have multiple containers used in this session, use a state filter to remove records that don't match the name provided
        var stateNameFilter = this.getStateFilterName();
        if (stateNameFilter != null) {
            this.state.on('load', function (store, records) {
                for (var i = 0; i < records.length; i++)
                {
                    var rec = records[i];
                    if (stateNameFilter != rec.get('name')) {
                        store.remove(rec);
                    }
                }

                if (store.getCount() != records.length) {
                    this._sync();
                }
            }, this, {single: true});
        }
    },

    getState : function(lookup, defaultState) {
        if (this.state.getCount() > 0) {
            var s = this.state.getAt(this.state.getCount()-1);
            if (s.customState && s.customState[lookup.view]) {
                if (s.customState[lookup.view].hasOwnProperty(lookup.key)) {
                    return s.customState[lookup.view][lookup.key];
                }
            }
        }
        return defaultState;
    },

    /**
     * Provided to be overridden to provide a way to filter the state store on load
     * @returns {name}
     */
    getStateFilterName : function() {
        return null;
    },

    loadState: function(idx) {
        if (!idx) {
            idx = this.state.getCount() - 1; // load most recent state
        }

        if (idx >= 0) {
            var s = this.state.getAt(idx).data;
            if (s.mabfilters && s.mabfilters.length > 0) {
                this.setMabFilters(s.mabfilters, true);
            }

            if (s.selectedMAbs && s.selectedMAbs.length > 0) {
                this.updateSelectedMAbs(s.selectedMAbs, true);
            }

            // Apply state
            Ext.apply(this, s.viewState);

            if (s.customState) {
                this.customState = s.customState;
            }

            // Apply Filters
            if (Ext.isArray(s.filters) && s.filters.length > 0) {

                var _filters = [];
                Ext.each(s.filters, function(_f) {
                    _filters.push(_f);
                });

                this.setFilters(_filters, true);
            }

            // Apply Selections
            if (s.selections && s.selections.length > 0) {
                this.setSelections(s.selections, true);
            }
        }

        this.manageState();

        this._ready = true;
        this.checkReady();
    },

    checkReady : function() {
        Connector.getService('Query').onQueryReady(function() {
            this.fireReady();
            this.helpTest();
        }, this);
    },

    fireReady : function() {
        if (this._ready === true) {
            this.application.fireEvent('stateready', this);
        }
    },

    onReady : function(callback, scope) {
        if (Ext.isFunction(callback)) {
            if (this._ready === true) {
                callback.call(scope, this);
            }
            else {
                this.application.on('stateready', function() {
                    callback.call(scope, this);
                }, this, {single: true});
            }
        }
    },

    manageState : function() {
        var size = this.state.getCount(), limit = 5;
        if (size > limit) {
            this.state.removeAt(0, size-limit);
            this._sync();
        }
    },

    /**
     * Managed sync that attempts to recover in case the storage fails.
     * Ideally, this should be pushed down into the extended store instance in its own
     * sync method.
     * @param records
     * @private
     */
    _sync : function(records) {

        try
        {
            if (Ext.isArray(records)) {
                this.state.add(records);
            }
            this.state.sync();
        }
        catch (e) // QuotaExceededError
        {
            if (this.__LOCK__ !== true) {
                this.__LOCK__ = true;
                this.manageState();
                this._sync(records);
                this.__LOCK__ = false;
            }
        }
    },

    setDataSource : function(olap) {
        this.olap = olap;
        Ext.each(this.callbackCache, function(onReadyObj) {
            this.olap.onReady(onReadyObj.fn, onReadyObj.scope);
        }, this);
        this.callbackCache = [];
    },

    loadDataSource : function() {
        if (this.olap) {
            this.olap.load();
        }
        else {
            console.error('Unable to loadDataSource(). Not defined.');
        }
    },

    getCurrentState : function() {
        var c = this.state.getCount();
        if (c > 0) {
            return this.state.getAt(c-1);
        }
    },

    getPreviousState : function() {
        var index = -1, c = this.state.getCount();
        if (c > 1) {
            index = c-2;
        }
        return index;
    },

    onMDXReady : function(callback, scope) {
        var s = scope || this;
        if (this.olap) {
            this.olap.onReady(callback, s);
        }
        else {
            this.callbackCache.push({fn: callback, scope: s});
        }
    },

    isMDXReady : function() {
        return this.olap && this.olap._isReady === true;
    },

    findState : function(fn, scope, startIndex) {

        if (this.state.getCount() > 0) {
            var idx = this.state.getCount() - 1;
            var _scope = scope || this;

            if (startIndex && startIndex < idx)
                idx = startIndex;

            var rec = this.state.getAt(idx).data;
            while (!fn.call(_scope, idx, rec) && idx > 0) {
                idx--;
                rec = this.state.getAt(idx).data;
            }
            return idx;
        }
        return -1;
    },

    setCustomState : function(lookup, state) {
        if (!this.customState.hasOwnProperty(lookup.view))
            this.customState[lookup.view] = {};
        this.customState[lookup.view][lookup.key] = state;
    },

    getCustomState : function(view, key) {
        var custom = undefined;
        if (this.customState.hasOwnProperty(view)) {
            custom = this.customState[view][key];
        }
        return custom;
    },

    /**
     * Provided to be overridden to provide a custom title for view states.
     * @param viewname
     * @returns {*}
     */
    getTitle : function(viewname) {
        return viewname;
    },

    updateState : function() {

        // prepare filters
        var jsonReadyFilters = [];
        Ext.each(this.filters, function(f) {
            jsonReadyFilters.push(f.jsonify());
        });

        // prepare selections
        var jsonReadySelections = [];
        Ext.each(this.selections, function(s) {
            jsonReadySelections.push(s.jsonify());
        });

        var jsonReadyMabFilters = [];
        Ext.each(this.mabfilters, function(f) {
            jsonReadyMabFilters.push(f.jsonify());
        });

        this._sync([{
            name: this.getStateFilterName(),
            viewState: {},
            customState: this.customState,
            filters: jsonReadyFilters,
            selections: jsonReadySelections,
            mabfilters: jsonReadyMabFilters,
            selectedMAbs: this.selectedMAbs
        }]);
    },

    // Helper to let the test know that everything should be loaded
    helpTest : function() {
        Ext.getBody().addCls('appready');
    },

    initColumnListeners : function() {

        this.control('variableselector', {
            selectionmade: function(selected) {
                if (!Ext.isArray(selected)) {
                    selected = [selected];
                }

                Ext.each(selected, function(selection) {
                    if (selection.$className === 'Connector.model.Measure') {
                        this.addSessionColumn(selection.raw);
                    }
                    else if (Ext.isObject(selection)) {
                        this.addSessionColumn(selection);
                    }
                }, this);
            }
        });
    },

    getTitle : function(viewname) {
        return 'Connector: ' + viewname;
    },

    requestFilterUndo : function(isMab) {
        var index = this.getPreviousState();
        if (index > -1) {
            if (isMab)
                this.loadMabFilters(index);
            else
                this.loadFilters(index);
        }
        else {
            console.warn('FAILED TO UNDO. NOT ABLE TO FIND STATE');
        }
    },

    getFilterModelName : function() {
        return 'Connector.model.Filter';
    },

    updateFilterCount : function() {
        this.fireEvent('filtercount', this.filters);
    },

    /**
     * Override requestSelectionUpdate to allow for selections + filters to be calculated together
     * in CDS. This is due to the fact that we coalesce non-OLAP filters and thus generating filters and selections
     * as distinct sets does not result in the same query.
     * @param skipState
     * @param opChange
     * @param isMoveToFilter
     */
    requestSelectionUpdate : function(skipState, opChange, isMoveToFilter) {

        this.onMDXReady(function(mdx) {

            var sels = this.generateFilterSet(mdx, this.filters.concat(this.selections), this.subjectName);

            if (sels.length === 0) {
                mdx.clearNamedFilter(Connector.constant.State.SELECTION_FILTER);
            }
            else {
                mdx.setNamedFilter(Connector.constant.State.SELECTION_FILTER, sels);
            }

            if (!skipState)
                this.updateState();

            this.fireEvent('selectionchange', this.selections, opChange, isMoveToFilter);

        }, this);
    },

    inverseSelection : function() {
        var selections = this.getSelections(),
            data;

        // Only handle one selection
        if (selections.length > 0) {
            data = selections[0].getData();
        }

        if (data && !Ext.isEmpty(data.gridFilter)) {
            var sqlFilters = [null, null, null, null];
            var oldFilter = data.gridFilter[0];

            // Only support inverse of equal or equals one of right now
            switch (oldFilter.getFilterType()) {
                case LABKEY.Filter.Types.EQUALS_ONE_OF:
                    sqlFilters[0] = LABKEY.Filter.create(oldFilter.getColumnName(), oldFilter.getValue(), LABKEY.Filter.Types.EQUALS_NONE_OF);
                    break;
                case LABKEY.Filter.Types.EQUAL:
                    sqlFilters[0] = LABKEY.Filter.create(oldFilter.getColumnName(), oldFilter.getValue(), LABKEY.Filter.Types.NOT_EQUAL);
                    break;
                default:
                    sqlFilters = data.gridFilter;
            }

            var filter = Ext.create('Connector.model.Filter', {
                gridFilter: sqlFilters,
                plotMeasures: data.plotMeasures,
                hierarchy: data.hierarchy,
                isPlot: data.isPlot,
                isGrid: data.isGrid,
                operator: data.operator,
                filterSource: data.filterSource,
                isWhereFilter: data.isWhereFilter,
                showInverseFilter: data.showInverseFilter
            });

            this.addSelection(filter, true, false, true);
        }
    },

    moveSelectionToFilter : function() {
        var selections = this.selections;
        this.clearSelections(true, true);
        this.addFilters(selections);
        this.fireEvent('selectionToFilter', selections);
    },

    getPrivateSelection : function(name) {
        return this.privatefilters[name];
    },

    addPrivateSelection : function(selection, name, callback, scope) {

        this.onMDXReady(function(mdx) {

            var filters = [];
            if (Ext.isArray(selection)) {
                var newSelectors = [];
                for (var s=0; s < selection.length; s++) {

                    if (!selection[s].$className)
                        newSelectors.push(Ext.create(this.getFilterModelName(), selection[s]));
                    else if (selection[s].$className && selection[s].$className === this.getFilterModelName())
                        newSelectors.push(selection[s]);
                }

                this.privatefilters[name] = newSelectors;

                filters = this.generateFilterSet(mdx, newSelectors, this.subjectName);
            }

            if (Ext.isArray(selection)) {
                mdx.setNamedFilter(name, filters);
                this.fireEvent('privateselectionchange', mdx._filter[name], name);
            }
            else {
                // TODO: This is wrong for when working with perspectives
                mdx.setNamedFilter(name, [{
                    hierarchy : this.subjectName,
                    membersQuery : selection
                }]);
            }

            if (Ext.isFunction(callback)) {
                callback.call(scope || this, mdx);
            }

        }, this);
    },

    removePrivateSelection : function(name) {
        this.onMDXReady(function(mdx) {

            mdx.setNamedFilter(name, []);
            this.privatefilters[name] = undefined;
            this.fireEvent('privateselectionchange', [], name);

        }, this);
    },

    /**
     * Clears the selection.
     * @param {boolean} [skipState=false]
     * @param {boolean} [isMoveToFilter=false]
     */
    clearSelections : function(skipState, isMoveToFilter) {
        var _skip = skipState === true;
        if (this.selections.length > 0) {
            this.selections = [];
            this.requestSelectionUpdate(_skip, false, isMoveToFilter);
        }
    },

    /**
     * Set the selections. Implicitly, clears previous selections.
     * @param selections
     * @param {boolean} [skipState=false]
     */
    setSelections : function(selections, skipState) {
        var _skip = skipState === true;
        this.selections = this._getFilterSet(selections);
        this.requestSelectionUpdate(_skip, false);
    },

    /*** Column Services ***/
    initColumnService : function() {

        this.SESSION_COLUMNS = {};

        this.initColumnListeners();
    },

    addSessionColumn : function(column) {
        if (column && Ext.isString(column.alias) && !this.SESSION_COLUMNS[column.alias]) {
            this.SESSION_COLUMNS[column.alias] = column;
        }
    },

    /* WARNING: Not currently clone safe */
    getSessionColumns : function() {
        return this.SESSION_COLUMNS;
    },

    onFilterChangeReady : function(mdx, filters, callback, scope) {
        Connector.getFilterService().updateSubjects(mdx, filters, callback, scope);
    },

    onAfterFilterChange : function(mdx, filters) {
        Connector.getFilterService().onFilterChange();
    },

    generateFilterSet : function(mdx, filters, subjectName) {
        return Connector.getQueryService().configureOlapFilters(mdx, filters, subjectName);
    },

    /**
     * Adds a Connector.model.Filter to the current state
     * @param {Connector.model.Filter} filter Filter that will be added to the state
     * @param {boolean} [skipState=false] Flag if this action should cause the state to update
     * @param {boolean} [merge=undefined] Will default to useMergeFilter flag
     * @returns {*}
     */
    addFilter : function(filter, skipState, merge) {
        return this.addFilters([filter], skipState, merge);
    },

    /**
     * Adds the array of 'filters' to the current state
     * @param {Connector.model.Filter[]} filters Filters that will be added to the state
     * @param {boolean} [skipState=false] Flag if this action should cause the state to update
     * @param {boolean} [merge=undefined] Will default to useMergeFilter flag
     * @returns {*}
     */
    addFilters : function(filters, skipState, merge) {
        var _f = this.getFilters();
        var newFilters = this._getFilterSet(filters);

        var _merge = this.useMergeFilters;
        if (Ext.isBoolean(merge)) {
            _merge = merge;
        }

        if (_merge) {
            this.filters = this._mergeFilters(_f, newFilters);
        }
        else {
            this.filters = _f.concat(newFilters);
        }

        this.updateMDXFilter(skipState);

        return newFilters;
    },

    prependFilter : function(filter, skipState) {
        this.setFilters([filter].concat(this.filters), skipState);
    },

    /**
     * Updates the filter set for MDX
     * @param {boolean} [skipState=false]
     * @param {boolean} [opChange=false]
     * @param {boolean} [silent=false]
     */
    updateMDXFilter : function(skipState, opChange, silent) {

        this.onReady(function() { // wtb promises
            this.onMDXReady(function(mdx) {

                var olapFilters = this.generateFilterSet(mdx, this.filters, this.subjectName);

                var proceed = true;
                Ext.each(olapFilters, function(of) {
                    if ((!of.getData && !of.getDataCDS && !of.sql) && Ext.isEmpty(of.arguments)) {
                        console.error('Empty arguments on filter. Unable to process app filter.');
                        proceed = false;
                    }
                });

                if (proceed) {
                    if (olapFilters.length === 0) {
                        mdx.clearNamedFilter(Connector.constant.State.STATE_FILTER);
                    }
                    else {
                        mdx.setNamedFilter(Connector.constant.State.STATE_FILTER, olapFilters);
                    }

                    if (!skipState) {
                        this.updateState();
                    }

                    this.onFilterChangeReady(mdx, this.filters, function() {
                        if (!silent) {
                            this.fireEvent('filterchange', this.filters, opChange);
                        }
                        this.onAfterFilterChange(mdx, this.filters);
                    }, this);
                }

            }, this);
        }, this);
    },

    /**
     * This helper function will merge Connector.model.Filters.
     * Utilizes the Connector.model.Filter canMerge() and merge() functionality to merge like-filters.
     * @param {Connector.model.Filter[]} oldFilters Filters that will be merged into
     * @param {Connector.model.Filter[]} newFilters Filters that will be merged from
     * @returns {Connector.model.Filter[]}
     * @private
     */
    _mergeFilters : function(oldFilters, newFilters) {

        var filters = oldFilters,
            nf, merged;

        // see if each new filter can be merged, if not just append it
        for (var n=0; n < newFilters.length; n++) {
            nf = newFilters[n];
            merged = false;

            for (var i=0; i < filters.length; i++) {
                if (nf.canMerge(filters[i])) {
                    Connector.model.Filter.mergeRanges(filters[i], nf);
                    filters[i].merge(nf);
                    merged = true;
                }
            }

            if (!merged) {
                filters.push(nf);
            }
        }

        return filters;
    },

    /**
     * Allows for filters in the current filter set to be modified. The allows for modifying to be a "first-class"
     * action to take on state filters in addition to add, remove.
     * @param {Filter|Array} filter
     * @param {Object} modifications
     * @param {boolean} [skipState=false]
     */
    modifyFilter : function(filter, modifications, skipState) {

        var modificationSet,
                filterMap = Ext.Array.toMap(this.filters, 'id');

        if (!Ext.isArray(filter)) {
            modificationSet = [{
                filter: filter,
                modifications: modifications
            }];
        }
        else {
            modificationSet = filter;
        }

        // first, check that all filters are currently being tracked
        Ext.each(modificationSet, function(filterMod) {
            if (!filterMap[filterMod.filter.id]) {
                throw 'State: Can only modify filters which are currently being tracked. Invalid filter.';
            }
        });

        // modify the filters
        Ext.each(modificationSet, function(filterMod) {
            this.filters[filterMap[filterMod.filter.id] - 1 /* Ext.Array.toMap is 1-based */].set(filterMod.modifications);
        }, this);

        // update the MDX filter
        this.updateMDXFilter(skipState);
    },

    loadFilters : function(stateIndex) {
        var previousState =  this.state.getAt(stateIndex);
        if (Ext.isDefined(previousState)) {
            var filters = previousState.get('filters');
            this.setFilters(filters);
        }
        else {
            console.warn('Unable to find previous filters: ', stateIndex);
        }
    },

    loadMabFilters : function(stateIndex) {
        var previousState =  this.state.getAt(stateIndex);
        if (Ext.isDefined(previousState)) {
            var filters = previousState.get('mabfilters');
            this.setMabFilters(filters);
        }
        else {
            console.warn('Unable to find previous mab filters: ', stateIndex);
        }
    },

    getFilters : function(flat) {
        if (!this.filters || this.filters.length === 0) {
            return [];
        }

        if (!flat) {
            return this.filters;
        }

        var flatFilters = [],
            f = 0,
            data;

        for (; f < this.filters.length; f++) {
            data = Ext.clone(this.filters[f].data);
            flatFilters.push(data);
        }

        return flatFilters;
    },

    _getFilterSet : function(filters) {

        var newFilters = [],
            filterClass = this.getFilterModelName(),
            f, s, data;

        for (s = 0; s < filters.length; s++) {
            f = filters[s];

            // decipher object structure
            if (!f.$className) {
                data = f.data ? f.data : f;
                newFilters.push(Ext.create(filterClass, data));
            }
            else if (f.$className === filterClass) {
                newFilters.push(f);
            }
        }
        return newFilters;

    },

    hasFilters : function() {
        return this.filters.length > 0;
    },

    setFilters : function(filters, skipState) {
        this.filters = this._getFilterSet(filters);
        this.updateMDXFilter(skipState);
    },

    clearFilters : function(skipState) {
        this.filters = [];
        this.updateMDXFilter(skipState);
    },

    _removeHelper : function(target, filterId, hierarchyName, uniqueName) {

        var filterset = [];
        for (var t=0; t < target.length; t++) {

            if (target[t].id != filterId) {
                filterset.push(target[t]);
            }
            else {

                // Check if removing group/grid
                if (target[t].isGrid() || target[t].isPlot())
                    continue;

                // Found the targeted filter to be removed
                var newMembers = target[t].removeMember(uniqueName);
                if (newMembers.length > 0) {
                    target[t].set('members', newMembers);
                    filterset.push(target[t]);
                }
            }
        }

        return filterset;
    },

    removeFilter : function(filterId, hierarchyName, uniqueName) {
        var filters = this.getFilters();
        var fs = this._removeHelper(filters, filterId, hierarchyName, uniqueName);

        // fire filterremove, but only after filterchange fires.
        // This ensures consistent order of events.
        this.on('filterchange', function() {
            this.fireEvent('filterremove', this.getFilters());
        }, this, {single: true});

        if (fs.length > 0) {
            this.setFilters(fs);
        }
        else {
            this.clearFilters();
        }
    },

    getSelections : function(flat) {
        if (!this.selections || this.selections.length === 0) {
            return [];
        }

        if (!flat) {
            return this.selections;
        }

        var flatSelections = [];
        for (var f=0; f < this.selections.length; f++) {
            flatSelections.push(this.selections[f].data);
        }

        return flatSelections;
    },

    hasSelections : function() {
        return this.selections.length > 0;
    },

    addSelection : function(selection, skipState, merge, clear) {
        return this.addSelections([selection], skipState, merge, clear);
    },

    addSelections : function(selections, skipState, merge, clear) {

        // First check if a clear is requested
        if (clear) {
            this.selections = [];
        }

        var _s = this.getSelections(),
                newSelectors = this._getFilterSet(selections);

        var _merge = this.useMergeSelections;
        if (Ext.isBoolean(merge)) {
            _merge = merge;
        }

        if (_merge) {
            this.selections = this._mergeFilters(_s, newSelectors);
        }
        else {
            this.selections = _s.concat(newSelectors);
        }

        this.requestSelectionUpdate(skipState, false);
    },

    removeSelection : function(filterId, hierarchyName, uniqueName) {

        var ss = this._removeHelper(this.selections, filterId, hierarchyName, uniqueName);

        if (ss.length > 0) {
            this.addSelections(ss, false, true, true);
        }
        else {
            this.clearSelections();
        }

        this.fireEvent('selectionremove', this.getSelections());
    },

    /**
     * Atomically remove a set of filters.
     * @param {string[]} filterIds
     */
    removeFilters : function(filterIds) {
        var idMap = Ext.Array.toMap(filterIds),
            filterSet = [];

        Ext.each(this.getFilters(), function(filter) {
            if (!idMap[filter.id]) {
                filterSet.push(filter);
            }
        });

        // fire filterremove, but only after filterchange fires.
        // Ensures consistent order of events.
        this.on('filterchange', function() {
            this.fireEvent('filterremove', this.getFilters());
        }, this, {single: true});

        if (Ext.isEmpty(filterSet)) {
            this.clearFilters();
        }
        else {
            this.setFilters(filterSet);
        }
    },

    /**
     * This method allows for updating a filter that is already being tracked.
     * Given a filter id, the datas parameter will replace that filter's value for
     * the given key in datas. Note: This will only replace those values specified
     * leaving all other values on the filter as they were.
     * @param id
     * @param datas
     */
    updateFilter : function(id, datas) {

        Ext.each(this.filters, function(filter) {
            if (filter.id === id) {

                Ext.iterate(datas, function(key, val) {
                    filter.set(key, val);
                });

                filter.commit();

                this.updateMDXFilter();
            }
        }, this);
    },

    /**
     * This method allows for updating a selection that is already being tracked.
     * Given a selection id, the datas parameter will replace that selection's value for
     * the given key in datas. Note: This will only replace those values specified
     * leaving all other values on the selection as they were.
     * @param id
     * @param datas
     */
    updateSelection : function(id, datas) {

        Ext.each(this.selections, function(selection) {
            if (selection.id === id) {

                Ext.iterate(datas, function(key, val) {
                    selection.set(key, val);
                });

                selection.commit();

                this.requestSelectionUpdate(false);
            }
        }, this);
    },

    _is : function(filterset, id) {
        var found = false;
        Ext.each(filterset, function(f) {
            if (id === f.id) {
                found = true;
                return false;
            }
        });
        return found;
    },

    isFilter : function(id) {
        return this._is(this.filters, id);
    },

    isSelection : function(id) {
        return this._is(this.selections, id);
    },

    addGroup : function(grp) {
        if (grp.data.filters) {
            var filters = grp.data.filters;
            for (var f=0; f < filters.length; f++) {
                filters[f].groupLabel = grp.data.label;
            }
            this.addPrivateSelection(grp.data.filters, 'groupselection');
        }
    },

    setFilterOperator : function(filterId, value) {
        for (var s=0; s < this.selections.length; s++) {
            if (this.selections[s].id == filterId) {
                this.selections[s].set('operator', value);
                this.requestSelectionUpdate(false, true);
                return;
            }
        }

        for (s=0; s < this.filters.length; s++) {
            if (this.filters[s].id == filterId) {
                this.filters[s].set('operator', value);
                this.updateMDXFilter(false, true);
                return;
            }
        }
    },

    toggleMemberInclusion : function(filterId, memberIndex) {
        for (var s = 0; s < this.selections.length; s++) {
            if (this.selections[s].id == filterId) {
                var members = this.selections[s].data.members;
                if (memberIndex < members.length) {
                    members[memberIndex].isNegated = !members[memberIndex].isNegated;
                    this.selections[s].set('members', members);
                    this.requestSelectionUpdate(false, false);
                }
                else {
                    console.warn('Invalid memberIndex (' + memberIndex + ') for selected filterId: ', filterId);
                }

                return;
            }
        }

        for (s = 0; s < this.filters.length; s++) {
            if (this.filters[s].id == filterId) {
                var members = this.filters[s].data.members;
                if (memberIndex < members.length) {
                    members[memberIndex].isNegated = !members[memberIndex].isNegated;
                    this.filters[s].set('members', members);
                    this.updateMDXFilter(false, false);
                }
                else {
                    console.warn('Invalid memberIndex (' + memberIndex + ') for saved filterId: ', filterId);
                }

                return;
            }
        }
    },

    getMabFilters : function(flat) {
        if (!this.mabfilters) {
            return [];
        }

        if (!flat) {
            return this.mabfilters;
        }

        var flatMabFilters = [];
        for (var f=0; f < this.mabfilters.length; f++) {
            flatMabFilters.push(this.mabfilters[f].data);
        }

        return flatMabFilters;
    },

    setMabFilters : function(mabfilters, skipState) {
        this.mabfilters = this._getFilterSet(mabfilters);
        if (!skipState) {
            this.updateState();
        }

        this.fireEvent('mabfilterchange');
    },

    removeMabFilter : function(columnName, skipState) {
        var filterSet = [];

        Ext.each(this.getMabFilters(true), function(filter) {
            if (columnName !== filter.gridFilter[0].getColumnName()) {
                filterSet.push(filter);
            }
        });

        this.setMabFilters(filterSet, skipState);
    },

    updateMabFilter : function(columnName, newFilter, skipState) {
        var filterSet = [], updated = false;
        Ext.each(this.getMabFilters(true), function(filter) {
            if (columnName === filter.gridFilter[0].getColumnName()) {
                updated = true;
                filterSet.push(newFilter);
            }
            else {
                filterSet.push(filter);
            }
        });
        if (!updated) {
            filterSet.push(newFilter);
        }

        this.setMabFilters(filterSet, skipState);
    },

    clearMabFilters : function(skipState, fireClearEvent) {
        this.setMabFilters([], skipState);
        if (fireClearEvent)
            this.fireEvent('mabfilterclear');
    },

    getSelectedMAbs : function() {
        return this.selectedMAbs;
    },

    updateSelectedMAbs : function(mAbs, skipState) {
        this.selectedMAbs = mAbs;
        if (!skipState) {
            this.updateState();
        }
    }
});