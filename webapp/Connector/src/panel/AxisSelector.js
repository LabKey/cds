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

    disableLookups: true,

    disableScale: false,

    disableVariableOptions: false,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    lookupMap: {},

    initComponent : function() {

        var picker = this.getMeasurePicker();

        this.items = [
            this.getMainTitleDisplay(),
            picker
        ];

        if (this.showDisplay) {
            this.items.push(this.getSelectionDisplay());
        }

        this.callParent();

        var measureGrid = picker.getMeasuresGrid();
        var sourceView = picker.getSourcesView();

        // Source listeners
        sourceView.getSelectionModel().on('selectionchange', this.onSourceSelect, this);

        // Measure listeners
        measureGrid.getSelectionModel().on({
            select: this.onMeasureSelect,
//            deselect: this.onMeasureSelect,
            scope: this
        });

        if (this.showDisplay) {
            sourceView.on('itemclick', this.onSourceClick, this);
            measureGrid.on('itemclick', this.onMeasureClick, this);
        }
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
                disableLookups: this.disableLookups,
                disableScale: this.disableScale,
                disableVariableOptions: this.disableVariableOptions,
                scalename: this.scalename,
                visitTagStore: this.visitTagStore
            });

            this.selectionDisplay = Ext.create('Connector.panel.AxisSelectDisplay', displayCfg);

            this.selectionDisplay.on('lookupselect', function()
            {
                if (this.lastMeasure)
                {
                    this.getMeasurePicker().getMeasuresGrid().getSelectionModel().select(this.lastMeasure, true, false);
                }
            }, this);
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

    getVariableChooserPanel : function() {

        if (this.variableChooserPanel) {
            return this.variableChooserPanel;
        }

        Ext.applyIf(this.measureConfig, {
            includeTimpointMeasures: false,
            allColumns: true,
            showHidden: false,
            multiSelect: true,
            flex: 1
        });

        Ext.apply(this.measureConfig, {
            getSourcesViewTpl : this.getSourcesViewTpl,
            getAdditionalMeasuresArray : this.getAdditionalMeasuresArray,
            bubbleEvents: ['beforeMeasuresStoreLoad', 'measuresStoreLoaded', 'measureChanged']
        });

        this.variableChooserPanel = Ext.create('LABKEY.app.panel.MeasurePicker', this.measureConfig);

        // allows for a class to be added to the source selection panel
        if (this.measureConfig.sourceCls) {
            this.variableChooserPanel.getMeasurePicker().getSourcesView().on('afterrender', function(p) {
                p.addCls(this.measureConfig.sourceCls);
            }, this, {single: true});
        }
        return this.variableChooserPanel;
    },

    getMeasurePicker : function() {
        return this.getVariableChooserPanel().getMeasurePicker();
    },

    getSourcesViewTpl : function() {
        return new Ext.XTemplate(
            '<tpl for=".">',
            '<tpl if="schemaName !=null && parent[xindex - 2] && parent[xindex - 2].schemaName == null">',
            '<div class="groupheader groupheaderline" style="padding: 8px 6px 4px 6px; color: #808080">Datasets</div>',
            '</tpl>',
            '<div class="itemrow" style="padding: 3px 6px 4px 6px; cursor: pointer;">{queryLabel:htmlEncode}</div>',
            '</tpl>'
        );
    },

    getAdditionalMeasuresArray : function() {
        var queryDescription = 'Creates a categorical x axis, unlike the other time axes that are ordinal.';

        return !this.includeTimpointMeasures ? [] :[{
            sortOrder: -1,
            schemaName: null,
            queryName: null,
            queryLabel: 'Time points',
            queryDescription: queryDescription,
            isKeyVariable: true,
            name: 'days',
            label: 'Study days',
            description: queryDescription + 'Each visit with data for the y axis is labeled separately with its study, study day, and visit type.',
            variableType: 'TIME'
        },{
            sortOrder: -1,
            schemaName: null,
            queryName: null,
            queryLabel: 'User groups',
            name: 'weeks',
            label: 'Study weeks',
            description: queryDescription + 'Each visit with data for the y axis is labeled separately with its study, study week, and visit type.',
            variableType: 'TIME'
        },{
            sortOrder: -1,
            schemaName: null,
            queryName: null,
            queryLabel: 'Time points',
            name: 'months',
            label: 'Study months',
            description: queryDescription + 'Each visit with data for the y axis is labeled separately with its study, study month, and visit type.',
            variableType: 'TIME'
        }];
    },

    hasSelection : function() {
        return this.getSelection().length > 0;
    },

    getSelection : function() {
        return this.getMeasurePicker().getSelectedRecords();
    },

    getLookups : function() {
        return this.getSelectionDisplay().getLookups();
    },

    setSelection : function(measure) {
        this.getMeasurePicker().setSelectedRecord(measure);
    },

    clearSelection : function() {
        this.getMeasurePicker().clearSelection();
    },

    onMeasureClick : function(view, measure, element, index) {
        this.updateDefinition(measure);
        this.getSelectionDisplay().setVariableOptions(measure);
        this.lastMeasure = measure;

        this.handleMeasureHighlight(true, element);
    },

    onMeasureSelect : function(selModel, measure) {

        if (selModel.multiSelect && this.showDisplay)
        {
            this.updateDefinition(selModel.getLastSelected());
        }
        else if (this.showDisplay && this.disableLookups)
        {
            this.getSelectionDisplay().setMeasureSelection(measure);
            this.getSelectionDisplay().setVariableOptions(measure);
            this.lastMeasure = measure;
        }

        this.handleMeasureHighlight(false, measure);
    },

    handleMeasureHighlight : function(isClick, element) {
        if (isClick)
        {
            if (element)
            {
                var _el = Ext.get(element);
                if (_el)
                {
                    if (_el.hasCls('x-grid-row-focused'))
                    {
                        // for some reason itemclick fires in the case of unchecking but not
                        // checking. This will stop us from removing highlight when someone
                        // unchecked a row
                        Ext.defer(function() {
                            var el = Ext.get(this.lastElementId);
                            if (el)
                            {
                                el.addCls('highlight');
                            }
                        }, 1, this);
                    }
                    else if (this.lastElementId != element.id)
                    {
                        // clear the former element highlight
                        var el = Ext.get(this.lastElementId);
                        if (el)
                        {
                            el.removeCls('highlight');
                        }

                        this.lastElementId = element.id;

                        el = Ext.get(element.id);
                        if (el)
                        {
                            el.addCls('highlight');
                        }
                    }
                }
            }
            else
            {
                console.warn('No element available onClick');
            }
        }
        else
        {
            if (this.lastMeasure)
            {
                if (this.lastMeasure.id == element.id)
                {
                    if (this.lastElementId)
                    {
                        var el = Ext.get(this.lastElementId);
                        if (el)
                        {
                            el.addCls('highlight');
                        }
                    }
                }
            }
        }
    },

    onSourceClick : function(view, source) {
        this.updateDefinition(source);
    },

    onSourceSelect : function(selModel, sources) {

        this.getSelectionDisplay().clearVariableOptions();

        if (Ext.isArray(sources) && sources.length > 0)
        {
            var source = sources[0];
            this.updateDefinition(source);
        }

        //select first variable in the list on source selection change, for singleSelect grid
        var measureGrid = this.getMeasurePicker().getMeasuresGrid();
        if (!measureGrid.multiSelect)
            measureGrid.getSelectionModel().select(0);
    },

    updateDefinition : function(record) {

        if (record.id != this.lastDefinitionId)
        {
            this.lastDefinitionId = record.id;

            var display = this.getSelectionDisplay();

            display.getDefinitionPanel().update({
                label: record.get("label") || record.get("queryLabel"),
                description: record.get("description")
            });

            display.show();
        }
    }
});

