Ext.define('Connector.controller.State', {

    extend : 'Ext.app.Controller',

    requires : [
        'Connector.model.State'
    ],

    defaultTitle : 'HIV Vaccine Collaborative Dataspace',

    defaultView : 'summary',

    appVersion : '0.5',

    preventRedundantHistory: true,

    init : function() {
        this.olap = this.application.olap;

        this.state = Ext.create('Ext.data.Store', {
            model : 'Connector.model.State'
        });

        this.viewController = this.application.getController('Connector');
        this.views = {};
        if (this.preventRedundantHistory) {
            this.lastAppState = '';
        }

        this.filters = []; this.selections = [];
        this.privatefilters = {};

//        if (Ext.supports.History) {
//            var me = this;
//            window.addEventListener('popstate', function(evt) {
//                me._popState(evt);
//            }, false);
//        }

        if (LABKEY.ActionURL) {
            this.urlParams = LABKEY.ActionURL.getParameters();
        }

        this.state.load();
    },

    /**
     * @private
     * The listener method for when the state is popped by the window object (Browser back button).
     * See https://developer.mozilla.org/en/DOM/window.onpopstate
     * @param evt
     */
    _popState : function(evt) {
        if (evt && evt.state && evt.state.activeView) {
            this.viewController.changeView(evt.state.activeView, [], this.defaultTitle, true);
        }
        else {
            // still in our history -- go back to beginning
            this.viewController.changeView(this.defaultView, [], this.defaultTitle);
        }
    },

    getCurrentState : function() {
        if (this.state.getCount() > 0) {
            return this.state.getAt(this.state.getCount()-1);
        }
    },

    onMDXReady : function(callback, scope) {
        var s = scope || this;
        this.olap.onReady(callback, s);
    },

    loadState : function(activeView, viewContext, idx, useLast, popState) {

        if (popState) {
            this.POP_STATE = true;
        }

        if (!idx) {
            idx = this.state.getCount()-1; // load most recent state
        }

        if (idx >= 0) {
            var s = this.state.getAt(idx).data;

            // Apply state
            Ext.apply(this, s.viewState);

            if (s.views) {
                this.views = s.views;
            }

            // Apply Filters
            if (s.filters && s.filters.length > 0) {

                // TODO: Remove this an apply grid filters properly from state
                var nonGridFilters = [];
                for (var f=0; f < s.filters.length; f++) {
                    if (!s.filters[f].data.isGrid)
                        nonGridFilters.push(s.filters[f]);
                }

                this.setFilters(nonGridFilters, true);
            }

            // Activate view
            this.activeView = (activeView ? activeView : this.defaultView);

            // Change view and do not save state since a prior state is being loaded.
            this.viewController.changeView(this.activeView, viewContext, this.defaultTitle, true);

            // Apply Selections
            if (s.selections && s.selections.length > 0) {
                this.setSelections(s.selections, true);
            }

            if (s.detail) {
                console.warn('would have set the details');
//                this.setDetail(s.detail);
            }
        }
        else if (useLast) {

            // Activate view
            this.activeView = (activeView ? activeView : this.defaultView);

            this.viewController.changeView(this.activeView, viewContext, this.defaultTitle, true);
        }

        this.manageState();
    },

    manageState : function() {
        var size = this.state.getCount();
        if (size > 20) {
            var recs = this.state.getRange(size-10, size-1);
            this.state.removeAll();
            this.state.sync();
            this.state.getProxy().clear();
            this.state.add(recs);
            this.state.sync();
        }
    },

    getState : function(lookup, defaultState) {
        if (this.state.getCount() > 0) {
            var s = this.state.getAt(this.state.getCount()-1);
            if (s.views && s.views[lookup.view]) {
                if (s.views[lookup.view].hasOwnProperty(lookup.key)) {
                    return s.views[lookup.view][lookup.key];
                }
            }
        }
        return defaultState;
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

    setState : function(lookup, state) {
        if (!this.views.hasOwnProperty(lookup.view))
            this.views[lookup.view] = {};
        this.views[lookup.view][lookup.key] = state;
    },

    updateView : function(viewname, viewstate, title, skipState) {

        this.activeView = viewname;

        if (!skipState) {
            this.updateState();
        }

        if (Ext.supports.History) {
            document.title = title || this.defaultTitle;
            var appState = viewname;
            if (viewstate && viewstate.length > 0) {
                appState = viewstate.join('/').toLowerCase();
            }

            if (!this.POP_STATE && this.preventRedundantHistory && (this.lastAppState != appState)) {
                this.lastAppState = appState;
                history.pushState({activeView : viewname}, 'Connector: ' + viewname, 'extApp.view?' + this.getURLParams() + '#' + appState);
            }
            this.POP_STATE = false;
        }
    },

    getURLParams : function() {
        var params = '';

        if (this.urlParams) {
            for (var u in this.urlParams) {
                if (this.urlParams.hasOwnProperty(u)) {
                    params += u + '=' + this.urlParams[u];
                }
            }
        }
        return params;
    },

    clearAppState : function() {
        this.lastAppState = undefined;
    },

    updateState : function() {
        if (!this._updateState) {
            this._updateState = new Ext.util.DelayedTask(function() {
                this.state.add({
                    activeView : this.activeView,
                    appVersion : this.appVersion,
                    viewState  : {},
                    views      : this.views,
                    filters    : this.getFilters(),
                    selections : this.selections
                });
                this.state.sync();
            }, this);
        }

        // coalesce state updates
        this._updateState.delay(300);
    },

    updateFilterMembers : function(id, members) {
        for (var f=0; f < this.filters.length; f++) {
            if (this.filters[f].id == id)
            {
                this.filters[f].set('members', members);
            }
        }
        this.requestFilterUpdate(true, false, true);

        // since it is silent we need to update the count seperately
        this.updateFilterCount();
    },

    getFilters : function(flat) {
        if (!this.filters || this.filters.length == 0)
            return [];

        if (!flat)
            return this.filters;

        var flatFilters = [];
        for (var f=0; f < this.filters.length; f++) {

            if (this.filters[f].isGroup()) {

                for (var s=0; s < this.filters[f].data.filters.length; s++) {
                    flatFilters.push(this.filters[f].data.filters[s]);
                }
            }
            else {
                flatFilters.push(this.filters[f]);
            }

        }

        return flatFilters;
    },

    _getFilterSet : function(filters) {

        var newFilters = [];
        for (var s=0; s < filters.length; s++) {

            if (!filters[s].$className) {
                if (filters[s].data) {
                    if (filters[s].data.filters) {
                        var subfilters = [];
                        for (var f=0; f < filters[s].data.filters.length; f++) {
                            subfilters.push(Ext.create('Connector.model.Filter', filters[s].data.filters[f].data));
                        }
                        filters[s].data.filters = subfilters;

                        newFilters.push(Ext.create('Connector.model.FilterGroup', filters[s].data));
                    }
                    else {
                        newFilters.push(Ext.create('Connector.model.Filter', filters[s].data));
                    }
                }
                else {
                    newFilters.push(Ext.create('Connector.model.Filter', filters[s]));
                }
            }
            else if (filters[s].$className == 'Connector.model.Filter' || filters[s].$className == 'Connector.model.FilterGroup')
                newFilters.push(filters[s]);
        }
        return newFilters;

    },

    hasFilters : function() {
        return this.filters.length > 0;
    },

    addFilter : function(filter, skipState) {
        return this.addFilters([filter], skipState);
    },

    addFilters : function(filters, skipState, clearSelection) {
        var _f = this.getFilters();
        if (!_f)
            _f = [];

        var newFilters = this._getFilterSet(filters);

        // new filters are always appended
        for (var f=0; f < newFilters.length; f++)
            _f.push(newFilters[f]);

        this.filters = _f;

        if (clearSelection)
            this.clearSelections(true);

        this.requestFilterUpdate(skipState, false);

        return newFilters;
    },

    setFilters : function(filters, skipState) {

        this.filters = this._getFilterSet(filters);
        this.requestFilterUpdate(skipState, false);
    },

    clearFilters : function(skipState) {
        this.filters = [];
        this.requestFilterUpdate(skipState, false);
    },

    _removeHelper : function(target, filterId, hierarchyName, uname) {

        var filterset = [];
        for (var t=0; t < target.length; t++) {

            if (target[t].id != filterId) {
                filterset.push(target[t]);
            }
            else {

                // Check if removing group
                if (target[t].isGroup())
                    continue;

                // Found the targeted filter to be removed
                var newMembers = target[t].removeMember(uname);
                if (newMembers.length > 0) {
                    target[t].set('members', newMembers);
                    filterset.push(target[t]);
                }
            }
        }

        return filterset;
    },

    removeFilter : function(filterId, hierarchyName, uname) {
        var filters = this.getFilters();
        var fs = this._removeHelper(filters, filterId, hierarchyName, uname);

        if (fs.length > 0) {
            this.setFilters(fs);
        }
        else {
            this.clearFilters();
        }
    },

    removeSelection : function(filterId, hierarchyName, uname) {

        var ss = this._removeHelper(this.selections, filterId, hierarchyName, uname);

        if (ss.length > 0) {
            this.addSelection(ss, false, true, true);
        }
        else {
            this.clearSelections(true);
        }
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
        for (var s=0; s < this.selections.length; s++)
        {
            if (this.selections[s].id == filterId) {
                this.selections[s].set('operator', value);
                this.requestSelectionUpdate(false, true);
                return;
            }
        }

        for (s=0; s < this.filters.length; s++)
        {
            if (this.filters[s].id == filterId) {
                this.filters[s].set('operator', value);
                this.requestFilterUpdate(false, true);
                return;
            }
        }
    },

    requestFilterUpdate : function(skipState, opChange, silent) {
        var olapFilters = [];
        for (var f=0; f < this.filters.length; f++) {

            if (this.filters[f].isGroup()) {
                for (var g=0; g < this.filters[f].data.filters.length; g++) {
                    olapFilters.push(this.filters[f].data.filters[g].getOlapFilter());
                }
            }
            else {
                olapFilters.push(this.filters[f].getOlapFilter());
            }
        }

        for (f=0; f < olapFilters.length; f++) {
            if (olapFilters[f].arguments.length == 0) {
                console.warn('EMPTY ARGUMENTS ON FILTER');
            }
        }

        var me = this;
        this.onMDXReady(function(mdx){
            mdx.setNamedFilter('statefilter', olapFilters);
            if (!skipState)
                me.updateState();

            if (!silent)
                me.fireEvent('filterchange', me.filters);
        }, this);
    },

    getSelections : function() {
        return this.selections;
    },

    hasSelections : function() {
        return this.selections.length > 0;
    },

    mergeFilters : function(newFilters, oldFilters, opFilters) {

        var match;
        for (var n=0; n < newFilters.length; n++) {

            match = false;
            for (var i=0; i < oldFilters.length; i++) {

                if (oldFilters[i].data.hierarchy == newFilters[n].data.hierarchy &&
                        oldFilters[i].data.isGroup == newFilters[n].data.isGroup) {

                    for (var j=0; j < newFilters[n].data.members.length; j++) {

                        match = true;
                        oldFilters[i].data.members.push(newFilters[n].data.members[j]);

                    }
                }
            }

            // did not find match
            if (!match) {
                oldFilters.push(newFilters[n]);
            }
        }

        // Issue: 15359
        if (Ext.isArray(opFilters)) {

            for (n=0; n < opFilters.length; n++) {

                for (var i=0; i < oldFilters.length; i++) {

                    if (!oldFilters[i].isGroup() && !opFilters[n].isGroup()) {

                        if (oldFilters[i].getHierarchy() == opFilters[n].getHierarchy()) {
                            oldFilters[i].set('operator', opFilters[n].getOperator());
                        }
                    }
                }
            }
        }

        return oldFilters;
    },

    addSelection : function(selections, skipState, merge, clear) {

        var newSelectors = this._getFilterSet(selections);
        var oldSelectors = this.selections;

        /* First check if a clear is requested*/
        if (clear) {
            this.selections = [];
        }

        /* Second Check if a merge is requested */
        if (merge) {
            this.selections = this.mergeFilters(newSelectors, this.selections, oldSelectors);
        }
        else {
            this.selections = newSelectors;
        }

        this.requestSelectionUpdate(skipState, false);
    },

    updateFilterCount : function() {
        this.fireEvent('filtercount', this.filters);
    },

    requestSelectionUpdate : function(skipState, opChange) {

        var sels = [];

        for (var s=0; s < this.selections.length; s++) {

            // construct the query
            sels.push(this.selections[s].getOlapFilter());
        }

        this.onMDXReady(function(mdx){
            mdx.setNamedFilter('stateSelectionFilter', sels);
        }, this);

        if (!skipState)
            this.updateState();

        this.fireEvent('selectionchange', this.selections, opChange);
    },

    moveSelectionToFilter : function() {

        // 15464
        var prunedSelections = [], found;
        for (var s=0; s < this.selections.length; s++) {
            found = false;
            for (var f=0; f < this.filters.length; f++) {
                if (this.selections[s].isEqualAsFilter(this.filters[f])) {
                    found = true;
                }
            }
            if (!found) {
                prunedSelections.push(this.selections[s]);
            }
        }

        this.addFilters(prunedSelections, false, true);
    },

    getPrivateSelection : function(name) {
        return this.privatefilters[name];
    },

    addPrivateSelection : function(selection, name) {

        var filters = [];
        if (Ext.isArray(selection))
        {
            var newSelectors = [];
            for (var s=0; s < selection.length; s++) {

                if (!selection[s].$className)
                    newSelectors.push(Ext.create('Connector.model.Filter', selection[s]));
                else if (selection[s].$className && selection[s].$className == 'Connector.model.Filter')
                    newSelectors.push(selection[s]);
            }

            this.privatefilters[name] = newSelectors;

            for (s=0; s < newSelectors.length; s++) {
                filters.push(newSelectors[s].getOlapFilter())
            }
        }

        var me = this;
        this.onMDXReady(function(mdx){

            if (Ext.isArray(selection))
            {
                mdx.setNamedFilter(name, filters);
            }
            else
            {
                mdx.setNamedFilter(name, [
                    {
                        hierarchy : 'Participant',
                        membersQuery : selection
                    }
                ]);
            }
            me.fireEvent('privateselectionchange', mdx._filter[name], name);

        }, this);
    },

    removePrivateSelection : function(name) {
        var me = this;
        this.onMDXReady(function(mdx){

            mdx.setNamedFilter(name, []);
            me.privatefilters[name] = undefined;
            me.fireEvent('privateselectionchange', [], name);

        }, this);
    },

    clearSelections : function(skipState) {
        this.selections = [];
        this.requestSelectionUpdate(skipState, false);
    },

    setSelections : function(selections, skipState) {
        this.addSelection(selections, skipState);
    }
});
