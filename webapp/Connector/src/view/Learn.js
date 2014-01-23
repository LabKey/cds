Ext.define('Connector.view.Learn', {

    extend : 'Ext.container.Container',

    alias  : 'widget.learn',

    requires : ['Connector.model.Dimension'],

    cls: 'learnview',

    bubbleEvents: ['selectdimension'],

    initComponent : function() {

        this.columnPresent = true;

        this.items = [
            this.getHeader(),
            this.getLearnColumnHeaderView()
        ];

        this.callParent();
    },

    getHeader : function() {
        if (!this.headerView) {
            this.headerView = Ext.create('Connector.view.LearnHeader', {
                dimensions: this.getDimensions(),

                // TODO: This should be bubblable but the this.control() in the controller
                // does not seem to respect bubbled events
                listeners: {
                    selectdimension: function(model) {
                        this.fireEvent('selectdimension', model);
                    },
                    scope: this
                }
            });
        }
        return this.headerView;
    },

    getLearnColumnHeaderView : function() {
        if (!this.columnView) {
            this.columnView = Ext.create('Connector.view.LearnColumnHeader', {});
        }
        return this.columnView;
    },

    onFilterChange : function(filters) {
        this.loadData(this.dataView);
    },

    loadData : function(view) {

        if (view && view.dimension) {
            this.state.onMDXReady(function(mdx) {
                var hierarchy = view.dimension.getHierarchies()[0];
                var config = {
                    onRows: [{hierarchy: hierarchy.getName(), member: 'members'}],
                    useNamedFilters: ['statefilter'],
                    success: function(slice) {
                        if (view && view.getStore())
                            view.getStore().loadSlice(slice);
                    },
                    scope: this
                };
                mdx.query(config);

            }, this);
        }
    },

    loadDataView : function(dimension, animate) {

        if (this.dataView) {
            this.state.un('filterchange', this.onFilterChange, this);
            var el = this.dataView.getEl();
            if (animate && el) {
                el.fadeOut({
                    callback: function() {
                        this.remove(this.dataView);
                        this.dataView = undefined;
                        this.completeLoad(dimension, animate);
                    },
                    scope: this
                });
            }
            else {
                this.remove(this.dataView);
                this.dataView = undefined;
                this.completeLoad(dimension, animate);
            }
        }
        else {
            this.completeLoad(dimension, animate);
        }
    },

    completeLoad : function(dimension, animate) {
        if (this.columnPresent) {
            this.columnView.hide();
            this.columnPresent = false;
        }

        if (dimension && dimension.detailModel && dimension.detailView) {

            this.dataView = Ext.create(dimension.detailView, {
                dimension: dimension,
                store: Ext.create(dimension.detailCollection, {
                    model: dimension.detailModel
                })
            });
            this.add(this.dataView);
            this.loadData(this.dataView);

            this.state.on('filterchange', this.onFilterChange, this);
        }
        else if (!Ext.isDefined(dimension)) {
            //
            // See which one the header is respecting
            //
            if (this.headerView) {
                var dimModel = this.getHeader().getHeaderView().getStore().getAt(0);
                if (dimModel && dimModel.get('detailModel') && dimModel.get('detailView')) {
                    this.loadDataView(dimModel.data);
                }
            }
        }
        else {
            if (!this.columnPresent) {
                this.columnPresent = true;
                this.columnView.show();
            }
        }
    },

    getDimensions : function() {
        return this.dimensions;
    },

    setDimensions : function(dimensions) {
        this.dimensions = dimensions;
        this.getHeader().setDimensions(dimensions);
    },

    selectDimension : function(dimension, animate) {

        if (dimension) {
            this.loadDataView(dimension, animate);
        }
        else {
            if (this.headerView) {
                this.headerView.on('selectdimension', this.loadDataView, this, {single: true});
            }
        }

        this.getHeader().selectDimension(dimension ? dimension.uniqueName : undefined);
    }
});

