/*
 * Copyright (c) 2014-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.GroupSave', {

    extend : 'Ext.panel.Panel',

    alias  : 'widget.groupsave',

    ui: 'custom',

    statics: {
        modes: {
            CREATE: 'CREATE',
            EDIT: 'EDIT',
            REPLACE: 'REPLACE'
        }
    },

    layout: {
        type: 'anchor'
    },

    defaultTitle: 'Save',

    hideSelectionWarning: true,

    minRecordsHeight: 4,

    maxRecordsHeight: 13,

    mabGroup: false,

    stores: ['FilterStatus', 'MabStatus'],

    constructor : function(config) {

        Ext.applyIf(config, {
            mode: Connector.view.GroupSave.modes.CREATE
        });

        this.callParent([config]);
    },

    initComponent : function()
    {
        this.items = [{
            xtype: 'container',
            itemId: 'content',
            style: 'padding-top: 6px;background-color: $gray-7',
            anchor: '100%',
            items: [
                {
                    xtype: 'box',
                    itemId: 'error',
                    hidden: true,
                    autoEl: {
                        tag: 'div',
                        cls: 'errormsg'
                    }
                },
                this.getCreateGroup(),
                this.getCancelSaveMenuBtns()
            ]
        }];

        LABKEY.Security.getUserPermissions({
            success: function (userPerms, resp)
            {
                if(this.getIsEditorOrHigher(userPerms))
                {
                    this.getGroupSharedCmp().show();
                }
            },
            scope: this
        });
        this.callParent();
    },

    getTitle : function()
    {
        return this.title;
    },

    getCreateGroup : function() {

        if (!this.createGroup) {
            var me = this;
            this.createGroup = Ext.create('Ext.Container', {
                hidden: this.mode !== Connector.view.GroupSave.modes.CREATE,
                activeMode: Connector.view.GroupSave.modes.CREATE,
                cls: 'groupsave-panel-container',
                itemId: 'create-group-container',
                items: [{
                    itemId: 'creategroupform',
                    xtype: 'form',
                    cls: 'groupsave-panel-form',
                    ui: 'custom',
                    width: '100%',
                    defaults: {
                        width: '100%'
                    },
                    items: [{
                        xtype: 'textfield',
                        cls: 'group-name-input',
                        itemId: 'groupname-cmp',
                        name: 'groupname',
                        emptyText: 'Enter a group name',
                        height: 30,
                        allowBlank: false,
                        validateOnBlur: false,
                        maxLength: 100,
                        listeners: {
                            //dynamic enable/disable of save button based on the presence of text in the group name field
                            change: function (field, newValue, oldValue) {

                                var saveBtn = me.getGroupSaveBtnCmp();

                                //disable if undefined, null, or an empty string
                                if (Ext.isEmpty(newValue) || newValue.trim() === '') {
                                    saveBtn.disable();
                                } else {
                                    saveBtn.enable();
                                }
                            }
                        }
                    }, {
                        xtype: 'textareafield',
                        cls: 'group-description-input',
                        itemId: 'groupdescription-cmp',
                        name: 'groupdescription',
                        emptyText: 'Group description',
                        maxLength: 200,
                        fieldLabel: 'Description',
                        labelAlign: 'top'
                    }, {
                        xtype: 'checkbox',
                        itemId: 'groupshared-cmp',
                        cls: 'group-shared-checkbox',
                        name: 'groupshared',
                        boxLabel: 'Shared group',
                        checked: false,
                        hidden: true
                    }]
                }, {
                    // cancel and save buttons for a new group
                    xtype: 'toolbar',
                    itemId: 'new-group-cancel-save-btns-cmp',
                    cls: 'groupsave-cancel-save-btns cancel-save-group-btns',
                    dock: 'bottom',
                    ui: 'lightfooter',
                    style: 'padding-top: 5px',
                    items: ['->', {
                        text: 'Cancel',
                        itemId: me.mabGroup ? 'mabgroupcancel' : 'groupcancel',
                        cls: 'group-cancel-btn groupcancelcreate'
                    }, {
                        text: 'Save group',
                        itemId: me.mabGroup ? 'mabgroupcreatesave-cmp' : 'groupcreatesave-cmp',
                        disabled: true,
                        cls: 'save-group-btn groupcreatesave' // tests
                    }]
                }],
                listeners: {
                    afterrender: {
                        fn: function (c) {
                            c.getComponent('creategroupform').getComponent('groupname-cmp').focus(false, true);
                        },
                        single: true,
                        scope: this
                    },
                    show: {
                        fn: function (c) {
                            c.getComponent('creategroupform').getComponent('groupname-cmp').focus(false, true);
                        },
                        scope: this
                    }
                },
                scope: this
            }, this);
        }
        return this.createGroup;
    },

    /**
     * Cancel and save buttons for an existing group, the save will allow updating or creating a new group
     */
    getCancelSaveMenuBtns : function() {

        return {
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'lightfooter',
            cls: 'groupsave-cancel-save-btns menu-btns',
            itemId: 'existing-group-cancel-save-btns-cmp',
            hidden: true,
            items: ['->', {
                text: 'Cancel',
                itemId: 'groupcancelbtn-itemid',
                cls: 'group-cancel-btn',
                handler: function() {
                    this.hide();
                    this.fireEvent('groupsave_cancel', this);
                }, scope : this
            }, {
                xtype: 'groupsavebutton',
                width : 100,
                itemId: 'groupsavebtn-itemid',
                cls: 'save-menu-btn groupsavebtn', // tests
            }]
        };
    },

    getMode : function() {
        return this.mode;
    },

    getIsEditorOrHigher : function (userPerms)
    {
        if ((userPerms.container.effectivePermissions.indexOf('org.labkey.api.security.permissions.UpdatePermission') !== -1)
                || (userPerms.container.effectivePermissions.indexOf('org.labkey.api.study.permissions.SharedParticipantGroupPermission') !== -1)
        )
            return true;
        else
            return false;
    },

    onSelectionChange : function(selections) {
        // update warning
        var sw = this.getComponent('content').getComponent('selectionwarning');
        if (sw) {
            sw.setVisible(selections.length !== 0);
        }
    },

    getActiveForm : function()
    {
        return this.getCreateGroup().getComponent('creategroupform');
    },

    clear : function() {
        var form = this.getCreateGroup().getComponent('creategroupform');
        if (form)
            form.getForm().reset();
    },

    reset : function() {
        // only reset in 'create' mode
        if (this.getMode() === Connector.view.GroupSave.modes.CREATE) {
            this.clear();
        }
    },

    getValues : function() {
        return this.getActiveForm().getValues();
    },

    isValid : function() {
        return this.getActiveForm().isValid();
    },

    getError : function() {
        return this.getComponent('content').getComponent('error');
    },

    showError : function(error) {
        var errorEl = this.getError();
        if (errorEl) {
            var grpName = this.getGroupNameCmp();
            if (grpName && !grpName.hidden) {
                grpName.addCls('invalid-group-name');
            }
            errorEl.update(error);
            errorEl.show();
        }
    },

    hideError : function() {
        var errorEl = this.getError();
        if (errorEl) {
            var grpName = this.getGroupNameCmp();
            if (grpName && !grpName.hidden) {
                grpName.removeCls('invalid-group-name');
            }
            errorEl.hide();
        }
    },

    getGroupNameCmp : function() {
        return Ext.ComponentQuery.query('textfield#groupname-cmp', this.createGroup)[0];
    },

    getGroupSharedCmp : function() {
        return Ext.ComponentQuery.query('checkbox#groupshared-cmp', this.createGroup)[0];
    },

    getGroupSaveBtnCmp : function() {
        var selector = this.mabGroup ? 'button#mabgroupcreatesave-cmp' : 'button#groupcreatesave-cmp';
        return Ext.ComponentQuery.query(selector, this.createGroup)[0];
    }
});