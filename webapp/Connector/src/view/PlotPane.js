/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.PlotPane', {

    extend: 'Connector.view.InfoPane',

    padding: '10',

    showSort: false,

    isShowOperator: false,

    maxHeight: 400,

    displayTitle: 'In the plot',

    getMiddleContent : function(model) {
        var filter = model.get('filter');
        var measures = filter.get('plotMeasures');
        var scales = filter.get('plotScales');

        var content = [{
            xtype: 'box',
            autoEl: {
                tag: 'div',
                html: 'This filter includes only subjects with data for the following variables.'
            }
        }];

        if (Ext.isArray(measures)) {
            // assume length 3 array of (x, y, color)
            var indexOrder = [1,0,2];  // Y, X, then Color
            for (var i = 0; i < indexOrder.length; i++)
            {
                var index = indexOrder[i];
                var label = null;
                if (index == 0) label = 'X';
                else if (index == 1) label = 'Y';
                else if (index == 2) label = 'Color';

                if (measures[index] && measures[index].measure) {
                    content.push({
                        xtype: 'box',
                        cls: 'smallstandout soft spacer',
                        autoEl: {
                            tag: 'div',
                            html: label
                        }
                    });
                    content.push({
                        xtype: 'box',
                        autoEl: {
                            tag: 'div',
                            html: measures[index].measure.queryLabel
                        }
                    });
                    content.push({
                        xtype: 'box',
                        autoEl: {
                            tag: 'div',
                            html: measures[index].measure.label + this.getSublabel(measures[index].measure)
                        }
                    });
                }
            }
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
//                    text: 'clear plot',
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
        return sub;
    }
});