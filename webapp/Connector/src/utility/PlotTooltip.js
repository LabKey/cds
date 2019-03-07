/*
 * Copyright (c) 2017-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
// This is a singleton for charting utilities
Ext.define('Connector.utility.PlotTooltip', {

    alternateClassName: ['PlotTooltipUtils'],

    singleton: true,

    TIME_LABEL_FIELD_SUFFIX : 'study_PKMAb_visit_time_label',

    loadBinTooltipData: function(plot, point, datas, plotName)
    {
        var rawRows = this.getRawDataRows(plot, datas);
        var visitLabels = Ext.Array.unique(Ext.Array.pluck(rawRows, PlotTooltipUtils.TIME_LABEL_FIELD_SUFFIX));
        var participantSeqContainerMap = {};
        Ext.each(rawRows, function(row){
            var participantSeq = row[QueryUtils.SUBJECT_SEQNUM_ALIAS];
            participantSeqContainerMap[participantSeq] = row[QueryUtils.CONTAINER_ALIAS];
        });
        var participantSeqs = Ext.Object.getKeys(participantSeqContainerMap);

        // in the case when a bin contains > 200 participant, skip querying studies for better perf
        if (participantSeqs.length < 200)
        {
            LABKEY.Query.selectRows({
                schemaName: 'cds',
                queryName: 'gridbase',
                method: 'POST',
                filterArray: [
                    LABKEY.Filter.create('ParticipantSequenceNum', participantSeqs.join(';'), LABKEY.Filter.Types.IN)
                ],
                success: function (results) {
                    var records = results.rows, filteredRecords = [];
                    Ext.each(records, function(record){
                        if (participantSeqContainerMap[record.ParticipantSequenceNum] == record.Container)
                            filteredRecords.push(record);
                    });
                    var plotData = {
                        visitLabels : visitLabels
                        //rows: filteredRecords // if in the futher more info is needed for binned tooltip, pass in gridbase records
                    };
                    plotData.studyLabels = Ext.Array.unique(Ext.Array.pluck(filteredRecords, 'Study'));
                    this.showBinTooltip(plot, point, datas, plotName, plotData);
                },
                scope: this
            });
        }
        else
        {
            this.showBinTooltip(plot, point, datas, plotName, {studyLabels: []});
        }
    },

    showBinTooltip: function(plot, point, datas, plotName, plotData)
    {
        var content = this.buildBinTooltip(plot, datas, plotData);
        ChartUtils.showDataTooltipCallout(content, point, 'hidetooltipmsg', plotName===plot.yGutterName, plotName===plot.xGutterName, plot);

    },

    getRawDataRows: function(plot, datas)
    {
        var rawRecords = [];
        Ext.each(datas, function(data) {
            var d = data.data;
            rawRecords.push(plot.allDataRowsMap[d.rowKey]);
        }, this);
        return rawRecords;
    },

    loadPointTooltipData: function(plot, point, data, plotName)
    {
        var rawRow = plot.allDataRowsMap[data.rowKey];
        var participantSeq = rawRow[QueryUtils.SUBJECT_SEQNUM_ALIAS];
        var container = rawRow[QueryUtils.CONTAINER_ALIAS];
        var timeLabel = rawRow[PlotTooltipUtils.TIME_LABEL_FIELD_SUFFIX];
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'gridbase',
            filterArray: [
                LABKEY.Filter.create('ParticipantSequenceNum', participantSeq),
                LABKEY.Filter.create('Container', container)
            ],
            success: function (results) {
                var plotData = results.rows[0];
                plotData.timeLabel = timeLabel;
                var studyLabel = plotData.Study;
                if (plot.studyMap)
                {
                    plotData.StudyShortName = plot.studyMap[studyLabel];
                    this.showPointTooltip(plot, point, data, plotName, plotData);
                }
                else
                {
                    LABKEY.Query.selectRows({
                        schemaName: 'cds',
                        queryName: 'study',
                        success: function (studyData) {
                            var studyRows = studyData.rows;
                            var studyMap = {};
                            Ext.each(studyRows, function (row) {
                                studyMap[row.label] = row.short_name;
                            });
                            plot.studyMap = studyMap;
                            plotData.StudyShortName = plot.studyMap[studyLabel];
                            this.showPointTooltip(plot, point, data, plotName, plotData);
                        },
                        scope: this
                    });
                }
            },
            scope: this
        });
    },

    showPointTooltip: function(plot, point, data, plotName, plotData)
    {
        var content = this.buildPointTooltip(plot, data, plotData);
        ChartUtils.showDataTooltipCallout(content, point, 'hidetooltipmsg', plotName===plot.yGutterName, plotName===plot.xGutterName, plot);
    },

    buildPointTooltip: function(plot, data, plotData) {
        var content = '', colon = ': ', linebreak = '<br/>';
        var record = plot.allDataRowsMap[data.rowKey], xAxis = plot.activeMeasures.x, yAxis = plot.activeMeasures.y;

        if (plotData.Study) {
            content += '<span class="group-title">' + Ext.htmlEncode(plotData.Study) + '</span>';
            content +=  colon + Ext.htmlEncode(plotData.StudyShortName);
            content += '<div class="axis-details">';
            content += 'Treatment summary' + colon + plotData.TreatmentSummary + linebreak;
            content += 'Subject' + colon + data.subjectId + linebreak;
            if (plotData.timeLabel)
                content += 'Visit time' + colon + ' ' + plotData.timeLabel + linebreak;
            else {
                if (xAxis && xAxis.name == 'ProtocolDay') {
                    // Issue 29379: use alignment measure label for hover description
                    var xMeasureAlias = QueryUtils.ensureAlignmentAlias(plot._getAxisWrappedMeasure(xAxis));
                    label = Connector.getQueryService().getMeasure(xMeasureAlias).label;

                    content += label + colon + ' '
                            + (data.x > 0 && xAxis.options.alignmentVisitTag != null ? '+' : '') + data.x
                            + linebreak;
                }
                else {
                    content += 'Study day' + colon + ' Day ' + plotData.ProtocolDay + linebreak;
                }
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
            content += '<span class="group-title">' + Ext.htmlEncode(this.getSourceDisplayValue(plot.activeMeasures.color) + ' - ' + data.colorname) + '</span>' + colon + this.formatSingleTooltipValue(data.color);
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
                        if (hierarchicalDimensionInfo && hierarchicalDimensionInfo[dim]) {
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
                                    var levelValues = Ext.Object.getKeys(dimensionVals[level]);
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

    buildBinTooltip: function(plot, datas, plotData) {
        var xValsSet = {}, yValsSet = {}, subjectsSet = {};
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

            this.setBinDimensionValues(plot, xDimensionVals, xDimensions, record, xOptions, record.x ? record.x.rawRecord : null);
            this.setBinDimensionValues(plot, yDimensionVals, yDimensions, record, yOptions, record.y ? record.y.rawRecord : null);

        }, this);

        var xVals = Ext.Object.getKeys(xValsSet), yVals = Ext.Object.getKeys(yValsSet), subjects = Ext.Object.getKeys(subjectsSet), studies = plotData.studyLabels;

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
            if (plot.activeMeasures.x.name == 'ProtocolDay' || plot.activeMeasures.x.isHoursType) {
                var xMeasureAlias = QueryUtils.ensureAlignmentAlias(plot._getAxisWrappedMeasure(plot.activeMeasures.x));
                xName = Connector.getQueryService().getMeasure(xMeasureAlias).label;
            }

            content += '<span class="group-title">' +Ext.htmlEncode(this.getSourceDisplayValue(plot.activeMeasures.x) + ' - ' + xName) + '</span>';
            content += colon + Ext.htmlEncode(this.getBinRangeTooltip(xVals));
            content += plot.showAsMedian ? ' (median)' : '';
            content += '<div class="axis-details">';
            content += this.buildBinAxisDetailTooltip(xDimensionVals, xDimensions, xHierarchicalDimensionInfo);
            content += '</div>';

            if (plot.activeMeasures.x.name == 'ProtocolDay' || plot.activeMeasures.x.isHoursType) {
                if (Ext.isArray(plotData.visitLabels) && plotData.visitLabels.length > 0) {
                    var visitLabel;
                    if (plotData.visitLabels.length == 1) {
                        visitLabel = plotData.visitLabels[0];
                    }
                    else {
                        visitLabel = plotData.visitLabels.length + " visits";
                    }
                    content += '<span class="group-title">Visit time</span>';
                    content += colon + ' ' + Ext.htmlEncode(visitLabel) + linebreak;
                }
            }
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
                    var currentDimVals = Ext.Object.getKeys(dimensionVals[dim]);
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
                    var dimVals = Ext.Object.getKeys(dimensionVals[dim]);
                    if (dimVals.length > 0) {
                        if (hierarchicalDimensionInfo && Ext.isArray(hierarchicalDimensionInfo[dim]) && hierarchicalDimensionInfo[dim].length > 0) {
                            Ext.each(hierarchicalDimensionInfo[dim], function(level) {
                                if (dimensionVals[level]) {
                                    var levelVals = Ext.Object.getKeys(dimensionVals[level]);
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
    }

});