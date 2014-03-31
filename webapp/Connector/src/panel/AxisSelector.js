/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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

    disableVariableOptions: false,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent : function() {

        this.items = [];

        this.items.push(this.getMainTitleDisplay());

        var picker = this.getMeasurePicker();
        this.items.push(picker);

        if (this.showDisplay) {
            this.items.push(this.getSelectionDisplay());
        }

        this.callParent();

        picker.getSourcesView().getSelectionModel().on('selectionchange', this.onSourceSelect, this);
        picker.getMeasuresGrid().getSelectionModel().on('selectionchange', this.onMeasureSelect, this);

        picker.getSourcesView().on('itemclick', this.updateDefinition, this);
        picker.getMeasuresGrid().on('itemclick', this.updateDefinition, this);
    },

    getMainTitleDisplay : function() {
        return {
            xtype: 'box',
            autoEl: {
                tag : 'div',
                cls : 'curseltitle',
                html: this.displayConfig.mainTitle
            }
        };
    },

    getSelectionDisplay : function() {

        if (!this.selectionDisplay) {
            var displayCfg = this.displayConfig;

            Ext.apply(displayCfg, {
                height: 210,
                hidden: true,
                displayConfig: this.displayConfig,
                disableScale: this.disableScale,
                disableVariableOptions: this.disableVariableOptions,
                scalename: this.scalename,
                bubbleEvents: ['gotoassaypage']
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
            flex: 1
        });

        Ext.apply(this.measureConfig, {
            bubbleEvents: ['beforeMeasuresStoreLoad', 'measuresStoreLoaded', 'measureChanged']
        });

        this.measurePicker = Ext.create('LABKEY.ext4.MeasuresDataView.SplitPanels', this.measureConfig);

        // allows for a class to be added to the source selection panel
        if (this.measureConfig.sourceCls) {
            this.measurePicker.getSourcesView().on('afterrender', function(p) {
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
        if (selModel.multiSelect)
            this.updateDefinition(null, selModel.getLastSelected());
        else if (this.showDisplay)
            this.getSelectionDisplay().setMeasureSelection(records[0]);
    },

    onSourceSelect : function(selModel, records) {
        //select first variable in the list on source selection change, for singleSelect grid
        if (!this.getMeasurePicker().getMeasuresGrid().multiSelect)
            this.getMeasurePicker().getMeasuresGrid().getSelectionModel().select(0);
    },

    updateDefinition : function(view, record) {
        if (this.showDisplay)
        {
            this.getSelectionDisplay().getDefinitionPanel().update({
                label : record.get("label") || record.get("queryLabel"),
                description : record.get("description")
            });

            this.getSelectionDisplay().show();
        }
    }
});

Ext.define('Connector.panel.AxisSelectDisplay', {
    extend: 'Ext.panel.Panel',

    alias: 'widget.axisselectdisplay',

    ui: 'custom',

    border: false,

    frame: false,

    layout: {
        type: 'vbox'
    },

    initComponent : function() {

        this.items = [{
            xtype: 'panel',
            layout: 'hbox',
            width: '100%',
            border: false,
            bodyStyle: 'background-color: transparent;',
            items: [{
                xtype: 'panel',
                width: this.disableVariableOptions ? '100%' : '50%',
                bodyStyle: 'background-color: transparent;',
                border: false,
                items: [
                    this.getDefinitionPanel(),
                    {
                        xtype: 'button',
                        ui: 'rounded-inverted-accent',
                        text: 'go to assay page',
                        handler: function() {
                            this.fireEvent('gotoassaypage');
                        },
                        scope: this
                    },
                    {
                        xtype: 'container',
                        height: 75,
                        layout: { type: 'hbox' },
                        items: [ this.getScaleForm() ]
                    }
                ]
            },{
                xtype: 'panel',
                hidden: this.disableVariableOptions,
                width: this.disableVariableOptions ? 0 : '50%',
                bodyStyle: 'background-color: transparent;',
                padding: '10px 0 0 0',
                border: false,
                items: [{
                    xtype: 'box'
                    // TODO
                }]
            }]
        }];

        this.callParent();

        this.addEvents('gotoassaypage');
    },

    getDefinitionPanel : function() {
        if (!this.definitionPanel)
        {
            this.definitionPanel = Ext.create('Ext.panel.Panel', {
                border: false,
                ui: 'custom',
                cls: 'definitionpanel iScroll',
                height: !this.disableScale ? 125 : 180,
                bodyStyle: 'background-color: transparent;',
                padding: '10px 0 5px 0',
                data: {},
                tpl: new Ext.XTemplate(
                        '<div class="definition-overflow"></div>',
                        '<div class="curselauth" style="width: 100%;">Definition: {label}</div>',
                        '<div class="curseldesc" style="width: 100%;">{description}</div>'
                )
            });
        }

        return this.definitionPanel;
    },

    getScaleForm : function() {
        if (!this.scaleForm) {
            this.scaleForm = Ext.create('Ext.form.Panel', {
                ui: 'custom',
                hidden: this.disableScale,
                border: false, frame : false,
                width: '100%',
                items: [{
                    xtype: 'radiogroup',
                    itemId: 'scale',
                    ui: 'custom',
                    border: false, frame : false,
                    vertical: true,
                    columns: 1,
                    fieldLabel: 'Scale',
                    labelAlign: 'top',
                    items: [{
                        boxLabel: 'Log', name : this.scalename, inputValue: 'log'
                    },{
                        boxLabel: 'Linear', name : this.scalename, inputValue: 'linear', checked : true
                    }]
                }]
            });
        }

        return this.scaleForm;
    },

    setMeasureSelection : function(record) {
        if (record)
            this.setDefaultScale(record);
    },

    setDefaultScale : function(record) {
        var value = {};
        value[this.scalename] = record.get('defaultScale').toLowerCase();
        this.getScaleForm().getComponent('scale').setValue(value);
    }
});
