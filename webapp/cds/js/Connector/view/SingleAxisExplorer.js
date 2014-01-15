/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.view.SingleAxisExplorer', {

    extend : 'Ext.Panel',

    requires: ['Connector.model.Explorer'],

    alias : 'widget.singleaxis',

    layout : {
        type : 'vbox',
        align: 'stretch'
    },
    
    initComponent : function() {

        Ext4.applyIf(this, {
            showEmpty : true
        });

        this.dimViewHeight = 170;

        this.items = [
            this.getDimensionView(),
            this.initExplorerView()
        ];

        this.callParent();
    },

    initExplorerView : function() {

        // Allows for scrollable Explorer view without comprimising Ext layout.
        var resizeTask = new Ext4.util.DelayedTask(function(p) {
            var id = 'single-axis-explorer';
            if (p) {
                id = p.getId();
            }
            var body = Ext4.get(id + '-body');
            var box = body.up('.x4-box-inner');
            body.setHeight(box.getBox().height - this.dimViewHeight);
            var container = Ext4.get(id);
            container.setHeight(body.getBox().height);

            if (this.saview && this.saview.msg) {
                var sa = this.saview;
                if (sa.msg.isVisible()) {
                    var viewbox = sa.getBox();
                    sa.msg.getEl().setLeft(Math.floor(viewbox.width/2 - Math.floor(this.getEl().getTextWidth(sa.msg.msg)/2)));
                }
            }
        }, this);

        return Ext4.create('Ext.Panel', {
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
                    xtype : 'roundedbutton',
                    text  : (this.showEmpty ? 'hide empty' : 'show empty'),
                    cls   : 'dark',
                    handler : this.onEmptySelection,
                    scope : this
                },{
                    xtype : 'roundedbutton',
                    margin : '0 0 10 8',
                    text  : 'export',
                    disabled : true,
                    cls   : 'dark'
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
            this.dimView = Ext4.create('Connector.view.Dimension', {
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
            store : this.store,
            flex  : 1,
            totalCount : -1,
            resizeTask : task,
            showEmpty : this.showEmpty
        };

        if (this.selections) {
            config.selections = this.selections;
        }

        this.saview = Ext4.create('Connector.view.SingleAxisExplorerView', config);

        return this.saview;
    },

    onDimensionChange : function(dim, hierarchyIndex) {
        this.dimView.setDimension(dim, hierarchyIndex);
        this.saview.setDimension(dim, hierarchyIndex);
    },

    onEmptySelection : function(btn) {
        btn.setText(this.showEmpty ? 'show empty' : 'hide empty');
        this.showEmpty = this.saview.toggleEmpty();
    },

    onHierarchyChange : function(hierarchyIndex) {
        this.dimView.setHierarchy(hierarchyIndex);
        this.saview.setHierarchy(hierarchyIndex);
    },

    onSelectionChange : function(sel, isPrivate) {
        this.saview.selectionChange(sel, isPrivate);
    },

    onFilterChange : function() {
        this.saview.filterChange();
    },

    onViewChange : function(xtype) {
        if (xtype != 'singleaxis') {
            this.saview.hideMessage();
        }
    }
});

Ext4.define('Connector.view.Dimension', {

    extend : 'Ext.container.Container',

    requires : ['Connector.button.DropDownButton'],

    alias  : 'widget.dimensionview',

    layout : {
        type : 'hbox',
        align: 'stretch'
    },

    cls : 'dimensionview',

    defaults : {
        ui : 'custom',
        flex : 1
    },

    initComponent : function() {

        this.items = [
            Ext4.create('Connector.view.DimensionSelector', {
                ui   : 'custom',
                dim  : this.ydim,
                hidx : 0
            })
        ];
        this.callParent();
    },

    setDimension : function(dim, hierarchyIndex) {
        this.items.items[0].setDimension(dim, hierarchyIndex);
    },

    setHierarchy : function(index) {
        this.items.items[0].setHierarchy(index);
    }
});

Ext4.define('Connector.view.DimensionSelector', {

    extend : 'Ext.Panel',

    dimLabels : {
        'Antigen' : 'Assay Antigens',
        'Assay'   : 'Assays',
        'Lab'     : 'Labs',
        'Study'   : 'Studies',
        'Vaccine' : 'Regimen Components',
        'Vaccine Component' : 'Vaccine Immunogens',
        'Participant' : 'Subjects'
    },

    initComponent: function() {

        this.items = [];

        var btnId = Ext4.id();
        this.items.push([{
            xtype : 'panel',
            ui : 'custom',
            layout : {
                type : 'hbox'
            },
            items : [{
                xtype : 'box',
                autoEl: {
                    tag : 'div',
                    cls : 'dimgroup',
                    html: this.getDimensionLabel()
                }
            },{
                xtype : 'dropdownbutton',
                margin: '8 0 0 5',
                menu : {
                    xtype: 'menu',
                    itemId : 'dimensionmenu',
                    margin: '0 0 10 0',
                    showSeparator: false,
                    ui : 'custom'
                }
            }]
        },{
            xtype : 'panel',
            ui : 'custom',
            layout : {
                type : 'hbox'
            },
            items : [{
                xtype : 'box',
                autoEl: {
                    tag : 'div',
                    cls : 'dimensionsort',
                    html: 'Sorted by:  <span class="sorttype"></span>'
                }
            },{
                id    : btnId,
                xtype : 'dropdownbutton',
                ui    : 'dropdown-alt',
                cls   : 'sortDropdown',
                margin: '5 0 0 4',
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
        }]);

        this.callParent();
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
        this.items.items[0].items.items[0].update(Ext4.isString(dim) ? dim : this.getDimensionLabel());
        this.renderSortedBy();
    },

    setHierarchy : function(index) {
        this.hidx = index;
        this.renderSortedBy();
    },

    renderSortedBy : function() {
        var value = Ext4.isString(this.dim) ? this.dim : this.dim.getHierarchies()[this.hidx].getName().split('.');
        value = (value.length > 1) ? value[1] : value[0];
        this.items.items[1].items.items[0].update('Sorted by:  <span class="sorttype">' + value + '</span>');
    }
});

Ext4.define('Connector.view.SingleAxisExplorerView', {

    extend : 'Ext.view.View',

    alias : 'widget.singleaxisview',

    itemSelector : 'div.bar',

    multiSelect : true,

    tpl : new Ext4.XTemplate(
        '<div class="barchart">',
            '<div class="bargroup">',

            '<tpl for=".">',

                '<tpl if="isGroup === true && collapsed == true">',
                    '<div>',
                        '<div class="saecollapse {#}-collapse" id="{#}-collapse">',
                            '<p>+</p>',
                        '</div>',
                        '<div class="bar large">',
                            '<span class="barlabel">{label:htmlEncode}</span>',
                            '<span class="count">{count}</span>',
                            '<span class="index"></span>',
                            '<span class="index-selected inactive"></span>',
                        '</div>',
                    '</div>',
                '</tpl>',
                '<tpl if="isGroup === true && collapsed == false">',
                    '<div>',
                        '<div class="saecollapse {#}-collapse" id="{#}-collapse">',
                            '<p>-</p>',
                        '</div>',
                        '<div class="bar large">',
                            '<span class="barlabel">{label:htmlEncode}</span>',
                            '<span class="count">{count}</span>',
                            '<span class="index"></span>',
                            '<span class="index-selected inactive"></span>',
                        '</div>',
                    '</div>',
                '</tpl>',
                '<tpl if="isGroup === false && collapsed == true">',
                    '<div class="bar small barcollapse">',
                        '<span class="barlabel">{label:htmlEncode}</span>',
                        '<span class="count">{count}</span>',
                        '<span class="info"></span>',
                        '<span class="index"></span>',
                        '<span class="index-selected inactive"></span>',
                    '</div>',
                '</tpl>',
                '<tpl if="isGroup === false && collapsed == false">',
                    '<div class="bar small">',
                        '<span class="barlabel">{label:htmlEncode}</span>',
                        '<span class="count">{count}</span>',
                        '<span class="info"></span>',
                        '<span class="index"></span>',
                        '<span class="index-selected inactive"></span>',
                    '</div>',
                '</tpl>',
            '</tpl>',

            '</div>',
        '</div>'
    ),

    emptyText : '<div class="saeempty">None of the selected participants have data for this category.</div>',

    initComponent : function() {

        Ext4.applyIf(this, {
            btnclick : false,
            showmsg  : true,
            msgfade  : false,
            btnMap   : {},
            textCache: {}
        });

        this.positionTask   = new Ext4.util.DelayedTask(this.positionText, this);
        this.groupClickTask = new Ext4.util.DelayedTask(this.groupClick, this);
        this.selectionTask  = new Ext4.util.DelayedTask(this.selection, this);
        this.msgTask        = new Ext4.util.DelayedTask(this._loadMsg, this);

        this.callParent();

        this.store.on('subselect', this.renderSelection, this);
        this.store.on('totalcount', function(count) {
            this.cancelShowLoad();

            this.loadLock = false; this.totalCount = count;

            // clean-up buttons
            for (var btn in this.btnMap) {
                this.btnMap[btn].destroy();
            }
            this.btnMap = {};

        }, this);
        this.store.on('selectRequest', function() { this.selectRequest = true; },   this);

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
                ext = Ext4.get(node);
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
                ext     = Ext4.get(node);

                var prev = ext.prev().child('.saecollapse');
                if (prev) {
                    prev.update('<p unselectable="on">' + (rec.data.collapsed ? '+' : '-') + '</p>');
                }
            }
        }
        this.store.resumeEvents();
    },

    setDimension : function(dim, hierarchyIndex) {
        this.dimension = dim;
        this.setHierarchy(hierarchyIndex);
    },

    setHierarchy : function(index) {
        this.animate = true;
        this.hierarchyIndex = index;
        this.loadStore();
    },

    selectionChange : function(sel, isPrivate) {
        this.selections = sel;
        if (this.dimension)
        {
            if (sel.length > 0) {
                this.selection(false, isPrivate);
            }
            else {
                if (!isPrivate) {
                    this.getSelectionModel().deselectAll();
                    this.store.clearSelection();
                }
                else {
                    this.store.clearSelection();
                }
            }
        }
        else {
            console.error('Dimension must be loaded before selection change');
        }
    },

    filterChange : function() {
        if (this.dimension) {
            this.animate = false;
            this.loadStore();
        }
    },

    selection : function(useLast) {
        if (this.selectRequest && this.selections && this.selections.length > 0) {
            this.syncSelectionModel();
            this.store.loadSelection(useLast);
        }
        else {
            this.getSelectionModel().deselectAll();
            this.store.clearSelection();
        }
    },

    _renderHasAdd : function(sel, bar, width, cls, remove) {
        if (sel)
            sel.setWidth('' + width + '%');
        if (remove) {
            if (bar.hasCls(cls)) {
                bar.removeCls(cls);
            }
        }
        else {
            if (!bar.hasCls(cls)) {
                bar.addCls(cls);
            }
        }
    },

    renderSelection : function(r) {

        var node;
        for (var i=0; i < r.length; i++) {
            node = this.getNode(r[i]);
            if (node)
            {
                var selBar = Ext4.query('.index-selected', node);
                var barCount = Ext4.get(Ext4.query('.count', node)[0]);
                var bar = Ext4.get(Ext4.query(".index", node)[0]);
                if (selBar)
                {
                    var _w = parseFloat(bar.getStyle('width'));
                    var _c = r[i].data.subcount / r[i].data.count;
                    var sel = Ext4.get(selBar[0]);
                    if (_c == 0 || isNaN(_c)){
                        this._renderHasAdd(sel, barCount, 0, 'inactive', true);
                    }
                    else if (_c >= 1) {
                        this._renderHasAdd(sel, barCount, _w, 'inactive', false);
                    }
                    else {
                        this._renderHasAdd(sel, barCount, (_c * _w), 'inactive', false);
                    }
                }
            }
        }
    },

    /**
     * This ensures that the selection model selected records (i.e. the ones a user clicked on)
     * stays in sync with the set of CDS selections (i.e. current selections).
     * Issue:
     */
    syncSelectionModel : function() {

        if (!this.selections || this.selections.length == 0) {
            this.getSelectionModel().deselectAll();
            return;
        }

        if (this.selections.length > 1) {
            console.warn('Multiple Selections are not synced properly with selection model.');
            return;
        }

        var members, m, remove = [], match;
        var selected = this.getSelectionModel().getSelection();
        for (var s=0; s < selected.length; s++) {

            match = false;

            if (!this.selections[0] || !this.selections[0].data || !this.selections[0].data.members) {
                continue;
            }

            for (m=0; m < this.selections[0].data.members.length; m++) {

                // ensure match of hierarchies
                if (selected[s].data.hierarchy == this.selections[0].getHierarchy()) {

                    members = this.selections[0].data.members[m];
                    if (selected[s].data.value == members.uname[members.uname.length-1]) {
                        match = true;
                    }
                }
            }

            if (!match) {
                remove.push(selected[s]);
            }
        }

        if (remove.length > 0) {
            this.getSelectionModel().deselect(remove, true);
        }
    },

    registerGroupClick : function(node, rec) {
        node.on('click', function() {
            this.groupClickTask.delay(100, null, null, [rec]);
        }, this);
    },

    hideMessage : function(withFade) {
        if (this.msg && this.msg.isVisible()) {
            if (withFade) {
                if (!this.msgfade) {

                    this.msgfade = true;
                    this.msg.getEl().fadeOut({
                        listeners : {
                            afteranimate : function() {
                                this.clearMessage();
                                this.msgfade = false;
                            },
                            scope : this
                        },
                        scope : this
                    });
                }
            }
            else {
                this.clearMessage();
            }
            this.loadMsg = false;
        }
    },

    clearMessage : function() {
        if (this.msg) {
            this.msg.hide();
            this.msg.destroy();
            this.msg = null;
        }
    },

    deferMessage : function() {
        Ext4.defer(function() {
            if (this.msg && !this.msg.keep) {
                this.hideMessage(true);
            }
        }, 8000, this);
    },

    showMessage : function(msg, force, keep) {

        if (this.showmsg || force)
        {
            this.clearMessage();

            if (!force) {
                this.showmsg = false;
            }

            var box = this.getBox();

            var listeners = {};
            if (!keep) {
                listeners = {
                    afterrender : this.deferMessage,
                    scope: this
                };
            }

            this.msg = Ext4.create('Connector.window.SystemMessage', {
                msg : msg,
                x   : Math.floor(box.width/2 - Math.floor(this.getEl().getTextWidth(msg)/2) ),
                y   : (box.y-70), // height of message window
                listeners : listeners,
                keep : keep,
                scope : this
            });
        }
    },

    positionHelper : function() {
        this.selectRequest = true;
        this.selectionTask.delay(100);
    },

    positionText : function(collapseMode){

        var bar,
            bars = Ext4.query(".barchart .bar"),
            grps = this.store.getGroups(),
            i, g=0,
            bWidth,
            info,
            label,
            numpercent,
            percent,
            sets = [],
            t;

        for (i=0; i < bars.length; i++) {
            t = Ext4.get(Ext4.query(".barlabel", bars[i])[0]);
            sets.push({
                bar : Ext4.get(Ext4.query(".index", bars[i])[0]),
                barLabel : t,
                barCount : Ext4.get(Ext4.query(".count", bars[i])[0]),
                info : Ext4.get(Ext4.query(".info", bars[i])[0]),
                label : t.dom.innerHTML
            });
        }

        this.suspendLayout = true;
        for (i=0; i < sets.length; i++) {

            label = sets[i].label;
            if (this.textCache[label]) {
                t = this.textCache[label];
            }
            else {
                t = this.textCache[label] = sets[i].barLabel.getTextWidth();
            }

            // optimization for 0 case
            if (sets[i].barCount.dom.innerHTML == '0') {
                sets[i].bar.setWidth('0%');
                sets[i].barCount.setLeft(t + 15);
                if (sets[i].info)
                    sets[i].info.setLeft(t + 60);
                continue;
            }

            numpercent = (sets[i].barCount.dom.innerHTML / this.totalCount) * 100;  // barCount.dom.innerText is a number like '100'
            percent = '' + numpercent + '%';

            sets[i].bar.setWidth(percent);
            bWidth = sets[i].bar.getWidth(); // returns width in pixels
            if (bWidth > t) {
                t = bWidth;
            }

            sets[i].barCount.setLeft(t + 15);
            if (sets[i].info) {
                sets[i].info.setLeft(t + 60);
            }

            if (this.animate) {
                sets[i].bar.setWidth("0%");
                sets[i].bar.setWidth(percent, {
                    duration: 300,
                    easing: 'linear',
                    callback: this.positionHelper,
                    scope: this
                });
            } else {
                this.positionHelper.call(this);
            }
        }
        this.suspendLayout = false;

        if (!collapseMode) {
            for (; g < grps.length; g++) {
                bar = Ext4.get(Ext4.query('.saecollapse')[g]);
                if (bar) {
                    i = bar.dom.id.split('-collapse')[0]-1;
                    this.registerGroupClick(bar, this.store.getAt(i));
                }
            }
        }

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
        this.loadLock = true;
        this.store.load(this.dimension, this.hierarchyIndex, true, this.showEmpty, this.barCache);
        this.showLoad();
    },

    renderInfoButton : function(view, rec, element) {
        if (rec && !rec.data.isGroup) {
            var el = Ext4.get(Ext4.query(".info", element)[0]);
            this.renderButton(el, rec);
        }
    },

    renderButton : function(el, rec) {

        var name = this.dimension.getName();

        // 16208 / 16487
        if (name == 'Participant' || name == 'Vaccine Component' || name == 'Lab') {
            return;
        }

        if (this.btnMap[rec.id]) {
            this.btnMap[rec.id].show();
        }
        else
        {
            this.btnMap[rec.id] = Ext4.create('Connector.button.InfoButton', {
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
    },

    // This is a flag used to tell if a button has been pressed on the Explorer. Allows
    // for skipping of click events on individual bars.
    resetButtonClick : function() {
        this.btnclick = false;
    }
});
