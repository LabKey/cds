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

        if (config.state) {
            this.setStateManager(config.state);
        }

        this.callParent([config]);

        if (!Ext.ModelManager.isRegistered('Connector.model.Members')) {
            Ext.define('Connector.model.Members', {
                extend: 'Ext.data.Model',
                fields: [
                    {name: 'uniqueName'},
                    {name: 'name'},
                    {name: 'count', type: 'int'},
                    {name: 'hasData', type: 'boolean', convert: function(val, rec){ return rec.data.count > 0; }},
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
            this.getStateManager().onMDXReady(function(mdx) {

                var filter = this.get('filter');

                if (filter.isPlot()) {
                    this.set('title', 'In the plot');
                }
                else {
                    this.initializeModel(null, filter.get('hierarchy'), filter.get('level'));
                }

            }, this);
        }
        else {
            this.initializeModel(this.get('dimension'), this.get('hierarchy'), this.get('level'));
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
        var filter = this.get('filter'), state = this.getStateManager();
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
        var state = this.getStateManager();

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

    initializeModel : function(dimName, hierName, lvlName) {

        this.filterMemberMap = {};

        if (this.isFilterBased()) {
            var members = this.get('filter').get('members');
            Ext.each(members, function(member) {
                this.filterMemberMap[member.uniqueName] = true;
            }, this);
        }

        // clear out for initialization
        this.set('dimension', undefined);
        this.set('hierarchy', undefined);
        this.set('level', undefined);

        this.setDimensionHierarchy(dimName, hierName, lvlName);
    },

    getStateManager : function() { return this.state; },

    setStateManager : function(state) {
        this.state = state;
    },

    setDimensionHierarchy : function(dimName, hierName, lvlName) {

        this.getStateManager().onMDXReady(function(mdx) {

            var dimHier = this.getDimensionHierarchy(mdx, dimName, hierName, lvlName);
            var dim = dimHier.dim, hier = dimHier.hierarchy, lvl = dimHier.lvl;
            var hierarchyItems = [];

            Ext.each(dim.hierarchies, function(h) {
                if (!h.hidden) {
                    hierarchyItems.push({
                        text: h.label,
                        uniqueName: h.uniqueName
                    });
                }
            }, this);

            this.suspendEvents();

            this.set('dimension', dim);
            this.set('hierarchy', hier);
            this.set('level', lvl);
            this.set('hierarchyLabel', hier.label);
            this.set('hierarchyItems', hierarchyItems);
            this.set('operatorType', hier.defaultOperator);
            this.set('title', dim.pluralName);

            if (this.isFilterBased()) {
                var filterOperator = this.get('filter').get('operator');
                if (filterOperator) {
                    this.changeOperator(filterOperator);
                }

            }

            this.resumeEvents();

            this.fireEvent('change', this);

            var config = {
                onRows: [{ level: lvl.getUniqueName(), member: 'members' }],
                useNamedFilters: ['statefilter'],
                showEmpty: true,
                success: this.processMembers,
                scope: this
            };
            mdx.query(config);

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
        var memberDefinitions = cellset.axes[1].positions;
        var counts = cellset.cells;

        var modelDatas = [], selectedItems = [];
        var filterBased = this.isFilterBased();

        var dim = this.get('dimension');
        var hasDetails = this.get('dimension').supportsDetails;
        var linkPrefix = '#learn/learn/' + encodeURIComponent(dim.name) + '/';

        Ext.each(memberDefinitions, function(definition, idx) {

            var def = definition[0];
            var _count = counts[idx][0].value;
            var _name = LABKEY.app.model.Filter.getMemberLabel(def.name);

            modelDatas.push({
                uniqueName: def.uniqueName,
                name: _name,
                count: _count,
                hasDetails: hasDetails,
                detailLink: linkPrefix + encodeURIComponent(_name)
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
