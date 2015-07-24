/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.ChartData', {

    extend: 'Ext.data.Model',

    fields: [
        {name: 'measureSet', defaultValue: []}, // Full set of measures passed to the cdsGetData API call
        {name: 'plotMeasures', defaultValue: [null, null, null]}, // Array [x, y, color]
        {name: 'measureStore', defaultValue: null}, // LABKEY.Query.experimental.MeasureStore

        /* generated properties based on the processing of the MeasureStore */
        {name: 'containerAlignmentDayMap', defaultValue: {}},
        {name: 'rows', defaultValue: []}, // results of AxisMeasureStore.select()
        {name: 'xDomain', defaultValue: [0,0]},
        {name: 'yDomain', defaultValue: [0,0]},
        {name: 'properties', defaultValue: {}}
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

    getXDomain : function() {
        return this.get('xDomain');
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

    getYAxisMargin : function() {
        // Margin between main plot and Y gutter plot
        var yAxisMargin = 5,
            domainMax = this.getYDomain()[1];

        if(domainMax > 1)
            yAxisMargin = (domainMax || 0).toString().length;
        else if(domainMax >= .1)
            yAxisMargin = 4;

        return (Math.min(yAxisMargin, 6) * 6) + 10;
    },

    getAliasFromMeasure : function(measureName) {
        var columnAliases = this.getColumnAliases(), alias, name;

        // if the param comes in as a string, assume it is the measureName
        if (Ext.isObject(measureName)) {
            alias = measureName.alias;
            name = measureName.name;
        }
        else if (Ext.isString(measureName)) {
            alias = null;
            name = measureName;
        }

        for (var i = 0; i < columnAliases.length; i++) {
            if ((alias && alias == columnAliases[i].columnName) || (name && name == columnAliases[i].measureName)) {
                return columnAliases[i].columnName;
            }
        }

        return null;
    },

    getDimensionKeys : function() {
        var x = this.getPlotMeasure(0),
            y = this.getPlotMeasure(1),
            color = this.getPlotMeasure(2),
            measureSet = this.getMeasureSet(),
            exludeAliases = [], dimensionKeys = [], sharedKeys = [];

        exludeAliases.push(this.getAliasFromMeasure(y));
        if (Ext.isDefined(x) && x != null) {
            exludeAliases.push(this.getAliasFromMeasure(x));
        }
        if (Ext.isDefined(color) && color != null) {
            exludeAliases.push(this.getAliasFromMeasure(color));
        }

        // return a list of column aliases for all measureSet objects which are dimensions and not in the exclude list (i.e. plot measures)
        Ext.each(measureSet, function(m) {
            if (m.measure.isDimension) {
                var alias = this.getAliasFromMeasure(m.measure);
                if (alias && exludeAliases.indexOf(alias) == -1) {
                    dimensionKeys.push(alias);
                }

                // TODO: remove sharedKeys hack
                if (alias.startsWith('http://cpas.labkey.com/Study#')) {
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
            isNumeric: false
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
            xIsNum, yIsNum,
            negX = false, negY = false,
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
                isContinuous: Connector.model.ChartData.isContinuousMeasure(x)
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

        // configure AxisMeasureStore based on the x, y, and color measures selections
        // TODO filter for dataset column or ... in Assay1 vs Assay2 plot case for perf improvement
        axisMeasureStore.setYMeasure(this.getMeasureStore(), _yid);
        if (_xid) {
            axisMeasureStore.setXMeasure(this.getMeasureStore(), _xid);
        }
        if (_cid) {
            axisMeasureStore.setZMeasure(this.getMeasureStore(), _cid);
        }

        // select the data out of AxisMeasureStore based on the dimensions
        dataRows = axisMeasureStore.select(this.getDimensionKeys());

        // process each row and separate those destined for the gutter plot (i.e. undefined x value or undefined y value)
        for (var r = 0; r < dataRows.length; r++) {
            _row = dataRows[r];

            // build study container alignment day map
            if (containerColName && _row[containerColName]) {
                containerAlignmentDayMap[_row[containerColName]] = 0;
            }

            if (color) {
                colorVal = this._getValue(color, _cid, _row);
            }

            xVal = x ? this._getXValue(x, _xid, _row) : '';
            if(Ext.typeOf(xVal) === "number" || Ext.typeOf(xVal) === "date") {
                if(xDomain[0] == null || xVal < xDomain[0])
                    xDomain[0] = xVal;
                if(xDomain[1] == null || xVal > xDomain[1])
                    xDomain[1] = xVal;
            }

            yVal = this._getYValue(y, _yid, _row);
            if(Ext.typeOf(yVal) === "number" || Ext.typeOf(yVal) === "date") {
                if(yDomain[0] == null || yVal < yDomain[0])
                    yDomain[0] = yVal;
                if(yDomain[1] == null || yVal > yDomain[1])
                    yDomain[1] = yVal;
            }

            // allow any pair that does not contain a negative value. NaN, null, and undefined are non-negative values.
            if (xa && xa.isNumeric) {
                xIsNum = !(Ext.isNumber(x) && x < 1);
                if (!negX && !xIsNum) {
                    negX = true;
                }
            }
            if (ya.isNumeric) {
                yIsNum = !(Ext.isNumber(y) && y < 1);
                if (!negY && !yIsNum) {
                    negY = true;
                }
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
                undefinedXRows.push(entry);
            }
            else if (yVal == null) {
                undefinedYRows.push(entry);
            }
            else {
                mainPlotRows.push(entry);
            }
        }

        this.set({
            containerAlignmentDayMap: containerAlignmentDayMap,
            xDomain: xDomain,
            yDomain: yDomain,
            rows: {
                main: mainPlotRows,
                undefinedX: undefinedXRows.length > 0 ? undefinedXRows : undefined,
                undefinedY: undefinedYRows.length > 0 ? undefinedYRows : undefined,
                totalCount: mainPlotRows.length + undefinedXRows.length + undefinedYRows.length
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

    _getYValue : function(measure, alias, row) {
        return row.y ? row.y.getMean() : null;
    },

    _getXValue : function(measure, alias, row) {
        if (row.x) {
            return row.x.isUnique ? row.x.value : row.x.getMean();
        }

        return this._getValue(measure, alias, row);
    },

    _getValue : function(measure, colName, row) {
        var val, type = measure.type;

        if (type === 'INTEGER') {
            val = parseInt(row[colName]);
            return this.isValidNumber(val) ? val : null;
        }
        else if (type === 'DOUBLE' || type === 'FLOAT' || type === 'REAL') {
            val = parseFloat(row[colName]);
            return this.isValidNumber(val) ? val : null;
        }
        else if (type === 'TIMESTAMP') {
            val = row[colName];
            return val !== undefined && val !== null ? new Date(val) : null;
        }

        // Assume categorical.
        val = row[colName].displayValue ? row[colName].displayValue : row[colName];
        return (val !== undefined) ? val : null;
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