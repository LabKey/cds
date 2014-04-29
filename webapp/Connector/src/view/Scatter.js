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

    measures: [],
    allColumns: false,
    canShowHidden: false,

    isActiveView: true,
    refreshRequired: true,
    initialized: false,
    showAxisButtons: true,

    plotHeightOffset: 90, // value in 'px' that the plot svg is offset for container region
    rowlimit: 5000,

    layout: 'border',

    initComponent : function() {

        this.items = [
            this.getNorth(),
            this.getCenter(),
            this.getSouth()
        ];

        this.callParent();

        this.on('afterrender', function() {
            Ext.create('Ext.Component', {
                id: 'scatterloader',
                renderTo: Ext.getBody(),
                autoEl: {
                    tag: 'img',
                    src: LABKEY.contextPath + '/production/Connector/resources/images/grid/loading.gif',
                    alt: 'loading',
                    height: 25,
                    width: 25
                }
            });
            this.loader = Ext.get('scatterloader');

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
        }, this, {single: true});

        this.attachInternalListeners();
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
            bodyStyle: 'background: linear-gradient(#f0f0f0, #ebebeb) !important;',
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
                    model: new Ext.create('Connector.model.Variable', {
                        typeLabel: 'y'
                    })
                }]
            },{
                items: [{
                    id: 'colorselector',
                    xtype: 'variableselector',
                    disabled: true,
                    model: new Ext.create('Connector.model.Variable', {
                        typeLabel: 'color'
                    })
                }]
            }]
        };
    },

    getCenter : function() {
        return {
            itemId: 'plotdisplay',
            xtype: 'box',
            region: 'center',
            border: false, frame: false,
            id: Ext.id(),
            autoEl : {
                tag: 'div',
                cls: 'emptyplot plot'
            },
            listeners: {
                afterrender: {
                    fn: function(box) {
                        this.plotEl = box.getEl();
                    },
                    single: true,
                    scope: this
                }
            }
        };
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
                    model: new Ext.create('Connector.model.Variable', {
                        typeLabel: 'x'
                    })
                }]
            }]
        };
    },

    attachInternalListeners : function() {

        this.showTask = new Ext.util.DelayedTask(this.onShowGraph, this);
        this.resizeTask = new Ext.util.DelayedTask(this.handleResize, this);

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
        var el = Ext.DomQuery.select('svg');
        if (el.length > 0) {
            el = el[0];
        }
        return el;
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
            this.plot.setSize(plotbox.width, plotbox.height, true);
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

    getPointLayer : function(layerScope) {
        return new LABKEY.vis.Layer({
            geom: new LABKEY.vis.Geom.Point({
                size: 3,
                plotNullPoints: true,
                opacity: 0.5
            }),
            aes: {
                hoverText : function(row) {
                    // TODO: figure out how to display subject id.
                    return '' + row.xname + ': ' + row.x + ', ' + row.yname + ': ' + row.y;
                },
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
                            return  d.subjectId.value === pointData.subjectId.value ? 1 : .5;
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
            }
        });
    },

    getBoxLayer : function() {
        return new LABKEY.vis.Layer({
            geom: new LABKEY.vis.Geom.Boxplot({})
        });
    },

    initPlot : function(config, noplot) {
        var rows = config.rows;
        // Below vars needed for brush and mouse event handlers.
        var isBrushed = false, layerScope = {plot: null, isBrushed: isBrushed}, plot, layer;

        if (!rows || !rows.length) {
            this.showMessage('No information available to plot.');
            this.hideLoad();
            this.plot = null;
            this.plotEl.update('');
            this.noPlot();
            return;
        }
        else if (rows.length < this.rowlimit && !noplot && (this.percentOverlap && this.percentOverlap == 1)) {
            this.hideMessage();
        }

        if (this.plot) {
            this.plot.clearGrid();
            this.plotEl.update('');
            this.plot = null;
        }

        if (noplot) {
            layer = this.getNoPlotLayer();
        }else if (config.xaxis && config.xaxis.isContinuous) {
            // Scatter.
            layer = this.getPointLayer(layerScope);
        } else if (config.xaxis && !config.xaxis.isContinuous) {
            // Box plot (aka 1D).
            layer = this.getBoxLayer();
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
        }

        var plotConfig = {
            renderTo: this.plotEl.id,
            rendererType: 'd3',
            throwErrors: true,
            clipRect: false,
            margins: {top: 25, left: 25+43, right: 25+10, bottom: 25+43},
            width     : box.width,
            height    : box.height,
            data      : rows,
            legendPos : 'none',
            aes: {
                x: function(row){return row.x;},
                yLeft: function(row){return row.y}
            },
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
            if (config.xaxis.isNumeric) {
                plotConfig.brushing = {
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
                            if (!d.isSelected && subjects[d.subjectId.value] === true) {
                                return 1;
                            } else {
                                return this.getAttribute('fill-opacity');
                            }
                        };

                        sel.selectAll('.point path').attr('fill', assocColorFn)
                                .attr('stroke', assocStrokeFn)
                                .attr('fill-opacity', assocOpacityFn)
                                .attr('stroke-opacity', assocOpacityFn);
                    },
                    brushend: function(event, layerData, extent, plot, layerSelections) {
                        var xExtent = [extent[0][0], extent[1][0]], yExtent = [extent[0][1], extent[1][1]],
                                plotMeasures = [null, null], xMeasure = null, yMeasure = null,
                                sqlFilters = [null, null, null, null], yMin, yMax, xMin, xMax;

                        var transformVal = function(val, type, isMin, domain) {
                            if (type === 'INTEGER') {
                                return isMin ? Math.floor(val) : Math.ceil(val);
                            } else if (type === "DOUBLE"){
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

                        if (measures.length > 1) {
                            xMeasure = {measure: measures[0]};
                            xMeasure.measure.colName = config.xaxis.colName;
                            yMeasure = {measure: measures[1]};

                        } else {
                            yMeasure = {measure: measures[0]};
                        }
                        yMeasure.measure.colName = config.yaxis.colName;

                        plotMeasures = [xMeasure, yMeasure];

                        if (xMeasure && xExtent[0] !== null && xExtent[1] !== null) {
                            xMin = transformVal(xExtent[0], xMeasure.measure.type, true, plot.scales.x.scale.domain());
                            xMax = transformVal(xExtent[1], xMeasure.measure.type, false, plot.scales.x.scale.domain());

                            sqlFilters[0] = new LABKEY.Query.Filter.Gte(xMeasure.measure.colName, xMin);
                            sqlFilters[1] = new LABKEY.Query.Filter.Lte(xMeasure.measure.colName, xMax);
                        }

                        if (yMeasure && yExtent[0] !== null && yExtent[1] !== null) {
                            yMin = transformVal(yExtent[0], yMeasure.measure.type, true, plot.scales.yLeft.scale.domain());
                            yMax = transformVal(yExtent[1], yMeasure.measure.type, false, plot.scales.yLeft.scale.domain());

                            sqlFilters[2] = new LABKEY.Query.Filter.Gte(yMeasure.measure.colName, yMin);
                            sqlFilters[3] = new LABKEY.Query.Filter.Lte(yMeasure.measure.colName, yMax);
                        }

                        Connector.model.Filter.sqlToMdx({
                            schemaName: config.schemaName,
                            queryName: config.queryName,
                            subjectColumn: config.subjectColumn,
                            measures: plotMeasures,
                            sqlFilters: sqlFilters,
                            success: function(filterConfig){
                                stateManager.addSelection([filterConfig], true, false, true);
                            },
                            scope: this
                        });
                    },
                    brushclear : function() {
                        layerScope.isBrushed = false;
                        stateManager.clearSelections();
                    }
                };
            }
        }

        this.plot = new LABKEY.vis.Plot(plotConfig);
        layerScope.plot = this.plot; // hoisted for mouseover/mouseout event listeners
        var measures = this.measures; // hoisted for brushend.
        var stateManager = this.state; // hoisted for brushend and brushclear.

        if (this.plot) {
            this.plot.addLayer(layer);
            try {
                this.noplotmsg.hide();
                this.plot.render();
            }
            catch(err) {
                this.showMessage(err.message);
                this.hideLoad();
                this.plot = null;
                this.plotEl.update('');
                this.noPlot();
                console.error(err);
                console.error(err.stack);
                return;
            }
        }
        this.hideLoad();
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

            Ext.apply(scale, {
                trans : axisValue,
                domain: [axisValue == 'log' ? 1 : null, null] // allow negative values in linear plots
            });
        }

        return scale;
    },

    getActiveMeasures : function() {
        this.fromFilter = false;
        var measures = {
            x: null,
            y: null
        };

        // first check the measure selections
        if (this.axisPanelX) {
            var sel = this.axisPanelX.getSelection();
            if (sel && sel.length > 0) {
                measures.x = sel[0].data;
            }
        }
        if (this.axisPanelY) {
            var sel = this.axisPanelY.getSelection();
            if (sel && sel.length > 0) {
                measures.y = sel[0].data;
            }
        }

        // second, check the set of active filters
        if (!measures.x && !measures.y) {
            var filters = this.state.getFilters();
            for (var f=0; f < filters.length; f++) {
                if (filters[f].get('isPlot') == true) {
                    var m = filters[f].get('plotMeasures');

                    if (m.length > 1) {
                        measures.x = m[0].measure;
                        measures.y = m[1].measure;
                    } else {
                        measures.x = null;
                        measures.y = m[0].measure;
                    }

                    this.fromFilter = true;
                    break;
                }
            }
        }

        return measures;
    },

    onShowGraph : function() {

        this.hideMessage();
        this.refreshRequired = false;

        var activeMeasures = this.getActiveMeasures();

        this.fireEvent('axisselect', this, 'y', [ activeMeasures.y ]);
        this.fireEvent('axisselect', this, 'x', [ activeMeasures.x ]);

        if (this.filterClear) {
            if (this.axisPanelY) {
                this.axisPanelY.clearSelection();
                Ext.getCmp('yaxisselector').clearModel();
            }

            if (this.axisPanelX) {
                this.axisPanelX.clearSelection();
                Ext.getCmp('xaxisselector').clearModel();
            }
        }

        if (this.filterClear || !activeMeasures.y) {
            this.filterClear = false;
            this.noPlot();
            return;
        }

        this.measures = [ activeMeasures.x, activeMeasures.y ];

        this.showLoad();

        var sorts = this.getSorts();

        var wrappedMeasures = [];

        if (this.measures[0]) {
            wrappedMeasures.push({measure : this.measures[0], time: 'visit'});
        }

        if (this.measures[1]) {
            wrappedMeasures.push({measure : this.measures[1], time: 'visit'});
        }

        if (!this.fromFilter) {
            this.updatePlotBasedFilter(wrappedMeasures);
        }
        else {
            this.initialized = true;
        }

        // Request Participant List
        this.getParticipantIn(function(ptidList) {

            if (ptidList)
            {
                this.applyFiltersToSorts(sorts, ptidList);
            }

            // Request Chart Data
            Ext.Ajax.request({
                url: LABKEY.ActionURL.buildURL('visualization', 'getData.api'),
                method: 'POST',
                jsonData: {
                    measures: wrappedMeasures,
                    sorts: sorts,
                    limit: (this.rowlimit+1)
                },
                success: this.onChartDataSuccess,
                failure: this.onFailure,
                scope: this
            });

            this.requestCitations();
        });
    },

    showLoad : function() {
        if (!this.isActiveView) {
            return;
        }
        var plotEl = this.getPlotElement();
        if (plotEl) {
            var box = Ext.get(plotEl).getBox();
            this.loader.setLeft(box.x+10);
            this.loader.setTop(box.y+10);
            if (this.isActiveView) {
                this.loader.setStyle('visibility', 'visible');
            }
        }
    },

    hideLoad : function() {
        this.loader.setStyle('visibility', 'hidden');
    },

    requestCitations : function() {
        var measures = this.getActiveMeasures();
        var x = measures.x, y = measures.y;
        var xy = [];

        if (x) {
            xy.push({
                s : x.schemaName,
                q : x.queryName
            });
        }

        if (y) {
            xy.push({
                s : y.schemaName,
                q : y.queryName
            });
        }

        this.srcs = [];
        var me = this;
        for (var i=0; i < xy.length; i++) {
            LABKEY.Query.getQueryDetails({
                schemaName : xy[i].s,
                queryName  : xy[i].q,
                success    : function(d) {
                    for (var c=0; c < d.columns.length; c++) {
                        if (d.columns[c].name.toLowerCase() == 'source') {
                            var src = d.columns[c];
                            Ext.apply(src, {
                                isSourceURI : true,
                                schemaName  : d.schemaName,
                                queryName   : d.queryName || d.name,
                                alias       : src.fieldKeyPath
                            });
                            me.srcs.push(src);
                        }
                    }
//                    if (me.srcs.length == 0) {
//                        me.getSrcButton().hide();
//                    }
//                    else {
//                        me.getSrcButton().show();
//                    }
                }
            });
        }
    },

    onChartDataSuccess : function(response) {

        if (!this.isActiveView) {
//            this.priorResponse = response;
            return;
        }

        // preprocess decoded data shape
        var config = this._preprocessData(Ext.decode(response.responseText));

        // call render
        this.initPlot(config, false);
    },

    updatePlotBasedFilter : function(measures) {
        // Request Distinct Participants
        Ext.Ajax.request({
            url: LABKEY.ActionURL.buildURL('visualization', 'getData.api'),
            method: 'POST',
            jsonData: {
                measures: measures,
                sorts: this.getSorts(),
                limit: (this.rowlimit+1)
            },
            success: function(response) {
                this.onFilterDataSuccess(Ext.decode(response.responseText), measures);
            },
            failure: this.onFailure,
            scope: this
        });
    },

    onFilterDataSuccess : function(r, measures) {
        LABKEY.Query.selectDistinctRows({
            schemaName: r.schemaName,
            queryName: r.queryName,
            column: r.measureToColumn[Connector.studyContext.subjectColumn],
            success: function(data) {

                var filter = {
                    hierarchy: 'Subject',
                    isPlot: true,
                    plotMeasures: measures,
                    plotScales: [this.getScale('x'), this.getScale('y')],
                    members: []
                };

                for (var i=0; i < data.values.length; i++) {
                    filter.members.push({
                        uniqueName: Connector.model.Filter.getSubjectUniqueName(data.values[i])
                    });
                }

                this.plotLock = true;
                var filters = this.state.getFilters(), found = false;
                for (var f=0; f < filters.length; f++) {
                    if (filters[f].get('isPlot') == true) {
                        found = true;
                        filters[f].set('plotMeasures', measures);
                        this.state.updateFilterMembers(filters[f].get('id'), filter.members, false);
                        break;
                    }
                }
                if (!found) {
                    this.state.prependFilter(filter);
                }
                this.plotLock = false;
            },
            scope: this
        });
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
        this.hideLoad();
        this.showMessage('Failed to Load');
    },

    isValidNumber: function(number){
        return !(number === undefined || isNaN(number) || number === null);
    },

    isValidValue: function(measure, value) {
        if (measure.type === 'INTEGER' || measure.type === 'DOUBLE') {
            return this.isValidNumber(value);
        } else {
            return !(value === undefined || value === null);
        }
    },

    _getValue : function(measure, colName, row) {
        var val;

        if (measure.type === 'INTEGER') {
            val = parseInt(row[colName].value);
            return this.isValidNumber(val) ? val : null;
        } else if (measure.type === 'DOUBLE') {
            val = parseFloat(row[colName].value);
            return this.isValidNumber(val) ? val : null;
        } else if (measure.type === 'TIMESTAMP') {
            val = row[colName].value;
            return val !== undefined && val !== null ? new Date(val) : null;
        } else {
            // Assume categorical.
            val = row[colName].displayValue ? row[colName].displayValue : row[colName].value;
            return (val !== undefined) ? val : null;
        }
    },

    _preprocessData : function(data) {
        var x = this.measures[0], y = this.measures[1], xa = null, ya = null, _xid, _yid;

        // TODO: In the future we will have data from multiple studies, meaning we might have more than one valid
        // subject columName value. We'll need to make sure that when we get to that point we have some way to coalesce
        // that information into one value for the SubjectId (i.e. MouseId, ParticipantId get renamed to SubjectId).

        var subjectNoun = 'SubjectID'; // TODO: this is hard-coded because the measureToColumn object is returning a
                                       // different value for the subjectNoun than the moduleContext. This is an issue
                                       // with multi-study getDataAPI calls.
        var subjectCol = data.measureToColumn[subjectNoun];

        if (x) {
            _xid = data.measureToColumn[x.alias] || data.measureToColumn[x.name];
            xa = {
                schema : x.schemaName,
                query  : x.queryName,
                name   : x.name,
                alias  : x.alias,
                colName: _xid, // Stash colName so we can query the getData temp table in the brushend handler.
                label  : x.label,
                type   : x.type,
                isNumeric : x.type === 'INTEGER' || x.type === 'DOUBLE',
                isContinuous: x.type === 'INTEGER' || x.type === 'DOUBLE' || x.type === 'TIMESTAMP'
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

        _yid = data.measureToColumn[y.alias] || data.measureToColumn[y.name];
        ya = {
            schema : y.schemaName,
            query  : y.queryName,
            name   : y.name,
            alias  : y.alias,
            colName: _yid, // Stash colName so we can query the getData temp table in the brushend handler.
            label  : y.label,
            type   : y.type,
            isNumeric : y.type === 'INTEGER' || y.type === 'DOUBLE',
            isContinuous: y.type === 'INTEGER' || y.type === 'DOUBLE' || y.type === 'TIMESTAMP'
        };

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

        var xVal, yVal, xIsNum, yIsNum, negX = false, negY = false;
        for (r = 0; r < len; r++) {
            if (x) {
                xVal = this._getValue(x, _xid, rows[r]);
            } else {
                xVal = "";
            }
            yVal = this._getValue(y, _yid, rows[r]);

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
                    subjectId: rows[r][subjectCol],
                    xname : xa ? xa.label : '',
                    yname : ya.label
                });
            }

            if ((!x || this.isValidValue(x, xVal)) && this.isValidValue(y, yVal)) {
                validCount ++;
            }
        }

        this.percentOverlap = validCount / len;

        if(this.percentOverlap < 1){
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

        return {
            schemaName: data.schemaName,
            queryName: data.queryName,
            // We need the subject column as it appears in the temp query for the brushend handler.
            subjectColumn: subjectCol,
            xaxis: xa,
            yaxis: ya,
            rows : map,
            setXLinear : negX,
            setYLinear : negY
        };
    },

    updateMeasureSelection : function(win) {
        if (win) {
            var pos = this.getPlotPosition();
            win.setSize(pos.width, pos.height);
            win.setPosition(pos.leftEdge, pos.topEdge, false);
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

    showYMeasureSelection : function(targetEl) {

        if (!this.ywin) {

            var sCls = 'yaxissource';

            this.axisPanelY = Ext.create('Connector.panel.AxisSelector', {
                flex: 1,
                title: 'Y Axis',
                bodyStyle: 'padding: 15px 27px 0 27px;',
                open : function() {},
                measureConfig: {
                    allColumns: this.allColumns,
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
                scalename: 'yscale'
            });

            var pos = this.getPlotPosition();

            this.ywin = Ext.create('Ext.window.Window', {
                id: 'plotymeasurewin',
                ui: 'axiswindow',
                cls: 'axiswindow',
                animateTarget: targetEl,
                sourceCls: sCls,
                axisPanel: this.axisPanelY,
                modal: true,
                draggable: false,
                header: false,
                closeAction: 'hide',
                resizable: false,
                minHeight: 500,
                height: pos.height + 100,
                width: pos.width,
                x: pos.leftEdge,
                y: pos.topEdge - 50,
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
                            var yselect = this.axisPanelY.getSelection();
                            if (this.axisPanelY.hasSelection()) {
                                this.initialized = true;
                                this.showTask.delay(300);
                                this.ywin.hide(null, function() {
                                    this.fireEvent('axisselect', this, 'y', yselect);
                                }, this);
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
                            this.ywin.hide();
                        },
                        scope : this
                    }]
                }],
                scope : this
            });
        }
        else {
            this.updateMeasureSelection(this.ywin);
        }

        if (this.axisPanelY.hasSelection()) {
            this.activeYSelection = this.axisPanelY.getSelection()[0];
        }
        this.ywin.show(null, function() {
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
                visitTagStore: this.visitTagStore
            });

            var pos = this.getPlotPosition();

            this.xwin = Ext.create('Ext.window.Window', {
                id        : 'plotxmeasurewin',
                cls       : 'axiswindow',
                animateTarget : targetEl,
                sourceCls : sCls,
                axisPanel : this.axisPanelX,
                modal     : true,
                draggable : false,
                header : false,
                closeAction: 'hide',
                resizable : false,
                minHeight : 450,
                height: pos.height + 100,
                width: pos.width,
                x: pos.leftEdge,
                y: pos.topEdge - 50,
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
                    items : ['->',{
                        text  : 'set x axis',
                        ui    : 'rounded-inverted-accent',
                        handler : function() {
                            var xselect = this.axisPanelX.getSelection();
                            if (this.axisPanelY && this.axisPanelY.hasSelection() && this.axisPanelX.hasSelection()) {
                                this.initialized = true;
                                this.showTask.delay(300);
                                this.xwin.hide(null, function() {
                                    this.fireEvent('axisselect', this, 'x', xselect);
                                }, this);
                            }
                            else if (this.axisPanelX.hasSelection()) {
                                this.xwin.hide(null, function() {
                                    this.showYMeasureSelection(Ext.getCmp('yaxisselector').getEl());
                                    this.fireEvent('axisselect', this, 'x', xselect);
                                }, this);
                            }
                        },
                        scope: this
                    },{
                        text  : 'cancel',
                        ui    : 'rounded-inverted-accent',
                        handler : function() {
                            if (this.activeXSelection) {
                                this.axisPanelX.setSelection(this.activeXSelection);
                                this.activeXSelection = undefined;
                            }
                            this.xwin.hide();
                        },
                        scope : this
                    }]
                }],
                scope : this
            });
        }
        else {
            this.updateMeasureSelection(this.xwin);
        }

        if (this.axisPanelX.hasSelection()) {
            this.activeXSelection = this.axisPanelX.getSelection()[0];
        }
        this.xwin.show(null, function() {
            this.runUniqueQuery(this.axisPanelX);
        }, this);
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
        }
        else {
            this.hideLoad();

            if (this.msg) {
                this.msg.hide();
            }

            if (this.win) {
                this.win.hide();
            }
        }
    },

    getParticipantIn : function(callback, scope) {
        var me = this;

        this.state.onMDXReady(function(mdx){

            if (mdx.hasFilter('statefilter')) {
                mdx.queryParticipantList({
                    useNamedFilters : ['statefilter'],
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
        var firstMeasure = this.measures[0];

        // if we can help it, the sort should use the first non-demographic measure
        for (var i=0; i < this.measures.length; i++) {
            var item = this.measures[i];
            if (item && !item.isDemographic) {
                firstMeasure = item;
                break;
            }
        }

        if (firstMeasure) {
            return [
                {
                    name: Connector.studyContext.subjectColumn,
                    queryName: firstMeasure.queryName,
                    schemaName: firstMeasure.schemaName
                },{
                    name: Connector.studyContext.subjectVisitColumn + '/VisitDate',
                    queryName: firstMeasure.queryName,
                    schemaName: firstMeasure.schemaName
                }
            ];
        } else {
            return [];
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
    }
});
