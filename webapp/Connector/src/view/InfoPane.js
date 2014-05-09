Ext.define('Connector.view.InfoPane', {

    extend: 'Ext.container.Container',

    alias: 'widget.infopane',

    ui: 'custom',

    layout: {
        type: 'anchor'
    },

    cls: 'infopane',

    initComponent : function() {

        var btnId = Ext.id();
        var model = this.getModel();
        var filterBased = model.isFilterBased();

        this.items = [{
            xtype: 'container',
            itemId: 'content',
            style: 'margin: 10px; background-color: #fff; border: 1px solid lightgrey; padding: 10px',
            anchor: '100%',
            items: [
                {
                    xtype: 'box',
                    tpl: new Ext.XTemplate(
                        '<h2 style="font-size: 18pt;">{title}</h2>'
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
                },{
                    xtype: 'container',
                    ui: 'custom',
                    layout: { type: 'hbox' },
                    items: [{
                        xtype: 'box',
                        tpl: new Ext.XTemplate(
                            '<div class="sorter" style="margin-top: 20px;"><span style="color: #A09C9C;">SORTED BY:&nbsp;</span><span>{hierarchyLabel}</span></div>'
                        ),
                        data: this.getModel().data,
                        listeners: {
                            afterrender: function(box) {
                                this.getModel().on('change', function(m) {
                                    this.update(m.data);
                                }, box);
                            },
                            scope: this
                        }
                    },{
                        id: btnId,
                        xtype: 'imgbutton',
                        itemId: 'infosortdropdown',
                        cls: 'sortDropdown',
                        margin: '17 0 0 8',
                        vector: 21,
                        hidden: filterBased,
                        menu: {
                            xtype: 'menu',
                            autoShow: true,
                            itemId: 'infosortedmenu',
                            margin: '0 0 0 0',
                            showSeparator: false,
                            ui: 'custom',
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
                },{
                    itemId: 'operatorlabel',
                    xtype: 'box',
                    style: 'margin-top: 20px;',
                    autoEl: {
                        tag: 'div',
                        html: '<span>Subjects can fall into multiple Types.</span>'
                    }
                },{
                    itemId: 'operator',
                    xtype: 'radiogroup',
                    columns: 1,
                    allowBlank: false,
                    validateOnBlur: false,
                    items: [
                        { boxLabel: 'Subjects related to any (OR)', name: 'operator', inputValue: LABKEY.app.model.Filter.Operators.UNION },
                        { boxLabel: 'Subjects related to all (AND)', name: 'operator', inputValue: LABKEY.app.model.Filter.Operators.INTERSECT }
                    ]
                },{
                    xtype: 'grid',
                    itemId: 'membergrid',
                    store: this.getMemberStore(),
                    viewConfig : { stripeRows : false },

                    /* Selection configuration */
                    selType: 'checkboxmodel',
                    selModel: {
                        checkOnly: true,
                        checkSelector: 'td.x-grid-cell-row-checker'
                    },
                    multiSelect: true,

                    /* Column configuration */
                    enableColumnHide: false,
                    enableColumnResize: false,
                    columns: [{
                        header: 'All',
                        dataIndex: 'name',
                        flex: 1,
                        sortable: false,
                        menuDisabled: true
                    }],

                    /* Grouping configuration */
                    requires: ['Ext.grid.feature.Grouping'],
                    features: [{
                        ftype: 'grouping',
                        collapsible: false,
                        groupTitleStyle: 'background-color: red;',
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
                    flex: 1,
                    ui: 'custom',
                    cls : 'measuresgrid infopanegrid'
                },{
                    xtype: 'toolbar',
                    dock: 'bottom',
                    ui: 'footer',
                    style: 'padding-top: 60px',
                    items: ['->',
//                        {
//                        text: 'make color',
//                        disabled: true
//                    },{
//                        text: 'make x axis',
//                        disabled: true
//                    },
                        {
                        text: filterBased ? 'update' : 'filter',
//                        itemId: 'groupcreatesave',
                        cls: 'filterinfoaction', // tests
                        handler: this.onUpdate,
                        scope: this
                    },{
                        text: 'cancel',
//                        itemId: 'cancelgroupsave',
                        cls: 'filterinfocancel', // tests
                        handler: function() { this.hide(); },
                        scope: this
                    }]
                }
            ]
        }];

        this.callParent();

        // bind view to model
        model.on('ready', this.onModelReady, this);

        // bind model to view
        this.on('filtercomplete', model.onCompleteFilter, model);
    },

    onModelReady : function() {
        this.updateSelections();
    },

    onUpdate : function() {
        var grid = this.getContent().getComponent('membergrid');

        if (grid) {
            this.fireEvent('filtercomplete', grid.getSelectionModel().getSelection());
            this.hide();
        }
    },

    updateSelections : function() {

        var grid = this.getContent().getComponent('membergrid');
        grid.getSelectionModel().deselectAll();

        var store = this.getMemberStore();
        var selItems = this.getModel().get('selectedItems');

        var members = [], idx;
        Ext.each(selItems, function(uniqueName) {
            idx = store.findExact('uniqueName', uniqueName);
            if (idx > -1) {
                members.push(store.getAt(idx));
            }
        });

        if (members.length > 0) {
            grid.getSelectionModel().select(members);
        }

        //
        // Configure default operator
        //
        var model = this.getModel();
        var hierarchy = model.get('hierarchy');
        var operator = hierarchy.defaultOperator;

        if (operator === "AND" || operator === "OR") {
            this.showOperator();
        }
        else {
            this.hideOperator();
        }

        if (model.isFilterBased()) {

        }
    },

    showOperator : function() {
        this.getContent().getComponent('operator').show();
        this.getContent().getComponent('operatorlabel').show();
    },

    hideOperator : function() {
        this.getContent().getComponent('operator').hide();
        this.getContent().getComponent('operatorlabel').hide();
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

    getContent : function() {
        return this.getComponent('content');
    },

    getModel : function() {
        return this.model;
    },

    getMemberStore : function() {
        return this.getModel().get('memberStore');
    }
});
