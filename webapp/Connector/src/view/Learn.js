/*
 * Copyright (c) 2014-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Learn', {

    extend : 'Ext.container.Container',

    alias  : 'widget.learn',

    requires : ['Connector.model.Dimension'],

    cls: 'learnview auto-scroll-y',

    /**
     * Allows for search to do a depth search on properties that are setup. Example
     * ['label', 'type', 'description', {field: 'products', value: 'product_name'}]
     * where 'products' is a depth search that iterates across the 'products' and matches
     * against 'product_name'.
     * Since this could be an expensive operation it can be turned off with this flag.
     */
    allowNestedSearch: true,

    sorterArray : [],

    searchFilter: undefined,

    dataListPrefix: 'learn-list-',

    dimensionDataLoaded: {},

    statics: {
        detailGridTabs : ['vars', 'antigens']
    },

    listeners: {
        resize: function (view, width, height)
        {
            var visibleGrid = this.items.items.filter(function(item) {
                return !item.hidden
                        && item.itemId
                        && item.itemId.toString().indexOf(this.dataListPrefix) == 0;
            }, this);
            if (visibleGrid.length == 1)
            {
                visibleGrid[0].fireEvent("learnGridResizeHeight", height);
            }
        },
        hide: function(view)
        {
            if (view.items.length > 1) {
                for (var i=1; i < view.items.items.length; i++) {
                    if (view.items.items[i].pageID)
                    // hide(destroy) all detail page as they are not longer needed
                    // keeping them will pollute the DOM
                        view.items.items[i].hide();
                }
            }
        }
    },

    columnFilters: {},

    initComponent : function() {

        this.headerViews = {};
        this.listViews = {};
        this.detailPageView = null;

        // Multiple headers are added here but they are initially set to hidden. When the page
        // url changes the headers will be updated and made visible based on the type of view -
        // parent learn view or study/assay detail page etc
        this.items = [this.getHeader()];

        this.callParent();
    },

    getHeader : function() {
        if (!this.headerViews.main) {
            this.headerViews.main = Ext.create('Connector.view.LearnHeader', {
                dimensions: this.getDimensions(),
                hidden: true,
                cls: 'learnheader',
                searchValue: this.searchFilter,
                listeners: {
                    searchchanged: function(filter) {
                        this.onSearchFilterChange(filter, false);
                    },
                    updateLearnFilter: function(column, filtersStr, negated, isDetailPage){
                        this.onUpdateLearnFilter(column, filtersStr, negated, isDetailPage);
                    },
                    updateLearnSort: function(column, direction, isDetailPage){
                        this.onUpdateLearnSort(column, direction, isDetailPage);
                    },
                    updateLearnFilters: function(params, isDetailPage){
                        this.onUpdateLearnFilters(params, isDetailPage);
                    },
                    scope: this
                }
            });
        }
        return this.headerViews.main;
    },

    loadDataDelayed: function(dim, store) {

        if (!this.loadDataTask) {
               this.loadDataTask = new Ext.util.DelayedTask(this.loadData, this);
        }
        this.loadDataTask.delay(200, undefined, this, [dim, store]);
    },

    onSearchFilterChange : function(filter, isDetailPage) {
        if (Ext.isString(filter)) {
            this.searchFilter = filter;
            var view = isDetailPage ? this.activeListingDetailGrid : this.activeListing;
            if (view) {
                this.loadDataDelayed(view.dimension, view.getStore());
            }
        }
    },

    onUpdateLearnSort : function(column, direction, isDetailPage) {
        var view = isDetailPage ? this.activeListingDetailGrid : this.activeListing;
        if (view) {
            if (!column) {
                //remove sort
                if (view.getStore().sorters && view.getStore().sorters.items.length > 0) {
                    view.getStore().sorters.clear();
                    this.sorterArray = [];
                    view.getView().refresh();
                }
            }
            else {
                var sorters = [
                    {
                        property: column,
                        direction: direction
                    }
                ];
                this.sorterArray = sorters;
                view.getStore().sort(sorters);
            }
        }
    },

    onUpdateLearnFilter : function(field, filters, negated, isDetailPage) {
        var filterValues = [];
        if (filters) {
            filterValues = Ext.isArray(filters) ? filters: filters.split(';');
        }
        var grid = isDetailPage ? this.activeListingDetailGrid : this.activeListing;
        if (grid) {
            this.columnFilters[field] = {
                filterValues: filterValues,
                negated: negated
            };
            Ext.each(grid.headerCt.getGridColumns(), function(column) {
                if (column.filterConfigSet && Ext.isDefined(column.getEl())) {
                    var columnHasFiltersSet = column.filterConfigSet
                            .map(function (config) {
                                var assignedFilterValues;
                                if (this.columnFilters[config.filterField])
                                    assignedFilterValues = this.columnFilters[config.filterField].filterValues;
                                return assignedFilterValues && assignedFilterValues.length > 0
                            }, this)
                            .reduce(function (total, curr) {
                                return total || curr;
                            });

                    if (columnHasFiltersSet) {
                        column.getEl().addCls('filtered-column');
                    }
                    else {
                        column.getEl().removeCls('filtered-column');
                    }
                }
            }, this);
            this.loadDataDelayed(grid.dimension, grid.getStore());
        }
    },

    getColumnFilterFromUrlParam: function(urlFilter)
    {
        var negated = false;
        var emptyFilter = {
            filterValues: [],
            negated: false
        };
        if (!urlFilter)
            return emptyFilter;

        var filterStr = '';
        if (urlFilter.startsWith('NotIn('))
        {
            negated = true;
            filterStr = urlFilter.slice(6, -1);
        }
        else if (urlFilter.startsWith('In('))
        {
            filterStr = urlFilter.slice(3, -1);
        }

        return {
            filterValues: filterStr.split(';'),
            negated: negated
        }
    },

    onUpdateLearnFilters : function(params, isDetailPage) {
        this.columnFilters = {};
        var grid = isDetailPage ? this.activeListingDetailGrid : this.activeListing;
        if (grid) {
            Ext.each(grid.headerCt.getGridColumns(), function(column) {
                if (column.filterConfigSet && Ext.isDefined(column.getEl())) {
                    var fieldsWithFilterValues = column.filterConfigSet
                            .map(function(config) {
                                var field = config.filterField;
                                var urlFilter = params[field];
                                return {
                                        'field' : field,
                                        columnFilter: this.getColumnFilterFromUrlParam(urlFilter)
                                }
                            }, this);

                    fieldsWithFilterValues.forEach(function(config) {
                                this.columnFilters[config.field] = config.columnFilter
                            }, this);

                    var columnHasFilterApplied = fieldsWithFilterValues.reduce(function(total, curr, idx) {
                                return total || (curr.columnFilter && curr.columnFilter.filterValues.length > 0);
                            }, false);

                    if (columnHasFilterApplied) {
                        column.getEl().addCls('filtered-column');
                    }
                    else {
                        column.getEl().removeCls('filtered-column');
                    }
                }
            }, this);
            this.loadDataDelayed(grid.dimension, grid.getStore());
        }
    },

    sortAndFilterStore : function(store) {
        store.clearFilter();
        this.filterStoreBySearchAndColumnFilter(store);
        this.sortStore(store);
    },

    sortAndFilterStoreDelayed: function(store) {

        if (!this.sortAndFilterStoreTask) {
            this.sortAndFilterStoreTask = new Ext.util.DelayedTask(this.sortAndFilterStore, this);
        }
        this.sortAndFilterStoreTask.delay(200, undefined, this, [store]);
    },

    sortStore: function(store) {
        if (this.sorterArray.length > 0) {
            store.sort(this.sorterArray);
        }
    },

    filterStoreBySearchAndColumnFilter: function(store) {
        var me = this;
        store.filterBy(function(model) {
            var match = true;
            if (!Ext.isEmpty(me.searchFilter)) {

                var fields = me.searchFields || [],
                        regex = new RegExp(LABKEY.Utils.escapeRe(me.searchFilter), 'i'),
                        allowNestedSearch = me.allowNestedSearch === true;

                match = me.isMatchSearch(fields, regex, allowNestedSearch, model);
            }

            if (me.columnFilters) {
                match = match && me.isMatchColumnFilters(me.columnFilters, model);
            }
            return match;
        });

    },

    isMatchColumnFilters: function(columnFilters, storeModel) {
        var match = true;

        Ext.iterate(columnFilters, function (field, columnFilter)
        {
            var filterValues = columnFilter.filterValues;
            var negated = columnFilter.negated;
            var value = storeModel.get(field);
            if (!match)
                return;
            if (!filterValues || filterValues.length == 0)
                return;

            var columnMatch = false;
            if (Ext.isArray(value)) {
                Ext.each(filterValues, function(filterValue){
                    if (!match)
                        return;
                    if (filterValue == '[blank]') {
                        if (value.length == 0)
                        {
                            columnMatch = true;
                            return;
                        }
                    }
                    else {
                        Ext.each(value, function(val){
                            if (filterValue == val) {
                                columnMatch = true;
                                return;
                            }
                        });
                    }
                });
            }
            else {
                Ext.each(filterValues, function(filterValue){
                    if ((filterValue == value) || (filterValue == '[blank]' && (value == null || value == ''))) {
                        columnMatch = true;
                        return;
                    }
                });
            }
            if (negated)
                columnMatch = !columnMatch;

            match = match && columnMatch;
        });

        return match;
    },

    isMatchSearch: function(fields, regex, allowNestedSearch, storeModel) {
        var match = false, value;
        Ext.each(fields, function(field) {
            if (Ext.isString(field)) {
                value = storeModel.get(field);

                if (regex.test(value)) {
                    match = true;
                }
            }
            else if (allowNestedSearch && Ext.isObject(field)) {
                value = storeModel.get(field.field);
                if (Ext.isArray(value)) {
                    if (Ext.isEmpty(value) && Ext.isString(field.emptyText)) {
                        if (regex.test(field.emptyText)) {
                            match = true;
                        }
                    }
                    else {
                        for (var i=0; i < value.length; i++) {
                            if (regex.test(value[i][field.value])) {
                                match = true;
                                return;
                            }
                        }
                    }
                }
            }
        });
        return match;
    },

    loadData : function(dimension, store) {
        if (dimension) {
            var dimensionName, hasHierarchy =  true;
            if (dimension.getHierarchies().length > 0)
            {
                dimensionName = dimension.getHierarchies()[0].getName();
            }
            else {
                dimensionName = dimension.name;
                hasHierarchy = false;
            }


            if (!this.dimensionDataLoaded[dimensionName]) {
                store.on('load', function() {
                    this.dimensionDataLoaded[dimensionName] = true;
                    this.sortAndFilterStoreDelayed(store);
                }, this);
                if (hasHierarchy)
                {
                    Connector.getState().onMDXReady(function(mdx) {
                        mdx.query({
                            onRows: [{
                                hierarchy: dimensionName,
                                member: 'members'
                            }],
                            success: function(slice) {
                                if (store) {
                                    store.loadSlice(slice);
                                }
                            },
                            scope: this
                        });
                    }, this);
                }
                else {
                    store.loadSlice();
                }

            }
            else {
                this.sortAndFilterStoreDelayed(store);
            }
        }
        else {
            console.warn(this.className + '.loadData() unable to find dimension:', dimension);
        }
    },

    setHeader : function(dimension, id) {
        this.getHeader().setVisible(id ? false : true);
    },

    loadDataView : function(dimension, id, urlTab, params) {

        this.setHeader(dimension, id);

        // do not hide the header
        if (this.items.length > 1) {
            for (var i=1; i < this.items.items.length; i++) {
                this.items.items[i].hide();
            }
        }

        this.completeLoad(dimension, id, urlTab, params);
    },

    completeLoad : function(dimension, id, urlTab, params) {

        if (Ext.isDefined(dimension)) {
            var store, _id = id;

            // If we have an id we are loading the details for that id
            if (Ext.isDefined(id) && dimension.itemDetail) {
                store = StoreCache.getStore(dimension.detailItemCollection || dimension.detailCollection);

                var isIdString = dimension.itemDetail[0].isIdString;
                // coerce the id's type, this 'id' is possibly coming from the URL context
                if (!isIdString && Ext.isNumber(parseInt(id))) {
                    _id = parseInt(id);
                }

                var model = store.getById(_id) || this.resolveModel(store, _id);

                if (model) {
                    this.loadModel(model, dimension, urlTab, id, params);
                }
                else {
                    if (!store.isLoading() && store.getCount() > 0) {
                        Connector.getApplication().getController('Connector').showNotFound();
                    }
                    else {
                        store.on('load', function(s) {
                            var _model = s.getById(_id) || this.resolveModel(s, _id);
                            if (_model) {
                                this.loadModel(_model, dimension, urlTab, id, params);
                            }
                            else {
                                Connector.getApplication().getController('Connector').showNotFound();
                            }
                        }, this, {single: true});
                    }
                    this.loadData(dimension, store);
                }
            }
            else if (dimension.detailModel && dimension.detailView) {
                // otherwise, show the listing
                var listId = this.dataListPrefix + dimension.uniqueName;

                // listView -- cache hit
                if (this.listViews[listId]) {
                    this.getComponent(listId).show();
                }
                else {
                    // listView -- cache miss, create the view
                    store = StoreCache.getStore(dimension.detailCollection);

                    this.add(Ext.create(dimension.detailView, {
                        itemId: listId,
                        dimension: dimension,
                        store: store,
                        learnView: this
                        //plugins: ['learnheaderlock'],
                    }));

                    this.listViews[listId] = true;
                    this.loadData(dimension, store);
                }

                this.activeListing = this.getComponent(listId);
            }
            else {
                console.warn('Dimension \"' + dimension.getUniqueName() + '\" is marked as \'supportsDetails\'. It must provide itemDetail or detailModel and detailView configurations.');
            }
        }
        else {
            //
            // See which one the header is respecting
            //
            var dimModel = this.getHeader().getHeaderView().getStore().getAt(0);
            if (dimModel && dimModel.get('detailModel') && dimModel.get('detailView')) {
                this.loadDataView(dimModel.data);
            }
        }
    },

    resolveModel : function(store, id) {
        var delimiter = Connector.getService('Learn').URL_DELIMITER;
        if (Ext.isString(id) && id.indexOf(delimiter) != -1) {
            var _id = id.split(delimiter),
                    prop = _id[0],
                    val = Ext.isNumber(parseInt(_id[1])) ? parseInt(_id[1]) : _id[1],
                    data = store.data.items,
                    ret = [];
            // if a store is filtered, use snapshot items
            if (store.snapshot)
                data = store.snapshot.items;
            for (var i = 0; i < data.length; i++) {
                if (ret.length < 2 && data[i].get(prop) === val) {
                    ret.push(data[i]);
                }
            }

            if (ret.length === 1) {
                return ret[0];
            }
        }
    },

    loadModel : function(model, dimension, urlTab, id, params) {
        var tabViews = [], me = this;
        Ext.each(dimension.itemDetail, function(item, i) {
            if (item.view) {
                var tabConfig = {
                    model: model,
                    modules: item.modules
                };

                if (Connector.view.Learn.detailGridTabs.indexOf(dimension.itemDetailTabs[i].url) > -1) {
                    if (dimension.itemDetailTabs[i].matchField) {
                        if (!model.get(dimension.itemDetailTabs[i].matchField))
                            return;
                    }
                    tabConfig.learnViewConfig = {
                        learnView: me,
                        tabId: id,
                        tabDimension: dimension,
                        tabParams: params
                    };
                }

                tabViews.push(Ext.create(item.view, tabConfig));
            }
        }, this);

        var activeTab = 0;
        var validDetailTabs = [];
        Ext.each(dimension.itemDetailTabs, function(tab) {
            if (tab.matchField) {
                if (!model.get(tab.matchField))
                    return;
            }
            validDetailTabs.push(tab);
        });
        if (!Ext.isEmpty(validDetailTabs)) {
            Ext.each(validDetailTabs, function(tab, i) {
                if (tab.url === urlTab) {
                    activeTab = i;
                    return false;
                }
                else if (tab.isDefault === true) {
                    activeTab = i;
                }
            });
        }
        var pageView = Ext.create('Connector.view.Page', {
            pageID: 'learnDetail' + dimension.singularName,
            contentViews: tabViews,
            initialSelectedTab: activeTab,
            header: Ext.create('Connector.view.PageHeader', {
                title: model.get(model.labelProperty ? model.labelProperty : 'label'),
                model: model,
                dimension: dimension,
                activeTab: activeTab,
                hasSearch: dimension.itemDetailTabs[activeTab].hasSearch,
                searchValue: this.searchFilter,
                listeners: {
                    searchchanged: function(filter) {
                        this.onSearchFilterChange(filter, true);
                    },
                    scope: this
                }
            }),
            listeners: {
                hide: function(cmp){
                    // detail page needs to be destroyed on hide, otherwise it remains and repeats in the DOM
                    // For knitr report, custom stylesheet defined in report will then contaminate all Learn about pages
                    cmp.destroy();
                }
            }
        });
        this.detailPageView = pageView;
        this.add(pageView);
    },

    getDimensions : function() {
        return this.dimensions;
    },

    setDimensions : function(dimensions) {
        // hide Report tab if there is no publicly available reports
        var filteredDimensions = [], reportDimension, me = this;
        Ext.each(dimensions, function(dim){
            if (dim && dim.name == 'Report')
                reportDimension = dim;
            else
                filteredDimensions.push(dim);
        });
        if (reportDimension) {
            var reportStore = StoreCache.getStore(reportDimension.detailCollection);
            var reportDimensionName = reportDimension.name;
            reportStore.on('load', function() {
                me.dimensionDataLoaded[reportDimensionName] = true;
                if (this.getCount() > 0) {
                    me.dimensions = dimensions;
                    me.getHeader().setDimensions(dimensions);
                }
                else {
                    me.dimensions = filteredDimensions;
                    me.getHeader().setDimensions(filteredDimensions);
                }
            });
            reportStore.loadSlice();
        }
        else {
            this.dimensions = dimensions;
            this.getHeader().setDimensions(dimensions);
        }
    },

    // TODO: Move this to cube.js or hang the search fields on the model definitions themselves
    viewByDimension : {
        'Assay' : 'Assay',
        'Study' : 'Study',
        'Lab' : 'Labs',
        'Study product' : 'StudyProducts',
        'Report' : 'Report',
        'Publication' : 'Publication',
        'MAb': 'MAb'
    },

    searchFieldsByTab : function(name) {
        switch (name){
            case "vars":
                return Connector.view.module.VariableList.searchFields;
            case "antigens":
                return Connector.view.AssayAntigen.searchFields;
        }
    },

    selectDimension : function(dimension, id, urlTab, params) {
        this.searchFilter = params ? params.q : undefined;
        if (urlTab) {
            // detail tab case
            this.searchFields = this.searchFieldsByTab(urlTab);
        }
        else {
            // summary view case
            this.searchFields = Connector.app.view[this.viewByDimension[dimension.singularName]].searchFields;
        }

        if (dimension) {
            this.loadDataView(dimension, id, urlTab, params);
        }
        else {
            this.getHeader().on('selectdimension', this.loadDataView, this, {single: true});
        }

        this.getHeader().selectTab(dimension ? dimension.uniqueName : undefined, id, dimension, params);
    }

});


