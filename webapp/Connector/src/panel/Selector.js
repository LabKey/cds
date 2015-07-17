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

    // track the first time that the selector is initialized so we can use initOptions properly
    initialized: false,

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
        // since setting the active measure comes from external callers, grab the initOptions and reset the
        // initialized bit to treat it like a new selector
        this.initOptions = Ext.isObject(measure) ? Ext.clone(measure.options) : undefined;
        this.initialized = false;

        this.activeMeasure = this.ensureMeasureModel(measure);

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

                        view.getEl().slideOut('l', {
                            duration: 250,
                            callback: function() {
                                me.showMeasures(source);
                                selModel.clearSelections();
                            }
                        });
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
                        this.selectMeasure(measure);
                    },
                    scope: this
                }
            });

            this.insert(this.items.length - 2, this.measurePane);
        }

        return this.measurePane;
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
                        me.showSources();
                    }
                });
            },
            showCount: false
        });

        var selModel = this.getMeasurePane().getSelectionModel();
        if (selModel.hasSelection() && selModel.getLastSelected() === activeMeasure) {
            // already have selected measure, just need to show the advanced options pane
            this.slideAdvancedOptionsPane();
        }
        else if (activeMeasure) {
            Ext.defer(function() { selModel.select(activeMeasure); }, 500, this);
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
        var values = this.getAdvancedPane().getValues(false /*asString*/, false /*dirtyOnly*/, false /*includeEmptyText*/, true /*useDataValues*/);

        // move the dimension selections into a separate map to keep them separate
        values.dimensions = {};
        Ext.iterate(values, function(key, val) {
            if (this.boundDimensionNames.indexOf(key) != -1) {
                // null or undefined mean "select all" so don't apply a filter
                if (Ext.isDefined(val) && val != null) {
                    values.dimensions[key] = val;
                }

                delete values[key];
            }
        }, this);

        return values;
    },

    bindDimensions : function() {
        var dimensions = this.getDimensionsForMeasure(this.activeMeasure);
        this.boundDimensionNames = [];

        Ext.each(dimensions, function(dimension) {
            // hierarchical dimensions can have use an alternate column for filtering
            var dimensionName = dimension.get('name');
            if (Ext.isDefined(dimension.get('hierarchicalFilterColumnName'))) {
                dimensionName = dimension.get('hierarchicalFilterColumnName');
            }

            this.boundDimensionNames.push(dimensionName);

            this.getAdvancedPane().add(
                Ext.create('Connector.component.AdvancedOptionDimension', {
                    testCls: this.testCls + '-option-' + dimension.get('name'),
                    dimension: dimension,
                    value: this.initOptions && this.initOptions.dimensions ? this.initOptions.dimensions[dimensionName] : undefined,
                    listeners: {
                        scope: this,
                        click: function(cmp, isHierarchical) {
                            if (isHierarchical) {
                                var me = this;
                                if (me.advancedPane) {
                                    me.advancedPane.hide();
                                }

                                me.measurePane.getEl().slideOut('l', {
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
                                conditionalCmp.setVisible(conditionalCmp.dimension.get('distinctValueFilterColumnValue') == cmp.value.join(', '));
                            });
                        }
                    }
                })
            );
        }, this);

        this.getAdvancedPane().insert(0, {
            xtype: 'box',
            cls: 'dimension-header',
            html: this.boundDimensionNames.length > 0 ? 'Assay Dimensions' : 'Advanced Options'
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

        if (this.activeMeasure)
        {
            this.getAdvancedPane().removeAll();

            this.bindDimensions();
            this.bindTimeOptions();
            this.bindScale();

            this.slideAdvancedOptionsPane();

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
        else
        {
            // TODO: if no dimensions array on measure or source, should we default to 'isDimension' columns in the source?
            //dimensions = this.queryService.MEASURE_STORE.queryBy(function(m) {
            //    return m.get('isDimension') === true && m.get('queryName') === this.activeMeasure.get('queryName');
            //}, this).getRange();
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

        // clear the initOptions if we have already initialized the selector
        if (this.initialized) {
            this.initOptions = undefined;
        }

        this.getButton('select-button').enable();

        this.configureAdvancedOptions();
    }
});