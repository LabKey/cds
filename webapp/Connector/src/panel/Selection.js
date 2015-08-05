/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.Selection', {
    extend: 'Connector.panel.FilterPanel',

    alias: 'widget.selectionpanel',

    selectionMode: true,

    hideOnEmpty: true,

    cls: 'selectionpanel',

    padding: '20 0 0 0',

    title: 'Current Selection',

    showEmptyText: false,

    tbarButtons : [
        { text: 'Filter', itemId: 'overlap' },   // will switch between 'filter subjects' and 'filter data'
        { text: 'Remove', itemId: 'inverse'}
    ],

    initHeader : function() {

        // title
        var items = [{
            xtype: 'box',
            autoEl: {
                tag: 'div',
                cls: 'header',
                html: this.title
            },
            flex: 1
        }];

        for (var i=0; i < this.headerButtons.length; i++) {
            items.push(this.headerButtons[i]);
        }

        return {
            xtype: 'container',
            layout: {
                type: 'hbox'
            },
            items: items
        };
    },

    createHierarchyFilter : function(filterset) {
        return Ext.create('Connector.view.Selection', {
            store: {
                model: this.getModelClass(filterset),
                data: [filterset]
            }
        });
    },

    loadFilters : function(filters) {
        // the app currently only allows for 0 or 1 selection filter to be applied
        if (filters.length <= 1) {
            var removeBtn = this.down('#inverse'),
                showRemoveBtn = false;

            if (filters.length == 1) {
                filters[0].data.isSelection = true;
                showRemoveBtn = filters[0].get('showInverseFilter');
            }
            removeBtn.setVisible(showRemoveBtn);
        }

        this.displayFilters(filters);
    }
});