/*
 * Copyright (c) 2016-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.window.LearnFacet', {

    extend: 'Connector.window.AbstractGroupedFacet',

    dim: undefined,

    filterConfigSet: [],

    currentFilterField: '',

    learnStore: undefined,

    getItems : function()
    {
        var facetGrids = this.createFacetGrids(this.filterConfigSet);
        this.facetGrids = facetGrids;

        this.currentFilterField = this.filterConfigSet[0].filterField;

        if (this.filterConfigSet.length > 1) {

            var btnId = Ext.id();
            var dropDownBtn = {
                id: btnId,
                xtype: 'imgbutton',
                itemId: 'infosortdropdown',
                cls: 'sortDropdown ipdropdown', // tests
                style: 'float: right;',
                menuAlign: 'tr-br',
                menuOffsets: [25, 0],
                menu: {
                    xtype: 'menu',
                    autoShow: true,
                    itemId: 'infosortedmenu',
                    showSeparator: false,
                    width: 270,
                    ui: 'custom',
                    cls: 'infosortmenu',
                    btn: btnId,
                    items: this.filterConfigSet.map(function(config) {
                        return {text: config.title};
                    }),
                    listeners: {
                        click: function(menu, item) {
                            var filterConfig = this.getConfigForField('title', item.text);
                            this.getTitleBar().update(filterConfig);
                            this.setFacetGridVisibility(filterConfig.filterField);
                        },
                        scope: this
                    }
                },
                listeners: {
                    afterrender : function(b) {
                        b.showMenu(); b.hideMenu(); // allows the menu to layout/render
                    }
                }
            };

            var selector = {
                xtype: 'container',
                ui: 'custom',
                layout: { type: 'hbox' },
                items: [this.getTitleBar(), dropDownBtn],
                listeners :{
                    render: function(cmp) {
                        cmp.getEl().on('click', function(){
                            Ext.getCmp(btnId).showMenu();
                        });
                    }
                }
            };
            this.setFacetGridVisibility();
            return [selector].concat(facetGrids);
        }
        return facetGrids;
    },

    createFacetGrids : function(filterConfigSet) {
        return filterConfigSet.map(function(config) {
            return Ext.create('Connector.grid.LearnFaceted', {
                itemId: 'faceted-' + config.filterField,
                border: false,
                useStoreCache: true,
                filterValues: config.columnFilter.filterValues,
                isFilterNegated: config.columnFilter.negated,
                dim: this.dim,
                tabId: this.tabId,
                columnField: config.filterField,
                valueType: config.valueType,
                learnStore: this.learnStore
            });
        }, this)
    },

    setFacetGridVisibility : function(colName) {
        if (colName) {
            this.currentFilterField = colName;
        }
        this.facetGrids.forEach(function(grid)
        {
            if (grid.columnField == this.currentFilterField) {
                grid.show();
            }
            else {
                grid.hide();
            }
        }, this);
    },

    getTitleBar : function() {
        if (!this.titleBar) {
            this.titleBar = Ext.create('Ext.Component', {
                xtype: 'box',
                tpl: new Ext.XTemplate(
                        '<div class="sorter">',
                        '<span class="sorter-label">Filter Values by:</span>',
                        '<span class="sorter-content">{title:htmlEncode}</span>',
                        '</div>'
                ),
                data: this.filterConfigSet[0],
                flex: 10
            });
        }
        return this.titleBar
    },

    getConfigForField : function(field, value) {
        var targetConfig = null;
        if (Ext.isArray(this.filterConfigSet)){
            Ext.each(this.filterConfigSet, function(config){
                if (config[field] == value) {
                    targetConfig = config;
                    return false;
                }
            });
        }
        return targetConfig;
    },

    onAfterRender : function() {
        this.callParent(arguments);
        this.getButton('dofilter').setText('Search');
    },

    applyFiltersAndColumns : function()
    {
        var view = this.getComponent('faceted-' + this.currentFilterField);
        var facetValues = view.getOptimizedFacetValues();
        var filterValues = facetValues.values;
        if (filterValues.length == 0) {
            this.fireEvent('clearfilter', this.currentFilterField);
        }
        else if (filterValues.length > this.maxSelection) {
            Ext.Msg.alert('Error', 'Maximum selection of ' + this.maxSelection + ' values allowed.')
        }
        else {
            this.fireEvent('filter', this.currentFilterField, filterValues, facetValues.negated);
        }
        this.close();
    },

    onClear : function() {
        this.fireEvent('clearfilter', this.currentFilterField);
        this.close();
    }
});


Ext4.define('Connector.grid.LearnFaceted', {

    extend: 'Connector.grid.AbstractGroupedFacet',

    dim: undefined,

    getOptimizedFacetValues : function() {
        var facetValues = this.getFacetValues();
        var selected = facetValues.selected, unselected = facetValues.unselected;
        if (selected && selected.length > 1 && selected.length > unselected.length)
        {
            return {
                values: unselected,
                negated: true
            };
        }
        return {
            values: selected,
            negated: false
        };
    },

    getFilteredValues: function() {
        var filteredStore = this.learnStore.data;
        return this.getLearnStoreValues(filteredStore);
    },

    getStoreId: function()
    {
        var id = '';
        if (this.dim)
        {
            id += this.dim;
        }
        else if (this.tabId)
        {
            id += this.tabId;
        }
        id += ('||' + this.columnField);
        return id;
    },

    getLearnStoreValues: function(store)
    {
        var concatBeforeSort = false; //if record is an array.
        var hasBlank = false; // handle empty value
        var values = store.getRange()
                .map(function(record) {
                    var value = record.get(this.columnField);
                    if (Ext.isArray(value)) {
                        concatBeforeSort = true;
                        if (value.length == 0)
                            hasBlank = true;
                    }
                    else {
                        if (value == null || value === '')
                            hasBlank = true;
                    }
                    return value;
                }, this);

        //converts 2d array to 1d array
        if (concatBeforeSort) {
            values = values.reduce(function (prev, curr){
                return (prev || []).concat(curr);
            });
        }

        if (hasBlank)
            values.push('[blank]');

        //remove null and duplicates
        values = Ext.Array.clean(values);
        return Ext.Array.unique(values);
    },

    getAllValues: function() {
        var store = this.learnStore.snapshot || this.learnStore.data;
        return this.getLearnStoreValues(store);
    }

});