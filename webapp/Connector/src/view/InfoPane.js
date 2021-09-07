/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.InfoPane', {

    extend: 'Ext.container.Container',

    alias: 'widget.infopane',

    ui: 'custom',

    layout: {
        type: 'vbox',
        align: 'stretch',
        pack: 'start'
    },

    margin: 0,

    padding: 0,

    flex: 1,

    cls: 'infopane',

    autoScroll: true,

    columnHeaderText: 'All',

    hideHeaders: false,

    showTitle: true,

    showSelection: true,

    showSort: true,

    isShowOperator: true,

    groupTitle: 'active filters',

    displayTitle: '',

    mutated: false,

    statics: {
        getExportableFilterStrings : function (filter, mdx)
        {
            var level = mdx.getLevel(filter.get("level")), label;

            if (level) {
                label = level.hierarchy.dimension.friendlyName;

                // friendlyName was not overridden so compose label with lvl info
                if (label === level.hierarchy.dimension.singularName) {
                    if (Ext.isDefined(level.countSingular)) {
                        // escape redundant dim/lvl naming (e.g. Study (Study))
                        if (level.countSingular.toLowerCase() !== label.toLowerCase()) {
                            label += ' (' + level.countSingular + ')';
                        }
                    }
                    else {
                        label += ' (' + level.name + ')';
                    }
                }
            }

            var filterType = '';
            if (filter.get('operator') === 'AND')
                filterType = "Subjects related to all: ";
            else
                filterType = "Subjects related to any: ";
            var filterValue = Connector.view.InfoPane.getMembersStr(filter.getMembers());
            return [label + ChartUtils.ANTIGEN_LEVEL_DELIMITER + filterType + filterValue];
        },

        getMembersStr: function(members)
        {
            var content = '',
                    sep = '';
            for (var i=0; i < members.length && i < 10; i++) {
                content += sep + Connector.view.InfoPane.getMemberStr(members[i].uniqueName);
                sep = ', ';
            }
            return content;
        },

        getMemberStr: function(uniqueName)
        {
            var arrayName = Connector.view.Selection.uniqueNameAsArray(uniqueName);
            var member = arrayName[arrayName.length-1];
            if (member === '#null') {
                member = 'Unknown';
            }
            return member;
        }
    },

    initComponent : function() {

        // This is the set of keys for selected records to determine if the filter has been mutated
        this.initialKeys = [];

        var btnId = Ext.id();
        var model = this.getModel();

        // If the model does not provide a title, use the panes default displayTitle
        if (Ext.isString(model.get('title')) && model.get('title').length === 0) {
            model.set('title', this.displayTitle);
        }

        this.items = [];

        if (this.showTitle) {
            this.items.push({
                xtype: 'box',
                tpl: new Ext.XTemplate(
                    '<h2>{title:htmlEncode}</h2>'
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
                itemId: 'infosortbyinput',
                items: [{
                    xtype: 'box',
                    tpl: new Ext.XTemplate(
                            '<div class="sorter">',
                                '<span class="sorter-label">Sorted by:</span>',
                                '<span class="sorter-content">{hierarchyLabel:htmlEncode}</span>',
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
                }, this.getInfoSortDropDownButton(btnId)
                ],
                listeners :{
                    render: function(cmp) {
                        cmp.getEl().on('click', function() {
                            Ext.getCmp(btnId).showMenu();
                        });
                    }
                }
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

        if (this.isShowOperator && model.isShowOperator()) {
            middleContent.items.push({
                itemId: 'operatorlabel',
                xtype: 'box',
                tpl: new Ext.XTemplate(
                    '<div style="margin-top: 20px;">',
                        '<span class="label">Subjects can fall into multiple types.</span>',
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
                        inputValue: Connector.model.Filter.OperatorTypes.OR,
                        checked: model.isOR()
                    },{
                        boxLabel: 'Subjects related to all (AND)',
                        name: 'operator',
                        inputValue: Connector.model.Filter.OperatorTypes.AND,
                        checked: model.isAND()
                    }
                ],
                listeners: {
                    change: this.onOperatorChange,
                    scope: this
                }
            });
        }

        Ext.each(this.getMiddleContent(model), function(content) {
            middleContent.items.push(content);
        }, this);

        this.items.push(middleContent);

        //
        // Toolbar configuration
        //
        this.items.push(this.getToolbarConfig(model));

        this.callParent();
        this.bindModel();

        var state = Connector.getState();
        state.on('selectionchange', function() { this.hide(); }, this, {single: true});
        state.on('filterchange', function() { this.hide(); }, this, {single: true});
        state.on('mabfilterchange', function() { this.hide(); }, this, {single: true});
    },

    getInfoSortDropDownButton: function(btnId) {
        if (!this.infoSortDropDownButton) {
            this.infoSortDropDownButton = {
                id: btnId,
                xtype: 'imgbutton',
                itemId: 'infosortdropdown',
                cls: 'sortDropdown ipdropdown', // tests
                style: 'float: right;',
                vector: 21,
                width: 21,
                margin: '20 0 0 20',
                menu: {
                    xtype: 'menu',
                    autoShow: true,
                    itemId: 'infosortedmenu',
                    showSeparator: false,
                    width: 200,
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
                        b.showMenu(); b.hideMenu(); // allows the menu to layout/render

                        // we don't want to show the dropdown if there is only one item to select (current one)
                        if (!b.hidden && Ext.isDefined(b.menu) && b.menu.items.items.length < 2) {
                            b.hide();
                        }
                    },
                    scope: this
                }
            }
        }
        return this.infoSortDropDownButton;
    },

    inSelectionMode : function() {
        return Connector.getState().getSelections().length > 0;
    },

    getMiddleContent : function(model) {
        var me = this;
        var isSelectionMode = this.inSelectionMode();

        var gridConfig = {
            xtype: 'grid',
            itemId: 'membergrid',
            store: this.getMemberStore(),
            viewConfig : { stripeRows : false },

            hideHeaders: this.hideHeaders,

            /* Column configuration */
            enableColumnHide: false,
            enableColumnResize: false,
            columns: [{
                xtype: 'templatecolumn',
                header: this.columnHeaderText,
                dataIndex: 'name',
                flex: 1,
                sortable: false,
                menuDisabled: true,
                tpl: new Ext.XTemplate(
                    '<tpl if="this.hasOtherName(values) === true">',
                        '<div class="single-axis-explorer" title="{otherName:htmlEncode}">{name:htmlEncode}',
                    '<tpl else>',
                        '<div class="single-axis-explorer" title="{name:htmlEncode}">{name:htmlEncode}',
                    '</tpl>',
                    '<tpl if="hasDetails === true">',
                        '<a class="expando" href="{detailLink}">',
                            '<span class="icontext">learn about</span>',
                            '<img src="' + Connector.resourceContext.path + '/images/cleardot.gif" class="iconone">',
                        '</a>',
                    '</tpl>',
                    '</div>',
                    {
                hasOtherName : function(vals) {
                    return !Ext.isEmpty(vals.otherName);
                }
            }
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
                            if (isSelectionMode) {
                                return v ? 'Has data in current selection' : 'No data in current selection';
                            }

                            return v ? 'Has data in ' + me.groupTitle : 'No data in ' + me.groupTitle;
                        }
                    }
                )
            }],

            /* Styling configuration */
            border: false,
            ui: 'custom',
            cls : 'measuresgrid infopanegrid',

            listeners: {
                itemmouseenter : this.showItemTooltip,
                itemmouseleave : this.hideItemTooltip,
                viewready : function(grid) {
                    this.gridready = true;
                },
                selectionchange : function(selModel, selections) {

                    // compare keys to determine mutation
                    var keys = [];
                    Ext.each(selections, function(model) {
                        keys.push(model.internalId);
                    });
                    keys.sort();
                    this.mutated = !Ext.Array.equals(this.initialKeys, keys);

                    if (this.filterBtn) {
                        this.filterBtn.setDisabled(selections.length === 0);
                    }
                },
                selectioncomplete: function() {

                    this.mutated = false;
                    this.initialKeys = [];

                    Ext.each(this.getGrid().getSelectionModel().getSelection(), function(model) {
                        this.initialKeys.push(model.internalId);
                    }, this);

                    this.initialKeys.sort();
                },
                scope: this
            }
        };

        if (this.showSelection) {
            gridConfig = Ext.apply(gridConfig, {
                /* Selection configuration */
                selType: 'checkboxmodel',
                selModel: {
                    checkSelector: 'td.x-grid-cell-row-checker'
                },
                multiSelect: true
            });
        }

        var memberGrid = Ext.create('Ext.grid.Panel', gridConfig);

        // plugin to handle loading mask for this grid
        memberGrid.addPlugin({
            ptype: 'loadingmask',
            configs: [{
                element: memberGrid,
                beginEvent: 'render',
                endEvent: 'selectioncomplete'
            }]
        });

        return [memberGrid];
    },

    getToolbarConfig : function(model) {
        return {
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'lightfooter',
            items: ['->',
                {
                    text: 'Cancel',
                    cls: 'filterinfocancel', // tests
                    handler: function() { this.hide(); },
                    scope: this
                },{
                    text: model.isFilterBased() ? 'Update' : 'Filter',
                    cls: 'filterinfoaction', // tests
                    handler: this.onUpdate,
                    listeners: {
                        afterrender: function(btn) {
                            this.filterBtn = btn;
                            this.getModel().on('change', function(model) {
                                btn.setText(model.isFilterBased() ? 'Update' : 'Filter');
                            }, btn);
                        },
                        scope: this
                    },
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
            // only create/update filter if the state has been mutated
            if (this.mutated) {
                this.fireEvent('filtercomplete', grid.getSelectionModel().getSelection(), grid.getStore().getCount());
            }
            this.hide();
        }
    },

    bindLearnAboutDetailClick: function()
    {
        if (!this.bindLearnAboutDetailTask)
        {
            this.bindLearnAboutDetailTask = new Ext.util.DelayedTask(function() {
                var anodes = Ext.DomQuery.select('a.expando');
                Ext.each(anodes, function(node) {
                    Ext.get(node).on('mousedown', function(evt) {
                        evt.stopPropagation();
                        return false;
                    });
                    Ext.get(node).on('click', function(evt) {
                        evt.stopPropagation();
                        return false;
                    });
                });
            }, this);
        }
        this.bindLearnAboutDetailTask.delay(200);
    },

    updateSelections : function() {

        var grid = this.getGrid(),
            sm = grid.getSelectionModel(),
            store = grid.getStore(),
            storeCount = store.getCount(),
            selItems = this.getModel().get('selectedItems'),
            members = [], idx;

        if (sm.hasSelection()) {
            sm.deselectAll();
        }

        Ext.each(selItems, function(uniqueName) {
            idx = store.findExact('uniqueName', uniqueName);
            if (idx > -1) {
                members.push(store.getAt(idx));
            }
        });

        if (members.length > 0) {

            if (members.length === storeCount) {
                sm.selectAll(true);
            }
            else {
                sm.select(members, false, true);
            }

            this.bindLearnAboutDetailClick();
        }

        //
        // Configure default operator
        //
        var model = this.getModel();

        if (model.isShowOperator()) {
            if (model.isREQ()) {
                this.hideOperator();
            }
            else {
                this.showOperator();
            }
        }

        grid.fireEvent('selectioncomplete', this);
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

        Ext.each(model.get('hierarchyItems'), function(item) {
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
        var _item = Ext.clone(item);
        if (_item.isLevel) {
            this.getModel().configure(null, null, _item.uniqueName);
        }
        else {
            this.getModel().configure(null, _item.uniqueName);
        }
    },

    getGrid : function() {
        return this.getComponent('middle').getComponent('membergrid');
    },

    getModel : function() {
        return this.model;
    },

    getMemberStore : function() {
        return this.getModel().get('memberStore');
    },

    showItemTooltip : function(cmp, rec) {
        if (rec) {
            var highlighted = Ext.dom.Query.select('div.single-axis-explorer:contains(' + rec.data.name + ')');
            var el = Ext.get(highlighted[0]);

            if (el) {
                var calloutMgr = hopscotch.getCalloutManager(),
                        _id = el.id,
                        displayTooltip = setTimeout(function() {
                            calloutMgr.createCallout(Ext.apply({
                                id: _id,
                                xOffset: -30,
                                yOffset: -20,
                                showCloseButton: false,
                                target: highlighted[0],
                                placement: 'left',
                                content: rec.data.description,
                                width: 200
                            }, {}));
                        }, 200);

                this.on('hideTooltip', function() {
                    clearTimeout(displayTooltip);
                    calloutMgr.removeCallout(_id);
                }, this);
            }
        }
    },

    hideItemTooltip : function() {
        this.fireEvent('hideTooltip');
    }
});
