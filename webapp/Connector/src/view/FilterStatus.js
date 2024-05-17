/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.FilterStatus', {
    extend: 'Connector.view.AbstractFilterStatus',

    alias: 'widget.filterstatus',

    cls: 'filterstatus',

    id: 'filterstatus-id',

    listeners: {

        afterrender: function (panel) {

            var hidden = !(this.filters && this.filters.length > 0) || !(this.selections && this.selections.length > 0);

            if (hidden) {

                this.hideGroupLabel();
                this.hideGroupSavePanel();
                this.resetFilterStatusBackGroundColor();
                this.hideEditGroupBtn();
                this.hideSaveAsGroupBtn();
            }
        }
    },

    resetFilterStatusBackGroundColor() {
        document.getElementById('filterstatus-items-id').style.backgroundColor = '#fff';
    },

    hideSaveAsGroupBtn() {
        Ext.getCmp('filter-save-as-group-btn-id').hide();
    },

    showGroupSavePanel(resetForm) {
        if(resetForm) {
            this.groupSave.hideError();
            this.groupSave.reset();

            var cancelSaveBtn = this.getNewGroupCancelAndSaveGroupBtnsCmp();
            var cancelSaveMenuBtn = this.getExistingGroupCancelAndSaveGroupBtnsCmp();

            if (!cancelSaveMenuBtn.hidden && cancelSaveBtn.hidden) {
                cancelSaveMenuBtn.hide();
                cancelSaveBtn.show();
            }
        }
        this.groupSave.show();
    },

    initComponent : function() {

        this.items = [
            this.getFilterHeader(),
            {
                xtype: 'container',
                cls: 'filterstatus-items',
                itemId: 'filter-container',
                id: 'filterstatus-items-id',
                items: [
                    this.getSavedGroupName('groupsummary'),
                    this.getGroupSavePanel(),
                    this.getEmptyText(),
                    this.getFilterContent(),
                    this.getFilterSaveAsGroupBtn(),
                    this.getEditGroupBtn()
                ]
            }
        ];

        // register listeners
        this.on('edit-group', this.onEditGroup, this);
        this.callParent();

        this.attachInternalListeners();
    },

    attachInternalListeners : function() {

        this.resizeTask = new Ext.util.DelayedTask(function() {
            this.resizeMessage();
        }, this);

        Ext.EventManager.onWindowResize(function() {
            this.resizeTask.delay(150);
        }, this);
    },

    getFilterHeader : function() {

        //
        // If filters or selections are present then we show the buttons (== !hidden)
        //
        var hidden = !(this.filters && this.filters.length > 0) || !(this.selections && this.selections.length > 0);
        var me = this;
        return {
            xtype: 'container',
            itemId: 'filterheader',
            ui: 'custom',
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'box',
                cls: 'filterpanel-header',
                tpl: new Ext.XTemplate(
                    '<h2 class="filterheader-text section-title">{title:htmlEncode}</h2>'
                ),
                data: {
                    title: 'Active filters'
                }
            },{
                xtype: 'container',
                flex: 1
            },{
                xtype: 'button', 
                text: 'clear',
                ui: 'rounded-small',
                cls: 'filter-hdr-btn filter-clear-btn' /* for tests */,
                itemId: 'clear',
                hidden: hidden,
                handler: function() {
                    me.hideGroupLabel();
                    me.hideSaveAsGroupBtn();
                    me.hideGroupSavePanel();
                    me.resetFilterStatusBackGroundColor();
                    me.hideEditGroupBtn();
                }
            }]
        };
    },

    getGroupSavePanel : function() {
        if (!this.groupSave) {
            this.groupSave = Ext.create('Connector.view.GroupSave', {
                hidden: true,
                itemId: 'groupsave-cmp',
                listeners : {
                    groupsave_cancel : {
                        fn : function(){this.onGroupSaveCancel();},
                        scope : this
                    }
                }
            });
        }
        return this.groupSave;
    },

    onGroupSaveCancel : function() {
        this.getSavedGroupNameCmp().show();
        this.getEditGroupBtnCmp().show();
    },

    getFilterSaveAsGroupBtn : function() {

        //
        // If filters or selections are present then we show the buttons (== !hidden)
        //
        var hidden = !(this.filters && this.filters.length > 0) || !(this.selections && this.selections.length > 0);
        var me = this;
        return {
            xtype: 'container',
            itemId: 'filterSaveAsGroupBtn',
            cls: 'filter-save-as-group-btn-container',
            id: 'filter-save-as-group-btn-container-id',
            ui: 'custom',
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'button',
                id: 'filter-save-as-group-btn-id',
                text: '<div>Save as a group</div>', // need to wrap in div to get the 'g' in 'group' to fully show up otherwise it is cut off in the bottom
                ui: 'rounded-inverted-accent-small',
                cls: 'filter-save-as-group-btn filter-hdr-btn',
                itemId: 'savegroup',
                style: 'margin-left: 110px; margin-right: auto; margin-top: 10px;',
                hidden: hidden,
                handler: function() {
                    this.hide();
                    me.showGroupSavePanel(true);
                }
            }]
        };
    },

    onEditGroup : function() {
        this.hideEditGroupBtn();
        this.hideGroupLabel();
        this.hideCancelAndSaveGroupBtns();
        this.groupSave.hideError();
        this.groupSave.show();
        this.showCancelAndSaveMenuBtns();
    },

    getEmptyText : function() {
        if (!this.emptyText) {
            this.emptyText = Ext.create('Ext.Component', {
                id: 'filterstatus-emptytext-id',
                style: 'background-color: #fff;',
                tpl: new Ext.XTemplate('<div class="emptytext">All subjects</div>'),
                data: {}
            });
        }
        return this.emptyText;
    },

    getFilterContent : function() {
        if (!this.filterContent) {
            this.filterContent = Ext.create('Ext.Container', {
                cls: 'filterstatus-content',
                hidden: !(this.filters && this.filters.length > 0) || !(this.selections && this.selections.length > 0),
                items: [
                    this.getFilterPanel(),
                    this.getSelectionPanel()
                ]
            });
        }

        return this.filterContent;
    },

    getFilterPanel : function() {
        if (this.filterpanel) {
            return this.filterpanel;
        }

        this.filterpanel = Ext.create('Connector.panel.FilterPanel', {
            id: 'filter-panel',
            filters: this.filters
        });

        return this.filterpanel;
    },

    getSelectionPanel : function() {
        if (this.selectionpanel) {
            return this.selectionpanel;
        }

        this.selectionpanel = Ext.create('Connector.panel.Selection', {
            id: 'selection-panel',
            filters: this.selections
        });

        return this.selectionpanel;
    },

    // This is called when the filter count changes, as well as when the filters change
    onFilterCount : function(filters) {
        if (this.filterpanel) {
            this.filterpanel.loadFilters(filters);
            this.checkButtons();
        }
    },

    //23658 - Don't remove undo message when applying filter removal to plot.
    onFilterChange : function(filters) {
        this.hideMessage(true);
        this.onFilterCount(filters)
    },

    onSelectionChange : function(selections, opChange) {
        this.hideMessage(true);
        this.selections = selections;
        if (!opChange && this.selectionpanel) {
            this.selectionpanel.loadFilters(selections);

            // update the filter panel here
            var filterPanel = this.getFilterPanel();
            if (filterPanel) {
                filterPanel.onSelectionChange(selections);
                this.checkButtons();
            }
        }
    },

    checkButtons : function() {

        var filters = Connector.getState().getFilters();
        var selections = Connector.getState().getSelections();

        var filterHeader = this.getComponent('filterheader');
        var headerText = Ext.get(Ext.DomQuery.select('.filterheader-text')[0]);

        var filterStatusItems = Ext.getCmp('filterstatus-items-id').items;
        var saveBtn = filterStatusItems.find(function(item) {return item.itemId === 'filterSaveAsGroupBtn'; }).items.items[0]; //'Save as a group' button

        var clrBtn = filterHeader.query('#clear')[0];

        var editGrpBtn = this.getEditGroupBtnCmp();
        var filterContent = this.getFilterContent();
        var emptyText = this.getEmptyText();
        var groupLabelCmp = this.getSavedGroupNameCmp();

        if (filters.length === 0 && selections.length === 0) {
            headerText.replaceCls('section-title-filtered', 'section-title');
            emptyText.show();
            filterContent.hide();
            saveBtn.hide();
            clrBtn.hide();
            groupLabelCmp.hide();
        }
        else {
            document.getElementById('filterstatus-items-id').style.backgroundColor = '#ebebeb';
            headerText.replaceCls('section-title', 'section-title-filtered');
            emptyText.hide();
            filterContent.show();

            var grpId = this.getGroupId();

            // when the group is displayed with filtered values (i.e. when user clicks on a Group from Home page of Learn > Groups page)
            // then it should be ready for Editing
            if (grpId > -1) {

                var grpStore = StoreCache.getStore('Connector.app.store.Group');

                if (grpStore && grpStore.getCount() > 0) {

                    var savedGroup = grpStore.query('id', grpId).items[0];
                    if (savedGroup)
                        this.showSavedGroup(savedGroup);
                }
                this.showEditGroupBtn();
            }

            // show 'Save as a group' button when the filters are applied and Group Save form and Edit button are not displayed
            if (editGrpBtn.hidden && this.groupSave.hidden) {
                saveBtn.show();
            }
            else if (!this.groupSave.hidden) {
                this.hideEditGroupBtn();
                this.hideGroupLabel();
            }
            else {
                saveBtn.hide();
            }

            // always display the Clear button when filters are applied
            clrBtn.show();
        }
    },

    getGroupId: function() {
        var currentPage = window.location.href.split("#");
        if (currentPage.length > 1 && currentPage[1].indexOf("groupsummary") > -1) {
            var groupSummary = currentPage[1].split("/");
            if (groupSummary.length === 3) {
                return groupSummary[groupSummary.length - 1];
            }
        }
        return -1;
    },

    onBeforeViewChange : function() {
        if (Connector.getState().hasSelections()) {
            this.undoMsg = "Selection applied as filter.";
            Connector.getState().moveSelectionToFilter();
        }
    }
});
