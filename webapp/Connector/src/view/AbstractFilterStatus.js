/*
 * Copyright (c) 2014-2024 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.AbstractFilterStatus', {
    extend: 'Ext.panel.Panel',
    mixins: {
        undohelper: 'Connector.utility.InfoPaneUtil'
    },

    ui: 'custom',

    groupSave: undefined,           // need to create group save component

    mabGroup: false,                // represents a mab group

    /**
     * Displays the current group name being edited,
     */
    getSavedGroupName: function (controller) {
        return {
            xtype: 'container',
            itemId: this.mabGroup ? 'savedmabgroupname-cmp' : 'savedgroupname-cmp',
            ui: 'custom',
            cls: 'savedgroup-label-container',
            hidden: true,
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'box',
                cls: 'savedgroup-label',
                id: 'savedgroup-label-id',
                tpl: new Ext.XTemplate(
                        '<h4>',
                        '<a href="#group/' + controller + '/{groupId}">{savedGroupName:htmlEncode}</a>',
                        '</h4>',
                ),
                data: {
                    savedGroupName: '',
                    groupId: undefined
                }
            }],
        }
    },

    getEditGroupBtn : function() {

        var me = this;
        return {
            xtype: 'container',
            itemId: this.mabGroup ? 'editmabgroupbtn-cmp' : 'editgroupbtn-cmp',
            ui: 'custom',
            layout: {
                type: 'hbox'
            },
            hidden : true,
            cls: 'edit-group-btn-container',
            style: 'margin-left: 140px; margin-right: auto; margin-top: 10px;',
            items: [{
                xtype: 'button',
                text: 'Save as', //previously 'Edit group'
                ui: 'rounded-inverted-accent-small',
                cls: 'edit-group-btn',
                handler: function() {
                    me.fireEvent('edit-group', me);
                }
            }]
        };
    },

    getGroupNameCmp : function() {
        return Ext.ComponentQuery.query('textfield#groupname-cmp', this.groupSave)[0];
    },

    getGroupDescriptionCmp : function() {
        return Ext.ComponentQuery.query('textareafield#groupdescription-cmp', this.groupSave)[0];
    },

    getGroupSharedCmp : function() {
        return Ext.ComponentQuery.query('checkbox#groupshared-cmp', this.groupSave)[0];
    },

    getNewGroupCancelAndSaveGroupBtnsCmp : function() {
        return Ext.ComponentQuery.query('toolbar#new-group-cancel-save-btns-cmp', this.groupSave)[0];
    },

    getExistingGroupCancelAndSaveGroupBtnsCmp : function() {
        return Ext.ComponentQuery.query('toolbar#existing-group-cancel-save-btns-cmp', this.groupSave)[0];
    },

    getEditGroupBtnCmp : function() {
        var filterContainer = this.getComponent('filter-container');
        if (filterContainer) {
            if (this.mabGroup)
                return filterContainer.getComponent('editmabgroupbtn-cmp');
            else
                return filterContainer.getComponent('editgroupbtn-cmp');
        }
    },

    getSavedGroupNameCmp : function() {
        var filterContainer = this.getComponent('filter-container');
        if (filterContainer) {
            if (this.mabGroup)
                return filterContainer.getComponent('savedmabgroupname-cmp');
            else
                return filterContainer.getComponent('savedgroupname-cmp');
        }
    },

    hideGroupLabel() {
        this.getSavedGroupNameCmp().hide();
    },

    hideGroupSavePanel() {
        this.groupSave.hide();
    },

    showEditGroupBtn() {
        this.getEditGroupBtnCmp().show();
    },

    hideEditGroupBtn() {
        this.getEditGroupBtnCmp().hide();
    },

    hideCancelAndSaveGroupBtns() {
        this.getNewGroupCancelAndSaveGroupBtnsCmp().hide();
    },

    showCancelAndSaveMenuBtns() {
        this.getExistingGroupCancelAndSaveGroupBtnsCmp().show();
    },

    showSavedGroup : function(group) {
        //display group label of a saved group
        var groupNameCmp = this.getSavedGroupNameCmp();
        var groupName = group.get('label');

        groupNameCmp.items.get(0).update({ savedGroupName : groupName, groupId: this.mabGroup ? group.get('rowid') : group.get('id') });
        groupNameCmp.show();

        //set the group-save form values
        this.getGroupNameCmp().setValue(groupName);
        this.getGroupDescriptionCmp().setValue(group.get('description'));
        this.getGroupSharedCmp().setValue(group.get('shared'));
    }
});
