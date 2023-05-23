/*
 * Copyright (c) 2015-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.Selector', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.variableselector',

    cls: 'variable-selector',

    border: false,
    height: 660,
    width: 520,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    headerTitle: 'Variable Selector',
    sectionTitle: 'Sources',
    selectButtonTitle: undefined,

    sourceMeasureFilter: undefined,

    multiSelect: false,
    lockedMeasures: undefined,
    selectedMeasures: undefined,

    testCls: undefined,

    disableAdvancedOptions: false,
    gotoAntigenSelection: false,
    boundDimensionAliases: undefined,
    measureSetStore: null,

    // track the first time that the selector is initialized so we can use initOptions properly
    initialized: false,
    initOptions: undefined,

    statics: {
        maximumHeight: 800
    },

    constructor : function(config) {

        if (!Ext.isObject(config.sourceMeasureFilter)) {
            throw this.$className + ' requires a \'sourceMeasureFilter\' configuration.';
        }

        if (Ext.isObject(config.activeMeasure)) {
            if (config.activeMeasure.$className !== 'Connector.model.Measure') {
                config.initOptions = Ext.clone(config.activeMeasure.options);
                config.activeMeasure = Ext.create('Connector.model.Measure', config.activeMeasure);
            }
        }

        // Issue 24648: with more hidden variables allow for a module property to be used to view them in devMode
        if (LABKEY.devMode && LABKEY.getModuleContext('cds')['ShowHiddenVariables'] === 'true')
        {
            config.sourceMeasureFilter.includeHidden = true;
        }

        this.callParent([config]);

        this.addEvents('remove', 'cancel', 'selectionmade', 'beforeSourceCountsLoad', 'afterSourceCountsLoad');
    },

    initComponent : function() {
        this.queryService = Connector.getService('Query');
        this.boundDimensionAliases = [];
        this.selectedMeasures = [];
        this.lockedMeasures = [];

        this.sourcesStore = Ext.create('Ext.data.Store', {
            model: 'Connector.model.Source',
            sorters: [
                {
                    property: 'category',
                    transform: function(value) {
                        return value || ' ';
                    }
                },
                {property: 'sortOrder'},
                {property: 'title'}
            ]
        });

        this.measureStore = Ext.create('Ext.data.Store', {
            model: 'Connector.model.Measure',
            groupField: this.multiSelect ? 'recommendedVariableGrouper' : undefined,
            sorters: [
                {property: 'sourceTitle'},
                {property: 'isRecommendedVariable', direction: 'DESC'},
                {property: 'sortOrder'},
                {property: 'label'}
            ]
        });

        if (!Ext.isEmpty(this.testCls)) {
            this.addCls(this.testCls);
        }

        this.items = [
            this.getHeader(),
            this.getLoaderPane(),
            this.getFooter()
        ];

        this.callParent();

        this.queryService.onQueryReady(function() {
            this.loadSourcesAndMeasures();
        }, this);

        //plugin to handle loading mask for the variable selector source counts
        this.addPlugin({
            ptype: 'loadingmask',
            configs: [{
                element: this,
                blockingMask: false,
                itemsMaskCls: 'item-spinner-mask-orange',
                beginEvent: 'beforeSourceCountsLoad',
                endEvent: 'afterSourceCountsLoad'
            }]
        });

        this.on('resize', function(){
            var pane = this.getAdvancedPane();
            if (pane.items.items.length > 1) {
                if (!pane.isHidden()) {
                    pane.setHeight(this.getAdvancedPaneHeight(pane.items));
                }
            }

        }, this);
    },

    getAdvancedPaneHeight : function(items) {
        // Maximum of 50%
        // Minimum of 117px (if it has anything to show)
        //  Calculate height dynamically based on the number of visible items in the advanced options pane

        var visibleItems = 0;
        Ext.each(items.items, function(item){
            if (!item.hidden){
                visibleItems++;
            }
        });

        var max = (this.getHeight() - 40) / 2,
            calcMax = Math.max(visibleItems * 50, 117);
        return Math.min(max, calcMax);
    },

    getLoaderPane : function() {
        if (!this.loaderPane) {
            this.loaderPane = Ext.create('Ext.Component', {
                border: false,
                flex: 1
            });
        }

        return this.loaderPane;
    },

    loadSourcesAndMeasures : function() {

        var selectedSourceKey, data = this.queryService.getMeasuresStoreData(this.sourceMeasureFilter);

        this.sourcesStore.loadRawData(data.sources);
        this.measureStore.loadRawData(data.measures);

        if (this.activeMeasure) {
            // keep track of the selectedSourceKey, if present, so we can reselect it correctly on reshow
            selectedSourceKey = this.activeMeasure.get('selectedSourceKey');

            this.activeMeasure = this.measureStore.getById(this.activeMeasure.get('lowerAlias'));
            this.activeMeasure.set('selectedSourceKey', selectedSourceKey);
        }

        this.updateSelectorPane();
    },

    updateSelectorPane : function() {
        var source = this.getSourceForMeasure(this.activeMeasure);
        if (source) {
            this.showMeasures(source, this.activeMeasure);
        }
        else {
            this.showSources();
        }
    },

    ensureMeasureModel : function(measure) {
        if (Ext.isObject(measure) && measure.$className !== 'Connector.model.Measure') {
            measure = Ext.create('Connector.model.Measure', measure);
        }
        return measure;
    },

    setActiveMeasure : function(measure) {
        if (!Ext.isDefined(measure)) {
            measure = null;
        }

        // since setting the active measure comes from external callers, grab the initOptions and reset the
        // initialized bit to treat it like a new selector
        this.initOptions = Ext.isObject(measure) ? Ext.clone(measure.options) : undefined;
        this.initialized = false;

        this.activeMeasure = this.ensureMeasureModel(measure);

        // issue 23845: always clear measure selection so that the reselect from 'cancel' initializes as expected
        this.getMeasurePane().getSelectionModel().deselectAll();

        this.updateSelectorPane();
    },

    clearSelection : function(axis) {
        this.setActiveMeasure(null);
    },

    getSourceForMeasure : function(measure) {
        var source = null;
        if (measure)
        {
            var sourceKey = measure.get('selectedSourceKey')
                                ? measure.get('selectedSourceKey')
                                : (measure.get('altSourceKey') ? measure.get('altSourceKey') : measure.get('schemaName') + '|' + measure.get('queryName'));
            source = this.sourcesStore.getById(sourceKey);

            if (source == null) {
                console.warn('Unable to find source \'' + sourceKey + '\'. Might not work for the applied \'sourceMeasureFilter\'');
            }
        }

        return source;
    },

    loadSourceCounts : function() {
        this.fireEvent('beforeSourceCountsLoad', this);

        var sources = this.sourcesStore.queryBy(function(record) {
            return Ext.isString(record.get('queryName')) || Ext.isString(record.get('subjectCountQueryName'));
        }).items;

        this.queryService.getSourceCounts(sources, this.plotAxis, function(s, counts) {
            Ext.each(sources, function(source) {
                var count = counts[source.get('subjectCountQueryName') || source.get('queryName')];
                if (Ext.isDefined(count)) {
                    source.set('subjectCount', count);
                }
            });

            this.fireEvent('afterSourceCountsLoad', this);
        }, this);
    },

    getSourcePane : function() {
        if (!this.sourcePane) {
            this.sourcePane = Ext.create('Ext.view.View', {
                border: false,
                hidden: true,
                flex: 1,
                autoScroll: true,
                cls: 'content',
                itemSelector: 'div.content-item',
                store: this.sourcesStore,
                tpl: new Ext.XTemplate(
                    '<tpl for=".">',
                        '<tpl if="category != null">',
                            '<tpl if="xindex == 1">',
                                '<div class="content-category">{category:htmlEncode}</div>',
                            '<tpl elseif="parent[xindex-2].category != category">',
                                '<div class="content-category content-line">{category:htmlEncode}</div>',
                            '</tpl>',
                        '</tpl>',
                        '<div class="content-item {subjectCount:this.greyMe}">',
                            '<div class="content-label">{title:htmlEncode}</div>',
                            '<tpl if="subjectCount != -1">',
                                '<div class="content-count maskit">{subjectCount:this.commaFormat}</div>',
                            '</tpl>',
                        '</div>',
                    '</tpl>',
                    {
                        commaFormat : function(v) {
                            return Ext.util.Format.number(v, '0,000');
                        },
                        greyMe : function(v) {
                            if (v == -1 || v > 0)
                                return '';
                            return 'look-disabled';
                        }
                    }
                ),
                listeners: {
                    select: this.onSourceSelect,
                    itemmouseenter: function(view, record, item) {
                        var title = record.get('category') == 'Assays' ? record.get('queryName') : record.get('queryLabel');
                        this.showLearnMessage(item, title, record.get('description'), 'Source');
                    },
                    itemmouseleave: function() {
                        this.hideLearnMessage('Source');
                    },
                    scope: this
                }
            });

            this.insert(this.items.length - 2, this.sourcePane);
        }

        return this.sourcePane;
    },

    //runs this function when a source is selected
    onSourceSelect : function(rowModel, sourceRecord) {
        var view = rowModel.view, me = this;

        this.hideLearnMessage('Source');

        view.getEl().slideOut('l', {
            duration: 250,
            callback: function() {
                //hide learn message called twice because of a timing bug with automated tests
                me.hideLearnMessage('Source');
                me.showMeasures(sourceRecord);
                rowModel.clearSelections();
            }
        });
    },

    showSources : function() {
        // clear any previous source selection so that the 'select' will fire if the same source is clicked
        this.getSourcePane().getSelectionModel().deselectAll();

        this.toggleDisplay('source');

        this.setHeaderData({
            title: this.headerTitle,
            navText: 'Sources',
            showCount: true
        });
    },

    getMeasurePane : function()
    {
        if (!this.measurePane) {
            if (this.multiSelect) {
                this.measurePane = this.getMeasureSelectionGrid();
                this.groupingFeature = this.measurePane.view.getFeature('measuresGridGrouping');
            }
            else {
                this.measurePane = this.getMeasureSelectionView();
            }

            this.insert(this.items.length - 2, this.measurePane);
        }

        return this.measurePane;
    },

    getBaseMeasureSelectionConfig : function() {
        return {
            border: false,
            hidden: true,
            flex: 1,
            autoScroll: true,
            store: this.measureStore,
            listeners: {
                select: this.onMeasureSelect,
                deselect: this.deselectMeasure,
                itemmouseenter: function(view, record, item) {
                    this.showLearnMessage(item, record.get('label'), record.get('altDescription') ? record.get('altDescription') : record.get('description'), 'Measure');
                },
                itemmouseleave: function() {
                    this.hideLearnMessage('Measure');
                },
                scope: this
            }
        };
    },

    getMeasureSelectionGrid : function() {
        var me = this, config, selModelConfig;

        selModelConfig = {
            mode: 'SIMPLE',
            renderer: function(v,p,record) {
                var cls = 'x-grid-row-checker';
                if (me.getRecordIndex(me.getLockedRecords(), record) > -1) {
                    cls += ' checker-disabled';
                }
                return '<div class="' + cls + '">&nbsp;</div>';
            },
            listeners: {
                scope: this,
                beforedeselect: function(sm, record, index) {
                    // don't allow deselection of locked measures (i.e. plot measures or active filter measures)
                    return this.getRecordIndex(this.getLockedRecords(), record) == -1;
                }
            }
        };

        config = Ext.apply(this.getBaseMeasureSelectionConfig(), {
            cls : 'content-multiselect',
            enableColumnResize: false,
            enableColumnHide: false,
            bubbleEvents : ['viewready'],
            viewConfig : { stripeRows : false },
            multiSelect: true,
            selType: 'checkboxmodel',
            selModel: selModelConfig,
            columns: [{
                cls: 'content-header',
                header: 'Select all columns',
                dataIndex: 'label',
                flex: 1,
                sortable: false,
                menuDisabled: true
            }],
            requires: ['Ext.grid.feature.Grouping'],
            features: [{
                ftype: 'grouping',
                id: 'measuresGridGrouping',
                collapsible: false,
                groupHeaderTpl: new Ext.XTemplate(
                    '<div class="content-grouping">{groupValue:this.renderHeader}</div>',
                    {
                        renderHeader : function(value) {
                            var hdr = value;
                            if (value === '0_Recommended') {
                                hdr = 'Recommended';
                            }
                            else if (value === '1_AssayRequired') {
                                hdr = 'Assay required columns';
                            }
                            else if (value === '2_Additional') {
                                hdr = 'Additional';
                            }
                            return hdr;
                        }
                    }
                )
            }]
        });

        return Ext.create('Ext.grid.Panel', config);
    },

    getMeasureSelectionView : function() {
        var config = Ext.apply(this.getBaseMeasureSelectionConfig(), {
            cls: 'content',
            itemSelector: 'div.content-item',
            selectedItemCls: 'content-selected',
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                    '<tpl if="isRecommendedVariable && xindex == 1">',
                        '<div class="content-grouping">Recommended</div>',
                    '</tpl>',
                    '<tpl if="!isRecommendedVariable && parent[xindex-2] && parent[xindex-2].isRecommendedVariable">',
                        '<div class="content-grouping extrapadding">Additional</div>',
                    '</tpl>',
                    '<div class="content-item">',
                        '<tpl if="altPlotLabel">',
                        '<div class="content-label">{altPlotLabel:htmlEncode}</div>',
                        '<tpl else>',
                        '<div class="content-label">{label:htmlEncode}</div>',
                        '</tpl>',
                    '</div>',
                '</tpl>'
            )
        });

        return Ext.create('Ext.view.View', config);
    },

    showLearnMessage : function(item, title, description, name) {
        if (description) {
            //Allow up to 450 charactors and ensures that a word isn't being cut off.
            var charLimit = 450;
            
            if (description.length > charLimit) {
               description = description.substring(0, charLimit + 1);
               description = description.substring(0, description.lastIndexOf(' ')) + '...';
            }

            var position = this.getLearnTooltipPosition(item.scrollHeight, description.length > charLimit ? charLimit : description.length);

            var calloutMgr = hopscotch.getCalloutManager(),
                _id = Ext.id(),
                displayTooltip = setTimeout(function() {
                    calloutMgr.createCallout(Ext.apply({
                        id: _id,
                        // bubbleWidth: 160, // use CSS instead of JS for this.
                        xOffset: 50,
                        showCloseButton: false,
                        target: item,
                        placement: 'right',
                        title: title,
                        content: description
                    }, position));
                }, 400);
            this.on('hide' + name + 'LearnMsg', function() {
                clearTimeout(displayTooltip);
                calloutMgr.removeCallout(_id);
            }, this);
        }
    },

    getLearnTooltipPosition: function(scrollHeight, strlength) {
        // for every 100 charactor, move down the y and arrow by roughly 1 line to center the callout to avoid being cut off
        var adjustFactor = Math.round(strlength/100), adjustment = 25;
        return {
                yOffset: scrollHeight - 37 - adjustment * adjustFactor, //Issue 24196 - tooltips for rows immediately following a grouping heading were out of alignment.
                arrowOffset: adjustment * adjustFactor
        };
    },

    hideLearnMessage: function(name) {
        this.fireEvent('hide' + name + 'LearnMsg', this);
    },

    /**
     * @param source
     * @param [activeMeasure] if no activeMeasure passed in, select the first one for the given source
     */
    showMeasures : function(source, activeMeasure) {

        var key = source.get('key'),
            variableType = source.get('variableType'),
            filter, aliases = {}, toInclude, index, alias,
            selModel = this.getMeasurePane().getSelectionModel(),
            definedMeasureSourceMap = this.queryService.getDefinedMeasuresSourceTitleMap(),
            multiSelect = this.multiSelect;

        // collect the aliases for all locked measures
        Ext.each(this.getLockedRecords(), function(measure) {
            alias = measure.get('alias');
            if (Ext.isDefined(alias)) {
                aliases[alias] = true;
            }
        }, this);

        // collect the aliases for all selected measures
        Ext.each(this.getSelectedRecords(), function(measure) {
            alias = measure.get('alias');
            if (Ext.isDefined(alias)) {
                aliases[alias] = true;
            }
        }, this);

        var sourceContextMap = Connector.measure.Configuration.context.sources;
        var activeYMeasure = this.activeYMeasure;
        // setup the measures store filter based on the selected source
        if (variableType === 'VIRTUAL') {
            filter = function(measure) {
                alias = measure.get('alias');

                // include all measures from the locked and selected sets
                toInclude = alias in aliases;

                // if Session source, also check to see if the measures is in that set
                if (source.get('schemaName') === '_session' && !toInclude) {
                    toInclude = alias in Connector.getState().getSessionColumns();
                }

                // for those measures being included, set the sourceTitle if the measure is part of a DEFINED_MEASURES source
                if (toInclude && Ext.isDefined(definedMeasureSourceMap[alias])) {
                    measure.set('sourceTitle', definedMeasureSourceMap[alias]);
                }

                return toInclude;
            };
        }
        else if (variableType == 'DEFINED_MEASURES') {
            filter = function(measure) {
                var targetSource = source, include =false;

                if (measure.get('altSourceKey')) {
                    if (Ext.isDefined(sourceContextMap[measure.get('altSourceKey')])) {
                        if (source.get('queryLabel') === sourceContextMap[measure.get('altSourceKey')].queryLabel) {
                            include = true;
                            targetSource = sourceContextMap[measure.get('altSourceKey')];
                        }

                    }
                }
                include = include || targetSource.get('measures').indexOf(measure.get('alias')) > -1;

                if (measure.get("isHoursType") && !multiSelect) {
                    if (activeYMeasure)
                        include = include && activeYMeasure.allowHoursTimePoint;
                    else
                        include = false;
                }

                if (include) {
                    measure.set({
                        selectedSourceKey: targetSource.get('key'),
                        sourceTitle: targetSource.get('queryLabel')
                    });

                    return true;
                }

                return false;
            }
        }
        else {
            // for all other sources, filter based on the schemaName/queryName source key
            filter = function(measure) {
                if (measure.get('altSourceKey')) {
                    if (Ext.isDefined(sourceContextMap[measure.get('altSourceKey')])) {
                        var include = source.get('queryLabel') === sourceContextMap[measure.get('altSourceKey')].queryLabel;

                        if (measure.get("isHoursType") && !multiSelect) {
                            if (activeYMeasure)
                                include = include && activeYMeasure.allowHoursTimePoint;
                            else
                                include = false;
                        }
                        return include;
                    }
                }
                return key == (measure.get('schemaName') + '|' + measure.get('queryName'));
            };
        }

        // filters results by the filters applied above
        this.measureStore.clearFilter();
        this.measureStore.filterBy(filter);

        this.toggleDisplay('measure');

        this.setHeaderData({
            title: this.headerTitle,
            navText: 'Sources',
            sectionTitle: source.get('title'),
            action: function() {
                if (this.advancedPane) {
                    this.advancedPane.hide();
                }

                var me = this;
                this.measurePane.getEl().slideOut('r', {
                    duration: 250,
                    callback: function() {
                        // clear the initOptions and deselect (issue 23845) any measure for the source we are leaving
                        if (!me.multiSelect) {
                            me.initialized = false;
                            me.initOptions = undefined;
                            selModel.deselectAll();
                        }

                        me.showSources();
                    }
                });
            },
            showCount: false
        });

        if (this.multiSelect) {
            // for the multiSelect case, we want to clear all selections and reselect each time so that
            // the 'select all columns' checkbox works as expected (issue 24077)
            // Issue 24116: re-selecting records needs to wait until the store filter is done and re-rendering complete (HACK...defer)
            selModel.deselectAll(true /* suppressEvents */);
            Ext.defer(function() {
                Ext.iterate(aliases, function(alias){
                    index = this.measureStore.findExact('alias', alias);
                    if (index > -1) {
                        selModel.select(index, true /* keepExisting */, true /* suppressEvents */);
                    }
                }, this);
            }, 100, this);
        }
        else {
            if (activeMeasure) {
                if (selModel.hasSelection() && selModel.getLastSelected().getId() === activeMeasure.getId()) {
                    // already have selected measure, just need to show the advanced options pane
                    this.slideAdvancedOptionsPane();
                }
                else {
                    index = this.measureStore.findExact('lowerAlias', activeMeasure.getId());
                    Ext.defer(function() { selModel.select(index); }, 500, this);
                }
            }
            else {
                // default to selecting the first variable for the given source
                Ext.defer(function() { selModel.select(0); }, 100, this);
            }
        }

        // for the 'Current Columns' source, we group the measures by the query source
        // otherwise, we group measures into the Recommended or Additional groupings
        if (Ext.isDefined(this.groupingFeature)) {
            if (variableType == 'VIRTUAL') {
                this.groupingFeature.enable();
                this.measureStore.groupers.first().property = 'sourceTitle';
                this.measureStore.group();
                this.measureStore.sort('sourceTitle', 'ASC');
            }
            else {
                // enable or disable the measure grid grouping feature based on the
                // presence of a 'recommended' or 'assay required columns' variable
                if (this.measureStore.findExact('recommendedVariableGrouper', '0_Recommended') > -1 ||
                    this.measureStore.findExact('recommendedVariableGrouper', '1_AssayRequired') > -1)
                {
                    this.groupingFeature.enable();
                }
                else
                {
                    this.groupingFeature.disable();
                }

                this.measureStore.groupers.first().property = 'recommendedVariableGrouper';
                this.measureStore.group();
                this.measureStore.sort('recommendedVariableGrouper', 'ASC');
            }
        }
    },

    getHierarchySelectionPane : function() {
        if (!this.hierarchyPane) {
            this.hierarchyPane = Ext.create('Ext.panel.Panel', {
                cls: 'hierarchy-pane',
                border: false,
                hidden: true,
                flex: 1
            });

            this.insert(this.items.length - 2, this.hierarchyPane);
        }

        return this.hierarchyPane;
    },

    getHierarchicalOptionCmp : function()
    {
        var hierOptionCmp;

        // find and return the first visible hierarchical component
        if (Ext.isArray(this.advancedOptionCmps))
        {
            Ext.each(this.advancedOptionCmps, function(optionCmp)
            {
                if (!optionCmp.hidden && optionCmp.isHierarchical)
                {
                    hierOptionCmp = optionCmp;
                    return false;
                }
            });
        }

        return hierOptionCmp;
    },

    goToAntigenSelection : function()
    {
        // if the antigen hierarchy pane is already defined, go there
        // otherwise set the flag so that it goes there next time the selector is shown
        this.gotoAntigenSelection = true;
        if (Ext.isDefined(this.getHierarchicalOptionCmp()))
        {
            this.shouldGoToAntigenSelection();
        }
    },

    shouldGoToAntigenSelection : function()
    {
        if (this.gotoAntigenSelection)
        {
            this.showHierarchicalSelection();
            this.gotoAntigenSelection = false;
        }
    },

    showHierarchicalSelection : function(advancedOptionCmp) {
        // if the advancedOptionCmp param isn't provided, look for the first visible component that is hierarchical
        advancedOptionCmp = advancedOptionCmp || this.getHierarchicalOptionCmp();
        if (!Ext.isDefined(advancedOptionCmp))
        {
            return;
        }

        var source = this.getSourceForMeasure(this.activeMeasure),
            selectorMeasure;

        this.getHierarchySelectionPane().removeAll();

        selectorMeasure = Ext.clone(this.activeMeasure.data);
        selectorMeasure.options = this.getAdvancedOptionValues();

        var antigenSelectionPanel = Ext.create('Connector.panel.AntigenSelection', {
            plotAxis: this.plotAxis,
            dimension: advancedOptionCmp.dimension,
            selectorMeasure: selectorMeasure,
            initSelection: advancedOptionCmp.value,
            measureSetStore: this.measureSetStore,
            filterOptionValues: this.getFilterValuesMap(advancedOptionCmp.dimension)
        });

        // add listener with buffer for checkbox selection change to update advanced option cmp value
        antigenSelectionPanel.on('selectionchange', function(value, allChecked) {
            advancedOptionCmp.setValue(value, allChecked);
        }, this, {buffer: 100});

        this.getHierarchySelectionPane().add(antigenSelectionPanel);

        this.toggleDisplay('hierarchy');

        this.setHeaderData({
            title: this.headerTitle,
            navText: source.get('queryName'),
            sectionTitle: this.activeMeasure.get('label'),
            action: this.hierarchicalSelectionDone,
            showCount: false
        });
    },

    hierarchicalSelectionDone : function() {
        this.getHierarchySelectionPane().getEl().slideOut('r', {
            duration: 250,
            callback: function() {
                this.updateSelectorPane();
            },
            scope: this
        });
    },

    toggleRemoveVariableButton : function(show) {
        this.getButton('remove-link').setVisible(show);
    },

    toggleDisplay : function(type) {
        if (this.advancedPane) {
            this.advancedPane.hide();
        }

        this.getLoaderPane().hide();

        this.getSourcePane().setVisible(type == 'source');
        this.getMeasurePane().setVisible(type == 'measure');
        this.getHierarchySelectionPane().setVisible(type == 'hierarchy');

        // cancel button visible on source pane if single select
        this.getButton('cancel-button').setVisible(type == 'source' && !this.multiSelect);

        // select button visible on measure pane or on source pane if multi select
        this.getButton('select-button').setVisible(type == 'measure' || (type == 'source' && this.multiSelect));

        // done button only visible on hierarchical selection pane
        this.getButton('done-button').setVisible(type == 'hierarchy');

        // cancel link is on both the measure and hierarchical selection pane or on source pane if multi select
        this.getButton('cancel-link').setVisible(type == 'measure' || type == 'hierarchy' || (type == 'source' && this.multiSelect));
    },

    getAdvancedPane : function() {
        if (!this.advancedPane) {
            this.advancedPane = Ext.create('Ext.form.Panel', {
                border: false,
                frame: false,
                height: 220,
                maxHeight: Connector.panel.Selector.maximumHeight / 2,
                autoScroll: true,
                hidden: true,
                cls: 'advanced'
            });

            this.insert(this.items.length-2, this.advancedPane);
        }

        return this.advancedPane;
    },

    getAdvancedOptionValues : function() {
        var dimensionFieldHidden = {},
            values;

        if (this.disableAdvancedOptions) {
            return null;
        }

        // track which of the assay dimension advanced option fields are hidden so we don't return them as part of the values object
        Ext.each(this.advancedOptionCmps, function(advancedOptionItem)
        {
            dimensionFieldHidden[advancedOptionItem.getHiddenField().name] = advancedOptionItem.hidden && !advancedOptionItem.includeOptionValue;
        });

        values = this.getAdvancedPane().getValues(false /*asString*/, false /*dirtyOnly*/, false /*includeEmptyText*/, true /*useDataValues*/);

        // move the dimension selections into a separate map to keep them separate
        values.dimensions = {};
        Ext.iterate(values, function(alias, val) {
            if (this.boundDimensionAliases.indexOf(alias) != -1) {
                if (!dimensionFieldHidden[alias])
                {
                    values.dimensions[alias] = val;
                }

                // remove the dimension alias/value from the parent object so we just leave
                // the non-dimension properties (i.e. visit tag alignment and scale info)
                delete values[alias];
            }
        }, this);

        return values;
    },

    getFilterValuesMap : function(selectedDimension) {
        var optionMap = {}, alias, filterOptionValues = this.getAdvancedOptionValues();

        if (Ext.isObject(filterOptionValues) && Ext.isObject(filterOptionValues.dimensions)) {
            Ext.iterate(filterOptionValues.dimensions, function(alias, val) {
                if (alias != selectedDimension.getFilterMeasure().get('alias') && val != null) {
                    optionMap[alias] = val;
                }
            }, this);
        }

        return optionMap;
    },

    bindDimensions : function() {
        var measureSetAliases = [], measureSet = [],
                alias, advancedOptionCmp;

        this.advancedOptionCmps = [];
        var config = this.sourceMeasureFilter;

        Ext.each(this.getDimensionsForMeasure(this.activeMeasure), function(dimension) {
            if (dimension.get("hiddenInPlot") && !dimension.get("isLinePlotGroupingField"))
                return;

            if (Ext.isFunction(config.userFilter) && !config.userFilter(dimension.data, true))
                return;

            alias = dimension.getFilterMeasure().get('alias');
            this.boundDimensionAliases.push(alias);

            advancedOptionCmp = this.createAdvancedOptionCmp(alias, dimension);
            this.advancedOptionCmps.push(advancedOptionCmp);

            // keep track of the distinct set of measures used for all advanced options in this source
            Ext.each(advancedOptionCmp.getMeasureSet(), function(measure) {
                // hierarchical dimensions can have use an alternate column for filtering
                var m = measure.getFilterMeasure();
                if (measureSetAliases.indexOf(m.get('alias')) === -1) {
                    measureSetAliases.push(m.get('alias'));
                    measureSet.push(m);
                }

                // add measures the current measure depends on
                var dependencyMeasures = measure.getPlotDependencyMeasures();
                if (Ext.isArray(dependencyMeasures)) {
                    Ext.each(dependencyMeasures, function(dependencyMeasure) {
                        if (measureSetAliases.indexOf(dependencyMeasure.get('alias')) === -1) {
                            measureSetAliases.push(dependencyMeasure.get('alias'));
                            measureSet.push(dependencyMeasure);
                        }
                    })
                }
                // also add the measure alias itself
                if (measureSetAliases.indexOf(measure.get('alias')) === -1) {
                    measureSetAliases.push(measure.get('alias'));
                    measureSet.push(measure);
                }
            }, this);
        }, this);

        if (measureSet.length > 0) {
            // query for the distinct set of values across all of the measures involved in the dimension set
            this.queryService.getMeasureSetDistinctValues(measureSet, function(data) {
                this.processMeasureSetDistinctValues(measureSet, data);
            }, this);
        }
        else {
            this.processMeasureSetDistinctValues(measureSet, []);
        }
    },

    processMeasureSetDistinctValues : function(measureSet, data) {
        var store = this.createMeasureSetStore(measureSet, data);

        this.insertDimensionHeader();

        // populate the store for each dimension option and add it to the panel
        // issue 23861: add them in the reverse order so that parent components can update children appropriately
        for (var i = this.advancedOptionCmps.length - 1; i >= 0; i--) {
            var advancedOption = this.advancedOptionCmps[i],
                dimension = advancedOption.dimension,
                alias = dimension.getFilterMeasure().get('alias'),
                storeFilter = dimension.getDistinctValueStoreFilter();

            // some measures use a filter on another column for its distinct values (i.e. data summary level filters)
            if (storeFilter != null) {
                store.filter(storeFilter);
            }

            advancedOption.populateStore(store.collect(alias), measureSet);
            store.clearFilter(true);

            this.getAdvancedPane().insert(1, advancedOption);
        }

        this.bindAdditionalOptions();
    },

    insertDimensionHeader : function() {
        this.getAdvancedPane().insert(0, {
            xtype: 'box',
            cls: 'dimension-header',
            html: this.boundDimensionAliases.length > 0 ? 'Assay Dimensions' : 'Advanced Options'
        });
    },

    createMeasureSetStore : function(measureSet, data) {
        var fields = [], sorters = [];

        Ext.each(measureSet, function(measure) {
            sorters.push({property: measure.get('alias')});
            fields.push({name: measure.get('alias'), convert: function(val) {
                return Ext.isObject(val) ? val.value : val;
            }});
        });

        this.measureSetStore = Ext.create('Ext.data.Store', {
            measureSet: measureSet,
            fields: fields,
            sorters: sorters,
            data: data
        });

        return this.measureSetStore;
    },

    bindAdditionalOptions : function() {
        this.bindTimeOptions();
        this.bindScale();

        this.slideAdvancedOptionsPane();
    },

    createAdvancedOptionCmp : function(alias, dimension) {
        return Ext.create('Connector.component.AdvancedOptionDimension', {
            testCls: this.testCls + '-option-' + dimension.get('name'),
            dimension: dimension,
            value: this.initOptions && this.initOptions.dimensions ? this.initOptions.dimensions[alias] : undefined,
            listeners: {
                scope: this,
                click: function(cmp, isHierarchical) {
                    if (isHierarchical) {
                        if (this.advancedPane) {
                            this.advancedPane.hide();
                        }

                        var me = this;
                        this.measurePane.getEl().slideOut('l', {
                            duration: 250,
                            callback: function() {
                                me.showHierarchicalSelection(cmp);
                            }
                        });
                    }
                    else
                    {
                        var selectedMeasure = Ext.clone(this.activeMeasure.data);
                        selectedMeasure.options = this.getAdvancedOptionValues();

                        cmp.showDropdownPanel(this.getFilterValuesMap(dimension), selectedMeasure, this.plotAxis);
                    }
                },
                change: function(cmp) {
                    // hide/show any conditional components based on their distinctValueFilterColumnAlias and distinctValueFilterColumnValue
                    // example: hide/show related advanced option cmps for the data summary level based on the selected level value
                    var conditionalCmps = this.query('advancedoptiondimension[distinctValueFilterColumnAlias=' + cmp.dimension.get('alias') + ']');
                    Ext.each(conditionalCmps, function(conditionalCmp) {
                        var match = conditionalCmp.dimension.get('distinctValueFilterColumnValue') == cmp.value.join(', ');
                        conditionalCmp.setVisible(match);

                        // issue 23862: clear selected values for the cmp being hidden
                        if (!match) {
                            conditionalCmp.clearValue();
                        }
                    });
                }
            }
        });
    },

    bindScale : function() {
        if (this.activeMeasure.shouldShowScale()) {
            this.getAdvancedPane().add(
                Ext.create('Connector.component.AdvancedOptionScale', {
                    testCls: this.testCls + '-option-scale',
                    measure: this.activeMeasure,
                    value: this.initOptions ? this.initOptions['scale'] : undefined
                })
            );
        }
    },

    bindTimeOptions : function() {
        if (this.activeMeasure.get('variableType') === 'TIME') {

            var initPlotType = this.initOptions ? this.initOptions['timePlotType'] : null;
            if (initPlotType && initPlotType.indexOf('box') > -1 && this.activeMeasure.get('isHoursType'))
                initPlotType = null;

            if (!initPlotType) {
                if (this.activeMeasure.get('isHoursType') || ((this.activeYMeasure && this.activeYMeasure.defaultPlotType === 'line')))
                    initPlotType = 'line';
                else
                    initPlotType = 'scatter';
            }

            this.getAdvancedPane().add(
                    Ext.create('Connector.component.AdvancedOptionTimePlotType', {
                        measure: this.activeMeasure,
                        value: initPlotType ,
                        isHoursType: this.activeMeasure.get('isHoursType')
                    })
            );

            this.getAdvancedPane().add(
                    Ext.create('Connector.component.AdvancedOptionTimeAlignedBy', {
                        measure: this.activeMeasure,
                        value: this.initOptions ? this.initOptions['alignmentVisitTag'] : undefined,
                        hidden: this.activeMeasure.get('isHoursType'),
                        allowTimeAlignment: !this.activeYMeasure || (this.activeYMeasure.allowTimeAlignment)
                    })
            );
        }
    },

    configureAdvancedOptions : function() {

        if (!this.disableAdvancedOptions && this.activeMeasure)
        {
            this.getAdvancedPane().removeAll();
            this.bindDimensions();

            this.initialized = true;
        }
    },

    slideAdvancedOptionsPane : function() {
        // slide in our out the panel depending on if we have options to show or not
        // note: items.length is always at least 1 from header text..."Advanced Options"
        var pane = this.getAdvancedPane();
        if (pane.items.items.length > 1)
        {
            pane.setHeight(this.getAdvancedPaneHeight(pane.items));
            if (pane.isHidden())
            {
                pane.show();
                pane.getEl().slideIn('b', {
                    duration: 250,
                    scope: this,
                    callback: this.shouldGoToAntigenSelection
                });
            }
        }
        else if (!pane.isHidden())
        {
            pane.getEl().slideOut('b', {
                duration: 250,
                callback: function() {
                    pane.hide();
                }
            });
        }
    },

    getDimensionsForMeasure : function(measure) {
        // check if a allow list of dimensions was declared for the measure or its source
        if (!measure.get('isMeasure')) {
            return [];
        }

        var dimensions = measure.get('dimensions'),
            source = this.getSourceForMeasure(measure),
            measureIsDimension = false;

        if (dimensions == undefined && source) {
            dimensions = source.get('dimensions');
        }

        if (Ext.isArray(dimensions))
        {
            var newDimensions = [];
            Ext.each(dimensions, function(dim) {
                // the array of dimensions will, by default, be a list of column aliases
                if (typeof dim == "string")
                {
                    var _dim = this.queryService.getMeasureRecordByAlias(dim);
                    if (_dim) {
                        newDimensions.push(_dim);

                        if (measure.get('alias') == dim) {
                            measureIsDimension = true;
                        }
                    }
                }
            }, this);
            dimensions = newDimensions;
        }

        // Issue 24211: Do not display dimension in advanced options if it is the currently selected axis
        if (measureIsDimension) {
            return [];
        }

        return dimensions;
    },

    getHeader : function() {
        if (!this.headerPanel) {
            var initialData = {
                title: this.headerTitle,
                showCount: false
            };

            var tpl = new Ext.XTemplate(
                '<div class="main-title">{title:htmlEncode}</div>',
                '<div class="sub-title">',
                    '<tpl if="action">',
                        '<span class="nav-text back-action">',
                            '<span class="arrow">&nbsp;</span>',
                            '<span>{navText:htmlEncode}</span>',
                        '</span>',
                    '<tpl else>',
                        '<span class="nav-text">{navText:htmlEncode}</span>',
                    '</tpl>',
                    '<span class="section-title">{sectionTitle:htmlEncode}</span>',
                    '<tpl if="showCount">',
                        '<span class="subject-count">Subject count</span>',
                    '</tpl>',
                '</div>'
            );

            this.headerPanel = Ext.create('Ext.Component', {
                cls: 'header',
                tpl: tpl,
                data: initialData,
                listeners: {
                    afterrender: {
                        fn: function(header) {
                            this.bindHeader(header, this.headerData ? this.headerData : initialData);
                        },
                        scope: this,
                        single: true
                    }
                }
            });
        }

        return this.headerPanel;
    },

    bindHeader : function(header, data) {
        if (header && header.getEl() && data) {
            if (Ext.isFunction(data.action)) {
                var backActionEl = Ext.DomQuery.select('.back-action', header.getEl().id);
                if (backActionEl.length > 0) {
                    Ext.get(backActionEl[0]).on('click', data.action, this);
                }
            }
        }
    },

    setHeaderData : function(data) {
        this.headerData = data;
        this.getHeader().update(data);
        this.bindHeader(this.getHeader(), data);
    },

    getFooter : function() {
        if (!this.footerPanel) {
            this.footerPanel = Ext.create('Ext.panel.Panel', {
                bodyCls: 'footer',
                border: false,
                layout: {
                    type: 'hbox',
                    pack: 'end'
                },
                items: [{
                    itemId: 'remove-link',
                    xtype: 'button',
                    ui: 'rounded-inverted-accent-text-2',
                    hidden: true,
                    text: 'Remove variable',
                    handler: function() {
                        this.fireEvent('remove');
                    },
                    scope: this
                },{
                    itemId: 'cancel-link',
                    xtype: 'button',
                    ui: 'rounded-inverted-accent-text-2',
                    hidden: true,
                    text: 'Cancel',
                    handler: function() {
                        this.fireEvent('cancel');
                    },
                    scope: this
                },{
                    itemId: 'cancel-button',
                    xtype: 'button',
                    text: 'Cancel',
                    handler: function() {
                        this.fireEvent('cancel');
                    },
                    scope: this
                },{
                    itemId: 'done-button',
                    xtype: 'button',
                    text: 'Done',
                    handler: this.hierarchicalSelectionDone,
                    scope: this
                },{
                    itemId: 'select-button',
                    xtype: 'button',
                    disabled: !this.multiSelect,
                    hidden: true,
                    text: Ext.isDefined(this.selectButtonTitle) ? this.selectButtonTitle : 'Set ' + this.headerTitle,
                    handler: this.makeSelection,
                    scope: this,
                    listeners: {
                        show: function(btn) {
                            if (!this.multiSelect) {
                                btn.setDisabled(!Ext.isDefined(this.activeMeasure));
                            }
                        },
                        scope: this
                    }
                }]
            });
        }

        return this.footerPanel;
    },

    getButton : function(id) {
        return this.getFooter().getComponent(id);
    },

    makeSelection : function() {
        if (!this.multiSelect && Ext.isDefined(this.activeMeasure)) {
            var selectedMeasure = Ext.clone(this.activeMeasure.data);
            selectedMeasure.options = this.getAdvancedOptionValues();

            this.fireEvent('selectionmade', selectedMeasure);
        }
        else if (this.multiSelect) {
            this.fireEvent('selectionmade', this.getSelectedRecords());
        }
    },

    /**
     * This is used onSelect/Deselect to determine what measures are required to be
     * selected based on the currently selected measures.
     * @param selModel
     * @param measure
     * @returns {Array}
     */
    manageRequiredMeasures : function(selModel, measure) {

        if (measure.get('isDimension')) {
            return [];
        }

        var selectedNonRequired = false,
            selections = selModel.getSelection();

        for (var i=0; i < selections.length; i++) {
            if (selections[i].get('recommendedVariableGrouper') !== '1_AssayRequired') {
                selectedNonRequired = true;
                break;
            }
        }

        // sadly, store.query() does not respect filters
        var requiredMeasures = [];
        Ext.each(this.measureStore.getRange(), function(record) {
            if (record.get('recommendedVariableGrouper') === '1_AssayRequired') {
                requiredMeasures.push(record);
            }
        });

        if (selectedNonRequired) {
            selModel.select(requiredMeasures, true /* keepExisting */, true /* suppressEvents */);
        }
        else {
            selModel.deselect(requiredMeasures, true /* suppressEvents */);
        }

        return requiredMeasures;
    },

    onMeasureSelect : function(selModel, measure) {

        if (this.multiSelect) {

            var requiredRecords = this.manageRequiredMeasures(selModel, measure);

            Ext.each([measure].concat(requiredRecords), function(record) {
                if (this.getRecordIndex(this.getSelectedRecords(), record) == -1) {
                    this.selectedMeasures.push(record);
                }
            }, this);
        }
        else {
            // issue 23866: Persisted advanced option selections when changing variables within the same source
            if (this.initialized) {
                this.initOptions = this.getAdvancedOptionValues();
            }

            this.activeMeasure = measure;
            this.configureAdvancedOptions();
            this.getButton('select-button').enable();
        }
    },

    deselectMeasure : function(selModel, measure) {
        if (this.multiSelect) {
            var requiredRecords = this.manageRequiredMeasures(selModel, measure);

            Ext.each([measure].concat(requiredRecords), function(record) {
                var index = this.getRecordIndex(this.getSelectedRecords(), record);
                if (index > -1) {
                    this.selectedMeasures.splice(index, 1);
                }
            }, this);
        }
    },

    getRecordIndex : function(measureArr, measure) {
        for (var i = 0; i < measureArr.length; i++) {
            if (measureArr[i].get('alias') == measure.get('alias')) {
                return i;
            }
        }

        return -1;
    },

    getSelectedRecords : function() {
        return this.selectedMeasures;
    },

    setSelectedMeasures : function(aliases) {
        // Issue 24112: reset selected measures each time selector window is opened so 'cancel' works
        this.selectedMeasures = [];
        Ext.each(aliases, function(alias) {
            var record = this.queryService.getMeasureRecordByAlias(alias, 'parent');
            this.selectedMeasures.push(record);
        }, this);
    },

    getLockedRecords : function() {
        return this.lockedMeasures;
    },

    setLockedMeasures : function(aliases) {
        // track the lockedMeasures array so they show up in Current/Session columns for the grid column chooser
        this.lockedMeasures = [];
        Ext.each(aliases, function(alias) {
            var record = this.queryService.getMeasureRecordByAlias(alias, 'parent');
            this.lockedMeasures.push(record);
        }, this);
    }
});