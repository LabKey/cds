/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.ChartData', {

    extend: 'Ext.data.Model',

    fields: [
        {name: 'measureSet', defaultValue: []}, // Full set of measures passed to the cdsGetData API call
        {name: 'plotMeasures', defaultValue: [null, null, null]}, // Array [x, y, color]
        {name: 'measureStore', defaultValue: null}, // LABKEY.Query.experimental.MeasureStore
        {name: 'plotScales', defaultValue: {}}, // {x: log/linear, y: log/linear}

        /* generated properties based on the processing of the MeasureStore */
        {name: 'containerAlignmentDayMap', defaultValue: {}},
        {name: 'rows', defaultValue: []}, // results of AxisMeasureStore.select()
        {name: 'xDomain', defaultValue: [0,0]},
        {name: 'yDomain', defaultValue: [0,0]},
        {name: 'properties', defaultValue: {}},
        {name: 'usesMedian', defaultValue: false}
    ],

    statics: {
        isContinuousMeasure : function(measure) {
            var type = measure.type;
            return type === 'INTEGER' || type === 'DOUBLE' || type === 'TIMESTAMP' || type === 'FLOAT' || type === 'REAL';
        }
    },

    constructor : function(config) {
        this.callParent([config]);

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

    getColumnAliases : function() {
        return this.get('measureStore').getResponseMetadata().columnAliases;
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

    getContainerAlignmentDayMap : function() {
        return this.get('containerAlignmentDayMap');
    },

    getXDomain : function(studyAxisInfo) {
        var domain = Ext.clone(this.get('xDomain')),
            studyRange;

        // issue 21300: set x-axis domain min/max based on study axis milestones if they exist
        if (Ext.isDefined(studyAxisInfo) && studyAxisInfo.getRange()) {
            studyRange = studyAxisInfo.getRange();

            if (studyRange.min < domain[0]) {
                domain[0] = studyRange.min;
            }

            if (studyRange.max > domain[1]) {
                domain[1] = studyRange.max;
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

    getAliasFromMeasure : function(measure) {
        var columnAliases = this.getColumnAliases();

        // if the param comes in as a string, make it an object for consistency
        if (Ext.isString(measure)) {
            measure = {alias: null, name: measure};
        }

        if (!Ext.isDefined(measure.alias) || measure.alias == null) {
            for (var i = 0; i < columnAliases.length; i++) {
                if ((measure.alias && measure.alias == columnAliases[i].columnName)
                        || (measure.name && measure.name == columnAliases[i].measureName))
                {
                    // stash the alias in the measure object to make it faster to find next time
                    measure.alias = columnAliases[i].columnName;
                    break;
                }
            }
        }

        return measure.alias;
    },

    getDimensionKeys : function(x, y, excludeAliases) {
        var measureSet = this.getMeasureSet(),
            dimensionKeys = [], sharedKeys = [];

        // Note: we don't exclude the color measure from the dimension keys
        // and we only exclude the x measure if it is continuous
        excludeAliases.push(y.alias);
        if (x.isContinuous) {
            excludeAliases.push(x.alias);
        }

        // return a list of column aliases for all measureSet objects which are dimensions and not in the exclude list (i.e. plot measures)
        Ext.each(measureSet, function(m) {
            if (m.measure.isDimension) {
                var alias = this.getAliasFromMeasure(m.measure);
                if (alias && excludeAliases.indexOf(alias) == -1) {
                    dimensionKeys.push(alias);
                }

                // TODO: remove sharedKeys hack
                if (alias.indexOf('http://cpas.labkey.com/Study#') == 0) {
                    sharedKeys.push(alias);
                }
            }
        }, this);

        return sharedKeys.length > 0 ? sharedKeys : dimensionKeys;
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
        var x = this.getPlotMeasure(0),
            y = this.getPlotMeasure(1),
            color = this.getPlotMeasure(2),
            xa, ya, ca, _xid, _yid, _cid,
            containerColName = this.getAliasFromMeasure('Container'),
            containerAlignmentDayMap = {},
            subjectNoun = Connector.studyContext.subjectColumn,
            subjectCol = this.getAliasFromMeasure(subjectNoun),
            axisMeasureStore = LABKEY.Query.experimental.AxisMeasureStore.create(),
            dataRows, mainPlotRows = [], undefinedXRows = [], undefinedYRows = [],
            xDomain = [null,null], yDomain = [null,null],
            xVal, yVal, colorVal = null,
            negX = false, negY = false,
            yMeasureFilter, xMeasureFilter, excludeAliases = [],
            brushFilterAliases = [], mainCount = 0,
            _row;

        ca = this.getBaseMeasureConfig();
        if (color) {
            _cid = this.getAliasFromMeasure(color);
            ca = {
                schema : color.schemaName,
                query  : color.queryName,
                name   : color.name,
                alias  : color.alias,
                colName: _cid, // Stash colName so we can query the getData temp table in the brushend handler.
                label  : color.label,
                type   : color.type
            };
        }

        xa = this.getBaseMeasureConfig();
        if (x) {
            _xid = x.interval || this.getAliasFromMeasure(x);
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

        // if we are plotting the same continuous variable on both the x and y axis,
        // we need to filter the AxisMeasureStore for each axis based on the dimension filters (if they differ)
        if (xa.schema == ya.schema && xa.query == ya.query) {
            yMeasureFilter = {};
            xMeasureFilter = {};

            // keep track of which dimensions have different filter values between the x and y axis
            Ext.each(Object.keys(y.options.dimensions), function(key) {
                var yDimValue = y.options.dimensions[key];
                var xDimValue = x.options.dimensions[key];

                if (!this.arraysEqual(xDimValue, yDimValue)) {
                    var alias = this.getAliasFromMeasure(key);
                    if (yDimValue) {
                        yMeasureFilter[alias] = yDimValue;
                    }
                    if (xDimValue) {
                        xMeasureFilter[alias] = xDimValue;
                    }

                    // issue 24008: only exclude the alias if the filters are for a single value on each side
                    if (xDimValue != null && xDimValue.length == 1 && yDimValue != null && yDimValue.length == 1) {
                        excludeAliases.push(alias);
                    }
                }
            }, this);
        }

        // configure AxisMeasureStore based on the x, y, and color measures selections
        axisMeasureStore.setYMeasure(this.getMeasureStore(), _yid, yMeasureFilter);
        if (_xid) {
            axisMeasureStore.setXMeasure(this.getMeasureStore(), _xid, xMeasureFilter);
        }
        if (_cid) {
            axisMeasureStore.setZMeasure(this.getMeasureStore(), _cid);
        }

        // select the data out of AxisMeasureStore based on the dimensions
        dataRows = axisMeasureStore.select(this.getDimensionKeys(xa, ya, excludeAliases));

        // issue 24021: get the array of plot related brush filter measures so we can exclude gutter plots appropriately
        Ext.each(Connector.getService('Query').getPlotBrushFilterMeasures(false), function(brushFilterMeasure) {
            brushFilterAliases.push(LABKEY.MeasureUtil.getAlias(brushFilterMeasure.measure));
        });

        // process each row and separate those destined for the gutter plot (i.e. undefined x value or undefined y value)
        for (var r = 0; r < dataRows.length; r++) {
            _row = dataRows[r];

            // build study container alignment day map
            if (containerColName && _row[containerColName]) {
                containerAlignmentDayMap[_row[containerColName]] = 0;
            }

            if (color) {
                colorVal = this._getColorValue(color, _cid, _row);
            }

            xVal = x ? this._getXValue(x, _xid, _row, xa.isContinuous) : '';
            if (Ext.typeOf(xVal) === "number" || Ext.typeOf(xVal) === "date") {
                if (xDomain[0] == null || xVal < xDomain[0])
                    xDomain[0] = xVal;
                if (xDomain[1] == null || xVal > xDomain[1])
                    xDomain[1] = xVal;
            }

            yVal = this._getYValue(y, _yid, _row);
            if (Ext.typeOf(yVal) === "number" || Ext.typeOf(yVal) === "date") {
                if (yDomain[0] == null || yVal < yDomain[0])
                    yDomain[0] = yVal;
                if (yDomain[1] == null || yVal > yDomain[1])
                    yDomain[1] = yVal;
            }

            // allow any pair that does not contain a negative value. NaN, null, and undefined are non-negative values.
            if (xa && xa.isNumeric && Ext.isNumber(xVal) && xVal <= 0) {
                negX = true;
            }
            if (ya.isNumeric && Ext.isNumber(yVal) && yVal <= 0) {
                negY = true;
            }

            var entry = {
                x: xVal,
                y: yVal,
                color: colorVal,
                subjectId: _row[subjectCol],
                xname: xa.label,
                yname: ya.label,
                colorname: ca.label
            };

            // split the data entry based on undefined x and y values for gutter plotting
            if (xVal == null) {
                if (brushFilterAliases.indexOf(_xid) == -1) { // issue 24021
                    undefinedXRows.push(entry);
                }
            }
            else if (xa.isContinuous && yVal == null) {
                if (brushFilterAliases.indexOf(_yid) == -1) { // issue 24021
                    undefinedYRows.push(entry);
                }
            }
            else {
                mainCount++;
            }

            // the main data row map will still include the x/y null rows,
            // but the main plot won't render them (plotNullPoints = false)
            mainPlotRows.push(entry);
        }

        // for continuous axis with data, always start the plot at the origin (could be negative as well)
        this.setAxisDomain(yDomain, 'y', negY, y.type);
        if (x) {
            this.setAxisDomain(xDomain, 'x', negX, x.type);
        }

        this.set({
            containerAlignmentDayMap: containerAlignmentDayMap,
            xDomain: xDomain,
            yDomain: yDomain,
            rows: {
                main: mainPlotRows,
                undefinedX: undefinedXRows.length > 0 ? undefinedXRows : undefined,
                undefinedY: undefinedYRows.length > 0 ? undefinedYRows : undefined,
                totalCount: mainCount + undefinedXRows.length + undefinedYRows.length
            },
            properties: {
                xaxis: xa,
                yaxis: ya,
                color: ca,
                setXLinear: negX,
                setYLinear: negY
            }
        });
    },

    setAxisDomain : function(axisDomain, axis, hasNegVal, type) {
        // issue 24074: set the min to 1 instead of 0 if log scale
        var min  = this.get('plotScales')[axis] == 'log' && !hasNegVal ? 1 : 0;

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

    arraysEqual : function(arrA, arrB) {

        // first check for nulls
        if (arrA == null && arrB == null) {
            return true;
        }
        else if (arrA == null || arrB == null) {
            return false;
        }

        // check if lengths are different
        if (arrA.length !== arrB.length) {
            return false;
        }

        // slice so we do not effect the original, sort makes sure they are in order
        var cA = arrA.slice().sort();
        var cB = arrB.slice().sort();

        for (var i=0; i < cA.length; i++) {
            if (cA[i] !== cB[i]) {
                return false;
            }
        }

        return true;
    },

    _getYValue : function(measure, alias, row) {
        if (row.y) {
            if (!this.usesMedian() && row.y.values.length > 1) {
                this.set('usesMedian', true);
            }

            return row.y.getMedian();
        }

        return null;
    },

    _getXValue : function(measure, alias, row, xIsContinuous) {
        if (row.x.hasOwnProperty('isUnique')) {
            if (Ext.isDefined(row.x.value) && row.x.value != null) {
                return this._getValue(row.x.value, measure.type);
            }
            return xIsContinuous ? null : 'undefined';
        }

        if (!this.usesMedian() && row.x.values.length > 1) {
            this.set('usesMedian', true);
        }

        return row.x.getMedian();
    },

    _getColorValue : function(measure, alias, row) {
        if (Ext.isDefined(row.z) && row.z.value != null) {
            return row.z.value;
        }
        else if (Ext.isDefined(row[alias])) {
            return row[alias];
        }
        else if (Ext.isDefined(row.z) && !row.z.isUnique) {
            // issue 23903: if the color value isn't unique because of aggregation, use 'Multiple values' for the legend
            return 'Multiple values';
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
    }
});