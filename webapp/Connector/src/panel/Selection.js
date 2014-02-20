/*
 * Copyright (c) 2014 LabKey Corporation
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

    initHeader : function() {

        // title
        var items = [{
            xtype: 'box',
            autoEl: {
                tag: 'div',
                cls: 'header',
                html: this.title
            }
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
    }
});