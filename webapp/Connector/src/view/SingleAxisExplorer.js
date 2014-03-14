/*
 * Copyright (c) 2014 LabKey Corporation
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

    dimViewHeight: 161,

    initComponent : function() {

        Ext.applyIf(this, {
            showEmpty: true
        });

        this.items = [
            this.getDimensionView(),
            this.initExplorerView()
        ];

        this.callParent();
    },

    initExplorerView : function() {

        // Allows for scrollable Explorer view without comprimising Ext layout.
        var resizeTask = new Ext.util.DelayedTask(function(p) {
            var id = 'single-axis-explorer';
            if (p) {
                id = p.getId();
            }
            var body = Ext.get(id + '-body');
            var box = body.up('.x-box-inner');
            body.setHeight(box.getBox().height - this.dimViewHeight);
            var container = Ext.get(id);
            container.setHeight(body.getBox().height);

            if (this.saview && this.saview.msg) {
                var sa = this.saview;
                if (sa.msg.isVisible()) {
                    var viewbox = sa.getBox();
                    sa.msg.getEl().setLeft(Math.floor(viewbox.width/2 - Math.floor(this.getEl().getTextWidth(sa.msg.msg)/2)));
                }
            }
        }, this);

        return Ext.create('Ext.Panel', {
            ui    : 'custom',
            id    : 'single-axis-explorer',
            bodyStyle : 'overflow-y: auto;',
            cls : 'iScroll',
            items : [{
                xtype : 'panel',
                ui    : 'custom',
                margin: '25 0 0 48',
                layout: {
                    type : 'hbox'
                },
                height: 30,
                width : 625,
                items : [{
                    xtype : 'box',
                    width : 270,
                    autoEl: {
                        tag : 'div',
                        cls : 'label',
                        html: 'Showing number of: <span>Subjects</span>'
                    }
                },{
                    xtype: 'roundedbutton',
                    ui: 'darkrounded',
                    text: (this.showEmpty ? 'hide empty' : 'show empty'),
                    handler: this.onEmptySelection,
                    scope: this
                }]
            },this.getSingleAxisView(resizeTask)],
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

    getDimensionView : function() {

        if (!this.dimView) {
            this.dimView = Ext.create('Connector.view.Dimension', {
                height  : this.dimViewHeight,
                padding : '15 0 0 0'
            });
        }

        return this.dimView;
    },

    getSingleAxisView : function(task) {

        if (this.saview)
            return this.saview;

        var config = {
            padding: '0 0 0 48',
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
        if (this.dimView) {
            this.dimView.setDimension(dim, hierarchyIndex);
        }
        if (this.saview) {
            this.saview.setDimension(dim, hierarchyIndex);
        }
    },

    onEmptySelection : function(btn) {
        btn.setText(this.showEmpty ? 'show empty' : 'hide empty');
        this.showEmpty = this.saview ? this.saview.toggleEmpty() : this.showEmpty;
    },

    onHierarchyChange : function(hierarchyIndex) {
        if (this.dimView) {
            this.dimView.setHierarchy(hierarchyIndex);
        }
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

Ext.define('Connector.view.Dimension', {

    extend: 'Ext.container.Container',

    requires: ['Connector.button.DropDownButton'],

    alias: 'widget.dimensionview',

    layout: {
        type : 'hbox',
        align: 'stretch'
    },

    cls: 'dimensionview',

    defaults: {
        ui: 'custom',
        flex: 1
    },

    selectorId: 'dimselect',

    initComponent : function() {

        this.items = [{
            xtype: 'dimselectorview',
            itemId: this.selectorId,
            ui: 'custom',
            dim: this.ydim,
            hidx: 0
        }];

        this.callParent();

        this.dimSelector = this.getComponent(this.selectorId);
    },

    setDimension : function(dim, hierarchyIndex) {
        if (this.dimSelector) {
            this.dimSelector.setDimension(dim, hierarchyIndex);
        }
    },

    setHierarchy : function(index) {
        if (this.dimSelector) {
            this.dimSelector.setHierarchy(index);
        }
    }
});

Ext.define('Connector.view.DimensionSelector', {

    extend : 'Ext.panel.Panel',

    alias: 'widget.dimselectorview',

    dimLabels : {
        'Antigen' : 'Assay antigens',
        'Assay'   : 'Assays',
        'Lab'     : 'Labs',
        'Study'   : 'Studies',
        'Vaccine' : 'Study products',
        'Vaccine Component' : 'Vaccine immunogens',
        'Subject' : 'Subject characteristics'
    },

    titleComponentId: 'dimtitle',

    sortComponentId: 'dimsort',

    initComponent : function() {

        var btnId = Ext.id();

        this.items = [{
            itemId: this.titleComponentId,
            xtype : 'panel',
            ui : 'custom',
            layout : {
                type : 'hbox'
            },
            items : [{
                itemId: 'dimlabel',
                xtype : 'box',
                autoEl: {
                    tag : 'div',
                    cls : 'dimgroup',
                    html: this.getDimensionLabel()
                }
            },{
                xtype: 'dropdownbutton',
                itemId: 'dimensionbtn',
                margin: '16 0 0 10',
                menu : {
                    xtype: 'menu',
                    ui: 'custom',
                    itemId: 'dimensionmenu',
                    margin: '0 0 10 0',
                    showSeparator: false
                }
            }]
        },{
            itemId: this.sortComponentId,
            xtype : 'panel',
            ui : 'custom',
            layout : {
                type : 'hbox'
            },
            items : [{
                itemId: 'sortlabel',
                xtype : 'box',
                autoEl: {
                    tag : 'div',
                    cls : 'dimensionsort',
                    html: 'Sorted by:  <span class="sorttype"></span>'
                }
            },{
                id    : btnId,
                itemId: 'sortdropdown',
                xtype : 'dropdownbutton',
                ui    : 'dropdown-alt',
                cls   : 'sortDropdown',
                margin: '10 0 0 8',
                menu : {
                    xtype: 'menu',
                    autoShow : true,
                    itemId : 'sortedmenu',
                    margin: '0 0 0 0',
                    showSeparator: false,
                    ui : 'custom',
                    btn : btnId
                },
                listeners : {
                    afterrender : function(b) {
                        b.showMenu();
                        b.hideMenu();
                    }
                }
            }]
        }];

        this.callParent();

        this.titleComponent = this.getComponent(this.titleComponentId);
        this.sortComponent = this.getComponent(this.sortComponentId);
    },

    getDimensionLabel : function() {

        if (!this.dim)
            return 'Loading...';

        if (this.dimLabels[this.dim.name])
            return this.dimLabels[this.dim.name];

        return this.dim.name;
    },

    setDimension : function(dim, hierarchyIndex) {
        this.dim  = dim;
        this.hidx = hierarchyIndex;
        var cmp = this.titleComponent.getComponent('dimlabel');
        cmp.update(Ext.isString(dim) ? dim : this.getDimensionLabel());
        this.renderSortedBy();
    },

    setHierarchy : function(index) {
        this.hidx = index;
        this.renderSortedBy();
    },

    renderSortedBy : function() {
        var value = Ext.isString(this.dim) ? this.dim : this.dim.getHierarchies()[this.hidx].getName().split('.');
        value = (value.length > 1) ? value[1] : value[0];
        var cmp = this.sortComponent.getComponent('sortlabel');
        cmp.update('Sorted by:  <span class="sorttype">' + value + '</span>');
    }
});

Ext.define('Connector.view.SingleAxisExplorerView', {

    extend : 'LABKEY.app.view.OlapExplorer',

    alias : 'widget.singleaxisview',

    plugins : [{
        ptype: 'messaging',
        calculateY : function(cmp, box, msg) {
            return box.y - 70;
        }
    }],

    emptyText : '<div class="saeempty">None of the selected subjects have data for this category.</div>',

    btnclick: false,

    showmsg: true,

    msgfade: false,

    btnMap: {},

    initComponent : function() {

        this.callParent();

        this.groupClickTask = new Ext.util.DelayedTask(this.groupClick, this);
        this.selectionTask = new Ext.util.DelayedTask(this.selection, this);
        this.msgTask = new Ext.util.DelayedTask(this._loadMsg, this);

        this.store.on('subselect', this.renderSelection, this);
        this.store.on('selectrequest', function() { this.selectRequest = true; },   this);

        this.on('itemmouseenter', this.renderInfoButton, this);
    },

    groupClick : function(rec, node) {
        var grps = this.store.getGroups(),
                field = this.store.groupField, g;
        for (g=0; g < grps.length; g++) {
            if (grps[g].name == rec.data[field]) {
                this.toggleGroup(grps[g], false, true);
                if (this.resizeTask)
                    this.resizeTask.delay(100);
                return;
            }
        }
    },

    _loadMsg : function() {
        this.loadMsg = true;
        this.showMessage('Loading...', true, true);
    },

    showLoad : function() {
        if (!this.loadMsg) {
            this.msgTask.delay(600);
        }
    },

    cancelShowLoad : function() {
        this.msgTask.cancel();
        if (this.loadMsg) {
            this.hideMessage();
        }
    },

    toggleGroup : function(grp, force, animate) {
        var animConfig, current, ext,
                first = true,
                listeners,
                node,
                me = this, c;
        this.store.suspendEvents();
        for (c=0; c < grp.children.length; c++) {

            if (!grp.children[c].data.isGroup) {

                node = this.getNodeByRecord(grp.children[c]);
                ext = Ext.get(node);
                current = ext.getActiveAnimation();
                if (current && !force)
                    ext.stopAnimation();
                animConfig = {};
                listeners  = {};

                if (!grp.children[c].data.collapsed) // collapse
                {
                    animConfig = {
                        to : {opacity: 0, height: 0},
                        setDisplay : 'none',
                        collapsed : true,
                        sign  : '+',
                        scope : this
                    };
                }
                else // expand
                {
                    animConfig = {
                        to : {opacity: 1, height: 27},
                        setDisplay : 'block',
                        collapsed : false,
                        sign  : '-',
                        scope : this
                    };
                }

                if (c == grp.children.length-1)
                {
                    listeners.beforeanimate = function(anim) {
                        anim.target.target.dom.style.display=animConfig.setDisplay;
                        me.animate = false;
                        me.positionTask.delay(0, null, null, [true]);
                    }
                }
                else
                {
                    listeners.beforeanimate = function(anim) {
                        anim.target.target.dom.style.display=animConfig.setDisplay;
                    }
                }
                animConfig.listeners = listeners;

                if (animate)
                    ext.animate(animConfig);
                else
                {
                    animConfig.to.display = animConfig.setDisplay;
                    ext.setStyle(animConfig.to);
                }

                if (first)
                {
                    var prev = ext.prev().child('.saecollapse');
                    prev.update('<p unselectable="on">' + animConfig.sign + '</p>');
                    first = false;
                }

                grp.children[c].set('collapsed', animConfig.collapsed);
                me.store.setCollapse(grp.children[c], animConfig.collapsed);
            }
            else if (grp.children[c+1] && !grp.children[c+1].data.isGroup)
            {
                var rec = grp.children[c+1];
                node    = this.getNodeByRecord(rec);
                ext     = Ext.get(node);

                var prev = ext.prev().child('.saecollapse');
                if (prev) {
                    prev.update('<p unselectable="on">' + (rec.data.collapsed ? '+' : '-') + '</p>');
                }
            }
        }
        this.store.resumeEvents();
    },

    selectionChange : function(sel, isPrivate) {
        this.selections = sel;
        if (this.dimension) {
            Ext.defer(function() {
                if (sel.length > 0) {
                    this.selection(false, isPrivate);
                }
                else {
                    if (!isPrivate) {
                        this.getSelectionModel().deselectAll();
                    }
                    this.store.clearSelection();
                }
            }, 150, this);
        }
        else {
            console.warn('Dimension must be loaded before selection change');
        }
    },

    filterChange : function() {
        if (this.dimension) {
            this.animate = false;
            this.loadStore();
        }
    },

    onMaxCount : function(count) {
        this.callParent();
        this.cancelShowLoad();

        // clean-up buttons
        for (var btn in this.btnMap) {
            if (this.btnMap.hasOwnProperty(btn)) {
                this.btnMap[btn].destroy();
            }
        }
        this.btnMap = {};
    },

    selection : function(useLast) {
        if (this.selectRequest && this.selections && this.selections.length > 0) {
            this.store.loadSelection(useLast);
        }
        else {
            this.getSelectionModel().deselectAll();
            this.store.clearSelection();
        }
    },

    _renderHasAdd : function(sel, countNode, width, remove, trueCount, subCount) {
        var cls = 'inactive';
        if (sel) {
            sel.setWidth('' + width + 'px');
        }
        if (remove) {
            if (countNode.hasCls(cls)) {
                countNode.removeCls(cls);
            }
            countNode.update(trueCount);
        }
        else {
            if (!countNode.hasCls(cls)) {
                countNode.addCls(cls);
            }
            countNode.update(subCount);
        }
    },

    renderSelection : function(r) {

        var node;
        for (var i=0; i < r.length; i++) {
            node = this.getNode(r[i]);
            if (node) {

                var selBar = Ext.query('.index-selected', node);

                if (selBar) {
                    var countNode = Ext.get(Ext.query('.count', node)[0]);
                    var bar = Ext.get(Ext.query(".index", node)[0]);

                    var _w = parseFloat(bar.getStyle('width'));
                    var sub = r[i].data.subcount; var count = r[i].data.count;
                    var _c = sub / count;
                    var sel = Ext.get(selBar[0]);
                    if (_c == 0 || isNaN(_c)) {
                        this._renderHasAdd(sel, countNode, 0, true, count, sub);
                    }
                    else if (_c >= 1) {
                        this._renderHasAdd(sel, countNode, _w, false, count, sub);
                    }
                    else {
                        this._renderHasAdd(sel, countNode, (_c * _w), false, count, sub);
                    }
                }
            }
        }
    },

    registerGroupClick : function(node, rec) {
        node.on('click', function() {
            this.groupClickTask.delay(100, null, null, [rec]);
        }, this);
    },

    positionHelper : function() {
        this.selectRequest = true;
        this.selectionTask.delay(100);
    },

    positionText : function(collapseMode) {
        this.callParent();
        this.cancelShowLoad();
    },

    toggleCollapse : function(animate) {
        var grps = this.store.getGroups();
        for (var g=0; g < grps.length; g++)
            this.toggleGroup(grps[g], true, animate);
        if (this.resizeTask) {
            this.resizeTask.delay(100);
        }
    },

    toggleEmpty : function() {
        this.showEmpty = !this.showEmpty;
        this.loadStore();
        return this.showEmpty;
    },

    loadStore : function() {
        this.store.load(this.dimension, this.hierarchyIndex, true, this.showEmpty);
        this.showLoad();
    },

    renderInfoButton : function(view, rec, element) {
        if (rec && !rec.data.isGroup && this.dimension.supportsDetails) {
            var el = Ext.get(Ext.query(".info", element)[0]);

            var name = this.dimension.getName();

            if (this.btnMap[rec.id]) {
                this.btnMap[rec.id].show();
            }
            else {
                this.btnMap[rec.id] = Ext.create('Connector.button.InfoButton', {
                    renderTo : el,
                    text : 'view info',
                    record : rec,
                    dimension : this.dimension,
                    handler : function(e) {
                        this.btnclick = true;
                    },
                    scope   : this
                });
            }
        }
    },

    // This is a flag used to tell if a button has been pressed on the Explorer. Allows
    // for skipping of click events on individual bars.
    resetButtonClick : function() {
        this.btnclick = false;
    }
});
