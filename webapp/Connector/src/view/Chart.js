/*
 * Copyright (c) 2014-2016 LabKey Corporation
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

    xGutterHeight: 90,

    yGutterWidth: 125,

    yNoGutterWidth: 24,

    logGutterWidth: 30,

    xGutterName: 'xGutterPlot',

    yGutterName: 'yGutterPlot',

    studyAxisWidthOffset: 150,

    minStudyAxisHeight: 75,

    disableAutoMsg: false,

    initiatedBrushing: '',

    filtersActivated: false,

    isStudyAxisExpanded: false,

    statics: {
        // Template used for contents of VisitTag tooltips
        studyAxisTipTpl: new Ext.XTemplate(
            '<tpl if="isAggregate">',
                '<tpl for="groups">',
                    '<div style="margin: 0 20px; text-indent: -20px">',
                        '<span style="font-weight: bold;">{label:htmlEncode}: </span>',
                        '{tags:this.renderTags}',
                    '</div>',
                '</tpl>',
            '<tpl else>',
                '<tpl for="groups">',
                    '<div style="margin: 0 20px; text-indent: -20px">',
                        '<span style="font-weight: bold;">{label:htmlEncode}: </span>',
                        '<tpl if="isVaccination">',
                            '{desc:htmlEncode}',
                            '<br/>',
                            '{tags:this.renderTags}',
                        '<tpl else>',
                            '{tags:this.renderTags}',
                        '</tpl>',
                    '</div>',
                '</tpl>',
            '</tpl>',
            {
                renderTags: function(tags) {
                    return Ext.htmlEncode(tags.join(', '));
                }
            }
        )
    },

    constructor : function(config) {

        if (LABKEY.devMode) {
            PLOT = this;
        }

        Ext.apply(config, {
            activeMeasures: {
                x: null,
                y: null,
                color: null
            },
            isActiveView: true,
            refreshRequired: true,
            initialized: false
        });

        Ext.applyIf(config, {
            hasStudyAxisData: false
        });

        var params = LABKEY.ActionURL.getParameters();
        if (Ext.isDefined(params['maxRows'])) {
            var num = parseInt(params['maxRows']);
            if (Ext.isNumber(num)) {
                this.binRowLimit = num;
            }
        }
        if (Ext.isDefined(params['_disableAutoMsg'])) {
            this.disableAutoMsg = true;
        }

        this.callParent([config]);

        this.addEvents('userplotchange', 'updateplotrecord');

        this.labelTextColor = ChartUtils.colors.HEATSCALE1;
        this.labelTextHltColor = ChartUtils.colors.WHITE;
        this.labelBkgdColor = ChartUtils.colors.WHITE;
        this.labelBkgdHltColor = ChartUtils.colors.SELECTED;
    },

    initComponent : function() {

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
            configs: [{
                element: this,
                beginEvent: 'showload',
                endEvent: 'hideload'
            }]
        });

        this.addPlugin({
            ptype: 'messaging',
            calculateY : function(cmp, box, msg) {
                return box.y - 10;
            }
        });

        this.on('beforehide', this.hideVisibleWindow);

        this.applyIEPolyfills();
    },

    applyIEPolyfills: function() {
        if (!Ext.isFunction(CustomEvent)) {
            // Code from: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
            var CustomEvent = function(event, options) {
                options = options || { bubbles: false, cancelable: false, detail: undefined };
                var e = document.createEvent('CustomEvent');
                e.initCustomEvent(event, options.bubbles, options.cancelable, options.detail);
                return e;
            };

            CustomEvent.prototype = window.Event.prototype;

            window.CustomEvent = CustomEvent;
        }
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
                        html: 'No data to plot. Try other assay dimensions, change variables, or remove filters.'
                    }]
                }
            });
        }

        return this.emptyplotmsg;
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
                margin: '16 0 0 24',
                layout: {
                    type: 'hbox',
                    pack: 'start'
                },
                items: [this.getYSelector()]
            },{
                xtype: 'container',
                flex: 1,
                margin: '16 0 0 0',
                layout: {
                    type: 'vbox',
                    pack: 'center',
                    align: 'center'
                },
                items: [
                    this.getHeatmapModeIndicator(),
                    this.getMedianModeIndicator()
                ]
            },{
                xtype: 'container',
                margin: '16 24 0 0',
                layout: {
                    type: 'hbox',
                    pack: 'end'
                },
                items: [this.getColorSelector()]
            }]
        };
    },

    getHeatmapModeIndicator : function() {
        if (!this.heatmapIndicator) {
            this.heatmapIndicator = Ext.create('Ext.Component', {
                hidden: true,
                cls: 'plotmodeon',
                html: 'Heatmap on',
                width: 110,
                listeners: {
                    scope: this,
                    afterrender : function(c) {
                        c.getEl().on('mouseover', function() { this.showWhyBinning(); }, this);
                        c.getEl().on('mouseout', function() { this.fireEvent('hideheatmapmsg', this); }, this);
                    }
                }
            });
        }

        return this.heatmapIndicator;
    },

    getMedianModeIndicator : function() {
        if (!this.medianIndicator) {
            this.medianIndicator = Ext.create('Ext.Component', {
                hidden: true,
                cls: 'plotmodeon',
                html: 'Median values',
                width: 115,
                listeners: {
                    scope: this,
                    afterrender : function(c) {
                        c.getEl().on('mouseover', function() { this.showWhyMedian(); }, this);
                        c.getEl().on('mouseout', function() { this.fireEvent('hidemedianmsg', this); }, this);
                    }
                }
            });
        }

        return this.medianIndicator;
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
                        c.getEl().on('mouseover', function() { this.showWhyBinning(); }, this);
                        c.getEl().on('mouseout', function() { this.fireEvent('hideheatmapmsg', this); }, this);
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
                    pack: 'start'
                },
                items: [
                    this.getMainPlotPanel(),
                    this.getBottomPlotPanel()
                ],
                width: '100%'
            });
        }
        return this.centerContainer;
    },

    getMainPlotPanel : function() {
        if (!this.mainPlotPanel)
        {
            this.mainPlotPanel = Ext.create('Ext.panel.Panel', {
                border: false,
                width: '100%',
                flex: 10,
                cls: 'plot',
                listeners: {
                    afterrender: {
                        fn: function(box) {
                            this.plotEl = box.getEl();
                        },
                        single: true,
                        scope: this
                    }
                }
            });
        }

        return this.mainPlotPanel;
    },

    getBottomPlotPanel : function() {
        if (!this.bottomPlotPanel) {
            this.bottomPlotPanel = Ext.create('Ext.panel.Panel', {
                border: false,
                frame: false,
                width: '100%',
                overflowY: 'auto',
                items: [{
                    xtype: 'component',
                    autoEl: 'div',
                    cls: 'bottomplot',
                    width: '100%'
                }],
                margin: '0 0 12 0',
                listeners: {
                    afterrender: {
                        fn: function(box) {
                            this.bottomPlotEl = box.down().getEl();
                        },
                        single: true,
                        scope: this
                    }
                }
            });
        }

        return this.bottomPlotPanel;
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
        ChartUtils.brushClear.call(this, {}, null, true);
        this.fireEvent('hideload', this);
    },

    attachInternalListeners : function() {

        // TODO: This resize task can still cause double-rendering
        // TODO: Repro: Load a chart, drag a selection. Switch to the grid. Reload. Go back to the chart (double render)
        this.resizeTask = new Ext.util.DelayedTask(function() {
            Connector.getState().onReady(this.handleResize, this);
        }, this);

        this.hideHeatmapModeTask = new Ext.util.DelayedTask(function() {
            this.fireEvent('hideheatmapmsg', this);
        }, this);
        this.hideMedianModeTask = new Ext.util.DelayedTask(function() {
            this.fireEvent('hidemedianmsg', this);
        }, this);

        this.on('resize', function() {
            this.plotEl.update('');
            this.bottomPlotEl.update('');
            this.getBottomPlotPanel().setVisible(false);
            this.getNoPlotMsg().hide();
            this.getEmptyPlotMsg().hide();

            this.resizeTask.delay(300);
        }, this);
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

    getPlotSize : function(box, properties, scales)
    {
        var size = {
                width: box.width,
                height: box.height
            },
            discretePlotWidth;

        if (this.requireStudyAxis && this.hasStudyAxisData)
        {
            size.width = box.width - this.studyAxisWidthOffset;
        }
        else if (this.requireYGutter)
        {
            size.width = box.width - this.yGutterWidth;
        }

        // for discrete x-axis, expand width for large number of discrete values
        if (Ext.isDefined(properties) && Ext.isObject(properties.xaxis) && !properties.xaxis.isContinuous && !this.requireYGutter)
        {
            var xValueCount = scales && scales.x && Ext.isArray(scales.x.domain) ? scales.x.domain.length : properties.xaxis.discreteValueCount;
            discretePlotWidth = xValueCount * 50;
            if (discretePlotWidth > size.width)
            {
                size.width = discretePlotWidth;
                size.extended = true;
            }
        }

        return size;
    },

    handleResize : function() {

        if (!this.isActiveView) {
            return;
        }

        if (this.ywin) {
            this.updateSelectorWindow(this.ywin);
        }

        if (this.xwin) {
            this.updateSelectorWindow(this.xwin);
        }

        if (this.colorwin) {
            this.updateSelectorWindow(this.colorwin);
        }

        this.redrawPlot();
        this.resizeMessage();

        if (Ext.isFunction(this.highlightSelectedFn)) {
            this.highlightSelectedFn();
        }
    },

    redrawPlot : function() {
        if (Ext.isDefined(this.lastInitPlotParams)) {
            if (this.lastInitPlotParams.noplot) {
                this.noPlot(this.lastInitPlotParams.emptyPlot, this.lastInitPlotParams.chartData);
            }
            else {
                this.initPlot(this.lastInitPlotParams.chartData, this.lastInitPlotParams.studyAxisInfo);
            }
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

    mouseOverPoints : function(event, data, layerSel, point, layerScope, plotName) {
        if (!layerScope.isBrushed) {
            data.isMouseOver = true;
            this.highlightPlotData(null, [data.subjectId]);
        }
    },

    mouseOutPoints : function(event, data, layerSel, point, layerScope) {
        if (!layerScope.isBrushed) {
            data.isMouseOver = false;
            this.clearHighlightedData();
            this.highlightSelected();
        }
    },

    mouseOverBins : function(event, data, layerSel, bin, layerScope, plotName) {
        if (!layerScope.isBrushed) {
            var subjectIds = [];
            data.forEach(function(b) {
                b.isMouseOver = true;
                subjectIds.push(b.data.subjectId);
            });

            this.highlightPlotData(null, subjectIds);
        }
    },

    mouseOutBins : function(event, data, layerSel, bin, layerScope) {
        if (!layerScope.isBrushed) {
            data.forEach(function(b) {
                b.isMouseOver = false;
            });
            this.clearHighlightedData();
            this.highlightSelected();
        }
    },

    mouseUpPoints : function(event, data, layerSel, point, layerScope, plotName) {
        //wait for brushend to fire to clear brushing state, mouseup individual point will clear isBrushed on brushend
        if (!this.showPointToolTipTask) {
            this.showPointToolTipTask = new Ext.util.DelayedTask(function(point, data, layerScope, plotName) {
                if (layerScope.isBrushed)
                    return;
                this.pointClickTooltip(point, data, plotName);
            }, this);
        }
        this.showPointToolTipTask.delay(150, undefined, this, [point, data, layerScope, plotName]);
    },

    mouseUpBins : function(event, datas, layerSel, point, layerScope, plotName) {
        //wait for brushend to fire to clear brushing state, mouseup individual bin will clear isBrushed on brushend
        if (!this.showBinToolTipTask) {
            this.showBinToolTipTask = new Ext.util.DelayedTask(function(point, datas, layerScope, plotName) {
                if (layerScope.isBrushed)
                    return;
                this.binClickTooltip(point, datas, plotName);
            }, this);
        }
        this.showBinToolTipTask.delay(150, undefined, this, [point, datas, layerScope, plotName]);
    },

    pointClickTooltip : function(point, data, plotName) {
        PlotTooltipUtils.loadPointTooltipData(this, point, data, plotName);
    },

    binClickTooltip : function(point, datas, plotName) {
        PlotTooltipUtils.loadBinTooltipData(this, point, datas, plotName);
    },

    getAxisDimensionsArray: function(axis) {
        var dimArray = [];
        if (axis) {
            var dimensions = axis.options.dimensions;
            for (var dim in axis.options.dimensions) {
                if (dimensions.hasOwnProperty(dim)) {
                    dimArray.push(dim);
                }
            }
        }
        return dimArray;
    },

    getLayerAes : function(layerScope, plotName) {

        var mouseOver = this.showPointsAsBin ? this.mouseOverBins : this.mouseOverPoints,
            mouseUp = this.showPointsAsBin ? this.mouseUpBins : this.mouseUpPoints,
            mouseOut = this.showPointsAsBin ? this.mouseOutBins : this.mouseOutPoints;

        return {
            mouseOverFn: Ext.bind(mouseOver, this, [layerScope, plotName], true),
            mouseOutFn: Ext.bind(mouseOut, this, [layerScope], true),
            mouseUpFn: Ext.bind(mouseUp, this, [layerScope, plotName], true)
        };
    },

    getBinLayer : function(layerScope, plotNullPoints, plotName) {
        return new LABKEY.vis.Layer({
            geom: new LABKEY.vis.Geom.Bin({
                shape: 'square',
                colorDomain: [0,50], // issue 23469: Dataspace gutter plot bin shading doesn't match main plot bin shading
                colorRange: [ChartUtils.colors.UNSELECTED, ChartUtils.colors.BLACK],
                size: 10, // for squares you want a bigger size
                plotNullPoints: plotNullPoints
            }),
            aes: this.getLayerAes.call(this, layerScope, plotName)
        });
    },

    getPointLayer : function(layerScope, plotNullPoints, plotName) {
        return new LABKEY.vis.Layer({
            geom: new LABKEY.vis.Geom.Point({
                size: 3,
                plotNullPoints: plotNullPoints,
                position: plotNullPoints ? 'jitter' : undefined,
                opacity: 0.5
            }),
            aes: this.getLayerAes.call(this, layerScope, plotName)
        });
    },

    getBoxLayer : function(layerScope) {
        var aes = this.getLayerAes.call(this, layerScope),
            me = this;

        aes.boxMouseOverFn = function(event, box, data) {
            var content = '', config;

            var roundQValue = function (value) {
                if (Math.abs(value) < 0.00001) {
                    // show the 1st significant digit, we don't want to show 0
                    return value.toPrecision(1);
                }
                else {
                    return parseFloat(value.toFixed(5));

                };
            };

            Ext.each(['Q1', 'Q2', 'Q3'], function(type) {
                content += '<p><span style="font-weight: bold;">' + type + '</span> ' + roundQValue(data.summary[type]) + '</p>';
            });

            config = {
                bubbleWidth: 120,
                target: box,
                placement: 'left',
                yOffset: box.getBBox().height / 2 - 55,
                arrowOffset: 35,
                title: data.name,
                content: content
            };

            ChartUtils.showCallout(config, 'hideboxplotmsg', me);
        };

        aes.boxMouseOutFn = function(event, box, data) {
            me.fireEvent('hideboxplotmsg');
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
            gridLinesVisible: 'both',
            borderWidth: 2,
            gridColor : ChartUtils.colors.GRAYBACKGROUND,
            bgColor: ChartUtils.colors.GRAYBACKGROUND,
            tickColor: ChartUtils.colors.WHITE,
            tickTextColor: this.labelTextColor // $heat-scale-1
        };
    },

    getMainPlotConfig : function(data, aes, scales, yAxisMargin, properties) {
        var size = this.getPlotSize(this.el.getSize(), properties, scales);

        var additionalWidth = this.requireStudyAxis && this.hasStudyAxisData ? this.studyAxisWidthOffset : this.requireYGutter ? this.yGutterWidth : 0;
        if (size.extended === true)
        {
            this.getCenter().addCls('plot-scroll');
            this.getMainPlotPanel().setWidth(size.width + additionalWidth);
            this.getBottomPlotPanel().setWidth(size.width + additionalWidth);
        }
        else
        {
            this.getCenter().removeCls('plot-scroll');
            this.getMainPlotPanel().setWidth(size.width + additionalWidth);
            this.getBottomPlotPanel().setWidth(size.width + additionalWidth);
        }

        var extraLeftMargin = 0, extraBottomMargin = 0;

        if (this.requireBothLogGutter || this.requireYLogGutter) {
            extraLeftMargin = this.logGutterWidth;
        }
        if (this.requireBothLogGutter || this.requireXLogGutter) {
            extraBottomMargin = this.logGutterWidth;
        }
        return Ext.apply(this.getBasePlotConfig(), {
            margins : {
                top: 25,
                left: yAxisMargin + (this.requireYGutter ? extraLeftMargin : this.yNoGutterWidth + (this.requireYLogGutter ? this.logGutterWidth : 0)),
                right: 50,
                bottom: size.extended === true ? 73 + extraBottomMargin: 53 + extraBottomMargin
            },
            width : size.width,
            height : this.plotEl.getSize().height,
            data : data,
            aes : aes,
            scales : scales,
            gridLineColor : ChartUtils.colors.SECONDARY,
            borderColor : ChartUtils.colors.HEATSCALE3,
            isMainPlot: true
        });
    },

    getGutterPlotConfig : function(aes, scales)
    {
        if (this.activeMeasures.color)
        {
            aes.color = function(row) {return row.color};
            aes.shape = function(row) {return row.color};

            scales.color = {
                scaleType: 'discrete',
                range: LABKEY.vis.Scale.DataspaceColor()
            };
            scales.shape = {
                scaleType: 'discrete',
                range: LABKEY.vis.Scale.DataspaceShape()
            };
        }

        return Ext.apply(this.getBasePlotConfig(), {
            aes : aes,
            scales : scales,
            tickLength : 0,
            gridColor : ChartUtils.colors.WHITE,
            gridLineColor : ChartUtils.colors.GRIDLINE,
            borderColor : ChartUtils.colors.GRIDLINE
        });
    },

    getScaleConfigs : function(noplot, properties, chartData, studyAxisInfo, layerScope) {
        var scales = {}, domain;

        if (noplot)
        {
            scales.x = {
                scaleType: 'continuous',
                domain: [0, 0],
                tickFormat: ChartUtils.tickFormat.empty
            };

            scales.yLeft = {
                scaleType: 'continuous',
                domain: [0, 0],
                tickFormat: ChartUtils.tickFormat.empty
            };
        }
        else
        {
            if (Ext.isDefined(properties.xaxis) && properties.xaxis.name != null)
            {
                if (!properties.xaxis.isDimension && properties.xaxis.isContinuous)
                {
                    // Issue 24395: Fill out domain for brushing if no data in main plot and one gutter plot.
                    domain = chartData.getXDomain(studyAxisInfo);
                    if (this.requireYGutter && domain[0] == null && domain[1] == null)
                    {
                        domain = [0,1];
                    }

                    scales.x = {
                        scaleType: 'continuous',
                        domain: domain
                    };

                    if (properties.xaxis.isNumeric)
                    {
                        scales.x.tickFormat = ChartUtils.tickFormat.numeric;
                    }
                    else if (properties.xaxis.type === 'TIMESTAMP')
                    {
                        scales.x.tickFormat = ChartUtils.tickFormat.date;
                    }
                }
                else
                {
                    scales.x = {
                        scaleType: 'discrete',
                        tickCls: 'xaxis-tick-text',
                        tickRectCls: 'xaxis-tick-rect',
                        tickClick: Ext.bind(this.xAxisClick, this, [layerScope], true),
                        tickMouseOver: Ext.bind(this.xAxisMouseOver, this, [layerScope], true),
                        tickMouseOut: Ext.bind(this.xAxisMouseOut, this, [layerScope], true),
                        tickRectWidthOffset: 30,
                        tickRectHeightOffset: 30,
                        tickHoverText: function(value) { return value; },
                        fontSize: 9,
                        sortFn: function(a, b)
                        {
                            // sort empty category to the right side
                            if (a == ChartUtils.emptyTxt)
                            {
                                return 1;
                            }
                            else if (b == ChartUtils.emptyTxt)
                            {
                                return -1;
                            }
                            return LABKEY.app.model.Filter.sorters.natural(a, b);
                        }
                    };
                    if (studyAxisInfo) {
                        domain = chartData.getXDomain(studyAxisInfo, true);
                        scales.x.domain = domain;
                        scales.x.sortFn = function(a, b)
                        {
                            return a - b;
                        };
                        scales.x.sortMergedDomain = true;
                    }
                }
            }
            else
            {
                // simple x scale config if no x-axis variable selected (i.e. display as a single box plot)
                scales.x = {
                    scaleType: 'discrete',
                    tickFormat: ChartUtils.tickFormat.empty
                };
            }

            // Issue 24395: Fill out domain for brushing if no data in main plot and one gutter plot.
            domain = chartData.getYDomain();
            if (this.requireXGutter && domain[0] == null && domain[1] == null)
            {
                domain = [0,1];
            }

            scales.yLeft = {
                scaleType: 'continuous',
                tickFormat: ChartUtils.tickFormat.numeric,
                tickDigits: 7,
                domain: domain
            };

            if (this.activeMeasures.color)
            {
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

        return scales;
    },

    getAesConfigs : function()
    {
        var aes = {
            x: function(row) {return row.x;},
            yLeft: function(row) {return row.y}
        };

        if (this.activeMeasures.color)
        {
            aes.color = function(row) {return row.color};
            aes.shape = function(row) {return row.color};
        }

        return aes;
    },

    getPlotLayer : function(noplot, properties, layerScope) {
        if (!noplot) {
            if (Ext.isDefined(properties.xaxis) && !properties.xaxis.isDimension && properties.xaxis.isContinuous) {
                // Scatter. Binned if over max row limit.
                return this.showPointsAsBin ? this.getBinLayer(layerScope, false) : this.getPointLayer(layerScope, false);
            }
            else {
                // Box plot (aka 1D).
                return this.getBoxLayer(layerScope);
            }
        }

        return this.getNoPlotLayer();
    },

    /**
     * @param chartData
     * @param {object} [studyAxisInfo]
     * @param {boolean} [noplot=false]
     * @param {boolean} [emptyPlot=false]
     */
    initPlot : function(chartData, studyAxisInfo, noplot, emptyPlot)
    {
        if (this.isHidden())
        {
            // welp, that was a huge waste..
            // Consider: This could wrapped up in something like this.continue()
            // where if we do not continue, we will set refresh
            this.refreshRequired = true;
            return;
        }

        var allDataRows, properties, yAxisMargin = 65,
            layerScope = {plot: null, isBrushed: false},
            scaleConfig, aesConfig,
            plotConfig, gutterXPlotConfig, gutterYPlotConfig;

        noplot = Ext.isBoolean(noplot) ? noplot : false;

        // Issue 23731: hold onto last set of properties for resize/redraw
        this.lastInitPlotParams = {
            chartData: chartData,
            studyAxisInfo: studyAxisInfo,
            noplot: noplot,
            emptyPlot: emptyPlot
        };

        // get the data rows for the chart
        if (chartData instanceof Connector.model.ChartData) {
            allDataRows = chartData.getDataRows();
            properties = chartData.getProperties();
        }
        else {
            allDataRows = {
                main: chartData.rows,
                totalCount: chartData.rows.length
            };
        }

        this.requireXGutter = Ext.isDefined(allDataRows) && Ext.isDefined(allDataRows.undefinedY) && allDataRows.undefinedY.length > 0;
        this.requireYGutter = Ext.isDefined(allDataRows) && Ext.isDefined(allDataRows.undefinedX) && allDataRows.undefinedX.length > 0;

        this.requireYLogGutter = Ext.isDefined(allDataRows) && Ext.isDefined(allDataRows.logNonPositiveX) && allDataRows.logNonPositiveX;
        this.requireXLogGutter = Ext.isDefined(allDataRows) && Ext.isDefined(allDataRows.logNonPositiveY) && allDataRows.logNonPositiveY;

        // not used for now. if there is data with both x and y <= 0, then both x and y log gutter will always show
        this.requireBothLogGutter = Ext.isDefined(allDataRows) && Ext.isDefined(allDataRows.logNonPositiveBoth) && allDataRows.logNonPositiveBoth;

        this.minXPositiveValue = Ext.isDefined(allDataRows) ? allDataRows.minPositiveX : 0.00001;
        this.minYPositiveValue = Ext.isDefined(allDataRows) ? allDataRows.minPositiveY : 0.00001;

        this.allDataRowsMap = Ext.isDefined(allDataRows) ? allDataRows.allRowsMap : {};

        this.hasDimensionalAggregators = Ext.isDefined(allDataRows) ? allDataRows.hasDimensionalAggregators : false;

        this.plotEl.update('');
        this.bottomPlotEl.update('');
        var studyAxisSize = 0;
        if (studyAxisInfo) {
            studyAxisSize = studyAxisInfo.getData().length;
            if (this.isStudyAxisExpanded) {
                Ext.each(studyAxisInfo.getData(), function(data) {
                    studyAxisSize += data.groups.length;
                });
            }
        }
        this.resizePlotContainers(studyAxisSize);

        if (this.plot) {
            this.plot.clearGrid();
            this.plot = null;
        }

        this.logRowCount(allDataRows);

        this.showPointsAsBin = allDataRows ? allDataRows.totalCount > this.binRowLimit : false;
        ChartUtils.BRUSH_DELAY = this.showPointsAsBin ? 0 : ChartUtils.calculateDelay(allDataRows.totalCount);
        this.toggleHeatmapMode();

        this.showAsMedian = chartData instanceof Connector.model.ChartData ? chartData.usesMedian() : false;
        this.toggleMedianMode();

        var me = this;
        this.highlightSelectedFn = function() {
            if (me.plot && !layerScope.isBrushed) {
                me.highlightLabels.call(me, me.plot, me.getCategoricalSelectionValues(), me.labelTextHltColor, me.labelBkgdHltColor, true);
                me.highlightSelected.call(me);
            }
        };

        this.selectionInProgress = null;
        this.mouseOverInProgress = null;

        scaleConfig = this.getScaleConfigs(noplot, properties, chartData, studyAxisInfo, layerScope);
        aesConfig = this.getAesConfigs();
        plotConfig = this.getMainPlotConfig(allDataRows.main, aesConfig, scaleConfig, yAxisMargin, properties);

        if (!noplot) {
            // set the scale type to linear or log
            var xScaleType = this.setScaleType(plotConfig.scales.x, 'x');
            var yScaleType = this.setScaleType(plotConfig.scales.yLeft, 'y');

            this.clickTask = new Ext.util.DelayedTask(function(node, view, name, target, multi) {
                if (layerScope.isBrushed) {
                    this.clearAllBrushing.call(view, layerScope);
                }
                this.runXAxisSelectAnimation(node, view, name, target, multi);
            }, this);

            if (Ext.isFunction(this.highlightSelectedFn)) {
                this.highlightSelectedFn();
            }

            // configure gutters
            if (this.requireXGutter) {
                gutterXPlotConfig = this.generateXGutter(plotConfig, chartData, allDataRows, yAxisMargin, properties, layerScope);
                gutterXPlotConfig.isShowYAxis = this.requireYLogGutter;
                gutterXPlotConfig.requireYLogGutter = this.requireYLogGutter;
                gutterXPlotConfig.requireXLogGutter = this.requireXLogGutter;
                gutterXPlotConfig.minXPositiveValue = this.minXPositiveValue;
                gutterXPlotConfig.minYPositiveValue = this.minYPositiveValue;
                Ext.apply(gutterXPlotConfig.scales.xTop, {trans : xScaleType});
                Ext.apply(gutterXPlotConfig.scales.xTop, {domain : chartData.getXDomain(studyAxisInfo)});
            }

            if (this.requireYGutter) {
                gutterYPlotConfig = this.generateYGutter(plotConfig, chartData, allDataRows, properties, layerScope);
                gutterYPlotConfig.isShowXAxis = this.requireXLogGutter;
                gutterYPlotConfig.requireYLogGutter = this.requireYLogGutter;
                gutterYPlotConfig.requireXLogGutter = this.requireXLogGutter;
                gutterYPlotConfig.minXPositiveValue = this.minXPositiveValue;
                gutterYPlotConfig.minYPositiveValue = this.minYPositiveValue;
                Ext.apply(gutterYPlotConfig.scales.yRight, {trans : yScaleType});
            }
        }

        if (!noplot && this.requireYGutter) {

            // render the gutter
            if (!this.renderGutter(this.yGutterName, gutterYPlotConfig, layerScope)) {
                return;
            }

            // If using color variables sync color and shape with yGutter plot if it exists
            if (this.activeMeasures.color)
            {
                var plotLayer = this.yGutterPlot.layers[0];
                if (Ext.isDefined(plotLayer.geom.colorScale)) {
                    plotConfig.scales.color = plotLayer.geom.colorScale;
                }
                if (Ext.isDefined(plotLayer.geom.shapeScale)) {
                    plotConfig.scales.shape = plotLayer.geom.shapeScale;
                }
            }
        }

        if (chartData instanceof Connector.model.ChartData) {
            plotConfig.requireBothLogGutter = this.requireBothLogGutter;
            plotConfig.requireYLogGutter = this.requireYLogGutter;
            plotConfig.requireXLogGutter = this.requireXLogGutter;
            plotConfig.minXPositiveValue = this.minXPositiveValue;
            plotConfig.minYPositiveValue = this.minYPositiveValue;
        }

        this.plot = new LABKEY.vis.Plot(plotConfig);

        layerScope.plot = this.plot; // hoisted for mouseover/mouseout event listeners

        if (this.plot) {
            this.plot.addLayer(this.getPlotLayer(noplot, properties, layerScope));
            try {
                this.hidePlotMsg();
                this.plot.render();

                if (!noplot && this.activeMeasures.color)
                {
                    var legends = this.plot.getLegendData();
                    if (this.activeMeasures.color.variableType == 'TIME') {
                        legends = ChartUtils.sortTimeLegends(legends);
                    }
                    this.getColorSelector().setLegend(legends);
                }
            }
            catch(err) {
                this.showMessage(err.message, true);
                this.fireEvent('hideload', this);
                this.plot = null;
                this.plotEl.update('');
                this.bottomPlotEl.update('');
                this.noPlot(false);
                console.error(err);
                console.error(err.stack);
                return;
            }
        }

        if (!noplot && this.requireXGutter) {

            // If using color variables sync color and shape with yGutter plot if it exists
            if (this.activeMeasures.color && this.plot)
            {
                var plotLayer = this.plot.layers[0];
                if (Ext.isDefined(plotLayer.geom.colorScale)) {
                    gutterXPlotConfig.scales.color = plotLayer.geom.colorScale;
                }
                if (Ext.isDefined(plotLayer.geom.shapeScale)) {
                    gutterXPlotConfig.scales.shape = plotLayer.geom.shapeScale;
                }
            }

            // render the gutter
            gutterXPlotConfig.renderTo = this.bottomPlotEl.id;
            if (!this.renderGutter(this.xGutterName, gutterXPlotConfig, layerScope)) {
                return;
            }
        }

        this.clearAllBrushing = function() {
            this.plot.clearBrush();
            if (this.xGutterPlot) {
                this.xGutterPlot.clearBrush();
            }
            if (this.yGutterPlot) {
                this.yGutterPlot.clearBrush();
            }

            layerScope.isBrushed = false;
            this.clearHighlightedData();
            this.highlightSelected();
        };

        if (!noplot) {
            this.plot.setBrushing(this.bindBrushing(layerScope, properties, 'main', this.xGutterPlot, this.yGutterPlot));
            if (this.xGutterPlot) {
                this.xGutterPlot.setBrushing(this.bindBrushing(layerScope, properties, 'xTop', this.xGutterPlot, this.yGutterPlot));
            }
            if (this.yGutterPlot) {
                this.yGutterPlot.setBrushing(this.bindBrushing(layerScope, properties, 'yRight', this.xGutterPlot, this.yGutterPlot));
            }
        }

        if (Ext.isDefined(studyAxisInfo)) {
            this.initStudyAxis(studyAxisInfo, layerScope, properties);
        }

        if (!noplot) {
            this.handleDensePlotBrushEvent(this.plot);
        }
        if (this.yGutterPlot) {
            this.handleDensePlotBrushEvent(this.yGutterPlot);
        }
        if (this.xGutterPlot) {
            this.handleDensePlotBrushEvent(this.xGutterPlot);
        }

        this.fireEvent('hideload', this);
    },

    handleDensePlotBrushEvent : function(plot) {
        var selector, svgEl, brushNode, newClickEvent;

        // Allow brushing in dense plot by creating and passing a new click event to the brush layer
        if (Ext.isDefined(plot.renderer)) {
            selector = this.showPointsAsBin ? '.vis-bin' : '.point';
            plot.renderer.canvas.selectAll(selector).on('mousedown', function() {
                svgEl = plot.renderer.canvas[0][0];
                var brushElements = svgEl.getElementsByClassName ? svgEl.getElementsByClassName('brush') : svgEl.querySelectorAll('.brush');
                brushNode = d3.select(brushElements[0]).node();

                newClickEvent = new CustomEvent('mousedown');
                newClickEvent.pageX = d3.event.pageX;
                newClickEvent.clientX = d3.event.clientX;
                newClickEvent.pageY = d3.event.pageY;
                newClickEvent.clientY = d3.event.clientY;
                brushNode.dispatchEvent(newClickEvent);
            });
        }
    },

    bindBrushing : function(layerScope, properties, dimension, xGutterPlot, yGutterPlot) {
        var onBrush = this.showPointsAsBin ? ChartUtils.brushBins : ChartUtils.brushPoints,
            brushFn,
            brushingExtent,
            _dimension = dimension;

        // determine brush handling based on dimension
        if (dimension === 'main') {
            _dimension = !properties.xaxis.isDimension && properties.xaxis.isContinuous ? 'both' : 'y';
            brushFn = function(event, layerData, extent, plot) {
                if (this.initiatedBrushing != 'main') {
                    return;
                }

                brushingExtent = Ext.clone(extent);

                onBrush.call(this, event, layerData, extent, plot);

                var xIsNull = extent[0][0] === null && extent[1][0] === null,
                    yIsNull = extent[0][1] === null && extent[1][1] === null;

                if (yIsNull && !xIsNull && xGutterPlot) {
                    xGutterPlot.setBrushExtent(brushingExtent);
                    if (yGutterPlot)
                        yGutterPlot.clearBrush();
                }
                else if (xIsNull && !yIsNull && yGutterPlot) {
                    yGutterPlot.setBrushExtent(brushingExtent);
                    if (xGutterPlot)
                        xGutterPlot.clearBrush();
                }
                else if (!xIsNull && !yIsNull) {
                    if (xGutterPlot)
                        xGutterPlot.clearBrush();
                    if (yGutterPlot)
                        yGutterPlot.clearBrush();
                }
            };
        }
        else {
            // gutter brushing
            brushFn = function(event, layerData, extent, plot) {
                if (this.initiatedBrushing != dimension)
                    return;

                brushingExtent = Ext.clone(extent);

                onBrush.call(this, event, layerData, extent, plot);
                this.plot.setBrushExtent(brushingExtent);

                if ((dimension == 'xTop' || dimension == 'x') && yGutterPlot) {
                    yGutterPlot.clearBrush();
                }
                if ((dimension == 'yRight' || dimension == 'y') && xGutterPlot) {
                    xGutterPlot.clearBrush();
                }
            };
        }

        return {
            fillColor: ChartUtils.colors.SELECTEDBG,
            strokeColor: ChartUtils.colors.SELECTED,
            handleLen: 70,
            dimension: _dimension,
            brushstart: Ext.bind(ChartUtils.brushStart, this, [layerScope, dimension]),
            brush: Ext.bind(brushFn, this),
            brushend: Ext.bind(ChartUtils.brushEnd, this, [this.activeMeasures, properties, dimension], true),
            brushclear: Ext.bind(ChartUtils.brushClear, this, [layerScope, dimension])
        };
    },

    renderGutter : function(plotName, gutterPlotConfig, layerScope) {

        var success = true;
        var gutterPlot = new LABKEY.vis.Plot(gutterPlotConfig);

        layerScope[plotName] = gutterPlot;

        if (gutterPlot) {
            if (this.showPointsAsBin) {
                gutterPlot.addLayer(this.getBinLayer(layerScope, true, plotName));
            }
            else {
                gutterPlot.addLayer(this.getPointLayer(layerScope, true, plotName));
            }

            try {
                gutterPlot.render();
            }
            catch(err) {
                this.showMessage(err.message, true);
                this.fireEvent('hideload', this);
                this[plotName] = null;
                console.error(err);
                console.error(err.stack);
                success = false;
            }
        }
        else {
            success = false;
        }

        this[plotName] = gutterPlot;

        return success;
    },

    generateXGutter : function(plotConfig, chartData, allDataRows, yAxisMargin) {
        var gutterXMargins = {
            top: 0,
            left: yAxisMargin + (this.requireYGutter ? 0 : this.yNoGutterWidth),
            right: plotConfig.margins.right,
            bottom: 0
        };

        var me = this;
        var gutterXLabels = {
            y: {
                value: 'Undefined Y value',
                fontSize: 11,
                position: 8,
                rotate: 0,
                maxCharPerLine: 9,
                lineWrapAlign: 'end',
                cls: 'xGutter-label',
                bkgdColor: ChartUtils.colors.GRAYBACKGROUND,
                bkgdWidth: 70,
                listeners: {
                    mouseover: function() {
                        me._showWhyXGutter(chartData.getDataRows());
                    },
                    mouseout: function() {
                        me._closeWhyGutter();
                    }
                }
            }
        };

        var gutterXAes = {
            xTop: function(row) {return row.x;},
            y: function(row) {return 0;}
        };
        var gutterXScales = {
            xTop: {
                scaleType: 'continuous',
                tickFormat: ChartUtils.tickFormat.empty
            },
            yLeft: {
                scaleType: 'discrete',
                tickFormat: ChartUtils.tickFormat.empty
            }
        };

        return Ext.apply(this.getGutterPlotConfig(gutterXAes, gutterXScales), {
            gridLinesVisible: 'y',
            margins : gutterXMargins,
            width : plotConfig.width,
            height : this.xGutterHeight,
            data : allDataRows.undefinedY,
            labels : gutterXLabels
        });
    },

    generateYGutter : function(plotConfig, chartData, allDataRows) {
        var extraGutterBottom = 0;
        if (this.requireBothLogGutter || this.requireXLogGutter) {
            extraGutterBottom = 30;
        }
        var gutterYMargins = {
            top: plotConfig.margins.top,
            left: this.yNoGutterWidth,
            right: 0,
            bottom: plotConfig.margins.bottom - extraGutterBottom
        };

        var me = this;
        var gutterYLabels = {
            x: {
                value: 'Undefined X value',
                fontSize: 11,
                position: 45,
                cls: 'yGutter-label',
                maxCharPerLine: 10,
                lineWrapAlign: 'start',
                bkgdColor: ChartUtils.colors.GRAYBACKGROUND,
                bkgdHeight: 100,
                bkgdWidth: this.yGutterWidth - 15,
                listeners: {
                    mouseover: function() {
                        me._showWhyYGutter(chartData.getDataRows());
                    },
                    mouseout: function() {
                        me._closeWhyGutter();
                    }
                }
            }
        };

        var gutterYAes = {
            x: function(row) {return 0;},
            yRight: function(row) {return row.y;}
        };

        var gutterYScales = {
            x: {
                scaleType: 'discrete',
                tickFormat: ChartUtils.tickFormat.empty
            },
            yRight: {
                scaleType: 'continuous',
                domain: chartData.getYDomain(),
                tickFormat: ChartUtils.tickFormat.empty
            }
        };

        return Ext.apply(this.getGutterPlotConfig(gutterYAes, gutterYScales), {
            gridLinesVisible: 'x',
            margins : gutterYMargins,
            width : this.yGutterWidth,
            height : plotConfig.height,
            data : allDataRows.undefinedX,
            labels : gutterYLabels
        });

    },

    logRowCount : function(allDataRows)
    {
        if (LABKEY.devMode)
        {
            console.log('total plotted rows:', allDataRows.totalCount);
            if (allDataRows && allDataRows.undefinedX)
            {
                console.log('plotted y gutter rows:', allDataRows.undefinedX.length);
            }
            if (allDataRows && allDataRows.undefinedY)
            {
                console.log('plotted x gutter rows:', allDataRows.undefinedY.length);
            }
        }
    },

    xAxisClick : function(e, selection, target, index, y, layerScope) {
        var multi = e.ctrlKey||e.shiftKey||e.metaKey, nodes, node = null;

        // If a selection in progress have to wait until done
        if (this.selectionInProgress != null)
        {
            return;
        }

        // Skip adding a selection for the 'undefined' box plot click for non-demographic variables.
        if (target == ChartUtils.emptyTxt && this.activeMeasures.x && !this.activeMeasures.x.isDemographic)
        {
            return;
        }

        this.selectionInProgress = target;

        // node is needed for animation
        if (layerScope.plot.renderer) {
            nodes = layerScope.plot.renderer.canvas.selectAll('.tick-text text');
            nodes[0].forEach(function(n) {
                if (n.innerHTML === target) {
                    node = n;
                }
            });

            if (this.activeMeasures.x)
            {
                var wrappedX = this.getWrappedMeasures()[0];

                if (this.activeMeasures.x.variableType === 'TIME') {
                    this.convertWrappedTimeMeasure(wrappedX);
                }

                this.clickTask.delay(150, null, null, [(node ? node : e.target), this, QueryUtils.ensureAlignmentAlias(wrappedX), target, multi]);
            }
            else
            {
                console.warn('xAxisClick() occurred without a valid activeMeasures.x');
            }
        }
    },

    xAxisMouseOut : function(target, index, y, layerScope) {
        // Do not do mouse over/out for selected labels or labels in process of selection
        if (!layerScope.isBrushed && !this.isSelection(target) && this.selectionInProgress == null) {
            // Clear plot highlights
            this.clearHighlightedData();
            this.highlightSelected();

            // Clear label highlighting
            var targets = [];
            targets.push(target);
            this.highlightLabels.call(this, this.plot, targets, this.labelTextColor, this.labelBkgdColor, false);
        }
        this.mouseOverInProgress = null;
    },

    xAxisMouseOver : function(target, index, y, layerScope) {
        // Do not do mouse over/out for selected labels or labels in process of selection
        if (!layerScope.isBrushed && !this.isSelection(target) && this.selectionInProgress == null) {
            this.highlightPlotData(target);

            // Highlight label
            var targets = [];
            targets.push(target);
            this.highlightLabels.call(this, this.plot, targets, this.labelTextColor, this.labelBkgdHltColor, false);
        }
        else if (this.selectionInProgress != null && this.selectionInProgress != target) {
            this.mouseOverInProgress = target;
        }
    },

    retrieveBinSubjectIds : function(plot, target, subjects, isStudyAxis) {
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
            var studyAxisSelections = this.getStudyAxisSelectionValues();
            var hasStudyAxisSelection = this.isStudyAxisSelection();

            bins.each(function(d)
            {
                // Check if value matches target or another selection
                for (var i = 0; i < d.length; i++)
                {
                    var data = d[i].data;
                    var isTimeAxisTarget = false;

                    if (data.x !== undefined && data.x !== null && data.x.toString() === target) { // use toString for boolean value
                        d[i].isMouseOver = true;
                    }
                    else if (isStudyAxis){
                        if (data.timeAxisKey.indexOf(target) > -1) {
                            d[i].isMouseOver = true;
                            isTimeAxisTarget = true;
                        }
                        else if (hasStudyAxisSelection){
                            Ext.each(studyAxisSelections, function(sel){
                                if (data.timeAxisKey.indexOf(sel) > -1){
                                    d[i].isMouseOver = true;
                                    isTimeAxisTarget = true;
                                }
                            });
                        }
                    }

                    if ((data.x !== undefined && data.x !== null && data.x.toString() === target && subjectIds.indexOf(data.subjectId) === -1)
                        || (selections.indexOf(data.x) != -1 && subjectIds.indexOf(data.subjectId) === -1)
                        || (isTimeAxisTarget))
                    {
                        subjectIds.push(data.subjectId);
                    }
                }
            });
        }

        return subjectIds;
    },

    highlightBins : function(target, subjects, isStudyAxis) {
        // get the set of subjectIds in the binData
        var subjectIds = this.retrieveBinSubjectIds(this.plot, target, subjects, isStudyAxis);
        if (subjects) {
            subjects.forEach(function(s) {
                subjectIds.push(s);
            });
        }

        if (this.plot.renderer) {
            var isSubjectInMouseBin = function(d, yesVal, noVal, sameSubjectVal) {
                var isHightLight = false, isAssociated = false;
                if (d.length > 0 && d[0].data) {
                    for (var i = 0; i < d.length; i++) {
                        if (d[i].isMouseOver) {
                            isHightLight = true;
                        }
                        else if (subjectIds.indexOf(d[i].data.subjectId) != -1) {
                            isAssociated = true;
                        }
                    }
                }

                return isHightLight ? yesVal : isAssociated ? sameSubjectVal : noVal;
            };

            var colorFn = function(d)
            {
                // keep original color of the bin (note: uses style instead of fill attribute)
                d.origStyle = d.origStyle || this.getAttribute('style');

                return isSubjectInMouseBin(d, 'fill: ' + ChartUtils.colors.SELECTED, d.origStyle, 'fill: ' + ChartUtils.colors.BLACK);
            };

            var opacityFn = function(d)
            {
                return isSubjectInMouseBin(d, 1, 0.15, 1);
            };

            this.highlightBinsByCanvas(this.plot.renderer.canvas, colorFn, opacityFn);

            if (this.requireXGutter && Ext.isDefined(this.xGutterPlot)) {
                this.highlightBinsByCanvas(this.xGutterPlot.renderer.canvas, colorFn, opacityFn);
            }

            if (this.requireYGutter && Ext.isDefined(this.yGutterPlot)) {
                this.highlightBinsByCanvas(this.yGutterPlot.renderer.canvas, colorFn, opacityFn);
            }
        }
    },

    highlightBinsByCanvas : function(canvas, colorFn, opacityFn) {
        canvas.selectAll('.vis-bin path').attr('style', colorFn)
            .attr('fill-opacity', opacityFn)
            .attr('stroke-opacity', opacityFn);
    },

    clearHighlightBins : function() {
        if (this.plot.renderer) {
            var bins = this.plot.renderer.canvas.selectAll('.vis-bin path');
            bins.each(function(d) {
                for (var i = 0; i < d.length; i++) {
                    d[i].isMouseOver = false;
                }
            });

            this.clearBinsByCanvas(this.plot.renderer.canvas);

            if (this.requireXGutter && Ext.isDefined(this.xGutterPlot)) {
                this.clearBinsByCanvas(this.xGutterPlot.renderer.canvas);
            }

            if (this.requireYGutter && Ext.isDefined(this.yGutterPlot)) {
                this.clearBinsByCanvas(this.yGutterPlot.renderer.canvas);
            }
        }
    },

    clearBinsByCanvas : function(canvas) {
        canvas.selectAll('.vis-bin path')
                .attr('style', function(d) {return d.origStyle || this.getAttribute('style');})
                .attr('fill-opacity', 1)
                .attr('stroke-opacity', 1);
    },

    clearHighlightedData : function() {
        if (this.showPointsAsBin)
            this.clearHighlightBins();
        else
            this.clearHighlightPoints();
    },

    retrievePointSubjectIds : function(target, subjects, isStudyAxis) {
        var subjectIds = [];
        if (subjects) {
            subjects.forEach(function(s) {
                subjectIds.push(s);
            });
        }

        if (this.plot.renderer) {
            var points = this.plot.renderer.canvas.selectAll('.point path'),
                selections = this.getCategoricalSelectionValues(),
                studyAxisSelections = this.getStudyAxisSelectionValues(),
                hasStudyAxisSelection = this.isStudyAxisSelection(),
                subject;

            points.each(function(d) {
                var isTimeAxisTarget = false;
                if (d.x !== undefined && d.x !== null && d.x.toString() === target) { // use toString for boolean value
                    d.isMouseOver = true;
                }
                else if (isStudyAxis) {
                    if (d.timeAxisKey.indexOf(target) > -1) {
                        d.isMouseOver = true;
                        isTimeAxisTarget = true;
                    }
                    else if (hasStudyAxisSelection){
                        Ext.each(studyAxisSelections, function(sel){
                            if (d.timeAxisKey.indexOf(sel) > -1){
                                d.isMouseOver = true;
                                isTimeAxisTarget = true;
                            }
                        });

                    }
                }

                subject = d.subjectId;

                // Check if value matches target or another selection
                if (subjectIds.indexOf(subject) === -1) {
                    if (d.x !== undefined && d.x !== null && d.x.toString() === target) {
                        subjectIds.push(subject);
                    }
                    else if (selections.indexOf(d.x) != -1) {
                        subjectIds.push(subject);
                    }
                    else if (isTimeAxisTarget) {
                        subjectIds.push(subject);
                    }
                }
            });
        }

        return subjectIds;
    },

    highlightPlotData : function(target, subjects, isStudyAxis) {
        if (this.showPointsAsBin) {
            this.highlightBins(target, subjects, isStudyAxis);
        }
        else {
            this.highlightPoints(target, subjects, isStudyAxis);
        }
    },

    highlightPoints : function(target, subjects, isStudyAxis) {
        var subjectIds = this.retrievePointSubjectIds(target, subjects, isStudyAxis);

        var fillColorFn = function(d) {
            if (d.isMouseOver) {
                return ChartUtils.colors.SELECTED;
            }
            else if (subjectIds.indexOf(d.subjectId) != -1) {
                return ChartUtils.colors.BLACK;
            }
            return ChartUtils.colors.UNSELECTED;
        };

        if (this.plot.renderer) {
            this.highlightPointsByCanvas(this.plot.renderer.canvas, fillColorFn);

            if (this.requireXGutter && Ext.isDefined(this.xGutterPlot)) {
                this.highlightPointsByCanvas(this.xGutterPlot.renderer.canvas, fillColorFn);
            }

            if (this.requireYGutter && Ext.isDefined(this.yGutterPlot)) {
                this.highlightPointsByCanvas(this.yGutterPlot.renderer.canvas, fillColorFn);
            }
        }
    },

    highlightPointsByCanvas : function(canvas, fillColorFn) {
        canvas.selectAll('.point path')
            .attr('fill', fillColorFn).attr('fill-opacity', 1)
            .attr('stroke', fillColorFn).attr('stroke-opacity', 1);

        // Re-append the node so it is on top of all the other nodes, this way highlighted points are always visible. (issue 24076)
        canvas.selectAll('.point path[fill="' + ChartUtils.colors.BLACK + '"]').each(function() {
            var node = this.parentNode;
            node.parentNode.appendChild(node);
        });
        canvas.selectAll('.point path[fill="' + ChartUtils.colors.SELECTED + '"]').each(function() {
            var node = this.parentNode;
            node.parentNode.appendChild(node);
        });
    },

    clearHighlightColorFn : function() {
        var colorScale = null, colorAcc = null;

        if (this.plot.scales.color && this.plot.scales.color.scale) {
            colorScale = this.plot.scales.color.scale;
            colorAcc = this.plot.aes.color;
        }

        return function(d) {
            if (colorScale && colorAcc) {
                return colorScale(colorAcc.getValue(d));
            }

            return ChartUtils.colors.BLACK;
        };
    },

    clearHighlightPoints : function() {
        var points = this.plot.renderer.canvas.selectAll('.point path');
        points.each(function(d) {
            d.isMouseOver = false;
        });

        if (this.plot.renderer) {
            this.clearPointsByCanvas(this.plot.renderer.canvas, this.clearHighlightColorFn());

            if (this.requireXGutter && Ext.isDefined(this.xGutterPlot)) {
                this.clearPointsByCanvas(this.xGutterPlot.renderer.canvas, this.clearHighlightColorFn());
            }

            if (this.requireYGutter && Ext.isDefined(this.yGutterPlot)) {
                this.clearPointsByCanvas(this.yGutterPlot.renderer.canvas, this.clearHighlightColorFn());
            }
        }
    },

    clearPointsByCanvas : function(canvas, colorFn) {
        canvas.selectAll('.point path')
                .attr('fill', colorFn)
                .attr('stroke', colorFn)
                .attr('fill-opacity', 0.5)
                .attr('stroke-opacity', 0.5);
    },

    highlightSelected : function() {
        if (this.isStudyAxisSelection()){
            this.highlightTimeAxisPlotData();
        }
        else {
            var targets = this.getCategoricalSelectionValues(), me = this;
            me.clearHighlightedData();

            targets.forEach(function(t) {
                me.highlightPlotData(t);
            })
        }
    },

    isStudyAxisSelection: function (){
        var selections = Connector.getState().getSelections();
        var isStudyAxis = false;
        if (Ext.isArray(selections)) {
            Ext.each(selections, function(s) {
                if (s.get('isStudyAxis')){
                    isStudyAxis = true;
                }
            });
        }
        return isStudyAxis;
    },

    getCategoricalSelectionValues : function() {
        var selections = Connector.getState().getSelections();
        var values = [];
        selections.forEach(function(s) {
            var gridData = s.get('gridFilter');
            if (s.get('isTime')) {
                gridData = s.get('timeFilters');
            }
            for (var i = 0; i < gridData.length; i++) {
                if (gridData[i] != null && Ext.isString(gridData[i].getValue())) {
                    values = gridData[i].getValue().split(';');
                    break;
                }
            }
        });

        // issue 24244: special handling for 'undefined' categorical selection
        for (var i = 0; i < values.length; i++) {
            if (values[i] == '') {
                values[i] = ChartUtils.emptyTxt;
            }
        }

        return values;
    },

    isSelection : function(target) {
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

    highlightLabels : function(plot, targets, textColor, bgColor, clearOthers) {

        var me = this;

        if (targets.length < 1) {
            this.clearHighlightLabels(plot);
        }

        targets.forEach(function(target) {
            if (plot.renderer) {
                var tickFillOpacityFn = function(t) {
                    if (target === t || me.isSelection(t))
                        return 1;
                    return 0;
                };

                var tickFillFn = function(t) {
                    if (target === t)
                        return bgColor;

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

                var ticks = plot.renderer.canvas.selectAll('.tick-text rect.highlight');
                ticks.attr('fill', tickFillFn);
                ticks.attr('fill-opacity', tickFillOpacityFn);

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
     * @param {Boolean} [fromBrush=false]
     * @param {Boolean} [allowInverseFilter=false]
     */
    createSelectionFilter : function(sqlFilters, fromBrush, allowInverseFilter)
    {
        // construct an 'aggregated' filter
        if (fromBrush && this.showAsMedian)
        {
            Connector.getState().addSelection({
                gridFilter: sqlFilters,
                members: Ext.Object.getKeys(this.brushedSubjects),
                operator: LABKEY.app.model.Filter.OperatorTypes.OR,
                filterSource: 'GETDATA',
                isAggregated: true
            }, true, false, true);
        }
        else
        {
            // examine the sqlFilters to determine which measures to include
            var selection = {
                gridFilter: sqlFilters,
                plotMeasures: [null, null],
                isPlot: true,
                isGrid: true,
                operator: LABKEY.app.model.Filter.OperatorTypes.OR,
                filterSource: 'GETDATA',
                isWhereFilter: true,
                showInverseFilter: allowInverseFilter === true
            };

            this.buildSelection('x', selection, function(sel)
            {
                this.buildSelection('y', sel, function(s)
                {
                    Connector.getState().addSelection(s, true, false, true);
                }, this);
            }, this);
        }
    },

    buildSelection : function(axis, selection, callback, scope)
    {
        if (axis === 'x')
        {
            if (selection.gridFilter[0] || selection.gridFilter[1])
            {
                selection.plotMeasures[0] = this._getAxisWrappedMeasure(this.activeMeasures.x);

                // Create a 'time filter'
                if (this.activeMeasures.x.variableType === 'TIME')
                {
                    this.convertWrappedTimeMeasure(selection.plotMeasures[0]);

                    var timeFilters = [selection.gridFilter[0]];
                    if (this.activeMeasures.x.options['timeAxisType'] === 'Continuous')
                    {
                        timeFilters.push(selection.gridFilter[1]);
                    }

                    Connector.getFilterService().getTimeFilter(selection.plotMeasures[0], timeFilters, function(_filter)
                    {
                        selection.isTime = true;
                        selection.timeMeasure = Ext.clone(selection.plotMeasures[0]);
                        selection.timeFilters = timeFilters;
                        selection.gridFilter[0] = _filter;
                        selection.gridFilter[1] = null;

                        callback.call(scope, selection);
                    }, this);
                }
                else
                {
                    callback.call(scope, selection);
                }
            }
            else
            {
                callback.call(scope, selection);
            }
        }
        else if (axis === 'y')
        {
            if (selection.gridFilter[2] || selection.gridFilter[3])
            {
                selection.plotMeasures[1] = this._getAxisWrappedMeasure(this.activeMeasures.y);
            }

            callback.call(scope, selection);
        }
        else
        {
            throw 'Unsupported axis "' + axis + '" requested to buildSelection()';
        }
    },

    convertWrappedTimeMeasure : function(wrappedMeasure) {
        // Issue 29397: continuous vs categorical time filters should not override each other
        var timeAxisType = wrappedMeasure.measure.options['timeAxisType'];
        if (timeAxisType === 'Categorical')
        {
            // replace the current selection measure and filter with the categorical/discrete version of the time point measure
            var discreteTimeMeasure = Connector.getQueryService().getMeasure(wrappedMeasure.measure.alias + '_Discrete');
            if (discreteTimeMeasure) {
                var newWrappedXMeasure = Ext.clone(discreteTimeMeasure);
                newWrappedXMeasure.options = Ext.clone(wrappedMeasure.measure.options);
                wrappedMeasure.measure = newWrappedXMeasure;
            }
        }
    },

    afterSelectionAnimation : function(node, view, name, target, multi) {
        var sqlFilters = [null, null, null, null],
            selections = Connector.getState().getSelections(),
            type = LABKEY.Filter.Types.EQUAL,
            allowInverseFilter = true, values = '', data;

        if (multi) {
            for (var i=0; i < selections.length; i++) {
                data = selections[i].get('gridFilter')[0];
                if (selections[i].get('isTime')) {
                    data = selections[i].get('timeFilters')[0];
                }
                if (data.getColumnName() === name) {
                    values = values.concat(data.getValue()).concat(';');
                }
            }
        }

        // issue 24244: filtering for emptyTxt category needs to apply a different filter
        values = values.concat(target == ChartUtils.emptyTxt || target == 'null' ? '' : target);

        if (multi && selections.length > 0) {
            type = LABKEY.Filter.Types.EQUALS_ONE_OF;
        }
        else if (target == ChartUtils.emptyTxt || target == 'null') {
            type = LABKEY.Filter.Types.ISBLANK;
            allowInverseFilter = false;
        }

        sqlFilters[0] = LABKEY.Filter.create(name, values, type);

        this.createSelectionFilter(sqlFilters, false /* fromBrush */, allowInverseFilter);
        this.selectionInProgress = null;
        this.highlightLabels(this.plot, this.getCategoricalSelectionValues(), this.labelTextHltColor, this.labelBkgdHltColor, false);

        if (this.mouseOverInProgress != null)
        {
            this.highlightLabels(this.plot, [this.mouseOverInProgress], this.labelTextColor, this.labelBkgdHltColor, false);
            this.highlightPlotData(this.mouseOverInProgress);
            this.mouseOverInProgress = null;
        }

    },

    getScale : function(axis) {
        var scale = 'linear';

        if (axis == 'y' && this.activeMeasures.y)
        {
            scale = this.getSelectedOptionScale(this.activeMeasures.y);
        }
        else if (axis == 'x' && this.activeMeasures.x)
        {
            scale = this.getSelectedOptionScale(this.activeMeasures.x);
        }

        return scale.toLowerCase();
    },

    getSelectedOptionScale : function(selected) {
        return (selected.options && selected.options.scale) ? selected.options.scale : selected.defaultScale;
    },

    setScaleType : function(scale, axis) {
        var scaleType = this.getScale(axis);

        if (scale.scaleType !== 'discrete')
        {
            Ext.apply(scale, {trans : scaleType});
        }

        return scaleType;
    },

    /**
     * This allows the active measures to be set from the 'In the plot' filter
     * @param filter
     * @returns {boolean} hasMeasures
     */
    setActiveMeasureSelectionFromFilter : function(filter)
    {
        var plotMeasures = filter.get('plotMeasures'),
            x = plotMeasures[0],
            y = plotMeasures[1],
            color = plotMeasures[2],
            axisSelector,
            hasMeasures = false;

        if (x)
        {
            hasMeasures = true;

            this.activeMeasures.x = x.measure;
            this.getXSelector().getModel().updateVariable([this.activeMeasures.x]);

            axisSelector = this.getAxisSelectorIfInitialized('x');
            if (axisSelector)
            {
                axisSelector.setActiveMeasure(this.activeMeasures.x);
            }
        }

        if (y)
        {
            hasMeasures = true;

            this.activeMeasures.y = y.measure;
            this.getYSelector().getModel().updateVariable([this.activeMeasures.y]);

            axisSelector = this.getAxisSelectorIfInitialized('y');
            if (axisSelector)
            {
                axisSelector.setActiveMeasure(this.activeMeasures.y);
            }
        }

        if (color)
        {
            hasMeasures = true;

            this.activeMeasures.color = color.measure;
            this.getColorSelector().getModel().updateVariable([this.activeMeasures.color]);

            axisSelector = this.getAxisSelectorIfInitialized('color');
            if (axisSelector)
            {
                axisSelector.setActiveMeasure(this.activeMeasures.color);
            }
        }

        return hasMeasures;
    },

    clearPlotSelections : function() {
        this.clearAxisSelection('y');
        this.clearAxisSelection('x');
        this.clearAxisSelection('color');
    },

    clearAxisSelection : function(axis)
    {
        if (axis == 'y')
        {
            this.activeMeasures.y = null;
            this.getYSelector().clearModel();
        }
        else if (axis == 'x')
        {
            this.activeMeasures.x = null;
            this.getXSelector().clearModel();
        }
        else if (axis == 'color')
        {
            this.activeMeasures.color = null;
            this.getColorSelector().clearModel();
        }

        // Issue 24580: only update the variable selector if it has already been initialized
        var axisSelector = this.getAxisSelectorIfInitialized(axis);
        if (axisSelector)
        {
            axisSelector.clearSelection();
        }
    },

    onShowGraph : function()
    {
        if (this.isHidden())
        {
            this.refreshRequired = true;
        }
        else
        {
            this.refreshRequired = false;
            this.requireStudyAxis = false;

            if (this.filterClear)
            {
                this.clearPlotSelections();
            }

            if (this.activeMeasures.y)
            {
                this.fireEvent('showload', this);

                this.requireStudyAxis = this.activeMeasures.x && this.activeMeasures.x.variableType === 'TIME';

                this.requestChartData();
            }
            else
            {
                this.hideMessage();
                this.getBottomPlotPanel().setVisible(false);
                Connector.getState().clearSelections(true);
                this.filterClear = false;
                this.noPlot(false);

                this.fireEvent('updateplotrecord', this, 'Time points', false, -1);
                this.fireEvent('updateplotrecord', this, 'Antigens in X', false, -1);
                this.fireEvent('updateplotrecord', this, 'Antigens in Y', false, -1);
            }
        }
    },

    getAxisNameProperty : function(axis, xAxisNameProp, yAxisNameProp) {
        return (axis === 'x' ? xAxisNameProp : (axis === 'y' ? yAxisNameProp : ChartUtils.axisNameProp));
    },

    getAxisNameMeasureProperty : function(axis, x, y)
    {
        var useBaseAxisNameProp = ChartUtils.isSameSource(x, y)
                && ChartUtils.getAssayDimensionsWithDifferentValues(x, y).length == 0;

        if (useBaseAxisNameProp || (axis != 'x' && axis != 'y'))
        {
            return ChartUtils.axisNameProp;
        }
        else
        {
            return axis == 'x' ? ChartUtils.xAxisNameProp : ChartUtils.yAxisNameProp;
        }
    },

    setAxisNameMeasureProperty : function(measure, x, y)
    {
        var xAxisNameProp = this.getAxisNameMeasureProperty('x', x, y),
            yAxisNameProp = this.getAxisNameMeasureProperty('y', x, y);

        // if measure source matches x or y, set the wrapped measure axisName to match as well
        if (x && ChartUtils.isSameSource(measure, x))
        {
            measure.axisName = xAxisNameProp;
        }
        else if (y && ChartUtils.isSameSource(measure, y))
        {
            measure.axisName = yAxisNameProp;
        }
    },

    getWrappedMeasures : function()
    {
        var activeMeasures = this.activeMeasures,
            xAxisNameProp = this.getAxisNameMeasureProperty('x', activeMeasures.x, activeMeasures.y),
            yAxisNameProp = this.getAxisNameMeasureProperty('y', activeMeasures.x, activeMeasures.y);

        return [
            this._getAxisWrappedMeasure(activeMeasures.x, xAxisNameProp),
            this._getAxisWrappedMeasure(activeMeasures.y, yAxisNameProp),
            this._getColorWrappedMeasure(activeMeasures)
        ];
    },

    _getColorWrappedMeasure : function(activeMeasures)
    {
        var wrapped = null;

        if (activeMeasures.color && ChartUtils.hasValidColorMeasure(activeMeasures))
        {
            wrapped = {
                measure: Ext.clone(activeMeasures.color)
            };

            if (activeMeasures.color.variableType == 'TIME') {
                wrapped.dateOptions = {
                    interval: activeMeasures.color.alias
                };
            }

            this.setAxisNameMeasureProperty(wrapped.measure, activeMeasures.x, activeMeasures.y);
        }

        return wrapped;
    },

    _getAxisWrappedMeasure : function(measure, axis)
    {
        if (!measure)
        {
            return null;
        }

        var wrappedMeasure = {
                measure : Ext.clone(measure)
            },
            options = measure.options;

        if (Ext.isDefined(axis))
        {
            wrappedMeasure.measure.axisName = axis;
        }

        if (measure.variableType == 'TIME')
        {
            var interval = measure.alias;
            measure.interval = interval;
            wrappedMeasure.dateOptions = {
                interval: interval
            };

            // handle visit tag alignment for study axis
            if (options && options.alignmentVisitTag !== undefined)
            {
                wrappedMeasure.dateOptions.zeroDayVisitTag = options.alignmentVisitTag;
            }
        }
        else if (this.requireStudyAxis || (measure.isDemographic && Connector.model.ChartData.isContinuousMeasure(measure)))
        {
            // Issue 24002: Gutter plot for null y-values and study axis are appearing at the same time
            wrappedMeasure.filterArray = [LABKEY.Filter.create(measure.alias, null, LABKEY.Filter.Types.NOT_MISSING)];
        }

        return wrappedMeasure;
    },

    /**
     * Returns a metadata object containing the measures, wrappedMeasures, and a hasPlotSelectionFilter object.
     * The measures/wrappedMeasures are established from the current 'activeMeasures'. The hasPlotSelectionFilter
     * object has a property for each axis (x/y) stating if that axis is being affected directly by a "plot selection"
     * filter in the app.
     * @param {Array} [stateFilterSet=undefined] - Array of filters (and/or selections) from the application to include in the measureSet.
     * @returns {{measures: (*|Array), wrapped: (*|Array), hasPlotSelectionFilter: (*|Object)}}
     */
    getMeasureSet : function(stateFilterSet)
    {
        var activeMeasures = this.activeMeasures,
            measures = this.getAdditionalMeasures(activeMeasures),
            wrappedMeasures = this.getWrappedMeasures(),
            hasPlotSelectionFilter = {x: false, y: false};

        // if no set of filters was supplied, default to using the application state filters
        if (!Ext.isArray(stateFilterSet))
        {
            stateFilterSet = Connector.getState().getFilters();
        }

        Ext.each(wrappedMeasures, function(wrapped)
        {
            if (wrapped)
            {
                measures.push(wrapped);
            }
        });

        // set of measures from data filters
        if (Ext.isArray(stateFilterSet))
        {
            var xAxisName = this.getAxisNameMeasureProperty('x', activeMeasures.x, activeMeasures.y),
                yAxisName = this.getAxisNameMeasureProperty('y', activeMeasures.x, activeMeasures.y),
                hasX = activeMeasures.x !== null,
                hasY = activeMeasures.y !== null;

            Ext.each(stateFilterSet, function(filter)
            {
                if (filter.isGrid())
                {
                    if (hasX && (filter.isPlot() || activeMeasures.x.variableType !== 'TIME'))
                    {
                        var xMeasures = filter.getPlotAxisMeasures(xAxisName, activeMeasures.x, ChartUtils.filterMeasureComparator);
                        if (xMeasures.length > 0)
                        {
                            measures = measures.concat(xMeasures);

                            /*
                             * Issue 27773: unexplained gutter plot
                             * An non-aggregated filter on x or y would exclude 'null' on x or y, and as a result should hide y gutter or x gutter, respectively.
                             */
                            if (filter.isPlot() && filter.get('gridFilter')[0] && filter.get('gridFilter')[0].getColumnName() === activeMeasures.x.alias)
                            {
                                    hasPlotSelectionFilter.x = true;
                            }
                        }
                    }

                    if (hasY)
                    {
                        var yMeasures = filter.getPlotAxisMeasures(yAxisName, activeMeasures.y, ChartUtils.filterMeasureComparator);
                        if (yMeasures.length > 0)
                        {
                            measures = measures.concat(yMeasures);

                            if (filter.isPlot() && filter.get('gridFilter')[2] && filter.get('gridFilter')[2].getColumnName() === activeMeasures.y.alias)
                            {
                                    hasPlotSelectionFilter.y = true;
                            }
                        }
                    }
                }
            }, this);
        }

        return {
            measures: measures,
            wrapped: wrappedMeasures,
            hasPlotSelectionFilter: hasPlotSelectionFilter
        };
    },

    /**
     * This creates a temp query via cds getData which is then used to query for unique participants, and is also what
     * we use to back the chart data (via an AxisMeasureStore).
     */
    requestChartData : function()
    {
        this.fireEvent('maskplotrecords');

        Connector.getFilterService().getSubjects(function(subjectFilter)
        {
            var measureSet = this.getMeasureSet();
            ChartUtils.applySubjectValuesToMeasures(measureSet.measures, subjectFilter);

            // Request Chart MeasureStore Data
            var extraFilters = null;
            var filterSet = Connector.getState().getFilters();
            Ext.each(filterSet, function(filter)
            {
                if (filter.get('isStudyAxis')) {
                    if (filter.get('studyAxisFilter') && filter.get('studyAxisFilter')['_COMPOUND']) {
                        if (!extraFilters) {
                            extraFilters = [];
                        }
                        extraFilters.push(filter.get('studyAxisFilter')['_COMPOUND'][0]);
                        extraFilters[0].isStudyAxis = true;
                        var queryService = Connector.getQueryService(),
                            subjectVisitMeasure = queryService.getMeasure(QueryUtils.SUBJECT_SEQNUM_ALIAS);

                        measureSet.measures.push({measure: subjectVisitMeasure});
                    }
                }
            });
            Connector.getQueryService().getMeasureStore(measureSet.measures, extraFilters, function(measureStore)
            {
                this.onChartDataSuccess(measureStore, measureSet);
            }, this.onFailure, this);
        }, this);
    },

    onChartDataSuccess : function(measureStore, measureSet)
    {
        var chartData = Ext.create('Connector.model.ChartData', {
            measureSet: measureSet.measures,
            hasPlotSelectionFilter: measureSet.hasPlotSelectionFilter,
            plotMeasures: this.getWrappedMeasures(),
            measureStore: measureStore,
            plotScales: {
                x: this.getScale('x'),
                y: this.getScale('y')
            }
        });

        this.dataQWP = {
            schema: chartData.getSchemaName(),
            query: chartData.getQueryName()
        };

        this.hasStudyAxisData = false;

        if (this.requireStudyAxis)
        {
            this.getStudyAxisData(chartData);
        }
        else if (chartData.getDataRows().totalCount == 0)
        {
            // show empty plot message if we have no data in main plot or gutter plots
            this.noPlot(true, chartData);
        }
        else
        {
            this.initPlot(chartData);
        }

        this.fireEvent('hidetooltipmsg');
        this.updatePlotInfoPaneCounts({forSubcounts: false, queryName: this.dataQWP.query});
    },

    getSelectedHierarchicalOptionAlias : function(activeMeasure)
    {
        var hierOptionAlias,
            measure,
            isHierarchical,
            valueFilterAlias,
            selectedFilterValue;

        if (Ext.isObject(activeMeasure))
        {
            Ext.each(activeMeasure.dimensions, function(dimAlias)
            {
                measure = Connector.getQueryService().getMeasureRecordByAlias(dimAlias);
                isHierarchical = Ext.isDefined(measure.get('hierarchicalSelectionParent'));
                valueFilterAlias = measure.get('distinctValueFilterColumnAlias');

                // if the measure is hierarchical, then check if it is the selected data summary level (i.e. distinctValueFilterColumnValue)
                if (isHierarchical && Ext.isObject(activeMeasure.options) && Ext.isObject(activeMeasure.options.dimensions)
                        && Ext.isArray(activeMeasure.options.dimensions[valueFilterAlias]))
                {
                    selectedFilterValue = activeMeasure.options.dimensions[valueFilterAlias].join(',');
                    if (selectedFilterValue == measure.get('distinctValueFilterColumnValue'))
                    {
                        hierOptionAlias = measure.getFilterMeasure().get('alias');
                        return false;
                    }
                }
            }, this);
        }

        return hierOptionAlias;
    },

    getDistinctAntigenCaseSql : function(antigenAlias, otherAntigenAlias, datasetKey)
    {
        return 'CASE WHEN IFDEFINED(' + QueryUtils.DATASET_ALIAS + ') IS NOT NULL'
             + '  THEN (CASE WHEN IFDEFINED(' + QueryUtils.DATASET_ALIAS + ') = \'' + datasetKey + '\' THEN ' + antigenAlias + ' ELSE NULL END)'
             + '  ELSE ' + antigenAlias
             + ' END';
},

    updatePlotInfoPaneCounts : function(config)
    {
        var yAntigenAlias = this.getSelectedHierarchicalOptionAlias(this.activeMeasures.y),
            xAntigenAlias = this.getSelectedHierarchicalOptionAlias(this.activeMeasures.x),
            nonTimeFilterSet = [],
            measureSet,
            sql;

        // get the full set of non-timepoint filters from the state and the related measureSet for those fitlers
        Ext.each(Connector.getState().getFilters(), function(filter)
        {
            if (!filter.isTime() || filter.isPlot())
            {
                nonTimeFilterSet.push(filter);
            }
        });
        measureSet = this.getMeasureSet(nonTimeFilterSet).measures;

        // generate the SQL to get the distinct value counts for the timepoints and selected x and y axis antigen column
        sql = 'SELECT GROUP_CONCAT(DISTINCT ' + QueryUtils.VISITROWID_ALIAS + ') AS VisitRowIds';
        if (Ext.isString(yAntigenAlias))
        {
            sql += ',\nCOUNT(DISTINCT ' + this.getDistinctAntigenCaseSql(yAntigenAlias, xAntigenAlias, ChartUtils.yAxisNameProp) + ') AS YAntigenCount';
        }
        if (Ext.isString(xAntigenAlias))
        {
            sql += ',\nCOUNT(DISTINCT ' + this.getDistinctAntigenCaseSql(xAntigenAlias, yAntigenAlias, ChartUtils.xAxisNameProp) + ') AS XAntigenCount';
        }

        // we either select from the temp query name provided by the requestChartData request or use the generated sql
        sql += '\nFROM (' + (config.queryName || config.sql)  + ')';

        LABKEY.Query.executeSql({
            schemaName: Connector.studyContext.schemaName,
            sql: sql,
            scope: this,
            success: function(data) {
                var hasDataRow = Ext.isArray(data.rows) && data.rows.length == 1,
                    timepointCount, xCount = -1, yCount = -1,
                    visitRowIds = [];

                if (hasDataRow && Ext.isDefined(data.rows[0]['VisitRowIds'][0]))
                {
                    Ext.each(data.rows[0]['VisitRowIds'][0].split(','), function(id)
                    {
                        visitRowIds.push(parseInt(id));
                    });
                }
                timepointCount = visitRowIds.length;
                this.fireEvent('updateplotrecord', this, 'Time points', config.forSubcounts, timepointCount, measureSet, visitRowIds);

                if (Ext.isString(xAntigenAlias) && hasDataRow)
                {
                    xCount = data.rows[0]['XAntigenCount'];
                }
                this.fireEvent('updateplotrecord', this, 'Antigens in X', config.forSubcounts, xCount);

                if (Ext.isString(yAntigenAlias) && hasDataRow)
                {
                    yCount = data.rows[0]['YAntigenCount'];
                }
                this.fireEvent('updateplotrecord', this, 'Antigens in Y', config.forSubcounts, yCount);

                this.fireEvent('unmaskplotrecords');
            }
        });
    },

    _showWhyXGutter : function(data)
    {
        var percent = Ext.util.Format.round((data.undefinedY.length / data.totalCount) * 100, 2);

        ChartUtils.showCallout({
            bubbleWidth: 230,
            target: document.querySelector("svg g text.xGutter-label"),
            placement: 'top',
            title: 'Points with undefined Y value: ' + percent + '%',
            content: 'Data points may have no matching Y value due to differing visits, antigens, or assay dimensions. Vertical positions are randomized to show density. See Help for more details.',
            xOffset: 0
        }, 'hideguttermsg', this);
    },

    _showWhyYGutter : function(data)
    {
        var percent = Ext.util.Format.round((data.undefinedX.length / data.totalCount) * 100, 2);

        ChartUtils.showCallout({
            bubbleWidth: 230,
            target: document.querySelector("svg g text.yGutter-label"),
            placement: 'right',
            title: 'Points with undefined X value: ' + percent + '%',
            content: 'Data points may have no matching X value due to differing visits, antigens, or assay dimensions. Horizontal positions are randomized to show density. See Help for more details.',
            yOffset: -100,
            arrowOffset: 100
        }, 'hideguttermsg', this);
    },

    _closeWhyGutter : function() {
        this.fireEvent('hideguttermsg', this);
    },

    toggleHeatmapMode : function() {
        this.getColorSelector().setDisabled(this.showPointsAsBin);
        this.getHeatmapModeIndicator().setVisible(this.showPointsAsBin);

        // Show binning message for a few seconds if first time user hits it
        var msgKey = 'HEATMAP_MODE';
        if (!this.disableAutoMsg && this.showPointsAsBin && Connector.getService('Messaging').isAllowed(msgKey)) {
            this.showWhyBinning();
            this.hideHeatmapModeTask.delay(5000);
            Connector.getService('Messaging').block(msgKey);
        }
    },

    showWhyBinning : function() {
        if (this.showPointsAsBin) {
            var config = {
                target: this.getHeatmapModeIndicator().getEl().dom,
                placement: 'bottom',
                title: 'Heatmap on',
                xOffset: -65,
                arrowOffset: 100,
                content: 'There are too many dots to show interactively. Higher data density is represented by darker'
                + ' tones. Color variables are disabled. Reduce the amount of data plotted to see dots again.'
            };

            ChartUtils.showCallout(config, 'hideheatmapmsg', this);
        }
    },

    toggleMedianMode : function() {
        this.getMedianModeIndicator().setVisible(this.showAsMedian);

        // Show median message for a few seconds if first time user hits it
        var msgKey = 'MEDIAN_MODE';
        if (!this.disableAutoMsg && this.showAsMedian && Connector.getService('Messaging').isAllowed(msgKey)) {
            this.showWhyMedian();
            this.hideMedianModeTask.delay(5000);
            Connector.getService('Messaging').block(msgKey);
        }
    },

    showWhyMedian : function() {
        if (this.showAsMedian) {
            var config = {
                target: this.getMedianModeIndicator().getEl().dom,
                placement: 'bottom',
                title: 'Median values',
                xOffset: -65,
                arrowOffset: 100,
                content: 'To enable an x-y plot, each subject now has one dot for its median response value at each visit.'
                + ' To see individual responses, narrow the choices in the X and Y controls.'
            };

            ChartUtils.showCallout(config, 'hidemedianmsg', this);
        }
    },

    getAdditionalMeasures : function(activeMeasures)
    {
        // map key to schema, query, name, and values
        var measuresMap = {},
            additionalMeasuresArr = [],
            useBaseAxisNameProp = ChartUtils.isSameSource(activeMeasures.x, activeMeasures.y)
                    && ChartUtils.getAssayDimensionsWithDifferentValues(activeMeasures.x, activeMeasures.y).length == 0,
            xAxisNameProp = useBaseAxisNameProp ? ChartUtils.axisNameProp : ChartUtils.xAxisNameProp,
            yAxisNameProp = useBaseAxisNameProp ? ChartUtils.axisNameProp : ChartUtils.yAxisNameProp;


        Ext.each(['x', 'y'], function(axis)
        {
            var schema, query, measureRecord,
                axisName = this.getAxisNameProperty(axis, xAxisNameProp, yAxisNameProp);

            if (activeMeasures[axis])
            {
                schema = activeMeasures[axis].schemaName;
                query = activeMeasures[axis].queryName;

                // always add in the Container and SubjectId columns for a selected measure on the X or Y axis
                this.addValuesToMeasureMap(measuresMap, axisName, schema, query, 'Container', 'VARCHAR');
                this.addValuesToMeasureMap(measuresMap, axisName, schema, query, Connector.studyContext.subjectColumn, 'VARCHAR');

                // include ParticipantSequenceNum to enable 'lazy' querying for point/bin tooltip information
                this.addValuesToMeasureMap(measuresMap, axisName, schema, query, 'ParticipantSequenceNum', 'VARCHAR');

                // only add the SequenceNum column for selected measures that are not demographic and no time point
                if (!activeMeasures[axis].isDemographic && activeMeasures[axis].variableType != 'TIME') 
                {
                    this.addValuesToMeasureMap(measuresMap, axisName, schema, query, 'SequenceNum', 'DOUBLE');
                }

                if (activeMeasures[axis].variableType === 'TIME')
                {
                    this.addValuesToMeasureMap(
                            measuresMap,
                            axisName,
                            Connector.studyContext.gridBaseSchema,
                            Connector.studyContext.gridBase,
                            'Study',
                            'VARCHAR'
                    );
                    this.addValuesToMeasureMap(
                            measuresMap,
                            axisName,
                            Connector.studyContext.gridBaseSchema,
                            Connector.studyContext.gridBase,
                            'TreatmentSummary',
                            'VARCHAR'
                    );

                    this.addValuesToMeasureMap(
                            measuresMap,
                            axisName,
                            Connector.studyContext.gridBaseSchema,
                            Connector.studyContext.gridBase,
                            'ProtocolDay',
                            'INTEGER'
                    );

                    this.addValuesToMeasureMap(
                            measuresMap,
                            axisName,
                            Connector.studyContext.gridBaseSchema,
                            Connector.studyContext.gridBase,
                            'VisitRowId',
                            'INTEGER'
                    );
                }

                // add selection information from the advanced options panel of the variable selector
                if (activeMeasures[axis].options && activeMeasures[axis].options.dimensions) 
                {
                    Ext.iterate(activeMeasures[axis].options.dimensions, function(alias, values)
                    {
                        // null or undefined mean "select all" so don't apply a filter
                        if (!Ext.isDefined(values) || values == null)
                        {
                            values = [];
                        }

                        measureRecord = Connector.getQueryService().getMeasureRecordByAlias(alias);
                        this.addValuesToMeasureMap(measuresMap, axisName, schema, query, measureRecord.get('name'), measureRecord.get('type'), values);
                    }, this);
                }
            }
        }, this);

        Ext.iterate(measuresMap, function(k, m)
        {
            additionalMeasuresArr.push({
                measure: Connector.model.Measure.createMeasureRecord(m)
            });
        });

        return additionalMeasuresArr;
    },

    addValuesToMeasureMap : function(measureMap, axis, schema, query, name, type, values)
    {
        var key = schema + '|' + query + '|' + name + '|' + axis;

        if (!measureMap[key]) 
        {
            measureMap[key] = {
                axis: axis,
                schemaName: schema,
                queryName: query,
                name: name,
                type: type,
                values: [] 
            };
        }

        if (!Ext.isEmpty(values))
        {
            measureMap[key].values = Ext.Array.unique(measureMap[key].values.concat(values));
        }
    },

    /**
     * Update the values within the 'In the plot' filter
     */
    updatePlotBasedFilter : function()
    {
        this.plotLock = true;

        var state = Connector.getState(),
            wrapped = this.getMeasureSet().wrapped,
            sqlFilters = [null, null, null, null],
            inPlotFilter;

        // see if filter already exists
        Ext.each(state.getFilters(), function(filter)
        {
            if (filter.isPlot() && !filter.isGrid())
            {
                inPlotFilter = filter;
                return false;
            }
        });

        if (inPlotFilter)
        {
            // update
            state.modifyFilter(inPlotFilter, {
                gridFilter: sqlFilters,
                plotMeasures: wrapped
            });
        }
        else
        {
            // create
            state.prependFilter({
                gridFilter: sqlFilters,
                isPlot: true,
                isGrid: false,
                hierarchy: 'Subject',
                plotMeasures: wrapped,
                filterSource: 'GETDATA',
                isWhereFilter: false
            });
        }

        state.getApplication().fireEvent('plotmeasures');
    },

    noPlot : function(showEmptyMsg, chartData)
    {
        var map = [{
            x : null,
            xname : 'X-Axis',
            y : null,
            yname : 'Y-Axis',
            subjectId: null
        }];

        this.initPlot({
            rows: map
        }, undefined, true, showEmptyMsg);

        this.getNoPlotMsg().setVisible(!showEmptyMsg);
        this.resizePlotMsg(this.getNoPlotMsg(), this.plotEl.getBox());

        this.getEmptyPlotMsg().setVisible(showEmptyMsg);
        this.resizePlotMsg(this.getEmptyPlotMsg(), this.plotEl.getBox());
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

    updateSelectorWindow : function(win)
    {
        if (win)
        {
            win.setHeight(this.getBox().height-100);
            win.center();
        }
        else
        {
            console.warn('Failed to updated measure selection');
        }
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

    // Issue 23585: panel remains even if underlying page changes
    hideVisibleWindow : function() {
        if (Ext.isObject(this.visibleWindow)) {
            this.visibleWindow.hide();
        }
    },

    getAxisSelectorIfInitialized : function(axis)
    {
        var axisSelector;

        if (axis == 'y')
        {
            if (Ext.isDefined(this.yAxisSelector))
            {
                axisSelector = this.getYAxisSelector();
            }
        }
        else if (axis == 'x')
        {
            if (Ext.isDefined(this.xAxisSelector))
            {
                axisSelector = this.getXAxisSelector();
            }
        }
        else if (axis == 'color')
        {
            if (Ext.isDefined(this.colorAxisSelector))
            {
                axisSelector = this.getColorAxisSelector();
            }
        }

        return axisSelector;
    },

    getYAxisSelector : function() {
        if (!this.yAxisSelector) {
            this.yAxisSelector = Ext.create('Connector.panel.Selector', {
                plotAxis: 'y',
                headerTitle: 'y-axis',
                testCls: 'y-axis-selector',
                activeMeasure: this.activeMeasures.y,
                sourceMeasureFilter: {
                    queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS,
                    includeHidden: this.canShowHidden,
                    includeDefinedMeasureSources: true,
                    measuresOnly: true
                },
                listeners: {
                    selectionmade: function(selected) {
                        this.clearVisibleWindow();

                        this.activeMeasures.y = selected;
                        this.getYSelector().getModel().updateVariable([selected]);

                        this.variableSelectionMade(this.ywin, this.getYSelector().getEl());
                    },
                    cancel: function() {
                        this.clearVisibleWindow();

                        this.ywin.hide(this.getYSelector().getEl());
                        // reset the selection back to previous active selection
                        this.yAxisSelector.setActiveMeasure(this.activeMeasures.y);
                    },
                    scope: this
                }
            });
        }

        return this.yAxisSelector;
    },

    showYMeasureSelection : function(showAntigenSelection)
    {
        var yAxisSelector = this.getYAxisSelector();

        if (!this.ywin)
        {
            this.ywin = this.createSelectorWindow(yAxisSelector);
        }

        yAxisSelector.loadSourceCounts();
        if (showAntigenSelection)
        {
            yAxisSelector.goToAntigenSelection();
        }

        this.ywin.show(this.getYSelector().getEl());
    },

    getXAxisSelector : function() {
        if (!this.xAxisSelector) {
            this.xAxisSelector = Ext.create('Connector.panel.Selector', {
                plotAxis: 'x',
                headerTitle: 'x-axis',
                testCls: 'x-axis-selector',
                activeMeasure: this.activeMeasures.x,
                sourceMeasureFilter: {
                    queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS,
                    includeHidden: this.canShowHidden,
                    includeDefinedMeasureSources: true,
                    includeTimepointMeasures: true,
                    userFilter : function(row) {
                        // for TIME variables, only show the ProtocolDay based non-discrete ones for the x-axis options
                        return row.variableType !== 'TIME' || (row.name === Connector.studyContext.protocolDayColumn && !row.isDiscreteTime);
                    }
                },
                listeners: {
                    selectionmade: function(selected) {
                        this.clearVisibleWindow();

                        this.activeMeasures.x = selected;
                        this.getXSelector().getModel().updateVariable([selected]);

                        this.variableSelectionMade(this.xwin, this.getXSelector().getEl());
                    },
                    remove: function() {
                        this.clearVisibleWindow();

                        this.clearAxisSelection('x');
                        this.variableSelectionMade(this.xwin, this.getXSelector().getEl());
                    },
                    cancel: function() {
                        this.clearVisibleWindow();

                        this.xwin.hide(this.getXSelector().getEl());
                        // reset the selection back to previous active selection
                        this.xAxisSelector.setActiveMeasure(this.activeMeasures.x);
                    },
                    scope: this
                }
            });
        }

        return this.xAxisSelector;
    },

    showXMeasureSelection : function(showAntigenSelection)
    {
        var xAxisSelector = this.getXAxisSelector();

        if (!this.xwin)
        {
            this.xwin = this.createSelectorWindow(xAxisSelector);
        }

        xAxisSelector.toggleRemoveVariableButton(this.activeMeasures.x !== null);
        xAxisSelector.loadSourceCounts();
        if (showAntigenSelection)
        {
            xAxisSelector.goToAntigenSelection();
        }

        this.xwin.show(this.getXSelector().getEl());
    },

    getColorAxisSelector : function() {
        if (!this.colorAxisSelector) {
            this.colorAxisSelector = Ext.create('Connector.panel.Selector', {
                headerTitle: 'color',
                testCls: 'color-axis-selector',
                disableAdvancedOptions: true,
                activeMeasure: this.activeMeasures.color,
                sourceMeasureFilter: {
                    queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS,
                    includeHidden: this.canShowHidden,
                    includeDefinedMeasureSources: true,
                    includeTimepointMeasures: true,
                    userFilter : function(row) {
                        // Don't show time with alignment even in dev mode
                        return !row.isMeasure && !(row.isDiscreteTime && row.hidden);
                    }
                },
                listeners: {
                    selectionmade: function(selected) {
                        this.clearVisibleWindow();

                        this.activeMeasures.color = selected;
                        this.getColorSelector().getModel().updateVariable([selected]);

                        this.variableSelectionMade(this.colorwin, this.getColorSelector().getEl());
                    },
                    remove: function() {
                        this.clearVisibleWindow();

                        this.clearAxisSelection('color');
                        this.variableSelectionMade(this.colorwin, this.getColorSelector().getEl());
                    },
                    cancel: function() {
                        this.clearVisibleWindow();

                        this.colorwin.hide(this.getColorSelector().getEl());
                        // reset the selection back to previous active selection
                        this.colorAxisSelector.setActiveMeasure(this.activeMeasures.color);
                    },
                    scope: this
                }
            });
        }

        return this.colorAxisSelector;
    },

    showColorSelection : function()
    {
        var colorAxisSelector = this.getColorAxisSelector();

        if (!this.colorwin)
        {
            this.colorwin = this.createSelectorWindow(colorAxisSelector);
        }

        colorAxisSelector.toggleRemoveVariableButton(this.activeMeasures.color !== null);
        colorAxisSelector.loadSourceCounts();

        this.colorwin.show(this.getColorSelector().getEl());
    },

    /**
     * This is called when a user explicitly sets a variable via a variable selector
     * @param win - The variable selector window that is current active
     * @param targetEl - The target element for the variable selector's animation
     */
    variableSelectionMade : function(win, targetEl)
    {
        if (this.activeMeasures.y)
        {
            Connector.getState().clearSelections(true);

            this.updatePlotBasedFilter();
            this.onShowGraph();

            win.hide(targetEl);

            this.fireEvent('userplotchange', this, {
                targetId : targetEl.id,
                x: this.activeMeasures.x,
                y: this.activeMeasures.y,
                color: this.activeMeasures.color
            });
        }
        else
        {
            // if we don't yet have a y-axis selection, show that variable selector
            win.hide(targetEl, this.showYMeasureSelection, this);
        }
    },

    createSelectorWindow : function(item) {
        var win = Ext.create('Ext.window.Window', {
            ui: 'axiswindow',
            minHeight: 580,
            maxHeight: Connector.panel.Selector.maximumHeight,
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
            items: [item],
            listeners: {
                scope: this,
                show: function(cmp) {
                    this.setVisibleWindow(cmp);
                }
            }
        });

        this.updateSelectorWindow(win);
        return win;
    },

    onFilterChange : function(filters)
    {
        // plot lock prevents from listening to plots own changes to state filters
        if (this.plotLock)
        {
            this.plotLock = false;
            return;
        }

        // mark as clear when there are no plot filters
        this.filterClear = true;
        for (var f=0; f < filters.length; f++)
        {
            if (filters[f].isPlot() && !filters[f].isGrid())
            {
                this.filterClear = false;
                break;
            }
        }

        if (this.isActiveView)
        {
            if (!this.filterClear)
            {
                // if a user adds a "In the plot" filter back via undo, the only time the chart get
                // notified is when the filters change

                if (!this.activeMeasures.x && !this.activeMeasures.y && !this.activeMeasures.color)
                {
                    // determine if there is an "in the plot" filter present, if so set the active measures
                    Ext.each(filters, function(filter)
                    {
                        if (filter.isPlot() && !filter.isGrid())
                        {
                            this.setActiveMeasureSelectionFromFilter(filter);
                            return false;
                        }
                    }, this);
                }
            }

            this.onShowGraph();

            Connector.getState().clearSelections(true);
        }
        else
        {
            this.refreshRequired = true;

            // 415: If the "in the plot" filter has been modified (e.g. a group load) then the measures
            // need to be loaded from the filter next time the plot is activated. This saves the view from
            // excessive reloading of the measures each time the filters change.
            this.filterCheck = true;
        }
    },

    onActivate : function()
    {
        this.isActiveView = true;

        // ensure filterCheck is cleared
        var filterCheck = this.filterCheck;
        this.filterCheck = false;

        if (this.refreshRequired)
        {
            if (this.initialized)
            {
                if (filterCheck)
                {
                    // determine if there is an "in the plot" filter present, if so set the active measures
                    Ext.each(Connector.getState().getFilters(), function(filter)
                    {
                        if (filter.isPlot() && !filter.isGrid())
                        {
                            this.setActiveMeasureSelectionFromFilter(filter);
                            return false;
                        }
                    }, this);
                }

                this.onShowGraph();
            }
            else
            {
                Connector.getState().onReady(function()
                {
                    this.initialized = true;
                    var state = Connector.getState();

                    // determine if there is an "in the plot" filter present, if so set the active measures
                    Ext.each(state.getFilters(), function(filter)
                    {
                        if (filter.isPlot() && !filter.isGrid())
                        {
                            if (this.setActiveMeasureSelectionFromFilter(filter))
                            {
                                // lock the plot, to ignore filter change
                                if (!this.filtersActivated)
                                {
                                    this.plotLock = true;
                                }
                            }

                            return false;
                        }
                    }, this);

                    this.onShowGraph();

                    // bind state events
                    state.on('filterchange', this.onFilterChange, this);
                    state.on('plotselectionremoved', this.onPlotSelectionRemoved, this);
                    state.on('selectionchange', this.onSelectionChange, this);
                }, this);
            }
        }

        if (Ext.isObject(this.visibleWindow))
        {
            this.visibleWindow.show();
        }
    },

    onDeactivate : function() {
        this.isActiveView = false;
        this.fireEvent('hideload', this);
        this.hideMessage();
        this.hideVisibleWindow();
    },

    onPlotSelectionRemoved : function(filterId, measureIdx) {
        var curExtent = this.plot.getBrushExtent();
        if (curExtent) {
            if (curExtent[0][0] === null || curExtent[0][1] === null) {
                // 1D, just clear the selection.
                this.clearAllBrushing();
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

    onSelectionChange : function(selections, opChange, isMoveToFilter) {
        // only proceed if the chart is the active view and we have at least a y-axis measure
        if (!this.isActiveView || !this.activeMeasures.y) {
            return;
        }

        if (selections.length === 0)
        {
            var ex = this.plot.getBrushExtent();
            if (ex !== null) {
                this.clearAllBrushing();
            }

            this.clearStudyAxisSelection();
            if (!isMoveToFilter) {
                this.updatePlotInfoPaneCounts({forSubcounts: false, queryName: this.dataQWP.query});
            }
        }
        else
        {
            var filterSet = Connector.getState().getFilters().concat(selections),
                measureSet = this.getMeasureSet(filterSet);

            var extraFilters = null;
            Ext.each(filterSet, function(filter){
               if (filter.get('isStudyAxis')) {
                   if (filter.get('studyAxisFilter') && filter.get('studyAxisFilter')['_COMPOUND']) {
                       if (!extraFilters) {
                           extraFilters = [];
                       }
                       extraFilters.push(filter.get('studyAxisFilter')['_COMPOUND'][0]);
                       extraFilters[0].isStudyAxis = true;
                       var queryService = Connector.getQueryService(),
                           subjectVisitMeasure = queryService.getMeasure(QueryUtils.SUBJECT_SEQNUM_ALIAS);

                       measureSet.measures.push({measure: subjectVisitMeasure});
                   }
               }
            });

            Connector.getQueryService().getSubjectsForSpecificFilters(filterSet, null, function(subjectFilter)
            {
                ChartUtils.applySubjectValuesToMeasures(measureSet.measures, subjectFilter);

                this.updatePlotInfoPaneCounts({forSubcounts: true, sql: QueryUtils.getDataSql({measures: measureSet.measures, extraFilters: extraFilters})});
            }, this);
        }

        if (Ext.isFunction(this.highlightSelectedFn))
        {
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

    getStudyVisitTagRecords : function(store, chartData)
    {
        var studyContainers = chartData.getStudyContainers();

        // filter the StudyVisitTag store based on the study container id array
        var filteredVisitTags = store.queryBy(function(record)
        {
            return studyContainers[record.get('container_id')] === true;
        });

        var studyAxisData = Ext.create('Connector.model.StudyAxisData', {
            records: filteredVisitTags.getRange(),
            studyVisitMap: chartData.get('studyAxisData').studyVisitMap,
            studyGroupVisitMap: chartData.get('studyAxisData').studyGroupVisitMap,
            measure: this.activeMeasures.x
        });

        this.hasStudyAxisData = studyAxisData.getData().length > 0;

        if (chartData.getDataRows().totalCount == 0)
        {
            // show empty plot message if we have no data in main plot or gutter plots
            this.noPlot(true, chartData);
        }
        else
        {
            this.initPlot(chartData, studyAxisData);
        }
    },

    showVisitTagHover : function(data, visitTagEl) {
        if (data.visitTagLabel == null)
            return;

        var bubbleWidth, groupWidth = 0, tagWidth = 0,
            groupTags = {}, maxWidth = 20,
            config, visitTag, visitTagGrp, keyCount = 0;

        // map data to set object mapped by group (i.e. 'Group 1 Vaccine')
        for (var i = 0; i < data.visitTags.length; i++) {

            visitTag = data.visitTags[i];
            visitTagGrp = visitTag.group;

            if (!groupTags[visitTagGrp]) {
                keyCount++;
                groupTags[visitTagGrp] = {
                    tags: [],
                    desc: '',
                    isChallenge: data.isChallenge,
                    isVaccination: data.isVaccination
                };
            }

            if (groupTags[visitTagGrp].tags.indexOf(visitTag.tag) == -1) {
                groupTags[visitTagGrp].tags.push(visitTag.tag);
            }

            groupTags[visitTagGrp].desc = visitTag.desc;

            // CONSIDER: Ideally, we could somehow measure the resulting tag's width by
            // asking the browser how wide the element would be (shadow DOM?)
            groupWidth = Ext.htmlEncode(visitTag.group).length;
            tagWidth = Ext.htmlEncode(groupTags[visitTagGrp].tags.join(',')).length + 4;

            if ((groupWidth + tagWidth) > maxWidth) {
                maxWidth = groupWidth + tagWidth;
            }
        }

        if (keyCount == 1) {

            var labelLength = Ext.htmlEncode(visitTag.group).length,
                tagLength = Ext.htmlEncode(groupTags[visitTagGrp].tags.join(',')).length + 4,
                descLength = Ext.htmlEncode(groupTags[visitTagGrp].desc).length + 3;

            if (groupTags[visitTagGrp].isVaccination) {
                maxWidth = Math.max(labelLength + descLength, tagLength);
            }
            else {
                maxWidth = labelLength + tagLength;
            }
        }

        var groupKeys = Object.keys(groupTags).sort(LABKEY.app.model.Filter.sorters.natural),
            isAggregate = groupKeys.length > 1,
            tplGroups = [];

        Ext.each(groupKeys, function(key) {
            var group = groupTags[key];

            tplGroups.push({
                label: key,
                desc: group.desc,
                tags: group.tags,
                isChallenge: group.isChallenge,
                isVaccination: group.isVaccination
            });
        });

        bubbleWidth = Math.min(maxWidth * 8, 400);

        var title = data.studyLabel;
        if (data.alignedDay != undefined)
        {
            title += ': ' + (data.alignedDay > 0 ? '+' : '') + data.alignedDay;
            title += ' ' + ChartUtils.getTimeShortLabel(this.activeMeasures.x.alias) + 's';
        }

        config = {
            bubbleWidth: bubbleWidth,
            xOffset: -(bubbleWidth / 2),          // the non-vaccination icon is slightly smaller
            arrowOffset: (bubbleWidth / 2) - 10 - ((data.isVaccination || data.isChallenge) ? 4 : 0),
            target: visitTagEl,
            placement: 'top',
            title: title,
            content: Connector.view.Chart.studyAxisTipTpl.apply({
                groups: tplGroups,
                isAggregate: isAggregate
            })
        };

        ChartUtils.showCallout(config, 'hidevisittagmsg', this);

        // show the hover icon for this glyph
        // TODO: Re-enable when filtering by tag is implemented
        //this.updateVisitTagIcon(visitTagEl, 'normal', 'hover');
    },

    removeVisitTagHover : function(data, visitTagEl) {
        // change hover icon back to normal glyph state
        // TODO: Re-enable when filtering by tag is implemented
        //this.updateVisitTagIcon(visitTagEl, 'hover', 'normal');

        this.fireEvent('hidevisittagmsg', this);
    },

    updateVisitTagIcon : function(el, currentSuffix, newSuffix) {
        var suffix = '_' + currentSuffix + '.svg', iconHref = el.getAttribute('href');
        if (iconHref.indexOf(suffix, iconHref.length - suffix.length) !== -1) {
            el.setAttribute('href', iconHref.replace(suffix, '_' + newSuffix + '.svg'));
        }
    },

    initStudyAxis : function(studyAxisInfo, layerScope, properties) {
        if (!this.studyAxis) {
            this.studyAxis = Connector.view.StudyAxis().renderTo(this.bottomPlotEl.id);
        }

        this.studyAxisProperties = properties;
        this.studyAxis.studyData(studyAxisInfo.getData())
                .scale(this.plot.scales.x.scale)
                .width(Math.max(0, this.getBottomPlotPanel().getWidth() - 40))
                .visitTagMouseover(this.showVisitTagHover, this)
                .visitTagMouseout(this.removeVisitTagHover, this)
                .highlightPlot(this.highlightTimeAxisPlotData, this)
                .selectStudyAxis(this.selectStudyAxis, this)
                .toggleStudyAxis(this.toggleStudyAxis, this)
                .setCollapsed(!this.isStudyAxisExpanded)
                .mainPlotLayer(layerScope);

        this.studyAxis();
    },

    highlightTimeAxisPlotData: function(target) {
        var targets = this.getStudyAxisSelectionValues(), me = this;
        me.clearHighlightedData();

        targets.forEach(function(t) {
            me.highlightPlotData(t, null, true);
        });

        if (target) {
            me.highlightPlotData(target, null, true);
        }
    },

    getStudyAxisSelectionValues : function() {
        var selections = Connector.getState().getSelections();
        var values = [];
        selections.forEach(function(s) {
            if (s.get('isStudyAxis')){
                values = s.get('studyAxisKeys');
            }
        });

        return values;
    },

    clearStudyAxisSelection: function () {
        if (this.studyAxis) {
            this.studyAxis.clearSelection();
        }
    },

    selectStudyAxis: function(d, multi) {
        this.getParticipantVisits(d, multi, this.buildStudyAxisSelection, this);
    },

    buildStudyAxisSelection: function(d, multi, participantVisitSel) {
        var sqlFilters = [null, null, null, null];
        var keyStr = '';

        var subDisplayStr = '';
        if (participantVisitSel) {
            if (participantVisitSel.getValue() && participantVisitSel.getValue() !== '') {
                sqlFilters[0] = LABKEY.Filter.create(QueryUtils.SUBJECT_SEQNUM_ALIAS, participantVisitSel.getValue(), LABKEY.Filter.Types.EQUALS_ONE_OF);
            }
            else {
                sqlFilters[0] = LABKEY.Filter.create(QueryUtils.SUBJECT_SEQNUM_ALIAS, null, LABKEY.Filter.Types.ISBLANK);
            }
            keyStr += ChartUtils.studyAxisKeyDelimiter + d.alignedDay;
            keyStr += ChartUtils.studyAxisKeyDelimiter + d.studyLabel;
            subDisplayStr = '<br/>Study = ' + d.studyLabel + "; ";
            if (d.groupLabel) {
                keyStr += ChartUtils.studyAxisKeyDelimiter + d.groupLabel;
                subDisplayStr = '<br/>Treatment Summary = ' + d.studyLabel + ' ' + d.groupLabel + "; ";
            }
            subDisplayStr += ' ' + this.activeMeasures.x.label + ' = ' + d.alignedDay + '<br/>';
        }
        else if (d.name && !d.study) {
            sqlFilters[0] = LABKEY.Filter.create(QueryUtils.STUDY_ALIAS, d.name, LABKEY.Filter.Types.EQUAL);
            subDisplayStr = '<br/>Study = ' + d.name + '<br/>';
            keyStr += ChartUtils.studyAxisKeyDelimiter + d.name;
        }
        else if (d.name && d.study) {
            sqlFilters[0] = LABKEY.Filter.create(QueryUtils.TREATMENTSUMMARY_ALIAS, d.name, LABKEY.Filter.Types.EQUAL);
            sqlFilters[1] = LABKEY.Filter.create(QueryUtils.STUDY_ALIAS, d.study, LABKEY.Filter.Types.EQUAL);
            subDisplayStr = '<br/>Treatment Summary = ' + d.study + ' ' + d.name + '<br/>';
            if (d.study) {
                keyStr += ChartUtils.studyAxisKeyDelimiter + d.study;
            }
            keyStr += ChartUtils.studyAxisKeyDelimiter + d.name;
        }

        var keys = [];
        keys.push(keyStr);

        var displayStr = subDisplayStr;
        var addToMulti = multi && this.isStudyAxisSelection();
        var oldSelection = undefined;
        if (addToMulti) {
            var existingSelection = Connector.getState().getSelections()[0];
            oldSelection = existingSelection.get('studyAxisFilter');
            var existingKeys = existingSelection.get('studyAxisKeys');
            for (var i = 0; i < existingKeys.length; i++) {
                keys.push(existingKeys[i]);
            }
            displayStr += '<br/>OR<br/>';
            displayStr += existingSelection.get('filterDisplayString');
        }

        Connector.getState().addSelection({
            gridFilter: sqlFilters,
            plotMeasures: [this._getAxisWrappedMeasure(this.activeMeasures.x), this._getAxisWrappedMeasure(this.activeMeasures.y)],
            isPlot: true,
            isGrid: true,
            operator: LABKEY.app.model.Filter.OperatorTypes.AND,
            filterSource: 'GETDATA',
            isWhereFilter: true,
            showInverseFilter: false,
            filterDisplayString: displayStr,
            isStudyAxis: true,
            studyAxisKeys: keys,
            studyAxisFilter: oldSelection,
            isStudySelectionActive: true
        }, true, false, true);

    },

    getParticipantVisits: function(d, multi, callback, scope) {
        if (d.visitRowId === undefined || d.visitRowId === null) {
            callback.call(scope, d, multi);
            return;
        }
        var timeFilters = [];
        timeFilters.push(LABKEY.Filter.create(this.studyAxisProperties.xaxis.colName, d.alignedDay, LABKEY.Filter.Types.EQUAL));
        timeFilters.push(LABKEY.Filter.create(QueryUtils.STUDY_ALIAS, d.studyLabel, LABKEY.Filter.Types.EQUAL));
        if (d.groupLabel) {
            timeFilters.push(LABKEY.Filter.create(QueryUtils.TREATMENTSUMMARY_ALIAS, d.groupLabel, LABKEY.Filter.Types.EQUAL));
        }

        var queryService = Connector.getQueryService(),
            studyMeasure = queryService.getMeasure(QueryUtils.STUDY_ALIAS),
            armMeasure = queryService.getMeasure(QueryUtils.TREATMENTSUMMARY_ALIAS);
        var wrappedMeasures = [this._getAxisWrappedMeasure(this.activeMeasures.x)];
        wrappedMeasures.push({measure: studyMeasure});
        wrappedMeasures.push({measure: armMeasure});

        Connector.getFilterService().getTimeFilter(wrappedMeasures, timeFilters, function(_filter)
        {
            callback.call(scope, d, multi, _filter);
        }, this);
    },

    toggleStudyAxis: function() {
        this.isStudyAxisExpanded = !this.isStudyAxisExpanded;
        this.redrawPlot();
    },

    resizePlotContainers : function(numStudies) {
        if (this.requireStudyAxis && this.hasStudyAxisData)
        {
            this.plotEl.setStyle('padding-left', this.studyAxisWidthOffset + 'px');
            this.bottomPlotEl.setStyle('margin-left', '0');

            // set max height to 1/3 of the center region height
            this.getBottomPlotPanel().setHeight(Math.min(this.getCenter().getHeight() / 3, Math.max(20 * numStudies + 15, this.minStudyAxisHeight)));
            this.getBottomPlotPanel().setVisible(true);
        }
        else
        {
            this.plotEl.setStyle('padding-left', '0');
            this.bottomPlotEl.setStyle('margin-left', this.requireXGutter
                    ? (this.requireYGutter ? this.yGutterWidth + 'px' : '0') : '0');

            this.getBottomPlotPanel().setHeight(this.requireXGutter ? this.xGutterHeight : 0);
            this.getBottomPlotPanel().setVisible(this.requireXGutter);
        }
    },

    // FOR TESTING USE
    showPlotDataGrid : function() {
        window.open(LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {
            schemaName: this.dataQWP.schema,
            'query.queryName': this.dataQWP.query
        }), '_blank');
    }
});
