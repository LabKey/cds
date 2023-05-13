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

    initialSelectedTab: 0,

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

            var visibleDetailGrid = this.items.items.filter(function(item) {
                return !item.hidden && item.pageID === 'learnDetailAssay';
            }, this);
            if (visibleDetailGrid.length === 1)
            {
                var grid = Ext.getCmp("app-view-assayantigengrid");
                if (grid) {
                    grid.fireEvent("learnDetailsGridResizeHeight", height);
                }
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

    requestAssayExportCSV : function(cmp, item, data) {
        this.requestAssayExport(false, cmp, item, data);
    },

    requestAssayExportExcel : function(cmp, item, data) {
        this.requestAssayExport(true, cmp, item, data);
    },

    requestAssayExport : function(isExcel, cmp, item, data) {

        //for metadata
        var assayName = data.assay_short_name;

        //for variables and descriptions
        var variablesSchema = "study";
        var variablesQuery = data.assay_type;
        var qviewName = "AssayExportView";

        //for antigen
        // Currently, only two assays have antigens that should be part of the Export. In the future, client might
        // want to include more assays with antigens, in which case make this data driven rather than hard coded
        // query values by adding a property to the assay metadata
        var antigen_query = null;
        if (data.assay_identifier.includes("BAMA")) {
            antigen_query = "bamaantigen";
        }
        else if (data.assay_identifier.includes("NAB")) {
            antigen_query = "nabantigen";
        }

        var newForm = document.createElement('form');
        document.body.appendChild(newForm);

        var exportParams = {
            "query.showRows": ['ALL'],
            'X-LABKEY-CSRF': LABKEY.CSRF,
            isExcel : isExcel,
            columnNames: [],
            columnAliases: [],
            dataTabNames : [data.assay_identifier],
            schemaNames : ['cds'] ,
            queryNames : ['import_assay'],
            fieldKeys : ['assay_identifier'],
            filterStrings: ["Selected Assay:" + ChartUtils.ANTIGEN_LEVEL_DELIMITER + assayName],
            assayFilterString: data.assay_identifier,
            antigenQuery: antigen_query
        };

        LABKEY.Query.getQueryDetails({
            scope: this,
            schemaName: variablesSchema,
            queryName: variablesQuery,
            viewName: qviewName,
            success: function (details) {

                if (details) {
                    if (details.views) {
                        var viewInfo = details.views.filter(function (view) {
                            return view.name === qviewName
                        }, this);
                        if (viewInfo && viewInfo.length === 1) {
                            var viewFields = viewInfo[0].fields;

                            var variables = [];
                            Ext.each(viewFields, function (field) {
                                variables.push(assayName + ChartUtils.ANTIGEN_LEVEL_DELIMITER + field.caption + ChartUtils.ANTIGEN_LEVEL_DELIMITER + (field.description ? field.description : " "));
                            });
                            exportParams.variables = variables;
                        }
                    }
                }

                LABKEY.Query.getQueryDetails({
                    scope: this,
                    schemaName: 'cds',
                    queryName: 'import_assay',
                    viewName: 'LearnGridExportView',
                    success: function (details) {

                        if (details) {
                            if (details.views) {
                                var viewInfo = details.views.filter(function (view) {
                                    return view.name === 'LearnGridExportView'
                                }, this);

                                if (viewInfo && viewInfo.length === 1) {
                                    var viewFields = viewInfo[0].fields;
                                    exportParams.columnNames = viewFields.map(function (cols) {
                                        return cols.name
                                    });
                                    exportParams.columnAliases = viewFields.map(function (cols) {
                                        return cols.caption
                                    });
                                }
                            }

                            // export
                            Ext.Ajax.request({
                                url: LABKEY.ActionURL.buildURL('cds', 'exportLearnAssay'),
                                method: 'POST',
                                form: newForm,
                                isUpload: true,
                                params: exportParams,
                                callback: function (options, success/*, response*/) {
                                    if (!success) {
                                        Ext.Msg.alert('Error', 'Unable to export ' + data.assay_type);
                                    }
                                }
                            });
                        }
                    },
                });
            },
            failure: function() {
                Ext.Msg.alert('Error', "Error exporting Learn page '" + data.assay_type + "'");
            },
        });
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
        Ext.getCmp('learn-grid-export-button-id').store = store;
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
                                    Ext.getCmp('learn-grid-export-button-id').store = store;
                                    store.loadSlice(slice);
                                }
                            },
                            scope: this
                        });
                    }, this);
                }
                else {
                    Ext.getCmp('learn-grid-export-button-id').store = store;
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

                console.log("*this.initialSelectedTab", this.initialSelectedTab);

                // listView -- cache hit
                // Secure Issue 47890: Dataspace - Blank Assay page after navigating to Assay subtabs such as Variables and Antigens
                // Adding a check for this.initialSelectedTab will load from cache only when navigating from the Overview tab to Learn grid,
                // otherwise create the view when navigating from other tabs such as Assay's Variables or Antigens tabs.
                if (this.initialSelectedTab === 0 && this.listViews[listId]) {
                    this.getComponent(listId).show();
                }
                else {
                    // listView -- cache miss, create the view
                    store = StoreCache.getStore(dimension.detailCollection);

                    this.add(Ext.create(dimension.detailView, {
                        padding : '2 0 0 0',
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
                showExport: dimension.itemDetailTabs[activeTab].showExport,
                searchValue: this.searchFilter,
                listeners: {
                    searchchanged: function(filter) {
                        this.onSearchFilterChange(filter, true);
                    },
                    exportassaycsv: function(cmp, item, data) {
                        this.requestAssayExportCSV(cmp, item, data);
                    },
                    exportassayexcel: function(cmp, item, data) {
                        this.requestAssayExportExcel(cmp, item, data);
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
        if (urlTab === 'antigens') {
            pageView.removeCls('auto-scroll-y');
        }
        this.initialSelectedTab = pageView.initialSelectedTab;
        this.detailPageView = pageView;
        this.add(pageView);
    },

    getDimensions : function() {
        return this.dimensions;
    },

    setDimensions : function(dimensions) {
        // hide learn about tabs if there is no data, ex. publicly available Reports and/or Antigens
        var filteredDimensions = [], dimsToHideIfNoData = [], me = this;
        Ext.each(dimensions, function(dim){
            if (dim && dim.displayOnlyIfHasData === true)
                dimsToHideIfNoData.push(dim);
            else
                filteredDimensions.push(dim);
        });
        if (dimsToHideIfNoData.length > 0) {
            dimsToHideIfNoData.forEach(function (dim) {
                var dimStore = StoreCache.getStore(dim.detailCollection);
                var dimensionName = dim.name;
                dimStore.on('load', function () {
                    me.dimensionDataLoaded[dimensionName] = true;
                    if (this.getCount() > 0) {
                        me.dimensions = dimensions;
                        me.getHeader().setDimensions(dimensions);
                        filteredDimensions.push(dim)
                    }
                    else {
                        me.dimensions = filteredDimensions;
                        me.getHeader().setDimensions(filteredDimensions);
                    }
                });
                dimStore.loadSlice();
            });
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
        'MAb': 'MAb',
        'Antigen': 'Antigen'
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
            items: [this.getDataView(), this.getSearchField(), this.getExportButton()],
            height: 56,
            id: 'learn-header-bar-id',
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
                minWidth: 725,
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

    getExportButton : function () {
        if (!this.exportButton) {
            this.exportButton = {
                xtype: 'exportbutton',
                id: 'learn-grid-export-button-id',
                margin : '17 25 0 25',
                hidden : true,
                dimension : undefined,
                store : undefined,
                width : 100,
                listeners: {
                    exportcsv : this.requestExportCSV,
                    exportexcel : this.requestExportExcel,
                    scope: this
                }
            }
        }
        return this.exportButton;
    },

    requestExportCSV : function() {
        this.requestExport(false);
    },

    requestExportExcel : function() {
        this.requestExport(true);
    },

    requestExport : function(isExcel) {

        var exportButtonCmp = Ext.getCmp('learn-grid-export-button-id');
        var queryName = exportButtonCmp.dimension.learnExportQuery;
        var learnGridName = exportButtonCmp.dimension.pluralName;
        var store = exportButtonCmp.store;

        var newForm = document.createElement('form');
        document.body.appendChild(newForm);

        var exportParams = {
            "query.showRows": ['ALL'],
            'X-LABKEY-CSRF': LABKEY.CSRF,
            isExcel : isExcel,
            columnNames: [],
            columnAliases: [],
            dataTabNames : [learnGridName],
            schemaNames : ["cds"] ,
            queryNames : [queryName],
            fieldKeys : [],
            learnGridFilterValues : store.data.keys,
            filterStrings: []
        };

        LABKEY.Query.getQueryDetails({
            scope: this,
            schemaName: 'cds',
            queryName: queryName,
            viewName: 'LearnGridExportView',
            success: function (details) {

                if (details) {
                    if (details.views) {

                        var viewInfo = details.views.filter(function(view) { return view.name === 'LearnGridExportView' }, this);

                        if (viewInfo && viewInfo.length === 1) {
                            var viewFields = viewInfo[0].fields;
                            exportParams.columnNames = viewFields.map(function(cols) { return cols.name });
                            exportParams.columnAliases = viewFields.map(function(cols) { return cols.caption });

                            if (learnGridName === 'MAbs') {
                                exportParams.fieldKeys = ['mab_mix_label'];

                                var variables = [];
                                Ext.each(viewFields, function(field) {
                                    variables.push(field.caption + ChartUtils.ANTIGEN_LEVEL_DELIMITER + field.description);
                                });
                                exportParams.variables = variables;

                                //get filter values to write to metadata excel tab or csv file
                                if (store.data.keys.length < store.totalCount)
                                {
                                    var filterStrs = [];
                                    filterStrs.push("Selected MAb/Mixture(s)");
                                    filterStrs.push(Connector.view.MabGrid.ColumnMap['mab_mix_name_std'].filterLabel + ": " + store.data.keys.join(', '));
                                    exportParams.filterStrings = filterStrs.join(ChartUtils.ANTIGEN_LEVEL_DELIMITER);
                                }
                            }
                            else {
                                exportParams.fieldKeys = viewFields.filter(function(col) { return col.isKeyField === true }, this)[0].fieldKeyArray;
                            }
                        }
                    }
                }

                //export
                Ext.Ajax.request({
                    url: LABKEY.ActionURL.buildURL('cds', 'exportLearnGrid'),
                    method: 'POST',
                    form: newForm,
                    isUpload: true,
                    params: exportParams,
                    callback: function (options, success/*, response*/) {
                        if (!success) {
                            Ext.Msg.alert('Error', 'Unable to export ' + learnGridName);
                        }
                    }
                });
            },
            failure: function() {
                Ext.Msg.alert('Error', "Error exporting Learn page '" + learnGridName + "'");
            },
        });
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
        this.showExportButton(dimension);
    },

    filterStoreFromUrlParams: function(id, dimension, params)
    {
        this.updateSearchValue(dimension, params);
        this.updateSort(dimension, params, id != null);
        this.updateFilters(dimension, params, id != null);
    },

    showExportButton: function(dimension) {
        if (dimension.hasExport) {
            Ext.getCmp('learn-grid-export-button-id').show();
        }
        else {
            Ext.getCmp('learn-grid-export-button-id').hide();
        }
        Ext.getCmp('learn-grid-export-button-id').dimension = dimension;
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
            '<h1 id="{[this.getId(values)]}" class="lhdv">{pluralName:htmlEncode}</h1>',
        '</tpl>',
        {
            getId : function(values) {
                return "learn-header-" + values.pluralName + "-id";
            }
        }
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
