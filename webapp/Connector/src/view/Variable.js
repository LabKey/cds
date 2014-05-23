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
                '<li>{queryLabel:htmlEncode}</li>',
            '</ul>',
            {
                elipseEncode : function(v) {
                    return Ext.String.ellipsis(Ext.htmlEncode(v), 35, true);
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

    showHover : function(d) {
        var svgNS = "http://www.w3.org/2000/svg", bbox, winX, winY, hoverEl, svgEl, symbolEl, textEl;

        bbox = this.getBoundingClientRect(); // this is the actual dom element.
        winX = bbox.left - 125 + 9;
        winY = bbox.top + 40;

        hoverEl = document.createElement('div');
        hoverEl.setAttribute('class', 'arrow-window');
        hoverEl.style.top = winY + 'px';
        hoverEl.style.left = winX + 'px';
        hoverEl.style.width = '250px';
        hoverEl.style.height = '35px';
        hoverEl.style.padding = '5px';

        symbolEl = document.createElementNS(svgNS, 'path');
        symbolEl.setAttribute('fill', d.color);
        symbolEl.setAttribute('d', d.shape());
        symbolEl.setAttribute('transform', 'translate(8, 10)');

        textEl = document.createElementNS(svgNS, 'text');
        textEl.textContent = d.text;
        textEl.setAttribute('x', '25');
        textEl.setAttribute('y', '15');

        svgEl = document.createElementNS(svgNS, 'svg');
        svgEl.appendChild(symbolEl);
        svgEl.appendChild(textEl);
        hoverEl.appendChild(svgEl);

        document.querySelector('body').appendChild(hoverEl);
        d.hoverEl = hoverEl;
    },

    hideHover : function(d) {
        if(d.hoverEl) {
            d.hoverEl.remove();
            delete d.hoverEl;
        }
    },

    setLegend : function(legendData) {
        var canvas, glyphs, rects;

        Ext4.query('#color-legend')[0].innerHTML = ''; // Clear the current legend element.

        canvas = d3.select('#color-legend').append('svg').attr('height', 18);
        glyphs = canvas.selectAll('.legend-point').data(legendData).enter().append('path');
        glyphs.attr('class', 'legend-point')
                .attr('d', function(d){return d.shape();})
                .attr('fill', function(d){return d.color;})
                .attr('transform', function(d, i){return 'translate(' + (8 + i*20) + ',10)';});

        rects = canvas.selectAll('.legend-rect').data(legendData).enter().append('rect');
        rects.attr('class', 'legend-rect')
                .attr('width', 18)
                .attr('height', 18)
                .attr('x', function(d, i){return i * 20})
                .attr('y', 0)
                .attr('fill', '#000')
                .attr('fill-opacity', 0);

        rects.on('mouseover', this.showHover);
        rects.on('mouseout', this.hideHover);
    },

    onUpdateVariable : function(m) {
        this.legend = null; // Clear the current legend.
        this.callParent([m]);
    }
});