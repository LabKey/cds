/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.GridPane', {

    extend: 'Connector.view.InfoPane',

    padding: '10',

    showSort: false,

    isShowOperator: false,

    maxHeight: 415,

    displayTitle: 'Filter details',

    getMiddleContent : function(model)
    {
        var filter = model.get('filter'),
            gridFilters = filter.get('gridFilter'),
            xLabel = filter.get('xLabel'),
            yLabel = filter.get('yLabel'),
            excludeIndexes = {};

        var content = [{
            xtype: 'box',
            tpl: new Ext.XTemplate(
                '<div>',
                    'This filter includes only ',
                    '<tpl if="isAggregated">',
                        '<b>subjects with aggregated</b> ',
                    '</tpl>',
                    'data for the following variables.',
                '</div>'
            ),
            data: {
                isAggregated: filter.isAggregated()
            }
        }];

        if (xLabel)
        {
            content.push({
                xtype: 'box',
                padding: 'smallstandout soft spacer'
            });
            content.push({
                xtype: 'box',
                padding: '0 0 7px 0',
                html: Ext.htmlEncode(xLabel)
            });
            excludeIndexes[0] = true;
            excludeIndexes[1] = true;
        }

        if (yLabel)
        {
            content.push({
                xtype: 'box',
                padding: 'smallstandout soft spacer'
            });
            content.push({
                xtype: 'box',
                padding: '0 0 7px 0',
                html: Ext.htmlEncode(yLabel)
            });
            excludeIndexes[2] = true;
            excludeIndexes[3] = true;
        }

        if (filter.get('isStudyAxis')) {
            content.push({
                xtype: 'box',
                html: filter.get('filterDisplayString')
            });
        }
        else if (Ext.isArray(gridFilters))
        {
            var shown = {};
            Ext.each(gridFilters, function(gf, i)
            {
                if (excludeIndexes[i])
                {
                    return;
                }

                if (gf != null && Ext.isDefined(gf))
                {
                    // get this columns measure information
                    var measure = Connector.getQueryService().getMeasure(gf.getColumnName());
                    if (Ext.isDefined(measure))
                    {

                        // only show the measure label/caption for the first filter
                        if (!shown[measure.alias])
                        {
                            content.push({
                                xtype: 'box',
                                cls: 'smallstandout soft spacer',
                                html: Ext.htmlEncode(Ext.isString(measure.longlabel) ? measure.longlabel : measure.shortCaption)
                            });
                            content.push({
                                xtype: 'box',
                                padding: '0 0 7px 0',
                                html: Ext.htmlEncode(this.getSublabel(measure))
                            })
                        }
                        shown[measure.alias] = true;

                        // the query service can lookup a measure, but only the base of a lookup
                        var label = Ext.isString(measure.label) ? measure.label : '';
                        if (gf.getColumnName().indexOf('/') > -1)
                        {
                            label = LABKEY.app.model.Filter.getGridFilterLabel(gf);
                        }

                        // issue 21879: split Equals One Of filter values into new lines
                        var filterStr = Connector.model.Filter.getGridLabel(gf),
                            filterType = gf.getFilterType();

                        if (filterType === LABKEY.Filter.Types.EQUALS_ONE_OF ||
                            filterType === LABKEY.Filter.Types.EQUALS_NONE_OF)
                        {
                            filterStr = filterType.getDisplayText() + ':<br/><ul class="indent"><li>- ';
                            filterStr += Connector.model.Filter.getFilterValuesAsArray(gf).join('</li><li>- ');
                            filterStr += '</li></ul>';
                        }

                        content.push({
                            xtype: 'box',
                            html: Ext.htmlEncode(label) + ' ' + filterStr
                        });
                    }
                }
            }, this);
        }

        return content;
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
    },

    getSublabel : function(measure)
    {
        var sub = '';
        if (measure.options && measure.options.alignmentVisitTag)
        {
            sub = " (" + measure.options.alignmentVisitTag + ")";
        }
        else if (Ext.isString(measure.description))
        {
            sub = ' ' + measure.description;
        }
        return sub;
    }
});
