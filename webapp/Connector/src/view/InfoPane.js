Ext.define('Connector.view.InfoPane', {

    extend: 'Ext.container.Container',

    alias: 'widget.infopane',

    ui: 'custom',

    layout: {
        type: 'vbox',
        align: 'stretch',
        pack: 'start'
    },

    margin: 10,

    padding: '10 0 10 10',

    flex: 1,

    cls: 'infopane',

    autoScroll: true,

    showTitle: true,

    showSort: true,

    showOperator: true,

    initComponent : function() {

        var btnId = Ext.id();
        var model = this.getModel();
        var filterBased = model.isFilterBased();

        this.items = [];

        if (this.showTitle) {
            this.items.push({
                xtype: 'box',
                tpl: new Ext.XTemplate(
                        '<h2 style="font-size: 18pt;">{title:htmlEncode}</h2>'
                ),
                data: model.data,
                listeners: {
                    afterrender: function(box) {
                        this.getModel().on('change', function(m) {
                            this.update(m.data);
                        }, box);
                    },
                    scope: this
                }
            });
        }

        if (this.showSort) {
            this.items.push({
                xtype: 'container',
                ui: 'custom',
                layout: { type: 'hbox' },
                items: [{
                    xtype: 'box',
                    tpl: new Ext.XTemplate(
                            '<div class="sorter" style="margin-top: 20px;">',
                            '<span style="color: #A09C9C;">SORTED BY:&nbsp;</span>',
                            '<span>{hierarchyLabel:htmlEncode}</span>',
                            '</div>'
                    ),
                    data: model.data,
                    listeners: {
                        afterrender: function(box) {
                            var model = this.getModel();
                            box.update(model.data);

                            model.on('change', function(m) {
                                this.update(m.data);
                            }, box);
                        },
                        scope: this
                    },
                    flex: 10
                },{
                    id: btnId,
                    xtype: 'imgbutton',
                    itemId: 'infosortdropdown',
                    cls: 'sortDropdown ipdropdown', // tests
                    style: 'float: right;',
                    vector: 21,
                    width: 21,
                    margin: '17 10 0 0',
                    hidden: filterBased,
                    menu: {
                        xtype: 'menu',
                        autoShow: true,
                        itemId: 'infosortedmenu',
                        showSeparator: false,
                        width: 265,
                        ui: 'custom',
                        cls: 'infosortmenu',
                        btn: btnId,
                        listeners: {
                            afterrender: this.bindSortMenu,
                            scope: this
                        }
                    },
                    listeners: {
                        afterrender : function(b) {
                            b.showMenu(); b.hideMenu();
                        },
                        scope: this
                    }
                }]
            });
        }

        var middleContent = {
            xtype: 'container',
            itemId: 'middle',
            flex: 10,
            autoScroll: true,
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'start'
            },
            items: []
        };

        if (this.showOperator) {
            middleContent.items.push({
                itemId: 'operatorlabel',
                xtype: 'box',
                tpl: new Ext.XTemplate(
                    '<div style="margin-top: 20px;">',
                        '<span>Subjects can fall into multiple Types.</span>',
                    '</div>'
                ),
                data: {}
            });
            middleContent.items.push({
                itemId: 'operator',
                xtype: 'radiogroup',
                columns: 1,
                allowBlank: false,
                validateOnBlur: false,
                items: [
                    {
                        boxLabel: 'Subjects related to any (OR)',
                        name: 'operator',
                        inputValue: LABKEY.app.model.Filter.OperatorTypes.OR,
                        checked: model.isOR()
                    },{
                        boxLabel: 'Subjects related to all (AND)',
                        name: 'operator',
                        inputValue: LABKEY.app.model.Filter.OperatorTypes.AND,
                        checked: model.isAND()
                    }
                ],
                listeners: {
                    change: this.onOperatorChange,
                    scope: this
                }
            });
        }

        var contents = this.getMiddleContent(model);
        Ext.each(contents, function(content) {
            middleContent.items.push(content);
        }, this);

        this.items.push(middleContent);

        //
        // Toolbar configuration
        //
        this.items.push(this.getToolbarConfig(model));

        this.callParent();
        this.bindModel();

        if (Ext.isDefined(this.stateManager)) {
            this.stateManager.on('selectionchange', function() { this.hide(); }, this, {single: true});
            this.stateManager.on('filterchange', function() { this.hide(); }, this, {single: true});
        }
    },

    getMiddleContent : function(model) {
        return [{
            xtype: 'grid',
            itemId: 'membergrid',
            store: this.getMemberStore(),
            viewConfig : { stripeRows : false },

            /* Selection configuration */
            selType: 'checkboxmodel',
            selModel: {
                checkSelector: 'td.x-grid-cell-row-checker'
            },
            multiSelect: true,

            /* Column configuration */
            enableColumnHide: false,
            enableColumnResize: false,
            columns: [{
                xtype: 'templatecolumn',
                header: 'All',
                dataIndex: 'name',
                flex: 1,
                sortable: false,
                menuDisabled: true,
                tpl: new Ext.XTemplate(
                    '{name:htmlEncode}',
                    '<tpl if="hasDetails === true">',
                        '<a class="expando" href="{detailLink}">',
                            '<span class="icontext">View info</span>',
                            '<img src="' + Connector.resourceContext.path + '/images/cleardot.gif" class="iconone">',
                        '</a>',
                    '</tpl>'
                )
            }],

            /* Grouping configuration */
            requires: ['Ext.grid.feature.Grouping'],
            features: [{
                ftype: 'grouping',
                collapsible: false,
                groupHeaderTpl: new Ext.XTemplate(
                        '{name:this.renderHeader}', // 'name' is actually the value of the groupField
                        {
                            renderHeader: function(v) {
                                return v ? 'Has data in current filters' : 'No data in current filters';
                            }
                        }
                )
            }],

            /* Styling configuration */
            border: false,
            ui: 'custom',
            cls : 'measuresgrid infopanegrid',

            listeners: {
                viewready : function(grid) {
                    this.gridready = true;
                },
                scope: this
            }
        }];
    },

    getToolbarConfig : function(model) {
        return {
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            items: ['->',
                {
                    id: 'filtertaskbtn',
                    text: model.isFilterBased() ? 'update' : 'filter',
                    cls: 'filterinfoaction', // tests
                    handler: this.onUpdate,
                    scope: this
                },{
                    text: 'cancel',
                    cls: 'filterinfocancel', // tests
                    handler: function() { this.hide(); },
                    scope: this
                }
            ]
        };
    },

    bindModel : function() {
        var model = this.getModel();

        // bind view to model
        model.on('ready', this.onModelReady, this);
        if (model.isReady()) {
            this.onModelReady();
        }

        // bind model to view
        this.on('filtercomplete', model.onCompleteFilter, model);
    },

    unbindModel : function() {
        var model = this.getModel();

        // bind view to model
        model.un('ready', this.onModelReady, this);

        // bind model to view
        this.un('filtercomplete', model.onCompleteFilter, model);
    },

    onModelReady : function() {
        if (this.gridready) {
            this.updateSelections();
        }
        else {
            this.getGrid().on('viewready', this.updateSelections, this);
        }
    },

    onUpdate : function() {
        var grid = this.getGrid();

        if (grid) {
            this.fireEvent('filtercomplete', grid.getSelectionModel().getSelection(), grid.getStore().getCount());
            this.hide();
        }
    },

    updateSelections : function() {

        var grid = this.getGrid();
        var sm = grid.getSelectionModel();
        if (sm.hasSelection()) {
            sm.deselectAll();
        }

        var store = grid.getStore();
        var storeCount = store.getCount();
        var selItems = this.getModel().get('selectedItems');

        var members = [], idx;
        Ext.each(selItems, function(uniqueName) {
            idx = store.findExact('uniqueName', uniqueName);
            if (idx > -1) {
                members.push(store.getAt(idx));
            }
        });

        if (members.length > 0) {
            if (members.length == storeCount) {
                sm.selectAll();
            }
            else {
                sm.select(members);
            }

            // prevent scrolling to bottom of selection
            grid.getView().focusRow(0);

            var anodes = Ext.DomQuery.select('a.expando');
            var nodes = Ext.DomQuery.select('a.expando *');
            anodes = anodes.concat(nodes);
            Ext.each(anodes, function(node) {
                Ext.get(node).on('click', function(evt) {
                    evt.stopPropagation();
                });
            });
        }

        //
        // Configure default operator
        //
        var model = this.getModel();
        var hierarchy = model.get('hierarchy');

        if (model.isREQ()) {
            this.hideOperator();
        }
        else {
            this.showOperator();
        }
    },

    onOperatorChange : function(radio, newValue) {
        this.getModel().changeOperator(newValue.operator);
    },

    showOperator : function() {
        this.getComponent('middle').getComponent('operator').show();
        this.getComponent('middle').getComponent('operatorlabel').show();
    },

    hideOperator : function() {
        this.getComponent('middle').getComponent('operator').hide();
        this.getComponent('middle').getComponent('operatorlabel').hide();
    },

    setMenuContent : function(menu, model) {
        menu.removeAll();

        var items = model.get('hierarchyItems');

        Ext.each(items, function(item) {
            menu.add(item);
        });
    },

    bindSortMenu : function(menu) {
        this.setMenuContent(menu, this.getModel());

        this.getModel().on('change', function(model) {
            this.setMenuContent(menu, model);
        }, this);

        menu.on('click', this.onSortSelect, this);
    },

    onSortSelect : function(menu, item) {
        var i = Ext.clone(item);
        this.getModel().setDimensionHierarchy(null, i.uniqueName);
    },

    getGrid : function() {
        return this.getComponent('middle').getComponent('membergrid');
    },

    getModel : function() {
        return this.model;
    },

    getMemberStore : function() {
        return this.getModel().get('memberStore');
    }
});
