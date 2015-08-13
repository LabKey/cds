/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.InfoPane', {
    extend: 'Ext.data.Model',

    fields: [
        {name: 'filter', defaultValue: undefined}, // if bound to a filter
        {name: 'memberStore'}, // type: Store
        {name: 'dimension'},
        {name: 'hierarchy'},
        {name: 'level'},
        {name: 'hierarchyLabel'},
        {name: 'hierarchyItems', defaultValue: []}, // generated array of labels
        {name: 'selectedItems', defaultValue: []},
        {name: 'operatorType', defaultValue: LABKEY.app.model.Filter.OperatorTypes.AND},
        {name: 'title'}
    ],

    constructor : function(config) {

        this.callParent([config]);

        if (!Ext.ModelManager.isRegistered('Connector.model.Members')) {
            Ext.define('Connector.model.Members', {
                extend: 'Ext.data.Model',
                fields: [
                    {name: 'uniqueName'},
                    {name: 'name'},
                    {name: 'count', type: 'int'},
                    {name: 'hasData', type: 'boolean', convert: function(val, rec) { return rec.data.count > 0; }},
                    {name: 'hasDetails', type: 'boolean', defaultValue: false},
                    {name: 'detailLink'}
                ]
            });
        }

        var store = Ext.create('Ext.data.Store', {
            model: 'Connector.model.Members',
            groupField: 'hasData'
        });
        this.set('memberStore', store);

        this.addEvents('change', 'ready');

        //
        // Determine if filter or detail based
        //
        if (this.isFilterBased()) {
            // Connector.model.Filter
            var filter = this.get('filter');

            if (!filter.isGrid() && !filter.isPlot()) {
                this.configure(null, filter.get('hierarchy'), filter.get('level'), false);
            }
        }
        else {
            this.configure(this.get('dimension'), this.get('hierarchy'), this.get('level'));
        }
    },

    createFilter : function(memberUniqueNames) {
        var members = [];
        Ext.each(memberUniqueNames, function(m) {
            members.push({
                uniqueName: m
            });
        });

        return Ext.create('Connector.model.Filter', {
            hierarchy: this.get('hierarchy').uniqueName,
            level: this.get('level').getUniqueName(),
            members: members,
            operator: this.get('operatorType')
        });
    },

    clearFilter : function(isFilter) {
        var filter = this.get('filter'), state = Connector.getState();
        isFilter ? state.removeFilter(filter.id) : state.removeSelection(filter.id);
    },

    /**
     * Can be called to have this model instance produce a set of Connector.model.Filter instances
     * from it's current configuration
     * @param members - Array of Connector.model.Members instance records
     * @param totalCount - Number of total Connector.model.Members instance records
     */
    onCompleteFilter : function(members, totalCount) {
        var uniques = [];
        Ext.each(members, function(m) {
            uniques.push(m.get('uniqueName'));
        });

        var filter = this.createFilter(uniques);
        var noopFilter = (uniques.length === totalCount) && this.isOR();
        var state = Connector.getState();

        if (this.isFilterBased()) {
            var staleFilter = this.get('filter');
            if (staleFilter) {

                var isFilter = state.isFilter(staleFilter.id);

                if (uniques.length > 0 && !noopFilter) {

                    var config = {
                        hierarchy: filter.get('hierarchy'),
                        level: filter.get('level'),
                        members: filter.get('members'),
                        operator: filter.get('operator')
                    };

                    isFilter ? state.updateFilter(staleFilter.id, config) : state.updateSelection(staleFilter.id, config);
                }
                else {
                    this.clearFilter(isFilter);
                }
            }
            else {
                console.warn('Invalid filter state. Filter not available');
            }
        }
        else if (!noopFilter) {
            state.addFilter(filter);
        }
    },


    isFilterBased : function() {
        return Ext.isDefined(this.get('filter'));
    },

    /**
     * Configures the model based on a dimension/hierarchy/level configuration.
     * Only one of these needs to be supplied in order to resolve. If a filter is supplied
     * then the model will not lookup a filter and use it as the base filter
     * @param {String} [dimName]
     * @param {String} hierName
     * @param {String} [lvlName]
     * @param {boolean} [deferToFilters=true]
     */
    configure : function(dimName, hierName, lvlName, deferToFilters) {
        this.filterMemberMap = {};

        var _deferToFilters = Ext.isBoolean(deferToFilters) ? deferToFilters : true;

        if (_deferToFilters) {
            this._configureFilter(hierName);
        }

        if (this.isFilterBased()) {

            var filter = this.get('filter'),
                members = filter.get('members');

            dimName = null;
            hierName = filter.get('hierarchy');
            lvlName = filter.get('level');

            Ext.each(members, function(member) {
                this.filterMemberMap[member.uniqueName] = true;
            }, this);
        }

        // clear out for initialization
        this.set({
            dimension: undefined,
            hierarchy: undefined,
            level: undefined
        });

        this.setDimensionHierarchy(dimName, hierName, lvlName);
    },

    _configureFilter : function(hierName) {

        this._ready = false;

        var filters = Connector.getState().getFilters(),
                hierarchy = hierName,
                activeFilter;

        Ext.each(filters, function(f) {
            if (f && !f.isPlot() && !f.isGrid() && f.get('hierarchy') === hierarchy) {
                activeFilter = f;
                return false;
            }
        });

        this.set('filter', activeFilter); // undefined is OK
    },

    setDimensionHierarchy : function(dimName, hierName, lvlName) {

        var state = Connector.getState();

        state.onMDXReady(function(mdx) {

            var dimHier = this.getDimensionHierarchy(mdx, dimName, hierName, lvlName),
                dim = dimHier.dim,
                hier = dimHier.hierarchy,
                lvl = dimHier.lvl,
                hierarchyItems = [];

            Ext.each(dim.hierarchies, function(h) {
                if (!h.hidden) {
                    hierarchyItems.push({
                        text: h.label,
                        uniqueName: h.uniqueName
                    });
                }
            }, this);

            this.suspendEvents();

            this.set({
                dimension: dim,
                hierarchy: hier,
                level: lvl,
                hierarchyLabel: hier.label,
                hierarchyItems: hierarchyItems,
                operatorType: hier.defaultOperator,
                title: dim.pluralName
            });

            if (this.isFilterBased()) {
                var filterOperator = this.get('filter').get('operator');
                if (filterOperator) {
                    this.changeOperator(filterOperator);
                }

            }

            this.resumeEvents();

            this.fireEvent('change', this);

            var filters = state.getFilters(),
                innerFilters = [],
                outerFilters = [],
                INFO_PANE_SELECTION = 'infopanecount';


            Ext.each(filters, function(f) {
                if (!f.isPlot() && !f.isGrid() && f.get('hierarchy') === hier.getUniqueName()) {
                    innerFilters.push(f);
                }
                else {
                    outerFilters.push(f);
                }
            });

            // There are not any filters on this hierarchy, just use the standard filters
            if (Ext.isEmpty(innerFilters)) {
                mdx.query({
                    onRows: [{
                        level: lvl.getUniqueName(),
                        member: 'members'
                    }],
                    useNamedFilters: [LABKEY.app.constant.STATE_FILTER],
                    showEmpty: true,
                    success: this.processMembers,
                    scope: this
                });
            }
            else {
                state.addPrivateSelection(outerFilters, INFO_PANE_SELECTION, function() {
                    mdx.query({
                        onRows: [{
                            level: lvl.getUniqueName(),
                            member: 'members'
                        }],
                        useNamedFilters: [INFO_PANE_SELECTION],
                        showEmpty: true,
                        success: function(cellset) {
                            state.removePrivateSelection(INFO_PANE_SELECTION);
                            this.processMembers(cellset, innerFilters);
                        },
                        failure: function() {
                            state.removePrivateSelection(INFO_PANE_SELECTION);
                        },
                        scope: this
                    });
                }, this);
            }

        }, this);
    },

    getDimensionHierarchy : function(mdx, dName, hName, lvlName) {

        //
        // lookup level first
        //
//        console.log(arguments);
        var lvl = mdx.getLevel(lvlName), hier, dim;
        if (lvl && lvl.hierarchy) {
//            console.log('found by lvl:', lvl.uniqueName);
            hier = lvl.hierarchy;
            dim = hier.dimension;
        }
        else {
            //
            // lookup hierarchy
            //
            hier = mdx.getHierarchy(hName);

            if (hier && hier.dimension) {
//                console.log('found by hier:', hier.uniqueName);

                // hidden hierarchy?
                lvl = hier.levels[1];
                dim = hier.dimension;
            }
            else {
                //
                // lookup by dimension
                //
                dim = mdx.getDimension(dName);

                if (dim) {
//                    console.log('found by dim:', dim.uniqueName);
                    hier = this.getDefaultHierarchy(dim);
                    lvl = hier.levels[1];
                }
            }
        }

        return {
            dim: dim,
            hierarchy: hier,
            lvl: lvl
        };
    },

    getDefaultHierarchy : function(dimension) {
        var hier;
        Ext.each(dimension.hierarchies, function(h) {
            hier = h;
            return false;
        });
        return hier;
    },

    processMembers : function(cellset) {

        // memberDefinitions - Array of arrays of member definitions {name, uniqueName}
        var memberDefinitions = cellset.axes[1].positions,
            counts = cellset.cells,
            modelDatas = [],
            selectedItems = [],
            filterBased = this.isFilterBased(),
            dim = this.get('dimension'),
            hasDetails = dim.supportsDetails;

        Ext.each(memberDefinitions, function(definition, idx) {

            var def = definition[0],
                _count = counts[idx][0].value,
                _name = LABKEY.app.model.Filter.getMemberLabel(def.name);

            modelDatas.push({
                uniqueName: def.uniqueName,
                name: _name,
                count: _count,
                hasDetails: hasDetails,
                detailLink: Connector.getService('Learn').getURL(dim, _name, 'label')
            });

            if (filterBased) {
                if (def.uniqueName in this.filterMemberMap) {
                    selectedItems.push(def.uniqueName);
                }
            }
            else {
                selectedItems.push(def.uniqueName);
            }

        }, this);

        this.set('selectedItems', selectedItems);

        var store = this.get('memberStore');
        store.loadRawData(modelDatas);
        store.group(store.groupField, 'DESC');

        this._ready = true;
        this.fireEvent('ready', this);
    },

    isReady : function() {
        return this._ready === true;
    },

    changeOperator : function(operatorType) {
        if (!this.isREQ()) {
            this.set('operatorType', operatorType);
        }
    },

    isREQ : function() {
        return this.get('operatorType').indexOf('REQ_') > -1;
    },

    isAND : function() {
        return this.get('operatorType').indexOf('AND') > -1;
    },

    isOR : function() {
        return this.get('operatorType').indexOf('OR') > -1;
    }
});
