/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.ChartData', {

    extend: 'Ext.data.Model',

    fields: [
        {name: 'measureSet', defaultValue: []}, // Full set of measures passed to the cds getData API call
        {name: 'plotMeasures', defaultValue: [null, null, null]}, // Array [x, y, color]
        {name: 'measureStore', defaultValue: null}, // LABKEY.Query.MeasureStore
        {name: 'plotScales', defaultValue: {}}, // {x: log/linear, y: log/linear}
        {name: 'hasPlotSelectionFilter', defaultValue: {}},

        /* generated properties based on the processing of the MeasureStore */
        {name: 'studyContainers', defaultValue: {}},
        {name: 'rows', defaultValue: []}, // results of AxisMeasureStore.select()
        {name: 'xDomain', defaultValue: [0,0]},
        {name: 'yDomain', defaultValue: [0,0]},
        {name: 'properties', defaultValue: {}},
        {name: 'usesMedian', defaultValue: false}
    ],

    statics: {
        isContinuousMeasure : function(measure) {
            if (measure.options['timeAxisType'] !== undefined) {
                return measure.options['timeAxisType'] == 'Continuous'
            }

            var type = measure.type;
            return type === 'INTEGER' || type === 'DOUBLE' || type === 'TIMESTAMP' || type === 'FLOAT' || type === 'REAL';
        }
    },

    constructor : function(config) {
        this.callParent([config]);

        // URL option to show gutter plots that are hidden because of 1D or 2D plot selection filter
        this.SHOW_GUTTER_PLOTS = Ext.isDefined(LABKEY.ActionURL.getParameters()['showGutters']);

        this.processMeasureStore();
    },

    getPlotMeasures : function() {
        return this.get('plotMeasures');
    },

    getMeasureSet : function() {
        return this.get('measureSet');
    },

    getMeasureStore : function() {
        return this.get('measureStore');
    },

    getPlotScales : function() {
        return this.get('plotScales');
    },

    hasPlotSelectionFilter : function() {
        return this.get('hasPlotSelectionFilter');
    },

    getColumnAliasMap : function() {
        return this.get('measureStore').getResponseMetadata().columnAliasMap;
    },

    getSchemaName : function() {
        return this.get('measureStore').getResponseMetadata().schemaName;
    },

    getQueryName : function() {
        return this.get('measureStore').getResponseMetadata().queryName;
    },

    getDataRows : function() {
        return this.get('rows');
    },

    getProperties : function() {
        return this.get('properties');
    },

    getStudyContainers : function()
    {
        return this.get('studyContainers');
    },

    getXDomain : function(studyAxisInfo, isDiscrete) {
        var domain = Ext.clone(this.get('xDomain')),
            studyRange;

        // issue 21300: set x-axis domain min/max based on study axis milestones if they exist
        if (Ext.isDefined(studyAxisInfo)) {
            if (studyAxisInfo.getRange() && !isDiscrete) {
                studyRange = studyAxisInfo.getRange();

                if (studyRange.min < domain[0]) {
                    domain[0] = studyRange.min;
                }

                if (studyRange.max > domain[1]) {
                    domain[1] = studyRange.max;
                }
            }
            else if (isDiscrete && studyAxisInfo.getAllVisitTags()) {
                domain = studyAxisInfo.getAllVisitTags();
            }
        }

        return domain;
    },

    getYDomain : function() {
        return this.get('yDomain');
    },

    getPercentXNulls : function() {
        return this.get('percentXNulls');
    },

    getPercentYNulls : function() {
        return this.get('percentYNulls');
    },

    getPlotMeasure : function(index) {
        return this.getPlotMeasures()[index];
    },

    usesMedian : function() {
        return this.get('usesMedian');
    },

    isLogScale : function(axis)
    {
        return this.getPlotScales()[axis] == 'log';
    },

    getAliasFromMeasure : function(measure) {
        // if the param comes in as a string, make it an object for consistency
        if (Ext.isString(measure)) {
            measure = {alias: null, name: measure};
        }

        if (!Ext.isDefined(measure.alias) || measure.alias == null) {
            Ext.iterate(this.getColumnAliasMap(), function(alias, obj) {
                var schemaQueryNameMatch = measure.name == obj.name && measure.queryName == obj.queryName && measure.schemaName == obj.schemaName,
                    keyColumnMatch = (measure.name == 'Container' && alias == QueryUtils.CONTAINER_ALIAS)
                            || (measure.name == 'SubjectId' && alias == QueryUtils.SUBJECT_ALIAS)
                            || (measure.name == 'SequenceNum' && alias == QueryUtils.SEQUENCENUM_ALIAS)
                            || (measure.name == 'ParticipantSequenceNum' && alias == QueryUtils.SUBJECT_SEQNUM_ALIAS)
                            || (measure.name == 'VisitRowId' && alias == QueryUtils.VISITROWID_ALIAS)
                            || (measure.name == 'Study' && alias == QueryUtils.STUDY_ALIAS)
                            || (measure.name == 'TreatmentSummary' && alias == QueryUtils.TREATMENTSUMMARY_ALIAS)
                            || (measure.name == 'ProtocolDay' && alias == QueryUtils.PROTOCOLDAY_ALIAS);

                if ((measure.alias && measure.alias == alias) || (measure.name && schemaQueryNameMatch) || keyColumnMatch)
                {
                    // stash the alias in the measure object to make it faster to find next time
                    measure.alias = alias;
                    return false;
                }
            });
        }

        return measure.alias;
    },

    getDimensionKeys : function(x, y, color, excludeAliases, nonAggregated)
    {
        var measureSet = this.getMeasureSet(),
            dimensionKeys = [],
            sharedKeys = [],
            useSharedKeys;

        // Note: we don't exclude the color measure from the dimension keys
        // and we only exclude the x measure if it is continuous
        excludeAliases.push(y.alias);
        if (x.isContinuous)
        {
            excludeAliases.push(x.alias);
        }

        // return a list of column aliases for all measureSet objects which are dimensions
        // and not in the exclude list (i.e. plot measures)
        Ext.each(measureSet, function(m)
        {
            if (m.measure.isDimension)
            {
                var alias = this.getAliasFromMeasure(m.measure);
                if (alias && excludeAliases.indexOf(alias) == -1 && dimensionKeys.indexOf(alias) == -1)
                {
                    dimensionKeys.push(alias);
                }

                if (alias && (alias.indexOf(QueryUtils.STUDY_ALIAS_PREFIX) == 0 || alias.indexOf(QueryUtils.DEMOGRAPHICS_STUDY_SHORT_NAME_ALIAS) == 0) && sharedKeys.indexOf(alias) == -1)
                {
                    sharedKeys.push(alias);
                }
            }
        }, this);

        // the measure store will add a '_rowIndex' property for uniqueness to return all rows in the select() call
        if (nonAggregated)
        {
            dimensionKeys.push('_rowIndex');
        }

        // If we use shared keys, we want to tack on the demographic color alias so that it is applied as expected to the gutter plots
        if (color.alias != null && color.isDemographic)
        {
            sharedKeys.push(color.alias);
        }

        // use sharedKeys when we have the possibility of aggregation (see rules from nonAggregated)
        // or the x-axis and y-axis measures are not from the same source
        useSharedKeys = !nonAggregated && !this.isSameSource(x, y) && sharedKeys.length > 0;

        return useSharedKeys ? sharedKeys : dimensionKeys;
    },

    getBaseMeasureConfig : function() {
        return {
            schema  : null,
            query   : null,
            name    : null,
            alias   : null,
            colName : null,
            label   : '',
            isNumeric: false,
            isContinuous: false
        };
    },

    processMeasureStore : function() {
        var wrappedX = this.getPlotMeasure(0),
            x = (wrappedX ? wrappedX.measure : undefined),
            wrappedY = this.getPlotMeasure(1),
            y = (wrappedY ? wrappedY.measure : undefined),
            wrappedColor = this.getPlotMeasure(2),
            color = (wrappedColor ? wrappedColor.measure : undefined),
            xa, ya, ca, _xid, _yid, _cid,
            studyContainers = {},
            axisMeasureStore = LABKEY.Query.AxisMeasureStore.create(),
            dataRows, mainPlotRows = [], undefinedXRows = [], undefinedYRows = [], undefinedBothRows = [],
            invalidLogPlotRowCount = 0,
            xDomain = [null,null], yDomain = [null,null],
            xVal, yVal, colorVal = null,
            distinctXVals = {},
            hasNegOrZeroX = false, hasNegOrZeroY = false,
            yMeasureFilter = {}, xMeasureFilter = {}, zMeasureFilter = {},
            excludeAliases = [],
            mainCount = 0,
            nonAggregated,
            singleAntigenComparison = false,
            _row,
            logGutterBothCount = 0, logGutterXCount = 0,logGutterYCount = 0,
            minPositiveX = Number.MAX_VALUE, minPositiveY = Number.MAX_VALUE,
            studyVisitMap = {}, studyGroupVisitMap = {};

        ca = this.getBaseMeasureConfig();
        if (color)
        {
            _cid = this.getAliasFromMeasure(color);
            ca = {
                schema : color.schemaName,
                query  : color.queryName,
                name   : color.name,
                alias  : color.alias,
                colName: _cid, // Stash colName so we can query the getData temp table in the brushend handler.
                label  : color.label,
                type   : color.type,
                isDemographic: color.isDemographic
            };
        }

        xa = this.getBaseMeasureConfig();
        if (x)
        {
            _xid = QueryUtils.ensureAlignmentAlias(wrappedX, x.interval || this.getAliasFromMeasure(x));
            xa = {
                schema : x.schemaName,
                query  : x.queryName,
                name   : x.name,
                alias  : x.alias,
                colName: _xid, // Stash colName so we can query the getData temp table in the brushend handler.
                label  : x.label,
                type   : x.type,
                isNumeric : x.type === 'INTEGER' || x.type === 'DOUBLE' || x.type === 'FLOAT' || x.type === 'REAL',
                isContinuous: Connector.model.ChartData.isContinuousMeasure(x),
                isDimension: x.isDimension
            };
        }

        _yid = this.getAliasFromMeasure(y);
        ya = {
            schema : y.schemaName,
            query  : y.queryName,
            name   : y.name,
            alias  : y.alias,
            colName: _yid, // Stash colName so we can query the getData temp table in the brushend handler.
            label  : y.label,
            type   : y.type,
            isNumeric : y.type === 'INTEGER' || y.type === 'DOUBLE' || y.type === 'FLOAT' || y.type === 'REAL',
            isContinuous: Connector.model.ChartData.isContinuousMeasure(y)
        };

        // we need to keep track of which dimensions have different filter values between the x and y axis
        if (this.isSameSource(xa, ya))
        {
            excludeAliases = ChartUtils.getAssayDimensionsWithDifferentValues(y, x, true);
        }

        // if there is a DATASET_ALIAS column from the axisName property, use it to filter
        if (this.hasDatasetAliasColumn())
        {
            xMeasureFilter[QueryUtils.DATASET_ALIAS] = ChartUtils.xAxisNameProp;
            yMeasureFilter[QueryUtils.DATASET_ALIAS] = ChartUtils.yAxisNameProp;

            // if the color variable is from the same source as either x or y, but not both, use that for the zMeasure filter
            if (!this.isSameSource(ca, xa) || !this.isSameSource(ca, ya))
            {
                if (this.isSameSource(ca, xa))
                {
                    zMeasureFilter[QueryUtils.DATASET_ALIAS] = ChartUtils.xAxisNameProp;
                }
                else if (this.isSameSource(ca, ya))
                {
                    zMeasureFilter[QueryUtils.DATASET_ALIAS] = ChartUtils.yAxisNameProp;
                }
            }
        }

        // configure AxisMeasureStore based on the x, y, and color measures selections
        axisMeasureStore.setYMeasure(this.getMeasureStore(), _yid, yMeasureFilter);
        if (_xid) {
            axisMeasureStore.setXMeasure(this.getMeasureStore(), _xid, xMeasureFilter);
        }
        if (_cid) {
            singleAntigenComparison = excludeAliases.indexOf(_cid) > -1;
            axisMeasureStore.setZMeasure(this.getMeasureStore(), _cid, zMeasureFilter);
        }

        // select the data out of AxisMeasureStore based on the dimensions
        // we use an AxisMeasureStore but do not attempt to group (aggregate) the data when:
        //  1) the plot does not have an x-axis measure (i.e. only y-axis, or y-axis plus color)
        //  2) the x-axis or y-axis measure is from a demographic dataset
        //  3) the x-axis is a time point
        //  4) the x-axis and y-axis measures are from the same source and have the exact same assay dimension filter values
        nonAggregated = !Ext.isDefined(x) // #1
            || x.isDemographic === true || y.isDemographic === true // #2
            || x.variableType === 'TIME' // #3
            || (this.isSameSource(xa, ya) && ChartUtils.getAssayDimensionsWithDifferentValues(y, x).length == 0); //#4

        var hasSameDimensions = false;
        if (this.isSameSource(xa, ya) && x && y) {
            var intersectDimensions = Ext.Array.intersect(
                    Object.keys(x.options.dimensions),
                    Object.keys(y.options.dimensions)
            );
            hasSameDimensions = intersectDimensions.length > 0;
        }

        var getAllDimensions = !nonAggregated || hasSameDimensions;

        dataRows = axisMeasureStore.select(this.getDimensionKeys(xa, ya, ca, excludeAliases, nonAggregated), getAllDimensions);

        var allRows = {};
        // process each row and separate those destined for the gutter plot (i.e. undefined x value or undefined y value)
        for (var r = 0; r < dataRows.length; r++)
        {
            _row = dataRows[r];

            yVal = this._getYValue(y, _yid, _row);
            xVal = x ? this._getXValue(x, _xid, _row, xa.isContinuous, xa.isDimension) : '';
            colorVal = color ? this._getColorValue(color, _cid, _row, singleAntigenComparison) : undefined;

            // build study container alignment day map
            if (_row[QueryUtils.CONTAINER_ALIAS])
            {
                studyContainers[_row[QueryUtils.CONTAINER_ALIAS]] = true;
                if (_row[QueryUtils.VISITROWID_ALIAS]) {
                    var studyVisitKey = ChartUtils.studyAxisKeyDelimiter + xVal + ChartUtils.studyAxisKeyDelimiter + _row[QueryUtils.STUDY_ALIAS];
                    studyVisitMap[studyVisitKey] = true;
                    studyGroupVisitMap[studyVisitKey + ChartUtils.studyAxisKeyDelimiter + _row[QueryUtils.TREATMENTSUMMARY_ALIAS]] = true;
                }
            }

            if (!xa.isContinuous)
            {
                distinctXVals[xVal] = true;
            }

            // check that the plot value are valid on a log scale
            //if (!this.isValidPlotValue('y', ya, yVal) || !this.isValidPlotValue('x', xa, xVal))
            //{
            //    //invalidLogPlotRowCount++;
            //    //continue;
            //}

            // update x-axis and y-axis domain min and max values
            if (Ext.typeOf(xVal) === "number" || Ext.typeOf(xVal) === "date")
            {
                if (xDomain[0] == null || xVal < xDomain[0])
                    xDomain[0] = xVal;
                if (xDomain[1] == null || xVal > xDomain[1])
                    xDomain[1] = xVal;
            }

            if (Ext.typeOf(yVal) === "number" || Ext.typeOf(yVal) === "date")
            {
                if (yDomain[0] == null || yVal < yDomain[0])
                    yDomain[0] = yVal;
                if (yDomain[1] == null || yVal > yDomain[1])
                    yDomain[1] = yVal;
            }

            // allow any pair that does not contain a negative value. NaN, null, and undefined are non-negative values.
            if (xa && xa.isNumeric && Ext.isNumber(xVal) && xVal <= 0)
            {
                hasNegOrZeroX = true;
            }
            if (ya.isNumeric && Ext.isNumber(yVal) && yVal <= 0)
            {
                hasNegOrZeroY = true;
            }

            var timeAxisKey = '';
            if (_row[QueryUtils.STUDY_ALIAS] && _row[QueryUtils.VISITROWID_ALIAS]) {
                timeAxisKey = ChartUtils.studyAxisKeyDelimiter + xVal;
                timeAxisKey += ChartUtils.studyAxisKeyDelimiter + _row[QueryUtils.STUDY_ALIAS];
                if (_row[QueryUtils.TREATMENTSUMMARY_ALIAS]) {
                    timeAxisKey += ChartUtils.studyAxisKeyDelimiter + _row[QueryUtils.TREATMENTSUMMARY_ALIAS];
                }

            }

            var rowKey = '';
            if (_row[QueryUtils.SUBJECT_ALIAS]) {
                rowKey = ChartUtils.studyAxisKeyDelimiter + _row[QueryUtils.SUBJECT_ALIAS];
                rowKey += ChartUtils.studyAxisKeyDelimiter + xVal;
                if (yVal) {
                    rowKey += ChartUtils.studyAxisKeyDelimiter + yVal;
                }
                rowKey += ChartUtils.studyAxisKeyDelimiter;
            }

            allRows[rowKey] = _row;

            var entry = {
                x: xVal,
                y: yVal,
                timeAxisKey : timeAxisKey,
                color: colorVal,
                subjectId: _row[QueryUtils.SUBJECT_ALIAS],
                xname: xa.label,
                yname: ya.label,
                colorname: ca.label,
                rowKey: rowKey
            };

            // split the data entry based on undefined x and y values for gutter plotting
            if (xVal == null && yVal == null)
            {
                // note: we don't currently do anything with these null/null points
                undefinedBothRows.push(entry);
            }
            else if (xVal == null && xa.isContinuous && !xa.isDimension)
            {
                if (this.SHOW_GUTTER_PLOTS || this.hasPlotSelectionFilter().x !== true)
                {
                    undefinedXRows.push(entry);
                    if (yVal > 0 && yVal < minPositiveY)
                    {
                        minPositiveY = yVal;
                    }
                }
            }
            else if (yVal == null && xa.isContinuous && !xa.isDimension)
            {
                if (this.SHOW_GUTTER_PLOTS || this.hasPlotSelectionFilter().y !== true)
                {
                    undefinedYRows.push(entry);
                    if (xVal > 0 && xVal < minPositiveX)
                    {
                        minPositiveX = xVal;
                    }
                }
            }
            else
            {
                if (!this.isValidPlotValue('y', ya, yVal) && !this.isValidPlotValue('x', xa, xVal))
                {
                    logGutterBothCount++;
                    logGutterXCount++;
                    logGutterYCount++
                }
                else if (!this.isValidPlotValue('x', xa, xVal))
                {
                    logGutterXCount++;
                }
                else if (!this.isValidPlotValue('y', ya, yVal))
                {
                    logGutterYCount++
                }
                if (xVal > 0 && xVal < minPositiveX)
                {
                    minPositiveX = xVal;
                }
                if (yVal > 0 && yVal < minPositiveY)
                {
                    minPositiveY = yVal;
                }
                mainCount++;
            }

            // the main data row map will still include the x/y null rows,
            // but the main plot won't render them (plotNullPoints = false)
            mainPlotRows.push(entry);
        }

        if (Object.keys(distinctXVals).length > 0)
        {
            xa.discreteValueCount = Object.keys(distinctXVals).length;
        }

        // for continuous axis with data, always start the plot at the origin (could be negative as well)
        this.setAxisDomain(yDomain, 'y', hasNegOrZeroY, y.type);
        if (x)
        {
            this.setAxisDomain(xDomain, 'x', hasNegOrZeroX, x.type);
        }

        this.set({
            studyContainers: studyContainers,
            xDomain: xDomain,
            yDomain: yDomain,
            rows: {
                main: mainPlotRows,
                allRowsMap: allRows,
                undefinedX: undefinedXRows.length > 0 ? undefinedXRows : undefined,
                undefinedY: undefinedYRows.length > 0 ? undefinedYRows : undefined,
                logNonPositiveX: logGutterXCount > 0,
                logNonPositiveY: logGutterYCount > 0,
                logNonPositiveBoth: logGutterBothCount > 0,
                totalCount: mainCount + undefinedXRows.length + undefinedYRows.length,
                invalidLogPlotRowCount: invalidLogPlotRowCount,
                minPositiveX: minPositiveX === Number.MAX_VALUE ? 0.0001 : minPositiveX,
                minPositiveY: minPositiveY === Number.MAX_VALUE ? 0.0001 : minPositiveY,
                hasDimensionalAggregators: getAllDimensions ? true : false
            },
            studyAxisData: {
                studyVisitMap: studyVisitMap,
                studyGroupVisitMap: studyGroupVisitMap
            },
            properties: {
                xaxis: xa,
                yaxis: ya,
                color: ca
            }
        });
    },

    isSameSource : function(x, y) {
        return x.query == y.query && x.schema == y.schema;
    },

    hasDatasetAliasColumn : function() {
        return Ext.isDefined(this.getColumnAliasMap()[QueryUtils.DATASET_ALIAS]);
    },

    setAxisDomain : function(axisDomain, axis, hasNegVal, type) {
        // issue 24074: set the min to 1 instead of 0 if log scale
        var min = this.isLogScale(axis) && !hasNegVal ? 1 : 0;

        if (type == 'TIMESTAMP') {
            // if the min and max dates are the same, +/- 3
            if (axisDomain[0] != null && axisDomain[0] == axisDomain[1]) {
                axisDomain[0] = new Date(axisDomain[0].getFullYear(),axisDomain[0].getMonth(),axisDomain[0].getDate() - 3);
                axisDomain[1] = new Date(axisDomain[1].getFullYear(),axisDomain[1].getMonth(),axisDomain[1].getDate() + 3);
            }
        }
        else if (axisDomain[0] != null) {
            axisDomain[0] = Math.min(axisDomain[0], min);
        }
    },

    _getYValue : function(measure, alias, row) {
        if (row.y) {
            if (!this.usesMedian() && row.y.values.length > 1) {
                this.set('usesMedian', true);
            }

            return this.roundMedian(row.y.getMedian());
        }

        return null;
    },

    _getXValue : function(measure, alias, row, xIsContinuous, xIsDimension) {
        if (row.x.hasOwnProperty('isUnique')) {
            if (Ext.isDefined(row.x.value) && row.x.value != null) {
                return this._getValue(row.x.value, measure.type);
            }
            return xIsContinuous ? (xIsDimension ? 'null' : null) : ChartUtils.emptyTxt;
        }

        if (!this.usesMedian() && row.x.values.length > 1) {
            this.set('usesMedian', true);
        }

        return this.roundMedian(row.x.getMedian());
    },

    roundMedian: function(value) {
        if (value == null) {
            return null;
        }
        if (Math.abs(value) < 0.0001) {
            // show the 1st significant digit, we don't want to show 0
            return value.toPrecision(1) * 1;  // toPrecision returns string, use *1 to convert back to number
        }
        else {
            return parseFloat(value.toFixed(4));
        }
    },

    _getColorValue : function(measure, alias, row, isMultiValue) {
        if (isMultiValue || (Ext.isDefined(row.z) && !row.z.isUnique))
        {
            // issue 23903: if the color value isn't unique because of aggregation, use 'Multiple values' for the legend
            // issue 24805: if the color variable is an assay dimension with an x vs y filter on distinct single values,
            //              we know that the points will have multiple values for the color
            return 'Multiple values';
        }
        else if (Ext.isDefined(row.z) && row.z.value != null)
        {
            return row.z.value;
        }
        else if (Ext.isDefined(row[alias]))
        {
            return row[alias] || ChartUtils.emptyTxt;
        }
        return null;
    },

    _getValue : function(value, type) {
        var val;

        if (type === 'INTEGER') {
            val = parseInt(value);
            return this.isValidNumber(val) ? val : null;
        }
        else if (type === 'DOUBLE' || type === 'FLOAT' || type === 'REAL') {
            val = parseFloat(value);
            return this.isValidNumber(val) ? val : null;
        }
        else if (type === 'TIMESTAMP') {
            return Ext.isString(value) ? new Date(value) : null;
        }

        return value;
    },

    isValidNumber : function(number) {
        return !(number === undefined || isNaN(number) || number === null);
    },

    isValidValue : function(measure, value) {
        var type = measure.type;
        if (type === 'INTEGER' || type === 'DOUBLE' || type === 'FLOAT' || type === 'REAL') {
            return this.isValidNumber(value);
        }

        return !(value === undefined || value === null);
    },

    isValidPlotValue : function(axis, props, value)
    {
        return value == null || !props.isContinuous || props.isDimension || !this.isLogScale(axis) || value > 0;
    }
});