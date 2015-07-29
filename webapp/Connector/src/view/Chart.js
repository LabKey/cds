/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Chart', {

    extend: 'Ext.panel.Panel',

    requires: ['Connector.model.ChartData'],

    alias: 'widget.plot',

    cls: 'chartview',

    layout: 'border',

    ui: 'custom',

    canShowHidden: false,

    binRowLimit: 5000,

    showPointsAsBin: false,

    xGutterHeight: 160,

    yGutterWidth: 210,

    studyAxisWidthOffset: 150,

    plugins : [{
        ptype: 'messaging',
        calculateY : function(cmp, box, msg) {
            return box.y - 10;
        }
    }],

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

        this._ready = true;

        this.callParent([config]);

        this.addEvents('onready');

        this.labelTextColor = '#666363';
        this.labelTextHltColor = '#FFFFFF';
        this.labelBkgdColor = '#FFFFFF';
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
            ptype: 'messaging',
            calculateY : function(cmp, box, msg) {
                return box.y - 10;
            }
        });
    },

    getNoPlotMsg : function() {
        if (!this.noplotmsg) {
            this.noplotmsg = Ext.create('Ext.Component', {
                renderTo: this.body,
                cls: 'noplotmsg',
                hidden: true,
                autoEl: {
                    tag: 'div',
                    children: [{
                        tag: 'h1',
                        cls: 'line1',
                        html: 'Choose a "y" variable and up to two more to plot at a time.'
                    },{
                        tag: 'h1',
                        cls: 'line2',
                        html: 'Make selections on the plot to subgroup and filter.'
                    },{
                        tag: 'h1',
                        cls: 'line3',
                        html: 'Use subgroups for further comparison.'
                    }]
                }
            });
        }

        return this.noplotmsg;
    },

    getEmptyPlotMsg : function() {
        if (!this.emptyplotmsg) {
            this.emptyplotmsg = Ext.create('Ext.Component', {
                renderTo: this.body,
                cls: 'emptyplotmsg',
                hidden: true,
                autoEl: {
                    tag: 'div',
                    children: [{
                        tag: 'h1',
                        cls: 'line1',
                        html: 'There are no data for the selected variable(s) in the current filters.'
                    }]
                }
            });
        }

        return this.emptyplotmsg;
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
            border: false, frame: false,
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'container',
                width: '50%',
                margin: '16 0 0 24',
                layout: {
                    type: 'hbox',
                    pack: 'start'
                },
                items: [this.getYSelector()]
            },{
                xtype: 'container',
                width: '50%',
                margin: '16 24 0 0',
                layout: {
                    type: 'hbox',
                    pack: 'end'
                },
                items: [this.getColorSelector()]
            }]
        };
    },

    getYSelector : function() {
        if (!this.ySelector) {
            this.ySelector = Ext.create('Connector.view.Variable', {
                id: 'yvarselector',
                btnCls: 'yaxisbtn',
                model: Ext.create('Connector.model.Variable', {type: 'y'}),
                listeners: {
                    requestvariable: this.onShowVariableSelection,
                    scope: this
                }
            });
        }

        return this.ySelector;
    },

    getXSelector : function() {
        if (!this.xSelector) {
            this.xSelector = Ext.create('Connector.view.Variable', {
                id: 'xvarselector',
                xtype: 'variableselector',
                btnCls: 'xaxisbtn',
                model: Ext.create('Connector.model.Variable', {type: 'x'}),
                listeners: {
                    requestvariable: this.onShowVariableSelection,
                    scope: this
                }
            });
        }

        return this.xSelector;
    },

    getColorSelector : function() {
        if (!this.colorSelector) {
            this.colorSelector = Ext.create('Connector.panel.ColorSelector', {
                id: 'colorvarselector',
                btnCls: 'colorbtn',
                model: Ext.create('Connector.model.Variable', {type: 'color'}),
                listeners: {
                    afterrender : function(c) {
                        c.getEl().on('mouseover', function() { this.showWhyBinTask.delay(300); }, this);
                        c.getEl().on('mouseout', function() { this.showWhyBinTask.cancel(); }, this);
                        this.on('hideload', function() { this.showWhyBinTask.cancel(); }, this);
                    },
                    requestvariable: this.onShowVariableSelection,
                    scope: this
                }
            });
        }

        return this.colorSelector;
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
            border: false, frame: false,
            items: [{
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    pack: 'center'
                },
                width: '100%',
                padding: '8px 0',
                items: [
                    this.getXSelector(),
                    {
                        // FOR TESTING USE (add "_showPlotData" param to URL to show button)
                        id: 'plotshowdata',
                        xtype: 'button',
                        text: 'view data',
                        style: 'left: 20px !important; top: 15px !important;',
                        hidden: LABKEY.ActionURL.getParameter('_showPlotData') ? false : true
                    }
                ]
            }]
        };
    },

    onShowVariableSelection : function() {
        this.fireEvent('hideload', this);
    },

    attachInternalListeners : function() {

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

    getPlotSize : function(box) {
        var size = {};

        if (this.requireStudyAxis && this.hasStudyAxisData) {
            size.width = box.width - this.studyAxisWidthOffset;
        }
        else if (this.requireYGutter) {
            size.width = box.width - this.yGutterWidth;
        }
        else {
            size.width = box.width;
        }

        if (this.requireXGutter) {
            size.height = box.height - this.xGutterHeight;
        }
        else {
            size.height = box.height;
        }

        return size;
    },

    handleResize : function() {

        if (!this.isActiveView) {
            return;
        }

        var plotBox = this.plotEl.getBox();
        var size = this.getPlotSize(plotBox);

        if (!this.initialized && !this.showNoPlot) {
            this.showNoPlot = true;
            this.noPlot(false);
        }

        if (this.ywin && this.ywin.isVisible()) {
            this.updateSelectorWindow(this.ywin);
        }

        if (this.xwin && this.xwin.isVisible()) {
            this.updateSelectorWindow(this.xwin);
        }

        if (this.colorwin && this.colorwin.isVisible()) {
            this.updateSelectorWindow(this.colorwin);
        }

        if (this.plot) {
            this.plot.setSize(size.width, size.height, true);
        }

        if (this.xGutterPlot) {
            this.xGutterPlot.setSize(size.width + (this.requireYGutter ? this.yGutterWidth : 0), this.xGutterHeight, true)
        }

        if (this.yGutterPlot) {
            this.yGutterPlot.setSize(this.yGutterWidth, size.height, true);
        }

        if (this.getStudyAxisPanel().isVisible() && this.studyAxis && this.hasStudyAxisData) {
            this.studyAxis.width(Math.max(0, this.getStudyAxisPanel().getWidth()- 40));
            this.studyAxis.scale(this.plot.scales.x.scale);
            this.studyAxis();
        }

        this.resizePlotMsg(this.getNoPlotMsg(), plotBox);
        this.resizePlotMsg(this.getEmptyPlotMsg(), plotBox);

        this.resizeMessage();

        if (Ext.isFunction(this.highlightSelectedFn)) {
            this.highlightSelectedFn();
        }
    },

    resizePlotMsg : function(msgCmp, plotBox) {
        if (msgCmp) {
            var el = msgCmp.getEl(),
                top = (plotBox.height / 2) - 15,
                left = (plotBox.width / 2) - (msgCmp.getWidth() / 2);

            el.setStyle('margin-top', top + 'px');
            el.setStyle('margin-left', left + 'px');
        }
    },

    getNoPlotLayer : function() {
        return new LABKEY.vis.Layer({
            geom: new LABKEY.vis.Geom.Point({}),
            aes: {
                yLeft: function(row) { return row.y; }
            }
        });
    },

    mouseOverPoints : function(event, pointData, layerSel, layerScope) {
        if (!layerScope.isBrushed) {
            this.highlightPoints(null, [pointData.subjectId]);
        }
    },

    mouseOutPoints : function(event, pointData, layerSel, layerScope) {
        if (!layerScope.isBrushed) {
            this.clearHighlightedData();
            this.highlightSelected();
        }
    },

    mouseOverBins : function(event, binData, layerSel, layerScope) {
        if (!layerScope.isBrushed) {
            var subjectIds = [];
            binData.forEach(function(b) {
                subjectIds.push(b.data.subjectId);
            });

            this.highlightBins(null, subjectIds);
        }
    },

    mouseOutBins : function(event, binData, layerSel, layerScope) {
        if(!layerScope.isBrushed) {
            this.clearHighlightedData();
            this.highlightSelected();
        }
    },

    pointHoverText : function(row) {
        var text = 'Subject: ' + row.subjectId, colon = ': ', linebreak = ',\n';

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

        var me = this,
            layerArgs = [layerScope],
            slice = Array.prototype.slice;

        var mouseOverPointsFn = function() {
            me.mouseOverPoints.apply(me, slice.call(arguments, 0).concat(layerArgs)); };

        var mouseOutPointsFn = function() {
            me.mouseOutPoints.apply(me, slice.call(arguments, 0).concat(layerArgs)); };

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

    getPointLayer : function(layerScope, position) {
        return new LABKEY.vis.Layer({
            geom: new LABKEY.vis.Geom.Point({
                size: 3,
                plotNullPoints: true,
                position: position, // jitter or undefined
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

    getBasePlotConfig : function() {
        return {
            renderTo: this.plotEl.id,
            rendererType: 'd3',
            throwErrors: true,
            clipRect: false,
            legendPos : 'none',
            gridLineWidth: 1.25,
            borderWidth: 2,
            bgColor: '#FFFFFF', // $light-color
            tickColor: '#FFFFFF', // $light-color
            tickTextColor: this.labelTextColor // $heat-scale-1
        };
    },

    getMainPlotConfig : function(margins, size, data, aes, scales) {
        return Ext.apply(this.getBasePlotConfig(), {
            margins : margins,
            width : size.width,
            height : size.height,
            data : data,
            aes : aes,
            scales : scales,
            gridColor : '#FFFFFF', // $light-color
            gridLineColor : '#F0F0F0', // $secondary-color
            borderColor : '#CCC8C8' // $heat-scale-3
        });
    },

    getGutterPlotConfig : function(margins, height, width, data, aes, scales, labels) {
        return Ext.apply(this.getBasePlotConfig(), {
            margins : margins,
            width : width,
            height : height,
            data : data,
            aes : aes,
            scales : scales,
            labels : labels,
            gridColor : '#F8F8F8',
            gridLineColor : '#EAEAEA',
            borderColor : '#FFFFFF'
        });
    },

    /**
     * @param chartData
     * @param {object} [studyAxisInfo]
     * @param {boolean} [noplot=false]
     */
    initPlot : function(chartData, studyAxisInfo, noplot) {

        if (this.isHidden()) {
            // welp, that was a huge waste..
            // Consider: This could wrapped up in something like this.continue()
            // where if we do not continue, we will set refresh
            this.refreshRequired = true;
            return;
        }

        var allDataRows, rows, properties, isBrushed = false,
            layerScope = {plot: null, isBrushed: isBrushed}, plot, layer,
            yAxisMargin = 46;

        // get the data rows for the chart
        if (chartData instanceof Connector.model.ChartData) {
            allDataRows = chartData.getDataRows();
            properties = chartData.getProperties();
            yAxisMargin = chartData.getYAxisMargin();
        }
        else {
            allDataRows = {
                main: chartData,
                totalCount: chartData.length
            };
        }
        rows = allDataRows.main;

        if (!Ext.isBoolean(noplot)) {
            noplot = false;
        }

        // show empty plot message if we have no data in main plot or gutter plots
        if (allDataRows.totalCount == 0) {
            this.fireEvent('hideload', this);
            this.plot = null;
            this.noPlot(true);
            return;
        }

        this.requireXGutter = allDataRows && allDataRows.undefinedY;
        this.requireYGutter = allDataRows && allDataRows.undefinedX;

        this.plotEl.update('');
        this.resizePlotContainers(studyAxisInfo ? studyAxisInfo.getData().length : 0);

        if (this.plot) {
            this.plot.clearGrid();
            this.plot = null;
        }

        this.logRowCount(rows, allDataRows);

        // only call handlers when state has changed
        var lastShowPointsAsBin = this.showPointsAsBin;
        this.showPointsAsBin = allDataRows ? allDataRows.totalCount > this.binRowLimit : false;
        if (lastShowPointsAsBin != this.showPointsAsBin) {
            if (this.showPointsAsBin) {
                this.onEnableBinning();
            }
            else {
                this.onDisableBinning();
            }
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
            if (s.indexOf('.') > -1 && s.indexOf('e') == -1)
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
                me.highlightSelected.call(me);
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
                    scaleType: 'continuous',
                    domain: chartData.getXDomain()
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
                tickFormat: numericTickFormat,
                tickDigits: 5,
                domain: chartData.getYDomain()
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

        var size = this.getPlotSize(box);

        var mainMargins = {top: 25, left: this.requireYGutter ? yAxisMargin : 68, right: 50, bottom: this.requireStudyAxis ? 43 : 30};
        var plotConfig = this.getMainPlotConfig(mainMargins, size, rows, plotAes, scales);

        var gutterXPlotConfig;
        if(this.requireXGutter) {
            var gutterXMargins = {top: 1, left: this.requireYGutter ? this.yGutterWidth+yAxisMargin : 68, right: plotConfig.margins.right, bottom: 1};
            var gutterXLabels = {
                y: {
                    value: "Undefined y value",
                    fontSize: 12,
                    position: 10,
                    cls: "xGutter-label",
                    listeners: {
                        mouseover: function() {me._showWhyXGutter(chartData.getDataRows())},
                        mouseout: function() { me._closeWhyXGutter()}
                    }
                }
            };
            var gutterXWidth = plotConfig.width + (this.requireYGutter ? this.yGutterWidth : 0);
            var gutterXAes = {
                xTop: function(row) {return row.x;},
                y: function(row) {return row.y;}
            };
            if (this.measures[2]) {
                gutterXAes.color = function(row) {return row.color};
                gutterXAes.shape = function(row) {return row.color};
            }
            var gutterXScales = {
                xTop: {scaleType: 'continuous', domain: chartData.getXDomain(), tickFormat: function() {return '';}},
                yLeft: {scaleType: 'discrete', tickFormat: function() {return '';}}
            };

            if (this.measures[2]) {
                gutterXScales.color = {
                    scaleType: 'discrete',
                    range: LABKEY.vis.Scale.DataspaceColor()
                };
                gutterXScales.shape = {
                    scaleType: 'discrete',
                    range: LABKEY.vis.Scale.DataspaceShape()
                };
            }

            gutterXPlotConfig = this.getGutterPlotConfig(gutterXMargins, this.xGutterHeight, gutterXWidth, allDataRows.undefinedY, gutterXAes, gutterXScales, gutterXLabels);
        }

        var gutterYPlotConfig;
        if(this.requireYGutter) {
            var gutterYMargins = {top: plotConfig.margins.top, left: 43, right: 20, bottom: plotConfig.margins.bottom};
            var gutterYLabels = {
                x: {
                    value: "Undefined x value",
                    fontSize: 12,
                    position: 10,
                    cls: "yGutter-label",
                    listeners: {
                        mouseover: function() {me._showWhyYGutter(chartData.getDataRows())},
                        mouseout: function() {me._closeWhyYGutter()}
                    }
                }
            };
            var gutterYAes = {
                x: function(row) {return row.x;},
                yRight: function(row) {return row.y;}
            };
            if (this.measures[2]) {
                gutterYAes.color = function(row) {return row.color};
                gutterYAes.shape = function(row) {return row.color};
            }
            var gutterYScales = {
                x: {scaleType: 'discrete', tickFormat: function() {return '';}},
                yRight: {scaleType: 'continuous', domain: chartData.getYDomain()}
            };

            if (this.measures[2]) {
                gutterYScales.color = {
                    scaleType: 'discrete',
                    range: LABKEY.vis.Scale.DataspaceColor()
                };
                gutterYScales.shape = {
                    scaleType: 'discrete',
                    range: LABKEY.vis.Scale.DataspaceShape()
                };
            }

            gutterYPlotConfig = this.getGutterPlotConfig(gutterYMargins, plotConfig.height, this.yGutterWidth, allDataRows.undefinedX, gutterYAes, gutterYScales, gutterYLabels);
        }

        if (!noplot)
        {
            // set the x axis domain based on the study axis informations min and max
            if (studyAxisInfo) {
                this.setScaleDomain(plotConfig.scales.x, 'x', studyAxisInfo.getRange());
            }

            // set the scale type to linear or log, validating that we don't allow log with negative values
            var xScaleType = this.setScaleType(plotConfig.scales.x, 'x', properties);
            var yScaleType = this.setScaleType(plotConfig.scales.yLeft, 'y', properties);
            if(this.requireYGutter) {
                Ext.apply(gutterYPlotConfig.scales.yRight, {trans : yScaleType});
            }
            if(this.requireXGutter) {
                Ext.apply(gutterXPlotConfig.scales.xTop, {trans : xScaleType});
            }

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

                // TODO: For now just do brushing on main plot not gutter plots
                if(me.requireYGutter) {
                    sel[0][0] = null;
                    if(me.requireXGutter) {
                        sel[0][2] = null;
                    }
                } else if(me.requireXGutter)
                    sel[0][1] = null;

                colorFn = function(d) {
                    d.isSelected = isSelectedWithBrush(extent, d.x, d.y);
                    d.origFill = d.origFill || this.getAttribute('fill');

                    if (d.isSelected) {
                        subjects[d.subjectId] = true;
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
                    if (!d.isSelected && subjects[d.subjectId] === true) {
                        return '#01BFC2';
                    }
                    return this.getAttribute('fill');
                };

                assocStrokeFn = function(d) {
                    if (!d.isSelected && subjects[d.subjectId] === true) {
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

                // TODO: For now just do brushing on main plot not gutter plots
                if(me.requireYGutter) {
                    sel[0][0] = null;
                    if(me.requireXGutter) {
                        sel[0][2] = null;
                    }
                } else if(me.requireXGutter)
                    sel[0][1] = null;

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
                            subjects[d[i].data.subjectId] = true;
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
                            if (subjects[d[i].data.subjectId] === true)
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
                    me.clearHighlightedData();
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

                        if (xMeasure.name.toLowerCase().indexOf("alignedDay") > -1) {
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
                            .attr('style', function(d) { return d.origStyle || this.getAttribute('style') })
                            .attr('fill-opacity', 1).attr('stroke-opacity', 1);
                }
            };

            this.clickTask = new Ext.util.DelayedTask(function(node, view, name, target, multi) {
                if (layerScope.isBrushed)
                    view.plot.clearBrush();
                this.runXAxisSelectAnimation(node, view, name, target, multi);
            }, this);

            if (Ext.isFunction(this.highlightSelectedFn)) {
                this.highlightSelectedFn();
            }
        }

        var me = this;
        var measures = this.measures; // hoisted for brushend.

        if(this.requireYGutter && gutterYPlotConfig) {
            this.yGutterPlot = new LABKEY.vis.Plot(gutterYPlotConfig);
            layerScope.yGutterPlot = this.yGutterPlot;
            if (this.yGutterPlot) {
                if(this.showPointsAsBin) {
                    this.yGutterPlot.addLayer(this.getBinLayer(layerScope));
                } else
                {
                    this.yGutterPlot.addLayer(this.getPointLayer(layerScope, 'jitter'));
                }
                try {
                    this.yGutterPlot.render();
                }
                catch(err) {
                    this.showMessage(err.message, true);
                    this.fireEvent('hideload', this);
                    this.yGutterPlot = null;
                    console.error(err);
                    console.error(err.stack);
                    return;
                }
            }
        }

        // If using color variables sync color and shape with yGutter plot if it exists
        if (this.measures[2] && this.requireYGutter && this.yGutterPlot) {
            plotConfig.scales.color = this.yGutterPlot.layers[0].geom.colorScale;
            plotConfig.scales.shape = this.yGutterPlot.layers[0].geom.shapeScale;
        }

        this.plot = new LABKEY.vis.Plot(plotConfig);
        layerScope.plot = this.plot; // hoisted for mouseover/mouseout event listeners

        if (this.plot) {
            this.plot.addLayer(layer);
            try {
                this.hidePlotMsg();
                this.plot.render();
                if (!noplot && this.measures[2]) {
                    this.getColorSelector().setLegend(this.plot.getLegendData());
                }
            }
            catch(err) {
                this.showMessage(err.message, true);
                this.fireEvent('hideload', this);
                this.plot = null;
                this.plotEl.update('');
                this.noPlot(false);
                console.error(err);
                console.error(err.stack);
                return;
            }
        }

        if(this.requireXGutter && gutterXPlotConfig) {
            // If using color variables sync color and shape with yGutter plot if it exists
            if (this.measures[2] && this.plot) {
                gutterXPlotConfig.scales.color = this.plot.layers[0].geom.colorScale;
                gutterXPlotConfig.scales.shape = this.plot.layers[0].geom.shapeScale;
            }
            this.xGutterPlot = new LABKEY.vis.Plot(gutterXPlotConfig);
            layerScope.xGutterPlot = this.xGutterPlot;
            if (this.xGutterPlot) {
                if(this.showPointsAsBin) {
                    this.xGutterPlot.addLayer(this.getBinLayer(layerScope));
                } else
                {
                    this.xGutterPlot.addLayer(this.getPointLayer(layerScope, 'jitter'));
                }
                try {
                    this.xGutterPlot.render();
                }
                catch(err) {
                    this.showMessage(err.message, true);
                    this.fireEvent('hideload', this);
                    this.xGutterPlot = null;
                    console.error(err);
                    console.error(err.stack);
                    return;
                }
            }
        }

        this.fireEvent('hideload', this);
    },

    logRowCount : function(rows, allDataRows) {
        if (LABKEY.devMode) {
            console.log('plotted rows:', rows.length);
            if (allDataRows && allDataRows.undefinedX) {
                console.log('plotted x gutter rows:', allDataRows.undefinedX.length);
            }
            if (allDataRows && allDataRows.undefinedY) {
                console.log('plotted x gutter rows:', allDataRows.undefinedY.length);
            }
        }
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
            this.clearHighlightedData();
            this.highlightSelected();

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
                this.highlightBins(target);
            else
                this.highlightPoints(target);

            // Highlight label
            var targets = [];
            targets.push(target);
            this.highlightLabels.call(this, this.plot, targets, this.labelTextColor, this.labelBkgdHltColor, false);
        }
    },

    retrieveBinSubjectIds : function (plot, target, subjects) {
        var subjectIds = [];
        if (subjects) {
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
                    if (data.x === target && subjectIds.indexOf(data.subjectId) === -1)
                    {
                        subjectIds.push(data.subjectId);
                    }
                    else if (selections.indexOf(data.x) != -1 && subjectIds.indexOf(data.subjectId) === -1)
                    {
                        subjectIds.push(data.subjectId);
                    }
                }
            });
        }

        return subjectIds;
    },

    highlightBins : function (target, subjects) {
        // get the set of subjectIds in the binData
        var subjectIds = this.retrieveBinSubjectIds(this.plot, target, subjects);
        if(subjects) {
            subjects.forEach(function(s) {
                subjectIds.push(s);
            });
        }

        if (this.plot.renderer) {
            var isSubjectInMouseBin = function (d, yesVal, noVal) {
                if (d.length > 0 && d[0].data) {
                    for (var i = 0; i < d.length; i++) {
                        if (subjectIds.indexOf(d[i].data.subjectId) != -1) {
                            return yesVal;
                        }
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

            var bins = this.plot.renderer.canvas.selectAll('.vis-bin path');
            if (this.requireXGutter && this.xGutterPlot)
                bins[0] = bins[0].concat(this.xGutterPlot.renderer.canvas.selectAll('.vis-bin path')[0]);

            if (this.requireYGutter && this.yGutterPlot)
                bins[0] = bins[0].concat(this.yGutterPlot.renderer.canvas.selectAll('.vis-bin path')[0]);

            bins.attr('style', colorFn)
                .attr('fill-opacity', opacityFn)
                .attr('stroke-opacity', opacityFn);
        }
    },

    clearHighlightBins : function () {
        if (this.plot.renderer)
        {
            var bins = this.plot.renderer.canvas.selectAll('.vis-bin path');
            if (this.requireXGutter && this.xGutterPlot)
                bins[0] = bins[0].concat(this.xGutterPlot.renderer.canvas.selectAll('.vis-bin path')[0]);

            if (this.requireYGutter && this.yGutterPlot)
                bins[0] = bins[0].concat(this.yGutterPlot.renderer.canvas.selectAll('.vis-bin path')[0]);

            bins.attr('style', function (d) {return d.origStyle || this.getAttribute('style');})
                .attr('fill-opacity', 1).attr('stroke-opacity', 1);

        }
    },

    clearHighlightedData : function () {
        if(this.showPointsAsBin)
            this.clearHighlightBins();
        else
            this.clearHighlightPoints();
    },

    retrievePointSubjectIds : function(plot, target, subjects) {
        var subjectIds = [];
        if (subjects) {
            subjects.forEach(function(s) {
                subjectIds.push(s);
            });
        }

        if (plot.renderer) {
            var points = plot.renderer.canvas.selectAll('.point path'),
                selections = this.getCategoricalSelectionValues(),
                subject;

            points.each(function (d) {
                subject = d.subjectId;

                // Check if value matches target or another selection
                if (subjectIds.indexOf(subject) === -1) {
                    if (d.x === target) {
                        subjectIds.push(subject);
                    }
                    else if (selections.indexOf(d.x) != -1) {
                        subjectIds.push(subject);
                    }
                }
            });
        }

        return subjectIds;
    },

    highlightPoints : function (target, subjects) {
        var subjectIds = this.retrievePointSubjectIds(this.plot, target, subjects);

        var fillColorFn = function(d) {
            if (subjectIds.indexOf(d.subjectId) != -1) {
                return '#01BFC2';
            }
            return '#E6E6E6';
        };

        if (this.plot.renderer) {
            var points = this.plot.renderer.canvas.selectAll('.point path');

            if(this.requireXGutter && this.xGutterPlot)
                points[0] = points[0].concat(this.xGutterPlot.renderer.canvas.selectAll('.point path')[0]);

            if(this.requireYGutter && this.yGutterPlot)
                points[0] = points[0].concat(this.yGutterPlot.renderer.canvas.selectAll('.point path')[0]);

            points.attr('fill', fillColorFn)
                    .attr('stroke', fillColorFn)
                    .attr('fill-opacity', 1)
                    .attr('stroke-opacity', 1);

            points.each(function (d) {
                // Re-append the node so it is on top of all the other nodes, this way highlighted points
                // are always visible.
                var node = this.parentNode;
                if (subjectIds.indexOf(d.subjectId) != -1) {
                    node.parentNode.appendChild(node);
                }
            });
        }
    },

    clearHighlightPoints : function () {
        var colorFn, colorScale = null, colorAcc = null;

        if (this.plot.scales.color && this.plot.scales.color.scale) {
            colorScale = this.plot.scales.color.scale;
            colorAcc = this.plot.aes.color;
        }

        colorFn = function(d) {
            if (colorScale && colorAcc) {
                return colorScale(colorAcc.getValue(d));
            }

            return '#000000';
        };

        if (this.plot.renderer) {
            var points = this.plot.renderer.canvas.selectAll('.point path');
            if(this.requireXGutter && this.xGutterPlot)
                points[0] = points[0].concat(this.xGutterPlot.renderer.canvas.selectAll('.point path')[0]);

            if(this.requireYGutter && this.yGutterPlot)
                points[0] = points[0].concat(this.yGutterPlot.renderer.canvas.selectAll('.point path')[0]);

            points.attr('fill', colorFn)
                    .attr('stroke', colorFn)
                    .attr('fill-opacity', 0.5)
                    .attr('stroke-opacity', 0.5);
        }
    },

    highlightSelected : function () {
        var targets = this.getCategoricalSelectionValues(), me = this;
        if (targets.length < 1) {
            me.clearHighlightedData();
        }

        targets.forEach(function(t) {
            if(me.showPointsAsBin)
                me.highlightBins(t);
            else
                me.highlightPoints(t);
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
        var values = this.getCategoricalSelectionValues(),
            found = false;

        values.forEach(function(t) {
            if (t === target) {
                found = true;
            }
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

        if (targets.length < 1) {
            this.clearHighlightLabels(plot);
        }

        targets.forEach(function(target) {
            var tickFillOpacityFn = function(t) {
                if (target === t || me.isSelection(t))
                    return 1;
                else
                    return 0;
            };

            var tickFillFn = function(t) {
                if (target === t)
                    return bkgdColor;

                if (clearOthers && targets.indexOf(t) === -1)
                    return me.labelBkgdColor;

                return this.getAttribute('fill');
            };

            var labelFillFn = function(t) {
                if (target === t)
                    return textColor;

                if (clearOthers && targets.indexOf(t) === -1)
                    return me.labelTextColor;

                return this.getAttribute('fill');
            };

            if (plot.renderer) {
                var ticks = plot.renderer.canvas.selectAll('.tick-text rect.highlight');
                ticks.attr('fill', tickFillFn);
                ticks.attr('fill-opacity', tickFillOpacityFn)

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

        if (axis == 'y' && this.activeYSelection) {
            scale = this.getSelectedOptionScale(this.activeYSelection);
        }
        else if (axis == 'x' && this.activeXSelection) {
            scale = this.getSelectedOptionScale(this.activeXSelection);
        }

        return scale.toLowerCase();
    },

    getSelectedOptionScale : function(selected) {
        return (selected.options && selected.options.scale) ? selected.options.scale : selected.defaultScale;
    },

    setScaleType : function(scale, axis, properties) {
        var scaleType = this.getScale(axis), allowLog;

        if (scale.scaleType !== 'discrete') {
            allowLog = (axis == 'y') ? !properties.setYLinear : !properties.setXLinear
            if (!allowLog && scaleType == 'log') {
                this.showMessage('Displaying the ' + axis.toLowerCase() + '-axis on a linear scale due to the presence of invalid log values.', true);
                scaleType = 'linear';
            }

            Ext.apply(scale, {trans : scaleType});
        }

        return scaleType;
    },

    setScaleDomain : function(scale, axis, studyAxisRange) {
        // issue 21300: set x-axis domain min/max based on study axis milestones if they exist
        if (scale.scaleType !== 'discrete' && axis == 'x' && studyAxisRange) {
            // TODO: we can have data outside of the study axis min/max range right?
            Ext.apply(scale, {domain: [studyAxisRange.min, studyAxisRange.max]});
        }
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
        if (this.activeXSelection) {
            measures.x = this.activeXSelection;

            // special case to look for userGroups as a variable option to use as filter values for the x measure
            if (measures.x.options.userGroups) {
                measures.x.values = measures.x.options.userGroups;
            }

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

        // map the y-axis schema and query name for a time point x-axis variable
        if (measures.x && measures.y && (!measures.x.schemaName && !measures.x.queryName)) {
            x = Ext.clone(measures.x);
            x.schemaName = measures.y.schemaName;
            x.queryName = measures.y.queryName;
            measures.x = x;
        }

        // issue 20526: if color variable from different dataset, do left join so as not to get null x - null y datapoints
        if (measures.color != null && measures.y != null && measures.x != null) {
            measures.color.requireLeftJoin =    // TODO: do we still need this with the MeasureStore?
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

    clearPlotSelections : function() {
        this.clearAxisSelection('y');
        this.clearAxisSelection('x');
        this.clearAxisSelection('color');
    },

    clearAxisSelection : function(axis) {
        if (axis == 'y') {
            this.getYAxisSelector().clearSelection();
            this.activeYSelection = undefined;
            this.getYSelector().clearModel();
        }
        else if (axis == 'x') {
            this.getXAxisSelector().clearSelection();
            this.activeXSelection = undefined;
            this.getXSelector().clearModel();
        }
        else if (axis == 'color') {
            this.getColorAxisSelector().clearSelection();
            this.activeColorSelection = undefined;
            this.getColorSelector().clearModel();
        }
    },

    onShowGraph : function() {

        if (!this.isHidden()) {
            this.refreshRequired = false;
            this.filterChange = false;
            this.requireStudyAxis = false;

            if (this.filterClear) {
                this.clearPlotSelections();
            }

            var activeMeasures = this.getActiveMeasures();
            this.fireEvent('axisselect', this, 'y', [activeMeasures.y]);
            this.fireEvent('axisselect', this, 'x', [activeMeasures.x]);
            this.fireEvent('axisselect', this, 'color', [activeMeasures.color]);

            if (activeMeasures.y == null) {
                this.hideMessage();
                this.getStudyAxisPanel().setVisible(false);
                Connector.getState().clearSelections(true);
                this.filterClear = false;
                this.noPlot(false);
            }
            else {
                this.measures = [activeMeasures.x, activeMeasures.y, activeMeasures.color];

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
        }
        else {
            this.refreshRequired = true;
        }
    },

    getWrappedMeasures : function(activeMeasures) {

        var wrappedMeasures = [
            this._getAxisWrappedMeasure(activeMeasures.x),
            this._getAxisWrappedMeasure(activeMeasures.y)
        ];
        wrappedMeasures.push(activeMeasures.color ? {measure : activeMeasures.color, time: 'date'} : null);

        return wrappedMeasures;
    },

    _getAxisWrappedMeasure : function(measure) {
        if (!measure) {
            return null;
        }

        var options = measure.options;
        var wrappedMeasure = {measure : measure};

        // handle visit tag alignment for study axis
        if (options && options.alignmentVisitTag !== undefined)
        {
            var interval = measure.alias;
            measure.interval = interval;
            wrappedMeasure.dateOptions = {
                interval: interval,
                zeroDayVisitTag: options.alignmentVisitTag,
                altQueryName: 'cds.VisitTagAlignment'
            };
        }

        // we still respect the value if it is set explicitly on the measure
        if (!Ext.isDefined(wrappedMeasure.measure.inNotNullSet)) {
            wrappedMeasure.measure.inNotNullSet = Connector.model.ChartData.isContinuousMeasure(measure);
        }

        return wrappedMeasure;
    },

    getMeasureSet : function(activeMeasures, includeFilterMeasures) {

        var additionalMeasures = this.getAdditionalMeasures(activeMeasures);
        var wrappedMeasures = this.getWrappedMeasures(activeMeasures);

        var nonNullMeasures = [];
        for (var i =0; i < wrappedMeasures.length; i++) {
            if (wrappedMeasures[i]) {
                nonNullMeasures.push(wrappedMeasures[i]);
            }
        }

        var measures = additionalMeasures.concat(nonNullMeasures);

        // set of measures from data filters
        if (includeFilterMeasures) {
            var filterMeasures = Connector.getService('Query').getWhereFilterMeasures(Connector.getState().getFilters());
            if (!Ext.isEmpty(filterMeasures)) {
                measures = measures.concat(filterMeasures);
            }
        }

        return {
            measures: this.mergeMeasures(measures),
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
     * This creates a temp query via cdsGetData which is then used to query for unique participants, and is also what
     * we use to back the chart data (via an AxisMeasureStore).
     * @param activeMeasures
     */
    requestChartData : function(activeMeasures) {
        this.getSubjectsIn(function(ptidList) {
            // issue 23885: we don't need to include the color measure if it isn't from the x or y dataset or demographic
            if (activeMeasures.color) {
                var demographicSource = activeMeasures.color.isDemographic,
                    matchXSource = activeMeasures.x && activeMeasures.x.queryName == activeMeasures.color.queryName,
                    matchYSource = activeMeasures.y && activeMeasures.y.queryName == activeMeasures.color.queryName;

                if (!demographicSource && !matchXSource && !matchYSource) {
                    activeMeasures.color = null;
                }
            }

            var measures = this.getMeasureSet(activeMeasures, true /* Include any measures declared in filters */).measures;

            this.applyFiltersToMeasure(measures, ptidList);

            // Request Chart MeasureStore Data
            Connector.getService('Query').getMeasureStore(measures, this.onChartDataSuccess, this.onFailure, this);
        });
    },

    onChartDataSuccess : function(measureStore, measureSet) {
        var chartData = Ext.create('Connector.model.ChartData', {
            measureSet: measureSet,
            plotMeasures: this.measures,
            measureStore: measureStore
        });

        this.dataQWP = {
            schema: chartData.getSchemaName(),
            query: chartData.getQueryName()
        };

        this.hasStudyAxisData = false;

        if (this.requireStudyAxis) {
            this.getStudyAxisData(chartData);
        }
        else {
            this.initPlot(chartData);
        }
    },

    onEnableBinning : function() {

        // Disable the color axis selector
        this.getColorSelector().disable();

        // Show binning message
        var msgKey = 'PLOTBIN_LIMIT';
        var learnId = Ext.id(), dismissId = Ext.id();
        var msg = 'Heatmap enabled, color disabled.&nbsp;<a id="' + learnId +'">Learn why</a>&nbsp;<a id="' + dismissId +'">Got it</a>';

        var shown = this.sessionMessage(msgKey, msg, true);

        if (shown) {
            var el = Ext.get(dismissId);
            if (el) {
                el.on('click', function() {
                    this.showmsg = true;
                    this.hideMessage();
                    Connector.getService('Messaging').block(msgKey);
                }, this, {single: true});
            }

            el = Ext.get(learnId);
            if (el) {
                el.on('click', function() { this.showWhyBinTask.delay(0); }, this);
            }
        }
    },

    _showWhyXGutter : function(data) {
        var calloutMgr = hopscotch.getCalloutManager(),
                _id = Ext.id(),
                perc = Ext.util.Format.round((data.undefinedY.length / data.totalCount) * 100, 2);

        calloutMgr.createCallout({
            id: _id,
            bubbleWidth: 325,
            target: document.querySelector("svg g text.xGutter-label"),
            placement: 'top',
            title: 'Percent with undefined y value: ' + perc + '%',
            content: 'Data points may have no matching y value due to differing subject, visit, assay, antigen, analyte, and other factors. See Help for more details',
            xOffset: -20
        });

        this.on('hidexguttermsg', function() {
            calloutMgr.removeCallout(_id);
        }, this);
    },

    _closeWhyXGutter : function() {
        this.fireEvent('hidexguttermsg', this);
    },

    _showWhyYGutter : function(data) {
        var calloutMgr = hopscotch.getCalloutManager(),
                _id = Ext.id(),
                perc = Ext.util.Format.round((data.undefinedX.length / data.totalCount) * 100, 2);

        calloutMgr.createCallout({
            id: _id,
            bubbleWidth: 325,
            target: document.querySelector("svg g text.yGutter-label"),
            placement: 'top',
            title: 'Percent with undefined x value: ' + perc + '%',
            content: 'Data points may have no matching x value due to differing subject, visit, assay, antigen, analyte, and other factors. See Help for more details',
            arrowOffset: 40
        });

        this.on('hideyguttermsg', function() {
            calloutMgr.removeCallout(_id);
        }, this);
    },

    _closeWhyYGutter : function() {
        this.fireEvent('hideyguttermsg', this);
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
                target: this.getColorSelector().getActiveButton().getEl().dom,
                placement: 'bottom',
                title: 'Heatmap mode',
                xOffset: -305,
                arrowOffset: 235,
                content: 'When the plot has over ' + limit + ' points heatmap mode is automatically enabled to maximize performance. The color variable is disabled until active filters show less than ' + limit + ' points in the plot.'
                // If the user explcitly closes the tip, then don't ever show it again.
                //onClose : function() {
                //    me.showWhyBin = false;
                //}
            });

            this.showmsg = true;
            this.hideMessage();

            this.on('hideload', function() {
                calloutMgr.removeCallout(_id);
                this.showWhyBin = false;
            }, this, {single: true});
        }
    },

    onDisableBinning : function() {

        // Enable the color axis selector
        this.getColorSelector().enable();
    },

    getAdditionalMeasures : function(activeMeasures) {
        // map key to schema, query, name, and values
        var measuresMap = {}, additionalMeasuresArr = [];

        Ext.each(['x', 'y'], function(axis) {
            var schema, query;
            if (activeMeasures[axis])
            {
                schema = activeMeasures[axis].schemaName;
                query = activeMeasures[axis].queryName;

                // always add in the Container and SubjectId columns for a selected measure on the X or Y axis
                this.addValuesToMeasureMap(measuresMap, schema, query, 'Container', []);
                this.addValuesToMeasureMap(measuresMap, schema, query, Connector.studyContext.subjectColumn, []);

                // only add the SequenceNum column for selected measures that are not demographic and no time point
                if (!activeMeasures[axis].isDemographic && activeMeasures[axis].variableType != 'TIME') {
                    this.addValuesToMeasureMap(measuresMap, schema, query, 'SequenceNum', []);
                }

                // add selection information from the advanced options panel of the variable selector
                if (activeMeasures[axis].options && activeMeasures[axis].options.dimensions)
                {
                    Ext.iterate(activeMeasures[axis].options.dimensions, function(key, values) {
                        // null or undefined mean "select all" so don't apply a filter
                        if (!Ext.isDefined(values) || values == null) {
                            values = [];
                        }

                        this.addValuesToMeasureMap(measuresMap, schema, query, key, values);
                    }, this);
                }
            }
        }, this);

        Ext.iterate(measuresMap, function(k, m) {
            var measureRecord = new LABKEY.Query.Visualization.Measure({
                schemaName: m.schemaName,
                queryName: m.queryName,
                name: m.name,
                isMeasure: false,
                isDimension: true,
                values: m.values.length > 0 ? m.values : undefined
            });

            additionalMeasuresArr.push({ measure: measureRecord });
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

    noPlot : function(showEmptyMsg) {

        var map = [{
            x : null,
            xname : 'X-Axis',
            y : null,
            yname : 'Y-Axis',
            subjectId: null
        }];

        // TODO this is crazy. initPlot() calls noPlot() to show msg and then calls back to initPlot() to render empty plot
        this.initPlot(map, null, true);

        this.resizeTask.delay(0);
        this.getNoPlotMsg().setVisible(!showEmptyMsg);
        this.getEmptyPlotMsg().setVisible(showEmptyMsg);
    },

    hidePlotMsg : function() {
        this.getNoPlotMsg().hide();
        this.getEmptyPlotMsg().hide();
    },

    onFailure : function(response) {
        console.log(response);
        this.fireEvent('hideload', this);
        this.showMessage('Failed to Load', true);
    },

    updateSelectorWindow : function(win) {
        if (win) {
            var box = this.getBox();
            win.setHeight(box.height-100);
            win.center();
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

    getYAxisSelector : function() {
        if (!this.yAxisSelector) {
            this.yAxisSelector = Ext.create('Connector.panel.Selector', {
                headerTitle: 'y-axis',
                testCls: 'y-axis-selector',
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
                        this.variableSelectionMade(this.ywin, this.getYSelector().getEl());
                    },
                    cancel: function() {
                        this.ywin.hide(this.getYSelector().getEl());
                        // reset the selection back to this.activeYSelection
                        this.yAxisSelector.setActiveMeasure(this.activeYSelection);
                    },
                    scope: this
                }
            });
        }

        return this.yAxisSelector;
    },

    showYMeasureSelection : function() {

        if (!this.ywin) {
            this.ywin = this.createSelectorWindow(this.getYAxisSelector());
        }

        this.getYAxisSelector().loadSourceCounts();
        this.ywin.show(this.getYSelector().getEl());
    },

    getXAxisSelector : function() {
        if (!this.xAxisSelector) {
            this.xAxisSelector = Ext.create('Connector.panel.Selector', {
                headerTitle: 'x-axis',
                testCls: 'x-axis-selector',
                activeMeasure: this.activeXSelection,
                sourceMeasureFilter: {
                    queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS,
                    includeTimpointMeasures: true,
                    includeHidden: this.canShowHidden
                },
                memberCountsFn: this.getSubjectsIn,
                memberCountsFnScope: this,
                listeners: {
                    selectionmade: function(selected) {
                        this.activeXSelection = selected;
                        this.variableSelectionMade(this.xwin, this.getXSelector().getEl());
                    },
                    remove: function() {
                        // Need to remove the x measure (index 0) from the plot filter or we'll pull it down again.
                        this.removeVariableFromFilter(0);
                        this.clearAxisSelection('x');
                        this.variableSelectionMade(this.xwin, this.getXSelector().getEl());
                    },
                    cancel: function() {
                        this.xwin.hide(this.getXSelector().getEl());
                        // reset the selection back to this.activeYSelection
                        this.xAxisSelector.setActiveMeasure(this.activeXSelection);
                    },
                    scope: this
                }
            });
        }

        return this.xAxisSelector;
    },

    showXMeasureSelection : function() {

        if (!this.xwin) {
            this.xwin = this.createSelectorWindow(this.getXAxisSelector());
        }

        this.getXAxisSelector().toggleRemoveVariableButton(Ext.isDefined(this.activeXSelection) && this.activeXSelection != null);
        this.getXAxisSelector().loadSourceCounts();
        this.xwin.show(this.getXSelector().getEl());
    },

    getColorAxisSelector : function() {
        if (!this.colorAxisSelector) {
            this.colorAxisSelector = Ext.create('Connector.panel.Selector', {
                headerTitle: 'color',
                testCls: 'color-axis-selector',
                disableAdvancedOptions: true,
                activeMeasure: this.activeColorSelection,
                sourceMeasureFilter: {
                    queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS,
                    includeHidden: this.canShowHidden,
                    userFilter : function(row) {
                        return row.type === 'BOOLEAN' || row.type === 'VARCHAR';
                    }
                },
                memberCountsFn: this.getSubjectsIn,
                memberCountsFnScope: this,
                listeners: {
                    selectionmade: function(selected) {
                        this.activeColorSelection = selected;
                        this.variableSelectionMade(this.colorwin, this.getColorSelector().getEl());
                    },
                    remove: function() {
                        // Need to remove the color measure (index 2) from the plot filter or we'll pull it down again.
                        this.removeVariableFromFilter(2);
                        this.clearAxisSelection('color');
                        this.variableSelectionMade(this.colorwin, this.getColorSelector().getEl());
                    },
                    cancel: function() {
                        this.colorwin.hide(this.getColorSelector().getEl());
                        // reset the selection back to this.activeYSelection
                        this.colorAxisSelector.setActiveMeasure(this.activeColorSelection);
                    },
                    scope: this
                }
            });
        }

        return this.colorAxisSelector;
    },

    showColorSelection : function() {
        if (!this.colorwin) {
            this.colorwin = this.createSelectorWindow(this.getColorAxisSelector());
        }

        this.getColorAxisSelector().toggleRemoveVariableButton(Ext.isDefined(this.activeColorSelection) && this.activeColorSelection != null);
        this.getColorAxisSelector().loadSourceCounts();
        this.colorwin.show(this.getColorSelector().getEl());
    },

    variableSelectionMade : function(win, targetEl) {
        if (Ext.isDefined(this.activeYSelection)) {
            this.initialized = true;
            this.showTask.delay(10);
            win.hide(targetEl);
        }
        else {
            // if we don't yet have a y-axis selection, show that variable selector
            win.hide(targetEl, function() {
                this.showYMeasureSelection();
            }, this);
        }
    },

    createSelectorWindow : function(item) {
        var win = Ext.create('Ext.window.Window', {
            ui: 'axiswindow',
            minHeight: 580,
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
            items: [item]
        });

        this.updateSelectorWindow(win);
        return win;
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
            this.onReady(function() {
                this.showTask.delay(10);
            }, this);
        }
        else {
            this.refreshRequired = true;
        }
    },

    onActivate: function() {
        this.isActiveView = true;
        if (this.refreshRequired) {
            this.onReady(function() {
                this.showTask.delay(10);
            }, this);
        }

        if (Ext.isObject(this.visibleWindow)) {
            this.visibleWindow.show();
        }
    },

    onDeactivate : function() {
        this.isActiveView = false;
        this.fireEvent('hideload', this);
        this.hideMessage();
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

    applyFiltersToMeasure : function (measureSet, ptids) {
        var ptidMeasure;

        // find the subject column in the measure set by matching the subjectColumn name
        Ext.each(measureSet, function(m) {
            if (m.measure && m.measure.name == Connector.studyContext.subjectColumn) {
                ptidMeasure = m.measure;
                return false;
            }
        }, this);

        if (ptidMeasure) {
            if (ptids) {
                ptidMeasure.values = ptids;
            }
            else if (Ext.isArray(ptidMeasure.values)) {
                console.error('There is a potentially unknown values array on the applied subject measure.');
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

        if (Ext.isFunction(this.highlightSelectedFn)) {
            this.highlightSelectedFn();
        }
    },

    getStudyAxisData : function(chartData) {
        var studyVisitTagStore = Connector.getApplication().getStore('StudyVisitTag');
        if (studyVisitTagStore.loading) {
            studyVisitTagStore.on('load', function(store) {
                this.getStudyVisitTagRecords(store, chartData);
            }, this);
        }
        else {
            this.getStudyVisitTagRecords(studyVisitTagStore, chartData);
        }
    },

    getStudyVisitTagRecords : function(store, chartData) {
        var alignMap = chartData.getContainerAlignmentDayMap(),
                studyContainers = Object.keys(alignMap);

        // filter the StudyVisitTag store based on the study container id array
        var containerFilteredRecords = store.queryBy(function(record) {
            return studyContainers.indexOf(record.get('container_id')) > -1;
        }).items;

        var studyAxisData = Ext.create('Connector.model.StudyAxisData', {
            records: containerFilteredRecords,
            measure: this.measures[0],
            containerAlignmentDayMap: alignMap
        });

        this.hasStudyAxisData = studyAxisData.getData().length > 0;

        this.initPlot(chartData, studyAxisData);
        this.initStudyAxis(studyAxisData);
    },

    showVisitTagHover : function(data, visitTagEl) {
        var calloutMgr = hopscotch.getCalloutManager(),
                _id = Ext.id(),
                bubbleWidth = 160,
                groupTags = {}, maxGroupTagCount = 0,
                content = '', timeout;

        // content will display one row for each group so we need to gather together the tags for each group separately
        for (var i = 0; i < data.visitTags.length; i++) {
            if (!groupTags[data.visitTags[i].group]) {
                groupTags[data.visitTags[i].group] = [];
            }

            groupTags[data.visitTags[i].group].push(data.visitTags[i].tag);

            if (groupTags[data.visitTags[i].group].length > maxGroupTagCount) {
                maxGroupTagCount = groupTags[data.visitTags[i].group].length;
            }
        }

        for (var group in groupTags) {
            content += '<p><span style="font-weight: bold;">' + group + '</span> : ' + groupTags[group].join(', ') + '</p>';
        }

        if (maxGroupTagCount > 1) {
            bubbleWidth = maxGroupTagCount * 90 + 70;
        }

        timeout = setTimeout(function() {
            calloutMgr.createCallout({
                id: _id,
                bubbleWidth: bubbleWidth,
                xOffset: -(bubbleWidth / 2),          // the nonvaccination icon is slightly smaller
                arrowOffset: (bubbleWidth / 2) - 10 - (data.imgSrc == 'nonvaccination_normal.svg' ? 4 : 0),
                target: visitTagEl,
                placement: 'top',
                showCloseButton: false,
                title: data.studyLabel + ' - ' + data.label,
                content: content
            });
        }, 250);

        this.on('hidevisittagmsg', function() {
            clearTimeout(timeout);
            calloutMgr.removeCallout(_id);
        }, this);

        // show the hover icon for this glyph
        this.updateVisitTagIcon(visitTagEl, 'normal', 'hover');
    },

    removeVisitTagHover : function(data, visitTagEl) {
        // change hover icon back to normal glyph state
        this.updateVisitTagIcon(visitTagEl, 'hover', 'normal');

        this.fireEvent('hidevisittagmsg', this);
    },

    updateVisitTagIcon : function(el, currentSuffix, newSuffix) {
        var suffix = '_' + currentSuffix + '.svg', iconHref = el.getAttribute('href');
        if (iconHref.indexOf(suffix, iconHref.length - suffix.length) !== -1) {
            el.setAttribute('href', iconHref.replace(suffix, '_' + newSuffix + '.svg'));
        }
    },

    initStudyAxis : function(studyAxisInfo) {
        if (!this.studyAxis) {
            this.studyAxis = Connector.view.StudyAxis().renderTo('study-axis');
        }

        this.studyAxis.studyData(studyAxisInfo.getData())
                .scale(this.plot.scales.x.scale)
                .width(Math.max(0, this.getStudyAxisPanel().getWidth() - 40))
                .visitTagMouseover(this.showVisitTagHover, this)
                .visitTagMouseout(this.removeVisitTagHover, this);

        this.studyAxis();
    },

    resizePlotContainers : function(numStudies) {
        if (this.requireStudyAxis && this.hasStudyAxisData) {
            this.plotEl.setStyle('padding', '0 0 0 ' + this.studyAxisWidthOffset + 'px');
            this.getStudyAxisPanel().setVisible(true);
            this.getStudyAxisPanel().setHeight(Math.min(200, 20 * numStudies + 5)); // TODO set min height to half of plot region height
        }
        else {
            this.plotEl.setStyle('padding', '0');
            this.getStudyAxisPanel().setVisible(false);
        }
    },

    // FOR TESTING USE
    showPlotDataGrid : function() {
        window.open(LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {
            schemaName: this.dataQWP.schema, 'query.queryName': this.dataQWP.query
        }), '_blank');
    }
});
