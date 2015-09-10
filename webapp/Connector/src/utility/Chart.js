/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
// This is a singleton for charting utilities
Ext.define('Connector.utility.Chart', {

    alternateClassName: ['ChartUtils'],

    singleton: true,

    colors: {
        WHITE: '#FFFFFF',
        BLACK: '#000000',
        SECONDARY: '#F0F0F0',
        GRIDBKGD: '#F8F8F8',
        GRIDLINE: '#EAEAEA',
        HEATSCALE1: '#666363',
        HEATSCALE2: '#A09C9C',
        HEATSCALE3: '#CCC8C8',
        SELECTED: '#01BFC2',
        UNSELECTED: '#E6E6E6',
        BOXSHADOW: '#CCCCCC',
        PRIMARYTEXT: '#222222',
        PREENROLLMENT: 'rgba(255,165,0,0.3)'
    },

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

    brushBins : function(event, layerData, extent, plot, layerSelections) {
        var min, max,
            subjects = {}; // Stash all of the selected subjects so we can highlight associated points.

        // convert extent x/y values into aes scale as bins don't really have x/y values
        if (extent[0][0] !== null && extent[1][0] !== null) {
            extent[0][0] = plot.scales.x.scale(extent[0][0]);
            extent[1][0] = plot.scales.x.scale(extent[1][0]);
        }
        if (extent[0][1] !== null && extent[1][1] !== null) {
            // TODO: the min/max y values are flipped for bins vs points, why?
            max = plot.scales.yLeft.scale(extent[0][1]);
            min = plot.scales.yLeft.scale(extent[1][1]);
            extent[0][1] = min;
            extent[1][1] = max;
        }

        ChartUtils._brushBinsByCanvas(this.plot.renderer.canvas, extent, subjects);

        if (this.requireXGutter && Ext.isDefined(this.xGutterPlot)) {
            ChartUtils._brushBinsByCanvas(this.xGutterPlot.renderer.canvas, extent, subjects);
        }

        if (this.requireYGutter && Ext.isDefined(this.yGutterPlot)) {
            ChartUtils._brushBinsByCanvas(this.yGutterPlot.renderer.canvas, extent, subjects);
        }
    },

    _brushBinsByCanvas : function(canvas, extent, subjects) {
        var colorFn, assocColorFn;

        // set color, via style attribute, for the selected bins
        colorFn = function(d) {
            d.isSelected = ChartUtils.isSelectedWithBrush(extent, d.x, d.y);

            // track the subjects that are included in the points for the selected bins
            if (d.isSelected && d.length > 0 && d[0].data) {
                for (var i = 0; i < d.length; i++) {
                    subjects[d[i].data.subjectId] = true;
                }
            }

            // keep original color of the bin (note: uses style instead of fill attribute)
            d.origStyle = d.origStyle || this.getAttribute('style');

            return d.isSelected ? 'fill: #01BFC2;' : 'fill: #E6E6E6;';
        };

        // set color, via style attribute, for the unselected bins
        assocColorFn = function(d) {
            if (!d.isSelected && d.length > 0 && d[0].data) {
                for (var i = 0; i < d.length; i++) {
                    if (subjects[d[i].data.subjectId] === true)
                        return 'fill: #01BFC2;';
                }
            }

            return this.getAttribute('style');
        };

        canvas.selectAll('.vis-bin path')
                .attr('style', colorFn)
                .attr('style', assocColorFn)
                .attr('fill-opacity', 1)
                .attr('stroke-opacity', 1);
    },

    brushEnd : function(event, layerData, extent, plot, layerSelections, measures, properties) {

        var xExtent = [extent[0][0], extent[1][0]], yExtent = [extent[0][1], extent[1][1]],
            xMeasure, yMeasure,
            sqlFilters = [null, null, null, null],
            yMin, yMax, xMin, xMax;

        xMeasure = measures[0];
        yMeasure = measures[1];
        yMeasure.colName = properties.yaxis.colName;

        if (xMeasure) {
            xMeasure.colName = properties.xaxis.colName;
        }

        if (xMeasure && xExtent[0] !== null && xExtent[1] !== null) {
            xMin = ChartUtils.transformVal(xExtent[0], xMeasure.type, true, plot.scales.x.scale.domain());
            xMax = ChartUtils.transformVal(xExtent[1], xMeasure.type, false, plot.scales.x.scale.domain());

            // Issue 24124: With time points, brushing can create a filter that is not a whole number
            if (xMeasure.variableType == 'TIME') {
                xMin = Math.floor(xMin);
                xMax = Math.ceil(xMax);
            }

            if (xMeasure.type === 'TIMESTAMP') {
                sqlFilters[0] = LABKEY.Filter.create(xMeasure.colName, xMin.toISOString(), LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL);
                sqlFilters[1] = LABKEY.Filter.create(xMeasure.colName, xMax.toISOString(), LABKEY.Filter.Types.DATE_LESS_THAN_OR_EQUAL);
            }
            else {
                sqlFilters[0] = LABKEY.Filter.create(xMeasure.colName, xMin, LABKEY.Filter.Types.GREATER_THAN_OR_EQUAL);
                sqlFilters[1] = LABKEY.Filter.create(xMeasure.colName, xMax, LABKEY.Filter.Types.LESS_THAN_OR_EQUAL);
            }
        }

        if (yMeasure && yExtent[0] !== null && yExtent[1] !== null) {
            yMin = ChartUtils.transformVal(yExtent[0], yMeasure.type, true, plot.scales.yLeft.scale.domain());
            yMax = ChartUtils.transformVal(yExtent[1], yMeasure.type, false, plot.scales.yLeft.scale.domain());

            sqlFilters[2] = LABKEY.Filter.create(yMeasure.colName, yMin, LABKEY.Filter.Types.GREATER_THAN_OR_EQUAL);
            sqlFilters[3] = LABKEY.Filter.create(yMeasure.colName, yMax, LABKEY.Filter.Types.LESS_THAN_OR_EQUAL);
        }

        this.createSelectionFilter(sqlFilters);
    },

    brushPoints : function(event, layerData, extent, plot, layerSelections) {
        var subjects = {}; // Stash all of the selected subjects so we can highlight associated points.

        ChartUtils._brushPointsByCanvas(this.plot.renderer.canvas, extent, subjects);

        if (this.requireXGutter && Ext.isDefined(this.xGutterPlot)) {
            ChartUtils._brushPointsByCanvas(this.xGutterPlot.renderer.canvas, extent, subjects);
        }

        if (this.requireYGutter && Ext.isDefined(this.yGutterPlot)) {
            ChartUtils._brushPointsByCanvas(this.yGutterPlot.renderer.canvas, extent, subjects);
        }
    },

    _brushPointsByCanvas : function(canvas, extent, subjects) {
        canvas.selectAll('.point path')
                .attr('fill', ChartUtils.d3Bind(ChartUtils._brushPointPreFill, [extent, subjects]))
                .attr('fill', ChartUtils.d3Bind(ChartUtils._brushPointPostFill, [extent, subjects]))
                .attr('stroke', ChartUtils.d3Bind(ChartUtils._brushPointPreStroke))
                .attr('stroke', ChartUtils.d3Bind(ChartUtils._brushPointPostStroke, [extent, subjects]))
                .attr('fill-opacity', 1)
                .attr('stroke-opacity', 1);

        // Re-append the node so it is on top of all the other nodes, this way highlighted points are always visible. (issue 24076)
        canvas.selectAll('.point path[fill="' + ChartUtils.colors.SELECTED + '"]').each(function() {
            var node = this.parentNode;
            node.parentNode.appendChild(node);
        });
    },

    _brushPointPreFill : function(d, i, unknown, extent, subjects) {
        d.isSelected = ChartUtils.isSelectedWithBrush(extent, d.x, d.y);
        d.origFill = d.origFill || this.getAttribute('fill');

        if (d.isSelected) {
            subjects[d.subjectId] = true;
            return ChartUtils.colors.SELECTED;
        }

        return ChartUtils.colors.UNSELECTED;
    },

    _brushPointPostFill : function(d, i, unknown, extent, subjects) {
        if (!d.isSelected && subjects[d.subjectId] === true) {
            return ChartUtils.colors.SELECTED;
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
            return ChartUtils.colors.SELECTED;
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
            return x > xExtent[0] && x < xExtent[1] && y > yExtent[0] && y < yExtent[1];
        }
        else if (isX) { // 1D
            return x > xExtent[0] && x < xExtent[1];
        }
        else if (isY) { // 1D
            return y > yExtent[0] && y < yExtent[1];
        }

        return false;
    },

    transformVal : function(val, type, isMin, domain) {
        var trans = val;
        if (type === 'INTEGER') {
            trans = isMin ? Math.floor(val) : Math.ceil(val);
        }
        else if (type === 'TIMESTAMP') {
            trans = isMin ? new Date(Math.floor(val)) : new Date(Math.ceil(val));
        }
        else if (type === 'DOUBLE' || type === 'REAL' || type === 'FLOAT') {
            var precision, d = domain[1];

            if (d >= 1000) {
                precision = 0;
            }
            else if (d >= 100) {
                precision = 1;
            }
            else if (d >= 10) {
                precision = 2;
            }
            else {
                precision = 3;
            }

            trans = parseFloat(val.toFixed(precision));
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

    getSubjectsIn : function(callback, scope) {
        var state = Connector.getState();

        state.onMDXReady(function(mdx) {

            var filters = state.getFilters();

            var validFilters = [];

            Ext.each(filters, function(filter) {
                if (!filter.isPlot() && !filter.isGrid()) {
                    validFilters.push(filter);
                }
            });

            if (validFilters.length > 0) {

                var SUBJECT_IN = 'subjectinfilter';
                state.addPrivateSelection(validFilters, SUBJECT_IN, function() {
                    mdx.queryParticipantList({
                        useNamedFilters: [SUBJECT_IN],
                        success : function(cellset) {
                            state.removePrivateSelection(SUBJECT_IN);
                            var ids = [], pos = cellset.axes[1].positions, a=0;
                            for (; a < pos.length; a++) { ids.push(pos[a][0].name); }
                            callback.call(scope || this, ids);
                        },
                        failure : function() {
                            state.removePrivateSelection(SUBJECT_IN);
                        },
                        scope: this
                    });
                }, this);
            }
            else {
                // no filters to apply
                callback.call(scope || this, null);
            }

        }, this);
    }
});