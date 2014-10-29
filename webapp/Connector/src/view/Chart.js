/*
 * Copyright (c) 2014 LabKey Corporation
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

    constructor : function(config) {

        Ext.apply(config, {
            isActiveView: true,
            refreshRequired: true,
            initialized: false
        });

        this._ready = false;
        Connector.getService('Query').getDefaultMeasure(function(measure) {
            this.defaultMeasure = measure;
            this._ready = true;
            this.fireEvent('onready', this);
        }, this);

        Ext.applyIf(config, {
            measures: [],
            hasStudyAxisData: false
        });

        this.callParent([config]);

        this.addEvents('onready');
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
            defaults: {
                xtype: 'container',
                width: '50%',
                layout: {
                    type: 'hbox',
                    pack: 'center'
                }
            },
            items: [{
                items: [{
                    id: 'yaxisselector',
                    xtype: 'variableselector',
                    btnCls: 'yaxisbtn',
                    model: Ext.create('Connector.model.Variable', {
                        typeLabel: 'y'
                    })
                }]
            },{
                items: [{
                    id: 'colorselector',
                    xtype: 'colorselector',
                    btnCls: 'colorbtn',
                    model: Ext.create('Connector.model.Variable', {
                        typeLabel: 'color'
                    })
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
            bodyStyle: 'background: linear-gradient(#ebebeb, #f0f0f0) !important;',
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
                    })
                },
                {
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

    attachInternalListeners : function() {

        this.on('afterrender', this._initAfterRender, this, {single: true});

        this.showTask = new Ext.util.DelayedTask(function() {
            this.onReady(this.onShowGraph, this);
        }, this);
        this.resizeTask = new Ext.util.DelayedTask(function() {
            this.onReady(this.handleResize, this);
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

        if (this.msg) {
            this.msg.getEl().setLeft(Math.floor(plotbox.width/2 - Math.floor(this.getEl().getTextWidth(this.msg.msg)/2)));
        }

        if (this.ywin && this.ywin.isVisible()) {
            this.updateMeasureSelection(this.ywin);
        }

        if (this.xwin && this.xwin.isVisible()) {
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
    },

    getNoPlotLayer : function() {
        return new LABKEY.vis.Layer({
            geom: new LABKEY.vis.Geom.Point({
                plotNullPoints: true,
                opacity: 0
            }),
            aes: {
                yLeft: function(row){return row.y}
            }
        });
    },

    getLayerAes : function(layerScope, isBoxPlot) {

        var mouseOverPointsFn = function(event, pointData, layerSel){
            if (!layerScope.isBrushed) {
                var plot = layerScope.plot, colorFn, opacityFn, strokeFn, colorScale = null, colorAcc = null;

                if (plot.scales.color && plot.scales.color.scale) {
                    colorScale = plot.scales.color.scale;
                    colorAcc = plot.aes.color;
                }

                colorFn = function(d) {
                    if (d.subjectId.value === pointData.subjectId.value) {
                        return '#01BFC2';
                    } else {
                        if (colorScale && colorAcc) {
                            return colorScale(colorAcc.getValue(d));
                        }

                        return '#000000';
                    }
                };

                strokeFn = function(d) {
                    if (d.subjectId.value === pointData.subjectId.value) {
                        return '#01BFC2';
                    } else {
                        if (colorScale && colorAcc) {
                            return colorScale(colorAcc.getValue(d));
                        }

                        return '#000000';
                    }
                };

                opacityFn = function(d) {
                    return  d.subjectId.value === pointData.subjectId.value ? 1 : 0.2;
                };

                var points = layerSel.selectAll('.point path');

                points.attr('fill', colorFn)
                        .attr('stroke', strokeFn)
                        .attr('fill-opacity', opacityFn)
                        .attr('stroke-opacity', opacityFn);

                points.each(function(d) {
                    // Re-append the node so it is on top of all the other nodes, this way highlighted points
                    // are always visible.
                    var node = this.parentNode;
                    if (d.subjectId.value === pointData.subjectId.value) {
                        node.parentNode.appendChild(node);
                    }
                });
            }
        };

        var mouseOutPointsFn = function(event, pointData, layerSel){
            if (!layerScope.isBrushed) {
                var plot = layerScope.plot, colorFn, colorScale = null, colorAcc = null;

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

                layerSel.selectAll('.point path').attr('fill', colorFn)
                        .attr('stroke', colorFn)
                        .attr('fill-opacity', 0.5)
                        .attr('stroke-opacity', 0.5);
            }
        };

        var mouseOverBinsFn = function(event, binData, layerSel){
            if (!layerScope.isBrushed) {
                // get the set of subjectIds in the binData
                var subjects = {};
                if (binData.length > 0 && binData[0].data)
                {
                    for (var i = 0; i < binData.length; i++)
                        subjects[binData[i].data.subjectId.value] = true;
                }

                var isSubjectInMouseBin = function(d, yesVal, noVal) {
                    if (d.length > 0 && d[0].data)
                    {
                        for (var i = 0; i < d.length; i++)
                        {
                            if (subjects[d[i].data.subjectId.value] === true)
                                return yesVal;
                        }
                    }

                    return noVal;
                };

                var colorFn = function(d) {
                    // keep original color of the bin (note: uses style instead of fill attribute)
                    d.origStyle = d.origStyle || this.getAttribute('style');

                    return isSubjectInMouseBin(d, 'fill: #01BFC2', d.origStyle);
                };

                var opacityFn = function(d) {
                    return isSubjectInMouseBin(d, 1, 0.15);
                };

                layerSel.selectAll('.vis-bin path')
                        .attr('style', colorFn)
                        .attr('fill-opacity', opacityFn)
                        .attr('stroke-opacity', opacityFn);
            }
        };

        var mouseOutBinsFn = function(event, pointData, layerSel){
            if (!layerScope.isBrushed)
            {
                layerSel.selectAll('.vis-bin path')
                        .attr('style', function(d){ return d.origStyle })
                        .attr('fill-opacity', 1).attr('stroke-opacity', 1);
            }
        };

        var aes = {
            mouseOverFn: this.showPointsAsBin ? mouseOverBinsFn : mouseOverPointsFn,
            mouseOutFn: this.showPointsAsBin ? mouseOutBinsFn : mouseOutPointsFn
        };

        var hoverText = function(row) {
            var text = 'Subject: ' + row.subjectId.value;

            if (row.xname) {
                text += ',\n' + row.xname + ': ' + row.x;
            }

            text += ',\n' + row.yname + ': ' + row.y;

            if (row.colorname) {
                text += ',\n' + row.colorname + ': ' + row.color;
            }

            return text;
        };

        if (isBoxPlot) {
            aes.pointHoverText = hoverText;
        } else {
            aes.hoverText = hoverText;
        }

        return aes;
    },

    getBinLayer : function(layerScope) {
        return new LABKEY.vis.Layer({
            geom: new LABKEY.vis.Geom.Bin({
//                shape: 'hex',
                shape: 'square',
                colorRange: ["#E6E6E6", "#000000"],
//                size: 5,
                size: 10, // for squares you want a bigger size
                plotNullPoints: true
            }),
            aes: this.getLayerAes(layerScope, false)
        });
    },

    getPointLayer : function(layerScope) {
        return new LABKEY.vis.Layer({
            geom: new LABKEY.vis.Geom.Point({
                size: 3,
                plotNullPoints: true,
                opacity: 0.5
            }),
            aes: this.getLayerAes(layerScope, false)
        });
    },

    getBoxLayer : function(layerScope) {
        var aes = this.getLayerAes(layerScope, true);
        aes.hoverText = function(name, summary){
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

    initPlot : function(rows, properties, studyAxisInfo, noplot) {

        // Below vars needed for brush and mouse event handlers.
        var isBrushed = false, layerScope = {plot: null, isBrushed: isBrushed}, plot, layer;

        this.plotEl.update('');
        this.resizePlotContainers(studyAxisInfo ? studyAxisInfo.getData().length : 0);

        if (!rows || !rows.length) {
            this.showMessage('No information available to plot.');
            this.fireEvent('hideload', this);
            this.plot = null;
            this.noPlot();
            return;
        }
        else if (!noplot && (this.percentOverlap && this.percentOverlap == 1)) {
            this.hideMessage();
        }

        if (this.plot) {
            this.plot.clearGrid();
            this.plot = null;
        }

        this.showPointsAsBin = rows.length > this.binRowLimit;

        if (noplot) {
            layer = this.getNoPlotLayer();
        }else if (properties.xaxis && properties.xaxis.isContinuous) {
            // Scatter. Binned if over max row limit.
            layer = this.showPointsAsBin ? this.getBinLayer(layerScope) : this.getPointLayer(layerScope);
        } else if (properties.xaxis && !properties.xaxis.isContinuous) {
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

        if (noplot) {
            scales.x = scales.yLeft = {
                scaleType: 'continuous',
                domain: [0, 0],
                tickFormat: function(val) {return '';}
            };
        }
        else {
            if (properties.xaxis.isContinuous) {
                scales.x = {
                    scaleType: 'continuous'
                };

                if (properties.xaxis.isNumeric) {
                    scales.x.tickFormat = numericTickFormat;
                } else if (properties.xaxis.type === 'TIMESTAMP') {
                    scales.x.tickFormat = dateFormat;
                }
            } else {
                scales.x = {scaleType: 'discrete'};
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
            x: function(row){return row.x;},
            yLeft: function(row){return row.y}
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
            tickTextColor: '#666363', // $heat-scale-1
            scales: scales
        };

        if (!noplot) {
            var studyAxisRange = studyAxisInfo ? studyAxisInfo.getRange() : {min: null, max: null};
            this.setScale(plotConfig.scales.x, 'x', properties, studyAxisRange);
            this.setScale(plotConfig.scales.yLeft, 'y', properties, studyAxisRange);

            // add brush handling
            var isSelectedWithBrush = function(extent, x, y) {
                var isX, isY, xExtent, yExtent;

                xExtent = [extent[0][0], extent[1][0]];
                yExtent = [extent[0][1], extent[1][1]];
                isX = xExtent[0] !== null && xExtent[1] !== null;
                isY = yExtent[0] !== null && yExtent[1] !== null;

                // Issue 20116
                if (isX && isY) { // 2D
                    return (x > xExtent[0] && x < xExtent[1] && y > yExtent[0] && y < yExtent[1]);
                } else if (isX) { // 1D
                    return (x > xExtent[0] && x < xExtent[1]);
                } else if (isY) { // 1D
                    return (y > yExtent[0] && y < yExtent[1]);
                }

                return false;
            };

            var brushPoints = function(event, layerData, extent, plot, layerSelections) {
                var sel = layerSelections[0]; // We only have one layer, so grab the first one.
                var subjects = {}; // Stash all of the selected subjects so we can highlight associated points.
                var colorFn, opacityFn, strokeFn, colorScale = null, colorAcc = null;
                var assocColorFn, assocStrokeFn;

                if (plot.scales.color && plot.scales.color.scale) {
                    colorScale = plot.scales.color.scale;
                    colorAcc = plot.aes.color;
                }

                colorFn = function(d) {
                    var x = d.x, y = d.y;

                    d.isSelected = isSelectedWithBrush(extent, x, y);

                    if (d.isSelected) {
                        subjects[d.subjectId.value] = true;
                        return '#01BFC2';
                    } else {
                        if (colorScale && colorAcc) {
                            return colorScale(colorAcc.getValue(d));
                        }

                        return '#000000';
                    }
                };

                strokeFn = function(d) {
                    if (d.isSelected) {
                        return '#01BFC2';
                    } else {
                        if (colorScale && colorAcc) {
                            return colorScale(colorAcc.getValue(d));
                        }

                        return '#000000';
                    }
                };

                sel.selectAll('.point path').attr('fill', colorFn)
                        .attr('stroke', strokeFn);

                assocColorFn = function(d) {
                    if (!d.isSelected && subjects[d.subjectId.value] === true) {
                        return '#01BFC2';
                    } else{
                        return this.getAttribute('fill');
                    }
                };

                assocStrokeFn = function(d) {
                    if (!d.isSelected && subjects[d.subjectId.value] === true) {
                        return '#01BFC2';
                    } else {
                        return this.getAttribute('stroke');
                    }
                };

                opacityFn = function(d) {
                    if (d.isSelected || (!d.isSelected && subjects[d.subjectId.value] === true)) {
                        return 1;
                    } else {
                        return 0.2;
                    }
                };

                sel.selectAll('.point path').attr('fill', assocColorFn)
                        .attr('stroke', assocStrokeFn)
                        .attr('fill-opacity', opacityFn)
                        .attr('stroke-opacity', opacityFn);
            };

            var brushBins = function(event, layerData, extent, plot, layerSelections) {
                var sel = layerSelections[0]; // We only have one layer, so grab the first one.
                var subjects = {}; // Stash all of the selected subjects so we can highlight associated points.
                var colorFn, opacityFn, assocColorFn, min, max;

                // convert extent x/y values into aes scale as bins don't really have x/y values
                if (extent[0][0] !== null && extent[1][0] !== null)
                {
                    extent[0][0] = plot.scales.x.scale(extent[0][0]);
                    extent[1][0] = plot.scales.x.scale(extent[1][0]);
                }
                if (extent[0][1] !== null && extent[1][1] !== null)
                {
                    // TODO: the min/max y values are flipped for bins vs points, why?
                    max = plot.scales.yLeft.scale(extent[0][1]);
                    min = plot.scales.yLeft.scale(extent[1][1]);
                    extent[0][1] = min;
                    extent[1][1] = max;
                }

                // set color, via style attribute, for the selected bins
                colorFn = function(d) {
                    var x = d.x, y = d.y;

                    d.isSelected = isSelectedWithBrush(extent, x, y);

                    // track the subjects that are included in the points for the selected bins
                    if (d.isSelected && d.length > 0 && d[0].data)
                    {
                        for (var i = 0; i < d.length; i++)
                        {
                            subjects[d[i].data.subjectId.value] = true;
                        }
                    }

                    // keep original color of the bin (note: uses style instead of fill attribute)
                    d.origStyle = d.origStyle || this.getAttribute('style');

                    return d.isSelected ? 'fill: #14C9CC;' : d.origStyle;
                };
                sel.selectAll('.vis-bin path').attr('style', colorFn);

                // set color, via style attribute, for the unselected bins
                assocColorFn = function(d) {
                    if (!d.isSelected && d.length > 0 && d[0].data)
                    {
                        for (var i = 0; i < d.length; i++)
                        {
                            if (subjects[d[i].data.subjectId.value] === true)
                                return 'fill: #01BFC2;';
                        }
                    }

                    return this.getAttribute('style');
                };

                // set the opacity for all bins, 3 states: select, associated, neither
                opacityFn = function(d) {
                    if (d.isSelected)
                        return 1;

                    if (!d.isSelected && d.length > 0 && d[0].data)
                    {
                        for (var i = 0; i < d.length; i++)
                        {
                            if (subjects[d[i].data.subjectId.value] === true)
                                return 0.5;
                        }
                    }

                    return 0.15;
                };

                sel.selectAll('.vis-bin path').attr('style', assocColorFn)
                        .attr('fill-opacity', opacityFn)
                        .attr('stroke-opacity', opacityFn);
            };

            plotConfig.brushing = {
                dimension: properties.xaxis.isContinuous ? 'both' : 'y',
                brushstart : function() {
                    layerScope.isBrushed = true;
                },
                brush : this.showPointsAsBin ? brushBins : brushPoints,
                brushend : function(event, layerData, extent, plot, layerSelections) {
                    var xExtent = [extent[0][0], extent[1][0]], yExtent = [extent[0][1], extent[1][1]],
                            xMeasure, yMeasure, sqlFilters = [null, null, null, null], yMin, yMax, xMin, xMax;

                    var transformVal = function(val, type, isMin, domain) {
                        if (type === 'INTEGER') {
                            return isMin ? Math.floor(val) : Math.ceil(val);
                        }
                        else if (type === 'TIMESTAMP') {
                            return isMin ? new Date(Math.floor(val)) : new Date(Math.ceil(val));
                        }
                        else if (type === 'DOUBLE' || type === 'REAL' || type === 'FLOAT'){
                            var precision;

                            if (domain[1] >= 1000) {
                                precision = 0;
                            } else if (domain[1] >= 100) {
                                precision = 1;
                            } else if (domain[1] >= 10) {
                                precision = 2;
                            } else {
                                precision = 3;
                            }

                            return parseFloat(val.toFixed(precision));
                        }

                        return val;
                    };

                    xMeasure = measures[0];
                    yMeasure = measures[1];
                    yMeasure.colName = requiresPivot ? properties.yaxis.name : properties.yaxis.colName;

                    if (xMeasure) {
                        xMeasure.colName = requiresPivot ? properties.xaxis.name : properties.xaxis.colName;
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
                        var antigens = xMeasure.options.antigen.values.concat(yMeasure.options.antigen.values);
                        sqlFilters.push(LABKEY.Filter.create(yMeasure.options.antigen.name, antigens, LABKEY.Filter.Types.IN));
                    }

                    var wrapped = [ me._getAxisWrappedMeasure(xMeasure), me._getAxisWrappedMeasure(yMeasure) ];
                    var filter = Ext4.create('Connector.model.Filter', {
                        gridFilter: sqlFilters,
                        plotMeasures: wrapped,
                        hierarchy: 'Subject',
                        isPlot: true,
                        isGrid: true,
                        operator: LABKEY.app.model.Filter.OperatorTypes.OR,
                        filterSource: 'GETDATA',
                        isWhereFilter: true
                    });
                    Connector.getState().addSelection([filter], true, false, true);
                },
                brushclear : function(event, allData, plot, selections) {
                    layerScope.isBrushed = false;
                    Connector.getState().clearSelections(true);

                    // reset points
                    selections[0].selectAll('.point path')
                            .attr('fill-opacity', 0.5).attr('stroke-opacity', 0.5);

                    // reset bins
                    selections[0].selectAll('.vis-bin path')
                            .attr('style', function(d){ return d.origStyle })
                            .attr('fill-opacity', 1).attr('stroke-opacity', 1);
                }
            };
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
                this.showMessage(err.message);
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
        // This function should likley be renamed, and refactored so it's less side-effecty.
        if (scale.scaleType !== 'discrete') {
            var axisValue = this.getScale(axis), allowLog = (axis == 'y') ? !properties.setYLinear : !properties.setXLinear;

            if (!allowLog && axisValue == 'log') {
                this.showMessage('Displaying the ' + axis.toLowerCase() + '-axis on a linear scale due to the presence of invalid log values.');
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
        for (var f=0; f < filters.length; f++) {
            if (filters[f].isPlot() === true && filters[f].isGrid() === false) {
                var m = filters[f].get('plotMeasures');

                if (m[0]) {
                    measures.x = m[0].measure;
                }

                if (m[1]) {
                    measures.y = m[1].measure;
                }

                if (m[2]) {
                    measures.color = m[2].measure;
                }

                this.fromFilter = true;
                break;
            }
        }

        // second check the measure selections
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

        // map the y-axis schema and query name for a time point x-axis variable
        if (measures.x && measures.y)
        {
            if (!measures.x.schemaName && !measures.x.queryName)
            {
                var x = Ext.clone(measures.x);
                x.schemaName = measures.y.schemaName;
                x.queryName = measures.y.queryName;
                measures.x = x;
            }
        }

        // issue 20526: if color variable from different dataset, do left join so as not to get null x - null y datapoints
        if (measures.color != null && measures.y != null && measures.x != null)
        {
            var queryMatch = ((measures.color.schemaName == measures.y.schemaName && measures.color.queryName == measures.y.queryName) ||
                              (measures.color.schemaName == measures.x.schemaName && measures.color.queryName == measures.x.queryName));
            measures.color.requireLeftJoin = queryMatch;
        }

        return measures;
    },

    onShowGraph : function() {
        this.hideMessage();
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
                zeroDayVisitTag: options.alignmentVisitTag,
                useProtocolDay: true
            };
        }
        else if (requiresPivot && hasAntigens)
        {
            wrappedMeasure.measure.aggregate = "MAX";
            wrappedMeasure.dimension = this.getDimension();
        }

        wrappedMeasure.measure.inNotNullSet = true;

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
        var filters = [];
        var config = {
            schemaName: getDataResponse.schemaName,
            queryName: getDataResponse.queryName,
            success: function(response) { this.onChartDataSuccess(response, getDataResponse); },
            failure: this.onFailure,
            requiredVersion: '9.1',
            scope: this
        };

        if (Ext.isArray(this.timeFilters)) {
            filters = filters.concat(this.timeFilters);
        }

        if (filters.length > 0) {
            config.filterArray = filters;
        }

        LABKEY.Query.selectRows(config);
    },

    onChartDataSuccess : function(selectRowsResponse, getDataResponse) {
        if (this.isActiveView) {
            this.dataQWP = {schema: selectRowsResponse.schemaName, query: selectRowsResponse.queryName};

            if (this.msg) {
                this.msg.hide();
            }

            selectRowsResponse.measures = this.measures;
            selectRowsResponse.measureToColumn = getDataResponse.measureToColumn;
            selectRowsResponse.columnAliases = getDataResponse.columnAliases;
            var chartData = Ext.create('Connector.model.ChartData', selectRowsResponse);

            this.hasStudyAxisData = false;
            this.showPercentOverlapMessage(chartData);

            if (this.requireStudyAxis) {
                this.requestStudyAxisData(chartData);
            }
            else {
                this.initPlot(chartData.getDataRows(), chartData.getProperties(), null, false);
            }
        }
    },

    showPercentOverlapMessage : function(chartData) {
        if(chartData.getPercentOverlap() < 1 && chartData.getProperties().xaxis.isContinuous){
            var id = Ext.id();
            var id2 = Ext.id();
            var msg = 'Points outside the plotting area have no match on the other axis.';
            msg += '&nbsp;<a id="' + id2 +'">Got it</a>&nbsp;<a id="' + id +'">Details</a>';
            this.showMessage(msg, true);

            var tpl = new Ext.XTemplate(
                    '<div class="matchtip">',
                    '<div>',
                    '<p class="tiptitle">Plotting Matches</p>',
                    '<p class="tiptext">Percent match: {overlap}%. Mismatches may be due to data point subject, visit, or assay antigen.</p>',
                    '</div>',
                    '</div>'
            );

            var el = Ext.get(id);
            if (el) {
                Ext.create('Ext.tip.ToolTip', {
                    target : el,
                    anchor : 'left',
                    data : {
                        overlap : Ext.util.Format.round(chartData.getPercentOverlap() * 100, 2)
                    },
                    tpl : tpl,
                    autoHide: true,
                    mouseOffset : [15,0],
                    maxWidth: 500,
                    minWidth: 200,
                    bodyPadding: 0,
                    padding: 0
                });
            }
            el = Ext.get(id2);
            el.on('click', function() { this.hideMessage(); }, this);
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
        var measuresMap = {}, additionalMeasuresArr = [], filters = Connector.getState().getFilters();

        Ext.each(["x", "y"], function(axis)
        {
            var schema, query, name;
            if (activeMeasures[axis])
            {
                if (!requiresPivot && activeMeasures[axis].options && activeMeasures[axis].options.antigen)
                {
                    schema = activeMeasures[axis].schemaName;
                    query = activeMeasures[axis].queryName;

                    name = activeMeasures[axis].options.antigen.name;
                    var values = activeMeasures[axis].options.antigen.values;
                    this.addValuesToMeasureMap(measuresMap, schema, query, name, values);
                }
                else {
                    // A time-based X-measure is dependent on the schema/query of the Y-measure
                    schema = activeMeasures['y'].schemaName;
                    query = activeMeasures['y'].queryName;

                    if (activeMeasures[axis].variableType === "TIME")
                    {
                        name = Connector.studyContext.subjectVisitColumn + "/Visit";
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

        // If there is a grid filter on days/weeks/months we need to pull the filter out so we can apply it when
        // querying for data. If we don't already have days/weeks/months as a measure, then we also need to add it to
        // the list of measures that getData returns.
        this.timeFilters = null;

        for (var i = 0; i < filters.length; i++) {
            var filterData = filters[i].data;
            if (filterData.isGrid && !filterData.isPlot) {
                // gridFilter is an array of filters, it needs to be renamed.
                if (filterData.gridFilter[0]) {
                    var colName = filterData.gridFilter[0].getColumnName();
                    if (colName === 'Days' || colName === 'Weeks' || colName === 'Months') {
                        this.timeFilters = filterData.gridFilter;

                        if (activeMeasures.x == null || !activeMeasures.x.interval) {
                            additionalMeasuresArr.push({
                                dateOptions: {
                                    interval: colName,
                                    zeroDayVisitTag: null,
                                    useProtocolDay: true
                                },
                                measure: {
                                    name: Connector.studyContext.subjectVisitColumn + "/Visit/ProtocolDay",
                                    queryName: activeMeasures.y.queryName,
                                    schemaName: activeMeasures.y.schemaName,
                                    values: []
                                },
                                time: 'date'
                            });
                        }

                        break;
                    }
                }
            }
        }

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

//        if (activeMeasures.x) {
//            sqlFilters[0] = LABKEY.Filter.create(activeMeasures.x.alias, '', LABKEY.Filter.Types.NONBLANK);
//        }
//
//        if (activeMeasures.y) {
//            sqlFilters[2] = LABKEY.Filter.create(activeMeasures.y.alias, '', LABKEY.Filter.Types.NONBLANK);
//        }

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

        this.initPlot(map, null, null, true);
        this.resizeTask.delay(300);
        this.noplotmsg.show();
    },

    onFailure : function(response) {
        console.log(response);
        this.fireEvent('hideload', this);
        this.showMessage('Failed to Load');
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
        else
        {
            this.visibleWindow = false;
        }
    },

    showYMeasureSelection : function(targetEl) {

        if (!this.ywin) {

            var sCls = 'yaxissource';

            this.axisPanelY = Ext.create('Connector.panel.AxisSelector', {
                flex: 1,
                title: 'Y Axis',
                bodyStyle: 'padding: 15px 27px 0 27px;',
                open : function() {},
                measureConfig: {
                    allColumns: false,
                    displaySourceCounts: true,
                    sourceCountSchema: 'study',
                    filter: LABKEY.Query.Visualization.Filter.create({
                        schemaName: 'study',
                        queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS
                    }),
                    showHidden: this.canShowHidden,
                    cls: 'yaxispicker',
                    sourceCls: sCls,
                    multiSelect: false
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
                            } else {
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
        }

        this.updateMeasureSelection(this.ywin);

        if (this.axisPanelY.hasSelection()) {
            this.activeYSelection = this.axisPanelY.getSelection()[0];
        }
        this.ywin.show(targetEl);
    },

    showXMeasureSelection : function(targetEl) {

        if (!this.xwin) {

            var sCls = 'xaxissource';

            this.axisPanelX = Ext.create('Connector.panel.AxisSelector', {
                flex      : 1,
                ui        : 'axispanel',
                title     : 'X Axis',
                bodyStyle: 'padding: 15px 27px 0 27px;',
                measureConfig : {
                    allColumns : true,
                    displaySourceCounts: true,
                    sourceCountSchema: 'study',
                    includeTimpointMeasures : true,
                    filter     : LABKEY.Query.Visualization.Filter.create({
                        schemaName: 'study',
                        queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS
                    }),
                    showHidden : this.canShowHidden,
                    cls        : 'xaxispicker',
                    sourceCls  : sCls,
                    multiSelect: false
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
                        handler: function(){
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
                            } else {
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
        }

        this.updateMeasureSelection(this.xwin);

        if (this.axisPanelX.hasSelection()) {
            this.activeXSelection = this.axisPanelX.getSelection()[0];
        }

        // issue 20412: conditionally show 'remove variable' button
        var filter = this.getPlotsFilter();
        this.xwin.down('#removevarbtn').setVisible(filter && filter.get('plotMeasures')[0]);

        this.xwin.show(targetEl);
    },

    showColorSelection : function(targetEl) {
        if (!this.colorwin) {
            var sCls = 'colorsource';
            this.colorPanel = Ext.create('Connector.panel.AxisSelector', {
                flex      : 1,
                ui        : 'axispanel',
                title     : 'Color',
                bodyStyle: 'padding: 15px 27px 0 27px;',
                measureConfig : {
                    allColumns : true,
                    displaySourceCounts: true,
                    sourceCountSchema: 'study',
                    includeTimpointMeasures : false,
                    filter     : LABKEY.Query.Visualization.Filter.create({
                        schemaName: 'study',
                        queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS
                    }),
                    userFilter : function(row) {
                        return row.type === 'BOOLEAN' || row.type === 'VARCHAR';
                    },
                    showHidden : this.canShowHidden,
                    cls        : 'coloraxispicker',
                    sourceCls  : sCls,
                    multiSelect: false
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
                        handler: function(){
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
                        handler: function(){
                            this.showTask.delay(10);
                            this.colorwin.hide(targetEl);
                        },
                        scope: this
                    }, {
                        text: 'cancel',
                        ui: 'rounded-inverted-accent',
                        handler: function(){
                            if (this.activeColorSelection) {
                                this.colorPanel.setSelection(this.activeColorSelection);
                                this.activeColorSelection = undefined;
                            } else {
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
        }

        this.updateMeasureSelection(this.colorwin);

        if (this.colorPanel.hasSelection()) {
            this.activeColorSelection = this.colorPanel.getSelection()[0];
        }

        // issue 20412: conditionally show 'remove variable' button
        var filter = this.getPlotsFilter();
        this.colorwin.down('#removevarbtn').setVisible(filter && filter.get('plotMeasures')[2]);

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

    showMessage : function(msg, append) {

        var box = this.getBox();

        if (!append)
            this.hideMessage();
        else if (this.msg && this.msg.isVisible()) {
            this.msg.msg += '<br/>' + msg;
            this.msg.update(this.msg.msg);
            var x = Math.floor(box.width/2 - Math.floor(this.getEl().getTextWidth(msg)/2)) - 20;
            this.msg.showAt(x,box.y+20);
            return;
        }

        this.msg = Ext.create('Connector.window.SystemMessage', {
            msg : msg,
            x   : Math.floor(box.width/2 - Math.floor(this.getEl().getTextWidth(msg)/2)) - 20,
            y   : (box.y+40), // height of message window,
            autoShow : this.isActiveView
        });
    },

    hideMessage : function() {
        if (this.msg) {
            this.msg.hide();
            this.msg.destroy();
            this.msg = null;
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
            this.showTask.delay(300);
        }
        else if (this.initialized) {
            this.refreshRequired = true;
        }
    },

    onViewChange : function(controller, view) {
        this.isActiveView = (view === this.xtype);

        if (this.isActiveView) {

            if (this.refreshRequired) {
                this.showTask.delay(300);
            }

            if (this.msg) {
                this.msg.show();
            }

            if (Ext.isObject(this.visibleWindow)) {
                this.visibleWindow.show();
            }
        }
        else {
            this.fireEvent('hideload', this);

            if (this.msg) {
                this.msg.hide();
            }
        }
    },

    getSubjectsIn : function(callback, scope) {
        var me = this;
        var state = Connector.getState();

        state.onMDXReady(function(mdx) {

            var filters = state.getFilters();
            var countFilters = [];

            Ext.each(filters, function(filter) {
                if (!filter.get('isWhereFilter') && (!filter.get('isPlot') || filter.get('isGrid'))) {
                    countFilters.push(filter);
                }
            });

            if (countFilters.length > 0) {
                var SUBJECT_IN = 'scattercount';
                state.addPrivateSelection(countFilters, SUBJECT_IN, function() {
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
            } else {
                // 2D selection.
                if (measureIdx === 0) {
                    // clear the x-axis.
                    this.plot.setBrushExtent([[null, curExtent[0][1]],[null, curExtent[1][1]]]);
                } else if (measureIdx === 1) {
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
    },

    requestStudyAxisData : function(chartData) {
        var studyContainers = Object.keys(chartData.getContainerAlignmentDayMap()), inClause, sql;
        inClause = '(\'' + studyContainers.join('\',\'') + '\')';
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
            schemaName: 'study',
            requiredVersion: 9.1,
            containerFilter: LABKEY.Query.containerFilter.currentAndSubfolders,
            sql: sql,
            success: function(executeSqlResp) {
                if (this.isActiveView) { // TODO: This is a bit weird we check this here...
                    executeSqlResp.measures = this.measures;
                    executeSqlResp.visitMap = chartData.getVisitMap();
                    executeSqlResp.containerAlignmentDayMap = chartData.getContainerAlignmentDayMap();
                    var studyAxisData = Ext.create('Connector.model.StudyAxisData', executeSqlResp);

                    this.hasStudyAxisData = studyAxisData.getData().length > 0;

                    this.initPlot(chartData.getDataRows(), chartData.getProperties(), studyAxisData, false);
                    this.initStudyAxis(studyAxisData);
                }
            },
            failure: function(resp) {console.error('Error retrieving study axis data')},
            scope: this
        });
    },

    showVisitHover : function(data, rectEl) {
        var plotEl = document.querySelector('div.plot svg'),
            plotBBox = plotEl.getBoundingClientRect(),
            hoverBBox, html, i;

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
        } else {
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
