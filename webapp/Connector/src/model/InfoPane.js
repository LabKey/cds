Ext.define('Connector.model.InfoPane', {
    extend: 'Ext.data.Model',

    fields: [
        {name: 'dimension'},
        {name: 'hierarchy'},
        {name: 'dimensionUniqueName'},
        {name: 'hierarchyUniqueName'},
        {name: 'hierarchyLabel'},
        {name: 'hierarchyItems'}, // generated array of labels
        {name: 'title'}
    ],

    constructor : function(config) {

        if (config.olapProvider) {
            this.setOlapProvider(config.olapProvider);
        }

        this.callParent([config]);

        this.addEvents('change');

        var dimName = this.get('dimensionUniqueName');
        var hierName = this.get('hierarchyUniqueName');

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

            //
            // lookup hierarchy first
            //
            var hier = mdx.getHierarchy(hierName), dim;
            var hierarchyItems = [];

            if (hier && hier.dimension) {
                // hidden hierarchy?
                dim = hier.dimension;
            }
            else {
                //
                // lookup by dimension
                //
                dim = mdx.getDimension(dimName);

                if (dim) {
                    Ext.each(dim.hierarchies, function(h) {
                        if (!h.hidden) {
                            hier = h;
                            return false;
                        }
                    });
                }
            }

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
            this.set('title', dim.pluralName);

            this.resumeEvents();

            this.fireEvent('change', this);

//            var config = {
//                onRows: [{ hierarchy: hier.getName(), member: 'members' }],
//                useNamedFilters: ['statefilter'],
//                success: function(slice) {
//                    console.log(slice);
//                },
//                scope: this
//            };
//            mdx.query(config);
        }, this);
    },

    getHierarchyLabel: function(hierarchy) {
        if (hierarchy.name.indexOf('.') > -1) {
            return hierarchy.name.split('.')[1];
        }
        return hierarchy.name;
    }
});
