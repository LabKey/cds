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

    sourceMeasureFilter: {
        queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS,
        measuresOnly: true,
        includeHidden: this.canShowHidden
    },

    constructor : function(config) {
        this.callParent([config]);

        this.addEvents('cancel', 'select');

        //<style type="text/css">
        //.selector-footer {
        //    background-color: #f0f0f0;
        //    padding: 16px 72px;
        //}
        //
        //.source-item {
        //    height: 25px;
        //    padding: 7px 8px 0 8px;
        //    font-family: Arial, sans-serif;
        //}
        //
        //.source-item:hover {
        //    background-color: #A0EAEB;
        //    cursor: pointer;
        //}
        //
        //.source-selected,
        //.source-selected:hover {
        //    background-color: #14C9CC;
        //    color: #FFFFFF;
        //}
        //
        //.back-action {
        //    color: #9B1497;
        //    font-family: Arial, sans-serif;
        //    font-size: 12px;
        //    font-weight: bold;
        //}
        //
        //.back-action:hover {
        //    cursor: pointer;
        //}
        //</style>
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

            this.showSources();

        }, this);
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
                            duration: 400,
                            callback: function() {
                                view.hide();
                                me.showMeasures(source);
                            }
                        });
                    },
                    scope: this
                }
            });

            this.insert(1, this.sourcePane);
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

    showMeasures : function(source) {

        if (!this.measurePane) {
            this.measurePane = Ext.create('Ext.view.View', {
                border: false,
                hidden: true,
                flex: 1,
                itemSelector: 'div.source-item',
                selectedItemCls: 'source-selected',
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

            this.insert(1, this.measurePane);
        }

        var key = source.get('key');
        this.measureStore.filterBy(function(measure) {
            return key == (measure.get('schemaName') + '|' + measure.get('queryName'));
        });

        var me = this;

        this.measurePane.show();
        this.setHeaderData({
            title: this.headerTitle,
            navText: 'Sources',
            action: function() {
                me.measurePane.getEl().slideOut('r', {
                    duration: 400,
                    callback: function() {
                        me.measurePane.hide();
                        me.showSources();
                    }
                });
            },
            showCount: false
        });
        this.getSelectButton().show();
    },

    showDimensions : function(/* TBD */) {},

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
                        this.bindHeader(header, initialData);
                    },
                    scope: this,
                    single: true
                }
            },
            style: 'background-color: #f0f0f0;'
        };
    },

    bindHeader : function(header, data) {
        if (header && data) {
            if (Ext.isFunction(data.action)) {
                var backActionEl = Ext.DomQuery.select('.back-action', header.getEl().id);
                if (backActionEl.length > 0) {
                    Ext.get(backActionEl[0]).on('click', data.action);
                }
            }
        }
    },

    setHeaderData : function(data) {
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
    },

    setActiveMeasure : function(measure) {
        this.activeMeasure = measure;
        this.getSelectButton().enable();
    }
});