Ext.define('Connector.view.LearnHeader', {

    extend : 'Ext.container.Container',

    height: 140,

    cls: 'learnheader',

    defaults: {
        ui: 'custom',
        flex: 1
    },

    initComponent : function() {

        this.items = [
            {
                xtype: 'box',
                autoEl: {
                    tag: 'div',
                    cls: 'titlepanel',
                    html: '<span>Learn About...</span>'
                }
            },{
                xtype: 'container',
                itemId: 'dataviewcontainer',
                cls: 'learn-header-container',
                items: [{
                    xtype: 'learnheaderdataview',
                    itemId: 'headerdataview',
                    dimensions: this.dimensions
                }]
            }
        ];

        this.callParent();

        this.addEvents('selectdimension');

        //
        // Only classes inherited from Ext.container.AbstractContainer can bubble events
        // For the header view this view should bubble the following events
        // itemclick
        //
        this.getHeaderView().on('itemclick', function(view, model, el, idx) {
            this.fireEvent('selectdimension', model);
        }, this);
        this.getHeaderView().on('fakeitemclick', function(view, model, el, idx) {
            console.log('fired selectiondimension');
            this.fireEvent('selectdimension', model);
        }, this);
    },

    setDimensions : function(dimensions) {
        this.dimensions = dimensions;
        this.getHeaderView().setDimensions(dimensions);
    },

    getHeaderView : function() {
        return this.getComponent('dataviewcontainer').getComponent('headerdataview');
    },

    selectDimension : function(dimUniqueName) {
        if (this.dimensions && this.dimensions.length > 0) {
            this.getHeaderView().selectDimension(dimUniqueName);
        }
    }
});

//
// This is an internal class to header which is wrapped by Connector.view.LearnHeader
//
Ext.define('Connector.view.LearnHeaderDataView', {

    extend: 'Ext.view.View',

    alias: 'widget.learnheaderdataview',

    itemSelector: 'h1.lhdv',

    selectedItemCls: 'active',

    loadMask: false,

    selectInitialDimension: false,

    tpl: new Ext.XTemplate(
            '<tpl for=".">',
            '<h1 class="lhdv">{pluralName}</h1>',
            '</tpl>'
    ),

    initComponent : function() {

        this.store = Ext.create('Ext.data.Store', {
            model: 'Connector.model.Dimension',
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'dimensions'
                }
            }
        });

        this.callParent();

        if (this.dimensions) {
            this.setDimensions(this.dimensions);
            this.dimensions = undefined;
        }
    },

    setDimensions : function(dimensions) {

        var store = this.getStore();

        store.loadRawData(dimensions);

        //
        // Filter out hidden dimensions, and dimensions which do not support detail view
        //
        store.filter('hidden', false);
        store.filter('supportsDetails', true);

        //
        // Sort dimensions by stated priority
        //
        store.sort('priority', 'desc');

        //
        // Select the initial dimension
        //
        if (this.selectInitialDimension && store.getCount() > 0) {
            this.selectDimension(store.getAt(0).get('uniqueName'));
        }
    },

    //
    // Select a dimension by unique name. If this method is called and a name is
    // not provided then the first valid dimension will be selected.
    //
    selectDimension : function(dimUniqueName) {
        var uniqueName = dimUniqueName;
        var store = this.getStore();

        if (!Ext.isDefined(uniqueName)) {
            uniqueName = store.getAt(0).get('uniqueName');
        }

        var idx = store.findExact('uniqueName', uniqueName);
        if (idx >= 0) {
            var model = store.getAt(idx);
            if (!this.rendered) {
                this.on('afterrender', function() { this._select(model); }, this, {single: true});
            }
            else {
                this._select(model);
            }
        }
        else {
            console.warn('Unable to select dimension:', uniqueName);
        }
    },

    _select : function(model) {
        console.log('yup');
        console.log(model);
        this.getSelectionModel().select(model);
        this.fireEvent('fakeitemclick', this, model);
    }
});

Ext.define('Connector.view.LearnColumnHeader', {

    extend : 'Ext.container.Container',

    height: 30,

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    cls: 'learncolumnheader',

    defaults: {
        ui: 'custom',
        flex: 1
    },

    initComponent : function() {

        this.items = [
            {
                xtype: 'box',
                cls: 'learn-column-header',
                autoEl: {
                    tag: 'div'
                }
            }
        ];

        this.callParent();
    }
});