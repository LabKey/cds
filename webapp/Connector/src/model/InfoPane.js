Ext.define('Connector.model.InfoPane', {
    extend: 'Ext.data.Model',

    fields: [
        {name: 'filter', defaultValue: undefined}, // if bound to a filter
        {name: 'memberStore'}, // type: Store
        {name: 'dimension'},
        {name: 'hierarchy'},
        {name: 'dimensionUniqueName'},
        {name: 'hierarchyUniqueName'},
        {name: 'hierarchyLabel'},
        {name: 'hierarchyItems', defaultValue: []}, // generated array of labels
        {name: 'selectedItems', defaultValue: []},
        {name: 'operatorType', defaultValue: LABKEY.app.model.Filter.OperatorTypes.AND},
        {name: 'title'}
    ],

    constructor : function(config) {

        if (config.olapProvider) {
            this.setOlapProvider(config.olapProvider);
        }

        this.callParent([config]);

        if (!Ext.ModelManager.isRegistered('Connector.model.Members')) {
            Ext.define('Connector.model.Members', {
                extend: 'Ext.data.Model',
                fields: [
                    {name: 'uniqueName'},
                    {name: 'name'},
                    {name: 'count', type: 'int'},
                    {name: 'hasData', type: 'boolean', convert: function(val, rec){ return rec.data.count > 0; }}
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
            this.getOlapProvider().onMDXReady(function(mdx) {

                var filter = this.get('filter');
                var fHierarchy = filter.get('hierarchy');
                if (fHierarchy) {
                    if (fHierarchy.indexOf('[') == -1) {
                        fHierarchy = '[' + fHierarchy + ']';
                    }

                    // this is a little weird, some filters are initialized with dimensions in the 'hierarchy'
                    this.initializeModel(fHierarchy, fHierarchy);
                }
            }, this);
        }
        else {
            this.initializeModel(this.get('dimensionUniqueName'), this.get('hierarchyUniqueName'));
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
            hierarchy: this.get('hierarchyUniqueName'),
            members: members,
            operator: this.get('operatorType')
        });
    },

    /**
     * Can be called to have this model instance produce a set of Connector.model.Filter instances
     * from it's current configuration
     * @param members - Array of Connector.model.Members instance records
     */
    onCompleteFilter : function(members) {
        var uniques = [];
        Ext.each(members, function(m) {
            uniques.push(m.get('uniqueName'));
        });

        var filter = this.createFilter(uniques);
        this.getOlapProvider().addFilter(filter);
    },


    isFilterBased : function() {
        return Ext.isDefined(this.get('filter'));
    },

    initializeModel : function(dimName, hierName) {

        this.filterMemberMap = {};

        if (this.isFilterBased()) {
            var members = this.get('filter').get('members');
            Ext.each(members, function(member) {
                this.filterMemberMap[member.uniqueName] = true;
            }, this);
        }

        // clear out for initialization
        this.set('dimensionUniqueName', undefined);
        this.set('hierarchyUniqueName', undefined);

        this.setDimensionHierarchy(dimName, hierName);
    },

    getOlapProvider : function() { return this.olapProvider; },

    setOlapProvider : function(olapProvider) {
        this.olapProvider = olapProvider;
    },

    setDimensionHierarchy : function(dimName, hierName) {

        var _dimName = this.get('dimensionUniqueName');
        var _hierName = this.get('hierarchyUniqueName');

        if (_hierName === hierName) {
            return;
        }

        this.getOlapProvider().onMDXReady(function(mdx) {

            var dimHier = this.getDimensionHierarchy(mdx, dimName, hierName);
            var dim = dimHier.dim, hier = dimHier.hierarchy;
            var hierarchyItems = [];

            Ext.each(dim.hierarchies, function(h) {
                if (!h.hidden) {
                    hierarchyItems.push({
                        text: this.getHierarchyLabel(h),
                        uniqueName: h.uniqueName
                    });
                }
            }, this);

            this.suspendEvents();

            this.set('dimension', dim);
            this.set('hierarchy', hier);
            this.set('dimensionUniqueName', dim.uniqueName);
            this.set('hierarchyUniqueName', hier.uniqueName);
            this.set('hierarchyLabel', this.getHierarchyLabel(hier));
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
                onRows: [{ hierarchy: hier.getName(), member: 'members' }],
                useNamedFilters: ['statefilter'],
                showEmpty: true,
                success: this.processMembers,
                scope: this
            };
            mdx.query(config);
        }, this);
    },

    getDimensionHierarchy : function(mdx, dName, hName) {
        //
        // lookup hierarchy first
        //
        var hier = mdx.getHierarchy(hName), dim;
        var hierarchyItems = [];

        if (hier && hier.dimension) {
            // hidden hierarchy?
            dim = hier.dimension;
        }
        else {
            //
            // lookup by dimension
            //
            dim = mdx.getDimension(dName);

            if (dim) {
                hier = this.getDefaultHierarchy(dim);
            }
        }

        return {
            dim: dim,
            hierarchy: hier
        };
    },

    getDefaultHierarchy : function(dimension) {
        var hier;
        Ext.each(dimension.hierarchies, function(h) {
            if (!h.hidden) {
                hier = h;
                return false;
            }
        });
        return hier;
    },

    getHierarchyLabel : function(hierarchy) {
        if (hierarchy.name.indexOf('.') > -1) {
            return hierarchy.name.split('.')[1];
        }
        return hierarchy.name;
    },

    processMembers : function(cellset) {

        // memberDefinitions - Array of arrays of member definitions {name, uniqueName}
        var memberDefinitions = cellset.axes[1].positions;
        var counts = cellset.cells;

        var modelDatas = [], selectedItems = [];
        var filterBased = this.isFilterBased();

        Ext.each(memberDefinitions, function(definition, idx) {
            //
            // Skip 0th index since it is the 'all' member
            //
            if (idx > 0) {
                var def = definition[0];
                var _count = counts[idx][0].value;
                modelDatas.push({
                    uniqueName: def.uniqueName,
                    name: LABKEY.app.model.Filter.getMemberLabel(def.name),
                    count: _count
                });

                if (filterBased) {
                    if (def.uniqueName in this.filterMemberMap) {
                        selectedItems.push(def.uniqueName);
                    }
                }
                else {
                    selectedItems.push(def.uniqueName);
                }
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
