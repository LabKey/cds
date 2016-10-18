/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Variable', {
    extend: 'Ext.container.Container',

    cls: 'varselect',

    disabledCls: 'vardisable',

    maskOnDisable: false,

    buttonText: 'Choose variable',

    btnCls: 'varselectbtn',

    layout: {
        type: 'hbox'
    },

    constructor : function(config) {

        this.callParent([config]);

        this.addEvents('requestvariable');
    },

    initComponent : function() {

        var me = this;
        var listeners = me.listeners;
        Ext.applyIf(listeners, {
            click: {
                element: 'el', //bind to the underlying el property on the panel
                fn: function(){
                    if (!me.disabled) {
                        me.fireEvent('requestvariable', me, me.getModel());
                    }
                }
            }
        });

        if (this.model) {
            this.setModel(this.model);
        }

        this.items = [{
            itemId: 'modelcomponent',
            xtype: 'box',
            cls: 'variable',
            tpl: this.getModelTpl(),
            data: this.model ? this.data : undefined
        },{
            xtype: 'button',
            itemId: 'cvbutton',
            cls: this.btnCls,
            text: this.buttonText,
            scope: this
        },{
            xtype: 'imgbutton',
            itemId: 'ddbutton',
            hidden: true,
            vector: 29,
            cls: this.btnCls + ' ddbutton',
            scope: this
        }];

        this.callParent();

        this.activeButton = this.getComponent('cvbutton');
    },

    getModelTpl : function() {
        return new Ext.XTemplate(
            '<h1 unselectable="on">{type:htmlEncode}&nbsp;=</h1>',
            '<ul style="{[this.displayNone(values)]}">',
                '<li class="source-label">{[this.renderLabel(values)]}</li>',
                '<li class="variable-label">{variable:this.elipseEncode}</li>',
            '</ul>',
            {
                displayNone : function(values) {
                    return Ext.isDefined(values.source) || Ext.isDefined(values.variable) ? '' : 'display:none';
                },
                elipseEncode : function(v) {
                    return Ext.String.ellipsis(Ext.htmlEncode(v), 45, true);
                },
                renderLabel : function(values) {
                    var label = Ext.isDefined(values.source) ? values.source : '';
                    label += (Ext.isDefined(values.options) ? ' (' + values.options + ')' : '');
                    return this.elipseEncode(label);
                }
            }
        );
    },

    getModel : function() {
        return this.model;
    },

    setModel : function(variable) {
        if (this.model) {
            this.model.clearListeners();
        }

        this.model = variable;
        this.data = this.model.data;

        this.model.on('updatevariable', this.onUpdateVariable, this);
    },

    onUpdateVariable : function(m) {
        //
        // Determine what button should be shown based on label
        //
        var haveLabel = Ext.isDefined(m.get('source')) || Ext.isDefined(m.get('variable'));
        var cv = this.getComponent('cvbutton');
        var dd = this.getComponent('ddbutton');
        if (haveLabel) {
            this.addCls('active');
            this.activeButton = dd;
            cv.hide();
            dd.show();
        }
        else {
            this.removeCls('active');
            this.activeButton = cv;
            cv.show();
            dd.hide();
        }

        this.getComponent('modelcomponent').update(m.data);
    },

    clearModel : function() {
        this.getModel().updateVariable();
    },

    getActiveButton : function() {
        return this.activeButton;
    }
});

Ext.define('Connector.panel.ColorSelector', {
    extend : 'Connector.view.Variable',

    getModelTpl : function() {
        return new Ext.XTemplate(
            '<h1 unselectable="on">{type:htmlEncode}&nbsp;=</h1>',
            '<ul style="{[this.displayNone(values)]}">',
                '<li class="source-label">{[this.renderLabel(values)]}</li>',
                // The legend is always an nbsp on first render because we have to wait till after we get the data to
                // actually render it.
                '<li id="color-legend"></li>',
            '</ul>',
            {
                displayNone : function(values) {
                    return Ext.isDefined(values.source) || Ext.isDefined(values.variable) ? '' : 'display:none';
                },
                elipseEncode : function(v) {
                    return Ext.String.ellipsis(Ext.htmlEncode(v), 45, true);
                },
                renderLabel : function(values) {
                    var label = Ext.isDefined(values.source) && !(values.hideColorSource)? values.source + ': ' : '';
                    label += (Ext.isDefined(values.variable) ? values.variable : '');
                    return this.elipseEncode(label);
                }
            }
        );
    },

    showHover : function(legendData) {
        this.win = Ext.id();
        var calloutMgr = hopscotch.getCalloutManager();
        calloutMgr.createCallout({
            id: this.win,
            target: document.querySelector('#color-legend'),
            placement: 'bottom',
            showCloseButton: false,
            xOffset: -100, // assumes width of 280,
            arrowOffset: 'center',
            content: '<div id="legend-window"></div>',
            onShow: function() {
                var windowCanvas = d3.select('#legend-window').append('svg');

                windowCanvas.attr('height', (8 + legendData.length * 20));
                var windowGlyphs = windowCanvas.selectAll('.legend-point').data(legendData);
                windowGlyphs.enter().append('path').attr('class', 'legend-point');
                windowGlyphs.exit().remove();
                windowGlyphs.attr('d', function(d) {return d.shape();})
                        .attr('fill', function(d) {return d.color;})
                        .attr('transform', function(d, i) {return 'translate(9, ' + (8 + i * 20) + ')';});

                var windowLabels = windowCanvas.selectAll('.legend-text').data(legendData);
                windowLabels.enter().append('text').attr('class', 'legend-text');
                windowLabels.exit().remove();
                windowLabels.text(function(d) {return d.text})
                        .attr('x', 25)
                        .attr('y', function(d, i) {return 13 + i * 20});
            }
        });
    },

    hideHover : function() {
        if (this.win) {
            hopscotch.getCalloutManager().removeCallout(this.win);
            this.win = undefined;
        }
    },

    setLegend : function(legendData) {
        var smallCanvas,
            glyphs,
            hoverRect,
            // rendering the svg causes height to get calculated incorrectly on resize
            iconSize = 13,
            scope = this;

        // Clear the current legend element
        Ext.get('color-legend').update('');

        smallCanvas = d3.select('#color-legend').append('svg')
                .attr('height', iconSize)
                .attr('width', 250);
        glyphs = smallCanvas.selectAll('.legend-point').data(legendData).enter().append('path');
        glyphs.attr('class', 'legend-point')
                .attr('d', function(d) {return d.shape();})
                .attr('fill', function(d) {return d.color;})
                .attr('transform', function(d, i) {return 'translate(' + (8 + i*20) + ',10)';});

        hoverRect = smallCanvas.selectAll('.legend-rect').data([legendData]).enter().append('rect');
        hoverRect.attr('width', legendData.length * iconSize)
                .attr('height', iconSize)
                .attr('fill', '#000')
                .attr('fill-opacity', 0);

        hoverRect.on('mouseover', function(d) {
            scope.showHover.call(scope, legendData);
        });
        hoverRect.on('mouseout', function(d) {
            scope.hideHover.call(scope);
        });
    },

    onUpdateVariable : function(m) {
        this.legend = null; // Clear the current legend.
        this.callParent([m]);
    }
});