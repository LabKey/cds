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
                '<li>{schemaLabel:this.elipseEncode}: {queryLabel:htmlEncode}</li>',
                // The legend is always an nbsp on first render because we have to wait till after we get the data to
                // actually render it.
                '<li id="color-legend">&nbsp;</li>',
            '</ul>',
            {
                elipseEncode : function(v) {
                    return Ext.String.ellipsis(Ext.htmlEncode(v), 35, true);
                }
            }
    ),

    setLegend : function(legendData) {
        var legendEl = Ext4.query('#color-legend')[0];
        legendEl.innerHTML = '';

        if (!this.canvas) {
            this.canvas = d3.select('#color-legend').append('svg');
            this.canvas.attr('width', 75);
            this.canvas.attr('height', 18);
        }

        var points = this.canvas.selectAll('.point').data(legendData);
        points.exit().remove();
        points.enter().append('path')
                .attr('d', function(d){
                    return d.shape();
                })
                .attr('fill', function(d){
                    return d.color;
                })
                .attr('transform', function(d, i){
                    return 'translate(' + (8 + i*20) + ',10)';
                });
    },

    onUpdateVariable : function(m) {
        this.legend = null; // Clear the current legend.
        this.callParent([m]);
    }
});