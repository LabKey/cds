/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Selection', {

    extend: 'LABKEY.app.view.Selection',

    alias: 'widget.selectionview',

    itemSelector: 'div.wrapitem',

    loadMask: false,

    tpl: new Ext.XTemplate(
            '<tpl for=".">',
                '<tpl if="this.isPlotSelection(values) === true">',
                    // Plot Selection Filter
                    '<div class="wrapitem">',
                        '<div class="circle"></div>',
                        '<div class="selitem sel-listing">{[this.renderPlotSelection(values)]}</div>',
                    '</div>',
                '</tpl>',
                '<tpl if="this.isGrid(values) === true">',
                    // Grid Filter
                    '<div class="wrapitem">',
                        '<div class="circle"></div>',
                        '<div class="selitem status-over memberitem">',
                            '<div class="closeitem" data-id="{id}" member-index="0"></div>',
                            '{[this.renderGridFilterLabel(values)]}',
                        '</div>',
                    '</div>',
                '</tpl>',
                '<tpl if="this.isPlot(values) === true">',
                    // "In the plot" Filter
                    '<div class="wrapitem">',
                        '<div class="circle"></div>',
                        '<div class="selitem status-over memberitem">',
                            '<div class="closeitem" data-id="{id}" member-index="0"></div>',
                            '{[this.renderMeasures(values)]}',
                        '</div>',
                    '</div>',
                '</tpl>',
                '<tpl if="this.isPlot(values) === false && this.isGrid(values) === false && this.isPlotSelection(values) === false">',
                    // Normal Filter (and Group Filters)
                    '<div class="wrapitem">',
                        '<div class="circle"></div>',
                        '<tpl if="members.length &gt; 0">',
                            '<div class="closeitem wholeitem" data-id="{id}"></div>',
                            '<div class="selitem sel-listing">{[this.renderType(values)]}</div>',
                            '<tpl if="members.length &gt; 1 || isSelection === true">',
                                '<tpl for="members">',
                                    '{% if (parent.isSelection !== true && xindex > 5) break; %}',
                                    '<div class="status-over memberitem collapsed-member">',
                                        '<span>{uniqueName:this.renderUniqueName}</span>',
                                    '</div>',
                                '</tpl>',
                                '<tpl if="members.length &gt; 1">',
                                    '<select>',
                                        '<option value="' + LABKEY.app.model.Filter.Operators.INTERSECT + '" {operator:this.selectIntersect}>Subjects related to all (AND)</option>',
                                        '<option value="' + LABKEY.app.model.Filter.Operators.UNION + '" {operator:this.selectUnion}>Subjects related to any (OR)</option>',
                                    '</select>',
                                '</tpl>',
                                '<tpl if="members.length &gt; 5">',
                                    '<div class="fader"><img class="ellipse"></div>',
                                '</tpl>',
                            '</tpl>',
                        '</tpl>',
                    '</div>',
                '</tpl>',
            '</tpl>',
            {
                isGrid : function(values) {
                    var isPlot = values.hasOwnProperty('isPlot') ? values.isPlot : false;
                    var isGrid = values.hasOwnProperty('isGrid') ? values.isGrid : false;
                    return isGrid && !isPlot;
                },
                isPlot : function(values) {
                    var isPlot = values.hasOwnProperty('isPlot') ? values.isPlot : false;
                    var isGrid = values.hasOwnProperty('isGrid') ? values.isGrid : false;
                    return isPlot && !isGrid;
                },
                isPlotSelection : function(values) {
                    var isPlot = values.hasOwnProperty('isPlot') ? values.isPlot : false;
                    var isGrid = values.hasOwnProperty('isGrid') ? values.isGrid : false;
                    return isPlot && isGrid;
                },
                selectIntersect : function(op) {
                    var markup = op.indexOf('AND') > -1 ? 'selected="selected"' : '';
                    if (op.indexOf('REQ_OR') > -1) { markup += ' disabled'; }
                    return markup;
                },
                selectUnion : function(op) {
                    var markup = op.indexOf('OR') > -1 ? 'selected="selected"' : '';
                    if (op.indexOf('REQ_AND') > -1) { markup += ' disabled'; }
                    return markup;
                },
                renderType : function(values) {
                    var lvl = values.level;
                    var label = '';
                    Connector.getState().onMDXReady(function(mdx) {
                        var level = mdx.getLevel(lvl);
                        if (level) {
                            label = level.hierarchy.dimension.friendlyName;

                            // friendlyName was not overridden so compose label with lvl info
                            if (label === level.hierarchy.dimension.singularName) {
                                if (Ext.isDefined(level.countSingular)) {
                                    // escape redundant dim/lvl naming (e.g. Study (Study))
                                    if (level.countSingular.toLowerCase() !== label.toLowerCase()) {
                                        label += ' (' + level.countSingular + ')';
                                    }
                                }
                                else {
                                    label += ' (' + level.name + ')';
                                }
                            }
                        }
                    });

                    label = '<span class="sel-label">' + Ext.htmlEncode(label) + '</span>';
                    if (!values.isSelection) {

                        // render filter with a single member on one line
                        if (values.members.length == 1) {
                            label += ': ' + Ext.htmlEncode(this.renderUniqueName(values.members[0].uniqueName));
                        }
                    }

                    return label;
                },
                renderUniqueName : function(uniqueName) {
                    var arrayName = LABKEY.app.view.Selection.uniqueNameAsArray(uniqueName);
                    var member = arrayName[arrayName.length-1];
                    if (member == '#null') {
                        member = 'Unknown';
                    }
                    return Ext.htmlEncode(member);
                },
                renderMeasures : function(values) {
                    var measures = values.plotMeasures, measureLabels = [];
                    for (var i=0; i < measures.length; i++) {
                        if (measures[i]) {
                            measureLabels.push(measures[i].measure.label);
                        }
                    }
                    return '<span class="sel-label">In the plot:</span> ' + Ext.htmlEncode(measureLabels.join(', '));
                },
                renderGridFilterLabel : function(values) {
                    var type = LABKEY.app.model.Filter.getGridHierarchy(values);

                    if (values.gridFilter && values.gridFilter.length > 0) {
                        // 21881: since this is presumed to be a grid filter then all
                        // the applied filters should be the same measure/column
                        var gf = values.gridFilter[0];

                        // the query service can lookup a measure, but only the base of a lookup
                        if (gf.getColumnName().indexOf('/') == -1) {
                            var measure = Connector.getService('Query').getMeasure(gf.getColumnName());
                            if (Ext.isDefined(measure) && Ext.isString(measure.label)) {
                                type = measure.label;
                            }
                        }
                    }

                    return Ext.htmlEncode(type + ": " + LABKEY.app.model.Filter.getGridLabel(values));
                },
                renderSelectionMeasure : function(measure, filters, id, idx) {
                    var domString = '', filterValString = '', sep = '';

                    if (measure && filters && filters.length > 0) {

                        Ext.each(filters, function(filter) {
                            var val = filter.getValue();
                            var fil = LABKEY.app.model.Filter.getShortFilter(filter.getFilterType().getDisplayText());

                            if (filter.getFilterType().getURLSuffix() === 'dategte') {
                                var d = new Date(val);
                                var year = (d.getFullYear()%1000);
                                year = year.toString().length == 1 ? "0" + year : year;
                                val = (d.getMonth()+1) + "/" + d.getDate() + "/" + year;
                            }

                            filterValString += sep + fil + ' ' + val;
                            sep = ', ';
                        });

                        domString =
                                '<div class="status-over memberitem plot-selection">' +
                                    '<div class="closeitem measure" data-id="' + id + '" member-index="' + idx + '"></div>' +
                                    measure.measure.label + ': ' + filterValString +
                                '</div>';
                    }

                    return domString;
                },
                renderPlotSelection: function(values) {
                    var measures = values.plotMeasures,
                        filters = values.gridFilter,
                        xMeasure = measures[0],
                        yMeasure = measures[1],
                        xFilters = [],
                        yFilters = [],
                        domString;

                    // split measures into x/y based on column name
                    Ext.each(filters, function(filter) {
                        if (filter) {
                            if (xMeasure && filter.getColumnName() == xMeasure.measure.alias) {
                                xFilters.push(filter);
                            }

                            if (yMeasure && filter.getColumnName() == yMeasure.measure.alias) {
                                yFilters.push(filter);
                            }
                        }
                    });

                    domString = this.renderSelectionMeasure(xMeasure, xFilters, values.id, 0);
                    domString = domString + this.renderSelectionMeasure(yMeasure, yFilters, values.id, 1);

                    return domString;
                }
            }
    )
});