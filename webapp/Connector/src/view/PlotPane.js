/*
 * Copyright (c) 2014-2015 LabKey Corporation
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

    statics: {
        plotFilterContent : function(filter, getAsString)
        {
            var measures = filter.get('plotMeasures'),
                content = [];

            if (Ext.isArray(measures))
            {
                // assume length 3 array of (x, y, color)
                var indexOrder = [1,0,2];  // Y, X, then Color
                for (var i = 0; i < indexOrder.length; i++)
                {
                    var index = indexOrder[i];
                    var label = null;
                    if (index == 0) label = 'x-axis';
                    else if (index == 1) label = 'y-axis';
                    else if (index == 2) label = 'color';

                    if (measures[index] && measures[index].measure)
                    {
                        var source = Connector.model.Variable.getSourceDisplayText(measures[index].measure);
                        var options = Connector.model.Variable.getOptionsDisplayText(measures[index].measure);
                        var variable = measures[index].measure.label;

                        if (getAsString)
                            content = content.concat(Connector.model.Variable.getOptionsExportableStrings(measures[index].measure));
                        else
                        {
                            content.push({
                                xtype: 'box',
                                cls: 'plot-type-label',
                                html: label
                            });
                            content.push({
                                xtype: 'box',
                                cls: 'plot-source-label',
                                html: Ext.htmlEncode(source + (options ? ' (' + options + ')' : ''))
                            });
                            content.push({
                                xtype: 'box',
                                cls: 'plot-variable-label',
                                html: Ext.htmlEncode(variable)
                            });
                        }
                    }
                }
            }

            return content;
        }
    },

    getMiddleContent : function(model)
    {
        var filter = model.get('filter');

        var content = [{
            xtype: 'box',
            style: 'margin-bottom: 8px',
            autoEl: {
                tag: 'div',
                html: 'This filter includes only ' + (filter.get('isWhereFilter') ? '' : 'subjects with') + ' data for the following variables.'
            }
        }];

        return content.concat(Connector.view.PlotPane.plotFilterContent(filter));
    },

    getToolbarConfig : function(model) {
        return {
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'lightfooter',
            items: ['->',
                {
                    text: 'Close',
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
    }
});