Ext.define('Connector.view.LearnHeader', {

    extend: 'Ext.container.Container',

    alias: 'widget.learnheader',

    height: 110,

    cls: 'header-container learnaboutheader',

    defaults: {
        ui: 'custom',
        flex: 1
    },

    searchValue: undefined,

    initComponent : function() {

        this.items = [{
            xtype: 'actiontitle',
            text: 'Learn about...'
        },{
            xtype: 'container',
            items: [this.getDataView(), this.getSearchField()],
            height: 56,
            cls: 'learn-header-bar',
            layout: {
                type: 'hbox',
                pack: 'center',
                align: 'center'
            }
        }];

        this.callParent();

        this.addEvents('selectdimension', 'searchchanged',
                'updateLearnFilter', 'updateLearnFilters', 'updateLearnSort');
    },

    getDataView : function() {
        if (!this.headerDataView) {
            this.headerDataView = Ext.create('Connector.view.LearnHeaderDataView', {
                flex: 2,
                minWidth: 620,
                cls: 'learn-dim-selector',
                dimensions: this.dimensions,
                store: Ext.create('Ext.data.Store', {
                    model: 'Connector.model.Dimension',
                    proxy: {
                        type: 'memory',
                        reader: {
                            type: 'json',
                            root: 'dimensions'
                        }
                    }
                })
            });
            this.headerDataView.on({
                itemclick: function(view, model) {
                    this.fireEvent('selectdimension', model);
                },
                requestselect : function(model) {
                    this.fireEvent('selectdimension', model, true);
                },
                scope: this
            });
        }
        return this.headerDataView;
    },

    getSearchField : function() {
        if (!this.searchField) {
            this.searchField = Ext.create('Connector.view.Learn.SearchField', {
                emptyText: 'Search',
                cls: 'learn-search-input',
                minWidth: 50,
                flex: 1,
                checkChangeBuffer: 500,
                value: this.searchValue,
                validator: Ext.bind(function(value) {
                    this.fireEvent('searchchanged', value);
                    return true;
                }, this)
            });
        }
        return this.searchField;
    },

    setDimensions : function(dimensions) {
        this.dimensions = dimensions;
        this.getDataView().setDimensions(dimensions);
    },

    selectTab : function(dimUniqueName, id, dimension, params) {
        if (!Ext.isEmpty(this.dimensions)) {
            this.getDataView().selectTab(dimUniqueName);
        }
        this.filterStoreFromUrlParams(id, dimension, params);
    },

    filterStoreFromUrlParams: function(id, dimension, params)
    {
        this.updateSearchValue(dimension, params);
        this.updateSort(dimension, params, id != null);
        this.updateFilters(dimension, params, id != null);
    },

    updateSearchValue: function(dimension, params) {
        var search = this.getSearchField();
        search.emptyText = 'Search ' + dimension.pluralName.toLowerCase();
        var newSearchValue = params && params.q ? params.q : '';
        search.setValue(newSearchValue);
        if (!newSearchValue) {
            this.fireEvent('searchchanged', newSearchValue);
        }
    },

    updateSort: function(dimension, params, isDetailLearnGrid) {
        var newSortStr = params && params.sort ? params.sort : '';
        var direction = 'ASC', column = newSortStr;
        if (newSortStr.indexOf('-') == 0) {
            direction = 'DESC';
            column = newSortStr.substr(1);
        }
        if (column)
            this.fireEvent('updateLearnSort', column, direction, isDetailLearnGrid);
    },

    updateFilters: function(dimension, params, negated, isDetailLearnGrid) {
        var filteredParams = {};
        Ext.iterate(params, function(key, val) {
            if (key)
                filteredParams[key] = val;
        });
        this.fireEvent('updateLearnFilters', filteredParams, negated, isDetailLearnGrid);
    }
});

