Ext.define('Connector.view.InfoPane', {

    extend: 'Ext.container.Container',

    alias: 'widget.infopane',

    ui: 'custom',

    layout: {
        type: 'anchor'
    },

    cls: 'infopane',

    constructor : function(config) {
        this.model = config.model;

        this.callParent([config]);
    },

    initComponent : function() {

        var btnId = Ext.id();

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
                    data: this.getModel().data,
                    listeners: {
                        afterrender: function(box) {
                            this.getModel().on('change', function(model) {
                                this.update(model.data);
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
                            '<div class="sorter" style="padding-top: 9px;"><span>{hierarchyLabel}</span></div>'
                        ),
                        data: this.getModel().data,
                        listeners: {
                            afterrender: function(box) {
                                this.getModel().on('change', function(model) {
                                    this.update(model.data);
                                }, box);
                            },
                            scope: this
                        }
                    },{
                        id: btnId,
                        xtype: 'imgbutton',
                        itemId: 'infosortdropdown',
                        cls: 'sortDropdown',
                        margin: '7 0 0 8',
                        vector: 21,
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
                        text: 'filter',
//                        itemId: 'groupcreatesave',
                        cls: 'filterinfoaction' // tests
                    },{
                        text: 'cancel',
//                        itemId: 'cancelgroupsave',
                        cls: 'filterinfocancel', // tests
                        handler: function() { this.hide(); this.destroy(); },
                        scope: this
                    }]
                }
            ]
        }];

        this.callParent();
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
    }
});
