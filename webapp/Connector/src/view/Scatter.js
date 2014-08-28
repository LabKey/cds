/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
// TODO: Rename this view. It is no longer scatter specific, but instead includes scatter and box plots.
Ext.define('Connector.view.Scatter', {

    extend: 'Ext.panel.Panel',

    requires: ['Connector.panel.AxisSelector'],

    alias: 'widget.plot',

    cls: 'scatterview',

    canShowHidden: false,

    isActiveView: true,
    refreshRequired: true,
    initialized: false,
    showAxisButtons: true,

    studyAxisData: [],
    studyAxisRange: {min: null, max: null},

    plotHeightOffset: 90, // value in 'px' that the plot svg is offset for container region
    rowlimit: 5000,

    layout: 'border',

    defaultSortSchema: 'study',
    defaultSortQuery: '', // cannot be equivalent to Connector.studyContext.subjectVisitColumn

    constructor : function(config) {

        Ext.applyIf(config, {
            measures: []
        });

        this.callParent([config]);

        this.addEvents('onready');
    },

    initComponent : function() {

        this._ready = false;
        this.clearVisibleWindow();

        this.items = [
            this.getNorth(),
            this.getCenter(),
            this.getSouth()
        ];

        this.callParent();

        this.on('afterrender', this._initAfterRender, this, {single: true});

        this.attachInternalListeners();

        Connector.model.Grid.getDefaultDatasetName(function(name) {
            this.defaultSortQuery = name;
            this._ready = true;
            this.fireEvent('onready');
        }, this);

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
                },this.studyAxisPanel]
            });
        }
        return this.centerContainer;
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

    getSrcButton : function() {
        var btn = this.items ? this.query('#plotsourcesbutton') : null;
        if (!btn) {
            btn = Ext.create('Connector.button.RoundedButton', {
                id: 'plotsources',
                itemId: 'plotsourcesbutton',
                text: 'Sources',
                ui: 'rounded-accent',
                hidden: true,
                handler: function() {
                    if (this.srcs && this.srcs.length > 0)
                        this.fireEvent('sourcerequest', this.srcs, this.srcs[0]);
                },
                scope: this
            });
        }
        else {
            btn = btn[0];
        }

        return btn;
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

        if (this.studyAxisPanel.isVisible() && this.studyAxis  && this.studyAxisData && this.studyAxisData.length > 0) {
            this.studyAxis.width(this.studyAxisPanel.getWidth()- 40);
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
        var aes, hoverText;

        hoverText = function(row) {
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

        aes = {
            mouseOverFn: function(event, pointData, layerSel){
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
                            return '#00EAFF';
                        } else {
                            if (colorScale && colorAcc) {
                                return colorScale(colorAcc.getValue(d));
                            }

                            return '#000000';
                        }
                    };

                    opacityFn = function(d) {
                        return  d.subjectId.value === pointData.subjectId.value ? 1 : .3;
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
            },
            mouseOutFn: function(event, pointData, layerSel){
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
                            .attr('fill-opacity', .5)
                            .attr('stroke-opacity', .5);
                }
            }
        };

        if (isBoxPlot) {
            aes.pointHoverText = hoverText;
        } else {
            aes.hoverText = hoverText;
        }

        return aes;
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
            geom: new LABKEY.vis.Geom.DataspaceBoxPlot({}),
            aes: aes
        });
    },

    initPlot : function(config, noplot) {
        var rows = config.rows;
        // Below vars needed for brush and mouse event handlers.
        var isBrushed = false, layerScope = {plot: null, isBrushed: isBrushed}, plot, layer;

        this.plotEl.update('');
        this.resizePlotContainers();

        if (!rows || !rows.length) {
            this.showMessage('No information available to plot.');
            this.fireEvent('hideload', this);
            this.plot = null;
            this.noPlot();
            return;
        }
        else if (rows.length < this.rowlimit && !noplot && (this.percentOverlap && this.percentOverlap == 1)) {
            this.hideMessage();
        }

        if (this.plot) {
            this.plot.clearGrid();
            this.plot = null;
        }

        if (noplot) {
            layer = this.getNoPlotLayer();
        }else if (config.xaxis && config.xaxis.isContinuous) {
            // Scatter.
            layer = this.getPointLayer(layerScope);
        } else if (config.xaxis && !config.xaxis.isContinuous) {
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
            if (config.xaxis.isContinuous) {
                scales.x = {
                    scaleType: 'continuous'
                };

                if (config.xaxis.isNumeric) {
                    scales.x.tickFormat = numericTickFormat;
                } else if (config.xaxis.type === 'TIMESTAMP') {
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
            this.setScale(plotConfig.scales.x, 'x', config);
            this.setScale(plotConfig.scales.yLeft, 'y', config);

            // add brush handling
            plotConfig.brushing = {
                dimension: config.xaxis.isContinuous ? 'both' : 'y',
                brushstart : function() {
                    layerScope.isBrushed = true;
                },
                brush : function(event, layerData, extent, plot, layerSelections) {
                    var sel = layerSelections[0]; // We only have one layer, so grab the first one.
                    var subjects = {}; // Stash all of the selected subjects so we can highlight associated points.
                    var colorFn, opacityFn, strokeFn, colorScale = null, colorAcc = null;
                    var isX, isY, xExtent, yExtent, assocColorFn, assocOpacityFn, assocStrokeFn;

                    xExtent = [extent[0][0], extent[1][0]];
                    yExtent = [extent[0][1], extent[1][1]];
                    isX = xExtent[0] !== null && xExtent[1] !== null;
                    isY = yExtent[0] !== null && yExtent[1] !== null;

                    if (plot.scales.color && plot.scales.color.scale) {
                        colorScale = plot.scales.color.scale;
                        colorAcc = plot.aes.color;
                    }

                    colorFn = function(d) {
                        var x = d.x, y = d.y;

                        // Issue 20116
                        if (isX && isY) { // 2D
                            d.isSelected = (x > xExtent[0] && x < xExtent[1] && y > yExtent[0] && y < yExtent[1]);
                        } else if (isX) { // 1D
                            d.isSelected = (x > xExtent[0] && x < xExtent[1]);
                        } else if (isY) { // 1D
                            d.isSelected = (y > yExtent[0] && y < yExtent[1]);
                        } else { // Just incase.
                            d.isSelected = false;
                        }

                        if (d.isSelected) {
                            subjects[d.subjectId.value] = true;
                            return '#14C9CC';
                        } else {
                            if (colorScale && colorAcc) {
                                return colorScale(colorAcc.getValue(d));
                            }

                            return '#000000';
                        }
                    };

                    strokeFn = function(d) {
                        if (d.isSelected) {
                            return '#00393A';
                        } else {
                            if (colorScale && colorAcc) {
                                return colorScale(colorAcc.getValue(d));
                            }

                            return '#000000';
                        }
                    };

                    opacityFn = function(d) {
                        return d.isSelected ? 1 : .5;
                    };

                    sel.selectAll('.point path').attr('fill', colorFn)
                            .attr('stroke', strokeFn)
                            .attr('fill-opacity', opacityFn)
                            .attr('stroke-opacity', opacityFn);

                    assocColorFn = function(d) {
                        if (!d.isSelected && subjects[d.subjectId.value] === true) {
                            return '#01BFC2';
                        } else{
                            return this.getAttribute('fill');
                        }
                    };

                    assocStrokeFn = function(d) {
                        if (!d.isSelected && subjects[d.subjectId.value] === true) {
                            return '#00EAFF';
                        } else {
                            return this.getAttribute('stroke');
                        }
                    };

                    assocOpacityFn = function(d) {
                        if (d.isSelected || (!d.isSelected && subjects[d.subjectId.value] === true)) {
                            return 1;
                        } else {
                            return .3;
                        }
                    };

                    sel.selectAll('.point path').attr('fill', assocColorFn)
                            .attr('stroke', assocStrokeFn)
                            .attr('fill-opacity', assocOpacityFn)
                            .attr('stroke-opacity', assocOpacityFn);
                },
                brushend: function(event, layerData, extent, plot, layerSelections) {
                    var xExtent = [extent[0][0], extent[1][0]], yExtent = [extent[0][1], extent[1][1]], plotMeasures,
                            xMeasure, yMeasure, sqlFilters = [null, null, null, null], yMin, yMax, xMin, xMax;

                    var transformVal = function(val, type, isMin, domain) {
                        if (type === 'INTEGER') {
                            return isMin ? Math.floor(val) : Math.ceil(val);
                        } else if (type === 'TIMESTAMP') {
                            return isMin ? new Date(Math.floor(val)) : new Date(Math.ceil(val));
                        } else if (type === 'DOUBLE' || type === 'REAL' || type === 'FLOAT'){
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
                    yMeasure.colName = requiresPivot ? config.yaxis.name : config.yaxis.colName;

                    if (xMeasure) {
                        xMeasure.colName = requiresPivot ? config.xaxis.name : config.xaxis.colName;
                    }

                    plotMeasures = [xMeasure, yMeasure];

                    if (xMeasure && xExtent[0] !== null && xExtent[1] !== null) {
                        xMin = transformVal(xExtent[0], xMeasure.type, true, plot.scales.x.scale.domain());
                        xMax = transformVal(xExtent[1], xMeasure.type, false, plot.scales.x.scale.domain());

                        if (xMeasure.name.toLowerCase().indexOf("protocolday") > -1) {
                            xMin = Math.floor(xMin);
                            xMax = Math.ceil(xMax);
                        }

                        if (xMeasure.type === 'TIMESTAMP') {
                            sqlFilters[0] = LABKEY.Filter.create(xMeasure.colName, xMin.toISOString(), LABKEY.Filter.Types.DATE_GREATER_THAN_OR_EQUAL); //new LABKEY.Query.Filter.DateGreaterThanOrEqual(xMeasure.colName, xMin.toISOString());
                            sqlFilters[1] = LABKEY.Filter.create(xMeasure.colName, xMax.toISOString(), LABKEY.Filter.Types.DATE_LESS_THAN_OR_EQUAL); //new LABKEY.Query.Filter.DateLessThanOrEqual(xMeasure.colName, xMax.toISOString());
                        } else {
                            sqlFilters[0] = LABKEY.Filter.create(xMeasure.colName, xMin, LABKEY.Filter.Types.GREATER_THAN_OR_EQUAL); //new LABKEY.Query.Filter.Gte(xMeasure.colName, xMin);
                            sqlFilters[1] = LABKEY.Filter.create(xMeasure.colName, xMax, LABKEY.Filter.Types.LESS_THAN_OR_EQUAL); //new LABKEY.Query.Filter.Lte(xMeasure.colName, xMax);
                        }
                    }

                    if (yMeasure && yExtent[0] !== null && yExtent[1] !== null) {
                        yMin = transformVal(yExtent[0], yMeasure.type, true, plot.scales.yLeft.scale.domain());
                        yMax = transformVal(yExtent[1], yMeasure.type, false, plot.scales.yLeft.scale.domain());

                        sqlFilters[2] = LABKEY.Filter.create(yMeasure.colName, yMin, LABKEY.Filter.Types.GREATER_THAN_OR_EQUAL); // new LABKEY.Query.Filter.Gte(yMeasure.colName, yMin);
                        sqlFilters[3] = LABKEY.Filter.create(yMeasure.colName, yMax, LABKEY.Filter.Types.LESS_THAN_OR_EQUAL); // new LABKEY.Query.Filter.Lte(yMeasure.colName, yMax);
                    }

                    // plot brushing filters need to include the antigen selection if this is a pivoted query
                    if (requiresPivot && xMeasure.options.antigen.name == yMeasure.options.antigen.name)
                    {
                        var antigens = xMeasure.options.antigen.values.concat(yMeasure.options.antigen.values);
                        sqlFilters.push(LABKEY.Filter.create(yMeasure.options.antigen.name, antigens, LABKEY.Filter.Types.IN)); // new LABKEY.Query.Filter.In(yMeasure.options.antigen.name, antigens));
                    }

                    Connector.model.Filter.sqlToMdx({
                        schemaName: requiresPivot ? yMeasure.schemaName : config.schemaName,
                        queryName: requiresPivot ? yMeasure.queryName : config.queryName,
                        subjectColumn: requiresPivot ? Connector.studyContext.subjectColumn : config.subjectColumn,
                        measures: plotMeasures,
                        sqlFilters: sqlFilters,
                        success: function(filterConfig){
                            stateManager.addSelection([filterConfig], true, false, true);
                        },
                        scope: this
                    });
                },
                brushclear : function(event, allData, plot, selections) {
                    layerScope.isBrushed = false;
                    stateManager.clearSelections(true);
                    selections[0].selectAll('.point path').attr('fill-opacity',.5).attr('stroke-opacity',.5);
                }
            };
        }

        this.plot = new LABKEY.vis.Plot(plotConfig);
        layerScope.plot = this.plot; // hoisted for mouseover/mouseout event listeners
        var measures = this.measures; // hoisted for brushend.
        var stateManager = this.state; // hoisted for brushend and brushclear.
        var requiresPivot = this.requiresPivot(this.measures[0], this.measures[1]); // hoisted for brushend.

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

    setScale : function(scale, axis, config) {
        // This function should likley be renamed, and refactored so it's less side-effecty.
        if (scale.scaleType !== 'discrete') {
            var axisValue = this.getScale(axis), allowLog = (axis == 'y') ? !config.setYLinear : !config.setXLinear;

            if (!allowLog && axisValue == 'log') {
                this.showMessage('Displaying the ' + axis.toLowerCase() + '-axis on a linear scale due to the presence of invalid log values.');
                axisValue = 'linear';
            }

            // issue 21300: set x-axis domain min/max based on study axis milestones if they exist
            var min = null, max = null;
            if (axis == 'x' && this.studyAxisRange.min != null) {
                min = this.studyAxisRange.min < 0 ? this.studyAxisRange.min : 0;
            }
            if (axis == 'x' && this.studyAxisRange.max != null) {
                max = this.studyAxisRange.max > 0 ? this.studyAxisRange.max : 0;
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
        var filters = this.state.getFilters();
        for (var f=0; f < filters.length; f++) {
            if (filters[f].isPlot() === true) {
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
        if (measures.y != null && measures.x !=null && measures.color != null)
        {
            var queryMatch = ((measures.color.schemaName == measures.y.schemaName && measures.color.queryName == measures.y.queryName) ||
                              (measures.color.schemaName == measures.x.schemaName && measures.color.queryName == measures.x.queryName));
            measures.color.allowNullResults = queryMatch;
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
            this.studyAxisPanel.setVisible(false);
            this.state.clearSelections(true);
            this.filterClear = false;
            this.noPlot();
        }
        else {
            this.measures = [ activeMeasures.x, activeMeasures.y, activeMeasures.color ];

            this.fireEvent('showload', this);

            this.requireStudyAxis = activeMeasures.x !== null && activeMeasures.x.variableType === "TIME";

            if (!this.fromFilter && activeMeasures.y !== null) {
                this.updatePlotBasedFilter(activeMeasures);
            }
            else {
                this.initialized = true;
                this.createTempQuery(activeMeasures);
            }
        }
    },

    getWrappedMeasures : function(activeMeasures) {

        var requiresPivot = this.requiresPivot(activeMeasures.x, activeMeasures.y);

        var wrappedMeasures = [null, null, null];
        if (activeMeasures.x) {
            wrappedMeasures[0] = this.getAxisWrappedMeasure('x', activeMeasures, requiresPivot);
        }
        if (activeMeasures.y) {
            wrappedMeasures[1] = this.getAxisWrappedMeasure('y', activeMeasures, requiresPivot);
        }
        if (activeMeasures.color) {
            wrappedMeasures[2] = {measure : activeMeasures.color, time: 'date'};
        }

        return wrappedMeasures;
    },

    requestChartData : function(r) {
        var filters = [];
        var config = {
            schemaName: r.schemaName,
            queryName: r.queryName,
            success: this.onChartDataSuccess,
            failure: this.onFailure,
            requiredVersion: '9.1',
            maxRows: (this.rowlimit+1),
            scope: this
        };

        if (this.measures[0] !== null && !this.isContinuousMeasure(this.measures[0])) {
            filters.push(new LABKEY.Query.Filter.NonBlank(this.measureToColumn[this.measures[0].name]));
            filters.push(new LABKEY.Query.Filter.NonBlank(this.measureToColumn[this.measures[1].name]));
        }

        if (Ext.isArray(this.timeFilters)) {
            filters = filters.concat(this.timeFilters);
        }

        if (filters.length > 0) {
            config.filterArray = filters;
        }

        LABKEY.Query.selectRows(config);
    },

    createTempQuery : function(activeMeasures) {
        // This creates a temp query via getData which is then used to query for unique participants, and is also what
        // we use to back the chart data (via selectRows on the temp query).
        var requiresPivot = this.requiresPivot(activeMeasures.x, activeMeasures.y);

        // add "additional" measures (ex. selecting subset of antigens/analytes to plot for an assay result)
        var additionalMeasures = this.getAdditionalMeasures(activeMeasures, requiresPivot);

        // Request Participant List
        this.getParticipantIn(function(ptidList) {
            var wrappedMeasures = this.getWrappedMeasures(activeMeasures), nonNullMeasures = [], sorts = this.getSorts();

            for (var i =0; i < wrappedMeasures.length; i++) {
                if (wrappedMeasures[i]) {
                    nonNullMeasures.push(wrappedMeasures[i]);
                }
            }

            if (ptidList) {
                this.applyFiltersToSorts(sorts, ptidList);
            }

            this.setColumnMetadata(null);

            // Request Chart Data
            LABKEY.Query.Visualization.getData({
                measures: nonNullMeasures.concat(additionalMeasures),
                sorts: sorts,
                metaDataOnly: true,
                success: function(json) {
                    this.setColumnMetadata(json);
                    this.requestChartData(json);
                },
                failure: this.onFailure,
                scope: this
            });
        });
    },

    getAxisWrappedMeasure : function(axis, activeMeasures, requiresPivot) {
        var measure = activeMeasures[axis];
        var options = activeMeasures[axis].options;
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
            wrappedMeasure.dimension = this.getDimension(activeMeasures);
        }

        return wrappedMeasure;
    },

    requiresPivot : function(xMeasure, yMeasure) {
        // handle scenario where we are plotting either the same variable,
        // with different antigen subsets, from the same source
        // or different variables from the same source and the results will
        // be pivoted by the getData API

        return xMeasure != null && yMeasure != null
            && this.isContinuousMeasure(xMeasure) && this.isContinuousMeasure(yMeasure)
            && xMeasure.options && xMeasure.options.antigen
            && yMeasure.options && yMeasure.options.antigen
            && xMeasure.schemaName == yMeasure.schemaName
            && xMeasure.queryName == yMeasure.queryName
            && xMeasure.variableType == null && yMeasure.variableType == null;
    },

    getDimension : function(activeMeasures) {
        // NOTE: only used when plotting antigens from the same source against each other
        // so we can assume that the x and y axis measures are the same schema, query, colName

        var schema = activeMeasures.x.schemaName || activeMeasures.y.schemaName;
        var query = activeMeasures.x.queryName || activeMeasures.y.queryName;

        var xAntigen = activeMeasures.x.options.antigen;
        var yAntigen = activeMeasures.y.options.antigen;

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
        var measuresMap = {}, additionalMeasuresArr = [], filters = this.state.getFilters();

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

    onChartDataSuccess : function(response) {

        if (!this.isActiveView) {
            return;
        }

        this.selectRowsResponse = response;

        this._preprocessData(response);
    },

    /**
     * This function is meant to update the values within the 'In the plot' filter
     * @param activeMeasures
     */
    updatePlotBasedFilter : function(activeMeasures) {
        var wrappedMeasures, nonNullMeasures = [], requiresPivot, additionalMeasures;

        wrappedMeasures = this.getWrappedMeasures(activeMeasures);

        for (var i =0; i < wrappedMeasures.length; i++) {
            if (wrappedMeasures[i]) {
                nonNullMeasures.push(wrappedMeasures[i]);
            }
        }

        requiresPivot = this.requiresPivot(activeMeasures.x, activeMeasures.y);

        // add "additional" measures (ex. selecting subset of antigens/analytes to plot for an assay result)
        additionalMeasures = this.getAdditionalMeasures(activeMeasures, requiresPivot);

        this.setColumnMetadata(null);

        // Request Distinct Participants
        LABKEY.Query.Visualization.getData({
            measures: nonNullMeasures.concat(additionalMeasures),
            sorts: this.getSorts(),
            metaDataOnly: true,
            success: function(response) {
                // Note: We intentionally pass in the measures object that might have nulls.
                this._updatePlotBasedFilterHelper(response, wrappedMeasures, function() {
                    this.createTempQuery(activeMeasures);
                }, this);
            },
            failure: this.onFailure,
            scope: this
        });
    },

    _updatePlotBasedFilterHelper : function(response, wrappedMeasures, callback, scope) {
        LABKEY.Query.selectDistinctRows({
            schemaName: response.schemaName,
            queryName: response.queryName,
            column: response.measureToColumn[Connector.studyContext.subjectColumn],
            success: function(data) {

                var filter = {
                    hierarchy: 'Subject',
                    isPlot: true,
                    plotMeasures: wrappedMeasures,
                    plotScales: [this.getScale('x'), this.getScale('y')],
                    members: []
                };

                for (var i=0; i < data.values.length; i++) {
                    filter.members.push({
                        uniqueName: Connector.model.Filter.getSubjectUniqueName(data.values[i])
                    });
                }

                // TODO: Be better about letting other views know about application level column changes
                var updated = false;
                this.plotLock = true;
                var filters = this.state.getFilters(), found = false;
                for (var f=0; f < filters.length; f++) {
                    if (filters[f].get('isPlot') == true && filters[f].get('isGrid') == false) {
                        if (!Connector.model.Filter.plotMeasuresEqual(filters[f].get('plotMeasures'), wrappedMeasures)) {
                            filters[f].set('plotMeasures', wrappedMeasures);
                            // TODO: Before we update filter members check to see if the filters actually changed.
                            // Call Filter.plotMeasuresEqual (see Filter.js).
                            this.state.updateFilterMembers(filters[f].get('id'), filter.members);
                            this.state.updateFilterMembersComplete(false);
                            updated = true;
                        } else {
                            this.state.updateFilterMembers(filters[f].get('id'), filter.members);
                            this.state.updateFilterMembersComplete(true);
                            updated = true;
                        }

                        found = true;
                        break;
                    }
                }
                if (!found) {
                    this.state.prependFilter(filter);
                    updated = true;
                }
                this.plotLock = false;

                if (updated) {
                    this.state.getApplication().fireEvent('plotmeasures');
                }

                if (Ext.isFunction(callback)) {
                    callback.call(scope);
                }
            },
            scope: this
        });
    },

    setColumnMetadata : function(dataResponse) {
        if (dataResponse) {
            this.measureToColumn = dataResponse.measureToColumn;
            this.columnAliases = dataResponse.columnAliases;
        }
        else {
            this.measureToColumn = null;
            this.columnAliases = null;
        }
    },

    noPlot : function() {

        var map = [{
            x : null,
            xname : 'X-Axis',
            y : null,
            yname : 'Y-Axis',
            subjectId: null
        }];

        this.initPlot({rows:map}, true);
        this.resizeTask.delay(300);
        this.noplotmsg.show();
    },

    onFailure : function(response) {
        console.log(response);
        this.fireEvent('hideload', this);
        this.showMessage('Failed to Load');
    },

    isValidNumber: function(number){
        return !(number === undefined || isNaN(number) || number === null);
    },

    isValidValue: function(measure, value) {
        var type = measure.type;
        if (type === 'INTEGER' || type === 'DOUBLE' || type === 'FLOAT' || type === 'REAL') {
            return this.isValidNumber(value);
        } else {
            return !(value === undefined || value === null);
        }
    },

    _getValue : function(measure, colName, row) {
        var val, type = measure.type;

        if (type === 'INTEGER') {
            val = parseInt(row[colName].value);
            return this.isValidNumber(val) ? val : null;
        } else if (type === 'DOUBLE' || type === 'FLOAT' || type === 'REAL') {
            val = parseFloat(row[colName].value);
            return this.isValidNumber(val) ? val : null;
        } else if (type === 'TIMESTAMP') {
            val = row[colName].value;
            return val !== undefined && val !== null ? new Date(val) : null;
        } else {
            // Assume categorical.
            val = row[colName].displayValue ? row[colName].displayValue : row[colName].value;
            return (val !== undefined) ? val : null;
        }
    },

    _preprocessSelectRowsResp : function() {
        var data = this.selectRowsResponse, x = this.measures[0], y = this.measures[1], color = this.measures[2], xa = null,
                ya = null, ca = null,_xid, _yid, _cid, mTC = this.measureToColumn;

        this.dataQWP = {schema: data.schemaName, query: data.queryName};

        var subjectNoun = Connector.studyContext.subjectColumn;
        var subjectCol = mTC[subjectNoun];

        if (color) {
            _cid = mTC[color.alias] || mTC[color.name];
        }

        data = this.processPivotedData(data, x, y, subjectCol, _cid);

        if (x) {
            _xid = x.interval || mTC["xAxis"] || mTC[x.alias] || mTC[x.name];
            xa = {
                schema : x.schemaName,
                query  : x.queryName,
                name   : x.name,
                alias  : x.alias,
                colName: _xid, // Stash colName so we can query the getData temp table in the brushend handler.
                label  : x.label,
                type   : x.type,
                isNumeric : x.type === 'INTEGER' || x.type === 'DOUBLE' || x.type === 'FLOAT' || x.type === 'REAL',
                isContinuous: this.isContinuousMeasure(x)
            };
        } else {
            xa = {
                schema  : null,
                query   : null,
                name    : null,
                alias   : null,
                colName : null,
                label   : "",
                isNumeric: false
            }
        }

        _yid = mTC["yAxis"] || mTC[y.alias] || mTC[y.name];
        ya = {
            schema : y.schemaName,
            query  : y.queryName,
            name   : y.name,
            alias  : y.alias,
            colName: _yid, // Stash colName so we can query the getData temp table in the brushend handler.
            label  : y.label,
            type   : y.type,
            isNumeric : y.type === 'INTEGER' || y.type === 'DOUBLE' || y.type === 'FLOAT' || y.type === 'REAL',
            isContinuous: this.isContinuousMeasure(y)
        };

        if (color) {
            ca = {
                schema : color.schemaName,
                query  : color.queryName,
                name   : color.name,
                alias  : color.alias,
                colName: _cid, // Stash colName so we can query the getData temp table in the brushend handler.
                label  : color.label,
                type   : color.type
            };
        } else {
            ca = {
                schema  : null,
                query   : null,
                name    : null,
                alias   : null,
                colName : null,
                label   : "",
                isNumeric: false
            }
        }

        var map = [], r,
                rows = data.rows,
                len = rows.length,
                validCount = 0;

        if (len > this.rowlimit) {
            len = this.rowlimit;
            this.showMessage('Plotting first ' + Ext.util.Format.number(this.rowlimit, '0,000') + ' points.');
        }
        else if (this.msg) {
            this.msg.hide();
        }

        var xVal, yVal, colorVal, xIsNum, yIsNum, negX = false, negY = false, xAntigen, yAntigen;
        for (r = 0; r < len; r++) {
            if (x) {
                xVal = this._getValue(x, _xid, rows[r]);
                xAntigen = rows[r][_xid].antigen;
            } else {
                xVal = "";
            }

            yVal = this._getValue(y, _yid, rows[r]);
            yAntigen = rows[r][_yid].antigen;

            if (color) {
                colorVal = this._getValue(color, _cid, rows[r]);
            } else {
                colorVal = null;
            }

            // allow any pair that does not contain a negative value.
            // NaN, null, and undefined are non-negative values.

            // validate x
            if (xa && xa.isNumeric) {
                xIsNum = !(Ext.isNumber(x) && x < 1);
                if (!negX && !xIsNum) {
                    negX = true;
                }
            }

            // validate y
            if (ya.isNumeric) {
                yIsNum = !(Ext.isNumber(y) && y < 1);
                if (!negY && !yIsNum) {
                    negY = true;
                }
            }

            if ((xa && xa.isNumeric) || (!xa.isNumeric && xVal !== undefined && xVal !== null)) {
                map.push({
                    x : xVal,
                    y : yVal,
                    color : colorVal,
                    subjectId: rows[r][subjectCol],
                    xname : (xa ? xa.label : null) + (xAntigen ? " (" + xAntigen + ")" : ''),
                    yname : ya.label + (yAntigen ? " (" + yAntigen + ")" : ''),
                    colorname : ca.label
                });
            }

            if ((!x || this.isValidValue(x, xVal)) && this.isValidValue(y, yVal)) {
                validCount ++;
            }
        }

        this.percentOverlap = validCount / len;

        if(this.percentOverlap < 1 && xa.isContinuous){
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
                        overlap : Ext.util.Format.round(this.percentOverlap * 100, 2)
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

        this.plotData = {
            schemaName: data.schemaName,
            queryName: data.queryName,
            // We need the subject column as it appears in the temp query for the brushend handler.
            subjectColumn: subjectCol,
            xaxis: xa,
            yaxis: ya,
            color: ca,
            rows : map,
            setXLinear : negX,
            setYLinear : negY
        };
    },

    processPivotedData : function(data, x, y, subjectCol, colorCol) {
        // when we are plotting subsets of antigens from the same source against each other, we pivot the data
        // so we need to unpivot it here for each combination of x-axis antigen by y-axis antigen

        if (this.requiresPivot(x, y)) {
            var xantigen = x.options.antigen;
            var yantigen = y.options.antigen;

            if (xantigen != null && xantigen.values.length > 0 &&
                    yantigen != null && yantigen.values.length > 0)
            {

                var xColName = x.name;
                var yColName = y.name;

                // get the mapping of the column aliases in the data object in an easier format to reference
                var columnAliasMap = {};
                Ext.each(this.columnAliases, function(alias) {
                    columnAliasMap[alias.measureName + "::" + alias.pivotValue] = alias.columnName;
                });

                // create an array of antigen pairs (of the data object column aliases)
                var antigenColumnAliasPairs = [];
                for (i = 0; i < xantigen.values.length; i++)
                {
                    var xAntigenVal = xantigen.values[i];
                    for (var j = 0; j < yantigen.values.length; j++)
                    {
                        var yAntigenVal = yantigen.values[j];
                        antigenColumnAliasPairs.push({
                            xAlias: columnAliasMap[xColName + "::" + xAntigenVal],
                            xAntigen: xAntigenVal,
                            yAlias: columnAliasMap[yColName + "::" + yAntigenVal],
                            yAntigen: yAntigenVal
                        });
                    }
                }

                // special case for having the same measure on both axis
                if (xColName == yColName)
                {
                    xColName += '-x';
                    yColName += '-y';

                    // remap the column names to what we will set them to
                    this.measureToColumn['xAxis'] = xColName;
                    this.measureToColumn['yAxis'] = yColName;
                }
                else
                {
                    // remap the column names to what we will set them to
                    this.measureToColumn[xColName] = xColName;
                    this.measureToColumn[yColName] = yColName;
                }

                // create the new data.rows array with a row for each ptid/visit/antigenPair
                var newRowsArr = [];
                for (var i = 0; i < data.rows.length; i++)
                {
                    var row = data.rows[i];
                    Ext.each(antigenColumnAliasPairs, function(pair) {
                        var dataRow = {};
                        dataRow[subjectCol] = row[subjectCol];
                        dataRow[colorCol] = row[colorCol];

                        // issue 20589: skip null-null points produced by pivot
                        if (row[pair.xAlias].value != null || row[pair.yAlias].value != null)
                        {
                            dataRow[xColName] = row[pair.xAlias];
                            dataRow[xColName].antigen = pair.xAntigen;
                            dataRow[yColName] = row[pair.yAlias];
                            dataRow[yColName].antigen = pair.yAntigen;

                            newRowsArr.push(dataRow);
                        }
                    });
                }

                data.rows = newRowsArr;
            }
        }

        return data;
    },

    isContinuousMeasure : function(measure) {
        var type = measure.type;
        return type === 'INTEGER' || type === 'DOUBLE' || type === 'TIMESTAMP' || type === 'FLOAT' || type === 'REAL';
    },

    updateMeasureSelection : function(win) {
        if (win) {
            var pos = this.getPlotPosition(), offset = 0;
            win.setSize(pos.width, pos.height);

            if (pos.width > win.width) {
                // If the window width is at maxWidth then we need to center the window in the plot area.
                offset = (pos.width - win.width) / 2;
            }

            win.setPosition(pos.leftEdge + offset, pos.topEdge, false);
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
        this.ywin.show(targetEl, function() {
            this.runUniqueQuery(this.axisPanelY);
        }, this);
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

        this.xwin.show(targetEl, function() {
            this.runUniqueQuery(this.axisPanelX);
        }, this);
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

        this.colorwin.show(targetEl, function() {
            this.runUniqueQuery(this.colorPanel);
        }, this);
    },

    removeVariableFromFilter : function(measureIdx) {
        var filter = this.getPlotsFilter();
        if (filter != null) {
            var m = filter.get('plotMeasures');
            m[measureIdx] = null;
            this.state.updateFilter(filter.get('id'), {plotMeasures: m});
        }
    },

    getPlotsFilter : function() {
        var filters = this.state.getFilters();
        for (var f=0; f < filters.length; f++) {
            if (filters[f].get('isPlot') == true && filters[f].get('isGrid') == false) {
                return filters[f];
            }
        }

        return null;
    },

    runUniqueQuery : function(axisSelector) {
        var picker = axisSelector.getMeasurePicker();

        if (picker) {
            var me = this;
            me.getParticipantIn(function(subjects) {
                picker.setCountMemberSet(subjects);
            });
        }
    },

    showMessage : function(msg, append) {

        if (!append)
            this.hideMessage();
        else if (this.msg && this.msg.isVisible()) {
            this.msg.msg += '<br/>' + msg;
            this.msg.update(this.msg.msg);
            var box = this.getBox();
            var x = Math.floor(box.width/2 - Math.floor(this.getEl().getTextWidth(msg)/2)) - 20;
            this.msg.showAt(x,box.y+20);
            return;
        }

        var box = this.getBox();

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
        this.isActiveView = (view == 'plot');

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

    getParticipantIn : function(callback, scope) {
        var me = this;

        this.state.onMDXReady(function(mdx){

            if (mdx.hasFilter(LABKEY.app.constant.STATE_FILTER)) {
                mdx.queryParticipantList({
                    useNamedFilters : [LABKEY.app.constant.STATE_FILTER],
                    success : function (cs) {
                        var ptids = [], pos = cs.axes[1].positions, a;
                        for (a=0; a < pos.length; a++) {
                            ptids.push(pos[a][0].name);
                        }

                        callback.call(scope || me, ptids);
                    },
                    scope : scope || me
                });
            }
            else
                callback.call(scope || me, null);

        }, me);
    },


    applyFiltersToSorts : function (sorts, ptids) {
        var ptidSort;
        for (var i = 0; i < sorts.length; i++)
        {
            if (sorts[i].name == Connector.studyContext.subjectColumn) {
                ptidSort = sorts[i];
                break;
            }
        }

        ptidSort.values = ptids;
    },

    getSorts : function() {
        var firstMeasure = undefined;

        // if we can help it, the sort should use the first non-demographic measure
        for (var i=0; i < this.measures.length; i++) {
            var item = this.measures[i];
            if (item && !item.isDemographic && item.queryName !== Connector.studyContext.subjectVisitColumn) {
                firstMeasure = item;
                break;
            }
        }

        var sorts = [];
        if (firstMeasure) {
            // pull from the selected sources shared columns
            sorts.push({
                name: Connector.studyContext.subjectColumn,
                queryName: firstMeasure.queryName,
                schemaName: firstMeasure.schemaName
            });
            sorts.push({
                name: Connector.studyContext.subjectVisitColumn + '/sequencenum',
                queryName: firstMeasure.queryName,
                schemaName: firstMeasure.schemaName
            });
        }
        else {
           // resort to the default columns
           sorts.push({
               name: Connector.studyContext.subjectColumn,
               queryName: this.defaultSortQuery,
               schemaName: this.defaultSortSchema
           });
           sorts.push({
               name: Connector.studyContext.subjectVisitColumn + '/sequencenum',
               queryName: this.defaultSortQuery,
               schemaName: this.defaultSortSchema
           });
        }

        return sorts;
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

    requestStudyAxisData : function() {
        var studyContainers = Object.keys(this.alignmentMap), inClause, sql;
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
            success: function(resp){
                if (!this.isActiveView) {
                    return;
                }

                this._preprocessStudyAxisData(resp);
                this.initPlot(this.plotData, false);
                this.initStudyAxis();
            },
            failure: function(resp) {console.error('Error retrieving study axis data')},
            scope: this
        });
    },

    _convertInterval : function(d, interval) {
        // Conversion methods here taken from VisualizationIntervalColumn.java line ~30
        if (interval == 'days') {
            return d;
        } else if (interval == 'weeks') {
            return d / 7;
        } else if (interval == 'months') {
            return d / (365.25/12);
        }
    },

    _buildAlignmentMap : function() {
        var rows = this.selectRowsResponse.rows, am = {}, xColName, visitColName, protocolColName, container,
                protocolDay, shiftedVal, interval, visitMap = {};

        xColName = this.measures[0].interval;
        interval = xColName.toLowerCase();
        visitColName = this.measureToColumn[Connector.studyContext.subjectVisitColumn + '/Visit'];
        protocolColName = visitColName + '_ProtocolDay';

        for (var i = 0; i < rows.length; i++) {
            container = rows[i].SubjectVisit_Visit_Folder.value;
            visitMap[rows[i][visitColName].value] = true;
            if (!am[container]) {
                shiftedVal = rows[i][xColName].value;
                protocolDay = Math.floor(this._convertInterval(rows[i][protocolColName].value, interval));
                am[container] = shiftedVal - protocolDay;
            }
        }

        this.visitMap = visitMap;
        this.alignmentMap = am;
    },

    _preprocessStudyAxisData : function(resp) {
        var rows = resp.rows, alignmentMap = this.alignmentMap, interval, studyMap = {}, studyLabel,
                study, studyContainer, studyKeys, visit, visits, visitId, visitKeys, visitKey, visitLabel, seqMin,
                seqMax, protocolDay, timepointType, visitTagCaption, shiftVal, i, j;

        this.studyAxisData = [];
        this.studyAxisRange.min = null;
        this.studyAxisRange.max = null;

        interval = this.measures[0].interval.toLowerCase();

        for (j = 0; j < rows.length; j++) {
            studyLabel = rows[j].StudyLabel.value;
            studyContainer = rows[j].StudyContainer.value;
            shiftVal = alignmentMap[studyContainer];
            visitId = rows[j].VisitRowId.value;
            visitLabel = rows[j].VisitLabel.value;
            seqMin = rows[j].SequenceNumMin.value;
            seqMax = rows[j].SequenceNumMax.value;
            protocolDay = this._convertInterval(rows[j].ProtocolDay.value, interval) + shiftVal;
            timepointType = rows[j].TimepointType.value;
            visitTagCaption = rows[j].VisitTagCaption.value;

            if (!this.visitMap[visitId] && !visitTagCaption) { continue; }

            if (timepointType !== 'VISIT') {
                seqMin = this._convertInterval(seqMin, interval) + shiftVal;
                seqMax = this._convertInterval(seqMax, interval) + shiftVal;
            }

            if (!studyMap.hasOwnProperty(studyLabel)) {
                studyMap[studyLabel] = {
                    label : studyLabel,
                    timepointType : timepointType,
                    visits: {}
                };
            }

            study = studyMap[studyLabel];

            if (!study.visits.hasOwnProperty(visitId)) {
                study.visits[visitId] = {
                    label: visitLabel,
                    sequenceNumMin: seqMin,
                    sequenceNumMax: seqMax,
                    protocolDay: protocolDay,
                    hasPlotData: this.visitMap[visitId] != undefined,
                    visitTags: {}
                };
            }

            visit = study.visits[visitId];

            if (visitTagCaption !== null && !visit.visitTags.hasOwnProperty(visitTagCaption)) {
                visit.visitTags[visitTagCaption] = visitTagCaption;
            }

            if (this.studyAxisRange.min == null || this.studyAxisRange.min > protocolDay)
                this.studyAxisRange.min = protocolDay;
            if (this.studyAxisRange.max == null || this.studyAxisRange.max < protocolDay)
                this.studyAxisRange.max = protocolDay;
        }

        // Convert study map and visit maps into arrays.
        studyKeys = Object.keys(studyMap).sort();

        for (i = 0; i < studyKeys.length; i++) {
            study = studyMap[studyKeys[i]];
            visitKeys = Object.keys(study.visits).sort();
            visits = [];
            for (j = 0; j < visitKeys.length; j++) {
                visitKey = visitKeys[j];
                study.visits[visitKey].visitTags = Object.keys(study.visits[visitKey].visitTags).sort();
                visits.push(study.visits[visitKey]);
            }

            study.visits = visits;
            this.studyAxisData.push(study);
        }
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

    initStudyAxis : function() {
        if (!this.studyAxis) {
            this.studyAxis = Connector.view.StudyAxis().renderTo('study-axis');
        }

        this.studyAxis.studyData(this.studyAxisData)
                .scale(this.plot.scales.x.scale)
                .width(this.studyAxisPanel.getWidth() - 40)
                .visitMouseover(this.showVisitHover, this)
                .visitMouseout(this.removeVisitHover, this)
                .visitTagMouseover(this.showVisitTagHover, this)
                .visitTagMouseout(this.removeVisitTagHover, this);

        this.studyAxis();
    },

    _preprocessData : function() {
        this._preprocessSelectRowsResp();
        if (this.requireStudyAxis) {
            this._buildAlignmentMap();
            this.requestStudyAxisData();
        } else {
            this.initPlot(this.plotData, false);
        }
    },

    resizePlotContainers : function() {
        if (this.requireStudyAxis && this.studyAxisData && this.studyAxisData.length > 0) {
            this.plotEl.setStyle('padding', '0 0 0 150px');
            this.studyAxisPanel.setVisible(true);
            this.studyAxisPanel.setHeight(Math.min(100, 27 * this.studyAxisData.length));
        } else {
            this.plotEl.setStyle('padding', '0');
            this.studyAxisPanel.setVisible(false);
        }
    },

    // FOR TESTING USE
    showPlotDataGrid : function(targetEl) {
        window.open(LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {
            schemaName: this.dataQWP.schema, 'query.queryName': this.dataQWP.query
        }), '_blank');
    }
});
