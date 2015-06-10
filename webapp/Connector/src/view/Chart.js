/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Chart', {

    extend: 'Ext.panel.Panel',

    requires: ['Connector.model.ChartData', 'Connector.panel.AxisSelector'],

    alias: 'widget.plot',

    cls: 'chartview',

    layout: 'border',

    ui: 'custom',

    canShowHidden: false,

    binRowLimit: 5000,

    showPointsAsBin: false,

    plugins : [{
        ptype: 'messaging',
        calculateY : function(cmp, box, msg) {
            return box.y - 10;
        }
    }],

    newSelectors: false,

    constructor : function(config) {

        if (LABKEY.devMode) {
            PLOT = this;
        }

        Ext.apply(config, {
            isActiveView: true,
            refreshRequired: true,
            initialized: false
        });

        Ext.applyIf(config, {
            measures: [],
            hasStudyAxisData: false
        });

        var params = LABKEY.ActionURL.getParameters();
        if (Ext.isDefined(params['maxRows'])) {
            var num = parseInt(params['maxRows']);
            if (Ext.isNumber(num)) {
                this.binRowLimit = num;
            }
        }

        this._ready = false;
        Connector.getService('Query').getDefaultMeasure(function(measure) {
            this.defaultMeasure = measure;
            this._ready = true;
            this.fireEvent('onready', this);
        }, this);

        this.callParent([config]);

        this.addEvents('onready');

        this.labelTextColor = '#666363';
        this.labelTextHltColor = '#FFFFFF';
        this.labelBkgdColor = 'transparent';
        this.labelBkgdHltColor = '#01BFC2';
    },

    initComponent : function() {

        this.clearVisibleWindow();

        this.items = [
            this.getNorth(),
            this.getCenter(),
            this.getSouth()
        ];

        this.callParent();

        this.attachInternalListeners();

        // plugin to handle loading mask for the plot region
        this.addPlugin({
            ptype: 'loadingmask',
            beginConfig: {
                component: this,
                events: ['showload']
            },
            endConfig: {
                component: this,
                events: ['hideload']
            }
        });

        this.showmsg = true;
        this.addPlugin({
            ptype: 'messaging'
        });
    },

    /**
     * Clone safe getter of the defaultMeasure
     */
    getDefaultMeasure : function() {
        if (Ext.isObject(this.defaultMeasure)) {
            return Ext.clone(this.defaultMeasure);
        }
    },

    _initAfterRender : function() {

        Ext.create('Ext.Component', {
            id: 'noplotmessage',
            renderTo: this.body,
            cls: 'noplotmsg',
            hidden: true,
            autoEl: {
                tag: 'div',
                style: 'position: relative; width: 895px; margin-right: auto; margin-left: auto;',
                children: [{
                    tag: 'h1',
                    html: 'Choose a "y" variable and up to two more to plot at a time.'
                },{
                    tag: 'h1',
                    html: 'Make selections on the plot to subgroup and filter.',
                    style: 'color: #7a7a7a;'
                },{
                    tag: 'h1',
                    html: 'Use subgroups for further comparision.',
                    style: 'color: #b5b5b5;'
                }]
            },
            listeners: {
                afterrender : function(c) {
                    this.noplotmsg = c;
                },
                scope: this
            }
        });
    },

    onReady : function(callback, scope) {
        if (this._ready === true) {
            callback.call(scope);
        }
        else {
            this.on('onready', function() { callback.call(scope); }, this, {single: true});
        }
    },

    getNorth : function() {
        return {
            xtype: 'panel',
            region: 'north',
            height: 50,
            border: false, frame: false,
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'container',
                width: '50%',
                margin: '0 0 0 24',
                layout: {
                    type: 'hbox',
                    pack: 'start'
                },
                items: [{
                    id: 'yaxisselector',
                    xtype: 'variableselector',
                    btnCls: 'yaxisbtn',
                    model: Ext.create('Connector.model.Variable', {
                        typeLabel: 'y'
                    }),
                    listeners: {
                        requestvariable: this.onShowVariableSelection,
                        scope: this
                    }
                }]
            },{
                xtype: 'container',
                width: '50%',
                layout: {
                    type: 'hbox',
                    pack: 'end'
                },
                items: [{
                    id: 'colorselector',
                    xtype: 'colorselector',
                    btnCls: 'colorbtn',
                    model: Ext.create('Connector.model.Variable', {
                        typeLabel: 'color'
                    }),
                    listeners: {
                        afterrender : function(c) {
                            c.getEl().on('mouseover', function() { this.showWhyBinTask.delay(300); }, this);
                            c.getEl().on('mouseout', function() { this.showWhyBinTask.cancel(); }, this);
                            this.on('hideload', function() { this.showWhyBinTask.cancel(); }, this);
                        },
                        requestvariable: this.onShowVariableSelection,
                        scope: this
                    }
                }]
            }]
        };
    },

    getCenter : function() {
        if (!this.centerContainer) {
            this.centerContainer = Ext.create('Ext.container.Container', {
                region: 'center',
                layout: {
                    type: 'vbox',
                    align: 'stretch',
                    pack: 'start'
                },
                items: [{
                    xtype: 'panel',
                    border: false,
                    flex: 10,
                    cls: 'plot',
                    style: {'background-color': '#fff'},
                    listeners: {
                        afterrender: {
                            fn: function(box) {
                                this.plotEl = box.getEl();
                            },
                            single: true,
                            scope: this
                        }
                    }
                },this.getStudyAxisPanel()]
            });
        }
        return this.centerContainer;
    },

    getStudyAxisPanel : function() {
        if (!this.studyAxisPanel) {
            this.studyAxisPanel = Ext.create('Ext.panel.Panel', {
                border: false,
                overflowX: 'hidden',
                overflowY: 'auto',
                frame: false,
                items: [{
                    xtype: 'box',
                    tpl: new Ext.XTemplate('<div id="study-axis"></div>'),
                    data: {}
                }]
            });
        }

        return this.studyAxisPanel;
    },

    getSouth : function() {
        return {
            xtype: 'panel',
            region: 'south',
            height: 50,
            border: false, frame: false,
            bodyStyle: 'background: #ffffff;',
            items: [{
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    pack: 'center'
                },
                width: '100%',
                items: [{
                    id: 'xaxisselector',
                    xtype: 'variableselector',
                    btnCls: 'xaxisbtn',
                    model: Ext.create('Connector.model.Variable', {
                        typeLabel: 'x'
                    }),
                    listeners: {
                        requestvariable: this.onShowVariableSelection,
                        scope: this
                    }
                },{
                    // FOR TESTING USE (add "_showPlotData" param to URL to show button)
                    id: 'plotshowdata',
                    xtype: 'button',
                    text: 'view data',
                    style: 'left: 20px !important; top: 15px !important;',
                    hidden: LABKEY.ActionURL.getParameter('_showPlotData') ? false : true
                }]
            }]
        };
    },

    onShowVariableSelection : function() {
        this.fireEvent('hideload', this);
    },

    attachInternalListeners : function() {

        this.on('afterrender', this._initAfterRender, this, {single: true});

        this.showTask = new Ext.util.DelayedTask(function() {
            this.onReady(this.onShowGraph, this);
        }, this);
        this.resizeTask = new Ext.util.DelayedTask(function() {
            this.onReady(this.handleResize, this);
        }, this);
        this.showWhyBinTask = new Ext.util.DelayedTask(function() {
            if (this.showPointsAsBin) {
                this._showWhyBinning();
            }
        }, this);

        this.on('resize', function() {
            this.resizeTask.delay(150);
        }, this);
    },

    getPlotElements : function() {
        return Ext.DomQuery.select('.axis');
    },

    getPlotElement : function() {
        if (this.plot) {
            var el = Ext.query('#' + this.plot.renderTo);
            if (el.length > 0) {
                el = el[0];
            }
            return el;
        }
    },

    handleResize : function() {

        if (!this.isActiveView) {
            return;
        }

        var plotbox = this.plotEl.getBox();

        if (!this.initialized && !this.showNoPlot) {
            this.showNoPlot = true;
            this.noPlot();
        }

        if (!this.newSelectors && this.ywin && this.ywin.isVisible()) {
            this.updateMeasureSelection(this.ywin);
        }

        if (!this.newSelectors && this.xwin && this.xwin.isVisible()) {
            this.updateMeasureSelection(this.xwin);
        }

        if (this.plot) {
            this.plot.setSize(this.requireStudyAxis ? plotbox.width - 150 : plotbox.width, plotbox.height, true);
        }

        if (this.getStudyAxisPanel().isVisible() && this.studyAxis && this.hasStudyAxisData) {
            this.studyAxis.width(this.getStudyAxisPanel().getWidth()- 40);
            this.studyAxis.scale(this.plot.scales.x.scale);
            this.studyAxis();
        }

        var plotMsg = this.noplotmsg;
        if (plotMsg) {
            var b = plotMsg.getBox();
            var top = (plotbox.height / 2) - 53;
            var el = plotMsg.getEl();
            el.setStyle('margin-top', top + 'px');
            var estMarginRight = plotbox.width - 100 - 895;
            if (b.x < 101 && estMarginRight < 101) {
                el.setStyle('margin-left', '100px');
            }
            else {
                el.setStyle('margin-left', 'auto');
            }
        }

        this.highlightSelectedFn();
    },

    getNoPlotLayer : function() {
        return new LABKEY.vis.Layer({
            geom: new LABKEY.vis.Geom.Point({}),
            aes: {
                yLeft: function(row) {return row.y}
            }
        });
    },

    mouseOverPoints : function(event, pointData, layerSel, layerScope) {
        if (!layerScope.isBrushed) {
            this.highlightPoints(layerScope.plot, null, [pointData.subjectId.value]);
        }
    },

    mouseOutPoints : function(event, pointData, layerSel, layerScope) {
        if (!layerScope.isBrushed) {
            this.clearHighlightedData(layerScope.plot);
            this.highlightSelected(layerScope.plot);
        }
    },

    mouseOverBins : function(event, binData, layerSel, layerScope) {
        if (!layerScope.isBrushed) {
            var subjectIds = [];
            binData.forEach(function(b) {
                subjectIds.push(b.data.subjectId.value);
            });

            this.highlightBins(layerScope.plot, null, subjectIds);
        }
    },

    mouseOutBins : function(event, binData, layerSel, layerScope) {
        if(!layerScope.isBrushed) {
            this.clearHighlightedData(layerScope.plot);
            this.highlightSelected(layerScope.plot);
        }
    },

    pointHoverText : function(row) {
        var text = 'Subject: ' + row.subjectId.value, colon = ': ', linebreak = ',\n';

        if (row.xname) {
            text += linebreak + row.xname + colon + row.x;
        }

        text += linebreak + row.yname + colon + row.y;

        if (row.colorname) {
            text += linebreak + row.colorname + colon + row.color;
        }

        return text;
    },

    getLayerAes : function(layerScope, isBoxPlot) {

        var me = this;
        var layerArgs = [layerScope], slice = Array.prototype.slice;

        var mouseOverPointsFn = function() { me.mouseOverPoints.apply(me, slice.call(arguments, 0).concat(layerArgs)); };

        var mouseOutPointsFn = function() { me.mouseOutPoints.apply(me, slice.call(arguments, 0).concat(layerArgs)); };

        var mouseOverBinsFn = function() { me.mouseOverBins.apply(me, slice.call(arguments, 0).concat(layerArgs)); };

        var mouseOutBinsFn = function() { me.mouseOutBins.apply(me, slice.call(arguments, 0).concat(layerArgs)); };

        var aes = {
            mouseOverFn: this.showPointsAsBin ? mouseOverBinsFn : mouseOverPointsFn,
            mouseOutFn: this.showPointsAsBin ? mouseOutBinsFn : mouseOutPointsFn
        };

        if (isBoxPlot) {
            aes.pointHoverText = me.pointHoverText;
        }
        else {
            aes.hoverText = me.pointHoverText;
        }

        return aes;
    },

    getBinLayer : function(layerScope) {
        return new LABKEY.vis.Layer({
            geom: new LABKEY.vis.Geom.Bin({
                shape: 'square',
                colorRange: ["#E6E6E6", "#000000"],
                size: 10, // for squares you want a bigger size
                plotNullPoints: true
            }),
            aes: this.getLayerAes.call(this, layerScope, false)
        });
    },

    getPointLayer : function(layerScope) {
        return new LABKEY.vis.Layer({
            geom: new LABKEY.vis.Geom.Point({
                size: 3,
                plotNullPoints: true,
                opacity: 0.5
            }),
            aes: this.getLayerAes.call(this, layerScope, false)
        });
    },

    getBoxLayer : function(layerScope) {
        var aes = this.getLayerAes.call(this, layerScope, true);
        aes.hoverText = function(name, summary) {
            var text = name + '\n';
            text += 'Q1: ' + summary.Q1 + '\n';
            text += 'Q2: ' + summary.Q2 + '\n';
            text += 'Q3: ' + summary.Q3 + '\n';

            return text;
        };

        return new LABKEY.vis.Layer({
            geom: new LABKEY.vis.Geom.DataspaceBoxPlot({
                binSize : 3,
                binRowLimit : this.binRowLimit
            }),
            aes: aes
        });
    },

    /**
     * @param chartData
     * @param {object} [studyAxisInfo]
     * @param {boolean} [noplot=false]
     */
    initPlot : function(chartData, studyAxisInfo, noplot) {

        // Below vars needed for brush and mouse event handlers.
        var rows, properties, isBrushed = false,
            layerScope = {plot: null, isBrushed: isBrushed}, plot, layer;

        if (chartData instanceof Connector.model.ChartData) {
            rows = chartData.getDataRows();
            properties = chartData.getProperties();
        }
        else {
            rows = chartData;
        }

        if (!Ext.isBoolean(noplot)) {
            noplot = false;
        }

        if (!rows || !rows.length) {
            this.showMessage('No information available to plot.', true);
            this.fireEvent('hideload', this);
            this.plot = null;
            this.noPlot();
            return;
        }

        this.plotEl.update('');
        this.resizePlotContainers(studyAxisInfo ? studyAxisInfo.getData().length : 0);

        if (this.plot) {
            this.plot.clearGrid();
            this.plot = null;
        }

        var lastShowPointsAsBin = this.showPointsAsBin;
        if (LABKEY.devMode) {
            console.log('plotted rows:', rows.length);
        }
        this.showPointsAsBin = rows.length > this.binRowLimit;

        // only call handlers when state has changed
        if (lastShowPointsAsBin != this.showPointsAsBin) {
            if (this.showPointsAsBin) {
                this.onEnableBinning();
            }
            else {
                this.onDisableBinning();
            }
        }
        else if (this.showmsg && (chartData instanceof Connector.model.ChartData)) {
            this.showPercentOverlapMessage(chartData);
        }

        if (noplot) {
            layer = this.getNoPlotLayer();
        }
        else if (properties.xaxis && properties.xaxis.isContinuous) {
            // Scatter. Binned if over max row limit.
            layer = this.showPointsAsBin ? this.getBinLayer(layerScope) : this.getPointLayer(layerScope);
        }
        else if (properties.xaxis && !properties.xaxis.isContinuous) {
            // Box plot (aka 1D).
            layer = this.getBoxLayer(layerScope);
        }

        var box = this.plotEl.getSize(); // maintain ratio 1:1
        var scales = {};
        var numericTickFormat = function(val) {
            var s = val.toString();
            if (s.indexOf('.') > -1)
            {
                s = s.split('.');
                if (s[s.length-1].length > 2)
                {
                    s[s.length-1] = s[s.length-1].substr(0,2);
                    s = s.join('.');
                    return parseFloat(s, 10);
                }
            }
            return val;
        };
        var dateFormat = function(val) {
            // D3 converts dates to integers, so we need to convert it back to a date to get the format.
            var d = new Date(val);
            return d.toDateString();
        };

        var me = this, slice = Array.prototype.slice;

        this.highlightSelectedFn = function () {
            if (me.plot && !layerScope.isBrushed) {
                me.highlightLabels.call(me, me.plot, me.getCategoricalSelectionValues(), me.labelTextHltColor, me.labelBkgdHltColor, true);
                me.highlightSelected.call(me, me.plot);
            }
        };

        this.selectionInProgress = null;

        var xAxisClickFn = function(event, selection, t, index, y) {
            me.xAxisClick.apply(me, slice.call(arguments, 0).concat(layerScope));
        };

        var xAxisMouseOverFn = function() {
            me.xAxisMouseOver.apply(me, slice.call(arguments, 0).concat(layerScope));
        };

        var xAxisMouseOutFn = function() {
            me.xAxisMouseOut.apply(me, slice.call(arguments, 0).concat(layerScope));
        };

        if (noplot) {
            scales.x = {
                scaleType: 'continuous',
                domain: [0, 0],
                tickFormat: function() {return '';}
            };

            scales.yLeft = {
                scaleType: 'continuous',
                domain: [0, 0],
                tickFormat: function() {return '';}
            };
        }
        else {
            if (properties.xaxis.isContinuous) {
                scales.x = {
                    scaleType: 'continuous'
                };

                if (properties.xaxis.isNumeric) {
                    scales.x.tickFormat = numericTickFormat;
                }
                else if (properties.xaxis.type === 'TIMESTAMP') {
                    scales.x.tickFormat = dateFormat;
                }
            }
            else {
                scales.x = {
                    scaleType: 'discrete',
                    tickCls: 'xaxis-tick-text',
                    tickRectCls: 'xaxis-tick-rect',
                    tickClick: xAxisClickFn,
                    tickMouseOver: xAxisMouseOverFn,
                    tickMouseOut: xAxisMouseOutFn,
                    tickRectWidthOffset: 30,
                    tickRectHeightOffset: 30,
                    fontSize: 9
                };
            }

            scales.yLeft = {
                scaleType: 'continuous',
                tickFormat: numericTickFormat
            };

            if (this.measures[2]) {
                scales.color = {
                    scaleType: 'discrete',
                    range: LABKEY.vis.Scale.DataspaceColor()
                };
                scales.shape = {
                    scaleType: 'discrete',
                    range: LABKEY.vis.Scale.DataspaceShape()
                };
            }
        }

        var plotAes = {
            x: function(row) {return row.x;},
            yLeft: function(row) {return row.y}
        };

        if (this.measures[2]) {
            plotAes.color = function(row) {return row.color};
            plotAes.shape = function(row) {return row.color};
        }

        var plotConfig = {
            renderTo: this.plotEl.id,
            rendererType: 'd3',
            throwErrors: true,
            clipRect: false,
            margins: {top: 25, left: 25+43, right: 25+25, bottom: this.requireStudyAxis ? 43 : 25+43},
            width     : this.requireStudyAxis ? box.width - 150 : box.width,
            height    : box.height,
            data      : rows,
            legendPos : 'none',
            aes: plotAes,
            bgColor: '#FFFFFF', // $light-color
            gridColor: '#FFFFFF', // $light-color
            gridLineColor: '#F0F0F0', // $secondary-color
            gridLineWidth: 1.25,
            borderWidth: 2,
            borderColor: '#CCC8C8', // $heat-scale-3
            tickColor: '#FFFFFF', // $light-color
            tickTextColor: this.labelTextColor, // $heat-scale-1
            scales: scales
        };

        if (!noplot) {
            var studyAxisRange = studyAxisInfo ? studyAxisInfo.getRange() : {min: null, max: null};
            this.setScale(plotConfig.scales.x, 'x', properties, studyAxisRange);
            this.setScale(plotConfig.scales.yLeft, 'y', properties, studyAxisRange);

            // add brush handling
            var isSelectedWithBrush = function(extent, x, y) {
                var isX, isY, xExtent, yExtent, isBrushed = false;

                xExtent = [extent[0][0], extent[1][0]];
                yExtent = [extent[0][1], extent[1][1]];
                isX = xExtent[0] !== null && xExtent[1] !== null;
                isY = yExtent[0] !== null && yExtent[1] !== null;

                // Issue 20116
                if (isX && isY) { // 2D
                    isBrushed = (x > xExtent[0] && x < xExtent[1] && y > yExtent[0] && y < yExtent[1]);
                }
                else if (isX) { // 1D
                    isBrushed = (x > xExtent[0] && x < xExtent[1]);
                }
                else if (isY) { // 1D
                    isBrushed = (y > yExtent[0] && y < yExtent[1]);
                }

                return isBrushed;
            };

            var brushPoints = function(event, layerData, extent, plot, layerSelections) {
                var sel = layerSelections[0]; // We only have one layer, so grab the first one.
                var subjects = {}; // Stash all of the selected subjects so we can highlight associated points.
                var colorFn, strokeFn;
                var assocColorFn, assocStrokeFn;

                colorFn = function(d) {
                    d.isSelected = isSelectedWithBrush(extent, d.x, d.y);
                    d.origFill = d.origFill || this.getAttribute('fill');

                    if (d.isSelected) {
                        subjects[d.subjectId.value] = true;
                        return '#01BFC2';
                    }

                    return '#E6E6E6';
                };

                strokeFn = function(d) {
                    d.origStroke = d.origStroke || this.getAttribute('stroke');

                    if (d.isSelected) {
                        return '#01BFC2';
                    }
                    return '#E6E6E6';
                };

                // These 'assoc' color/stroke functions rely on the prior complete iteration on the data points
                // to set the subjects {} correctly. This is why these functions are not merged.
                assocColorFn = function(d) {
                    if (!d.isSelected && subjects[d.subjectId.value] === true) {
                        return '#01BFC2';
                    }
                    return this.getAttribute('fill');
                };

                assocStrokeFn = function(d) {
                    if (!d.isSelected && subjects[d.subjectId.value] === true) {
                        return '#01BFC2';
                    }
                    return this.getAttribute('stroke');
                };

                sel.selectAll('.point path')
                        .attr('fill', colorFn)
                        .attr('fill', assocColorFn)
                        .attr('stroke', strokeFn)
                        .attr('stroke', assocStrokeFn)
                        .attr('fill-opacity', 1)
                        .attr('stroke-opacity', 1);
            };

            var brushBins = function(event, layerData, extent, plot, layerSelections) {
                var sel = layerSelections[0]; // We only have one layer, so grab the first one.
                var subjects = {}; // Stash all of the selected subjects so we can highlight associated points.
                var colorFn, assocColorFn, min, max;

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

                // set color, via style attribute, for the selected bins
                colorFn = function(d) {
                    d.isSelected = isSelectedWithBrush(extent, d.x, d.y);

                    // track the subjects that are included in the points for the selected bins
                    if (d.isSelected && d.length > 0 && d[0].data) {
                        for (var i = 0; i < d.length; i++) {
                            subjects[d[i].data.subjectId.value] = true;
                        }
                    }

                    // keep original color of the bin (note: uses style instead of fill attribute)
                    d.origStyle = d.origStyle || this.getAttribute('style');

                    return d.isSelected ? 'fill: #01BFC2;' : 'fill: #E6E6E6;';
                };
                sel.selectAll('.vis-bin path').attr('style', colorFn);

                // set color, via style attribute, for the unselected bins
                assocColorFn = function(d) {
                    if (!d.isSelected && d.length > 0 && d[0].data) {
                        for (var i = 0; i < d.length; i++) {
                            if (subjects[d[i].data.subjectId.value] === true)
                                return 'fill: #01BFC2;';
                        }
                    }

                    return this.getAttribute('style');
                };

                sel.selectAll('.vis-bin path').attr('style', assocColorFn)
                        .attr('fill-opacity', 1)
                        .attr('stroke-opacity', 1);
            };

            plotConfig.brushing = {
                dimension: properties.xaxis.isContinuous ? 'both' : 'y',
                brushstart : function() {
                    me.clearHighlightedData(layerScope.plot);
                    me.clearHighlightLabels(layerScope.plot);
                    layerScope.isBrushed = true;
                },
                brush : this.showPointsAsBin ? brushBins : brushPoints,
                brushend : function(event, layerData, extent, plot/*, layerSelections*/) {
                    var xExtent = [extent[0][0], extent[1][0]], yExtent = [extent[0][1], extent[1][1]],
                            xMeasure, yMeasure, sqlFilters = [null, null, null, null], yMin, yMax, xMin, xMax;

                    var transformVal = function(val, type, isMin, domain) {
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
                    };

                    xMeasure = measures[0];
                    yMeasure = measures[1];
                    yMeasure.colName = properties.yaxis.colName;

                    if (xMeasure) {
                        xMeasure.colName = properties.xaxis.colName;
                    }

                    if (xMeasure && xExtent[0] !== null && xExtent[1] !== null) {
                        xMin = transformVal(xExtent[0], xMeasure.type, true, plot.scales.x.scale.domain());
                        xMax = transformVal(xExtent[1], xMeasure.type, false, plot.scales.x.scale.domain());

                        if (xMeasure.name.toLowerCase().indexOf("protocolday") > -1) {
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
                        yMin = transformVal(yExtent[0], yMeasure.type, true, plot.scales.yLeft.scale.domain());
                        yMax = transformVal(yExtent[1], yMeasure.type, false, plot.scales.yLeft.scale.domain());

                        sqlFilters[2] = LABKEY.Filter.create(yMeasure.colName, yMin, LABKEY.Filter.Types.GREATER_THAN_OR_EQUAL);
                        sqlFilters[3] = LABKEY.Filter.create(yMeasure.colName, yMax, LABKEY.Filter.Types.LESS_THAN_OR_EQUAL);
                    }

                    // plot brushing filters need to include the antigen selection if this is a pivoted query
                    if (requiresPivot && xMeasure.options.antigen.name == yMeasure.options.antigen.name)
                    {
                        var antigenAlias = Connector.model.Antigen.getAntigenAlias(yMeasure);
                        var antigens = xMeasure.options.antigen.values.concat(yMeasure.options.antigen.values);
                        //TODO: sqlFilters.push(LABKEY.Filter.create(antigenAlias, antigens, LABKEY.Filter.Types.IN));
                    }

                    me.createSelectionFilter(sqlFilters);
                },
                brushclear : function(event, allData, plot, selections) {
                    layerScope.isBrushed = false;
                    Connector.getState().clearSelections(true);

                    // reset points
                    selections[0].selectAll('.point path')
                            .attr('fill', function(d) { return d.origFill })
                            .attr('stroke', function(d) { return d.origStroke })
                            .attr('fill-opacity', 0.5).attr('stroke-opacity', 0.5);

                    // reset bins
                    selections[0].selectAll('.vis-bin path')
                            .attr('style', function(d) { return d.origStyle })
                            .attr('fill-opacity', 1).attr('stroke-opacity', 1);
                }
            };

            this.clickTask = new Ext.util.DelayedTask(function(node, view, name, target, multi) {
                if(layerScope.isBrushed)
                    view.plot.clearBrush();
                this.runXAxisSelectAnimation(node, view, name, target, multi);
            }, this);

            this.highlightSelectedFn();
        }

        this.plot = new LABKEY.vis.Plot(plotConfig);
        layerScope.plot = this.plot; // hoisted for mouseover/mouseout event listeners
        var me = this;
        var measures = this.measures; // hoisted for brushend.
        var requiresPivot = Connector.model.ChartData.requiresPivot(this.measures[0], this.measures[1]); // hoisted for brushend.

        if (this.plot) {
            this.plot.addLayer(layer);
            try {
                this.noplotmsg.hide();
                this.plot.render();
                if (!noplot && this.measures[2]) {
                    var colorSelector = Ext.getCmp('colorselector');
                    colorSelector.setLegend(this.plot.getLegendData());
                }
            }
            catch(err) {
                this.showMessage(err.message, true);
                this.fireEvent('hideload', this);
                this.plot = null;
                this.plotEl.update('');
                this.noPlot();
                console.error(err);
                console.error(err.stack);
                return;
            }
        }

        this.fireEvent('hideload', this);
    },

    xAxisClick : function(e, selection, target, index, y, layerScope) {
        // selectionInProgress keeps label highlighted while selection created
        this.selectionInProgress = target;

        var multi = e.ctrlKey||e.shiftKey||(e.metaKey);
        // node is needed for animation
        if (layerScope.plot.renderer)
        {
            var nodes = layerScope.plot.renderer.canvas.selectAll('.tick-text text');
            var node = null;
            nodes[0].forEach(function (n)
            {
                if (n.innerHTML === target)
                    node = n;
            });

            if (node)
                this.clickTask.delay(150, null, null, [node, this, this.measures[0].alias, target, multi]);
            else
                this.clickTask.delay(150, null, null, [e.target, this, this.measures[0].alias, target, multi]);

            this.showMessage('Hold Shift, CTRL, or CMD to select multiple');
        }
    },

    xAxisMouseOut : function (target, index, y, layerScope) {
        // Do not do mouse over/out for selected labels or labels in process of selection
        if (!layerScope.isBrushed && !this.isSelection(target) && this.selectionInProgress != target) {
            // Clear plot highlights
            this.clearHighlightedData(layerScope.plot);
            this.highlightSelected(layerScope.plot);

            // Clear label highlighting
            var targets = [];
            targets.push(target);
            this.highlightLabels.call(this, this.plot, targets, this.labelTextColor, this.labelBkgdColor, false);
        }
    },

    xAxisMouseOver : function(target, index, y, layerScope) {
        // Do not do mouse over/out for selected labels or labels in process of selection
        if (!layerScope.isBrushed && !this.isSelection(target) && this.selectionInProgress != target) {
            // Plot highlights
            if(this.showPointsAsBin)
                this.highlightBins(this.plot, target);
            else
                this.highlightPoints(this.plot, target);

            // Highlight label
            var targets = [];
            targets.push(target);
            this.highlightLabels.call(this, this.plot, targets, this.labelTextColor, this.labelBkgdHltColor, false);
        }
    },



retrieveBinSubjectIds : function (plot, target, subjects) {
        var subjectIds = [];
        if(subjects) {
            subjects.forEach(function(s) {
                subjectIds.push(s);
            });
        }

        if (plot.renderer)
        {
            var bins = plot.renderer.canvas.selectAll('.vis-bin path');
            var selections = this.getCategoricalSelectionValues();

            bins.each(function (d)
            {
                // Check if value matches target or another selection
                for (var i = 0; i < d.length; i++)
                {
                    var data = d[i].data;
                    if (data.x === target && subjectIds.indexOf(data.subjectId.value) === -1)
                    {
                        subjectIds.push(data.subjectId.value);
                    }
                    else if (selections.indexOf(data.x) != -1 && subjectIds.indexOf(data.subjectId.value) === -1)
                    {
                        subjectIds.push(data.subjectId.value);
                    }
                }
            });
        }

        return subjectIds;
    },

    highlightBins : function (plot, target, subjects) {
        // get the set of subjectIds in the binData
        var subjectIds = this.retrieveBinSubjectIds(plot, target, subjects);
        if(subjects) {
            subjects.forEach(function(s) {
                subjectIds.push(s);
            });
        }

        if (plot.renderer)
        {
            var isSubjectInMouseBin = function (d, yesVal, noVal)
            {
                if (d.length > 0 && d[0].data)
                {
                    for (var i = 0; i < d.length; i++)
                    {
                        if (subjectIds.indexOf(d[i].data.subjectId.value) != -1)
                        //if (subjects[d[i].data.subjectId.value] === true)
                            return yesVal;
                    }
                }

                return noVal;
            };

            var colorFn = function (d)
            {
                // keep original color of the bin (note: uses style instead of fill attribute)
                d.origStyle = d.origStyle || this.getAttribute('style');

                return isSubjectInMouseBin(d, 'fill: #01BFC2', d.origStyle);
            };

            var opacityFn = function (d)
            {
                return isSubjectInMouseBin(d, 1, 0.15);
            };

            plot.renderer.canvas.selectAll('.vis-bin path')
                    .attr('style', colorFn)
                    .attr('fill-opacity', opacityFn)
                    .attr('stroke-opacity', opacityFn);
        }
    },

    clearHighlightBins : function (plot) {
        plot.renderer.canvas.selectAll('.vis-bin path')
                .attr('style', function(d) { return d.origStyle })
                .attr('fill-opacity', 1).attr('stroke-opacity', 1);
    },

    clearHighlightedData : function (plot) {
        if(this.showPointsAsBin)
            this.clearHighlightBins(plot);
        else
            this.clearHighlightPoints(plot);
    },

    retrievePointSubjectIds : function(plot, target, subjects) {
        var subjectIds = [];
        if(subjects) {
            subjects.forEach(function(s) {
                subjectIds.push(s);
            });
        }

        if (plot.renderer)
        {
            var points = plot.renderer.canvas.selectAll('.point path');
            var selections = this.getCategoricalSelectionValues();

            points.each(function (d)
            {
                // Check if value matches target or another selection
                if (d.x === target && subjectIds.indexOf(d.subjectId.value) === -1)
                {
                    subjectIds.push(d.subjectId.value);
                }
                else if (selections.indexOf(d.x) != -1 && subjectIds.indexOf(d.subjectId.value) === -1)
                {
                    subjectIds.push(d.subjectId.value);
                }
            });
        }

        return subjectIds;
    },

    highlightPoints : function (plot, target, subjects) {
        var subjectIds = this.retrievePointSubjectIds(plot, target, subjects);

        var strokeFillFn = function(d) {
            if (subjectIds.indexOf(d.subjectId.value) != -1) {
                return '#01BFC2';
            }
            return '#E6E6E6';
        };

        if (plot.renderer)
        {
            var points = plot.renderer.canvas.selectAll('.point path');

            points.attr('fill', strokeFillFn)
                    .attr('stroke', strokeFillFn)
                    .attr('fill-opacity', 1)
                    .attr('stroke-opacity', 1);

            points.each(function (d)
            {
                // Re-append the node so it is on top of all the other nodes, this way highlighted points
                // are always visible.
                var node = this.parentNode;
                if (subjectIds.indexOf(d.subjectId.value) != -1)
                {
                    node.parentNode.appendChild(node);
                }
            });
        }
    },

    clearHighlightPoints : function (plot) {
        var colorFn, colorScale = null, colorAcc = null;

        if (plot.scales.color && plot.scales.color.scale) {
            colorScale = plot.scales.color.scale;
            colorAcc = plot.aes.color;
        }

        colorFn = function(d) {
            if (colorScale && colorAcc) {
                return colorScale(colorAcc.getValue(d));
            }

            return '#000000';
        };

        if (plot.renderer) {
            plot.renderer.canvas.selectAll('.point path').attr('fill', colorFn)
                    .attr('stroke', colorFn)
                    .attr('fill-opacity', 0.5)
                    .attr('stroke-opacity', 0.5);
        }
    },

    highlightSelected : function (plot) {
        var targets = this.getCategoricalSelectionValues(), me = this;
        if (targets.length < 1) {
            me.clearHighlightedData(plot);
        }

        targets.forEach(function(t) {
            if(me.showPointsAsBin)
                me.highlightBins(plot, t);
            else
                me.highlightPoints(plot, t);
        })
    },

    getCategoricalSelectionValues : function () {
        var selections = Connector.getState().getSelections();
        var values = [];
        selections.forEach(function(s) {
            var gridData = s.get('gridFilter');
            if (gridData.length > 0 && Ext.isString(gridData[0].getValue())) {
                values = gridData[0].getValue().split(';');
            }
        });

        return values;
    },

    isSelection : function (target) {
        var values = this.getCategoricalSelectionValues();
        var found = false;
        values.forEach(function(t) {
            if(t === target)
                found = true;
        });

        return found;
    },

    clearHighlightLabels : function(plot) {
        var me = this;
        var tickFillFn = function(t) {
            return me.labelBkgdColor;
        };

        var labelFillFn = function(t) {
            return me.labelTextColor;
        };

        if (plot.renderer) {
            plot.renderer.canvas.selectAll('.tick-text rect.highlight').attr('fill', tickFillFn);
            plot.renderer.canvas.selectAll('.tick-text text').attr('fill', labelFillFn);
        }
    },

    highlightLabels : function(plot, targets, textColor, bkgdColor, clearOthers) {

        var me = this;

        if (targets.length < 1)
            this.clearHighlightLabels(plot);

        targets.forEach(function(target) {
            var tickFillFn = function(t) {
                if (target === t)
                    return bkgdColor;

                if (clearOthers && targets.indexOf(t) === -1)
                    return me.labelBkgdColor;
                else
                    return this.getAttribute("fill");
            };

            var labelFillFn = function(t) {
                if (target === t)
                    return textColor;

                if (clearOthers && targets.indexOf(t) === -1)
                    return me.labelTextColor;
                else
                    return this.getAttribute("fill");

            };

            if (plot.renderer) {
                var ticks = plot.renderer.canvas.selectAll('.tick-text rect.highlight');
                ticks.attr('fill', tickFillFn);

                var label = plot.renderer.canvas.selectAll('.tick-text text');
                label.attr('fill', labelFillFn);
            }
        });
    },

    runXAxisSelectAnimation : function(node, view, name, target, multi) {

        this.allowHover = false;

        Animation.floatTo(node, '', ['.selectionpanel', '.filterpanel'], 'span', 'selected', function(node, view, name, target, multi) {
            this.allowHover = true;
            this.afterSelectionAnimation(node, view, name, target, multi);
        }, this, [node, view, name, target, multi]);
    },

    /**
     * @param {Array} sqlFilters
     * @param {Boolean} [allowInverseFilter=false]
     */
    createSelectionFilter : function(sqlFilters, allowInverseFilter) {
        var xMeasure = this.measures[0], yMeasure = this.measures[1];
        var wrapped = [ this._getAxisWrappedMeasure(xMeasure), this._getAxisWrappedMeasure(yMeasure) ];

        var filter = Ext.create('Connector.model.Filter', {
            gridFilter: sqlFilters,
            plotMeasures: wrapped,
            hierarchy: 'Subject',
            isPlot: true,
            isGrid: true,
            operator: LABKEY.app.model.Filter.OperatorTypes.OR,
            filterSource: 'GETDATA',
            isWhereFilter: true,
            showInverseFilter: allowInverseFilter === true
        });

        Connector.getState().addSelection([filter], true, false, true);
    },

    afterSelectionAnimation : function(node, view, name, target, multi) {
        var sqlFilters = [null, null, null, null];
        var values = "";
        var selections = Connector.getState().getSelections();
        var data;

        if (multi) {
            for (var i=0; i < selections.length; i++) {
                data = selections[i].get('gridFilter')[0];
                if (data.getColumnName() === name) {
                    values = values.concat(data.getValue());
                    values = values.concat(';');
                }
            }
        }
        values = values.concat(target);

        if (multi && selections.length > 0)
            sqlFilters[0] = LABKEY.Filter.create(name, values, LABKEY.Filter.Types.EQUALS_ONE_OF);
        else
            sqlFilters[0] = LABKEY.Filter.create(name, values, LABKEY.Filter.Types.EQUAL);

        this.createSelectionFilter(sqlFilters, true);
        this.selectionInProgress = null;
        this.highlightLabels(this.plot, this.getCategoricalSelectionValues(), this.labelTextHltColor, this.labelBkgdHltColor, false);

    },

    getScale : function(axis) {
        var scale = 'linear';
        if (axis == 'y' && this.axisPanelY) {
            scale = this.axisPanelY.getScale();
        }
        else if (axis == 'x' && this.axisPanelX) {
            scale = this.axisPanelX.getScale();
        }

        return scale;
    },

    setScale : function(scale, axis, properties, studyAxisRange) {
        // This function should likely be renamed, and refactored so it has less side-effects.
        if (scale.scaleType !== 'discrete') {
            var axisValue = this.getScale(axis), allowLog = (axis == 'y') ? !properties.setYLinear : !properties.setXLinear;

            if (!allowLog && axisValue == 'log') {
                this.showMessage('Displaying the ' + axis.toLowerCase() + '-axis on a linear scale due to the presence of invalid log values.', true);
                axisValue = 'linear';
            }

            // issue 21300: set x-axis domain min/max based on study axis milestones if they exist
            var min = null, max = null;
            if (axis == 'x' && studyAxisRange.min != null) {
                min = studyAxisRange.min < 0 ? studyAxisRange.min : 0;
            }
            if (axis == 'x' && studyAxisRange.max != null) {
                max = studyAxisRange.max > 0 ? studyAxisRange.max : 0;
            }

            Ext.apply(scale, {
                trans : axisValue,
                domain: [min, max]
            });
        }

        return scale;
    },

    getActiveMeasures : function() {
        this.fromFilter = false;
        var sel, measures = {
            x: null,
            y: null,
            color: null
        };

        // first, check the set of active filters
        var filters = Connector.getState().getFilters();

        var m, x, y, color;
        Ext.each(filters, function(filter) {
            if (filter.isPlot() === true && filter.isGrid() === false) {
                m = filter.get('plotMeasures'); x = m[0]; y = m[1]; color = m[2];

                if (x) {
                    measures.x = x.measure;
                }

                if (y) {
                    measures.y = y.measure;
                }

                if (color) {
                    measures.color = color.measure;
                }

                this.fromFilter = true;

                return false;
            }
        }, this);

        // second check the measure selections
        if (this.newSelectors) {
            if (this.activeXSelection) {
                measures.x = this.activeXSelection;

                // special case to look for userGroups as a variable option to use as filter values for the x measure
                // and to user antigen filters for categorical x-axis which matches the antigen field
                if (measures.x.options.userGroups)
                    measures.x.values = measures.x.options.userGroups;
                else if (measures.x.options.antigen && measures.x.options.antigen.name == measures.x.name)
                    measures.x.values = measures.x.options.antigen.values;

                this.fromFilter = false;
            }
            if (this.activeYSelection) {
                measures.y = this.activeYSelection;
                this.fromFilter = false;
            }
            if (this.activeColorSelection) {
                measures.color = this.activeColorSelection;
                this.fromFilter = false;
            }
        }
        else {
            if (this.axisPanelX) {
                sel = this.axisPanelX.getSelection();
                if (sel && sel.length > 0) {
                    measures.x = sel[0].data;
                    measures.x.options = this.axisPanelX.getVariableOptionValues();

                    // special case to look for userGroups as a variable option to use as filter values for the x measure
                    // and to user antigen filters for categorical x-axis which matches the antigen field
                    if (measures.x.options.userGroups)
                        measures.x.values = measures.x.options.userGroups;
                    else if (measures.x.options.antigen && measures.x.options.antigen.name == measures.x.name)
                        measures.x.values = measures.x.options.antigen.values;

                    this.fromFilter = false;
                }
            }
            if (this.axisPanelY) {
                sel = this.axisPanelY.getSelection();
                if (sel && sel.length > 0) {
                    measures.y = sel[0].data;
                    measures.y.options = this.axisPanelY.getVariableOptionValues();
                    this.fromFilter = false;
                }
            }
            if (this.colorPanel) {
                sel = this.colorPanel.getSelection();
                if (sel && sel.length > 0) {
                    measures.color = sel[0].data;
                    this.fromFilter = false;
                }
            }
        }

        // map the y-axis schema and query name for a time point x-axis variable
        if (measures.x && measures.y && (!measures.x.schemaName && !measures.x.queryName)) {
            x = Ext.clone(measures.x);
            x.schemaName = measures.y.schemaName;
            x.queryName = measures.y.queryName;
            measures.x = x;
        }

        // issue 20526: if color variable from different dataset, do left join so as not to get null x - null y datapoints
        if (measures.color != null && measures.y != null && measures.x != null) {
            measures.color.requireLeftJoin =
                    (measures.color.schemaName == measures.y.schemaName && measures.color.queryName == measures.y.queryName) ||
                    (measures.color.schemaName == measures.x.schemaName && measures.color.queryName == measures.x.queryName);
        }

        if (this.fromFilter) {
            this.activeXSelection = measures.x;
            this.activeYSelection = measures.y;
            this.activeColorSelection = measures.color;
        }

        return measures;
    },

    onShowGraph : function() {
        this.refreshRequired = false;

        var activeMeasures = this.getActiveMeasures();

        this.fireEvent('axisselect', this, 'y', [ activeMeasures.y ]);
        this.fireEvent('axisselect', this, 'x', [ activeMeasures.x ]);
        this.fireEvent('axisselect', this, 'color', [activeMeasures.color]);

        if (this.filterClear) {
            if (this.axisPanelY) {
                this.axisPanelY.clearSelection();
                Ext.getCmp('yaxisselector').clearModel();
            }

            if (this.axisPanelX) {
                this.axisPanelX.clearSelection();
                Ext.getCmp('xaxisselector').clearModel();
            }

            if (this.colorPanel) {
                this.colorPanel.clearSelection();
                Ext.getCmp('colorselector').clearModel();
            }
        }

        if (this.filterClear || activeMeasures.y == null) {
            this.hideMessage();
            this.requireStudyAxis = false;
            this.getStudyAxisPanel().setVisible(false);
            Connector.getState().clearSelections(true);
            this.filterClear = false;
            this.noPlot();
        }
        else {
            this.measures = [ activeMeasures.x, activeMeasures.y, activeMeasures.color ];

            this.fireEvent('showload', this);

            this.requireStudyAxis = activeMeasures.x !== null && activeMeasures.x.variableType === "TIME";

            // TODO: We only want to update the 'In the plot' filter when any of the (x, y, color) measure configurations change
            if (!this.fromFilter && activeMeasures.y !== null) {
                this.updatePlotBasedFilter(activeMeasures);
            }
            else {
                this.initialized = true;
            }

            this.requestChartData(activeMeasures);
        }
    },

    getWrappedMeasures : function(activeMeasures, requiresPivot) {

        var wrappedMeasures = [
            this._getAxisWrappedMeasure(activeMeasures.x, requiresPivot),
            this._getAxisWrappedMeasure(activeMeasures.y, requiresPivot)
        ];
        wrappedMeasures.push(activeMeasures.color ? {measure : activeMeasures.color, time: 'date'} : null);

        return wrappedMeasures;
    },

    _getAxisWrappedMeasure : function(measure, requiresPivot) {
        if (!measure) {
            return null;
        }

        var options = measure.options;
        var wrappedMeasure = {measure : measure, time: 'date'};

        var isVisitTagAlignment = options && options.alignmentVisitTag !== undefined;
        var hasAntigens = options && options.antigen !== undefined;

        if (isVisitTagAlignment)
        {
            var interval = measure.alias;
            measure.interval = interval;
            wrappedMeasure.dateOptions = {
                interval: interval,
                zeroDayVisitTag: options.alignmentVisitTag
            };
        }
        else if (requiresPivot && hasAntigens)
        {
            wrappedMeasure.measure.aggregate = "MAX";
            wrappedMeasure.dimension = this.getDimension();
        }

        // we still respect the value if it is set explicitly on the measure
        if (!Ext.isDefined(wrappedMeasure.measure.inNotNullSet)) {
            wrappedMeasure.measure.inNotNullSet = Connector.model.ChartData.isContinuousMeasure(measure);
        }

        return wrappedMeasure;
    },

    getMeasureSet : function(activeMeasures, includeFilterMeasures) {
        var measures = [{
            measure: this.getDefaultMeasure(),
            time: 'date'
        }];

        var requiresPivot = Connector.model.ChartData.requiresPivot(activeMeasures.x, activeMeasures.y);

        // add "additional" measures (ex. selecting subset of antigens/analytes to plot for an assay result)
        var additionalMeasures = this.getAdditionalMeasures(activeMeasures, requiresPivot);

        var wrappedMeasures = this.getWrappedMeasures(activeMeasures, requiresPivot);

        var nonNullMeasures = [];
        for (var i =0; i < wrappedMeasures.length; i++) {
            if (wrappedMeasures[i]) {
                nonNullMeasures.push(wrappedMeasures[i]);
            }
        }

        var _measures = measures.concat(nonNullMeasures.concat(additionalMeasures));

        // set of measures from data filters
        if (includeFilterMeasures) {
            var filterMeasures = Connector.getService('Query').getWhereFilterMeasures(Connector.getState().getFilters());

            if (!Ext.isEmpty(filterMeasures)) {
                _measures = _measures.concat(filterMeasures);
            }
        }

        return {
            measures: this.mergeMeasures(_measures),
            wrapped: wrappedMeasures
        };
    },

    /**
     * This method takes in a set of measures and groups them according to alias. It will merge the filters and
     * retain any other properties from the first instance of an alias found.
     * @param measures
     * @returns {Array}
     */
    mergeMeasures : function(measures) {
        var merged = [], keyOrder = [], aliases = {}, alias;

        Ext.each(measures, function(measure) {
            alias = (measure.measure.alias || measure.measure.name).toLowerCase();
            if (!aliases[alias]) {
                aliases[alias] = measure;
                keyOrder.push(alias);
            }
            else {
                if (!Ext.isEmpty(measure.filterArray)) {

                    if (!Ext.isArray(aliases[alias].filterArray)) {
                        aliases[alias].filterArray = [];
                    }

                    aliases[alias].filterArray = aliases[alias].filterArray.concat(measure.filterArray);
                    aliases[alias].measure.hasFilters = true;
                }
            }
        });

        Ext.each(keyOrder, function(key) {
            merged.push(aliases[key]);
        });

        return merged;
    },

    /**
     * This creates a temp query via getData which is then used to query for unique participants, and is also what
     * we use to back the chart data (via selectRows on the temp query).
     * @param activeMeasures
     */
    requestChartData : function(activeMeasures) {
        this.getSubjectsIn(function(ptidList) {
            var measures = this.getMeasureSet(activeMeasures, true /* Include any measures declared in filters */).measures;

            this.applyFiltersToMeasure(measures, ptidList);

            // Request Chart Data
            Connector.getService('Query').getData(measures, function(json) {
                this.selectChartData(json);
            }, this.onFailure, this);
        });
    },

    selectChartData : function(getDataResponse) {
        var config = {
            schemaName: getDataResponse.schemaName,
            queryName: getDataResponse.queryName,
            success: function(response) { this.onChartDataSuccess(response, getDataResponse); },
            failure: this.onFailure,
            requiredVersion: '9.1',
            scope: this
        };

        LABKEY.Query.selectRows(config);
    },

    onChartDataSuccess : function(selectRowsResponse, getDataResponse) {
        if (this.isActiveView) {
            this.dataQWP = {schema: selectRowsResponse.schemaName, query: selectRowsResponse.queryName};

            selectRowsResponse.measures = this.measures;
            selectRowsResponse.measureToColumn = getDataResponse.measureToColumn;
            selectRowsResponse.columnAliases = getDataResponse.columnAliases;
            var chartData = Ext.create('Connector.model.ChartData', selectRowsResponse);

            this.hasStudyAxisData = false;

            if (this.requireStudyAxis) {
                this.requestStudyAxisData(chartData);
            }
            else {
                this.initPlot(chartData);
            }
        }
    },

    onEnableBinning : function() {

        // Disable the color axis selector
        Ext.getCmp('colorselector').disable();

        // Show binning message
        var msgKey = 'PLOTBIN_LIMIT';
        var learnId = Ext.id(), dismissId = Ext.id();
        var msg = 'Heatmap enabled, color disabled.&nbsp;<a id="' + learnId +'">Learn why</a>&nbsp;<a id="' + dismissId +'">Dismiss</a>';

        var shown = this.sessionMessage(msgKey, msg, true);

        if (shown) {
            var el = Ext.get(dismissId);
            if (el) {
                el.on('click', function() {
                    this.showmsg = true; this.hideMessage();
                    Connector.getService('Messaging').block(msgKey);
                }, this, {single: true});
            }

            el = Ext.get(learnId);
            if (el) {
                el.on('click', function() { this.showWhyBinTask.delay(0); }, this);
            }
        }
    },

    /**
     * Shows the description of why the heatmap is enabled, color disabled
     * Do not call this function directly, use this.showWhyBinTask.delay(ms) instead.
     * @private
     */
    _showWhyBinning : function() {
        if (!this.showWhyBin) {
            this.showWhyBin = true;
            var limit = Ext.util.Format.number(this.binRowLimit, '0,000'),
                    calloutMgr = hopscotch.getCalloutManager(),
                    _id = Ext.id();

            calloutMgr.createCallout({
                id: _id,
                target: Ext.getCmp('colorselector').getActiveButton().getEl().dom,
                placement: 'bottom',
                title: 'Heatmap mode',
                xOffset: -240, // assumes width of 280,
                arrowOffset: 235,
                content: 'When the plot has over ' + limit + ' points heatmap mode is automatically enabled to maximize performance. The color variable is disabled until active filters show less than ' + limit + ' points in the plot.'
                // If the user explcitly closes the tip, then don't ever show it again.
                //onClose : function() {
                //    me.showWhyBin = false;
                //}
            });
            this.showmsg = true; this.hideMessage();

            this.on('hideload', function() {
                calloutMgr.removeCallout(_id);
                this.showWhyBin = false;
            }, this, {single: true});
        }
    },

    onDisableBinning : function() {

        // Enable the color axis selector
        Ext.getCmp('colorselector').enable();
    },

    showPercentOverlapMessage : function(chartData) {
        if (chartData.getPercentOverlap() < 1 && chartData.getProperties().xaxis.isContinuous) {
            var msgKey = 'PEROVER_LIMIT';
            var id = Ext.id(),
                    id2 = Ext.id(),
                    msg = 'Points outside the plotting area have no match on the other axis.&nbsp;<a id="' + id +'">Got it</a>&nbsp;<a id="' + id2 +'">Details</a>';

            var shown = this.sessionMessage(msgKey, msg, true);

            if (shown) {
                var tpl = new Ext.XTemplate(
                    '<div class="matchtip">',
                        '<div>',
                            '<p class="tiptitle">Plotting Matches</p>',
                            '<p class="tiptext">Percent match: {overlap}%. Mismatches may be due to data point subject, visit, or assay antigen.</p>',
                        '</div>',
                    '</div>'
                );

                var el = Ext.get(id);
                el.on('click', function() {
                    this.showmsg = true; this.hideMessage();
                    Connector.getService('Messaging').block(msgKey);
                }, this, {single: true});

                el = Ext.get(id2);
                if (el) {
                    Ext.create('Ext.tip.ToolTip', {
                        target: el,
                        anchor: 'left',
                        data: { overlap: Ext.util.Format.round(chartData.getPercentOverlap() * 100, 2) },
                        tpl: tpl,
                        autoHide: true,
                        mouseOffset: [15,0],
                        maxWidth: 500,
                        minWidth: 200,
                        bodyPadding: 0,
                        padding: 0
                    });
                }
            }
        }
    },

    getDimension : function() {
        // NOTE: only used when plotting antigens from the same source against each other
        // so we can assume that the x and y axis measures are the same schema, query, colName
        var x = this.measures[0], y = this.measures[1];

        var schema = x.schemaName || y.schemaName;
        var query = x.queryName || y.queryName;

        var xAntigen = x.options.antigen;
        var yAntigen = y.options.antigen;

        var colName = xAntigen != undefined ? xAntigen.name : yAntigen.name;

        var values = xAntigen != undefined ? xAntigen.values : [];
        if (yAntigen != undefined)
            values = values.concat(yAntigen.values);

        return {
            schemaName: schema,
            queryName: query,
            name: colName,
            values: values
        };
    },

    getAdditionalMeasures : function(activeMeasures, requiresPivot) {
        // map key to schema, query, name, and values
        var measuresMap = {}, additionalMeasuresArr = [];

        Ext.each(['x', 'y'], function(axis) {
            var schema, query, name;
            if (activeMeasures[axis])
            {
                schema = activeMeasures[axis].schemaName;
                query = activeMeasures[axis].queryName;

                if (!requiresPivot && activeMeasures[axis].options && activeMeasures[axis].options.antigen) {
                    name = activeMeasures[axis].options.antigen.name;
                    var values = activeMeasures[axis].options.antigen.values;
                    this.addValuesToMeasureMap(measuresMap, schema, query, name, values);
                }
                else {
                    // A time-based X-measure also requires the Visit column be selected
                    if (activeMeasures[axis].variableType === "TIME") {
                        name = "Visit";
                        this.addValuesToMeasureMap(measuresMap, schema, query, name, []);
                    }
                }
            }
        }, this);

        Ext.iterate(measuresMap, function(k, m) {
            additionalMeasuresArr.push({
                measure: {
                    name: m.name,
                    queryName: m.queryName,
                    schemaName: m.schemaName,
                    values: m.values
                },
                time: 'date'
            });
        });

        return additionalMeasuresArr;
    },

    addValuesToMeasureMap : function(measureMap, schema, query, name, values) {
        var key = schema + "|" + query + "|" + name;

        if (!measureMap[key])
            measureMap[key] = { schemaName: schema, queryName: query, name: name, values: [] };

        measureMap[key].values = measureMap[key].values.concat(values);
    },

    /**
     * This function is meant to update the values within the 'In the plot' filter
     * @param activeMeasures
     */
    updatePlotBasedFilter : function(activeMeasures) {

        var wrapped = this.getMeasureSet(activeMeasures, false /* Do not include any measures declared in filters */).wrapped;

        this.plotLock = true;

        var state = Connector.getState();
        var filters = state.getFilters();
        var inPlotFilter;

        var sqlFilters = [null, null, null, null];

        // see if filter already exists
        Ext.each(filters, function(filter) {
            if (filter.get('isPlot') === true && filter.get('isGrid') === false) {
                inPlotFilter = filter;
                return false;
            }
        });

        if (inPlotFilter) {
            // update
            inPlotFilter.set('gridFilter', sqlFilters);
            inPlotFilter.set('plotMeasures', wrapped);
            inPlotFilter.set('plotScales', [this.getScale('x'), this.getScale('y')]);
            state.updateFilterMembersComplete(false);
        }
        else {
            // create
            inPlotFilter = Ext.create('Connector.model.Filter', {
                gridFilter: sqlFilters,
                isPlot: true,
                isGrid: false,
                hierarchy: 'Subject',
                plotMeasures: wrapped,
                plotScales: [this.getScale('x'), this.getScale('y')],
                filterSource: 'GETDATA',
                isWhereFilter: false
            });
            state.prependFilter(inPlotFilter);
        }

        this.plotLock = false;

        state.getApplication().fireEvent('plotmeasures');
    },

    noPlot : function() {

        var map = [{
            x : null,
            xname : 'X-Axis',
            y : null,
            yname : 'Y-Axis',
            subjectId: null
        }];

        this.initPlot(map, null, true);
        this.resizeTask.delay(300);
        this.noplotmsg.show();
    },

    onFailure : function(response) {
        console.log(response);
        this.fireEvent('hideload', this);
        this.showMessage('Failed to Load', true);
    },

    updateMeasureSelection : function(win) {
        if (win) {
            var box = this.getBox();
            win.setSize(box.width-100, box.height-100);
            win.show();
        }
        else {
            console.warn('Failed to updated measure selection');
        }
    },

    //
    // The intent of this method is to return the position of the plots contents as the user sees them
    //
    getPlotPosition : function() {
        var pos = {
            topEdge: 0,
            leftEdge: 0,
            width: 0,
            height: 0
        };

        var plotEl = this.getPlotElement();
        if (plotEl && this.plot) {
            plotEl = Ext.get(plotEl);
            var box = plotEl.getBox();
            var grid = this.plot.grid;

            pos.topEdge = box.top + grid.topEdge;
            pos.leftEdge = box.left + grid.leftEdge;
            pos.width = grid.rightEdge - grid.leftEdge;
            pos.height = grid.bottomEdge - grid.topEdge;
        }

        return pos;
    },

    setVisibleWindow : function(win) {
        this.visibleWindow = win;
    },

    clearVisibleWindow : function() {
        if (Ext.isObject(this.visibleWindow) && this.visibleWindow.hideLock === true) {
            this.visibleWindow.hideLock = false;
        }
        else {
            this.visibleWindow = undefined;
        }
    },

    showYMeasureSelection : function(targetEl) {

        if (!this.ywin) {

            if (this.newSelectors) {
                this.newYAxisSelector = Ext.create('Connector.panel.Selector', {
                    headerTitle: 'y-axis',
                    activeMeasure: this.activeYSelection,
                    sourceMeasureFilter: {
                        queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS,
                        measuresOnly: true,
                        includeHidden: this.canShowHidden
                    },
                    memberCountsFn: this.getSubjectsIn,
                    memberCountsFnScope: this,
                    listeners: {
                        selectionmade: function(selected) {
                            this.activeYSelection = selected;
                            this.initialized = true;
                            this.showTask.delay(10);
                            this.ywin.hide(targetEl);
                        },
                        cancel: function() {
                            this.activeYSelection = undefined;
                            this.ywin.hide(targetEl);
                        },
                        scope: this
                    }
                });

                this.ywin = Ext.create('Ext.window.Window', {
                    ui: 'axiswindow',
                    modal: true,
                    draggable: false,
                    header: false,
                    closeAction: 'hide',
                    resizable: false,
                    border: false,
                    layout: {
                        type: 'fit'
                    },
                    style: 'padding: 0',
                    items: [this.newYAxisSelector]
                });
            }
            else {
                var sCls = 'yaxissource';

                this.axisPanelY = Ext.create('Connector.panel.AxisSelector', {
                    flex: 1,
                    title: 'Y Axis',
                    bodyStyle: 'padding: 15px 27px 0 27px;',
                    open : function() {},
                    measureConfig: {
                        cls: 'yaxispicker',
                        sourceCls: sCls,
                        multiSelect: false,
                        displaySourceCounts: true,
                        sourceCountSchema: Connector.studyContext.schemaName,
                        measuresStoreData: Connector.getService('Query').getMeasuresStoreData({
                            queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS,
                            measuresOnly: true,
                            includeHidden: this.canShowHidden
                        }).measures
                    },
                    displayConfig: {
                        mainTitle : 'Choose a Variable for the Y Axis...'
                    },
                    scalename: 'yscale',
                    disableAntigenFilter: false
                });

                this.ywin = Ext.create('Ext.window.Window', {
                    id: 'plotymeasurewin',
                    ui: 'axiswindow',
                    cls: 'axiswindow plotaxiswindow',
                    sourceCls: sCls,
                    axisPanel: this.axisPanelY,
                    modal: true,
                    draggable: false,
                    header: false,
                    closeAction: 'hide',
                    resizable: false,
                    minHeight: 500,
                    maxHeight: 700,
                    minWidth: 600,
                    maxWidth: 975,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [this.axisPanelY],
                    dockedItems : [{
                        xtype : 'toolbar',
                        dock : 'bottom',
                        ui : 'footer',
                        padding : 15,
                        items : ['->',{
                            text: 'set y axis',
                            handler: function() {
                                if (this.axisPanelY.hasSelection()) {
                                    this.initialized = true;
                                    this.showTask.delay(10);
                                    this.ywin.hide(targetEl);
                                }
                            },
                            scope: this
                        },{
                            text: 'cancel',
                            handler: function() {
                                if (this.activeYSelection) {
                                    this.axisPanelY.setSelection(this.activeYSelection);
                                    this.activeYSelection = undefined;
                                }
                                else {
                                    this.axisPanelY.clearSelection();
                                }
                                this.ywin.hide(targetEl);
                            },
                            scope : this
                        }]
                    }],
                    listeners: {
                        show : function(win) {
                            this.setVisibleWindow(win);
                            this.runUniqueQuery(this.axisPanelY);
                        },
                        hide : function() {
                            this.clearVisibleWindow();
                        },
                        scope: this
                    },
                    scope : this
                });

                this.updateMeasureSelection(this.ywin);

                if (this.axisPanelY.hasSelection()) {
                    this.activeYSelection = this.axisPanelY.getSelection()[0];
                }
            }
        }

        this.ywin.show(targetEl);
    },

    showXMeasureSelection : function(targetEl) {

        if (!this.xwin) {

            if (this.newSelectors) {
                this.newXAxisSelector = Ext.create('Connector.panel.Selector', {
                    headerTitle: 'x-axis',
                    activeMeasure: this.activeXSelection,
                    sourceMeasureFilter: {
                        queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS,
                        includeTimpointMeasures: true,
                        includeHidden: this.canShowHidden
                    },
                    listeners: {
                        selectionmade: function(selected) {
                            this.activeXSelection = selected;
                            this.initialized = true;
                            this.showTask.delay(10);
                            this.xwin.hide(targetEl);
                        },
                        cancel: function() {
                            this.activeXSelection = undefined;
                            this.xwin.hide(targetEl);
                        },
                        scope: this
                    }
                });

                this.xwin = Ext.create('Ext.window.Window', {
                    ui: 'axiswindow',
                    modal: true,
                    draggable: false,
                    header: false,
                    closeAction: 'hide',
                    resizable: false,
                    border: false,
                    layout: {
                        type: 'fit'
                    },
                    style: 'padding: 0',
                    items: [this.newXAxisSelector]
                });
            }
            else {
                var sCls = 'xaxissource';

                this.axisPanelX = Ext.create('Connector.panel.AxisSelector', {
                    flex      : 1,
                    ui        : 'axispanel',
                    title     : 'X Axis',
                    bodyStyle: 'padding: 15px 27px 0 27px;',
                    measureConfig : {
                        cls        : 'xaxispicker',
                        sourceCls  : sCls,
                        multiSelect: false,
                        displaySourceCounts: true,
                        sourceCountSchema: Connector.studyContext.schemaName,
                        measuresStoreData: Connector.getService('Query').getMeasuresStoreData({
                            queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS,
                            includeTimpointMeasures : true,
                            includeHidden: this.canShowHidden
                        }).measures
                    },
                    displayConfig : {
                        mainTitle : 'Choose a Variable for the X Axis...'
                    },
                    scalename : 'xscale',
                    visitTagStore: this.visitTagStore,
                    disableAntigenFilter: false
                });

                this.xwin = Ext.create('Ext.window.Window', {
                    id        : 'plotxmeasurewin',
                    cls       : 'axiswindow plotaxiswindow',
                    sourceCls : sCls,
                    axisPanel : this.axisPanelX,
                    modal     : true,
                    draggable : false,
                    header : false,
                    closeAction: 'hide',
                    resizable : false,
                    minHeight : 500,
                    maxHeight: 700,
                    minWidth: 600,
                    maxWidth: 975,
                    layout : {
                        type : 'vbox',
                        align: 'stretch'
                    },
                    items   : [this.axisPanelX],
                    dockedItems : [{
                        xtype : 'toolbar',
                        dock : 'bottom',
                        ui : 'footer',
                        padding : 15,
                        items : ['->', {
                            text: 'remove variable',
                            itemId: 'removevarbtn',
                            ui: 'rounded-inverted-accent',
                            handler: function() {
                                // Need to remove the color measure from the plot filter or we'll pull it down again.
                                this.removeVariableFromFilter(0);
                                this.activeXSelection = undefined;
                                this.axisPanelX.clearSelection();
                                this.xwin.hide(targetEl);
                            },
                            scope: this
                        }, {
                            text  : 'set x axis',
                            ui    : 'rounded-inverted-accent',
                            handler : function() {
                                var yHasSelection, yModel;

                                yModel = Ext.getCmp('yaxisselector').getModel().data;
                                yHasSelection = ((yModel.schemaLabel !== "" && yModel.queryLabel !== "") || (this.hasOwnProperty('axisPanelY') && this.axisPanelY.hasSelection()));

                                if (yHasSelection && this.axisPanelX.hasSelection()) {
                                    this.initialized = true;
                                    this.showTask.delay(10);
                                    this.xwin.hide(targetEl);
                                }
                                else if (this.axisPanelX.hasSelection()) {
                                    this.xwin.hide(targetEl, function() {
                                        this.showYMeasureSelection(Ext.getCmp('yaxisselector').getEl());
                                    }, this);
                                }
                            },
                            scope: this
                        }, {
                            text  : 'cancel',
                            ui    : 'rounded-inverted-accent',
                            handler : function() {
                                if (this.activeXSelection) {
                                    this.axisPanelX.setSelection(this.activeXSelection);
                                    this.activeXSelection = undefined;
                                }
                                else {
                                    this.axisPanelX.clearSelection();
                                }
                                this.xwin.hide(targetEl);
                            },
                            scope : this
                        }]
                    }],
                    listeners : {
                        show : function(win) {
                            this.setVisibleWindow(win);
                            this.runUniqueQuery(this.axisPanelX);
                        },
                        hide : function() {
                            this.clearVisibleWindow();
                        },
                        scope: this
                    },
                    scope : this
                });

                this.updateMeasureSelection(this.xwin);

                if (this.axisPanelX.hasSelection()) {
                    this.activeXSelection = this.axisPanelX.getSelection()[0];
                }

                // issue 20412: conditionally show 'remove variable' button
                var filter = this.getPlotsFilter();
                this.xwin.down('#removevarbtn').setVisible(filter && filter.get('plotMeasures')[0]);
            }
        }

        this.xwin.show(targetEl);
    },

    showColorSelection : function(targetEl) {
        if (!this.colorwin) {

            if (this.newSelectors) {
                this.newColorAxisSelector = Ext.create('Connector.panel.Selector', {
                    headerTitle: 'color',
                    sourceMeasureFilter: {
                        queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS,
                        includeHidden: this.canShowHidden
                    },
                    listeners: {
                        selectionmade: function(selected) {
                            this.activeColorSelection = selected;
                            this.initialized = true;
                            this.showTask.delay(10);
                            this.colorwin.hide(targetEl);
                        },
                        cancel: function() {
                            this.activeColorSelection = undefined;
                            this.colorwin.hide(targetEl);
                        },
                        scope: this
                    }
                });

                this.colorwin = Ext.create('Ext.window.Window', {
                    ui: 'axiswindow',
                    modal: true,
                    draggable: false,
                    header: false,
                    closeAction: 'hide',
                    resizable: false,
                    border: false,
                    layout: {
                        type: 'fit'
                    },
                    style: 'padding: 0',
                    items: [this.newColorAxisSelector]
                });
            }
            else {
                var sCls = 'colorsource';
                this.colorPanel = Ext.create('Connector.panel.AxisSelector', {
                    flex      : 1,
                    ui        : 'axispanel',
                    title     : 'Color',
                    bodyStyle: 'padding: 15px 27px 0 27px;',
                    measureConfig : {
                        cls : 'coloraxispicker',
                        sourceCls : sCls,
                        multiSelect : false,
                        displaySourceCounts: true,
                        sourceCountSchema: Connector.studyContext.schemaName,
                        measuresStoreData: Connector.getService('Query').getMeasuresStoreData({
                            queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS,
                            includeHidden: this.canShowHidden
                        }).measures,
                        userFilter : function(row) {
                            return row.type === 'BOOLEAN' || row.type === 'VARCHAR';
                        }
                    },
                    displayConfig : {
                        mainTitle : 'Choose a Color Variable...'
                    },
                    scalename : 'colorscale'
                });

                this.colorwin = Ext.create('Ext.window.Window', {
                    id        : 'plotcolorwin',
                    cls       : 'axiswindow plotaxiswindow',
                    sourceCls : sCls,
                    axisPanel : this.colorPanel,
                    modal     : true,
                    draggable : false,
                    header : false,
                    closeAction: 'hide',
                    resizable : false,
                    minHeight : 500,
                    maxHeight: 700,
                    minWidth: 600,
                    maxWidth: 975,
                    layout : {
                        type : 'vbox',
                        align: 'stretch'
                    },
                    items   : [this.colorPanel],
                    dockedItems : [{
                        xtype: 'toolbar',
                        dock: 'bottom',
                        ui : 'footer',
                        padding: 15,
                        items : ['->', {
                            text: 'remove variable',
                            itemId: 'removevarbtn',
                            ui: 'rounded-inverted-accent',
                            handler: function() {
                                // Need to remove the color measure from the plot filter or we'll pull it down again.
                                this.removeVariableFromFilter(2);
                                this.activeColorSelection = undefined;
                                this.colorPanel.clearSelection();
                                this.colorwin.hide(targetEl);
                            },
                            scope: this
                        }, {
                            text: 'set color variable',
                            ui: 'rounded-inverted-accent',
                            handler: function() {
                                this.showTask.delay(10);
                                this.colorwin.hide(targetEl);
                            },
                            scope: this
                        }, {
                            text: 'cancel',
                            ui: 'rounded-inverted-accent',
                            handler: function() {
                                if (this.activeColorSelection) {
                                    this.colorPanel.setSelection(this.activeColorSelection);
                                    this.activeColorSelection = undefined;
                                }
                                else {
                                    this.colorPanel.clearSelection();
                                }
                                this.colorwin.hide(targetEl);
                            },
                            scope: this
                        }]
                    }],
                    listeners: {
                        show: function(win) {
                            this.setVisibleWindow(win);
                            this.runUniqueQuery(this.colorPanel);
                        },
                        hide: function() {
                            this.clearVisibleWindow();
                        },
                        scope: this
                    },
                    scope: this
                });

                this.updateMeasureSelection(this.colorwin);

                if (this.colorPanel.hasSelection()) {
                    this.activeColorSelection = this.colorPanel.getSelection()[0];
                }

                // issue 20412: conditionally show 'remove variable' button
                var filter = this.getPlotsFilter();
                this.colorwin.down('#removevarbtn').setVisible(filter && filter.get('plotMeasures')[2]);
            }
        }

        this.colorwin.show(targetEl);
    },

    removeVariableFromFilter : function(measureIdx) {
        var filter = this.getPlotsFilter();
        if (filter != null) {
            var m = filter.get('plotMeasures');
            m[measureIdx] = null;
            Connector.getState().updateFilter(filter.get('id'), {plotMeasures: m});
        }
    },

    getPlotsFilter : function() {
        var filters = Connector.getState().getFilters();
        var _filter = null;

        for (var f=0; f < filters.length; f++) {
            if (filters[f].get('isPlot') == true && filters[f].get('isGrid') == false) {
                _filter = filters[f]; break;
            }
        }

        return _filter;
    },

    runUniqueQuery : function(axisSelector) {
        var picker = axisSelector.getMeasurePicker();

        if (picker) {
            var me = this;
            me.getSubjectsIn(function(subjects) {
                picker.setCountMemberSet(subjects);
            });
        }
    },

    onFilterChange : function(filters) {
        // plot lock prevents from listening to plots own changes to state filters
        if (this.plotLock) {
            this.plotLock = false;
            return;
        }

        // mark as clear when there are no plot filters
        this.filterClear = true;
        for (var f=0; f < filters.length; f++) {
            if (filters[f].isPlot() && !filters[f].isGrid()) {
                this.filterClear = false;
                break;
            }
        }

        if (this.isActiveView) {
            this.showTask.delay(this.initialized ? 100 : 600);
        }
        else if (this.initialized) {
            this.refreshRequired = true;
        }
    },

    onViewChange : function(controller, view) {
        this.isActiveView = (view === this.xtype);

        if (this.isActiveView) {

            if (this.refreshRequired) {
                this.showTask.delay(this.initialized ? 100 : 600);
            }

            if (Ext.isObject(this.visibleWindow)) {
                this.visibleWindow.show();
            }
        }
        else {
            this.fireEvent('hideload', this);
            this.hideMessage();
        }
    },

    getSubjectsIn : function(callback, scope) {
        var me = this;
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

                var SUBJECT_IN = 'scattercount';
                state.addPrivateSelection(validFilters, SUBJECT_IN, function() {
                    mdx.queryParticipantList({
                        useNamedFilters: [SUBJECT_IN],
                        success : function(cellset) {
                            state.removePrivateSelection(SUBJECT_IN);
                            var ids = [], pos = cellset.axes[1].positions, a=0;
                            for (; a < pos.length; a++) { ids.push(pos[a][0].name); }
                            callback.call(scope || me, ids);
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
                callback.call(scope || me, null);
            }

        }, me);
    },


    applyFiltersToMeasure : function (measures, ptids) {

        var ptidMeasure, defaultMeasure = this.getDefaultMeasure();
        Ext.each(measures, function(measure) {
            if (measure.measure && measure.measure.alias == defaultMeasure.alias) {
                ptidMeasure = measure;
                return false;
            }
        }, this);

        if (ptidMeasure) {
            if (ptids) {
                ptidMeasure.measure.values = ptids;
            }
            else if (Ext.isArray(ptidMeasure.measure.values)) {
                console.error('There is a potentially unknown values array on the applied default measure.');
            }
        }
    },

    onPlotSelectionRemoved : function(filterId, measureIdx) {
        var curExtent = this.plot.getBrushExtent();
        if (curExtent) {
            if (curExtent[0][0] === null || curExtent[0][1] === null) {
                // 1D, just clear the selection.
                this.plot.clearBrush();
            }
            else {
                // 2D selection.
                if (measureIdx === 0) {
                    // clear the x-axis.
                    this.plot.setBrushExtent([[null, curExtent[0][1]],[null, curExtent[1][1]]]);
                }
                else if (measureIdx === 1) {
                    // clear the y-axis.
                    this.plot.setBrushExtent([[curExtent[0][0], null],[curExtent[1][0], null]]);
                }
            }
        }
    },

    onSelectionChange : function(selections) {
        if (selections.length === 0) {
            var ex = this.plot.getBrushExtent();
            if (ex !== null) {
                // Issue 20117.
                this.plot.clearBrush();
            }
        }
        this.highlightSelectedFn();
    },

    requestStudyAxisData : function(chartData) {
        var alignMap = chartData.getContainerAlignmentDayMap(),
            studyContainers = Object.keys(alignMap),
            inClause = " ('" + studyContainers.join("','") + "')",
            sql = 'SELECT\n' +
                'StudyLabel,\n' +
                'StudyContainer,\n'+
                'TimepointType,\n' +
                'VisitLabel,\n' +
                'SequenceNumMin,\n' +
                'SequenceNumMax,\n' +
                'ProtocolDay,\n' +
                'VisitDescription,\n' +
                'VisitRowId,\n' +
                'VisitTagMap.VisitTag.Name as VisitTagName,\n' +
                'VisitTagMap.VisitTag.Caption as VisitTagCaption,\n' +
                'VisitTagMap.VisitTag.Description as VisitTagDescription\n' +
                'FROM (\n' +
                'SELECT\n' +
                'StudyProperties.Label as StudyLabel,\n' +
                'StudyProperties.TimepointType as TimepointType,\n' +
                'Visit.Label as VisitLabel,\n' +
                'Visit.SequenceNumMin,\n' +
                'Visit.SequenceNumMax,\n' +
                'Visit.ProtocolDay,\n' +
                'Visit.Description as VisitDescription,\n' +
                'Visit.Folder as VisitContainer,\n' +
                'Visit.RowId as VisitRowId,\n' +
                'StudyProperties.Container as StudyContainer\n' +
                'FROM Visit, StudyProperties\n' +
                'WHERE Visit.Folder = StudyProperties.Container\n' +
                'AND StudyProperties.Container IN ' + inClause + '\n' +
                ') as AllVisits\n' +
                'LEFT OUTER JOIN VisitTagMap ON VisitTagMap.Visit = VisitRowId';

        LABKEY.Query.executeSql({
            schemaName: Connector.studyContext.schemaName,
            requiredVersion: 9.1,
            containerFilter: LABKEY.Query.containerFilter.currentAndSubfolders,
            sql: sql,
            success: function(executeSqlResp) {
                if (this.isActiveView) { // TODO: This is a bit weird we check this here...
                    executeSqlResp.measures = this.measures;
                    executeSqlResp.visitMap = chartData.getVisitMap();
                    executeSqlResp.containerAlignmentDayMap = alignMap;
                    var studyAxisData = Ext.create('Connector.model.StudyAxisData', executeSqlResp);

                    this.hasStudyAxisData = studyAxisData.getData().length > 0;

                    this.initPlot(chartData, studyAxisData);
                    this.initStudyAxis(studyAxisData);
                }
            },
            failure: function() {console.error('Error retrieving study axis data')},
            scope: this
        });
    },

    showVisitHover : function(data, rectEl) {
        var plotEl = document.querySelector('div.plot svg'),
            plotBBox = plotEl.getBoundingClientRect(),
            hoverBBox, html;

        this.visitHoverEl = document.createElement('div');
        this.visitHoverEl.setAttribute('class', 'study-axis-window');
        html = '<p>' + data.studyLabel + '</p>' + '<p>' + data.label + '</p>';

        this.visitHoverEl.innerHTML = html;
        document.querySelector('body').appendChild(this.visitHoverEl);
        hoverBBox = this.visitHoverEl.getBoundingClientRect();
        this.visitHoverEl.style.left = rectEl.getAttribute('x') + 'px';
        this.visitHoverEl.style.top = (plotBBox.bottom - hoverBBox.height - 43) + 'px';
    },

    removeVisitHover : function() {
        if (this.visitHoverEl) {
            this.visitHoverEl.parentNode.removeChild(this.visitHoverEl);
            this.visitHoverEl = null;
        }
    },

    showVisitTagHover : function(data, rectEl) {
        var plotEl = document.querySelector('div.plot svg'),
                plotBBox = plotEl.getBoundingClientRect(),
                hoverBBox, html, i;

        this.tagHoverEl = document.createElement('div');
        this.tagHoverEl.setAttribute('class', 'study-axis-window');
        html = '<p>' + data.studyLabel + '</p>';

        for (i = 0; i < data.visitTags.length; i++) {
            html += '<p>' + data.visitTags[i] + '</p>';
        }

        this.tagHoverEl.innerHTML = html;
        document.querySelector('body').appendChild(this.tagHoverEl);
        hoverBBox = this.tagHoverEl.getBoundingClientRect();
        this.tagHoverEl.style.left = rectEl.getBBox().x + 'px';
        this.tagHoverEl.style.top = (plotBBox.bottom - hoverBBox.height - 43) + 'px';
    },

    removeVisitTagHover : function() {
        if (this.tagHoverEl) {
            this.tagHoverEl.parentNode.removeChild(this.tagHoverEl);
            this.tagHoverEl = null;
        }
    },

    initStudyAxis : function(studyAxisInfo) {
        if (!this.studyAxis) {
            this.studyAxis = Connector.view.StudyAxis().renderTo('study-axis');
        }

        this.studyAxis.studyData(studyAxisInfo.getData())
                .scale(this.plot.scales.x.scale)
                .width(this.getStudyAxisPanel().getWidth() - 40)
                .visitMouseover(this.showVisitHover, this)
                .visitMouseout(this.removeVisitHover, this)
                .visitTagMouseover(this.showVisitTagHover, this)
                .visitTagMouseout(this.removeVisitTagHover, this);

        this.studyAxis();
    },

    resizePlotContainers : function(numStudies) {
        if (this.requireStudyAxis && this.hasStudyAxisData) {
            this.plotEl.setStyle('padding', '0 0 0 150px');
            this.getStudyAxisPanel().setVisible(true);
            this.getStudyAxisPanel().setHeight(Math.min(100, 27 * numStudies));
        }
        else {
            this.plotEl.setStyle('padding', '0');
            this.getStudyAxisPanel().setVisible(false);
        }
    },

    // FOR TESTING USE
    showPlotDataGrid : function(targetEl) {
        window.open(LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {
            schemaName: this.dataQWP.schema, 'query.queryName': this.dataQWP.query
        }), '_blank');
    }
});
