/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.SingleAxisExplorer', {

    extend: 'Ext.panel.Panel',

    requires: ['Connector.model.Explorer'],

    alias: 'widget.singleaxis',

    layout : {
        type: 'vbox',
        align: 'stretch'
    },

    width : '100%',

    dimViewHeight: 156,

    lowerBufferHeight: 200,

    showEmpty: true,

    initComponent : function() {

        this.items = [
            {
                xtype: 'container',
                height: this.dimViewHeight,
                cls: 'header-container',
                style: 'margin-bottom: 5px;',
                layout: {
                    type: 'vbox'
                },
                items: [{
                    xtype: 'actiontitle',
                    text: 'Find subjects'
                },{
                    xtype: 'explorerheaderdataview',
                    cls: 'dim-selector'
                },{
                    // This allows for the following items to be bottom aligned
                    xtype: 'box',
                    flex: 100,
                    autoEl: {
                        tag: 'div'
                    }
                },{
                    xtype: 'container',
                    ui: 'custom',
                    width: '100%',
                    layout: {
                        type: 'hbox'
                    },
                    items: [
                        {
                            id: 'sae-hierarchy-dropdown',
                            xtype: 'dropdown',
                            store: {
                                xtype: 'store',
                                model: 'Connector.model.Hierarchy'
                            },
                            valueField: 'name',
                            displayField: 'label',
                            comboConfig: {
                                name: 'sae-hierarchy',
                                width: 225
                            }
                        },
                        {
                            xtype: 'box',
                            autoEl: {
                                tag: 'div'
                            },
                            flex: 1
                        },
                        {
                            xtype: 'button',
                            margin: '9px 15px 0 0',
                            text: (this.showEmpty ? 'Hide empty' : 'Show empty'),
                            handler: this.onEmptySelection,
                            scope: this
                        },
                        {
                            xtype: 'box',
                            margin: '15px 30px 0 0',
                            autoEl: {
                                tag: 'div',
                                cls: 'label',
                                html: 'Number of Subjects'
                            }
                        }
                    ]
                }]
            },
            this.initExplorerView()
        ];

        this.callParent();
    },

    initExplorerView : function() {

        // Allows for scrollable Explorer view without compromising Ext layout.
        var resizeTask = new Ext.util.DelayedTask(function(p) {
            var id = 'single-axis-explorer';
            if (p) {
                id = p.getId();
            }
            var body = Ext.get(id + '-body');
            var box = body.up('.x-box-inner');
            body.setHeight(box.getBox().height - this.lowerBufferHeight);
            var container = Ext.get(id);
            container.setHeight(body.getBox().height);

            if (this.saview) {
                this.saview.resizeMessage();
            }
        }, this);

        return Ext.create('Ext.Panel', {
            ui    : 'custom',
            id    : 'single-axis-explorer',
            bodyStyle : 'overflow-y: auto;',
            cls : 'iScroll',
            items : [ this.getSingleAxisView(resizeTask) ],
            listeners : {
                afterlayout : function() {
                    var delay = (this.saview.animate ? 250 : 10);
                    this.saview.positionTask.delay(delay, null, null, [false]);
                },
                resize : function(p) {
                    resizeTask.delay(100, null, null, [p]);
                },
                scope : this
            },
            scope : this
        });

    },

    getSingleAxisView : function(task) {

        if (this.saview)
            return this.saview;

        var config = {
            cls: 'explorer-box',
            store: this.store,
            flex: 1,
            resizeTask: task,
            showEmpty: this.showEmpty
        };

        if (this.selections) {
            config.selections = this.selections;
        }

        this.saview = Ext.create('Connector.view.SingleAxisExplorerView', config);

        return this.saview;
    },

    onDimensionChange : function(dim, hierarchyIndex) {
        if (this.saview) {
            this.saview.setDimension(dim, hierarchyIndex);
        }
    },

    onEmptySelection : function(btn) {
        btn.setText(this.showEmpty ? 'show empty' : 'hide empty');
        this.showEmpty = this.saview ? this.saview.toggleEmpty() : this.showEmpty;
    },

    onHierarchyChange : function(hierarchyIndex) {
        if (this.saview) {
            this.saview.setHierarchy(hierarchyIndex);
        }
    },

    onSelectionChange : function(sel, isPrivate) {
        if (this.saview) {
            this.saview.selectionChange(sel, isPrivate);
        }
    },

    onFilterChange : function() {
        if (this.saview) {
            this.saview.filterChange();
        }
    },

    onViewChange : function(xtype) {
        if (xtype != 'singleaxis') {
            if (this.saview) {
                this.saview.hideMessage();
            }
        }
    }
});

Ext.define('Connector.view.ExplorerHeaderDataView', {

    extend: 'Ext.view.View',

    alias: 'widget.explorerheaderdataview',

    loadMask: false,

    itemSelector: 'h1.lhdv',

    selectedItemCls: 'active',

    tpl: new Ext.XTemplate(
        '<tpl for=".">',
            '<h1 class="lhdv">{label:htmlEncode}</h1>',
        '</tpl>'
    ),

    initComponent : function() {

        this._select = undefined; this._storeReady = false;
        this.store = Connector.getService('Summary').getSummaryStore();

        this.callParent();

        this.store.on('load', this.onStoreLoad, this, {single: true});

        if (this.store.getCount() == 0 && !this.store.isLoading()) {
            this.store.load();
        }
        else {
            this._storeReady = true;
        }
    },

    onStoreLoad : function(store) {
        this._storeReady = true;
        if (Ext.isDefined(this._select)) {
            this.changeSelection(this._select);
        }
    },

    changeSelection : function(dimName) {
        if (this._storeReady) {
            this._select = undefined;
            var idx = this.store.findExact('dimName', dimName);
            if (idx > -1) {
                this.getSelectionModel().select(this.store.getAt(idx), false, true);
            }
        }
        else {
            this._select = dimName;
        }
    }
});

