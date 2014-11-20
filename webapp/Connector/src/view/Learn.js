/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Learn', {

    extend : 'Ext.container.Container',

    alias  : 'widget.learn',

    requires : ['Connector.model.Dimension'],

    cls: 'learnview auto-scroll-y',

    bubbleEvents: ['selectdimension'],

    initComponent : function() {

        this.headerViews = {};

        // Multiple headers are added here but they are initially set to hidden. When the page
        // url changes the headers will be updated and made visible based on the type of view -
        // parent learn view or study/assay detail page etc
        this.items = [this.getHeader()];
//        this.items = [this.getHeader(), this.getLearnDetailHeader()];

        this.callParent();
    },

    getHeader : function() {
        if (!this.headerViews.main) {
            this.headerViews.main = Ext.create('Connector.view.LearnHeader', {
                dimensions: this.getDimensions(),

                hidden: true,

                // TODO: This should be bubblable but the this.control() in the controller does not seem to respect bubbled events
                listeners: {
                    selectdimension: function(model, silent) {
                        this.fireEvent('selectdimension', model, silent);
                    },
                    searchchanged: function(search) {
                        this.onSearchFilterChange(search);
                    },
                    scope: this
                }
            });
        }
        return this.headerViews.main;
    },
/*
    getLearnDetailHeader : function(id) {
        if (!this.headerViews.learnDetail) {
            this.headerViews.learnDetail = Ext.create('Connector.view.PageHeader', {
                dimensions: this.getDimensions(),

                hidden: true,

                state: this.state,

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
        //this.headerViews.learnDetail.setId(id);

        return this.headerViews.learnDetail;
    },
*/
    onSearchFilterChange : function(filter) {
        this.searchFilter = filter;
        var view = this.dataViews[0];
        this.loadData(view.dimension, view.getStore());
    },

    dimensionDataLoaded : function(dimension, store) {
        store.clearFilter(this.searchFilter);
        var fields = this.searchFields || [];
        var regex = new RegExp(this.searchFilter, 'i');
        this.searchFilter && store.filterBy(function(model) {
            var match = false;
            Ext.each(fields, function(field) {
                var str = model.get(field);
                if (regex.test(str)) {
                    match = true;
                }
            });
            return match;
        });
    },

    loadData : function(dimension, store) {
        if (dimension) {
            var hierarchy = dimension.getHierarchies()[0];
            var dimensionName = hierarchy.getName();
            if (!this.dimensionDataLoaded[dimensionName]) {
                this.state.onMDXReady(function(mdx) {
                    var config = {
                        onRows: [{hierarchy: hierarchy.getName(), member: 'members'}],
                        //useNamedFilters: [LABKEY.app.constant.STATE_FILTER],
                        success: function(slice) {
                            if (store)
                                store.loadSlice(slice);
                            this.dimensionDataLoaded[dimensionName] = true;
                            this.dimensionDataLoaded(dimension, store);
                        },
                        scope: this
                    };
                    mdx.query(config);

                }, this);
            } else {
                this.dimensionDataLoaded(dimensionName, store);
            }
        }
    },

    setHeader : function(dimension, id) {
        var listHeader = this.getHeader();
        //var learnDetailHeader = this.getLearnDetailHeader(id);
        if (id) {
            listHeader.setVisible(false);
//            learnDetailHeader.setDetailType(dimension.singularName);
//            learnDetailHeader.setVisible(true);
        } else {
            listHeader.setVisible(true);
//            learnDetailHeader.setVisible(false);
        }
    },

    loadDataView : function(dimension, id, animate) {

        this.setHeader(dimension, id);
        if (this.dataViews && this.dataViews.length) {
            var dataViews = this.dataViews;
            delete this.dataViews;
            //this.state.un('searchfilterchange', this.onFilterChange, this);
            var views = dataViews.length;
            var fadedViews = 0;
            Ext.each(dataViews, function(dataView) {
                var el = dataView.getEl();
                if (animate && el) {
                    el.fadeOut({
                        callback: function() {
                            if (++fadedViews == views) {
                                this.remove(dataView);
                                this.completeLoad(dimension, id, animate);
                            }
                        },
                        scope: this
                    });
                }
                else {
                    this.remove(dataView);
                    this.completeLoad(dimension, id, animate);
                }            
            }, this)
        }
        else {
            this.completeLoad(dimension, id, animate);
        }
    },

    headerLabel : function(dimension,model) {
        var content = '';
        if (dimension.singularName) {
            content += dimension.singularName;
            if (model) {
                content += ": ";
            }
            content = "<h1 class='lhdv'>" + content + "</h1>"
        }
        if (model) {
            // TODO: Other models may have other label properties
            content += "<h1>" + model.get('Label') + "</h1>";
        }

        return content;
    },

    headerButtonsByDimension : {
        Study : [{
            groupLabel: "Select:",
            buttonLabel: 'all study subjects',
            handler: function(button, _, dimension, model) {
                Animation.floatTo(button.el, 'span.x-btn-button', ['.selectionpanel', '.filterpanel'], 'span', 'selected', function() {
                    var selections = [{
                        // "[Study]"
                        hierarchy: "["+dimension.singularName+"]",
                        // "[Study].[Not Actually CHAVI 001]"
                        members: [{ uniqueName: '['+dimension.singularName+'].['+model.get('Label')+']' }],
                        // "[Study].[Name]"
                        level: "["+dimension.singularName + "].[Name]",
                        operator: "OR"
                    }];
                    this.state.addSelection(selections, false, true, true);
                }, this);
            }
        }]
    },

    completeLoad : function(dimension, id, animate) {

        if (Ext.isDefined(dimension)) {
            var store;
            if (id && dimension.itemDetail) {
                store = StoreCache.getStore(dimension.detailItemCollection || dimension.detailCollection);
                var model = store.getById(id);
                var self = this;

                function modelLoaded(model) {
                    var tabViews = [];
                    Ext.each(dimension.itemDetail, function(item) {
                        if (item.view) {
                            var view = Ext.create(item.view, {
                                state: self.state,
                                model: model,
                                modules: item.modules
                            });
                            tabViews.push(view);
//                            self.add(view);
                        }
                    });

                    var header = Ext.create('Connector.view.PageHeader', {
                        data: {
                            label : self.headerLabel(dimension,model),
                            buttons : {
                                back: true,
                                up: dimension.pluralName.toLowerCase(),
                                group: self.headerButtonsByDimension[dimension.singularName]
                            },
                            tabs : dimension.itemDetailTabs,
                            scope : self,
                            handlerParams : [dimension, model],
                            lockPixels : 70
                        }
                    });

                    var pageView = Ext.create('Connector.view.Page', {
                        contentViews: tabViews,
                        header: header,
                        initialSelectedTab: 0,
                        pageID: 'learnDetail'+dimension.singularName
                    });

                    self.add(pageView);
                    self.dataViews = [pageView];
                }

                if (!model) {
                    store.on('load', function() {
                        modelLoaded(store.getById(id));
                    }, this, {
                        single: true
                    });
                    this.loadData(dimension, store);
                } else {
                    modelLoaded(model);
                }
            }
            else if (dimension.detailModel && dimension.detailView) {
                store = StoreCache.getStore(dimension.detailCollection);

                var view = Ext.create(dimension.detailView, {
                    dimension: dimension,
                    store: store,
                    plugins: ['learnheaderlock']
                });

                this.dataViews = [view];

                this.mon(view, 'itemclick', function(view, model, el, idx) {
                    this.fireEvent('selectitem', model);
                }, this);

                this.add(view);
                this.loadData(dimension, view.getStore());
            }

            //this.state.on('searchfilterchange', this.onFilterChange, this);
        }
        else {
            //
            // See which one the header is respecting
            //
            if (this.headerViews.main) {
                var dimModel = this.getHeader().getHeaderView().getStore().getAt(0);
                if (dimModel && dimModel.get('detailModel') && dimModel.get('detailView')) {
                    this.loadDataView(dimModel.data);
                }
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

    viewByDimension : {
        'Assay' : 'Assay',
        'Study' : 'Study',
        'Lab' : 'Labs',
        'Study product' : 'StudyProducts'
    },

    selectDimension : function(dimension, id, animate) {
        this.searchFilter = null;
        this.searchFields = Connector.app.view[this.viewByDimension[dimension.singularName]].searchFields;

        if (dimension) {
            this.loadDataView(dimension, id, animate);
        }
        else {
            if (this.headerViews.main) {
                this.headerViews.main.on('selectdimension', this.loadDataView, this, {single: true});
            }
        }

        this.getHeader().selectDimension(dimension ? dimension.uniqueName : undefined, id, dimension);
    }
});



Ext.define('Connector.view.LearnHeader', {

    extend : 'Ext.container.Container',

    height: 136,

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
                    html: '<span>Learn about...</span>'
                }
            },{
                xtype: 'container',
                itemId: 'dataviewcontainer',
                cls: 'learn-header-container',
                items: [{
                    xtype: 'learnheaderdataview',
                    itemId: 'headerdataview',
                    dimensions: this.dimensions
                }, {
                    xtype: 'textfield',
                    itemId: 'searchfield',
                    emptyText: 'Search',
                    cls: 'learn-search-input',
                    checkChangeBuffer: 500,
                    validator: Ext.bind(function(value) {
                        this.fireEvent('searchchanged', value);
                        return true;
                    }, this)
                    // autoEl: {
                    //     tag: 'div',
                    //     html: '<input type="text" class="learn-filter" placeholder="Search assays">'
                    // }
                }]
            }
        ];

        this.callParent();

        this.addEvents('selectdimension', 'searchchanged');

        //
        // Only classes inherited from Ext.container.AbstractContainer can bubble events
        // For the header view this view should bubble the following events
        // itemclick
        //
        this.getHeaderView().on('itemclick', function(view, model) {
            this.fireEvent('selectdimension', model);
        }, this);
        this.getHeaderView().on('requestselect', function(model) {
            this.fireEvent('selectdimension', model, true);
        }, this);
    },

    setDimensions : function(dimensions) {
        this.dimensions = dimensions;
        this.getHeaderView().setDimensions(dimensions);
    },

    getHeaderView : function() {
        return this.getComponent('dataviewcontainer').getComponent('headerdataview');
    },

    selectDimension : function(dimUniqueName, id, dimension) {
        if (this.dimensions && this.dimensions.length > 0) {
            this.getHeaderView().selectDimension(dimUniqueName);
        }
        var search = this.getComponent('dataviewcontainer').getComponent('searchfield')
        search.emptyText = 'Search '+dimension.pluralName.toLowerCase();
        search.setValue('');
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

        this.addEvents('requestselect');

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
        this.getSelectionModel().select(model);
        this.fireEvent('requestselect', model);
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

Ext.define('Connector.view.Learn.plugin.HeaderLock', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.learnheaderlock',

    lockCls: 'headerlock',

    headerOffset: 53,

    init : function(cmp) {

        cmp.on('afterrender', function() {

            // initialize constants
            this.elements = {
                view: this.selectUnique('.learnview')
            };

            // initialize listeners
            var EM = Ext.EventManager;
            EM.on(window, 'resize', this.onResize, this);
            EM.on(this.elements.view, 'scroll', this.onScroll, this);

        }, this, {single: true});

        this.resizeTask = new Ext.util.DelayedTask(function() {
            var w = this.getCalculatedWidth();
            if (w > 0) {
                var lock = this.getLockElement();
                if (lock) {
                    lock.setWidth(w);
                    this.elements.dupe.setWidth(w);
                }
            }
        }, this);
    },

    destroy : function() {
        // stop
        this.resizeTask.cancel();

        // unregister
        var EM = Ext.EventManager;
        EM.un(window, 'resize', this.onResize, this);
        if (this.elements) {
            EM.un(this.elements.view, 'scroll', this.onScroll, this);

            // clear
            this.elements.lock = null;
            this.elements.header = null;
            this.elements.view = null;
        }
    },

    update : function() {

        var hdr = this.getHeaderElement(),
            lock = this.getLockElement();

        if (hdr && lock) {
            var box = hdr.getBox();
            if (box.bottom > this.headerOffset) {
                lock.removeCls(this.lockCls);
                if (this.elements.dupe)
                    this.elements.dupe.hide();
            }
            else {
                lock.addCls(this.lockCls);
                if (this.elements.dupe)
                    this.elements.dupe.show();
            }
        }
    },

    onResize : function() {
        this.resizeTask.delay(100);
    },

    onScroll : function() {
        this.update();
    },

    getCalculatedWidth : function() {
        return (this.elements.view ? this.elements.view.getWidth() : 0);
    },

    // Nullable
    getHeaderElement : function() {
        if (!this.elements.header) {
            this.elements.header = this.selectUnique('.learnheader');
        }
        return this.elements.header;
    },

    // Nullable
    getLockElement : function() {
        if (!this.elements.lock) {
            var lock = this.selectUnique('.learncolumnheader');
            if (lock) {

                var h = lock.getHeight();
                var w = lock.getWidth();

                lock.setWidth(w);
                this.elements.lock = lock;

                //
                // Once we have the associated lock element,
                // place an element next to it to fill its space
                // when it unlocks. Prevents jumping.
                //
                var style = 'display: none; ';
                style += 'height: ' + h + 'px; ';
                style += 'width: ' + w + 'px; ';
                style += 'background-color: transparent; ';

                var dupe = document.createElement('div');
                dupe.setAttribute('style', style);
                dupe = Ext.get(dupe);
                dupe.insertBefore(lock);
                dupe.setVisibilityMode(2); // use 'display'
                this.elements.dupe = dupe;
            }
        }
        return this.elements.lock;
    },

    // Nullable
    selectUnique : function(selector) {
        return Ext.get(Ext.DomQuery.select(selector)[0])
    }
});