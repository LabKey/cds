/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.GridPane', {

    extend: 'Connector.view.InfoPane',

    padding: '10',

    showSort: false,

    isShowOperator: false,

    maxHeight: 400,

    displayTitle: 'Filter details',

    getMiddleContent : function(model) {
        var filter = model.get('filter');
        var gridFilters = filter.get('gridFilter');

        var content = [{
            xtype: 'box',
            autoEl: {
                tag: 'div',
                html: 'This filter includes only subjects with data for the following variables.'
            }
        }];

        if (Ext.isArray(gridFilters)) {
            var shown = {};
            Ext.each(gridFilters, function(gf) {
                // get this columns measure information
                var measure = Connector.getService('Query').getMeasure(gf.getColumnName());
                if (Ext.isObject(measure) && !shown[measure.alias]) {
                    shown[measure.alias] = true;
                    content.push({
                        xtype: 'box',
                        cls: 'smallstandout soft spacer',
                        autoEl: {
                            tag: 'div',
                            html: Ext.isString(measure.longlabel) ? measure.longlabel : measure.shortCaption
                        }
                    });
                    content.push({
                        xtype: 'box',
                        autoEl: {
                            tag: 'div',
                            html: (Ext.isString(measure.label) ? measure.label : '') + this.getSublabel(measure)
                        }
                    });
                }
            }, this);
        }

        return content;
    },

    getToolbarConfig : function(model) {
        return {
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            items: ['->',
//                {
//                    text: 'clear filter',
//                    cls: 'infoplotaction', // tests
//                    handler: this.onUpdate,
//                    scope: this
//                },
                {
                    text: 'close',
                    cls: 'infoplotcancel', // tests
                    handler: function() { this.hide(); },
                    scope: this
                }
            ]
        }
    },

    onUpdate : function() {
        this.getModel().clearFilter(true);
        this.hide();
    },

    getSublabel : function(measure) {
        var sub = '';
        if (measure.options)
        {
            if (measure.options.antigen)
                sub = " (" + measure.options.antigen.values.join(", ") + ")";
            else if (measure.options.alignmentVisitTagLabel)
                sub = " (" + measure.options.alignmentVisitTagLabel + ")";
        }
        else if (Ext.isString(measure.description))
        {
            sub = ' ' + measure.description;
        }
        return sub;
    }
});