Ext.define('Connector.view.SingleAxisExplorerView', {

    extend : 'LABKEY.app.view.OlapExplorer',

    alias : 'widget.singleaxisview',

    emptyText : '<div class="saeempty">None of the selected subjects have data for this category.</div>',

    btnclick: false,

    showmsg: true,

    msgfade: false,

    btnMap: {},

    statics: {
        _learnButton: undefined,
        _task: undefined,
        initButton : function(view) {
            if (!Ext.isDefined(Connector.view.SingleAxisExplorerView._learnButton)) {

                Connector.view.SingleAxisExplorerView._task = new Ext.util.DelayedTask(function() {
                    if (Connector.view.SingleAxisExplorerView._learnButton.OVER !== true) {
                        Connector.view.SingleAxisExplorerView._learnButton.hide();
                        Connector.view.SingleAxisExplorerView._learnButton.clear();
                    }
                }, this);

                Connector.view.SingleAxisExplorerView._learnButton = Ext.create('Connector.button.InfoButton', {
                    renderTo: Ext.getBody(),
                    text: '', //'learn about',
                    hidden: true,
                    style: 'z-index: 10000',
                    handler: function(e) {
                        this.btnclick = true;
                    },
                    listeners: {
                        click: function(b) {
                            var m = Ext.clone(Connector.view.SingleAxisExplorerView._learnButton.model.data);
                            Connector.view.SingleAxisExplorerView._learnButton.OVER = 'STOP';
                            Connector.view.SingleAxisExplorerView.detachButton();
                            view.fireEvent('learnclick', m);
                        },
                        mouseover: function() {
                            if (this.OVER !== 'STOP')
                                this.OVER = true;
                        },
                        mouseout: function() {
                            this.OVER = false;
                            Connector.view.SingleAxisExplorerView.detachButton();
                        }
                    },
                    scope: this
                });
            }

            view.on('itemmouseenter', Connector.view.SingleAxisExplorerView.attachButton);
            view.on('itemmouseleave', Connector.view.SingleAxisExplorerView.detachButton);
            Connector.getApplication().getController('Connector').on('afterchangeview', Connector.view.SingleAxisExplorerView.detachButton);
        },
        attachButton : function(view, model, element) {
            if (Connector.view.SingleAxisExplorerView._learnButton.OVER !== 'STOP') {
                Connector.view.SingleAxisExplorerView._task.cancel();
                var extEl = Ext.get(element);
                if (extEl) {
                    Connector.view.SingleAxisExplorerView.resolveDetail(model, function() {
                        Connector.view.SingleAxisExplorerView._learnButton.setModel(model);
                        var countEl = extEl.query('span.count');
                        if (Ext.isArray(countEl) && countEl.length > 0) {
                            var rect = countEl[0].getBoundingClientRect();
                            Connector.view.SingleAxisExplorerView._learnButton.setPosition(rect.right + 10, rect.bottom - 20).show();
                        }
                    }, this);
                }
            }
            else {
                Connector.view.SingleAxisExplorerView._learnButton.OVER = false;
            }
        },
        detachButton : function() {
            Connector.view.SingleAxisExplorerView._task.delay(300);
        },
        resolveDetail : function(model, success, scope) {
            if (model && model.data && model.data.levelUniqueName && Ext.isFunction(success)) {
                Connector.getState().onMDXReady(function (mdx) {
                    var lvl = mdx.getLevel(model.data.levelUniqueName);
                    if (lvl && lvl.hierarchy.dimension.supportsDetails === true) {
                        success.call(scope);
                    }
                });
            }
        }
    },

    initComponent : function() {

        this.callParent();

        this.on('refresh', function() { this.fireEvent('hideLoad', this); }, this);

//        Connector.view.SingleAxisExplorerView.initButton(this);

        // plugin to handle loading mask for the explorer
        this.addPlugin({
            ptype: 'loadingmask',
            beginConfig: {
                component: this,
                events: ['showLoad']
            },
            endConfig: {
                component: this,
                events: ['hideload']
            }
        });

        this.addPlugin({
            ptype: 'messaging',
            calculateY : function(cmp, box, msg) {
                return box.y - 10;
            }
        });
    },

    // This is a flag used to tell if a button has been pressed on the Explorer. Allows
    // for skipping of click events on individual bars.
    resetButtonClick : function() {
        this.btnclick = false;
    },

    loadStore : function() {
        this.callParent();
        this.fireEvent('showLoad', this);
    },

    onMaxCount : function(count) {
        this.callParent();
        this.fireEvent('hideLoad', this);

        // clean-up buttons
        Ext.iterate(this.btnMap, function(id, btn) {
            btn.destroy();
        }, this);
        this.btnMap = {};
    }
});
