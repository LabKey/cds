/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.view.Scatter', {

    extend : 'Ext.Panel',

    requires : ['Connector.panel.AxisSelector'],

    alias  : 'widget.plot',

    cls : 'scatterview',

    measures : [],
    subjectColumn      : 'ParticipantId',
    subjectVisitColumn : 'ParticipantVisit',

    isActiveView    : true,
    refreshRequired : true,
    initialized     : false,
    showAxisButtons : true,

    plotHeightOffset : 48, // value in 'px' that the plot svg is offset for container region
    rowlimit         : 5000,

    constructor : function(config) {

        Ext4.applyIf(config, {
            allColumns : false,
            canShowHidden : false
        });

        this.callParent([config]);
    },

    initComponent : function() {

        this.items = [
            this.getPlotRegion()
        ];

        this.callParent();

        this.attachInternalListeners();
    },

    attachInternalListeners : function() {

        this.resizeTask = new Ext4.util.DelayedTask(this.handleResize, this);

        this.on('resize', function() {
            this.resizeTask.delay(150);
        }, this);
    },

    getPlotRegion : function() {

        if (this.plotRegion) {
            return this.plotRegion;
        }

        Ext4.create('Ext.Component', {
            id : 'scatterloader',
            renderTo : Ext4.getBody(),
            autoEl : {
                tag    : 'img',
                src    : LABKEY.contextPath + '/cds/lib/ext-4.0.7/resources/themes/images/default/grid/loading.gif',
                alt    : 'loading',
                height : 25,
                width  : 25
            }
        });

        this.plotDisplay = Ext4.create('Ext.Component', {
            autoEl: {
                tag : 'div',
                cls : 'emptyplot plot'
            },
            listeners : {
                afterrender : function(c){
                    this.plotid = Ext4.get(Ext4.DomQuery.select('.emptyplot')[0]).id;
                    this.plotready = true;
                },
                scope : this
            },
            scope : this
        });

        this.yAxisButton = Ext4.create('Connector.button.DropDownButton', {
            cls   : 'yaxisbutton',
            text  : '&#9658;', // right-arrow
            hidden : this.showAxisButtons,
            handler : function(b) {
                this.showYMeasureSelection(b.getEl());
            },
            scope : this
        });

        this.xAxisButton = Ext4.create('Connector.button.DropDownButton', {
            cls   : 'xaxisbutton',
            text  : '&#9650;', // up-arrow
            hidden : this.showAxisButtons,
            handler : function(b) {
                this.showXMeasureSelection(b.getEl());
            },
            scope : this
        });

        this.srcButton = Ext4.create('Connector.button.RoundedButton', {
            id : 'plotsources',
            text : 'Sources',
            ui : 'rounded-accent',
            hidden : true,
            handler : function() {
                if (this.srcs && this.srcs.length > 0)
                    this.fireEvent('sourcerequest', this.srcs, this.srcs[0]);
            },
            scope : this
        });

        this.plotRegion = Ext4.create('Ext.Panel', {
            ui       : 'custom',
            cls      : 'plotregion',
            defaults : {
                bodyCls : 'stdcolor',
                ui      : 'custom'
            },
            items : [this.yAxisButton,this.plotDisplay,this.xAxisButton,this.srcButton]
        });

        return this.plotRegion;
    },

    handleResize : function() {

        if (!this.isActiveView) {
            return;
        }

        var viewbox    = this.getBox(),
            plotRegion = this.getPlotRegion();

        plotRegion.setSize(viewbox.width, viewbox.height);

        if (this.plot) {
            var plotbox = plotRegion.getBox();
            var dim = Math.round(((plotbox.width-90) > plotbox.height ? plotbox.height : (plotbox.width-90)));
            this.plot.setHeight((dim-this.plotHeightOffset), false);
            this.plot.setWidth(dim);

            if (this.yAxisButton) {
                var query = Ext4.DomQuery.select('rect');
                if (query && query.length > 0) {
                    var el = Ext4.get(query[0]);
                    var x = Math.floor(el.getBox().x-95);
                    var y = Math.floor(el.dom.height.animVal.value/2)+50; // height not set correctly via Ext
                    this.yAxisButton.setPosition(x,y);
                    if (this.showAxisButtons) {
                        this.yAxisButton.show();
                        this.xAxisButton.show();
                        this.showAxisButtons = false;
                    }
                }
            }
        }

        if (!this.initialized && !this.showNoPlot) {
            this.showNoPlot = true;
            this.noPlot();
        }

        if (this.msg) {
            this.msg.getEl().setLeft(Math.floor(viewbox.width/2 - Math.floor(this.getEl().getTextWidth(this.msg.msg)/2)));
        }

        if (this.ywin && this.ywin.isVisible()) {
            this.resizeMeasureSelection(this.ywin, this.axisPanelY, false, true, false);
        }

        if (this.xwin && this.xwin.isVisible()) {
            this.resizeMeasureSelection(this.xwin, this.axisPanelX, true, false, false);
        }
    },

    initPlot : function(w, h, config, noplot) {

        var rows = config.rows;

        if (!rows || !rows.length) {
            this.showMessage('No information available to plot.');
            this.hideLoad();
            this.plot = null;
            Ext4.get(this.plotid).update('');
            this.noPlot();
            return;
        }
        else if (rows.length < this.rowlimit && !noplot && (this.percentOverlap && this.percentOverlap == 1)) {
            this.hideMessage();
        }

        if (this.plot) {
            this.plot.clearGrid();
            Ext4.get(this.plotid).update('');
            this.plot = null;
        }

        var pointLayer = new LABKEY.vis.Layer({
            geom: new LABKEY.vis.Geom.Point({
                size: 3,
                plotNullPoints: !noplot,
                opacity: 0.5
            }),
            aes: {
                yLeft: function(row){return row.y},
                hoverText : function(row) {
                    return '' + row.xname + ': ' + row.x + ', ' + row.yname + ': ' + row.y;
                }
            }
        });

        // maintain ratio 1:1
        var aspect = Math.round((w > h ? h : w));
        if (aspect < 0) {
            aspect = Math.floor(this.getHeight()*.95);
        }

        var tickFormat = function(val) {

            if (noplot) {
                return '';
            }

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

        var scales = {};
        if (noplot) {
            scales.x = scales.yLeft = {
                scaleType: 'discrete',
                domain: ['10', '20', '30', '40', '50', '60', '70', '80', '90']
            };
        }
        else {
            scales.x = {
                scaleType: 'continuous'
            };
            scales.yLeft = {
                scaleType: 'continuous'
            };
        }

        scales.x.tickFormat     = tickFormat;
        scales.yLeft.tickFormat = tickFormat;

        var labelX = (config.xaxis) ? config.xaxis.query + ': ' : '',
            labelY = (config.yaxis) ? config.yaxis.query + ': ' : '';

        var plotConfig = {
            renderTo  : this.plotid,
            throwErrors : true,
            labels    : {
                x      : {value: labelX + rows[0].xname.replace(/_/g, ' ')},
                yLeft  : {value: labelY + rows[0].yname.replace(/_/g, ' ')}
            },
            width     : aspect,
            height    : aspect,
            data      : rows,
            legendPos : 'none',
            aes: {
                x: function(row){return row.x;}
            },
            bgColor   : '#F0F0F0', // see $light-color in connector.scss
            gridColor : '#FFFFFF',
            gridLineColor : '#FFFFFF',
            scales: scales
        };

        if (!noplot) {
            this.setScale(plotConfig.scales.x, 'x', config);
            this.setScale(plotConfig.scales.yLeft, 'y', config);
        }

        this.plot = new LABKEY.vis.Plot(plotConfig);
        if (this.plot) {
            this.plot.addLayer(pointLayer);
            try
            {
                this.plot.render();
            }
            catch(err) {
                this.showMessage(err.message);
                this.hideLoad();
                this.plot = null;
                Ext4.get(this.plotid).update('');
                this.noPlot();
                return;
            }
        }
        this.hideLoad();
    },

    setScale : function(scale, axis, config) {
        var axisValue = (axis == 'y') ? this.axisPanelY.getScale() : this.axisPanelX.getScale(),
            allowLog = (axis == 'y') ? !config.setYLinear : !config.setXLinear;

        if (!allowLog && axisValue == 'log') {
            this.showMessage('Displaying the ' + axis.toLowerCase() + '-axis on a linear scale due to the presence of invalid log values.');
            axisValue = 'linear';
        }

        Ext4.apply(scale, {
            trans : axisValue,
            min   : axisValue == 'log' ? 1 : undefined // allow negative values in linear plots
        });

        return scale;
    },

    onShowGraph : function() {

        this.hideMessage();
        this.refreshRequired = false;

        var xrec = this.axisPanelX ? this.axisPanelX.getSelection() : [];
        var yrec = this.axisPanelY ? this.axisPanelY.getSelection() : [];

        if (xrec.length == 0 || yrec.length == 0) {
            return;
        }

        var allMeasures = [], wrappedMeasures = [];

        allMeasures.push(xrec[0].data);
        allMeasures.push(yrec[0].data);

        wrappedMeasures.push({measure : xrec[0].data, time: 'visit'});
        wrappedMeasures.push({measure : yrec[0].data, time: 'visit'});

        this.measures = allMeasures;

        this.showLoad();

        if (allMeasures.length > 0)
        {
            var sorts = this.getSorts();

            // Request Participant List
            this.getParticipantIn(function(ptidList) {

                if (ptidList)
                {
                    this.applyFiltersToSorts(sorts, ptidList);
                }

                // Request Chart Data
                Ext4.Ajax.request({
                    url     : LABKEY.ActionURL.buildURL('visualization', 'getData.api'),
                    method  : 'POST',
                    jsonData: {
                        measures : wrappedMeasures,
                        sorts    : sorts,
                        limit    : (this.rowlimit+1)
                    },
                    success : this.onChartDataSuccess,
                    failure : this.onFailure,
                    scope   : this
                });

                this.requestCitations();
            });
        }
    },

    showLoad : function() {
        if (!this.isActiveView) {
            return;
        }
        var query = Ext4.DomQuery.select('rect');
        if (query && query.length > 1) {
            var box   = Ext4.get(Ext4.DomQuery.select('rect')[1]).getBox();
            var sload = Ext4.get('scatterloader');
            sload.setLeft(box.x+10);
            sload.setTop(box.y+10);
            if (this.isActiveView) {
                sload.setStyle('visibility', 'visible');
            }
        }
    },

    hideLoad : function() {
        Ext4.get('scatterloader').setStyle('visibility', 'hidden');
    },

    requestCitations : function() {
        var x = this.axisPanelX.getSelection()[0],
            y = this.axisPanelY.getSelection()[0];

        var xy = [{
            s : x.data.schemaName,
            q : x.data.queryName
        },{
            s : y.data.schemaName,
            q : y.data.queryName
        }];

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
                            Ext4.apply(src, {
                                isSourceURI : true,
                                schemaName  : d.schemaName,
                                queryName   : d.queryName || d.name,
                                alias       : src.fieldKeyPath //LABKEY.MeasureUtil.getAlias(src, true)
                            });
                            me.srcs.push(src);
                        }
                    }
                    if (me.srcs.length == 0) {
                        me.srcButton.hide();
                    }
                    else {
                        me.srcButton.show();
                    }
                }
            });
        }
    },

    onChartDataSuccess : function(response) {

        if (!this.isActiveView) {
            this.priorResponse = response;
            return;
        }

        // preprocess decoded data shape
        var config = this._preprocessData(Ext4.decode(response.responseText));

        // call for sizing and render
        var size = Ext4.get(this.plotid).getSize();
        this.initPlot(size.width, size.height, config, false);
    },

    noPlot : function() {

        var _h = this.plotHeightOffset,
            size = Ext4.get(this.plotid).getSize(),
            map = [{
                x : null,
                xname : 'X-Axis',
                y : null,
                yname : 'Y-Axis'
            }];

        this.initPlot((size.width), (size.height-_h), {rows:map}, true);
        this.resizeTask.delay(300);
    },

    onFailure : function(response) {
        this.hideLoad();
        this.showMessage('Failed to Load');
    },

    isValidNumber: function(number){
        return !(number === undefined || isNaN(number) || number === null);
    },

    _preprocessData : function(data) {

        var x = this.measures[0], y = this.measures[1];

        var xa = {
            schema : x.schemaName,
            query  : x.queryName,
            name   : x.name,
            alias  : x.alias,
            label  : x.label
        };

        var ya = {
            schema : y.schemaName,
            query  : y.queryName,
            name   : y.name,
            alias  : y.alias,
            label  : y.label
        };

        var map = [], r,
            _xid = data.measureToColumn[xa.alias] || data.measureToColumn[xa.name],
            _yid = data.measureToColumn[ya.alias] || data.measureToColumn[ya.name],
            rows = data.rows,
            len = rows.length,
            validCount = 0;

        if (len > this.rowlimit) {
            len = this.rowlimit;
            this.showMessage('Plotting first ' + Ext4.util.Format.number(this.rowlimit, '0,000') + ' points.');
        }
        else if (this.msg) {
            this.msg.hide();
        }

        var xnum, ynum, negX = false, negY = false;
        for (r = 0; r < len; r++) {
            if (rows[r][_xid] && rows[r][_yid]) {
                x = parseFloat(rows[r][_xid].value, 10);
                y = parseFloat(rows[r][_yid].value, 10);

                // allow any pair that does not contain a negative value.
                // NaN, null, and undefined are non-negative values.

                // validate x
                xnum = !(Ext4.isNumber(x) && x < 1);
                if (!negX && !xnum) {
                    negX = true;
                }

                // validate y
                ynum = !(Ext4.isNumber(y) && y < 1);
                if (!negY && !ynum) {
                    negY = true;
                }

                map.push({
                    x : x,
                    y : y,
                    xname : xa.label,
                    yname : ya.label
                });

                if (this.isValidNumber(x) && this.isValidNumber(y)) {
                    validCount ++;
                }
            }
        }

        this.percentOverlap = validCount / len;

        if(this.percentOverlap < 1){
            var id = Ext4.id();
            var msg = 'Points outside the plotting area have no match on the other axis.';
            msg += '&nbsp;<a id="' + id +'">Details</a>';
            this.showMessage(msg, true);

            var tpl = new Ext4.XTemplate(
                '<div class="matchtip">',
                    '<div>',
                        '<p class="tiptitle">Plotting Matches</p>',
                        '<p class="tiptext">Percent match: {overlap}%. Mismatches may be due to data point subject, visit, or assay antigen.</p>',
                    '</div>',
                '</div>'
            );

            var el = Ext4.get(id);
            if (el) {
                Ext4.create('Ext.tip.ToolTip', {
                    target : el,
                    anchor : 'left',
                    data : {
                        overlap : Ext4.util.Format.round(this.percentOverlap * 100, 2)
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
        }

        return {
            xaxis: xa,
            yaxis: ya,
            rows : map,
            setXLinear : negX,
            setYLinear : negY
        };
    },

    resizeMeasureSelection : function(win, axisPanel, setX, setY, doShow) {
        var query = Ext4.DomQuery.select('rect'), box;
        var canvas = Ext4.get(query[0]);

        if (canvas) {
            box = canvas.getBox();

            win.getEl().setLeft(box.x+1);
            win.getEl().setTop(box.y);

            var h = parseInt(canvas.dom.attributes.height.value),
                    w = parseInt(canvas.dom.attributes.width.value);

            // set a minium height, width
            var hh = (h < 450 ? 450 : h);
            var ww = (w > 600 ? w : 600);

            if (axisPanel.hasSelection()) {
                if (setX) {
                    this.activeXSelection = this.axisPanelX.getSelection()[0];
                }
                else if (setY) {
                    this.activeYSelection = this.axisPanelY.getSelection()[0];
                }
            }

            if (doShow) {
                win.show(undefined, function() {
                    win.setSize(ww, hh);
                    this.runUniqueQuery(false, win.axisPanel, win.sourceCls);
                }, this);
                return;
            }

            win.setSize(ww, hh);
        }
    },

    showYMeasureSelection : function(targetEl) {

        var query = Ext4.DomQuery.select('rect');
        var canvas = Ext4.get(query[0]);
        var box = canvas.getBox();

        if (!this.ywin) {

            var sCls = 'yaxissource';

            this.axisPanelY = Ext4.create('Connector.panel.AxisSelector', {
                flex      : 1,
                ui        : 'axispanel',
                title     : 'Y Axis',
                bodyStyle : 'padding-left: 27px; padding-top: 15px;',
                open      : function() {},
                measureConfig : {
                    allColumns : this.allColumns,
                    filter     : LABKEY.Query.Visualization.Filter.create({schemaName: 'study', queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS}),
                    showHidden : this.canShowHidden,
                    cls        : 'yaxispicker',
                    sourceCls  : sCls,
                    multiSelect: false
                },
                displayConfig : {
                    defaultHeader : 'Choose Y Axis'
                },
                scalename : 'yscale'
            });

            var w = parseInt(canvas.dom.attributes.width.value);

            this.ywin = Ext4.create('Ext.window.Window', {
                id        : 'plotymeasurewin',
                cls       : 'axiswindow',
                animateTarget : targetEl,
                sourceCls : sCls,
                axisPanel : this.axisPanelY,
                modal     : true,
                draggable : false,
                resizable : false,
                minHeight : 450,
                height    : query.length > 1 ? parseInt(canvas.dom.attributes.height.value) : 450,
                width     : query.length > 1 ? (w > 600 ? w : 600) : 600,
                x         : box ? (box.x+1) : null,
                y         : box ? (box.y) : null,
                layout : {
                    type : 'vbox',
                    align: 'stretch'
                },
                items   : [this.axisPanelY],
                buttons : [{
                    text  : 'Set Y-Axis',
                    ui    : 'rounded-inverted-accent',
                    handler : function() {
                        if (this.axisPanelX && this.axisPanelX.hasSelection() && this.axisPanelY.hasSelection()) {
                            this.initialized = true;
                            this.onShowGraph();
                            this.ywin.hide();
                        }
                        else if (this.axisPanelY.hasSelection()) {
                            this.ywin.hide(null, function(){
                                this.showXMeasureSelection(this.xAxisButton.getEl());
                            }, this);
                        }
                    },
                    scope: this
                },{
                    text  : 'cancel',
                    ui    : 'rounded-inverted-accent',
                    handler : function() {
                        if (this.activeYSelection) {
                            this.axisPanelY.setSelection(this.activeYSelection);
                            this.activeYSelection = undefined;
                        }
                        this.ywin.hide();
                    },
                    scope : this
                }],
                scope : this
            });

        }
        else if (box) {
            this.resizeMeasureSelection(this.ywin, this.axisPanelY, false, true, true);
            return;
        }

        if (this.axisPanelY.hasSelection()) {
            this.activeYSelection = this.axisPanelY.getSelection()[0];
        }
        this.ywin.show(null, function() {
            this.runUniqueQuery(false, this.axisPanelY, 'yaxissource');
        }, this);
    },

    showXMeasureSelection : function(targetEl) {

        var query = Ext4.DomQuery.select('rect'), box;
        var canvas = Ext4.get(query[0]);
        box = canvas.getBox();

        if (!this.xwin) {

            var sCls = 'xaxissource';

            this.axisPanelX = Ext4.create('Connector.panel.AxisSelector', {
                flex      : 1,
                ui        : 'axispanel',
                title     : 'X Axis',
                bodyStyle : 'padding-left: 27px; padding-top: 15px;',
                measureConfig : {
                    allColumns : this.allColumns,
                    filter     : LABKEY.Query.Visualization.Filter.create({schemaName: 'study', queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS}),
                    showHidden : this.canShowHidden,
                    cls        : 'xaxispicker',
                    sourceCls  : sCls,
                    multiSelect: false
                },
                displayConfig : {
                    defaultHeader : 'Choose X Axis'
                },
                scalename : 'xscale'
            });

            var w = parseInt(canvas.dom.attributes.width.value);

            this.xwin = Ext4.create('Ext.window.Window', {
                id        : 'plotxmeasurewin',
                cls       : 'axiswindow',
                animateTarget : targetEl,
                sourceCls : sCls,
                axisPanel : this.axisPanelX,
                modal     : true,
                draggable : false,
                resizable : false,
                minHeight : 450,
                height    : query.length > 1 ? parseInt(canvas.dom.attributes.height.value) : 450,
                width     : query.length > 1 ? (w > 600 ? w : 600) : 600,
                layout : {
                    type : 'vbox',
                    align: 'stretch'
                },
                items   : [this.axisPanelX],
                x         : box ? (box.x+1) : null,
                y         : box ? (box.y) : null,
                buttons : [{
                    text  : 'Set X-Axis',
                    ui    : 'rounded-inverted-accent',
                    handler : function() {
                        if (this.axisPanelY && this.axisPanelY.hasSelection() && this.axisPanelX.hasSelection()) {
                            this.initialized = true;
                            this.onShowGraph();
                            this.xwin.hide();
                        }
                        else if (this.axisPanelX.hasSelection()) {
                            this.xwin.hide(null, function(){
                                this.showYMeasureSelection(this.yAxisButton.getEl());
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
                }],
                scope : this
            });

        }
        else if (box) {
            this.resizeMeasureSelection(this.xwin, this.axisPanelX, true, false, true);
            return;
        }

        if (this.axisPanelX.hasSelection()) {
            this.activeXSelection = this.axisPanelX.getSelection()[0];
        }
        this.xwin.show(null, function() {
            this.runUniqueQuery(false, this.axisPanelX, 'xaxissource');
        }, this);
    },

    runUniqueQuery : function(force, target, cls) {
        var store = target.getMeasurePicker().sourcesStore;

        if (force) {
            if (store.getCount() > 0) {
                this._processQuery(store, cls);
            }
            else {
                store.on('load', function(s) {
                    this._processQuery(s, cls);
                }, this, {single: true});
            }
        }
        else if (!force) {
            if (this.control) {
                var me = this;
                this.control.getParticipantIn(function(ptids){
                    if (!me.initialized) {
                        me.queryPtids = ptids;
                        me.runUniqueQuery(true, target, cls);
                    }
                });
            }
        }
    },

    _processQuery : function(store, cls) {
        var sources = [], s;

        for (s=0; s < store.getCount(); s++) {
            sources.push(store.getAt(s).data['queryLabel'] || store.getAt(s).data['queryName']);
        }

        if (this.control) {
            var me = this;
            if (this.state.getFilters().length == 0) {
                me.control.requestCounts(sources, [], function(r){
                    me._postProcessQuery(r, cls);
                }, me);
            }
            else {
                this.control.getParticipantIn(function(ids) {
                    me.control.requestCounts(sources, ids, function(r){
                        me._postProcessQuery(r, cls);
                    }, me);
                });
            }
        }
    },

    _postProcessQuery : function(response, cls) {
        this.control.displayCounts(response, cls);
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

        this.msg = Ext4.create('Connector.window.SystemMessage', {
            msg : msg,
            x   : Math.floor(box.width/2 - Math.floor(this.getEl().getTextWidth(msg)/2)) - 20,
            y   : (box.y+20), // height of message window,
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

    onFilterChange : function() {
        if (this.isActiveView)
            this.onShowGraph();
        else if (this.initialized)
        {
            this.refreshRequired = true;
        }
    },

    onViewChange : function(xtype) {
        this.isActiveView = (xtype == 'plot');

        if (!this.isActiveView) {
            this.hideLoad();
        }
        //Note: When this event fires, animation still seems to be in play and grid doesn't render properly
        //Deferring seems to fix it, but perhaps event should fire later.
        if (this.isActiveView && this.initialized && this.refreshRequired) {
            Ext4.defer(this.onShowGraph, 300, this);
            if (this.msg)
                this.msg.show();
            return;
        }
        else if (this.isActiveView && !this.refreshRequired) {
            // a response has been cached to load
            if (this.priorResponse) {
                this.showLoad();
                Ext4.defer(this.onChartDataSuccess, 300, this, [this.priorResponse]);
                this.priorResponse = undefined;
            }
            else {
                this.resizeTask.delay(300);
            }
        }

        if (this.msg) {
            this.isActiveView ? this.msg.show() : this.msg.hide();
        }

        if (this.win) {
            if (!this.isActiveView) {
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
            if (sorts[i].name == this.subjectColumn) {
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
            if (!item.isDemographic) {
                firstMeasure = item;
                break;
            }
        }

        return [
            {name : this.subjectColumn,                     queryName : firstMeasure.queryName,  schemaName : firstMeasure.schemaName},
            {name : this.subjectVisitColumn + '/VisitDate', queryName : firstMeasure.queryName,  schemaName : firstMeasure.schemaName}
        ];
    }
});
