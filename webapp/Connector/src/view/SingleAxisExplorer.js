/*
 * Copyright (c) 2014-2017 LabKey Corporation
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

    dimViewHeight: 180,

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
                            xtype: 'container',
                            margin: '15px 28px 0 0',
                            layout: {
                                type: 'vbox'
                            },
                            items :[{
                                xtype: 'button',
                                margin: '0 0 0 20px',
                                text: (this.showEmpty ? 'Hide empty' : 'Show empty'),
                                handler: this.onEmptySelection,
                                scope: this
                            },{
                                xtype: 'box',
                                margin: '9px 0 0 0',
                                autoEl: {
                                    tag: 'div',
                                    cls: 'label',
                                    html: 'Number of Subjects'
                                }
                            }]
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

        return Ext.create('Ext.panel.Panel', {
            ui    : 'custom',
            id    : 'single-axis-explorer',
            bodyStyle : 'overflow-y: auto;',
            cls : 'iScroll',
            items : [ this.getSingleAxisView(resizeTask) ],
            listeners : {
                afterlayout : function(p) {
                    var delay = (this.saview.animate ? 250 : 10);
                    this.saview.positionTask.delay(delay, null, null, [false]);
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
        btn.setText(this.showEmpty ? 'Show empty' : 'Hide empty');
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
        if (xtype !== 'singleaxis') {
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

        if (this.store.getCount() === 0 && !this.store.isLoading()) {
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

    extend : 'Ext.view.View',

    alias: 'widget.singleaxisview',

    altRequestDimNamedFilters: undefined,

    animate: true,

    barExpandHeight: 27,

    btnclick: false,

    barCls: 'bar',

    barLabelCls: 'barlabel',

    baseChartCls: 'barchart',

    baseGroupCls: 'bargroup',

    btnMap: {},

    emptyText: '<div class="saeempty">None of the selected subjects have data for this category.</div>',

    highlightItemCls: 'bar-highlight',

    itemSelector: 'div.bar',

    msgfade: false,

    multiSelect: true,

    selectedItemCls: 'bar-selected',

    showmsg: true,

    statics: {
        _learnButton: undefined,

        _task: undefined,

        APPLY_ANIMATE: false,

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

        resolveDetail : function(model, success, scope) {
            if (model && model.data && model.data.levelUniqueName && Ext.isFunction(success)) {
                Connector.getState().onMDXReady(function(mdx) {
                    var lvl = mdx.getLevel(model.data.levelUniqueName);
                    if (lvl && lvl.hierarchy.dimension.supportsDetails === true) {
                        success.call(scope);
                    }
                });
            }
        }
    },

    initComponent : function() {

        this.ordinal = LABKEY.devMode && Ext.isDefined(LABKEY.ActionURL.getParameter('ordinal'));

        this.initTemplate();

        this.loadTask = new Ext.util.DelayedTask(function() {
            if (Ext.isDefined(this.dimension)) {
                this.store.load(this.dimension, this.hierarchyIndex, this.selections, this.showEmpty, this.altRequestDimNamedFilters);
            }
        }, this);

        this.positionTask = new Ext.util.DelayedTask(this.positionText, this);
        this.groupClickTask = new Ext.util.DelayedTask(this.groupClick, this);
        this.refreshTask = new Ext.util.DelayedTask(this.onDelayedRefresh, this);
        this.selectionTask = new Ext.util.DelayedTask(this.selection, this);

        this.callParent();

        this.store.on('selectrequest', function() { this.selectRequest = true; }, this);

        this.on('refresh', function() {
            this.onRefresh();
            this.refreshTask.delay(600); // wait until the animations are finished
            this.fireEvent('hideLoad', this);
        }, this);

        this.store.on('subselect', this.highlightSelections, this);

        // plugin to handle loading mask for the explorer
        this.addPlugin({
            ptype: 'loadingmask',
            configs: [{
                element: this,
                beginEvent: 'showload',
                endEvent: 'hideload'
            }]
        });

        this.addPlugin({
            ptype: 'messaging',
            calculateY : function(cmp, box, msg) {
                return box.y - 10;
            }
        });
    },

    initTemplate : function() {

        var barTpl = this.getBarTemplate();
        var countTpl = this.getCountTemplate();

        //
        // This template is meant to be bound to a set of Connector.model.Explorer instances
        //
        this.tpl = new Ext.XTemplate(
            '<div class="', this.baseChartCls, '">',
            '<div class="', this.baseGroupCls, '">',
            '<tpl for=".">',
            '<tpl if="isGroup === true">',
            '<div class="saeparent">',
            '<tpl if="isLeafNode === true"><tpl else>',
            '<div class="saecollapse {#}-collapse" id="{#}-collapse">',
            '<p><tpl if="collapsed === true">+<tpl else>-</tpl></p>',
            '</div>',
            '</tpl>',
            '<div class="', this.barCls, ' large">',
            '<span class="', this.barLabelCls, '">{label:htmlEncode}',
            (this.ordinal ? '&nbsp;({ordinal:htmlEncode})' : ''),
            '</span>',
            '{[ this.renderCount(values) ]}',
            '{[ this.renderBars(values) ]}',
            '</div>',
            '</div>',
            '<tpl else>',
            '<div class="', this.barCls, ' small<tpl if="collapsed === true"> barcollapse</tpl>',
            '<tpl if="level.length &gt; 0"><tpl if="lvlDepth  &gt; 1"> saelevel{lvlDepth} </tpl> saelevel </tpl>">',
            '<span class="', this.barLabelCls, '">{label:htmlEncode}',
            (this.ordinal ? '&nbsp;({ordinal:htmlEncode})' : ''),
            '</span>',
            '{[ this.renderCount(values) ]}',
            '{[ this.renderBars(values) ]}',
            '</div>',
            '</tpl>',
            '</tpl>',
            '</div>',
            '</div>',
            {
                renderBars : function(values) {
                    return barTpl.apply(values);
                },
                renderCount : function(values) {
                    return countTpl.apply(values);
                }
            }
        );
    },

    addAnimations : function() {
        Connector.view.SingleAxisExplorerView.APPLY_ANIMATE = true;
    },

    filterChange : function() {
        this.loadStore();
    },

    getBarTemplate : function() {
        return new Ext.XTemplate(
            '<span class="{[ this.rowSelectedCls(values) ]} index {[ this.doAnimate() ]}" style="width: {[ this.calcWidth(values) ]}%"></span>',
            '<span class="{[ this.rowSelectedCls(values) ]} index-selected inactive {[ this.doAnimate() ]}" style="width: {[ this.calcSubWidth(values) ]}%"></span>',
            {
                doAnimate : function() {
                    return Connector.view.SingleAxisExplorerView.APPLY_ANIMATE === true ? 'animator' : '';
                },
                calcWidth : function(v) {
                    if (v.maxcount == 0) {
                        return 0;
                    }
                    return (v.count / v.maxcount) * 100;
                },
                rowSelectedCls : function(v) {
                    if (v.isSelected) {
                        return 'saelevel-selected';
                    }
                    return '';
                },
                calcSubWidth : function(v) {
                    if (v.maxcount == 0) {
                        return 0;
                    }
                    var ps = (v.subcount / v.count);
                    var pt = (v.count / v.maxcount);
                    var pts;

                    if (isNaN(ps)) {
                        pts = 0;
                    }
                    else if (ps >= 1) {
                        pts = pt;
                    }
                    else {
                        pts = ps*pt;
                    }
                    return pts * 100;
                }
            }
        );
    },

    getCountTemplate : function() {
        return new Ext.XTemplate('<span class="count">{count}</span>');
    },

    groupClick : function(rec) {
        var groups = this.store.getCustomGroups();
        var f = rec.get('level');

        if (Ext.isDefined(groups[f])) {
            this.toggleGroup(groups[f]);
            if (this.resizeTask) {
                this.resizeTask.delay(100);
            }
        }
    },

    highlightSelections : function() {
        if (!Ext.isEmpty(this.selections)) {
            var members, uniques = [];
            Ext.each(this.selections, function(sel) {

                // initialize members
                if (Ext.isFunction(sel.get)) {
                    members = sel.get('members');
                }
                else if (Ext.isArray(sel.arguments)) {
                    members = sel.arguments[0].membersQuery.members;
                }
                else {
                    members = sel.membersQuery.members;
                }

                uniques = uniques.concat(Ext.Array.pluck(members, 'uniqueName'));
            }, this);

            Ext.each(uniques, function(uniqueName) {
                var idx = this.store.findExact('uniqueName', uniqueName);
                if (idx > -1) {
                    var rec = this.store.getAt(idx);
                    var node = this.getNode(rec);
                    if (node) {
                        Ext.get(node).addCls(this.highlightItemCls);
                    }
                }
            }, this);
        }
    },

    loadStore : function() {
        this.loadTask.delay(50);
        this.fireEvent('showLoad', this);
        this.resizeTask.delay(100, null, null, [this.up('#single-axis-explorer')]);
    },

    onDelayedRefresh : function() {
        //
        // Remove animators
        //
        Ext.each(Ext.DomQuery.select('.animator'), function(a) {
            a = Ext.get(a);
            a.replaceCls('animator', '');
        });
    },

    onMaxCount : function(count) {
        this.callParent();
        this.fireEvent('hideLoad', this);

        // clean-up buttons
        Ext.iterate(this.btnMap, function(id, btn) {
            btn.destroy();
        }, this);
        this.btnMap = {};
    },

    onRefresh : function() {
        //
        // Bind groups toggles
        //
        var groups = this.store.query('isGroup', true).getRange(); // assumed to be in order of index
        if (groups.length > 0) {
            var expandos = Ext.query('.saecollapse'), bar;
            Ext.each(groups, function(group, idx) {
                bar = Ext.get(expandos[idx]);
                if (bar) {
                    this.registerGroupClick(bar, group);
                }
            }, this);
        }
        this.highlightSelections();
    },

    positionHelper : function() {
        this.selectRequest = true;
        this.selectionTask.delay(100);
    },

    positionText : function(collapseMode) {
        this.positionHelper.call(this);
    },

    refresh : function() {
        if (this.store.KEYED_LOAD === true) {
            this.addAnimations();

            // 20637: This prevents an optimization made in Ext.view.AbstractView from getting
            // an incoherent number of DOM node references relative to the number of records provided by
            // the store.
            // Related: http://www.sencha.com/forum/showthread.php?133011-4.0.0-Bug-in-AbstractView.updateIndexes
            this.fixedNodes = 0;

            this.callParent(arguments);
            this.removeAnimations();
        }
    },

    registerGroupClick : function(node, rec) {
        node.on('click', function() {
            this.groupClickTask.delay(100, null, null, [rec]);
        }, this);
    },

    removeAnimations : function() {
        Connector.view.SingleAxisExplorerView.APPLY_ANIMATE = false;
    },

    // This is a flag used to tell if a button has been pressed on the Explorer. Allows
    // for skipping of click events on individual bars.
    resetButtonClick : function() {
        this.btnclick = false;
    },

    selection : function() {
        if (this.selectRequest || !Ext.isEmpty(this.selections)) {
            this.store.loadSelection();
        }
        else {
            this.getSelectionModel().deselectAll();
            this.store.clearSelection();
        }
    },

    selectionChange : function(sel, isPrivate) {
        this.selections = sel;
        if (this.dimension && this.store.KEYED_LOAD === true) {
            Ext.defer(function() {
                if (sel.length > 0) {
                    this.selection();
                }
                else {
                    if (!isPrivate) {
                        this.getSelectionModel().deselectAll();
                    }
                    this.store.clearSelection();
                }
            }, 150, this);
        }
    },

    setDimension : function(dim, hierarchyIndex) {
        this.dimension = dim;
        this.setHierarchy(hierarchyIndex);
    },

    setHierarchy : function(index) {
        this.hierarchyIndex = index;
        this.loadStore();
    },

    toggleEmpty : function() {
        this.showEmpty = !this.showEmpty;
        this.loadStore();
        return this.showEmpty;
    },

    toggleGroup : function(children) {
        var animConfig, current, ext,
            first = true,
            listeners,
            node,
            me = this, c, child;
        this.store.suspendEvents();

        for (c=0; c < children.length; c++) {

            child = children[c];

            if (!child.data.isGroup) {

                node = this.getNodeByRecord(child);
                ext = Ext.get(node);
                current = ext.getActiveAnimation();
                if (current)
                    ext.stopAnimation();
                listeners  = {};

                if (!child.data.collapsed) { // collapse
                    animConfig = {
                        to : {opacity: 0, height: 0},
                        setDisplay : 'none',
                        collapsed : true,
                        sign  : '+',
                        scope : this
                    };
                }
                else { // expand
                    animConfig = {
                        to : {opacity: 1, height: this.barExpandHeight},
                        setDisplay : 'block',
                        collapsed : false,
                        sign  : '-',
                        scope : this
                    };
                }

                if (c === children.length - 1) {
                    listeners.beforeanimate = function(anim) {
                        anim.target.target.dom.style.display = animConfig.setDisplay;
                        me.animate = false;
                        me.positionTask.delay(100, null, null, [true]);
                    };
                }
                else {
                    listeners.beforeanimate = function(anim) {
                        anim.target.target.dom.style.display = animConfig.setDisplay;
                    };
                }
                animConfig.listeners = listeners;

                ext.animate(animConfig);

                if (first) {
                    var prev = ext.prev().child('.saecollapse');
                    prev.update('<p unselectable="on">' + animConfig.sign + '</p>');
                    first = false;
                }

                child.data.collapsed = animConfig.collapsed;
                me.store.setCollapse(child.data, animConfig.collapsed);
            }
            else if (children[c+1] && !children[c+1].data.isGroup) {
                child = children[c+1];
                node = this.getNodeByRecord(child);
                ext = Ext.get(node);

                var prev = ext.prev().child('.saecollapse');
                if (prev) {
                    prev.update('<p unselectable="on">' + (child.data.collapsed ? '+' : '-') + '</p>');
                }
            }
        }
        this.store.resumeEvents();
    },
});
