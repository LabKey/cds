/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.Selector', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.newselector',

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

    sourceMeasureFilter: undefined,

    memberCountsFn: undefined,
    memberCountsFnScope: undefined,

    testCls: undefined,

    disableAdvancedOptions: false,
    boundDimensionNames: [],
    measureSetStore: null,

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

        this.sourcesStore = Ext.create('Ext.data.Store', {
            model: 'Connector.model.Source',
            sorters: [
                {
                    property: 'category',
                    transform: function(value) {
                        return value || ' ';
                    }
                },
                {property: 'queryLabel'}
            ]
        });
        this.measureStore = Ext.create('Ext.data.Store', {
            model: 'Connector.model.Measure',
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
            return record.get('queryName') != 'SubjectGroupMap';
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
                    select: function(selModel, source) {
                        var view = selModel.view;
                        var me = this;

                        me.hideLearnMessage('Source');

                        view.getEl().slideOut('l', {
                            duration: 250,
                            callback: function() {
                                //hide learn message called twice because of a timing bug with automated tests
                                me.hideLearnMessage('Source');
                                me.showMeasures(source);
                                selModel.clearSelections();
                            }
                        });
                    },
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

    showSources : function() {
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
            this.measurePane = Ext.create('Ext.view.View', {
                border: false,
                hidden: true,
                flex: 1,
                autoScroll: true,
                cls: 'content',
                itemSelector: 'div.content-item',
                selectedItemCls: 'content-selected',
                store: this.measureStore,
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
                ),
                listeners: {
                    select: function(selModel, measure) {
                        // issue 23866: Persisted advanced option selections when changing variables within the same source
                        if (this.initialized) {
                            this.initOptions = this.getAdvancedOptionValues();
                        }

                        this.selectMeasure(measure);
                    },
                    itemmouseenter: function(view, record, item) {
                        this.showLearnMessage(item, record.get('label'), record.get('description'), 'Measure');
                    },
                    itemmouseleave: function() {
                        this.hideLearnMessage('Measure');
                    },
                    scope: this
                }
            });

            this.insert(this.items.length - 2, this.measurePane);
        }

        return this.measurePane;
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

        var key = source.get('key');
        this.measureStore.filterBy(function(measure) {
            return key == (measure.get('schemaName') + '|' + measure.get('queryName'));
        });

        this.toggleDisplay('measure');

        var me = this;
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
                        me.initialized = false;
                        me.initOptions = undefined;
                        me.getMeasurePane().getSelectionModel().deselectAll();

                        me.showSources();
                    }
                });
            },
            showCount: false
        });

        var selModel = this.getMeasurePane().getSelectionModel();
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

        var hierSelectionPanel = Ext.create('Connector.panel.AntigenSelection', {
            dimension: advancedOptionCmp.dimension,
            initSelection: advancedOptionCmp.value,
            measureSetStore: this.measureSetStore
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

        // source pane with cancel button
        this.getSourcePane().setVisible(type == 'source');
        this.getButton('cancel-button').setVisible(type == 'source');

        // measure pane with select button
        this.getMeasurePane().setVisible(type == 'measure');
        this.getButton('select-button').setVisible(type == 'measure');

        // hierarchical selection pane with done button
        this.getHierarchySelectionPane().setVisible(type == 'hierarchy');
        this.getButton('done-button').setVisible(type == 'hierarchy');

        // and finally, the cancel link is on both the measure and hierarchical selection pane
        this.getButton('cancel-link').setVisible(type == 'measure' || type == 'hierarchy');
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
        var advancedOptionCmps = [], combinedMeasureSet = {aliases: [], measures: []};

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
                    combinedMeasureSet.measures.push({measure: m});
                }

                // also add the measure alias itself
                if (combinedMeasureSet.aliases.indexOf(measure.get('alias')) == -1) {
                    combinedMeasureSet.aliases.push(measure.get('alias'));
                    combinedMeasureSet.measures.push({measure: measure});
                }
            }, this);
        }, this);

        // get the cube subjectList so that we can filter the advanced option values accordingly
        ChartUtils.getSubjectsIn(function(subjectList) {
            var subjectMeausre;
            if (subjectList != null) {
                subjectMeausre = new LABKEY.Query.Visualization.Measure({
                    schemaName: this.activeMeasure.get('schemaName'),
                    queryName: this.activeMeasure.get('queryName'),
                    name: Connector.studyContext.subjectColumn,
                    values: subjectList
                });
            }

            if (combinedMeasureSet.measures.length > 0) {
                // get the relevent application filters to add to the measure set
                var filterMeasures = this.queryService.getWhereFilterMeasures(Connector.getState().getFilters());
                Ext.each(filterMeasures, function(filterMeasure) {
                    var index = combinedMeasureSet.aliases.indexOf(filterMeasure.measure.alias);
                    // if we already have this measure in our set, then just tack on the filterArray
                    if (index > -1) {
                        combinedMeasureSet.measures[index].filterArray = filterMeasure.filterArray;
                    }
                    else {
                        combinedMeasureSet.aliases.push(filterMeasure.measure.alias);
                        combinedMeasureSet.measures.push({
                            filterArray: filterMeasure.filterArray,
                            measure: this.queryService.getMeasureRecordByAlias(filterMeasure.measure.alias)
                        });
                    }
                }, this);

                // query for the distinct set of values across all of the measures involved in the dimension set
                this.queryService.getMeasureSetDistinctRows(combinedMeasureSet.measures, subjectMeausre, function(data) {
                    this.processMeasureSetDistinctRows(advancedOptionCmps, combinedMeasureSet.aliases, data);
                }, this);
            }
            else {
                this.processMeasureSetDistinctRows(advancedOptionCmps, combinedMeasureSet.aliases, []);
            }
        }, this);
    },

    processMeasureSetDistinctRows : function(advancedOptionCmps, measureAliases, data) {
        var store = this.createCombinedMeasureSetStore(measureAliases, data);

        this.insertDimensionHeader();

        // populate the store for each dimension option and add it to the panel
        // issue 23861: add them in the reverse order so that parent components can update children appropriately
        for (var i = advancedOptionCmps.length - 1; i >= 0; i--) {
            var advancedOption = advancedOptionCmps[i],
                dimension = advancedOption.dimension,
                alias = dimension.getFilterMeasure().get('alias');

            // some measures use a filter on another column for its distinct values (i.e. data summary level filters)
            if (dimension.get('distinctValueFilterColumnAlias') && dimension.get('distinctValueFilterColumnValue')) {
                store.filter({
                    property: dimension.get('distinctValueFilterColumnAlias'),
                    value: dimension.get('distinctValueFilterColumnValue'),
                    exactMatch: true
                });
            }

            advancedOption.populateStore(store.collect(alias));
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

    createCombinedMeasureSetStore : function(measureAliases, data) {
        var fields = [], sorters = [];
        Ext.each(measureAliases, function(alias) {
            sorters.push({property: alias});
            fields.push({name: alias, convert: function(val) {
                return Ext.isObject(val) ? val.value : val;
            }});
        });

        this.measureSetStore = Ext.create('Ext.data.Store', {
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
                    disabled: true,
                    hidden: true,
                    text: 'Set ' + this.headerTitle,
                    handler: this.makeSelection,
                    scope: this,
                    listeners: {
                        show: function(btn) {
                            btn.setDisabled(!Ext.isDefined(this.activeMeasure));
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
        if (Ext.isDefined(this.activeMeasure)) {
            var selectedMeasure = Ext.clone(this.activeMeasure.data);
            selectedMeasure.options = this.getAdvancedOptionValues();

            this.fireEvent('selectionmade', selectedMeasure);
        }
    },

    selectMeasure : function(measure) {
        this.activeMeasure = measure;

        this.getButton('select-button').enable();

        this.configureAdvancedOptions();
    }
});