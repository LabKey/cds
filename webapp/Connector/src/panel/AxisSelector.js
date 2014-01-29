Ext.define('Connector.panel.AxisSelector', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.axisselector',

    ui: 'custom',

    showDisplay: true,

    preventHeader: true,

    displayConfig: {},

    measureConfig: {},

    scalename: 'scale',

    disableScale: false,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent : function() {

        this.items = [];

        if (this.showDisplay) {
            this.items.push(this.getSelectionDisplay());
        }

        var picker = this.getMeasurePicker();
        this.items.push(picker);

        this.callParent();

        picker.sourcesGrid.getSelectionModel().on('selectionchange', this.onSourceSelect, this);
        picker.measuresGrid.getSelectionModel().on('selectionchange', this.onMeasureSelect, this);
    },

    getSelectionDisplay : function() {

        if (!this.selectionDisplay) {
            var displayCfg = this.displayConfig;

            Ext.apply(displayCfg, {
                flex: 2,
                displayConfig: this.displayConfig,
                disableScale: this.disableScale,
                scalename: this.scalename
            });

            this.selectionDisplay = Ext.create('Connector.panel.AxisSelectDisplay', displayCfg);
        }

        return this.selectionDisplay;
    },

    hideScale : function() {
        this.getSelectionDisplay().getScaleForm().hide();
    },

    showScale : function() {
        this.getSelectionDisplay().getScaleForm().show();
    },

    getScale : function() {
        return this.getSelectionDisplay().getScaleForm().getValues()[this.scalename];
    },

    getMeasurePicker : function() {

        if (this.measurePicker) {
            return this.measurePicker;
        }

        Ext.applyIf(this.measureConfig, {
            allColumns: true,
            showHidden: false,
            multiSelect: true,
            flex: 3
        });

        Ext.apply(this.measureConfig, {
            bubbleEvents: ['beforeMeasuresStoreLoad', 'measuresStoreLoaded', 'measureChanged']
        });

        this.measurePicker = Ext.create('LABKEY.ext4.MeasuresDataView.SplitPanels', this.measureConfig);

        // allows for a class to be added to the source selection panel
        if (this.measureConfig.sourceCls) {
            this.measurePicker.sourcesGrid.on('afterrender', function(p) {
                p.addCls(this.measureConfig.sourceCls);
            }, this, {single: true});
        }
        return this.measurePicker;
    },

    hasSelection : function() {
        return this.getSelection().length > 0;
    },

    getSelection : function() {
        return this.getMeasurePicker().getSelectedRecords();
    },

    setSelection : function(measure) {
        this.getMeasurePicker().setSelectedRecord(measure);
    },

    onMeasureSelect : function(selModel, records) {
        if (this.showDisplay) {
            this.getSelectionDisplay().setMeasureSelection(records[0]);
        }
    },

    onSourceSelect : function(selModel, records) {
        if (this.showDisplay) {
            this.getSelectionDisplay().setSourceSelection(records[0]);
        }
    }
});

Ext.define('Connector.panel.AxisSelectDisplay', {
    extend: 'Ext.panel.Panel',

    ui: 'custom',

    border: false,

    frame: false,

    defaultHeader: 'Choose Axis',

    layout: {
        type: 'vbox'
    },

    initComponent : function() {

        this.items = [{
            xtype: 'box',
            itemId: 'hdr',
            autoEl: {
                tag : 'div',
                cls : 'curselhdr',
                html: this.defaultHeader
            }
        },{
            itemId: 'auth',
            xtype: 'box',
            autoEl: {
                tag: 'div',
                cls: 'curselauth',
                html: '&nbsp;'
            }
        },{
            itemId: 'desc',
            xtype: 'box',
            autoEl: {
                tag: 'div',
                cls: 'curseldesc',
                html: '&nbsp;'
            }
        },{
            xtype: 'container',
            layout: {
                type: 'hbox'
            },
            items: [ this.getScaleForm() ]
        }];

        this.callParent();
    },

    getScaleForm : function() {
        if (!this.scaleForm) {
            this.scaleForm = Ext.create('Ext.form.Panel', {
                ui: 'custom',
                hidden: this.disableScale,
                border: false, frame : false,
                items: [{
                    xtype: 'radiogroup',
                    ui: 'custom',
                    border: false, frame : false,
                    vertical: true,
                    columns: 1,
                    fieldLabel: 'Scale',
                    labelAlign: 'top',
                    items: [{
                        boxLabel: 'Linear', name : this.scalename, inputValue: 'linear', checked : true
                    },{
                        boxLabel: 'Log', name : this.scalename, inputValue: 'log'
                    }]
                }]
            });
        }

        return this.scaleForm;
    },

    setMeasureSelection : function(record) {
        if (record) {
            if (record.get('label')) {
                this.getComponent('auth').update(record.get('label'));
            }
            else {
                this.getComponent('auth').update('&nbsp;');
            }

            if (record.get('description')) {
                this.getComponent('desc').update(record.get('description'));
            }
            else {
                this.getComponent('desc').update('&nbsp;');
            }
        }
    },

    setSourceSelection : function(record) {
        if (record.get('queryLabel')) {
            this.getComponent('hdr').update(record.get('queryLabel'));
        }
        else if (record.get('queryName')) {
            this.getComponent('hdr').update(record.get('queryName'));
        }

        if (record.get('description')) {
            this.getComponent('desc').update(record.get('description'));
        }
        else {
            this.getComponent('desc').update('&nbsp;');
        }

        this.getComponent('auth').update('&nbsp');
    }
});
