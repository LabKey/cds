/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Variable', {
    extend: 'Ext.container.Container',

    alias: 'widget.variableselector',

    cls: 'varselect',

    disabledCls: 'vardisable',

    maskOnDisable: false,

    buttonText: 'choose variable',

    btnCls: 'varselectbtn',

    layout: {
        type: 'hbox'
    },

    constructor : function(config) {

        this.callParent([config]);

        this.addEvents('requestvariable');
    },

    initComponent : function() {

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
            margin: '10 0 0 0',
            text: this.buttonText,
            handler: this.onBtnClick,
            scope: this
        },{
            xtype: 'imgbutton',
            itemId: 'ddbutton',
            hidden: true,
            vector: 29,
            cls: this.btnCls + ' ddbutton',
            margin: '12 0 0 10',
            handler: this.onBtnClick,
            scope: this
        }];

        this.callParent();

        this.activeButton = this.getComponent('cvbutton');
    },

    getModelTpl : function() {
        return new Ext.XTemplate(
            '<h1 unselectable="on" style="vertical-align: super;">{typeLabel:htmlEncode}&nbsp;=</h1>',
            '<ul>',
                '<li>{schemaLabel:this.elipseEncode}</li>',
                '<li>{[this.renderLabel(values)]}</li>',
            '</ul>',
            {
                elipseEncode : function(v) {
                    return Ext.String.ellipsis(Ext.htmlEncode(v), 35, true);
                },
                renderLabel : function(values) {
                    var label = values.queryLabel + (values.subLabel.length > 0 ? " (" + values.subLabel + ")" : "");
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
        var haveLabel = m.data['schemaLabel'] && m.data['schemaLabel'].length > 0;
        var cv = this.getComponent('cvbutton');
        var dd = this.getComponent('ddbutton');
        if (haveLabel) {
            this.activeButton = dd;
            cv.hide();
            dd.show();
        }
        else {
            this.activeButton = cv;
            cv.show();
            dd.hide();
        }

        this.getComponent('modelcomponent').update(m.data);
    },

    clearModel : function() {
        this.getModel().updateVariable();
    },

    onBtnClick : function() {
        if (!this.disabled) {
            this.fireEvent('requestvariable', this, this.getModel());
        }
    },

    getActiveButton : function() {
        return this.activeButton;
    }
});

Ext.define('Connector.panel.ColorSelector', {
    extend : 'Connector.view.Variable',

    alias : 'widget.colorselector',

    minWidth : 275,

    getModelTpl : function() {
        return new Ext.XTemplate(
            '<h1 unselectable="on" style="vertical-align: super;">{typeLabel:htmlEncode}&nbsp;=</h1>',
            '<ul>',
                '<li>{[this.renderLabel(values)]}</li>',
                // The legend is always an nbsp on first render because we have to wait till after we get the data to
                // actually render it.
                '<li id="color-legend">&nbsp;</li>',
            '</ul>',
            {
                elipseEncode : function(v) {
                    return Ext.String.ellipsis(Ext.htmlEncode(v), 35, true);
                },
                renderLabel : function(values) {
                    if (values.schemaLabel !== '' && values.queryLabel !== '') {
                        return this.elipseEncode(values.schemaLabel) + ': ' + Ext.htmlEncode(values.queryLabel);
                    }

                    return '';
                }
            }
        );
    },

    showHover : function() {
        var bbox = document.querySelector('#color-legend svg').getBoundingClientRect();
        this.win.style.top = (bbox.top + 40) + 'px';
        this.win.style.left = (bbox.left - 130 + (bbox.width / 2)) + 'px';
        this.win.style.display = '';
    },

    hideHover : function() {
        this.win.style.display = 'none';
    },

    setLegend : function(legendData) {
        var smallCanvas, glyphs, hoverRect, scope = this, windowGlyphs, windowLabels;

        Ext.get('color-legend').update(''); // Clear the current legend element.

        // issue 20541
        var iconSize = 18;
        var svgWidth = Math.min(125, legendData.length * (iconSize+2));

        smallCanvas = d3.select('#color-legend').append('svg')
                .attr('height', iconSize)
                .attr('width', svgWidth);
        glyphs = smallCanvas.selectAll('.legend-point').data(legendData).enter().append('path');
        glyphs.attr('class', 'legend-point')
                .attr('d', function(d){return d.shape();})
                .attr('fill', function(d){return d.color;})
                .attr('transform', function(d, i){return 'translate(' + (8 + i*20) + ',10)';});

        hoverRect = smallCanvas.selectAll('.legend-rect').data([legendData]).enter().append('rect');
        hoverRect.attr('width', legendData.length * iconSize)
                .attr('height', iconSize)
                .attr('fill', '#000')
                .attr('fill-opacity', 0);

        hoverRect.on('mouseover', function(d){
            scope.showHover.call(scope);
        });
        hoverRect.on('mouseout', function(d){
            scope.hideHover.call(scope);
        });

        if (!this.win) {
            this.win = document.createElement('div');
            this.win.setAttribute('id', 'legend-window');
            this.win.setAttribute('class', 'arrow-window');
            this.win.style.width = '250px';
            this.win.style.padding = '5px';
            this.win.style.display = 'none';
            document.querySelector('body').appendChild(this.win);
            this.windowCanvas = d3.select('#legend-window').append('svg');
        }

        this.win.style.height = (8 + legendData.length * 20) + 'px';

        this.windowCanvas.attr('height', (8 + legendData.length * 20));
        windowGlyphs = this.windowCanvas.selectAll('.legend-point').data(legendData);
        windowGlyphs.enter().append('path').attr('class', 'legend-point');
        windowGlyphs.exit().remove();
        windowGlyphs.attr('d', function(d){return d.shape();})
                .attr('fill', function(d){return d.color;})
                .attr('transform', function(d, i){return 'translate(9, ' + (8 + i * 20) + ')';});

        windowLabels = this.windowCanvas.selectAll('.legend-text').data(legendData);
        windowLabels.enter().append('text').attr('class', 'legend-text');
        windowLabels.exit().remove();
        windowLabels.text(function(d){return d.text})
                .attr('x', 25)
                .attr('y', function(d, i){return 13 + i * 20});
    },

    onUpdateVariable : function(m) {
        this.legend = null; // Clear the current legend.
        this.callParent([m]);
    }
});