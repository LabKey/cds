/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.Selection', {
    extend: 'Connector.panel.FilterPanel',

    alias: 'widget.selectionpanel',

    hideOnEmpty: true,

    cls: 'selectionpanel',

    title: 'Selection',

    tbarButtons : [
        '->',
        { text: 'Filter', itemId: 'overlap' },   // will switch between 'filter subjects' and 'filter data'
        { text: 'Remove', itemId: 'inverse' }
    ],

    bodyCls: 'selection-panel-wrapper',

    includeHeader: true,

    initHeader : function() {

        return {
            xtype: 'box',
            tpl: new Ext.XTemplate(
                '<div class="header">{title:htmlEncode}</div>',
                '<div class="instruction">{instruction:htmlEncode}</div>'
            ),
            data: {
                title: this.title,
                instruction: 'CTRL, CMD, and SHIFT select multiple values.'
            }
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
        this.filters = filters;
        // the app currently only allows for 0 or 1 selection filter to be applied
        if (filters.length <= 1) {
            var removeBtn = this.down('#inverse'),
                showRemoveBtn = false;

            if (filters.length == 1) {
                showRemoveBtn = filters[0].get('showInverseFilter') === true;
            }
            removeBtn.setVisible(showRemoveBtn);
        }

        this.displayFilters(filters);
    }
});