//
// This is an internal class to header which is wrapped by Connector.view.LearnHeader
//
Ext.define('Connector.view.LearnHeaderDataView', {

    extend: 'Connector.view.HeaderDataView',

    alias: 'widget.learnheaderdataview',

    selectInitialDimension: false,

    tabSelectEventName: 'requestselect',

    keyFieldName: 'uniqueName',

    tpl: new Ext.XTemplate(
        '<tpl for=".">',
            '<h1 class="lhdv">{pluralName:htmlEncode}</h1>',
        '</tpl>'
    ),

    initComponent : function() {
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

        // Sort dimensions by stated priority
        //
        store.sort('priority', 'desc');

        //
        // Select the initial dimension
        //
        if (this.selectInitialDimension && store.getCount() > 0) {
            this.selectTab(store.getAt(0).get('uniqueName'));
        }
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

Ext.define('Connector.view.Learn.SearchField', {
    extend: 'Ext.form.field.Trigger',
    alias  : 'widget.learn-search',
    trigger1Cls: 'x-form-clear-trigger',

    onRender: function(){
        this.callParent(arguments);
        if (this.value === undefined || this.value === '') {
            var el = this.triggerEl.first();
            el.hide();
        }
    },

    onChange: function(newVal, oldVal){
        var el = this.triggerEl.first();

        this.callParent(arguments);

        if (newVal.length){
            el.show();
        } else {
            el.hide();
        }
    },

    onTrigger1Click: function(event){
        if (this.hideTrigger){
            return;
        }
        this.setValue("");
        this.fireEvent('cleartriggerclick', this, event);
    }
});
