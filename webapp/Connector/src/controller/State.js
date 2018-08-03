/*
 * Copyright (c) 2014-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.State', {
    extend: 'LABKEY.app.controller.State',

    requires : [
        'Connector.model.State'
    ],

    defaultTitle: 'CAVD DataSpace',

    subjectName: 'Subject',

    supportColumnServices: true,

    useMergeFilters: true,

    isService: true,

    modelClazz: 'Connector.model.State',

    init : function() {
        this.callParent();

        this.mabfilters = [];

        this.onMDXReady(function(mdx) {
            Connector.model.Filter.loadSubjectContainer(mdx);
        });
    },

    loadState: function(idx) {
        if (!idx) {
            idx = this.state.getCount()-1; // load most recent state
        }

        if (idx >= 0) {
            var s = this.state.getAt(idx).data;
            if (s.mabfilters && s.mabfilters.length > 0) {
                this.setMabFilters(s.mabfilters, true);
            }

            if (s.selectedMAbs && s.selectedMAbs.length > 0) {
                this.updateSelectedMAbs(s.selectedMAbs, true);
            }
        }

        this.callParent();
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

    checkReady : function() {
        Connector.getService('Query').onQueryReady(function() {
            this.fireReady();
            this.helpTest();
        }, this);
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

    requestFilterUndo : function() {
        var index = this.getPreviousState();
        if (index > -1) {
            this.loadFilters(index);
        }
        else {
            console.warn('FAILED TO UNDO. NOT ABLE TO FIND STATE');
        }
    },

    getFilterModelName : function() {
        return 'Connector.model.Filter';
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
                mdx.clearNamedFilter(LABKEY.app.constant.SELECTION_FILTER);
            }
            else {
                mdx.setNamedFilter(LABKEY.app.constant.SELECTION_FILTER, sels);
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
        this.callParent();
        this.fireEvent('selectionToFilter', selections);
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
     * Atomically remove a set of filters.
     * @param {string[]} filterIds
     */
    removeFilters : function(filterIds)
    {
        var idMap = Ext.Array.toMap(filterIds),
            filterSet = [];

        Ext.each(this.getFilters(), function(filter)
        {
            if (!idMap[filter.id])
            {
                filterSet.push(filter);
            }
        });

        // fire filterremove, but only after filterchange fires.
        // Ensures consistent order of events.
        this.on('filterchange', function()
        {
            this.fireEvent('filterremove', this.getFilters());
        }, this, {single: true});

        if (Ext.isEmpty(filterSet))
        {
            this.clearFilters();
        }
        else
        {
            this.setFilters(filterSet);
        }
    },

    // Override to pass in isMoveToFilter param to clearSelections
    moveSelectionToFilter : function() {
        var selections = this.selections;
        this.clearSelections(true, true);
        this.addFilters(selections);
    },

    /**
     * Override
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
    },

    removeMabFilter : function(columnName, skipState) {
        var filterSet = [];

        Ext.each(this.getMabFilters(true), function(filter) {
            if (columnName !== filter.gridFilter[0].getColumnName()) {
                filterSet.push(filter);
            }
        });

        if (Ext.isEmpty(filterSet)) {
            this.clearMabFilters(skipState);
        }
        else {
            this.setMabFilters(filterSet, skipState);
        }
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

    clearMabFilters: function(skipState) {
        this.mabfilters = [];
        if (!skipState) {
            this.updateState();
        }
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