/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
// This is a singleton for charting utilities
Ext.define('Connector.utility.PlotTooltip', {

    alternateClassName: ['PlotTooltipUtils'],

    singleton: true,

    buildPointTooltip: function(plot, data, studyShortName) {
        var content = '', colon = ': ', linebreak = '<br/>';
        var record = plot.allDataRowsMap[data.rowKey], xAxis = plot.activeMeasures.x, yAxis = plot.activeMeasures.y;

        if (record[QueryUtils.STUDY_ALIAS]) {
            content += '<span class="group-title">' + Ext.htmlEncode(record[QueryUtils.STUDY_ALIAS]) + '</span>';
            content +=  colon + Ext.htmlEncode(studyShortName);
            content += '<div class="axis-details">';
            content += 'Treatment Summary' + colon + record[QueryUtils.TREATMENTSUMMARY_ALIAS] + linebreak;
            content += 'Subject' + colon + data.subjectId + linebreak;
            if (xAxis && xAxis.name == 'ProtocolDay') {
                // Issue 29379: use alignment measure label for hover description
                var xMeasureAlias = QueryUtils.ensureAlignmentAlias(plot._getAxisWrappedMeasure(xAxis));
                label = Connector.getQueryService().getMeasure(xMeasureAlias).label;

                content += label + colon + ' '
                        + (data.x > 0 && xAxis.options.alignmentVisitTag != null ? '+' : '') + data.x
                        + linebreak;
            }
            else {
                content += 'Study Day' + colon + 'Day ' + record[QueryUtils.PROTOCOLDAY_ALIAS] + linebreak;
            }
            content += '</div>';
        }

        if (xAxis && data.xname) {
            // skip for study, treatment, and time
            if (xAxis.alias != QueryUtils.DEMOGRAPHICS_STUDY_LABEL_ALIAS && xAxis.alias != QueryUtils.DEMOGRAPHICS_STUDY_ARM_ALIAS && xAxis.name != 'ProtocolDay') {
                var val = Ext.typeOf(data.x) == 'date' ? ChartUtils.tickFormat.date(data.x) : data.x;
                content += '<span class="group-title">' + Ext.htmlEncode(this.getSourceDisplayValue(xAxis) + ' - ' + data.xname) + '</span>' + colon + this.formatSingleTooltipValue(val);
                content += plot.showAsMedian ? ' (median)' : '';
                content += this.buildPointAxisDetailTooltip(plot, xAxis, record, record.x && record.x.rawRecord ? record.x.rawRecord : null, this.getHierarchicalDimensionInfo(xAxis));
            }
        }

        if (yAxis) {
            content += '<span class="group-title">' + Ext.htmlEncode(this.getSourceDisplayValue(yAxis) + ' - ' + data.yname) + '</span>' + colon + this.formatSingleTooltipValue(data.y);
            content += plot.showAsMedian ? ' (median)' : '';
            content += this.buildPointAxisDetailTooltip(plot, yAxis, record, record.y && record.y.rawRecord ? record.y.rawRecord : null, this.getHierarchicalDimensionInfo(yAxis));
        }

        if (plot.activeMeasures.color && data.colorname) {
            content += '<span class="group-title">' + Ext.htmlEncode(this.getSourceDisplayValue(this.activeMeasures.color) + ' - ' + data.colorname) + '</span>' + colon + this.formatSingleTooltipValue(data.color);
        }

        return content;
    },

    formatSingleTooltipValue: function(val) {
        if (val == undefined || val == 'null') {
            return '-';
        }
        return val;
    },

    getSourceDisplayValue: function(measure) {
        var definedMeasureSourceMap = Connector.getService('Query').getDefinedMeasuresSourceTitleMap();
        if (Ext.isDefined(definedMeasureSourceMap[measure.alias])) {
            return definedMeasureSourceMap[measure.alias];
        }
        else if (measure.variableType == 'TIME') {
            return measure.sourceTitle;
        }
        return measure.queryName;
    },

    buildPointAxisDetailTooltip: function(plot, axis, record, aggregators, hierarchicalDimensionInfo) {
        var content = '<div class="axis-details">', colon = ': ', linebreak = '<br/>';
        if (axis) {
            var dimensions = axis.options.dimensions;
            for (var dim in dimensions) {
                if (dimensions.hasOwnProperty(dim)) {
                    var values = [];
                    if (plot.hasDimensionalAggregators) {
                        var aggregatorValues = aggregators[dim] ? Ext.clone(aggregators[dim].getValues()) : null;
                        if (Ext.isArray(aggregatorValues) && aggregatorValues.length > 0) {
                            values = aggregatorValues;
                        }
                    }
                    else {
                        if (record[dim] !== undefined) {
                            values.push(record[dim]);
                        }
                        else if (Ext.isArray(dimensions[dim])) {
                            values = dimensions[dim];
                        }
                    }
                    if (values.length > 0) {
                        if (hierarchicalDimensionInfo[dim]) {
                            var levelDimensions = hierarchicalDimensionInfo[dim];
                            var dimensionVals = {};
                            Ext.each(values, function(fullStr){
                                var levels = fullStr.split(ChartUtils.ANTIGEN_LEVEL_DELIMITER);
                                for (var i = 0; i < levels.length; i++) {
                                    if (!dimensionVals[levelDimensions[i]]) {
                                        dimensionVals[levelDimensions[i]] = {};
                                    }
                                    dimensionVals[levelDimensions[i]][levels[i]] = true;
                                }
                            });

                            for (var level in dimensionVals) {
                                if (dimensionVals[level]) {
                                    var levelValues = Object.keys(dimensionVals[level]);
                                    if (levelValues && levelValues.length > 0)
                                        content += this.buildSingleDimensionTooltip(level, levelValues);
                                }
                            }
                        }
                        else {
                            content += this.buildSingleDimensionTooltip(dim, values);
                        }
                    }
                }
            }
        }
        content += '</div>';
        return content;
    },

    buildSingleDimensionTooltip: function(dim, values) {
        var colon = ': ', linebreak = '<br/>';
        var value = this.buildTooltipValuesStr(values);
        var label = Connector.getQueryService().getMeasure(dim).label;
        return '<span><span class="axis-dimension">' + Ext.htmlEncode(label) + '</span>' + colon + value + linebreak + '</span>';
    },

    buildTooltipValuesStr: function(rawValuesArray) {
        var valuesArray = [];
        if (Ext.isArray(rawValuesArray)) {
            if (rawValuesArray.length == 0)
                return '-';
            Ext.each(rawValuesArray, function(val) {
                valuesArray.push(this.formatSingleTooltipValue(val));
            }, this);
        }
        var valuesStr = '';
        if (Ext.isArray(valuesArray)) {
            var totalValues = valuesArray.length;
            if (totalValues > 5) {
                valuesStr = valuesArray.slice(0, 5).join(', ');
                valuesStr += ', and ' + (totalValues - 5) + ' more'
            }
            else {
                valuesStr = valuesArray.join(', ');
            }
        }
        return valuesStr;
    },

    buildBinTooltip: function(plot, datas) {
        var xValsSet = {}, yValsSet = {}, subjectsSet = {}, studiesSet = {};
        var content = '', xName, yName, colon = ': ', linebreak = '<br/>';
        var xDimensionVals = {}, yDimensionVals = {};
        var xDimensions = plot.getAxisDimensionsArray(plot.activeMeasures.x), yDimensions = plot.getAxisDimensionsArray(plot.activeMeasures.y);
        var xOptions = plot.activeMeasures.x ? plot.activeMeasures.x.options.dimensions : [],
                yOptions = plot.activeMeasures.y ? plot.activeMeasures.y.options.dimensions : [];
        var xHierarchicalDimensionInfo = this.getHierarchicalDimensionInfo(plot.activeMeasures.x), yHierarchicalDimensionInfo = this.getHierarchicalDimensionInfo(plot.activeMeasures.y);

        Ext.each(datas, function(data) {
            var d = data.data;

            if (d.x !== undefined && d.x !== null && d.x !== '') {
                xValsSet[d.x] = true;
            }
            if (d.y !== undefined && d.y !== null && d.y !== '') {
                yValsSet[d.y] = true;
            }
            if (d.subjectId !== undefined && d.subjectId !== null) {
                subjectsSet[d.subjectId] = true;
            }

            if (d.xname && !xName) {
                xName = d.xname;
            }
            if (d.yname && !yName) {
                yName = d.yname;
            }

            var record = plot.allDataRowsMap[d.rowKey];
            studiesSet[record[QueryUtils.STUDY_ALIAS]] = true;

            this.setBinDimensionValues(plot, xDimensionVals, xDimensions, record, xOptions, record.x ? record.x.rawRecord : null);
            this.setBinDimensionValues(plot, yDimensionVals, yDimensions, record, yOptions, record.y ? record.y.rawRecord : null);

        }, this);

        var xVals = Object.keys(xValsSet), yVals = Object.keys(yValsSet), subjects = Object.keys(subjectsSet), studies = Object.keys(studiesSet);

        this.updateBinHierarchicalDimensionValues(xDimensionVals, xHierarchicalDimensionInfo);
        this.updateBinHierarchicalDimensionValues(yDimensionVals, yHierarchicalDimensionInfo);

        var studyName;
        if (studies.length == 1) {
            studyName = studies[0];
        }

        content += '<span class="group-title">Data</span>';
        content += colon + datas.length + ' points from ' + subjects.length + ' subjects' + linebreak;
        if (studyName) {
            content += '<span class="group-title">Study</span>';
            content += colon + Ext.htmlEncode(studyName) + linebreak;
        }
        if (xName && plot.activeMeasures.x) {
            // Issue 29379: use alignment measure label for hover description
            if (plot.activeMeasures.x.name == 'ProtocolDay') {
                var xMeasureAlias = QueryUtils.ensureAlignmentAlias(plot._getAxisWrappedMeasure(plot.activeMeasures.x));
                xName = Connector.getQueryService().getMeasure(xMeasureAlias).label;
            }

            content += '<span class="group-title">' +Ext.htmlEncode(this.getSourceDisplayValue(plot.activeMeasures.x) + ' - ' + xName) + '</span>';
            content += colon + Ext.htmlEncode(this.getBinRangeTooltip(xVals));
            content += plot.showAsMedian ? ' (median)' : '';
            content += '<div class="axis-details">';
            content += this.buildBinAxisDetailTooltip(xDimensionVals, xDimensions, xHierarchicalDimensionInfo);
            content += '</div>'
        }
        if (yName && plot.activeMeasures.y) {
            content += '<span class="group-title">' + Ext.htmlEncode(this.getSourceDisplayValue(plot.activeMeasures.y) + ' - ' + yName) + '</span>';
            content += colon + Ext.htmlEncode(this.getBinRangeTooltip(yVals));
            content += plot.showAsMedian ? ' (median)' : '';
            content += '<div class="axis-details">';
            content += this.buildBinAxisDetailTooltip(yDimensionVals, yDimensions, yHierarchicalDimensionInfo);
            content += '</div>'
        }

        return content;
    },

    getHierarchicalDimensionInfo: function(axis) {
        var measureMaps;
        if (axis) {
            var dimensions = axis.dimensions;
            Ext.each(dimensions, function(dim) {
                var _dim = Connector.getService('Query').getMeasureRecordByAlias(dim);
                if (_dim) {
                    var hierarchicalFilterColumnAlias = _dim.get('hierarchicalFilterColumnAlias');
                    if (hierarchicalFilterColumnAlias != dim && Ext.isDefined(_dim.get('hierarchicalSelectionParent'))) {
                        var measureSet = _dim.getHierarchicalMeasures();
                        if (!measureMaps) {
                            measureMaps = {};
                        }
                        var measures = [];
                        Ext.each(measureSet, function(m){
                            measures.push(m.get('alias'));
                        });
                        measureMaps[hierarchicalFilterColumnAlias] = measures;
                    }
                }
            });
        }
        return measureMaps;
    },

    setBinDimensionValues: function(plot, dimensionVals, dimensions, record, axisOptions, recordAggregator) {
        Ext.each(dimensions, function(dim) {
            var aggregatorValues = recordAggregator && recordAggregator[dim] ? Ext.clone(recordAggregator[dim].getValues()) : null;

            if (!dimensionVals[dim]) {
                dimensionVals[dim] = {};
            }

            if (plot.hasDimensionalAggregators) {
                if (aggregatorValues && Ext.isArray(aggregatorValues) && aggregatorValues.length > 0) {
                    Ext.each(aggregatorValues, function(val){
                        dimensionVals[dim][val] = true;
                    });
                }
            }
            else {
                if (record[dim] !== undefined && record[dim] !== null && record[dim] !== '')  {
                    dimensionVals[dim][record[dim]] = true;
                }
                else if (Ext.isArray(axisOptions[dim])){
                    Ext.each(axisOptions[dim], function(val){
                        dimensionVals[dim][val] = true;
                    });
                }
            }
        }, this);
    },

    updateBinHierarchicalDimensionValues: function(dimensionVals, hierarchicalDimensionInfo) {
        if (dimensionVals && hierarchicalDimensionInfo) {
            for (var dim in dimensionVals) {
                if (dimensionVals[dim] && hierarchicalDimensionInfo[dim]) {
                    var currentDimVals = Object.keys(dimensionVals[dim]);
                    if (currentDimVals.length != 0) {
                        var levelDimensions = hierarchicalDimensionInfo[dim];
                        Ext.each(currentDimVals, function(fullStr){
                            var levels = fullStr.split(ChartUtils.ANTIGEN_LEVEL_DELIMITER);
                            for (var i = 0; i < levels.length; i++) {
                                if (!dimensionVals[levelDimensions[i]]) {
                                    dimensionVals[levelDimensions[i]] = {};
                                }
                                dimensionVals[levelDimensions[i]][levels[i]] = true;
                            }
                        });
                    }

                }
            }
        }
    },

    getBinRangeTooltip: function(rawvalues) {
        if (rawvalues.length == 0)
            return '-';
        var vals = [];
        Ext.each(rawvalues, function(val) {
            vals.push(this.formatSingleTooltipValue(val));
        }, this);
        if (vals.length == 1)
            return vals[0];
        return Ext.Array.min(vals) + ' - ' + Ext.Array.max(vals);
    },

    buildBinAxisDetailTooltip: function(dimensionVals, dimensions, hierarchicalDimensionInfo) {
        var content = '';
        if (dimensionVals) {
            Ext.each(dimensions, function(dim) {
                if (dimensionVals[dim]) {
                    var dimVals = Object.keys(dimensionVals[dim]);
                    if (dimVals.length > 0) {
                        if (Ext.isArray(hierarchicalDimensionInfo[dim]) && hierarchicalDimensionInfo[dim].length > 0) {
                            Ext.each(hierarchicalDimensionInfo[dim], function(level) {
                                if (dimensionVals[level]) {
                                    var levelVals = Object.keys(dimensionVals[level]);
                                    if (levelVals && levelVals.length > 0)
                                        content += this.buildSingleDimensionTooltip(level, levelVals);
                                }
                            }, this);
                        }
                        else {
                            content += this.buildSingleDimensionTooltip(dim, dimVals);
                        }
                    }
                }
            }, this);
        }
        return content;
    },




});