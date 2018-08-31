/*
 * Copyright (c) 2014-2017 LabKey Corporation
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

    statics: {
        gridFilterContent: function (filter, getAsString) {
            var dataFilters = filter.get('gridFilter'),
                    xLabel = filter.get('xLabel'),
                    yLabel = filter.get('yLabel'),
                    excludeIndexes = {};

            if (filter.get('isTime')) {
                // skip participant sequence filter and use raw time filters
                dataFilters = filter.get('timeFilters');
                Ext.each(filter.get('gridFilter'), function (gFilter) {
                    if (gFilter && gFilter.getColumnName() != QueryUtils.SUBJECT_SEQNUM_ALIAS) {
                        dataFilters.push(gFilter);
                    }
                });
            }
            var content = [], sourceString = '', fieldString = '', contentString = '';
            if (!getAsString)
                content.push({
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
                });

            if (xLabel) {
                if (getAsString)
                    labelString = xLabel;
                else
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
                }

                excludeIndexes[0] = true;
                excludeIndexes[1] = true;
            }

            if (yLabel) {
                if (getAsString)
                    labelString = yLabel;
                else
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
                }

                excludeIndexes[2] = true;
                excludeIndexes[3] = true;
            }

            if (filter.get('isStudyAxis')) {
                if (getAsString)
                {
                    sourceString = "Time axis filters";
                    contentString = Connector.view.GridPane.stripHTMLTags(filter.get('filterDisplayString'));
                    content.push(sourceString + ChartUtils.ANTIGEN_LEVEL_DELIMITER + contentString);
                }
                else
                    content.push({
                        xtype: 'box',
                        html: filter.get('filterDisplayString')
                    });
            }
            else if (Ext.isArray(dataFilters)) {
                var shown = {};
                var sourceLabel = '';
                Ext.each(dataFilters, function (gf, i) {
                    if (excludeIndexes[i]) {
                        return;
                    }

                    if (gf != null && Ext.isDefined(gf)) {
                        // get this columns measure information
                        var measure = Connector.getQueryService().getMeasure(gf.getColumnName());
                        if (filter.get('isTime') && filter.get('timeMeasure') && !measure) {
                            measure = filter.get('timeMeasure').measure;
                        }

                        if (Ext.isDefined(measure)) {

                            // only show the measure label/caption for the first filter
                            if (!shown[measure.alias]) {
                                sourceLabel = Ext.isString(measure.longlabel) ? measure.longlabel : measure.shortCaption ? measure.shortCaption : measure.queryLabel;
                                var subLabel = Connector.view.GridPane.getSublabel(measure);
                                if (getAsString)
                                {
                                    sourceString = sourceLabel;
                                }
                                else
                                {
                                    content.push({
                                        xtype: 'box',
                                        cls: 'smallstandout soft spacer',
                                        html: Ext.htmlEncode(sourceLabel)
                                    });
                                    content.push({
                                        xtype: 'box',
                                        padding: '0 0 7px 0',
                                        html: Ext.htmlEncode(subLabel)
                                    })
                                }

                            }
                            shown[measure.alias] = true;

                            // the query service can lookup a measure, but only the base of a lookup
                            var label = Ext.isString(measure.label) ? measure.label : '';
                            if (gf.getColumnName().indexOf('/') > -1) {
                                label = Connector.model.Filter.getGridFilterLabel(gf);
                            }

                            // issue 21879: split Equals One Of filter values into new lines
                            var filterStr = Connector.model.Filter.getGridLabel(gf),
                                    filterType = gf.getFilterType();

                            if (filterType === LABKEY.Filter.Types.EQUALS_ONE_OF ||
                                    filterType === LABKEY.Filter.Types.EQUALS_NONE_OF) {
                                filterStr = filterType.getDisplayText() + ':';
                                filterStr += getAsString ? ' ' : '<br/><ul class="indent"><li>- ';
                                filterStr += Connector.model.Filter.getFilterValuesAsArray(gf).join(getAsString ? ', ' : '</li><li>- ');
                                filterStr += getAsString ? '.' : '</li></ul>';
                            }

                            if (getAsString)
                            {
                                fieldString = label;
                                contentString = filterStr.replace('&#8800;', '<>').replace('&#8805;', ">=").replace('&#8804;', "<=");
                                content.push(sourceString + ChartUtils.ANTIGEN_LEVEL_DELIMITER + fieldString + ' ' + contentString);
                            }
                            else
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

        getSublabel : function(measure)
        {
            var sub = '';
            if (measure.options && measure.options.alignmentVisitTag)
            {
                sub = " relative to " + measure.options.alignmentVisitTag.toLowerCase();
            }
            else if (Ext.isString(measure.description))
            {
                sub = ' ' + measure.description;
            }
            return sub;
        },

        stripHTMLTags: function(html)
        {
            var tmp = document.createElement("DIV");
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || "";
        }
    },

    getMiddleContent : function(model)
    {
        var filter = model.get('filter');
        return Connector.view.GridPane.gridFilterContent(filter);
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
