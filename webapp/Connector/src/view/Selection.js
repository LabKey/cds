/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Selection', {

    extend: 'LABKEY.app.view.Selection',

    alias: 'widget.selectionview',

    itemSelector: 'div.wrapitem',

    tpl: new Ext.XTemplate(
            '<tpl for=".">',
                '<tpl if="this.isPlotSelection(values) === true">',
                    // Plot Selection Filter
                    '<div class="wrapitem">',
                        '<div class="circle"></div>',
                        '<div class="selitem sel-listing">Subjects with:</div>',
                        '{[this.renderPlotSelection(values)]}',
                    '</div>',
                '</tpl>',
                '<tpl if="this.isGrid(values) === true">',
                    // Grid Filter
                    '<div class="wrapitem">',
                        '<div class="circle"></div>',
                        '<div class="selitem status-over memberitem">',
                            '<div class="closeitem" data-id="{id}" member-index="0"></div>',
                            '{[this.renderLabel(values)]}',
                        '</div>',
                    '</div>',
                '</tpl>',
                '<tpl if="this.isPlot(values) === true">',
                    // Plot Filter
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
                        '<tpl if="members.length &gt; 1">',
                            '<div class="closeitem wholeitem" data-id="{id}"></div>',
                            '<tpl if="this.isRequiredOperator(values) === true">',
                                '<div class="opselect" style="padding: 2px 6px;">{operator:this.getOperatorLabel}</div>',
                            '<tpl else>',
                                '<div class="opselect">',
                                    '<select>',
                                        '<option value="' + LABKEY.app.model.Filter.Operators.INTERSECT + '" {operator:this.selectIntersect}>AND</option>',
                                        '<option value="' + LABKEY.app.model.Filter.Operators.UNION + '" {operator:this.selectUnion}>OR</option>',
                                    '</select>',
                                '</div>',
                            '</tpl>',
                            '<div class="selitem sel-listing">{[this.renderType(values.members[0])]}</div>',
                            '<tpl for="members">',
                                '<div class="status-over memberitem collapsed-member">',
                                    '{uniqueName:this.renderUniqueName}',
                                '</div>',
                            '</tpl>',
                        '</tpl>',
                        '<tpl if="members.length === 1">',
                            '<div class="selitem status-over memberitem" title="{members:this.renderMember}">',
                                '<div class="closeitem" data-id="{id}"></div>',
                                '{members:this.renderMember}',
                            '</div>',
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
                isGroup : function(values) {
                    return (Ext.isArray(values.filters) ? true : false);
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
                isRequiredOperator : function(values) {
                    return Ext.isDefined(values.operator) && values.operator.indexOf('REQ_') > -1;
                },
                getOperatorLabel : function(op) {
                    return op.indexOf('AND') > -1 ? 'AND' : 'OR';
                },
                selectIntersect : function(op) {
                    return op.indexOf('AND') > -1 ? 'selected="selected"' : '';
                },
                selectUnion : function(op) {
                    return op.indexOf('OR') > -1 ? 'selected="selected"' : '';
                },
                renderType : function(member) {
                    var u = LABKEY.app.view.Selection.uniqueNameAsArray(member['uniqueName']);
                    var area = u[0], type = '';

                    // Determine if zero level
                    if (area.indexOf('.') == -1) {
                        type = area;
                    }
                    else {
                        var areas = area.split('.');
                        type = areas[0];
                        if (u.length <= 2) {
                            type += ' (' + areas[1] + ')';
                        }
                    }

                    return Ext.htmlEncode(type);
                },
                renderUniqueName : function(uniqueName) {
                    var arrayName = LABKEY.app.view.Selection.uniqueNameAsArray(uniqueName);
                    var member = arrayName[arrayName.length-1];
                    if (member == '#null') {
                        member = 'Unknown';
                    }
                    return Ext.htmlEncode(member);
                },
                /**
                 * Example of zero-level:
                 * ["Study", "Not Actually CHAVI 001"]
                 *
                 * Example of single-level:
                 * ["Assay.Methodology", "ICS"]
                 *
                 * Example of multi-level:
                 * ["Assay.Methodology", "NAb", "NAb-Sample-LabKey"]
                 */
                renderMember : function(members) {
                    var member = '', area = '';
                    var levels = LABKEY.app.view.Selection.uniqueNameAsArray(members[0]['uniqueName']);

                    // Determine if zero level
                    if (levels[0].indexOf('.') == -1) {
                        area = levels[0];
                        member = levels[1];
                    }
                    else {
                        var areas = levels[0].split('.');

                        // multi-level
                        if (levels.length > 2) {
                            area = areas[0];
                        }
                        else {
                            // single level
                            area = areas[0] + ' (' + areas[1] + ')';
                        }

                        member = levels[levels.length-1];
                    }

                    if (member == '#null') {
                        member = 'Unknown';
                    }

                    return Ext.htmlEncode(area + ': ' + member);
                },
                renderMeasures : function(values) {
                    var label = 'In the plot: ';
                    var measures = values.plotMeasures, measureLabels = [];
                    for (var i=0; i < measures.length; i++) {
                        if (measures[i]) {
                            measureLabels.push(measures[i].measure.label);
                        }
                    }
                    return Ext.htmlEncode(label + measureLabels.join(', '));
                },
                renderLabel : function(values) {
                    var type = LABKEY.app.model.Filter.getGridHierarchy(values);
                    return Ext.htmlEncode(type + ": " + LABKEY.app.model.Filter.getGridLabel(values));
                },
                renderSelectionMeasure : function(measure, filters, id, idx) {
                    if (measure && filters && filters[0] && filters[1]) {
                        var minVal = filters[0].getValue(),
                            maxVal = filters[1].getValue();

                        if (filters[0].getFilterType().getURLSuffix() === 'dategte') {
                            minVal = new Date(minVal).toLocaleDateString();
                            maxVal = new Date(maxVal).toLocaleDateString();
                        }

                        var domString =
                                '<div class="status-over memberitem plot-selection">' +
                                    '<div class="closeitem measure" data-id="' + id + '" member-index="' + idx + '"></div>' +
                                        measure.measure.label +
                                        ': &gt;= ' + minVal +
                                        ', &lt;= ' + maxVal +
                                '</div>';
                        return domString;
                    } else {
                        return '';
                    }
                },
                renderPlotSelection: function(values) {
                    var measures = values.plotMeasures,
                        filters = values.gridFilter, // TODO: rename to sqlFilters
                        xMeasure = measures[0],
                        yMeasure = measures[1],
                        xFilters = filters.slice(0, 2),
                        yFilters = filters.slice(2),
                        domString;

                    domString = this.renderSelectionMeasure(xMeasure, xFilters, values.id, 0);
                    domString = domString + this.renderSelectionMeasure(yMeasure, yFilters, values.id, 1);

                    return domString;
                }
            }
    )
});