/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
// This is a singleton for charting utilities
Ext.define('Connector.utility.Chart', {

    alternateClassName: ['ChartUtils'],

    singleton: true,

    /**
     * This brush delay is used to improve page rendering performance when brushing.
     * It is left up to the Chart to set this delay according to whatever metrics
     * (e.g. number of points, cursor velocity, etc)
     */
    BRUSH_DELAY: 0,

    colors: {
        WHITE: '#FFFFFF',
        GRAYBACKGROUND: '#f5f5f5',
        BLACK: '#000000',
        SECONDARY: '#F0F0F0',
        GRIDBKGD: '#F8F8F8',
        GRIDLINE: '#EAEAEA',
        HEATSCALE1: '#666363',
        HEATSCALE2: '#A09C9C',
        HEATSCALE3: '#CCC8C8',
        SELECTED: '#41C49F', // $data-green
        SELECTEDBG: '#D9F3EC', // 0.2 opacity of $data-green
        UNSELECTED: '#E6E6E6',
        BOXSHADOW: '#CCCCCC',
        PRIMARYTEXT: '#222222',
        PREENROLLMENT: 'rgba(251,46,92,0.3)'
    },

    emptyTxt: 'undefined',

    studyAxisKeyDelimiter: '|||',

    tickFormat: {
        date: function(val) {
            // D3 converts dates to integers, so we need to convert it back to a date to get the format.
            var d = new Date(val);
            return d.toLocaleDateString();
        },
        empty : function() {
            return '';
        },
        numeric : function(val) {
            var s = val.toString();
            if (s.indexOf('.') > -1 && s.indexOf('e') == -1)
            {
                s = s.split('.');
                if (s[s.length-1].length > 2)
                {
                    s[s.length-1] = s[s.length-1].substr(0,4);
                    s = s.join('.');
                    return parseFloat(s, 10);
                }
            }
            return val;
        }
    },

    axisNameProp : 'plot-axis',
    xAxisNameProp : 'plot-axis-x',
    yAxisNameProp : 'plot-axis-y',

    callOutPositions: {
        right : {
            placement: 'right',
            xOffset: 0,
            yOffset: -25,
            arrowOffset: 0
        },
        topRight : {
            placement: 'top',
            xOffset: -35,
            yOffset: 0,
            arrowOffset: 20
        },
        top : {
            placement: 'top',
            xOffset: -200,
            yOffset: 0,
            arrowOffset: 190
        },
        bottom : {
            placement: 'bottom',
            xOffset: -200,
            yOffset: 0,
            arrowOffset: 190
        },
        bottomRight : {
            placement: 'bottom',
            xOffset: -35,
            yOffset: 0,
            arrowOffset: 20
        }
    },

    constructor : function(config) {
        this.callParent([config]);
        this.brushDelayTask = new Ext.util.DelayedTask(this._onBrush, this);
    },

    // modeled after Ext.bind but allows scope to be passed through
    // so access to things like this.getAttribute() work
    d3Bind : function(fn, args) {
        var method = fn,
            slice = Array.prototype.slice;

        return function() {
            var callArgs = slice.call(arguments, 0).concat(args);
            return method.apply(this, callArgs);
        };
    },

    /**
     * Uses linear equation to determine delay based on the totalPoints
     * @param totalPoints
     * @returns {number}
     */
    calculateDelay : function(totalPoints)
    {
        var minPoints = 1000,
            maxPoints = 5000,
            minDelay = 30,
            maxDelay = 80,
            brushDelay = 0;

        if (totalPoints >= minPoints)
        {
            var m = (maxDelay - minDelay) / (maxPoints - minPoints),
                b = maxDelay - (m * maxPoints);

            brushDelay = Math.ceil((m * totalPoints) + b);
        }

        if (LABKEY.devMode)
        {
            console.log('brush delay:', brushDelay, 'ms');
        }

        return brushDelay;
    },

    brushBins : function(event, layerData, extent, plot) {
        var min, max,
            isXExtent, isYExtent,
            subjects = {}; // Stash all of the selected subjects so we can highlight associated points.

        // convert extent x/y values into aes scale as bins don't really have x/y values
        if (extent[0][0] !== null && extent[1][0] !== null) {
            if (plot.scales.xTop) {
                extent[0][0] = plot.scales.xTop.scale(extent[0][0]);
                extent[1][0] = plot.scales.xTop.scale(extent[1][0]);
            }
            else {
                extent[0][0] = plot.scales.x.scale(extent[0][0]);
                extent[1][0] = plot.scales.x.scale(extent[1][0]);
            }
        }
        if (extent[0][1] !== null && extent[1][1] !== null) {
            // TODO: the min/max y values are flipped for bins vs points, why?
            if (plot.scales.yRight) {
                max = plot.scales.yRight.scale(extent[0][1]);
                min = plot.scales.yRight.scale(extent[1][1]);
            }
            else {
                max = plot.scales.yLeft.scale(extent[0][1]);
                min = plot.scales.yLeft.scale(extent[1][1]);
            }
            extent[0][1] = min;
            extent[1][1] = max;
        }

        isXExtent = extent[0][0] !== null && extent[1][0] !== null;
        isYExtent = extent[0][1] !== null && extent[1][1] !== null;

        // first we go through and get the selected bins/subjects for the main plot and both gutters
        ChartUtils._brushSelectedBinsByCanvas(this.plot.renderer.canvas, extent, (isXExtent || isYExtent), subjects);
        if (this.requireXGutter && Ext.isDefined(this.xGutterPlot)) {
            ChartUtils._brushSelectedBinsByCanvas(this.xGutterPlot.renderer.canvas, extent, (isXExtent && !isYExtent), subjects);
        }
        if (this.requireYGutter && Ext.isDefined(this.yGutterPlot)) {
            ChartUtils._brushSelectedBinsByCanvas(this.yGutterPlot.renderer.canvas, extent, (!isXExtent && isYExtent), subjects);
        }

        // second we go back through and highlight the subject associated bins in the main plot and both gutters
        ChartUtils._brushAssociatedBinsByCanvas(this.plot.renderer.canvas, extent, (isXExtent || isYExtent), subjects);
        if (this.requireXGutter && Ext.isDefined(this.xGutterPlot)) {
            ChartUtils._brushAssociatedBinsByCanvas(this.xGutterPlot.renderer.canvas, extent, (isXExtent && !isYExtent), subjects);
        }
        if (this.requireYGutter && Ext.isDefined(this.yGutterPlot)) {
            ChartUtils._brushAssociatedBinsByCanvas(this.yGutterPlot.renderer.canvas, extent, (!isXExtent && isYExtent), subjects);
        }

        this.brushedSubjects = subjects;
    },

    _brushSelectedBinsByCanvas : function(canvas, extent, allowSelected, subjects)
    {
        // set color, via style attribute, for the selected bins
        var colorFn = function(d) {
            d.isSelected = allowSelected && ChartUtils.isSelectedWithBrush(extent, d.x, d.y);

            // track the subjects that are included in the points for the selected bins
            if (d.isSelected && d.length > 0 && d[0].data) {
                for (var i = 0; i < d.length; i++) {
                    subjects[d[i].data.subjectId] = true;
                }
            }

            // keep original color of the bin (note: uses style instead of fill attribute)
            d.origStyle = d.origStyle || this.getAttribute('style');

            return 'fill: ' + (d.isSelected ? ChartUtils.colors.SELECTED : ChartUtils.colors.UNSELECTED) + ';';
        };

        canvas.selectAll('.vis-bin path')
                .attr('style', colorFn)
                .attr('fill-opacity', 1)
                .attr('stroke-opacity', 1);
    },

    _brushAssociatedBinsByCanvas : function(canvas, extent, allowSelected, subjects)
    {
        // set color, via style attribute, for the unselected bins
        var assocColorFn = function(d) {
            if (!d.isSelected && d.length > 0 && d[0].data) {
                for (var i = 0; i < d.length; i++) {
                    if (subjects[d[i].data.subjectId] === true)
                        return 'fill: ' + ChartUtils.colors.BLACK + ';';
                }
            }

            return this.getAttribute('style');
        };

        canvas.selectAll('.vis-bin path')
                .attr('style', assocColorFn)
                .attr('fill-opacity', 1);

        //move brush layer to front
        canvas.select('svg g.brush').each(function() {
            this.parentNode.appendChild(this);
        });
    },

    brushClear : function(layerScope, dimension, clearAll) {
        if (this.initiatedBrushing === dimension || clearAll) {
            ChartUtils.brushDelayTask.cancel();
            this.initiatedBrushing = '';
            layerScope.isBrushed = false;
            Connector.getState().clearSelections(true);
            this.clearHighlightedData();
            this.highlightSelected();

            //move data layer to front
            this.plot.renderer.canvas.select('svg g.layer').each(function() {
                this.parentNode.appendChild(this);
            });

            if (this.requireXGutter && Ext.isDefined(this.xGutterPlot)) {
                this.xGutterPlot.renderer.canvas.select('svg g.layer').each(function() {
                    this.parentNode.appendChild(this);
                });
            }

            if (this.requireYGutter && Ext.isDefined(this.yGutterPlot)) {
                this.yGutterPlot.renderer.canvas.select('svg g.layer').each(function() {
                    this.parentNode.appendChild(this);
                });
            }
        }
    },

    brushEnd : function(event, layerData, extent, plot, layerSelections, measures, properties, dimension)
    {
        // this brushing method can be used across different dimensions (main vs. xTop vs. yRight)
        // only the plot that originated the brushing can end the brushing
        if (this.initiatedBrushing !== dimension)
        {
            return;
        }
        this.initiatedBrushing = '';

        var xExtent = [extent[0][0], extent[1][0]],
            yExtent = [extent[0][1], extent[1][1]],
            xMeasure = measures.x,
            yMeasure = measures.y,
            sqlFilters = [null, null, null, null],
            yMin, yMax, xMin, xMax;

        if (xMeasure && xExtent[0] !== null && xExtent[1] !== null)
        {
            var minValidXVal = this.requireYLogGutter ? this.minXPositiveValue : null;
            xMin = ChartUtils.transformVal(xExtent[0], xMeasure.type, true, minValidXVal);
            xMax = ChartUtils.transformVal(xExtent[1], xMeasure.type, false);

            // Issue 24124: With time points, brushing can create a filter that is not a whole number
            if (xMeasure.variableType === 'TIME')
            {
                xMin = Math.floor(xMin);
                xMax = Math.ceil(xMax);
            }

            if (xMeasure.type === 'TIMESTAMP')
            {
                sqlFilters[0] = LABKEY.Filter.create(properties.xaxis.colName, xMin.toISOString(), LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL);
                sqlFilters[1] = LABKEY.Filter.create(properties.xaxis.colName, xMax.toISOString(), LABKEY.Filter.Types.DATE_LESS_THAN_OR_EQUAL);
            }
            else
            {
                if (xExtent[0] !== Number.NEGATIVE_INFINITY) {
                    sqlFilters[0] = LABKEY.Filter.create(properties.xaxis.colName, xMin, LABKEY.Filter.Types.GREATER_THAN_OR_EQUAL);
                }
                sqlFilters[1] = LABKEY.Filter.create(properties.xaxis.colName, xMax, LABKEY.Filter.Types.LESS_THAN_OR_EQUAL);
            }
        }

        if (yMeasure && yExtent[0] !== null && yExtent[1] !== null)
        {
            var minValidYVal = this.requireXLogGutter ? this.minYPositiveValue : null;
            yMin = ChartUtils.transformVal(yExtent[0], yMeasure.type, true, minValidYVal);
            yMax = ChartUtils.transformVal(yExtent[1], yMeasure.type, false);

            if (yExtent[0] !== Number.NEGATIVE_INFINITY) {
                sqlFilters[2] = LABKEY.Filter.create(properties.yaxis.colName, yMin, LABKEY.Filter.Types.GREATER_THAN_OR_EQUAL);
            }
            sqlFilters[3] = LABKEY.Filter.create(properties.yaxis.colName, yMax, LABKEY.Filter.Types.LESS_THAN_OR_EQUAL);
        }

        this.createSelectionFilter(sqlFilters, true /* fromBrush */);
    },

    _onBrush : function(extent)
    {
        // Stash all of the selected subjects so we can highlight associated points.
        var subjects = {};

        // first we go through and get the selected points/subjects for the main plot and both gutters
        ChartUtils._brushSelectedPointsByCanvas(this.plot.renderer.canvas, extent, subjects);
        if (this.requireXGutter && Ext.isDefined(this.xGutterPlot)) {
            ChartUtils._brushSelectedPointsByCanvas(this.xGutterPlot.renderer.canvas, extent, subjects);
        }
        if (this.requireYGutter && Ext.isDefined(this.yGutterPlot)) {
            ChartUtils._brushSelectedPointsByCanvas(this.yGutterPlot.renderer.canvas, extent, subjects);
        }

        // second we go back through and highlight the subject associated points in the main plot and both gutters
        ChartUtils._brushAssociatedPointsByCanvas(this.plot.renderer.canvas, extent, subjects);
        if (this.requireXGutter && Ext.isDefined(this.xGutterPlot)) {
            ChartUtils._brushAssociatedPointsByCanvas(this.xGutterPlot.renderer.canvas, extent, subjects);
        }
        if (this.requireYGutter && Ext.isDefined(this.yGutterPlot)) {
            ChartUtils._brushAssociatedPointsByCanvas(this.yGutterPlot.renderer.canvas, extent, subjects);
        }

        this.brushedSubjects = subjects;
    },

    brushPoints : function(event, layerData, extent)
    {
        if (ChartUtils.BRUSH_DELAY)
        {
            ChartUtils.brushDelayTask.delay(ChartUtils.BRUSH_DELAY, undefined /* newFn */, this, [extent]);
        }
        else
        {
            ChartUtils._onBrush.call(this, extent);
        }
    },

    brushStart : function(layerScope, dimension) {
        this.clearHighlightLabels(layerScope.plot);
        this.clearStudyAxisSelection();
        layerScope.isBrushed = true;
        if (this.initiatedBrushing == '') {
            this.initiatedBrushing = dimension;
        }
    },

    _brushSelectedPointsByCanvas : function(canvas, extent, subjects)
    {
        canvas.selectAll('.point path')
                .attr('fill', ChartUtils.d3Bind(ChartUtils._brushPointPreFill, [extent, subjects]))
                .attr('stroke', ChartUtils.d3Bind(ChartUtils._brushPointPreStroke));

        // Re-append the node so it is on top of all the other nodes, this way highlighted points are always visible. (issue 24076)
        canvas.selectAll('.point path[fill="' + ChartUtils.colors.SELECTED + '"]').each(function()
        {
            var node = this.parentNode;
            node.parentNode.appendChild(node);
        });
    },

    _brushAssociatedPointsByCanvas : function(canvas, extent, subjects)
    {
        canvas.selectAll('.point path')
                .attr('fill', ChartUtils.d3Bind(ChartUtils._brushPointPostFill, [extent, subjects]))
                .attr('stroke', ChartUtils.d3Bind(ChartUtils._brushPointPostStroke, [extent, subjects]))
                .attr('fill-opacity', 1)
                .attr('stroke-opacity', 1);

        // Re-append the node so it is on top of all the other nodes, this way highlighted points are always visible. (issue 24076)
        canvas.selectAll('.point path[fill="' + ChartUtils.colors.BLACK + '"]').each(function()
        {
            var node = this.parentNode;
            node.parentNode.appendChild(node);
        });

        //move brush layer to front
        canvas.select('svg g.brush').each(function()
        {
            this.parentNode.appendChild(this);
        });
    },

    _brushPointPreFill : function(d, i, unknown, extent, subjects)
    {
        d.isSelected = ChartUtils.isSelectedWithBrush(extent, d.x, d.y);
        d.origFill = d.origFill || this.getAttribute('fill');

        if (d.isSelected)
        {
            subjects[d.subjectId] = true;
            return ChartUtils.colors.SELECTED;
        }

        return ChartUtils.colors.UNSELECTED;
    },

    _brushPointPostFill : function(d, i, unknown, extent, subjects) {
        if (!d.isSelected && subjects[d.subjectId] === true) {
            return ChartUtils.colors.BLACK;
        }
        return this.getAttribute('fill');
    },

    _brushPointPreStroke : function(d) {
        d.origStroke = d.origStroke || this.getAttribute('stroke');

        if (d.isSelected) {
            return ChartUtils.colors.SELECTED;
        }
        return ChartUtils.colors.UNSELECTED;
    },

    _brushPointPostStroke : function(d, i, unknown, extent, subjects) {
        if (!d.isSelected && subjects[d.subjectId] === true) {
            return ChartUtils.colors.BLACK;
        }
        return this.getAttribute('stroke');
    },

    isSelectedWithBrush : function(extent, x, y) {
        var xExtent = [extent[0][0], extent[1][0]],
            yExtent = [extent[0][1], extent[1][1]],
            isX = xExtent[0] !== null && xExtent[1] !== null,
            isY = yExtent[0] !== null && yExtent[1] !== null;

        // Issue 20116
        if (isX && isY) { // 2D
            return x != null && x > xExtent[0] && x < xExtent[1] &&
                   y != null && y > yExtent[0] && y < yExtent[1];
        }
        else if (isX) { // 1D
            return x != null && x > xExtent[0] && x < xExtent[1];
        }
        else if (isY) { // 1D
            return y != null && y > yExtent[0] && y < yExtent[1];
        }

        return false;
    },

    transformVal : function(val, type, isMin, minVal) {
        var trans = val;

        if (type === 'INTEGER') {
            trans = isMin ? Math.floor(val) : Math.ceil(val);
        }
        else if (type === 'TIMESTAMP') {
            trans = isMin ? new Date(Math.floor(val)) : new Date(Math.ceil(val));
        }
        else if (type === 'DOUBLE' || type === 'REAL' || type === 'FLOAT') {
            // CDS issue 457: Unable to filter out log values 0 or less
            // minVal is the minimum positive value for axis in log scale plot
            // if brush lower extent is smaller than the min positive data, set it to 0
            if (isMin && minVal && (minVal/val) > 1.2)
            {
                return 0;
            }

            var precision = 4;

            if (trans > 100 || trans < -100) {
                precision = 0;
            }
            else if (trans > 10 || trans < -10) {
                precision = 1;
            }
            else if (trans > 1 || trans < -1) {
                precision = 2;
            }
            else if (trans > 0.001 || trans < -0.001) {
                precision = 3;
            }

            trans = parseFloat(val.toFixed(precision));

            if (isMin && minVal && trans > 0 && trans < minVal)
            {
                return minVal;
            }
        }

        return trans;
    },

    showCallout : function(config, hideEvent, scope) {
        var calloutMgr = hopscotch.getCalloutManager(),
            _id = Ext.id(), timeout;

        Ext.apply(config, {
            id: _id,
            showCloseButton: false
        });

        timeout = setTimeout(function() {
            calloutMgr.createCallout(config);
        }, 250);

        scope.on(hideEvent, function() {
            clearTimeout(timeout);
            calloutMgr.removeCallout(_id);
        }, scope);
    },

    isSameSource : function(x, y)
    {
        return Ext.isObject(x) && Ext.isObject(y) && x.queryName == y.queryName && x.schemaName == y.schemaName;
    },

    arraysEqual : function(arrA, arrB)
    {
        // first check for nulls
        if (arrA == null && arrB == null)
        {
            return true;
        }
        else if (arrA == null || arrB == null)
        {
            return false;
        }

        // check if lengths are different
        if (arrA.length !== arrB.length)
        {
            return false;
        }

        // slice so we do not effect the original, sort makes sure they are in order
        var cA = arrA.slice().sort(),
            cB = arrB.slice().sort();

        for (var i=0; i < cA.length; i++)
        {
            if (cA[i] !== cB[i])
            {
                return false;
            }
        }

        return true;
    },

    hasMeasureAssayDimensions : function(measure)
    {
        return measure != null && Ext.isObject(measure.options) && Ext.isObject(measure.options.dimensions);
    },

    /**
     * Return the array of which assay dimension properties have different values arrays between the two measures.
     * Used for plot to determine which dimension keys to use for the grouping / aggregation.
     * @alias ChartUtils.getAssayDimensionsWithDifferentValues
     * @param {Connector.model.Measure} measure1
     * @param {Connector.model.Measure} measure2
     * @param {boolean} [singleValueOnly=false]
     * @returns {Array}
     */
    getAssayDimensionsWithDifferentValues : function(measure1, measure2, singleValueOnly)
    {
        var dimAliases = [],
            intersectAliases;

        if (measure1 == null || measure2 == null
                || !Ext.isObject(measure1.options) || !Ext.isObject(measure1.options.dimensions)
                || !Ext.isObject(measure2.options) || !Ext.isObject(measure2.options.dimensions))
        {
            return [];
        }

        intersectAliases = Ext.Array.intersect(
            Object.keys(measure1.options.dimensions),
            Object.keys(measure2.options.dimensions)
        );

        Ext.each(intersectAliases, function(alias)
        {
            var dimValue1 = measure1.options.dimensions[alias];
            var dimValue2 = measure2.options.dimensions[alias];

            if (!this.arraysEqual(dimValue1, dimValue2))
            {
                if (singleValueOnly === true)
                {
                    // issue 24008: only exclude the alias if the filters are for a single value on each side
                    if (dimValue1 != null && dimValue1.length == 1 && dimValue2 != null && dimValue2.length == 1)
                    {
                        dimAliases.push(alias);
                    }
                }
                else
                {
                    dimAliases.push(alias);
                }
            }
        }, this);

        return dimAliases;
    },

    // Issue 23885: Do not include the color measure in request if it's not from the x, y, or demographic datasets
    hasValidColorMeasure : function(activeMeasures)
    {
        var plotMeasures = activeMeasures;
        if (Ext.isArray(activeMeasures) && activeMeasures.length == 3)
        {
            plotMeasures = {
                x: activeMeasures[0] != null ? activeMeasures[0].measure : null,
                y: activeMeasures[1] != null ? activeMeasures[1].measure : null,
                color: activeMeasures[2] != null ? activeMeasures[2].measure : null
            };
        }

        if (Ext.isObject(plotMeasures.color))
        {
            var demographicSource = plotMeasures.color.isDemographic,
                discreteTimeSource = plotMeasures.color.isDiscreteTime,
                matchXSource = Ext.isObject(plotMeasures.x) && plotMeasures.x.queryName == plotMeasures.color.queryName,
                matchYSource = Ext.isObject(plotMeasures.y) && plotMeasures.y.queryName == plotMeasures.color.queryName;

            return demographicSource || discreteTimeSource || matchXSource || matchYSource;
        }

        return false;
    },

    sortTimeLegends: function (legends) {
        legends.sort(function(legendA, legendB){
            var a = legendA.text, b=legendB.text;
            if (!isNaN(a) && !isNaN(b)) {
                return parseInt(a) - parseInt(b);
            }
            else if (!isNaN(a)) {
                return -1;
            }
            else if (!isNaN(b)) {
                return 1;
            }
            else {
                return 0;
            }

        });
        return legends;
    },

    applySubjectValuesToMeasures : function(measureSet, subjectFilter) {
        // find the subject column(s) in the measure set to apply the values filter (issue 24123)
        if (subjectFilter.hasFilters)
        {
            Ext.each(measureSet, function(m)
            {
                if (m.measure && m.measure.name == Connector.studyContext.subjectColumn)
                {
                    m.measure.values = subjectFilter.subjects;
                }
            }, this);
        }
    },

    getTimepointFilterPaneMembers : function(measureSet, callback, scope)
    {
        if (Ext.isArray(measureSet) && measureSet.length > 0)
        {
            // get the full set of non-timepoint filters from the state
            var nonTimeFilterSet = [];
            Ext.each(Connector.getState().getFilters(), function(filter)
            {
                if (!filter.isTime() || filter.isPlot())
                {
                    nonTimeFilterSet.push(filter);
                }
            });

            Connector.getQueryService().getSubjectsForSpecificFilters(nonTimeFilterSet, null, function(subjectFilter)
            {
                ChartUtils.applySubjectValuesToMeasures(measureSet, subjectFilter);

                // Request distinct timepoint information for info pane plot counts, subcounts, and filter pane members
                LABKEY.Query.executeSql({
                    schemaName: 'study',
                    sql: QueryUtils.getDistinctTimepointSQL({measures: measureSet}),
                    scope: this,
                    success: function(data)
                    {
                        callback.call(scope, data.rows);
                    }
                });
            }, this);
        }
        else
        {
            callback.call(scope, undefined);
        }
    },

    /**
     * A comparator to determine if a filter from measureB qualifies against measureA. Determine by the following:
     *    1) the measureB filter is from a demographic dataset or from GridBase (which can always be applied)
     *    2) the measureB filter is a grid filter (i.e. no assay dimensions) from the same source as measureA
     *    3) the measureB filter is an exact match based on sourceKey and assay dimension filters to measureA
     * @alias ChartUtils.filterMeasureComparator
     * @param measureA
     * @param measureB
     * @returns {boolean}
     */
    filterMeasureComparator : function(measureA, measureB)
    {
        var gridBaseKey = Connector.studyContext.gridBaseSchema + '|' + Connector.studyContext.gridBase,
                measureAKey = measureA.schemaName + '|' + measureA.queryName,
                measureBKey = measureB.schemaName + '|' + measureB.queryName;

        // case #1 from comment above
        if (measureB.isDemographic === true || gridBaseKey.toLowerCase() == measureBKey.toLowerCase())
        {
            return true;
        }
        else if (measureA.isDemographic === true || !ChartUtils.hasMeasureAssayDimensions(measureA))
        {
            return false;
        }

        // case #2 from comment above
        if (!ChartUtils.hasMeasureAssayDimensions(measureB))
        {
            return measureAKey == measureBKey;
        }
        // case #3 from comment above
        else
        {
            return measureAKey == measureBKey && ChartUtils.getAssayDimensionsWithDifferentValues(measureA, measureB).length == 0;
        }
    },

    showDataTooltipCallout : function(content, point, hideEvent, isYGutter, isXGutter, scope) {
        var positioning = this.getBubblePosition(point,  isYGutter, isXGutter);
        var config = Ext.apply(positioning, {
            bubbleWidth: 400,
            target: point,
            content: content
        });

        var calloutMgr = hopscotch.getCalloutManager(), _id = Ext.id();

        Ext.apply(config, {
            id: _id,
            showCloseButton: false
        });

        calloutMgr.createCallout(config);

        scope.on(hideEvent, function() {
            calloutMgr.removeCallout(_id);
        }, scope);

        scope.mon(Ext.getCmp('app-main').getEl(), 'mousedown', function(el, e){
            calloutMgr.removeCallout(_id);
        }, scope);
    },

    getBubblePosition: function(point, isYGutter, isXGutter) {
        var pointNode = point.parentNode;
        var bbox = pointNode.getBBox();
        var config = ChartUtils.callOutPositions.top;

        if (isYGutter) {
            config = ChartUtils.callOutPositions.right;
        }
        else if (isXGutter) {
            if (bbox.x < 250) {
                config = ChartUtils.callOutPositions.topRight;
            }
            else {
                config = ChartUtils.callOutPositions.top;
            }
        }
        else if (bbox.y < 250 && bbox.x < 250) {
            config = ChartUtils.callOutPositions.bottomRight;
        }
        else if (bbox.y < 250) {
            config = ChartUtils.callOutPositions.bottom;
        }
        else if (bbox.x < 250) {
            config = ChartUtils.callOutPositions.topRight;
        }
        return config;
    }

});