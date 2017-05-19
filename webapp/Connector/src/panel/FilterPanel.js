/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.FilterPanel', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.filterpanel',

    ui: 'custom',

    preventHeader: true,

    cls: 'filterpanel',

    hideOnEmpty: false,

    includeHeader: false,

    constructor: function(config) {
        Ext.applyIf(config, {
            headerButtons: [],
            filters: []
        });
        this.callParent([config]);
    },

    initComponent : function() {

        this.items = [];

        if (this.includeHeader) {
            this.items.push(this.initHeader());
        }

        this.items.push(this.initContent());

        if (this.tbarButtons) {
            this.dockedItems = [{
                xtype: 'toolbar',
                dock: 'bottom',
                ui: 'lightfooter',
                items: this.tbarButtons
            }];
        }

        this.callParent();

        if (Ext.isArray(this.filters)) {
            this.loadFilters(this.filters);
        }
    },

    initHeader : function() {
        throw 'Base class ' + this.$className + ' does not support initHeader()';
    },

    initContent : function() {
        if (!this.content) {
            this.content = Ext.create('Ext.Container', {});
        }

        return this.content;
    },

    createHierarchyFilter : function(filterset) {
        return Ext.create('Connector.view.Selection', {
            store: {
                model: this.getModelClass(filterset),
                data: [filterset]
            }
        });
    },

    getModelClass : function() {
        return 'Connector.model.Filter';
    },

    // entry point to load raw OLAP Filters
    loadFilters : function(filters) {
        this.filters = filters;
        this.displayFilters(filters);
    },

    displayFilters : function(filters) {

        if (filters.length === 0) {
            this.clear();
        }
        else {
            var length = this.content.items.items.length;
            Ext.each(filters, function(filter, idx) {
                filter.data.id = filter.id;
                if (idx < length) {
                    this.content.items.items[idx].getStore().loadData([filter]);
                }
                else {
                    this.content.add(this.createHierarchyFilter(filter));
                }
            }, this);

            if (filters.length < length) {
                // Issue 30387: remove from last to first to avoid trying to remove at already removed index
                for (var i = length - 1; i > filters.length - 1; i--) {
                    this.content.remove(this.content.items.items[i].id);
                }
            }

            this.show();
        }
    },

    clear : function() {

        if (this.hideOnEmpty) {
            this.hide();
        }
        else {
            this.show();
        }

        this.content.removeAll();
    },

    onSelectionChange : function(selections) {
        if (this.filters.length == 0 && selections.length == 0) {
            this.clear();
        }
    }
});

