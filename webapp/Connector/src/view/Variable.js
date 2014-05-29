Ext.define('Connector.view.Variable', {
    extend: 'Ext.container.Container',

    alias: 'widget.variableselector',

    cls: 'varselect',

    disabledCls: 'vardisable',

    maskOnDisable: false,

    buttonText: 'choose variable',

    btnCls: 'varselectbtn',

    layout: { type: 'fit' },

    modelTpl : new Ext.XTemplate(
            '<h1 unselectable="on">{typeLabel:htmlEncode}&nbsp;=</h1>',
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
    ),

    constructor : function(config) {

        this.callParent([config]);

        this.addEvents(['requestvariable']);
    },

    initComponent : function() {

        var modelComponent = {
            itemId: 'modelcomponent',
            xtype: 'box',
            cls: 'variable',
            tpl: this.modelTpl
        };

        if (this.model) {
            this.setModel(this.model);

            modelComponent.data = this.data;
        }

        this.items = [modelComponent,{
            xtype: 'button',
            itemId: 'cvbutton',
            cls: this.btnCls,
            margin: '-13 0 0 0',
            text: this.buttonText,
            handler: this.onBtnClick,
            scope: this
        },{
            xtype: 'imgbutton',
            itemId: 'ddbutton',
            hidden: true,
            vector: 27,
            cls: this.btnCls + ' ddbutton',
            margin: '4 0 0 10',
            handler: this.onBtnClick,
            scope: this
        }];

        this.callParent();
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
            cv.hide();
            dd.show();
        }
        else {
            cv.show();
            dd.hide();
        }

        this.getComponent('modelcomponent').update(m.data);
    },

    clearModel : function() {
        this.getModel().updateVariable();
    },

    onBtnClick : function() {
        this.fireEvent('requestvariable', this, this.getModel());
    }
});

Ext.define('Connector.panel.ColorSelector', {
    extend : 'Connector.view.Variable',

    alias : 'widget.colorselector',

    modelTpl : new Ext.XTemplate(
            '<h1 unselectable="on">{typeLabel:htmlEncode}&nbsp;=</h1>',
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
    ),

    showHover : function() {
        this.win.style.display = '';
    },

    hideHover : function() {
        this.win.style.display = 'none';
    },

    setLegend : function(legendData) {
        var smallCanvas, largeCanvas, bbox, glyphs, hoverRect, scope = this, windowGlyphs, windowLabels;

        Ext4.query('#color-legend')[0].innerHTML = ''; // Clear the current legend element.

        smallCanvas = d3.select('#color-legend').append('svg').attr('height', 18);
        glyphs = smallCanvas.selectAll('.legend-point').data(legendData).enter().append('path');
        glyphs.attr('class', 'legend-point')
                .attr('d', function(d){return d.shape();})
                .attr('fill', function(d){return d.color;})
                .attr('transform', function(d, i){return 'translate(' + (8 + i*20) + ',10)';});

        hoverRect = smallCanvas.selectAll('.legend-rect').data([legendData]).enter().append('rect');
        hoverRect.attr('width', legendData.length * 18)
                .attr('height', 18)
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

        bbox = document.querySelector('#color-legend svg').getBoundingClientRect();
        this.win.style.top = (bbox.top + 40) + 'px';
        this.win.style.left = (bbox.left - (bbox.width / 2)) + 'px';
        this.win.style.height = (8 + legendData.length * 20) + 'px';

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