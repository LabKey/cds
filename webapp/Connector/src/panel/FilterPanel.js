/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.FilterPanel', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.filterpanel',

    ui: 'custom',

    preventHeader: true,

    cls: 'filterpanel',

    selectionMode: false,

    hideOnEmpty: false,

    showEmptyText: true,

    headerButtons: [],

    filters: [],

    initComponent : function() {

        this.items = [
            this.initHeader(),
            this.initContent()
        ];

        if (this.showEmptyText) {
            this.items.push(this.createEmptyPanel());
        }

        this.dockedItems = [{
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            width: 230,
            items: this.tbarButtons
        }];

        this.callParent();

        if (Ext.isArray(this.filters)) {
            this.loadFilters(this.filters);
        }
    },

    initHeader : function() {

        // title
        var items = [{
            xtype: 'box',
            autoEl: {
                tag: 'h2',
                style: 'font-size: 17pt;',
                html: this.title
            }
        }];

        for (var i=0; i < this.headerButtons.length; i++) {
            items.push(this.headerButtons[i]);
        }

        return {
            xtype: 'container',
            ui: 'custom',
            style: 'margin-bottom: 10px;',
            layout: {
                type: 'hbox'
            },
            items: items
        };
    },

    initContent : function() {
        if (!this.content) {
            this.content = Ext.create('Ext.Container', {});
        }

        return this.content;
    },

    createEmptyPanel : function() {
        return Ext.create('Ext.container.Container', {
            itemId: 'emptypanel',
            html : '<div class="emptytext">All subjects</div>'
        });
    },

    createHierarchyFilter : function(filterset) {
        var view = Ext.create('Connector.view.Selection', {
            cls: 'activefilter',
            store: {
                model: this.getModelClass(filterset),
                data: [filterset]
            }
        });
        return view;
    },

    getModelClass : function(filterset) {
        return 'Connector.model.Filter';
    },

    // entry point to load raw OLAP Filters
    loadFilters : function(filters) {
        this.displayFilters(filters);
    },

    displayFilters : function(filters) {
        this.content.removeAll();
        var panels = [];

        for (var f=0; f < filters.length; f++) {
            // add filter ids
            filters[f].data.id = filters[f].id;
            panels.push(this.createHierarchyFilter(filters[f]));
        }

        var isEmpty = (panels.length == 0);

        if (!isEmpty) {
            this.content.add(panels);
            if (this.showEmptyText) {
                this.getComponent('emptypanel').hide();
            }
        }
        else {
            if (this.showEmptyText) {
                this.getComponent('emptypanel').show();
            }
        }

        if (this.hideOnEmpty && isEmpty) {
            this.hide();
        }
        else {
            this.show();
        }
    }
});

