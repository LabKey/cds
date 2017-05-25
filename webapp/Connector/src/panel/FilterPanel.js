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
                model: 'Connector.model.Filter',
                data: [filterset]
            }
        });
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
            // The following iteration replaces/adds/removes filter displays based on the incoming filters.
            // When attempts were made to use removeAll() with suspend/resume layout it causes the filter
            // displays to briefly flash upon update. To achieve a more fluid display update hierarchy filters
            // are reused when available (e.g. getStore().loadData(...)) and any remaining filters are removed
            // in reverse position order due to issue 30387.

            var newItems = [];
            var length = this.content.items.length;

            Ext.each(filters, function(filter, idx) {
                filter.data.id = filter.id;
                if (idx < length) {
                    this.content.items.getAt(idx).getStore().loadData([filter]);
                }
                else {
                    newItems.push(this.createHierarchyFilter(filter));
                }
            }, this);

            if (newItems.length) {
                this.content.add(newItems);
            }

            if (filters.length < length) {
                // Issue 30387: remove from last to first to avoid trying to remove at already removed index
                for (var i = length - 1; i > filters.length - 1; i--) {
                    this.content.remove(this.content.items.getAt(i));
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

