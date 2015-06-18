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

    constructor : function(config) {

        if (!Ext.isObject(config.sourceMeasureFilter)) {
            throw this.$className + ' requires a \'sourceMeasureFilter\' configuration.';
        }

        if (Ext.isObject(config.activeMeasure)) {
            if (config.activeMeasure.$className !== 'Connector.model.Measure') {
                config.activeMeasure = Ext.create('Connector.model.Measure', config.activeMeasure);
            }
        }

        this.callParent([config]);

        this.addEvents('cancel', 'selectionmade');
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

        this.items = [
            this.getHeader(),
            this.getLoaderPane(),
            this.getFooter()
        ];

        this.callParent();

        this.queryService.onQueryReady(function() {
            this.loadSourcesAndMeasures();
        }, this);
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

        this.loadSourceCounts();

        if (this.activeMeasure) {
            this.activeMeasure = this.measureStore.getById(this.activeMeasure.get('alias'));
        }

        var source = this.getSourceForMeasure(this.activeMeasure);
        if (source) {
            this.showMeasures(source, this.activeMeasure);
        }
        else {
            this.showSources();
        }
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

        var sources = this.sourcesStore.getRange();
        this.queryService.getSourceCounts(sources, function(s, counts) {
            Ext.each(sources, function(source) {
                var count = counts[source.get('queryName')];
                if (Ext.isDefined(count)) {
                    source.set('subjectCount', count);
                }
            });
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
                        '<tpl if="category != null && parent[xindex-2] && parent[xindex-2].category != category">',
                           '<div class="content-category">{category:htmlEncode}</div>',
                        '</tpl>',
                        '<div class="content-item {subjectCount:this.greyMe}">',
                            '<span>{queryLabel:htmlEncode}',
                                '<tpl if="this.showLabel(queryLabel, longLabel)">',
                                    '&nbsp;({longLabel:htmlEncode})',
                                '</tpl>',
                            '</span>',
                            '<tpl if="subjectCount != -1">',
                                '<span style="float: right;">{subjectCount:this.commaFormat}</span>',
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
                    afterrender: function() {
                        //this.sourcePane.getEl().fadeIn();
                    },
                    select: function(selModel, source) {
                        var view = selModel.view;
                        var me = this;

                        view.getEl().slideOut('l', {
                            duration: 250,
                            callback: function() {
                                view.hide();
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
        this.getLoaderPane().hide();
        this.getSourcePane().show();

        this.setHeaderData({
            title: this.headerTitle,
            navText: 'Sources',
            showCount: true
        });

        this.getButton('cancel-link').hide();
        this.getButton('cancel-button').show();
        this.getButton('select-button').hide();
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
                        '<div class="content-item {sourceCount:this.greyMe}">',
                            '<span>{label:htmlEncode}</span>',
                            '<tpl if="sourceCount != undefined">',
                                '<span style="float: right;">{sourceCount:this.commaFormat}</span>',
                            '</tpl>',
                        '</div>',
                    '</tpl>',
                    {
                        commaFormat : function(v) {
                            return Ext.util.Format.number(v, '0,000');
                        },
                        greyMe : function(v) {
                            if (!Ext.isDefined(v) || v > 0)
                                return '';
                            return 'look-disabled';
                        }
                    }
                ),
                listeners: {
                    afterrender: function() {
                        //this.measurePane.getEl().fadeIn();
                    },
                    select: function(selModel, measure) {
                        this.setActiveMeasure(measure);
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
     * @param [activeMeasure]
     */
    showMeasures : function(source, activeMeasure) {

        var key = source.get('key');
        this.measureStore.filterBy(function(measure) {
            return key == (measure.get('schemaName') + '|' + measure.get('queryName'));
        });

        this.getLoaderPane().hide();
        this.getMeasurePane().show();

        var me = this;
        this.setHeaderData({
            title: this.headerTitle,
            navText: 'Sources',
            sectionTitle: source.get('queryLabel') || source.get('queryName'),
            action: function() {
                if (me.advancedPane) {
                    me.advancedPane.hide();
                }
                me.measurePane.getEl().slideOut('r', {
                    duration: 250,
                    callback: function() {
                        me.measurePane.hide();
                        me.showSources();
                    }
                });
            },
            showCount: false
        });

        this.getButton('cancel-link').show();
        this.getButton('cancel-button').hide();
        this.getButton('select-button').show();

        if (activeMeasure) {
            Ext.defer(function() {
                this.getMeasurePane().getSelectionModel().select(activeMeasure, true);
            }, 500, this);
        }
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

    bindDimensions : function(dimensions) {
        Ext.each(dimensions, function(dimension){
            if (!dimension.get('hidden')) {
                this.getAdvancedPane().add(
                    Ext.create('Connector.component.AdvancedOptionDimension', {
                        dimension: dimension
                    })
                );
            }
        }, this);
    },

    bindScale : function() {
        if (this.activeMeasure.shouldShowScale()) {
            this.getAdvancedPane().add(
                Ext.create('Connector.component.AdvancedOptionScale', {
                    measure: this.activeMeasure
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
                    singleUseOnly: true
                })
            );
        }
    },

    configureAdvancedOptions : function() {

        if (this.activeMeasure)
        {
            this.getAdvancedPane().removeAll();

            var dimensions = this.getDimensionsForMeasure(this.activeMeasure);
            this.bindDimensions(dimensions);
            this.bindTimeOptions();
            this.bindScale();

            this.slideAdvancedOptionsPane(this.getAdvancedPane().items.items.length > 0);
        }
    },

    slideAdvancedOptionsPane : function(hasOptions) {
        // slide in our out the panel depending on if we have options to show or not
        var pane = this.getAdvancedPane();
        if (hasOptions)
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
            selectedMeasure.options = {};
            // this.getAdvancedPane().getValues(false, false, false, true /*useDataValues*/)
            this.fireEvent('selectionmade', selectedMeasure);
        }
    },

    setActiveMeasure : function(measure) {
        this.activeMeasure = measure;
        this.getButton('select-button').enable();

        this.configureAdvancedOptions();
    }
});