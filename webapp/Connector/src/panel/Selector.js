/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.Selector', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.newselector',

    border: false,

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

        this.sourcesStore = Ext.create('Ext.data.Store', {
            model: 'Connector.model.Source'
        });
        this.measureStore = Ext.create('Ext.data.Store', {
            model: 'Connector.model.Measure'
        });

        this.items = [
            this.initHeader(),
            {
                itemId: 'loader',
                border: false,
                flex: 1
            },
            this.initFooter()
        ];

        this.callParent();

        this.loadSourcesAndMeasures();
    },

    loadSourcesAndMeasures : function() {
        Connector.getService('Query').onQueryReady(function(queryService) {

            var data = queryService.getMeasuresStoreData(this.sourceMeasureFilter);

            this.sourcesStore.loadRawData(data.sources);
            this.measureStore.loadRawData(data.measures);

            this.loadSourceCounts();

            if (this.activeMeasure) {
                // find the source for the active measure
                var sourceKey = this.activeMeasure.get('schemaName') + '|' + this.activeMeasure.get('queryName');
                var source = this.sourcesStore.getById(sourceKey);
                if (source) {
                    this.activeMeasure = this.measureStore.getById(this.activeMeasure.get('alias'));
                    this.showMeasures(source, this.activeMeasure);
                }
                else {
                    this.showSources();
                    console.warn('Unable to find source \'' + sourceKey + '\'. Might not work for the applied \'sourceMeasureFilter\'');
                }
            }
            else {
                this.showSources();
            }

        }, this);
    },

    loadSourceCounts : function() {

        var sources = this.sourcesStore.getRange();
        Connector.getService('Query').getSourceCounts(sources, function(s, counts) {
            Ext.each(sources, function(source) {
                var count = counts[source.get('queryName')];
                if (Ext.isDefined(count)) {
                    source.set('subjectCount', count);
                }
            });
        }, this, this.memberCountsFn, this.memberCountsFnScope);
    },

    showSources : function() {
        if (!this.sourcePane) {
            this.sourcePane = Ext.create('Ext.view.View', {
                border: false,
                hidden: true,
                flex: 1,
                itemSelector: 'div.source-item',
                store: this.sourcesStore,
                tpl: new Ext.XTemplate(
                    '<div style="margin: 16px 64px 16px 64px;">',
                        '<tpl for=".">' +
                            '<div class="source-item" style="{subjectCount:this.greyMe}">',
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
                    '</div>',
                    {
                        commaFormat : function(v) {
                            return Ext.util.Format.number(v, '0,000');
                        },
                        greyMe : function(v) {
                            if (v == -1)
                                return '';
                            return v > 0 ? '' : 'color: #CCC8C8;';
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
                            duration: 200,
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

            this.insert(this.items.length-2, this.sourcePane);
        }

        this.getComponent('loader').hide();
        this.sourcePane.show();
        this.setHeaderData({
            title: this.headerTitle,
            navText: 'Sources',
            showCount: true
        });
        this.getSelectButton().hide();
    },

    /**
     * @param source
     * @param [activeMeasure]
     */
    showMeasures : function(source, activeMeasure) {

        if (!this.measurePane) {
            this.measurePane = Ext.create('Ext.view.View', {
                border: false,
                hidden: true,
                flex: 1,
                itemSelector: 'div.source-item',
                selectedItemCls: 'source-selected',
                style: 'overflow-y: auto;',
                store: this.measureStore,
                tpl: new Ext.XTemplate(
                    '<div style="margin: 16px 64px 16px 64px;">',
                        '<tpl for=".">' +
                            '<div class="source-item" style="{sourceCount:this.greyMe}">',
                                '<span>{label:htmlEncode}</span>',
                                '<tpl if="sourceCount != undefined">',
                                    '<span style="float: right;">{sourceCount:this.commaFormat}</span>',
                                '</tpl>',
                            '</div>',
                        '</tpl>',
                    '</div>',
                    {
                        commaFormat : function(v) {
                            return Ext.util.Format.number(v, '0,000');
                        },
                        greyMe : function(v) {
                            if (!Ext.isDefined(v))
                                return '';
                            return v > 0 ? '' : 'color: #CCC8C8;';
                        }
                    }
                ),
                listeners: {
                    afterrender: function() {
                        //this.sourcePane.getEl().fadeIn();
                    },
                    select: function(selModel, measure) {
                        this.setActiveMeasure(measure);
                    },
                    scope: this
                }
            });

            this.insert(this.items.length-2, this.measurePane);
        }

        var key = source.get('key');
        this.measureStore.filterBy(function(measure) {
            return key == (measure.get('schemaName') + '|' + measure.get('queryName'));
        });

        var me = this;

        this.getComponent('loader').hide();
        this.measurePane.show();
        this.setHeaderData({
            title: this.headerTitle,
            navText: 'Sources',
            showSectionTitle: true,
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
        this.getSelectButton().show();

        if (activeMeasure) {
            Ext.defer(function() {
                this.measurePane.getSelectionModel().select(activeMeasure, true);
            }, 500, this);
        }
    },

    configureAdvancedOptions : function() {

        if (!this.advancedPane) {

            Ext.define('AdvancedPane', {
                extend: 'Ext.Component',

                bindDimensions : function(dimensions) {
                    this.update({
                        dims: dimensions
                    });
                }
            });

            this.advancedPane = new AdvancedPane({
                border: false,
                frame: false,
                flex: 1,
                hidden: true,
                baseCls: 'selector-advanced',
                tpl: [
                    '<div style="margin: 16px 64px 16px 64px;">',
                        '<table style="width: 100%;">',
                            '<tpl for="dims">',
                                '<tpl if="data.hidden != true">',
                                    //'<li>{data.name:htmlEncode} ({data.alias:htmlEncode})</li>',
                                    // TODO: Make these sub-templates
                                    '<tr style="margin-bottom: 5px;">',
                                        '<td style="color: #666363;">{data.label:htmlEncode}:</td>',
                                        '<td width="85%;" style="margin-bottom: 5px;">',
                                            '<div style="background-color: #F0F0F0; padding: 6px 16px; border-radius: 20px;">Value</div>',
                                        '</td>',
                                    '</tr>',
                                '</tpl>',
                            '</tpl>',
                        '</table>',
                    '</div>'
                ],
                data: {}
            });

            this.insert(this.items.length-2, this.advancedPane);
        }

        if (this.activeMeasure) {
            var dims = this.activeMeasure.get('dimensions');
            var ms = Connector.getService('Query').MEASURE_STORE;

            // check if a white-list of dimensions was declared
            if (Ext.isArray(dims)) {
                var newDims = [], _dim;
                Ext.each(dims, function(alias) {
                    _dim = ms.getById(alias);
                    if (_dim && _dim.get('isDimension') === true) {
                        newDims.push(_dim);
                    }
                });
                dims = newDims;
            }
            else {
                dims = ms.queryBy(function(m) {
                    return m.get('isDimension') === true && m.get('queryName') === this.activeMeasure.get('queryName');
                }, this).getRange();
            }

            this.advancedPane.bindDimensions(dims);
            this.advancedPane.show();
        }
    },

    initHeader : function() {

        var initialData = {
            title: this.headerTitle,
            showCount: false
        };

        return {
            itemId: 'selector-header',
            xtype: 'box',
            height: 80,
            tpl: new Ext.XTemplate(
                '<div style="margin: 16px 72px;">',
                    '<div><span style="font-size: 16px; color: #A09C9C; font-family: Georgia, serif;">{title:htmlEncode}</span></div>',
                    '<div style="margin-top: 10px;">',
                        '<tpl if="action">',
                            '<span class="back-action">',
                                '<span style="position: absolute; left: 40px; bottom: 16px; font-size: 24px;">&larr;</span>',
                                '<span>{navText:htmlEncode}</span>',
                            '</span>',
                        '<tpl else>',
                            '<span style="font-size: 12px; font-weight: bold; color: #303030; font-family: Arial, sans-serif;">{navText:htmlEncode}</span>',
                        '</tpl>',
                        '<tpl if="showSectionTitle">',
                            '<h1 style="float: right; margin-top: -12px;">{sectionTitle:htmlEncode}</h1>',
                        '</tpl>',
                        '<tpl if="showCount">',
                            '<span style="float: right;">Subject count</span>',
                        '</tpl>',
                    '</div>',
                '</div>'
            ),
            data: initialData,
            listeners: {
                afterrender: {
                    fn: function(header) {
                        if (this.headerData) {
                            this.bindHeader(header, this.headerData);
                        }
                        else {
                            this.bindHeader(header, initialData);
                        }
                    },
                    scope: this,
                    single: true
                }
            },
            style: 'background-color: #f0f0f0;'
        };
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
        var h = this.getComponent('selector-header');
        h.update(data);
        this.bindHeader(h, data);
    },

    initFooter : function() {
        return {
            itemId: 'selector-footer',
            height: 60,
            bodyCls: 'selector-footer',
            border: false,
            layout: {
                type: 'hbox',
                pack: 'end'
            },
            items: [{
                xtype: 'button',
                ui: 'rounded-inverted-accent-text',
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
        };
    },

    getSelectButton : function() {
        return this.getComponent('selector-footer').getComponent('select-button');
    },

    makeSelection : function() {
        if (Ext.isDefined(this.activeMeasure)) {
            var selectedMeasure = Ext.clone(this.activeMeasure.data);
            selectedMeasure.options = {};
            this.fireEvent('selectionmade', selectedMeasure);
        }
    },

    setActiveMeasure : function(measure) {
        this.activeMeasure = measure;
        this.getSelectButton().enable();

        this.configureAdvancedOptions();
    }
});