/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Selection', {

    extend: 'LABKEY.app.view.Selection',

    alias: 'widget.selectionview',

    itemSelector: 'div.filter-item',

    cls: 'activefilter',

    loadMask: false,

    tpl: new Ext.XTemplate(
            '<tpl for=".">',
                '<tpl if="this.isPlotSelection(values) === true || this.isTime(values) === true">',
                    // Plot Selection Filter
                    '<div class="filter-item">',
                        '<div class="selitem">{[this.renderPlotSelection(values)]}</div>',
                    '</div>',
                    '<span class="closeitem" data-id="{id}" member-index="0">',
                        '<img src="' + LABKEY.contextPath + '/Connector/images/icon_general_clearsearch_normal.svg">',
                    '</span>',
                '<tpl elseif="this.isGrid(values) === true || this.isAggregated(values) === true">',
                    // Grid Filter
                    '<div class="filter-item">',
                        '<div class="selitem status-over memberloc">',
                            '<tpl if="this.isAggregated(values) === true">',
                                '<span class="sel-label">Aggregated:</span> ',
                            '</tpl>',
                            '{[this.renderGridFilterLabel(values)]}',
                        '</div>',
                    '</div>',
                    '<span class="closeitem" data-id="{id}" member-index="0">',
                        '<img src="' + LABKEY.contextPath + '/Connector/images/icon_general_clearsearch_normal.svg">',
                    '</span>',
                '<tpl elseif="this.isPlot(values) === true">',
                    // "In the plot" Filter
                    '<div class="filter-item">',
                        '<div class="selitem status-over memberloc">',
                            '<span class="sel-label">In the plot:</span> ',
                            '{[this.renderInThePlot(values)]}',
                        '</div>',
                    '</div>',
                    '<span class="closeitem" data-id="{id}"  member-index="0">',
                        '<img src="' + LABKEY.contextPath + '/Connector/images/icon_general_clearsearch_normal.svg">',
                    '</span>',
                '<tpl elseif="this.isPlot(values) === false && this.isGrid(values) === false && this.isPlotSelection(values) === false">',
                    // Normal Filter (and Group Filters)
                    '<div class="filter-item">',
                        '<tpl if="members.length &gt; 0">',
                            '<div class="selitem">{[this.renderType(values)]}</div>',
                            '<div class="sel-list-item memberloc">{members:this.renderMembers}</div>',
                            '<tpl if="members.length &gt; 1">',
                                '<select>',
                                    '<option value="' + LABKEY.app.model.Filter.Operators.INTERSECT + '" {operator:this.selectIntersect}>Subjects related to all (AND)</option>',
                                    '<option value="' + LABKEY.app.model.Filter.Operators.UNION + '" {operator:this.selectUnion}>Subjects related to any (OR)</option>',
                                '</select>',
                            '</tpl>',
                        '</tpl>',
                    '</div>',
                    '<span class="closeitem" data-id="{id}">',
                        '<img src="' + LABKEY.contextPath + '/Connector/images/icon_general_clearsearch_normal.svg">',
                    '</span>',
                '</tpl>',
            '</tpl>',
            {
                _plotGridCheck: function(values) {
                    var isPlot = values.hasOwnProperty('isPlot') ? values.isPlot : false;
                    var isGrid = values.hasOwnProperty('isGrid') ? values.isGrid : false;
                    return { isGrid: isGrid, isPlot: isPlot };
                },
                isAggregated : function(values) {
                    return values.hasOwnProperty('isAggregated') ? values.isAggregated : false;
                },
                isGrid : function(values) {
                    var check = this._plotGridCheck(values);
                    return check.isGrid && !check.isPlot;
                },
                isPlot : function(values) {
                    var check = this._plotGridCheck(values);
                    return check.isPlot && !check.isGrid;
                },
                isPlotSelection : function(values) {
                    var check = this._plotGridCheck(values);
                    return check.isPlot && check.isGrid;
                },
                isTime : function(values) {
                    return values.hasOwnProperty('isTime') ? values.isTime : false;
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

                    return '<span class="sel-label">' + Ext.htmlEncode(label) + '</span>';
                },
                renderMembers : function(members) {
                    var content = '',
                        sep = '';
                    for (var i=0; i < members.length && i < 10; i++) {
                        content += sep + this.renderUniqueName(members[i].uniqueName);
                        sep = ', ';
                    }
                    return content;
                },
                renderUniqueName : function(uniqueName) {
                    var arrayName = LABKEY.app.view.Selection.uniqueNameAsArray(uniqueName);
                    var member = arrayName[arrayName.length-1];
                    if (member == '#null') {
                        member = 'Unknown';
                    }
                    return Ext.htmlEncode(member);
                },
                renderInThePlot : function(values) {
                    var measures = values.plotMeasures, measureLabels = [];
                    for (var i=0; i < measures.length; i++) {
                        if (measures[i]) {
                            measureLabels.push(measures[i].measure.label);
                        }
                    }
                    return Ext.htmlEncode(measureLabels.join(', '));
                },
                renderGridFilterLabel : function(values) {
                    var type = LABKEY.app.model.Filter.emptyLabelText;

                    Ext.each(values.gridFilter, function(gf) {
                        if (gf && gf != '_null') {
                            // 21881: since this is presumed to be a grid filter then all
                            // the applied filters should be the same measure/column
                            var measure = Connector.getQueryService().getMeasure(gf.getColumnName());
                            if (measure && Ext.isString(measure.label)) {
                                type = measure.label;
                            }
                            else {
                                type = LABKEY.app.model.Filter.getGridFilterLabel(gf);
                            }

                            return false;
                        }
                    });

                    return Ext.htmlEncode(type) + ': ' + LABKEY.app.model.Filter.getGridLabel(values);
                },
                renderSelectionMeasure : function(measure, filters, isTime)
                {
                    var domString = '', filterValString = '', sep = '';

                    if (measure && !Ext.isEmpty(filters))
                    {
                        Ext.each(filters, function(filter)
                        {
                            var val = filter.getValue(),
                                type = filter.getFilterType(),
                                fil = LABKEY.app.model.Filter.getShortFilter(type.getDisplayText());

                            if (type.getURLSuffix() === 'dategte' || type.getURLSuffix() === 'datelte')
                            {
                                val = ChartUtils.tickFormat.date(val);
                            }
                            else if (filter.getFilterType() == LABKEY.Filter.Types.EQUALS_ONE_OF)
                            {
                                val = Connector.model.Filter.getFilterValuesAsArray(filter).join(';');
                            }

                            filterValString += sep + fil + ' ' + val;
                            sep = ', ';
                        });

                        domString = '<div class="status-over">' + Ext.String.ellipsis(measure.measure.label, 17, true);

                        if (isTime && measure.dateOptions && measure.dateOptions.zeroDayVisitTag != null) {
                            domString += ' relative to<br/>' + measure.dateOptions.zeroDayVisitTag.toLowerCase();
                        }

                        domString += ': ' + filterValString + '</div>';
                    }

                    return domString;
                },
                renderPlotSelection: function(values)
                {
                    var measures = values.plotMeasures,
                        filters = values.gridFilter,
                        altFilterDisplayString = values.filterDisplayString,
                        filter,
                        xMeasure = measures[0],
                        yMeasure = measures[1],
                        xIsTime = false,
                        xFilters = [],
                        yFilters = [],
                        domString, i=0;

                    if (values.isTime)
                    {
                        i = 2;
                        xIsTime = true;
                        xMeasure = values.timeMeasure;
                        xFilters = xFilters.concat(values.timeFilters);
                    }

                    // split measures into x/y based on column name
                    for (; i < filters.length; i++)
                    {
                        filter = filters[i];
                        if (filter)
                        {
                            if (i < 2) // [x1, x2, y1, y2]
                            {
                                if (xMeasure && filter.getColumnName() == xMeasure.measure.alias)
                                {
                                    xFilters.push(filter);
                                }
                            }
                            else
                            {
                                if (yMeasure && filter.getColumnName() == yMeasure.measure.alias)
                                {
                                    yFilters.push(filter);
                                }
                            }
                        }
                    }

                    if (Ext.isString(altFilterDisplayString))
                    {
                        domString = altFilterDisplayString;
                    }
                    else
                    {
                        domString = this.renderSelectionMeasure(xMeasure, xFilters, xIsTime);
                        domString += this.renderSelectionMeasure(yMeasure, yFilters);
                    }

                    return domString;
                }
            }
    )
});