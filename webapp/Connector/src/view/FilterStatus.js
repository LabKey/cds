/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.FilterStatus', {
    extend: 'Ext.panel.Panel',
    mixins: {
        undohelper: 'Connector.utility.InfoPaneUtil'
    },

    alias: 'widget.filterstatus',

    ui: 'custom',

    cls: 'filterstatus',

    id: 'filterstatus-id',

    initComponent : function() {

        this.items = [
            this.getFilterHeader(),
            this.getSavedGroupName(),
            this.getGroupSavePanel(),
            this.getEmptyText(),
            this.getFilterContent(),
            this.getFilterSaveAsGroupBtn(),
            this.getEditGroupBtn()
        ];

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
                cls: 'filter-hdr-btn filterclear' /* for tests */,
                itemId: 'clear',
                hidden: hidden,
                handler: function() {
                    Ext.getCmp('editgroupbtn-id').hide();
                }
            }]
        };
    },

    getSavedGroupName : function() {
        return {
           xtype: 'container',
           itemId: 'savedgroupname-itemid',
           id: 'savedgroupname-id',
           ui: 'custom',
           hidden: true,
           layout: {
               type: 'hbox'
           },
            items: [{
                xtype: 'box',
                cls: 'savedgroup-label',
                id: 'savedgroup-label-id',
                tpl: new Ext.XTemplate(
                        '<h4>{savedGroupName:htmlEncode}</h4>'
                ),
                data: {
                    savedGroupName: ''
                }
            }],
        }
    },

    getGroupSavePanel : function() {
        return Ext.create('Connector.view.GroupSave', {
            hidden: true,
            id: 'groupsave-id'
        });
    },

    getFilterSaveAsGroupBtn : function() {

        //
        // If filters or selections are present then we show the buttons (== !hidden)
        //
        var hidden = !(this.filters && this.filters.length > 0) || !(this.selections && this.selections.length > 0);

        return {
            xtype: 'container',
            itemId: 'filterSaveAsGroupBtn',
            ui: 'custom',
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'button',
                id: 'saveasagroupbtn-id',
                text: '<div>Save as a group</div>', // need to wrap in div to get the 'g' in 'group' to fully show up otherwise it is cut off in the bottom
                ui: 'rounded-inverted-accent-small',
                cls: 'filtersaveasgroup filter-hdr-btn' /* for tests */,
                itemId: 'savegroup',
                hidden: hidden,
                handler: function() {
                    this.hide();
                    document.getElementById('filterstatus-id').style.height = '330px';
                    document.getElementById('filterstatus-content-id').style.marginTop = '10px';
                    Ext.getCmp('groupsave-id').show();
                }
            }]
        };
    },

    getEditGroupBtn : function() {

        return {
            xtype: 'container',
            id: 'editgroupbtn-container-id',
            itemId: 'editGroupBtn',
            ui: 'custom',
            layout: {
                type: 'hbox'
            },
            style: 'height: 50px; margin-left: 135px; margin-top: 10px;',
            items: [{
                xtype: 'button',
                id: 'editgroupbtn-id',
                text: '<div>Edit group</div>', // need to wrap in div to get the 'g' in 'group' to fully show up otherwise it is cut off in the bottom
                ui: 'rounded-inverted-accent-small',
                cls: 'editgroup filter-hdr-btn' /* for tests */,
                itemId: 'editgroupbtn-itemid',
                hidden: true,
                handler: function() {

                    this.hide();
                    document.getElementById('filterstatus-id').style.height = '330px';
                    document.getElementById('filterstatus-content-id').style.marginTop = '10px';
                    var groupSavePanel = Ext.getCmp('groupsave-id');
                    Ext.getCmp('groupsave-cancel-save-btns-id').hide();
                    Ext.getCmp('savedgroupname-id').hide();
                    groupSavePanel.hideError();
                    groupSavePanel.show();
                    Ext.getCmp('groupsave-cancel-save-menu-btns-id').show();
                }
            }]
        };
    },

    getEmptyText : function() {
        if (!this.emptyText) {
            this.emptyText = Ext.create('Ext.Component', {
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
                id: 'filterstatus-content-id',
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
        var saveAsGroupBtn = this.getComponent('filterSaveAsGroupBtn');

        var saveBtn = saveAsGroupBtn.query('#savegroup')[0]; //'Save as a group' button
        var clrBtn = filterHeader.query('#clear')[0];

        var filterContent = this.getFilterContent();
        var emptyText = this.getEmptyText();

        if (filters.length === 0 && selections.length === 0) {
            headerText.replaceCls('section-title-filtered', 'section-title');
            emptyText.show();
            filterContent.hide();
            saveBtn.hide();
            clrBtn.hide();
        }
        else {
            headerText.replaceCls('section-title', 'section-title-filtered');
            emptyText.hide();
            filterContent.show();

            var grpId = this.getGroupId();

            // when the group is displayed with filtered values (i.e. when user clicks on a Group from Home page of Learn > Groups page)
            // then it should be ready for Editing
            if (grpId > -1) {

                var grpStore = Connector.model.Group.getGroupStore();

                if (grpStore && grpStore.getCount() > 0) {

                    //display group label of a saved group
                    var groupLabel = grpStore.query('id', grpId).items[0].data.label;
                    var groupLabelCmp = Ext.getCmp('savedgroupname-id');
                    groupLabelCmp.items.get(0).update({ savedGroupName : groupLabel });
                    groupLabelCmp.show();

                    //set group save form values
                    Ext.getCmp('groupname-id').setValue(groupLabel);

                    var description = grpStore.query('id', grpId).items[0].data.description;
                    Ext.getCmp('creategroupdescription').setValue(description);

                    var shared = grpStore.query('id', grpId).items[0].data.shared;
                    Ext.getCmp('creategroupshared').setValue(shared);
                }

                // display 'Edit group' button
                Ext.getCmp('editgroupbtn-id').show();
            }

            // show 'Save as a group' button when the filters are applied and Group Save form and Edit button are not displayed
            if (Ext.getCmp('editgroupbtn-id').hidden && Ext.getCmp('groupsave-id').hidden) {
                saveBtn.show();
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
