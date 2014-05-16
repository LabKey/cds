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

    requires: ['Connector.button.Image'],

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
                itemId: 'dimensionbtn',
                xtype: 'imgbutton',
                cls: 'dimselectdrop',
                margin: '13 0 0 10',
                vector: 27,
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
                id: btnId,
                xtype: 'imgbutton',
                itemId: 'sortdropdown',
                cls: 'sortDropdown',
                margin: '7 0 0 8',
                vector: 21,
                menu: {
                    xtype: 'menu',
                    autoShow: true,
                    itemId: 'sortedmenu',
                    margin: '0 0 0 0',
                    showSeparator: false,
                    ui: 'custom',
                    btn: btnId
                },
                listeners: {
                    afterrender : function(b) {
                        b.showMenu(); b.hideMenu();
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

        this.msgTask = new Ext.util.DelayedTask(this._loadMsg, this);

        this.on('itemmouseenter', this.renderInfoButton, this);
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

    positionText : function(collapseMode) {
        this.callParent();
        this.cancelShowLoad();
    },

    renderInfoButton : function(view, rec, element) {
        if (rec && !rec.data.isGroup && this.dimension.supportsDetails) {
            var el = Ext.get(Ext.query(".info", element)[0]);

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
    },

    loadStore : function() {
        this.callParent();
        this.showLoad();
    },

    onMaxCount : function(count) {
        this.callParent();
        this.cancelShowLoad();

        // clean-up buttons
        Ext.iterate(this.btnMap, function(id, btn) {
            btn.destroy();
        }, this);
        this.btnMap = {};
    }
});
