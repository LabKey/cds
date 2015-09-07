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

    constructor: function(config) {
        Ext.applyIf(config, {
            headerButtons: [],
            filters: []
        });
        this.callParent([config]);
    },

    initComponent : function() {

        this.items = [
            this.initHeader(),
            this.initContent()
        ];

        var emptyText = this.getEmptyTextPanel();

        if (emptyText) {
            this.items.push(emptyText);
        }

        if (this.tbarButtons) {
            this.dockedItems = [{
                xtype: 'toolbar',
                dock: 'bottom',
                ui: 'footer',
                items: this.tbarButtons
            }];
        }

        this.callParent();

        if (Ext.isArray(this.filters)) {
            this.loadFilters(this.filters);
        }
    },

    initHeader : function() {

        // title
        var items = [{
            xtype: 'box',
            cls: 'filterpanel-header',
            tpl: new Ext.XTemplate(
                '<h2 class="section-title">{title:htmlEncode}</h2>'
            ),
            data: {
                title: this.title
            },
            flex: 1
        }];

        for (var i=0; i < this.headerButtons.length; i++) {
            items.push(this.headerButtons[i]);
        }

        return {
            xtype: 'container',
            ui: 'custom',
            cls: 'bottom-spacer-lg',
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

    getEmptyTextPanel : function() {
        if (!this.emptyText) {
            this.emptyText = Ext.create('Ext.container.Container', {
                itemId: 'emptypanel',
                cls: 'filterpanel-header',
                html : '<div class="emptytext">All subjects</div>'
            });
        }
        return this.emptyText;
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

        var emptyTextPane = this.getEmptyTextPanel();

        if (filters.length === 0) {
            this.clear();
        }
        else {
            if (emptyTextPane) {
                emptyTextPane.hide();
            }

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
                for (var i=filters.length; i < length; i++) {
                    this.content.remove(this.content.items.items[i].id);
                }
            }

            this.show();
        }
    },

    clear : function() {
        var emptyTextPane = this.getEmptyTextPanel();

        if (emptyTextPane) {
            emptyTextPane.show();
        }

        if (this.hideOnEmpty) {
            this.hide();
        }
        else {
            this.show();
        }

        this.content.removeAll();
    },

    onSelectionChange : function(selections) {
        var empty = this.filters.length == 0 && selections.length == 0;

        if (empty) {
            this.clear();
        }
        else {
            var emptyTextPane = this.getEmptyTextPanel();

            if (emptyTextPane) {
                emptyTextPane.hide();
            }
        }
    }
});

