/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.InfoPane', {
    extend: 'Ext.data.Model',

    fields: [
        {name: 'filter', defaultValue: undefined}, // if bound to a filter
        {name: 'memberStore'}, // type: Store
        {name: 'dimension', defaultValue: undefined},
        {name: 'hierarchy', defaultValue: undefined},
        {name: 'level', defaultValue: undefined},
        {name: 'hierarchyLabel'},
        {name: 'hierarchyItems', defaultValue: []}, // generated array of labels
        {name: 'selectedItems', defaultValue: []},
        {name: 'operatorType', defaultValue: LABKEY.app.model.Filter.OperatorTypes.AND},
        {name: 'title'}
    ],

    constructor : function(config) {

        this.callParent([config]);

        var store = Ext.create('Ext.data.Store', {
            model: 'Connector.model.InfoPaneMember',
            groupField: 'hasData'
        });
        this.set('memberStore', store);

        this.addEvents('change', 'ready');

        //
        // Determine if filter or detail based
        //
        if (this.isFilterBased())
        {
            // Connector.model.Filter
            var filter = this.get('filter'),
                isTimepointFilter = filter.isTime() && !filter.isPlot();

            if (isTimepointFilter || (!filter.isGrid() && !filter.isPlot() && !filter.isAggregated()))
            {
                this.configure(null, filter.get('hierarchy'), filter.get('level'), false);
            }
        }
        else
        {
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
     * @param members - Array of Connector.model.InfoPaneMember instance records
     * @param totalCount - Number of total Connector.model.InfoPaneMember instance records
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
        return !this.isSelectionBased() && Ext.isDefined(this.get('filter'));
    },

    isSelectionBased : function() {
        return this.get('selection');
    },

    _configureSelection: function () {
        var selectionValue = Connector.getState().getSelections().length > 0;
        this.set('selection', selectionValue);
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
        Connector.getState().onMDXReady(function(mdx){
            this._configureSelection();
            this.filterMemberMap = {};

            var _deferToFilters = Ext.isBoolean(deferToFilters) ? deferToFilters : true;

            if (!this.isSelectionBased() && _deferToFilters){
                if (lvlName){
                    var lvl = mdx.getLevel(lvlName);
                    if (lvl && lvl.hierarchy && lvl.hierarchy.displayLevels){
                        this._configureFilter(null, lvlName);
                    }
                    else{
                        this._configureFilter(hierName);
                    }
                }
                else{
                    this._configureFilter(hierName);
                }
            }

            if (this.isFilterBased()){
                var filter = this.get('filter'),
                    members = filter.get('members');

                dimName = null;
                hierName = filter.get('hierarchy');
                lvlName = filter.get('level');

                Ext.each(members, function (member){
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
        }, this);
    },

    _configureFilter : function(hierName, lvlName) {

        this._ready = false;

        var filters = Connector.getState().getFilters(),
            hierarchy = hierName,
            level = lvlName,
            activeFilter;

        if (level) {
            Ext.each(filters, function(f) {
                if (f && !f.isPlot() && !f.isGrid() && !f.isAggregated() && !f.hasMultiLevelMembers()) {
                    if ((level && f.get('level') === level)) {
                        activeFilter = f;
                        return false;
                    }
                }
            });
        }
        else {
            Ext.each(filters, function(f) {
                if (f && !f.isPlot() && !f.isGrid() && !f.isAggregated() && f.get('hierarchy') === hierarchy && !f.hasMultiLevelMembers()) {
                    activeFilter = f;
                    return false;
                }
            });
        }

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

            var isDisplayLevel = hier ? hier.displayLevels : false;

            Ext.each(dim.hierarchies, function(h) {
                if (!h.hidden) {
                    if (!h.displayLevels) {
                        hierarchyItems.push({
                            text: h.label,
                            uniqueName: h.uniqueName
                        });
                    }
                    else {
                        Ext.each(h.levels, function(level, i) {
                            if (i > 0) {
                                hierarchyItems.push({
                                    text: level.countPlural,
                                    uniqueName: level.uniqueName,
                                    isLevel: true
                                });
                            }
                        });
                    }
                }
            }, this);

            this.suspendEvents();

            this.set({
                dimension: dim,
                hierarchy: hier,
                level: lvl,
                hierarchyLabel: hier.displayLevels? lvl.countPlural : hier.label,
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
                var isOutFilter = true;
                if (!f.isPlot() && !f.isGrid() && !f.isAggregated() && !f.hasMultiLevelMembers()) {
                    if (isDisplayLevel) {
                        if (f.get('level') === lvl.uniqueName) {
                            isOutFilter = false;
                        }
                    }
                    else if (f.get('hierarchy') === hier.getUniqueName()) {
                        isOutFilter = false;
                    }
                    innerFilters.push(f);
                }

                if (isOutFilter) {
                    outerFilters.push(f);
                }
                else {
                    innerFilters.push(f);
                }
            });

            if (this.isSelectionBased()) {
                mdx.query({
                    onRows: [{
                        level: lvl.getUniqueName(),
                        member: 'members'
                    }],
                    useNamedFilters: [LABKEY.app.constant.SELECTION_FILTER],
                    showEmpty: true,
                    success: function(cellset) {
                        this.processMembers(cellset, mdx);
                    },
                    scope: this
                });
            }
            // There are not any filters on this hierarchy (or level), just use the standard filters
            else if (Ext.isEmpty(innerFilters)) {
                mdx.query({
                    onRows: [{
                        level: lvl.getUniqueName(),
                        member: 'members'
                    }],
                    useNamedFilters: [LABKEY.app.constant.STATE_FILTER],
                    showEmpty: true,
                    success: function(cellset) {
                        this.processMembers(cellset, mdx);
                    },
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
                            this.processMembers(cellset, mdx);
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
        var lvl = mdx.getLevel(lvlName), hier, dim;
        if (lvl && lvl.hierarchy) {
            hier = lvl.hierarchy;
            dim = hier.dimension;
        }
        else {
            //
            // lookup hierarchy
            //
            hier = mdx.getHierarchy(hName);

            if (hier && hier.dimension) {
                // hidden hierarchy?
                lvl = hier.levels[1];
                for (var i = 0; i < hier.levels.length; i++) {
                    var hierLvl = hier.levels[i];
                    if (hierLvl.infoPaneDefaultLevel) {
                        lvl = hierLvl;
                        break;
                    }
                }

                dim = hier.dimension;
            }
            else {
                //
                // lookup by dimension
                //
                dim = mdx.getDimension(dName);

                if (dim) {
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


    getDimension : function(levelUniqueName, mdx) {
        var level = mdx.getLevel(levelUniqueName);

        if (level && level.supportsLearn) {
            var dimensionName = level.lookupDimension;
            return dimensionName ? mdx.getDimension(dimensionName) : this.get('dimension');
        }
    },

    getModel : function(dimension) {
        if (dimension) {
            var modelName = dimension.detailModel;
            if (modelName) {
                var tokens = modelName.split('.');
                if (tokens[0] === 'Connector' && tokens[1] === 'app' && tokens[2] === 'model') {
                    return Connector.app.model[tokens[3]];
                }
            }
        }
    },

    getFullName : function(levelUniqueName, mdx, selfUniqueName, selfName) {
        var level = mdx.getLevel(levelUniqueName);

        if (level && level.displayParent) {
            var splits = selfUniqueName.split('].[');
            if (splits.length <  2) {
                return selfName;
            }
            var parentSplit = splits[splits.length - 2];
            if (parentSplit.indexOf('[') == 0) {
                parentSplit.replace('[', '');
            }
            return parentSplit + ' - ' + selfName;
        }
        return selfName;
    },

    processMembers : function(cellset, mdx) {

        // memberDefinitions - Array of arrays of member definitions {name, uniqueName}
        var memberDefinitions = cellset.axes[1].positions,
            counts = cellset.cells,
            modelDatas = [],
            selectedItems = [],
            filterBased = this.isFilterBased(),
            dim,
            model;

        Ext.each(memberDefinitions, function(definition, idx) {

            var def = definition[0],
                    _count = counts[idx][0].value,
                    _name = LABKEY.app.model.Filter.getMemberLabel(def.name),
                    _prop = '',
                    _hasDetails;

            var _fullName = this.getFullName(def.level.uniqueName, mdx, def.uniqueName, _name);

            dim = dim ? dim : this.getDimension(def.level.uniqueName, mdx);
            model = model ? model : this.getModel(dim);

            if (model) {
                _prop = model.prototype.resolvableField;
                _hasDetails = true;
            }
            else {
                _hasDetails = false;
                _prop = '';
            }

            modelDatas.push({
                uniqueName: def.uniqueName,
                name: _fullName,
                count: _count,
                hasDetails: _hasDetails,
                detailLink: _hasDetails ? Connector.getService('Learn').getURL(dim.name, _name, _prop) : ''
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

        this.setReady();
    },

    setReady : function()
    {
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
