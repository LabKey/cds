/*
 * Copyright (c) 2015 LabKey Corporation
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

    memberCountsFn: undefined,
    memberCountsFnScope: undefined,

    multiSelect: false,
    selectedMeasures: undefined,
    supportSelectionGroup: false,
    supportSessionGroup: false,

    testCls: undefined,

    disableAdvancedOptions: false,
    boundDimensionNames: undefined,

    // track the first time that the selector is initialized so we can use initOptions properly
    initialized: false,
    initOptions: undefined,

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

        this.callParent([config]);

        this.addEvents('remove', 'cancel', 'selectionmade', 'beforeSourceCountsLoad', 'afterSourceCountsLoad');
    },

    initComponent : function() {
        this.queryService = Connector.getService('Query');
        this.boundDimensionNames = [];
        this.selectedMeasures = [];

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
                {property: 'queryLabel'}
            ]
        });

        this.measureStore = Ext.create('Ext.data.Store', {
            model: 'Connector.model.Measure',
            groupField: 'recommendedVariableGrouper',
            sorters: [
                {property: 'queryLabel'},
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
            blockingMask: false,
            itemsMaskCls: 'item-spinner-mask-orange',
            beginConfig: {
                component: this,
                events: ['beforeSourceCountsLoad']
            },
            endConfig: {
                component: this,
                events: ['afterSourceCountsLoad']
            }
        });
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

        var data = this.queryService.getMeasuresStoreData(this.sourceMeasureFilter);
        if (this.supportSelectionGroup && this.multiSelect) {
            data.sources.push({
                sortOrder: -100,
                schemaName: '_current',
                name: '',
                queryName: null,
                queryLabel: 'Current columns',
                variableType: 'SELECTION'
            });
        }

        if (this.supportSessionGroup && this.multiSelect) {
            data.sources.push({
                sortOrder: -99,
                schemaName: '_session',
                name: '',
                queryName: null,
                queryLabel: 'All variables from this session',
                variableType: 'SESSION'
            });
        }

        this.sourcesStore.loadRawData(data.sources);
        this.measureStore.loadRawData(data.measures);

        if (this.activeMeasure) {
            this.activeMeasure = this.measureStore.getById(this.activeMeasure.get('alias'));
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

    clearSelection : function () {
        this.setActiveMeasure(null);
    },

    getSourceForMeasure : function(measure) {
        var source = null;
        if (measure)
        {
            var sourceKey = measure.get('schemaName') + '|' + measure.get('queryName');
            source = this.sourcesStore.getById(sourceKey);

            if (source == null) {
                console.warn('Unable to find source \'' + sourceKey + '\'. Might not work for the applied \'sourceMeasureFilter\'');
            }
        }

        return source;
    },

    loadSourceCounts : function() {
        this.fireEvent('beforeSourceCountsLoad', this);

        // TODO: cache these source counts to use between selectors and invalidate the cache on filter/selection change
        // TODO: add subject counts for 'User groups' (see DataspaceVisualizationProvider.getSourceCountSql)
        var sources = this.sourcesStore.queryBy(function(record) {
            return record.get('queryName') != null && record.get('queryName') != 'SubjectGroupMap';
        }).items;

        this.queryService.getSourceCounts(sources, function(s, counts) {
            Ext.each(sources, function(source) {
                var count = counts[source.get('queryName')];
                if (Ext.isDefined(count)) {
                    source.set('subjectCount', count);
                }
            });

            this.fireEvent('afterSourceCountsLoad', this);
        }, this, this.memberCountsFn, this.memberCountsFnScope);
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
                            '<tpl if="category == \'Assays\'">',
                                '<div class="content-label">{queryName:htmlEncode}&nbsp;({queryLabel:htmlEncode})</div>',
                            '<tpl else>',
                                '<div class="content-label">{queryLabel:htmlEncode}</div>',
                            '</tpl>',
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
                        },
                        showLabel : function(queryLabel, longLabel) {
                            return longLabel && longLabel.length > 0 && (queryLabel != longLabel);
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

        //clears any filter before the source is selected
        this.measureStore.clearFilter();

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
                this.groupingFeature = this.getMeasureSelectionGrid().view.getFeature('measuresGridGrouping');
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
                    this.showLearnMessage(item, record.get('label'), record.get('description'), 'Measure');
                },
                itemmouseleave: function() {
                    this.hideLearnMessage('Measure');
                },
                scope: this
            }
        };
    },

    getMeasureSelectionGrid : function() {
        var config = Ext.apply(this.getBaseMeasureSelectionConfig(), {
            cls : 'content-multiselect',
            enableColumnResize: false,
            enableColumnHide: false,
            bubbleEvents : ['viewready'],
            viewConfig : { stripeRows : false },
            multiSelect: true,
            selType: 'checkboxmodel',
            selModel: {
                mode: 'SIMPLE'
            },
            columns: [{
                cls: 'content-header',
                header: 'Select all columns',
                dataIndex: 'label',
                flex: 1,
                sortable: false,
                menuDisabled: true
            }],
            //adds the grouping feature onto the panel
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
                            if (value === '0') {
                                hdr = 'Recommended';
                            }
                            else if (value === '1') {
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
                        '<div class="content-label">{label:htmlEncode}</div>',
                    '</div>',
                '</tpl>'
            )
        });

        return Ext.create('Ext.view.View', config);
    },

    showLearnMessage : function(item, title, description, name) {
        if (description) {
            //truncate description to roughly 4 rows and ensures that a word isn't being cut off.
            var charLimit = 95;
            if (description.length > charLimit) {
               description = description.substring(0, charLimit + 1);
               description = description.substring(0, description.lastIndexOf(' ')) + '...';
            }

            var calloutMgr = hopscotch.getCalloutManager(),
                _id = Ext.id(),
                displayTooltip = setTimeout(function() {
                    calloutMgr.createCallout({
                        id: _id,
                        bubbleWidth: 160,
                        yOffset: -15,
                        xOffset: 50,
                        showCloseButton: false,
                        target: item,
                        placement: 'right',
                        title: title,
                        content: description
                    });
                }, 400);
            this.on('hide' + name + 'LearnMsg', function() {
                clearTimeout(displayTooltip);
                calloutMgr.removeCallout(_id);
            }, this);
        }
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
            filter, aliases = {}, selModel,
            me = this;

        //checks whether the current selection is the current column
        if (variableType === 'SELECTION') {
            Ext.each(this.getSelectedRecords(), function(measure) {
                if (Ext.isDefined(measure.get('alias'))) {
                    //adds the selected measure to the current visible measures
                    aliases[measure.get('alias')] = true;

                    // TODO: should this be moved to happen in all cases of showMeasures?
                    if (this.measureStore.findExact('alias', measure.get('alias')) > -1) {
                        this.getMeasureSelectionGrid().getSelectionModel().select(measure, true, true);
                    }

                }
            }, this);

            filter = function(measure) {
                return measure.get('alias') in aliases;
            };
        }
        else if (variableType === 'SESSION') {
            Ext.iterate(Connector.getState().getSessionColumns(), function(alias, measureData) {
                if (Ext.isDefined(alias)) {
                    aliases[alias] = true;
                }
            }, this);

            filter = function(measure) {
                return measure.get('alias') in aliases;
            };
        }
        else {
            filter = function(measure) {
                return key == (measure.get('schemaName') + '|' + measure.get('queryName'));
            };
        }

        //filters results by the filters applied above
        this.measureStore.filterBy(filter);

        this.toggleDisplay('measure');

        this.setHeaderData({
            title: this.headerTitle,
            navText: 'Sources',
            sectionTitle: this.getSourceTitle(source, false),
            action: function() {
                if (me.advancedPane) {
                    me.advancedPane.hide();
                }

                me.measurePane.getEl().slideOut('r', {
                    duration: 250,
                    callback: function() {
                        // clear the initOptions and deselect (issue 23845) any measure for the source we are leaving
                        if (!me.multiSelect) {
                            me.initialized = false;
                            me.initOptions = undefined;
                            me.getMeasurePane().getSelectionModel().deselectAll();
                        }

                        me.showSources();
                    }
                });
            },
            showCount: false
        });

        //gets the current model if multiselect isn't active
        selModel = this.getMeasurePane().getSelectionModel();
        if (!this.multiSelect) {
            if (activeMeasure) {
                if (selModel.hasSelection() && selModel.getLastSelected().id === activeMeasure.id) {
                    // already have selected measure, just need to show the advanced options pane
                    this.slideAdvancedOptionsPane();
                }
                else {
                    Ext.defer(function() { selModel.select(activeMeasure); }, 500, this);
                }
            }
            else {
                // default to selecting the first variable for the given source
                Ext.defer(function() { selModel.select(0); }, 100, this);
            }
        }
        else if (Ext.isDefined(this.groupingFeature)) {
            // for the 'Current Columns' source, we group the measures by the query source
            // otherwise, we group measures into the Recommended or Additional groupings
            if (variableType == 'SELECTION' || variableType == 'SESSION') {
                this.groupingFeature.enable();
                this.measureStore.groupers.first().property = 'queryLabel';
                this.measureStore.group();
                this.measureStore.sort('queryLabel', 'ASC');
            }
            else {
                // enable or disable the measure grid grouping feature based on the presence of a recommended variable
                if (this.measureStore.find('isRecommendedVariable', true) > -1) {
                    this.groupingFeature.enable();
                }
                else {
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

    showHierarchicalSelection : function(advancedOptionCmp) {
        var source = this.getSourceForMeasure(this.activeMeasure);

        this.getHierarchySelectionPane().removeAll();

        var hierSelectionPanel = Ext.create('Connector.panel.HierarchicalSelectionPanel', {
            dimension: advancedOptionCmp.dimension,
            initSelection: advancedOptionCmp.value
        });

        // add listener with buffer for checkbox selection change to update advanced option cmp value
        hierSelectionPanel.on('selectionchange', function(value, allChecked) {
            advancedOptionCmp.setValue(value, allChecked);
        }, this, {buffer: 100});

        this.getHierarchySelectionPane().add(hierSelectionPanel);

        this.toggleDisplay('hierarchy');

        var me = this;
        this.setHeaderData({
            title: this.headerTitle,
            navText: this.getSourceTitle(source, true),
            sectionTitle: this.activeMeasure.get('label'),
            action: function() { me.hierarchicalSelectionDone(); },
            showCount: false
        });
    },

    hierarchicalSelectionDone : function() {
        var me = this;
        this.getHierarchySelectionPane().getEl().slideOut('r', {
            duration: 250,
            callback: function() {
                me.updateSelectorPane();
            }
        });
    },

    getSourceTitle : function(source, abbr) {
        var title = source.get('queryLabel');

        if (abbr) {
            title = source.get('queryName');
        }
        else if (source.get('category') == 'Assays') {
            title = source.get('queryName') + ' (' + title + ')';
        }

        return title;
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
                autoScroll: true,
                hidden: true,
                cls: 'advanced'
            });

            this.insert(this.items.length-2, this.advancedPane);
        }

        return this.advancedPane;
    },

    getAdvancedOptionValues : function() {
        if (this.disableAdvancedOptions) {
            return null;
        }

        var values = this.getAdvancedPane().getValues(false /*asString*/, false /*dirtyOnly*/, false /*includeEmptyText*/, true /*useDataValues*/);

        // move the dimension selections into a separate map to keep them separate
        values.dimensions = {};
        Ext.iterate(values, function(key, val) {
            if (this.boundDimensionNames.indexOf(key) != -1) {
                values.dimensions[key] = val;

                // remove the dimension key/value from the parent object so we just leave
                // the non-dimension properties (i.e. visit tag alignment and scale info)
                delete values[key];
            }
        }, this);

        return values;
    },

    bindDimensions : function() {
        var advancedOptionCmps = [], combinedMeasureSet = {aliases: [], values: []};

        Ext.each(this.getDimensionsForMeasure(this.activeMeasure), function(dimension) {

            var dimensionName = dimension.getFilterMeasure().get('name');
            this.boundDimensionNames.push(dimensionName);

            var advancedOptionCmp = this.createAdvancedOptionCmp(dimensionName, dimension);
            advancedOptionCmps.push(advancedOptionCmp);

            // keep track of the distinct set of measures used for all advanced options in this source
            Ext.each(advancedOptionCmp.getMeasureSet(), function(measure) {
                // hierarchical dimensions can have use an alternate column for filtering
                var m = measure.getFilterMeasure();
                if (combinedMeasureSet.aliases.indexOf(m.get('alias')) == -1) {
                    combinedMeasureSet.aliases.push(m.get('alias'));
                    combinedMeasureSet.values.push(m);
                }

                // also add the measure alias itself
                if (combinedMeasureSet.aliases.indexOf(measure.get('alias')) == -1) {
                    combinedMeasureSet.aliases.push(measure.get('alias'));
                    combinedMeasureSet.values.push(measure);
                }
            }, this);
        }, this);

        if (combinedMeasureSet.values.length > 0) {
            // query for the distinct set of values across all of the measures involved in the dimension set
            Connector.getService('Query').getMeasureSetDistinctValues(combinedMeasureSet.values, false, function(data) {
                this.processMeasureSetDistintValues(advancedOptionCmps, combinedMeasureSet.values, data);
            }, this);
        }
        else {
            this.processMeasureSetDistintValues(advancedOptionCmps, combinedMeasureSet.values, []);
        }
    },

    processMeasureSetDistintValues : function(advancedOptionCmps, combinedMeasureSet, data) {
        var store = this.getCombinedMeasureSetStore(combinedMeasureSet, data);

        this.insertDimensionHeader();

        // populate the store for each dimension option and add it to the panel
        // issue 23861: add them in the reverse order so that parent components can update children appropriately
        for (var i = advancedOptionCmps.length - 1; i >= 0; i--) {
            var advancedOption = advancedOptionCmps[i],
                dimension = advancedOption.dimension,
                name = dimension.getFilterMeasure().get('name');

            // some measures use a filter on another column for its distinct values (i.e. data summary level filters)
            if (dimension.get('distinctValueFilterColumnName') && dimension.get('distinctValueFilterColumnValue')) {
                store.filter({
                    property: dimension.get('distinctValueFilterColumnName'),
                    value: dimension.get('distinctValueFilterColumnValue'),
                    exactMatch: true
                });
            }

            advancedOption.populateStore(store.collect(name));
            store.clearFilter(true);

            this.getAdvancedPane().insert(1, advancedOption);
        }

        this.bindAdditionalOptions();
    },

    insertDimensionHeader : function() {
        this.getAdvancedPane().insert(0, {
            xtype: 'box',
            cls: 'dimension-header',
            html: this.boundDimensionNames.length > 0 ? 'Assay Dimensions' : 'Advanced Options'
        });
    },

    getCombinedMeasureSetStore : function(measureSet, data) {
        var fieldNames = Ext.Array.pluck(Ext.Array.pluck(measureSet, 'data'), 'name');

        return Ext.create('Ext.data.Store', {
            fields: fieldNames,
            data: data
        });
    },

    bindAdditionalOptions : function() {
        this.bindTimeOptions();
        this.bindScale();

        this.slideAdvancedOptionsPane();
    },

    createAdvancedOptionCmp : function(dimensionName, dimension) {
        return Ext.create('Connector.component.AdvancedOptionDimension', {
            testCls: this.testCls + '-option-' + dimension.get('name'),
            dimension: dimension,
            value: this.initOptions && this.initOptions.dimensions ? this.initOptions.dimensions[dimensionName] : undefined,
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
                },
                change: function(cmp) {
                    // hide/show any conditional components based on their distinctValueFilterColumnName and distinctValueFilterColumnValue
                    // example: hide/show related advanced option cmps for the data summary level based on the selected level value
                    var conditionalCmps = this.query('advancedoptiondimension[distinctValueFilterColumnName=' + cmp.dimension.get('name') + ']');
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
        if (this.activeMeasure.get('variableType') == 'TIME')
        {
            //this.getAdvancedPane().add(
            //    Ext.create('Connector.component.AdvancedOptionTime', {
            //        measure: this.activeMeasure,
            //        fieldName: 'visitType',
            //        fieldLabel: 'Visit type',
            //        singleUseOnly: false
            //    })
            //);

            this.getAdvancedPane().add(
                Ext.create('Connector.component.AdvancedOptionTime', {
                    measure: this.activeMeasure,
                    fieldName: 'alignmentVisitTag',
                    fieldLabel: 'Aligned by',
                    singleUseOnly: true,
                    value: this.initOptions ? this.initOptions['alignmentVisitTag'] : undefined
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
            if (pane.isHidden())
            {
                pane.show();
                pane.getEl().slideIn('b', {
                    duration: 250
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
        // check if a white-list of dimensions was declared for the measure or its source
        var dimensions = measure.get('dimensions');
        var source = this.getSourceForMeasure(measure);
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
                    }
                }
            }, this);
            dimensions = newDimensions;
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
                    Ext.get(backActionEl[0]).on('click', data.action);
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
                    ui: 'rounded-inverted-accent-text',
                    hidden: true,
                    text: 'Remove variable',
                    handler: function() {
                        this.fireEvent('remove');
                    },
                    scope: this
                },{
                    itemId: 'cancel-link',
                    xtype: 'button',
                    ui: 'rounded-inverted-accent-text',
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
                    handler: function() {
                        this.hierarchicalSelectionDone();
                    },
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

    onMeasureSelect : function(selectionCmp, measure) {
        if (!this.multiSelect) {
            // issue 23866: Persisted advanced option selections when changing variables within the same source
            if (this.initialized) {
                this.initOptions = this.getAdvancedOptionValues();
            }

            this.activeMeasure = measure;
            this.configureAdvancedOptions();
            this.getButton('select-button').enable();
        }
        else {
            if (this.getSelectedRecordIndex(measure) == -1) {
                this.selectedMeasures.push(measure);
            }
        }
    },

    deselectMeasure : function(selectionCmp, measure) {
        if (this.multiSelect) {
            var index = this.getSelectedRecordIndex(measure);
            if (index > -1) {
                this.selectedMeasures.splice(index, 1);
            }
        }
    },

    getSelectedRecords : function() {
        return this.selectedMeasures;
    },

    getSelectedRecordIndex : function(measure) {
        for (var i = 0; i < this.getSelectedRecords().length; i++) {
            if (this.getSelectedRecords()[i].get('alias') == measure.get('alias')) {
                return i;
            }
        }

        return -1;
    }
});