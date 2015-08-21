/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.Feedback', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.feedback',

    cls: 'feedback',

   // border: false,

    statics: {
        displayWindow : function(animateTarget) {
            var win = Ext.create('Ext.window.Window', {
                ui: 'axiswindow',
                border: true,
                modal: true,
                draggable: false,
                header: false,
                layout: {
                    type: 'fit'
                },
                items: [{
                    xtype: 'feedback',
                    listeners: {
                        hide: function() {
                            win.hide(animateTarget);
                        },
                        scope: this
                    }
                }],
                width: 300,
                height: 500
            });

            win.show(animateTarget);
        }
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

    getSourcePane : function() {
        if (!this.sourcePane) {
            this.sourcePane = Ext.create('Ext.panel.Panel', {
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
                )
            });
        }

        return this.sourcePane;
    },

    initComponent : function() {
        this.items = [
            this.getHeader(),
            {html: 'hello'},
            this.getFooter()
            // TODO: Create Header,
            // TODO: Create Form,
            // TODO: Create Footer,
        ];
        this.callParent();
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

    getHeader : function() {
        if (!this.headerPanel) {
            var initialData = {
                title: this.headerTitle,
                showCount: false,
                border: true
            };

            var tpl = new Ext.XTemplate(
                    '<div class="main-title">Provide Feedbeck</div>',
                    '<div class="sub-title">',
                    '<span>Give us feedback on what we could improve</span>',
                    '</div>'
            );
            this.headerPanel = Ext.create('Ext.panel.Panel', {
                cls: 'header',
                border: true,
                tpl: tpl,
                data: initialData,
                listeners: {
                    click: function(evt, el) {
                        console.log('we clicked here!');
                    },
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

    getFooter : function() {
        XX = this;
        if (!this.footerPanel) {
            this.footerPanel = Ext.create('Ext.panel.Panel', {
                bodyCls: 'footer',
                border: true,
                layout: {
                    type: 'hbox',
                    pack: 'end'
                },
                items: [{
                    itemId: 'cancel-link',
                    xtype: 'button',
                    ui: 'rounded-inverted-accent-text',
                    hidden: false,
                    text: 'Cancel',
                    listeners: {
                        click: function(evt, el) {
                            XX.hide();
                        },
                        element: 'el',
                        scope: this
                    },
                    handler: function() {
                        this.fireEvent('cancel');
                    },
                    scope: this
                },{
                    itemId: 'done-button',
                    xtype: 'button',
                    text: 'Done',
                    listeners: {
                        click: function(evt, el) {
                            XX.hide();
                        },
                        element: 'el',
                        scope: this
                    },
                    scope: this
                }]
            });
        }

        return this.footerPanel;
    }
});