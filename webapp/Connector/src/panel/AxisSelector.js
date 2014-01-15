Ext.define('Connector.panel.AxisSelector', {

    extend : 'Ext.Panel',

    alias  : 'widget.axisselector',

    ui : 'axispanel',

    constructor : function(config) {

        Ext.applyIf(config, {
            showDisplay : true,
            displayConfig : {},
            measureConfig : {},
            scalename : 'scale',
            disableScale : false
        });

        this.callParent([config]);
    },

    initComponent : function() {

        this.items = [];

        if (this.showDisplay) {
            this.items.push(this.getSelectionDisplay());
        }

        this.items.push(this.getMeasurePicker());

        this.callParent();

        this.getMeasurePicker().sourcesGrid.getSelectionModel().on('selectionchange', this.onSourceSelect, this);
        this.getMeasurePicker().measuresGrid.getSelectionModel().on('selectionchange', this.onMeasureSelect, this);
    },

    getSelectionDisplay : function() {

        if (this.selectDisplay) {
            return this.selectDisplay;
        }

        var displayConfig = this.displayConfig;

        Ext.applyIf(displayConfig, {
            height : 160,
            width  : '95%',
            ui     : 'custom',
            defaultHeader : 'Choose Axis',
            border : false, frame : false,
            flex : 3
        });

        // May not be overriddden
        Ext.apply(displayConfig, {
            items  : [{
                itemId : 'hdr',
                xtype: 'box',
                autoEl: {
                    tag : 'div',
                    cls : 'curselhdr',
                    html: displayConfig.defaultHeader
                }
            },{
                itemId : 'auth',
                xtype: 'box',
                autoEl: {
                    tag : 'div',
                    cls : 'curselauth',
                    html: '&nbsp;'
                }
            },{
                itemId : 'desc',
                xtype: 'box',
                autoEl: {
                    tag : 'div',
                    cls : 'curseldesc',
                    html: '&nbsp;'
                }
            }],
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

                if (record) {

                }
                else {

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
            },
            scope : this
        });

        this.selectDisplay = Ext.create('Ext.Panel', displayConfig);

        this.scaleForm = Ext.create('Ext.form.Panel', {
            style  : 'margin-top: 75px;',
            ui     : 'custom',
            hidden : this.disableScale,
            flex   : 1,
            border : false, frame : false,
            items  : [{
                xtype : 'radiogroup',
                ui     : 'custom',
                border : false, frame : false,
                vertical : true,
                columns : 1,
                fieldLabel : 'Scale',
                labelAlign : 'top',
                items : [{
                    boxLabel: 'Linear', name : this.scalename, inputValue: 'linear', checked : true
                },{
                    boxLabel: 'Log', name : this.scalename, inputValue: 'log'
                }]
            }]
        });

        return Ext.create('Ext.Panel', {
            layout : 'hbox',
            ui     : 'custom',
            border : false, frame : false,
            items  : [
                this.selectDisplay, this.scaleForm
            ]
        });
    },

    hideScale : function() {
        this.scaleForm.hide();
    },

    showScale : function() {
        this.scaleForm.show();
    },

    getScale : function() {
        return this.scaleForm.getValues()[this.scalename];
    },

    getMeasurePicker : function() {

        if (this.measurePicker) {
            return this.measurePicker;
        }

        Ext.applyIf(this.measureConfig, {
            height : '52%',
            width  : '95%',
            allColumns : true,
            showHidden : false,
            multiSelect : true
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
