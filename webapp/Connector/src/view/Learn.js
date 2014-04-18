/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Learn', {

    extend : 'Ext.container.Container',

    alias  : 'widget.learn',

    requires : ['Connector.model.Dimension'],

    cls: 'learnview',

    bubbleEvents: ['selectdimension'],

    initComponent : function() {

        this.headerViews = {};

        // Multiple headers are added here but they are initially set to hidden. When the page
        // url changes the headers will be updated and made visible based on the type of view -
        // parent learn view or study/assay detail page etc
        this.items = [this.getHeader(), this.getStudyDetailHeader()];

        this.callParent();
    },

    getHeader : function() {
        if (!this.headerViews.main) {
            this.headerViews.main = Ext.create('Connector.view.LearnHeader', {
                dimensions: this.getDimensions(),

                hidden: true,

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
        return this.headerViews.main;
    },

    getStudyDetailHeader : function(id) {
        if (!this.headerViews.studyDetail) {
            this.headerViews.studyDetail = Ext.create('Connector.view.LearnItemHeader', {
                dimensions: this.getDimensions(),

                hidden: true,

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
        //this.headerViews.studyDetail.setId(id);

        return this.headerViews.studyDetail;
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

    setHeader : function(dimension, id) {
        var listHeader = this.getHeader();
        var studyDetailHeader = this.getStudyDetailHeader(id);
        if (id) {
            listHeader.setVisible(false);
            studyDetailHeader.setDetailType(dimension.name);
            studyDetailHeader.setVisible(true);
        } else {
            listHeader.setVisible(true);
            studyDetailHeader.setVisible(false);
        }
    },

    loadDataView : function(dimension, id, animate) {

        this.setHeader(dimension, id);

        if (this.dataView) {
            this.state.un('filterchange', this.onFilterChange, this);
            var el = this.dataView.getEl();
            if (animate && el) {
                el.fadeOut({
                    callback: function() {
                        this.remove(this.dataView);
                        this.dataView = undefined;
                        this.completeLoad(dimension, id, animate);
                    },
                    scope: this
                });
            }
            else {
                this.remove(this.dataView);
                this.dataView = undefined;
                this.completeLoad(dimension, id, animate);
            }
        }
        else {
            this.completeLoad(dimension, id, animate);
        }
    },

    completeLoad : function(dimension, id, animate) {

        if (Ext.isDefined(dimension)) {
            var store;
            if (id && dimension.detailItemView) {
                store = StoreCache.getStore(dimension.detailItemCollection || dimension.detailCollection, true);
                var model = store.getById(id);
                var self = this;

                function modelLoaded(model) {
                    self.dataView = Ext.create(dimension.detailItemView, {
                        state: self.state,
                        model: model,
                        modules: dimension.detailItemModules
                    });

                    var studyDetailHeader = self.getStudyDetailHeader(id);

                    studyDetailHeader.setModel(model);

                    self.add(self.dataView);
                    // TODO: Is these needed for item view?
                    self.loadData(self.dataView);
                }

                if (!model) {
                    store.load({
                        callback: function() {
                            modelLoaded(store.getById(id));
                        }
                    });
                } else {
                    modelLoaded(model);
                }
            }
            else if (dimension.detailModel && dimension.detailView) {
                store = StoreCache.getStore(dimension.detailCollection);

                this.dataView = Ext.create(dimension.detailView, {
                    dimension: dimension,
                    store: store,
                    plugins: ['learnheaderlock']
                });

                this.dataView.on('itemclick', function(view, model, el, idx) {
                    this.fireEvent('selectitem', model);
                }, this);

                this.add(this.dataView);
                this.loadData(this.dataView);
            }

            this.state.on('filterchange', this.onFilterChange, this);
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

    selectDimension : function(dimension, id, animate) {

        if (dimension) {
            this.loadDataView(dimension, id, animate);
        }
        else {
            if (this.headerViews.main) {
                this.headerViews.main.on('selectdimension', this.loadDataView, this, {single: true});
            }
        }

        this.getHeader().selectDimension(dimension ? dimension.uniqueName : undefined, id);
    }
});

// This is a shared header class for an individual item detail. This will be the header for a single
// Study, a single Assay or a single Lab etc.
Ext.define('Connector.view.LearnItemHeader', {

    extend: 'Ext.container.Container',

    height: 161,

    requires: ['Connector.button.Image'],

    alias: 'widget.learnitemheaderview',

    layout: {
        type : 'vbox',
        align: 'stretch'
    },

    cls: 'learnitemheaderview learnheader',

    defaults: {
        ui: 'custom',
        flex: 1
    },

    selectorId: 'dimselect',

    initComponent : function() {

        this.items = [
            {
                xtype: 'box',
                itemId: 'headerLabel',
                autoEl: {
                    tag: 'div',
                    cls: 'titlepanel'
                }
            },
            {
                xtype: 'toolbar',
                ui: 'footer',
                // dock: 'bottom',
                items: [{
                    xtype: 'button',
                    //text: 'back',
                    html: '<svg width="12" height="10" fill="#9b0d96">'+
                        '<path d="M0 6 L5 10 L5 2 Z" />'+
                    '</svg>back',
                    cls: '',
                    ui: 'rounded-inverted-accent',
                    itemId: 'back',
                    style: 'margin: 4px 2px 0 23px;'
                    // handler: function() {
                    //     this.fireEvent('navBack');
                    // }
                }, {
                    xtype: 'tbspacer',
                    width: 50
                }, {
                    xtype: 'label',
                    text: 'Select:'
                }, {
                    xtype: 'button',
                    ui: 'rounded-inverted-accent',
                    text: 'all study subjects',
                    itemId: 'studyAllSubjects',
                    hidden: true,
                    // TODO: Move to button class?
                    style: 'margin: 4px 2px 0 23px;'
                }, {
                    xtype: 'button',
                    ui: 'rounded-inverted-accent',
                    text: 'all placebo',
                    itemId: 'studyAllPlacebo',
                    hidden: true,
                    // TODO: Move to button class?
                    style: 'margin: 4px 2px 0 2px;'
                }, {
                    xtype: 'button',
                    ui: 'rounded-inverted-accent',
                    text: 'all vaccinees',
                    itemId: 'studyAllVaccine',
                    hidden: true,
                    // TODO: Move to button class?
                    style: 'margin: 4px 2px 0 2px;'
                }, {
                    xtype: 'button',
                    ui: 'rounded-inverted-accent',
                    text: 'subjects tested on this assay',
                    itemId: 'assaySubjects',
                    hidden: true,
                    // TODO: Move to button class?
                    style: 'margin: 4px 2px 0 2px;'
                }]
            }
            //{ xtype: 'button', text: 'clear', cls: 'filterclear', ui: 'rounded-inverted-accent', itemId: 'clear', style: 'margin: 4px 2px 0 2px;', hidden: hidden}
        ];

        this.callParent();

        this.dimSelector = this.getComponent(this.selectorId);
    },

    setDimension : function(dim, hierarchyIndex) {
        if (this.dimSelector) {
            this.dimSelector.setDimension(dim, hierarchyIndex);
        }
    },

    setHierarchy : function(index) {
        if (this.dimSelector) {
            this.dimSelector.setHierarchy(index);
        }
    },

    // Controls will only be shown when the detail type matches the given string (or array of strings)
    controlFilters : {
        studyAllSubjects: 'Study',
        studyAllPlacebo: 'Study',
        studyAllVaccine: 'Study',
        assaySubjects: 'Assay'
    },

    update : function() {
        var cmp = this.getComponent('headerLabel');
        var content = '';
        if (this.detailType) {
            content += this.detailType;
            if (this.model) {
                content += ": ";
            }
            content = "<h1 class='lhdv'>" + content + "</h1>"
        }
        if (this.model) {
            // TODO: Other models may have other label properties
            content += "<h1>" + this.model.get('Label') + "</h1>";
        }
        cmp.update(content);

        // Only show the controls that are valid for this detail type
        Ext.iterate(this.controlFilters, function(key, value) {
            // Value can be an id or an array of ids so normalize to an array before iterating
            var values = Ext.Array.from(value);
            var cmp = this.queryById(key);
            if (cmp) {
                var visible = false;
                Ext.each(values, function(value) {
                    visible = visible || this.detailType == value;
                }, this);
                cmp.setVisible(visible);
            }
        }, this);
    },

    setDetailType : function(type) {
        this.detailType = type;

        this.update();
    },

    setModel : function(model) {
        this.model = model;

        this.update();
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

    selectDimension : function(dimUniqueName, id) {
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
        EM.un(this.elements.view, 'scroll', this.onScroll, this);

        // clear
        this.elements.lock = null;
        this.elements.header = null;
        this.elements.view = null;
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