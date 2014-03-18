Ext.define('Connector.view.Variable', {
    extend: 'Ext.container.Container',

    alias: 'widget.variableselector',

    cls: 'varselect',

    disabledCls: 'vardisable',

    maskOnDisable: false,

    buttonText: 'choose variable',

    btnCls: 'varselectbtn',

    constructor : function(config) {

        this.callParent([config]);

        this.addEvents(['requestvariable']);
    },

    initComponent : function() {

        var modelComponent = {
            itemId: 'modelcomponent',
            xtype: 'box',
            cls: 'variable',
            tpl: new Ext.XTemplate('<h1>{typeLabel} =</h1><span class="primary">{primaryLabel}</span>')
        };

        if (this.model) {
            this.setModel(this.model);

            modelComponent.data = this.data;
        }

        this.items = [modelComponent,{
            itemId: 'cvbutton',
            xtype: 'button',
            ui: 'rounded-inverted-accent',
            cls: this.btnCls,
            margin: '-13 0 0 0',
            text: this.buttonText,
            handler: this.onBtnClick,
            scope: this
        },{
            itemId: 'ddbutton',
            hidden: true,
            xtype: 'dropdownbutton',
            cls: this.btnCls,
            margin: '-13 0 0 8',
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

        this.model.on('updatevariable', function(m) {
            //
            // Determine what button should be shown based on label
            //
            var haveLabel = m.data['primaryLabel'] && m.data['primaryLabel'].length > 0;
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
        }, this);
    },

    onBtnClick : function() {
        this.fireEvent('requestvariable', this, this.getModel());
    }
});