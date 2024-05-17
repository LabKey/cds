/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.MabStatus', {
    extend: 'Connector.view.AbstractFilterStatus',

    alias: 'widget.mabstatus',

    cls: 'filterstatus',

    mabGroup: true,

    initComponent : function() {
        this.items = [
            this.getHeader(),
            this.getSubHeader(),
            {
                xtype: 'container',
                cls: 'filterstatus-items',
                itemId: 'filter-container',
                hidden: !this.hasMabFilters(),
                items: [
                    this.getSavedGroupName('mabgroupsummary'),
                    this.getSaveAsGroupBtn(),
                    this.getGroupSavePanel(),
                    this.getEditGroupBtn()
                ]
            }
        ];

        // register listeners
        this.on('edit-group', this.onEditGroup, this);
        this.callParent();
    },

    getSubHeader : function() {
        if (!this.emptyText) {
            this.emptyText = Ext.create('Ext.Component', {
                tpl: new Ext.XTemplate('<div class="emptytext {subcls:htmlEncode}">{subtitle:htmlEncode}</div>'),
                data: {subtitle: this.getSubHeaderText()},
                listeners: {
                    render: function() {this.onMabFilterChange()},
                    scope: this
                }
            });
        }
        return this.emptyText;
    },

    getSubHeaderText: function() {
        if (this.hasMabFilters())
            return 'From the mAb grid';
        return 'All mAbs';
    },

    getSubHeaderData: function() {
        if (this.hasMabFilters())
            return {
                subtitle: 'From the mAb grid',
                subcls: 'mab-subtitle-filtered'
            };
        return {
            subtitle: 'All mAbs',
            subcls: 'emptytext'
        }
    },

    getSaveAsGroupBtn : function() {
        var me = this;
        return {
            xtype: 'container',
            itemId: 'mabfilterSaveAsGroupBtn',
            cls: 'filter-save-as-group-btn-container',
            ui: 'custom',
            hidden : true,
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'button',
                text: '<div>Save as a group</div>', // need to wrap in div to get the 'g' in 'group' to fully show up otherwise it is cut off in the bottom
                ui: 'rounded-inverted-accent-small',
                cls: 'filter-save-as-group-btn filter-hdr-btn',
                itemId: 'mabsavegroup-cmp',
                style: 'margin-left: 110px; margin-right: auto; margin-top: 10px;',
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

    showGroupSavePanel(resetForm) {
        if(resetForm) {
            this.groupSave.hideError();
            this.groupSave.reset();
        }
        this.groupSave.show();
    },

    hasMabFilters: function() {
        return Connector.getState().getMabFilters().length > 0;
    },

    getHeaderData: function() {
        if (this.hasMabFilters())
            return {
                title: 'Filtered mAbs',
                headerCls: 'mab-section-title-filtered'
            };
        return {
            title: 'MAb Info',
            headerCls: 'section-title'
        };
    },

    getHeader : function () {
        return {
            xtype: 'container',
            itemId: 'mab-info-header',
            ui: 'custom',
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'box',
                cls: 'filterpanel-header',
                tpl: new Ext.XTemplate(
                        '<h2 class="mab-filterheader-text {headerCls:htmlEncode}">{title:htmlEncode}</h2>'
                ),
                itemId: 'title-text',
                data: this.getHeaderData()
            },{
                xtype: 'container',
                flex: 1
            },{
                xtype: 'button',
                text: 'clear',
                ui: 'rounded-small',
                ui: 'rounded-small',
                cls: 'filter-hdr-btn filter-clear-btn',
                itemId: 'clearmab',
                hidden: !this.hasMabFilters(),
                handler: this.clearMabFilters,
                scope: this
            }]
        }
    },

    onMabSelectionChange: function() {
        this.hideMessage(true);
    },

    onMabFilterChange : function() {
        this.hideMessage(true);
        this.updateButtons();
    },

    updateButtons : function() {
        var filterHeader = this.getComponent('mab-info-header');

        var titleText = filterHeader.query('#title-text')[0];
        if (!titleText)
            return;
        var subHeader = this.getSubHeader();
        titleText.update(this.getHeaderData());
        subHeader.update(this.getSubHeaderData());

        var clrBtn = filterHeader.query('#clearmab')[0];
        var saveGroupBtn = this.getSaveAsGroupBtnCmp();
        var savedGroupNameCmp = this.getSavedGroupNameCmp();

        if (!this.hasMabFilters()) {
            //saveBtn.hide();
            clrBtn.hide();
            saveGroupBtn.hide();
            savedGroupNameCmp.hide();
            this.hideEditGroupBtn();
        }
        else {
            //saveBtn.show();
            clrBtn.show();
            this.getFilterContainerCmp().show();
            saveGroupBtn.show();

            var savedGroup = this.getMabGroup();
            if (savedGroup) {
                this.showSavedGroup(savedGroup);
                this.showEditGroupBtn();
                saveGroupBtn.hide();
            }
        }
    },

    /**
     * Returns the group for editing purposes
     */
    getMabGroup : function() {
        var currentPage = window.location.href.split("#");
        var mabGroup;
        if (currentPage.length > 1 && (currentPage[1].indexOf("mabdatagrid") > -1 || currentPage[1].indexOf("mabgroupsummary") > -1)) {
            var groupSummary = currentPage[1].split("/");
            if (groupSummary.length === 3) {
                mabGroup = groupSummary[groupSummary.length - 1];
            }
        }

        if (mabGroup) {
            var id = mabGroup + '-mab';
            var grpStore = StoreCache.getStore('Connector.app.store.Group');
            if (grpStore && grpStore.getCount() > 0) {
                //display group label of a saved group
                return grpStore.query('id', id).items[0];
            }
        }
    },

    clearMabFilters: function() {
        Connector.getState().clearMabFilters(false, true);
        this.hideGroupLabel();
        this.hideGroupSavePanel();
        this.hideEditGroupBtn();
        this.getFilterContainerCmp().hide();
    },

    getGroupSavePanel : function() {
        if (!this.groupSave) {
            this.groupSave = Ext.create('Connector.view.GroupSave', {
                hidden: true,
                mabGroup : true,
                itemId: 'groupsave-mab-cmp',
                listeners : {
                    groupsave_cancel : {
                        fn : function(){this.onGroupSaveCancel();},
                        scope : this
                    }
                },
            });
        }
        return this.groupSave;
    },

    onGroupSaveCancel : function() {
        this.getSavedGroupNameCmp().show();
        this.getEditGroupBtnCmp().show();
    },

    getSaveAsGroupBtnCmp : function() {
        var filterContainer = this.getComponent('filter-container');
        if (filterContainer) {
            return filterContainer.getComponent('mabfilterSaveAsGroupBtn');
        }
    },

    getFilterContainerCmp : function () {
        return this.getComponent('filter-container');
    }
});