Ext.define('Connector.panel.AxisSelectDisplay', {
    extend: 'Ext.panel.Panel',

    alias: 'widget.axisselectdisplay',

    ui: 'custom',

    border: false,

    frame: false,

    disableLookups: true,

    disableVariableOptions: false,

    layout: {
        type: 'vbox'
    },

    lookupMap: {},

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
                        text: 'go to assay page',
                        itemId: 'gotoassaypage'
                    },
                    {
                        xtype: 'container',
                        height: 55,
                        padding: '10px 0 0 0',
                        layout: { type: 'hbox' },
                        items: [ this.getScaleForm() ]
                    }
                ]
            },{
                xtype: 'panel',
                itemId: 'variableoptions',
                cls: 'variableoptions',
                hidden: this.disableVariableOptions,
                width: this.disableVariableOptions ? 0 : '50%',
                bodyStyle: 'background-color: transparent;',
                padding: '10px 0 0 0',
                items: [] // items to be added/removed as variables are selected
            }]
        }];

        this.callParent();
    },

    getDefinitionPanel : function() {
        if (!this.definitionPanel)
        {
            this.definitionPanel = Ext.create('Ext.panel.Panel', {
                border: false,
                ui: 'custom',
                cls: 'definitionpanel iScroll',
                height: !this.disableScale ? 145 : 180,
                bodyStyle: 'background-color: transparent;',
                padding: '10px 5px 5px 0',
                data: {},
                tpl: new Ext.XTemplate(
                        '<div class="definition-overflow"></div>',
                        '<div class="curselauth" style="width: 100%;">Definition: {label:htmlEncode}</div>',
                        '<div class="curseldesc" style="width: 100%;">{description:htmlEncode}</div>'
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
                items: [{
                    xtype: 'radiogroup',
                    itemId: 'scale',
                    ui: 'custom',
                    border: false, frame : false,
                    fieldLabel: 'Scale',
                    labelAlign: 'top',
                    labelCls: 'curselauth',
                    items: [
                        { boxLabel: 'Log', name : this.scalename, inputValue: 'log', width: 100 },
                        { boxLabel: 'Linear', name : this.scalename, inputValue: 'linear', checked : true }
                    ]
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
    },

    getVariableOptionsPanel : function() {
        return this.down('#variableoptions');
    },

    clearVariableOptions : function() {
        this.getVariableOptionsPanel().removeAll(false);
    },

    setVariableOptions : function(measure) {
        if (measure && measure.id != this.lastMeasureId)
        {
            this.lastMeasureId = measure.id;

            this.clearVariableOptions();
            var optionsPanel = this.getVariableOptionsPanel();

            if (measure.get('variableType') == 'TIME')
            {
                optionsPanel.add(this.getAlignmentForm());
            }
            else if (!this.disableLookups && Ext.isDefined(measure.get('lookup').queryName))
            {
                optionsPanel.add({
                    xtype: 'box',
                    cls: 'curselauth',
                    autoEl: {
                        tag: 'div',
                        html: Ext.htmlEncode(measure.get('name') + ' details')
                    }
                });
                optionsPanel.add({
                    xtype: 'grid',
                    viewConfig : { stripeRows : false },
                    selType: 'checkboxmodel',
                    selModel: {
                        checkOnly: true,
                        checkSelector: 'td.x-grid-cell-row-checker'
                    },
                    enableColumnHide: false,
                    enableColumnResize: false,
                    multiSelect: true,
                    border: false,
                    store: this.getLookupColumnStore(measure),
                    ui: 'custom',
                    height: 200,
                    cls: 'measuresgrid iScroll lookupgrid',
                    flex: 1,
                    hideHeaders: true,
                    columns: [{
                        dataIndex: 'shortCaption',
                        width: '100%',
                        flex: 1,
                        sortable: false,
                        menuDisabled: true
                    }],
                    listeners: {
                        boxready: function(grid) {
                            var store = grid.getStore();
                            if (store.isLoading())
                            {
                                grid.getStore().on('load', function()
                                {
                                    this.applyLookupSelections(grid, store);
                                }, this);
                            }
                            else
                            {
                                this.applyLookupSelections(grid, store);
                            }
                        },
                        select: this.onLookupSelect,
                        deselect: this.onLookupDeselect,
                        scope: this
                    }
                });
            }
        }
    },

    onLookupSelect : function(selModel, record, ix) {

        if (Ext.isDefined(this.boundColumn))
        {
            var alias = this.boundColumn.get('alias');
            if (!this.lookupMap[alias])
            {
                this.lookupMap[alias] = {};
            }

            this.lookupMap[alias][record.get('fieldKeyPath')] = {
                fieldKeyPath: record.get('fieldKeyPath')
            };

            this.fireEvent('lookupselect', this, record);
        }
    },

    onLookupDeselect : function(selModel, record, ix) {

        var alias = this.boundColumn.get('alias');

        if (this.lookupMap[alias])
        {
            if (Ext.isDefined(this.lookupMap[alias][record.get('fieldKeyPath')])) {
                delete this.lookupMap[alias][record.get('fieldKeyPath')];
            }
        }
    },

    applyLookupSelections : function(grid, lookupStore) {

        var lookupSelections = this.lookupMap[this.boundColumn.get('alias')];

        if (Ext.isDefined(grid) && Ext.isDefined(lookupSelections))
        {
            var selectedLookups = [];

            Ext.iterate(lookupSelections, function(fieldKeyPath, value)
            {
                var idx = lookupStore.findExact('fieldKeyPath', fieldKeyPath);
                if (idx > -1)
                {
                    selectedLookups.push(lookupStore.getAt(idx));
                }
            }, this);

            grid.getSelectionModel().select(selectedLookups, false, true);
        }
    },

    getLookups : function() {
        return this.lookupMap;
    },

    getLookupColumnStore : function(boundColumn) {

        this.boundColumn = boundColumn;
        var lookup = boundColumn.get('lookup');

        var storeId = "fkColumns-" +  lookup.schemaName + "-" + lookup.queryName + "-" + lookup.keyColumn;

        var store = Ext.getStore(storeId);
        if (null != store) {
            return store;
        }

        var url = LABKEY.ActionURL.buildURL("query", "getQueryDetails", null, {
            schemaName: lookup.schemaName,
            queryName: lookup.queryName
        });

        SS = Ext.create('Ext.data.Store', {
            model   : 'Connector.model.ColumnInfo',
            storeId : storeId,
            proxy   : {
                type   : 'ajax',
                url    : url,
                reader : {
                    type: 'json',
                    root: 'columns'
                }
            },
            filterOnLoad: true,   //Don't allow user to select hidden cols or the display column (because it is already being displayed)
            filters: [function(item) {
                return !item.raw.isHidden; //&& item.raw.name != displayColFieldKey;
            }],
            autoLoad: true
        });

        return SS;
    },

    getAlignmentForm : function() {
        if (!this.alignmentForm)
        {
            var visitTagRadios = [];
            Ext.each(this.visitTagStore.getRange(), function(record){
                visitTagRadios.push({
                    name : 'alignmentVisitTag',
                    boxLabel: record.get('Caption'),
                    inputValue: record.get('Name')
                })
            });

            this.alignmentForm = Ext.create('Ext.form.Panel', {
                ui: 'custom',
                border: false, frame: false,
                width: '100%',
                padding: '0 0 10px 5px',
                items: [{
                    xtype: 'displayfield',
                    fieldLabel: 'Align multiple studies by',
                    labelCls: 'curselauth',
                    labelWidth: 185
                },{
                    xtype: 'radiogroup',
                    itemId: 'alignment',
                    ui: 'custom',
                    height: 175,
                    autoScroll: true,
                    cls: 'iScroll',
                    border: false, frame : false,
                    vertical: true,
                    columns: 1,
                    items: visitTagRadios
                }]
            });
        }

        return this.alignmentForm;
    }
});
