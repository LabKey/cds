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

    isMabGroup: false,

    stores: ['FilterStatus', 'MabStatus'],

    constructor : function(config) {

        Ext.applyIf(config, {
            mode: Connector.view.GroupSave.modes.CREATE
        });

        var borderOffset = 2;
        this.listRecordHeight = 24; // number in 'px' for height of a record display
        this.listMaxHeight = (this.listRecordHeight * this.maxRecordsHeight) + borderOffset;
        this.listMinHeight = (this.listRecordHeight * this.minRecordsHeight) + borderOffset;

        this.callParent([config]);
    },

    initComponent : function()
    {
        //TODO: New active filters workflow doesn't apply to Mab groups just yet, once we decide we want the same workflow as
        // subject groups, we can remove this check and combine the two.
        // Notice such this.isMabGroup check throughout this file.
        if (this.isMabGroup) {
            this.items = [{
                xtype: 'container',
                itemId: 'content',
                style: 'margin: 10px; background-color: #fff; border: 1px solid lightgrey; padding: 10px',
                anchor: '100%',
                items: [
                    this.getTitle(),
                    {
                        xtype: 'box',
                        hidden: this.hideSelectionWarning,
                        itemId: 'selectionwarning',
                        autoEl: {
                            tag: 'div',
                            style: 'padding-top: 10px;',
                            children: [{
                                tag: 'img',
                                src: LABKEY.contextPath + '/Connector/images/warn.png',
                                height: '13px',
                                width: '13px',
                                style: 'vertical-align: middle; margin-right: 8px;'
                            },{
                                tag: 'span',
                                html: 'Current Selection will be applied'
                            }]
                        }
                    },
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
                    this.getEditGroup(),
                    this.getReplaceGroup()
                ]
            }];
            LABKEY.Security.getUserPermissions({
                success: function (userPerms, resp)
                {
                    if(this.getIsEditorOrHigher(userPerms))
                    {
                        Ext.getCmp('mabcreategroupshared').show();
                        Ext.getCmp('editgroupshared').show();
                        Ext.getCmp('updategroupshared').show();
                    }
                },
                scope: this
            });
        }
        else {
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
                        Ext.getCmp('creategroupshared').show();
                    }
                },
                scope: this
            });
        }



        this.callParent();

        Ext.EventManager.onWindowResize(this.onWindowResize, this);
    },

    getTitle : function()
    {
        if (this.isMabGroup) {
            if (!this.title)
            {
                this.title = Ext.create('Ext.Component', {
                    tpl: '<h2>{title:htmlEncode} group</h2>',
                    data: {
                        title: this.defaultTitle
                    }
                });
            }
        }
        return this.title;
    },

    getCreateGroup : function() {

        if (this.isMabGroup) {
            if (!this.createGroup) {
                this.createGroup = Ext.create('Ext.Container', {
                    hidden: this.mode !== Connector.view.GroupSave.modes.CREATE,
                    activeMode: Connector.view.GroupSave.modes.CREATE,
                    style: 'padding-top: 10px;',
                    items: [{
                        itemId: 'creategroupform',
                        xtype: 'form',
                        ui: 'custom',
                        width: '100%',
                        defaults: {
                            width: '100%'
                        },
                        items: [{
                            xtype: 'textfield',
                            itemId: 'groupname',
                            name: 'mabgroupname',
                            emptyText: 'Enter a group name',
                            height: 30,
                            allowBlank: false,
                            validateOnBlur: false,
                            maxLength: 100
                        },{
                            xtype: 'textareafield',
                            id: 'mabcreategroupdescription',
                            name: 'mabgroupdescription',
                            emptyText: 'Group description',
                            maxLength: 200
                        },{
                            xtype: 'checkbox',
                            id: 'mabcreategroupshared',
                            itemId: 'groupshared',
                            name: 'mabgroupshared',
                            fieldLabel: 'Shared group',
                            checked: false,
                            hidden: true
                        }]
                    },{
                        xtype: 'box',
                        autoEl: {
                            tag: 'div',
                            style: 'margin-top: 15px;',
                            html: 'Or...'
                        }
                    },{
                        xtype: 'button',
                        itemId: 'replace-grp-button',
                        style: 'margin-top: 15px;',
                        ui: 'linked-ul',
                        text: 'replace an existing group',
                        handler: function() { this.changeMode(Connector.view.GroupSave.modes.REPLACE); },
                        scope: this
                    },{
                        xtype: 'toolbar',
                        dock: 'bottom',
                        ui: 'lightfooter',
                        style: 'padding-top: 60px',
                        items: ['->',{
                            text: 'Cancel',
                            itemId: 'mabgroupcancel',
                            cls: 'groupcancelcreate mabgroupcancel' // tests
                        },{
                            text: 'Save',
                            itemId: 'mabgroupcreatesave',
                            cls: 'groupcreatesave mabgroupcreatesave' // tests
                        }]
                    }],
                    listeners : {
                        afterrender : {
                            fn: function(c) {
                                c.getComponent('creategroupform').getComponent('groupname').focus(false, true);
                            },
                            single: true,
                            scope: this
                        },
                        show : {
                            fn: function(c) {
                                c.getComponent('creategroupform').getComponent('groupname').focus(false, true);
                            },
                            scope: this
                        }
                    },
                    scope: this
                });
            }
        }
        else {
            if (!this.createGroup) {
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
                            itemId: 'groupname',
                            name: 'groupname',
                            emptyText: 'Enter a group name',
                            id: 'groupname-id',
                            height: 30,
                            allowBlank: false,
                            validateOnBlur: false,
                            maxLength: 100,
                            listeners: {
                                //dynamic enable/disable of save button based on the presence of text in the group name field
                                change: function (field, newValue, oldValue) {

                                    var saveBtn = Ext.getCmp('groupcreatesave-id');

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
                            id: 'creategroupdescription', // tests
                            itemId: 'groupdescription',
                            name: 'groupdescription',
                            emptyText: 'Group description',
                            maxLength: 200,
                            fieldLabel: 'Description',
                            labelAlign: 'top'
                        }, {
                            xtype: 'checkbox',
                            id: 'creategroupshared',
                            itemId: 'groupshared',
                            name: 'groupshared',
                            boxLabel: 'Shared group',
                            checked: false,
                            hidden: true
                        }]
                    }, {
                        xtype: 'toolbar',
                        id: 'groupsave-cancel-save-btns-id',
                        cls: 'groupsave-cancel-save-btns cancel-save-group-btns',
                        dock: 'bottom',
                        ui: 'lightfooter',
                        style: 'padding-top: 5px',
                        items: ['->', {
                            text: 'Cancel',
                            itemId: 'groupcancel',
                            id: 'groupcancel-id',
                            cls: 'group-cancel-btn groupcancelcreate'
                        }, {
                            text: 'Save group',
                            itemId: 'groupcreatesave',
                            disabled: true,
                            id: 'groupcreatesave-id',
                            cls: 'save-group-btn groupcreatesave' // tests
                        }]
                    }],
                    listeners: {
                        afterrender: {
                            fn: function (c) {
                                c.getComponent('creategroupform').getComponent('groupname').focus(false, true);
                            },
                            single: true,
                            scope: this
                        },
                        show: {
                            fn: function (c) {
                                c.getComponent('creategroupform').getComponent('groupname').focus(false, true);
                            },
                            scope: this
                        }
                    },
                    scope: this
                }, this);
            }
        }
        return this.createGroup;
    },

    getCancelSaveMenuBtns : function() {

        return {
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'lightfooter',
            cls: 'groupsave-cancel-save-btns menu-btns',
            id: 'groupsave-cancel-save-menu-btns-id',
            hidden: true,
            items: ['->', {
                text: 'Cancel',
                itemId: 'groupcancelbtn-itemid',
                cls: 'group-cancel-btn',
                handler: function() {
                    Ext.getCmp('savedgroupname-id').show();
                    Ext.getCmp('groupsave-id').hide();
                    Ext.getCmp('editgroupbtn-id').show();
                    Ext.getCmp('editgroupbtn-container-id').show();
                    Ext.getCmp('filterstatus-content-id').setMargin('0 0 0 0');
                }
            }, {
                xtype: 'groupsavebutton',
                width : 100,
                itemId: 'groupsavebtn-itemid',
                cls: 'save-menu-btn groupsavebtn', // tests
            }]
        };
    },

    getEditGroup : function()
    {
        if (!this._editGroup)
        {
            var editForm = Ext.create('Ext.Container', {
                hidden: this.mode !== Connector.view.GroupSave.modes.EDIT,
                activeMode: Connector.view.GroupSave.modes.EDIT,
                title: 'Edit',
                style: 'padding-top: 10px;',
                items: [{
                    itemId: 'creategroupform',
                    xtype: 'form',
                    ui: 'custom',
                    width: '100%',
                    style: 'padding-top: 10px;',
                    defaults: {
                        width: '100%'
                    },
                    flex: 1,
                    items: [{
                        xtype: 'textfield',
                        itemId: 'groupname',
                        name: 'mabgroupname',
                        emptyText: 'Enter a group name',
                        height: 30,
                        allowBlank: false,
                        validateOnBlur: false,
                        maxLength: 100
                    },{
                        xtype: 'box',
                        autoEl: {
                            tag: 'div',
                            style: 'padding: 5px 0; font-family: Verdana, sans-serif; font-size: 10pt;',
                            html: 'Description:'
                        }
                    },{
                        xtype: 'textareafield',
                        id: 'editgroupdescription',
                        itemId: 'groupdescription',
                        name: 'mabgroupdescription',
                        emptyText: 'No description provided',
                        maxLength: 200
                    },{
                        xtype: 'checkbox',
                        id: 'editgroupshared',
                        itemId: 'groupshared',
                        name: 'mabgroupshared',
                        fieldLabel: 'Shared group',
                        checked: false,
                        hidden: true
                    },{
                        xtype: 'hiddenfield',
                        itemId: 'groupid',
                        name: 'groupid'
                    },{
                        xtype: 'hiddenfield',
                        itemId: 'groupcategoryid',
                        name: 'groupcategoryid'
                    },{
                        xtype: 'hiddenfield',
                        itemId: 'groupfilters',
                        name: 'groupfilters'
                    },{
                        xtype: 'hiddenfield',
                        itemId: 'groupparticipantids',
                        name: 'groupparticipantids'
                    }]},{
                    xtype: 'toolbar',
                    dock: 'bottom',
                    ui: 'lightfooter',
                    style: 'padding-top: 60px',
                    items: ['->',{
                        text: 'Cancel',
                        itemId: 'groupcancel',
                        cls: 'groupcanceledit' // tests
                    },{
                        text: 'Save',
                        itemId: 'groupeditsave',
                        cls: 'groupeditsave' // tests
                    }]
                }],
                getForm : function()
                {
                    return editForm.getComponent('creategroupform');
                },
                listeners : {
                    afterrender : {
                        fn: function(c) {
                            c.getComponent('creategroupform').getComponent('groupdescription').focus(false, true);
                        },
                        scope: this
                    },
                    show : {
                        fn: function(c) {
                            c.getComponent('creategroupform').getComponent('groupdescription').focus(false, true);
                        },
                        scope: this
                    }
                }
            });

            this._editGroup = editForm;
        }

        return this._editGroup;
    },

    getReplaceGroup : function() {

        if (!this.replaceGroup) {
            var replaceForm = Ext.create('Ext.Container', {
                hidden: this.mode !== Connector.view.GroupSave.modes.REPLACE,
                activeMode: Connector.view.GroupSave.modes.REPLACE,
                style: 'padding-top: 10px;',
                items: [{
                    xtype: 'box',
                    autoEl: {
                        tag: 'div',
                        style: 'padding: 5px 0; font-family: Verdana, sans-serif; font-size: 10pt;',
                        html: 'My groups:'
                    }
                },{
                    xtype: 'container',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    minHeight: this.listMinHeight,
                    maxHeight: this.listMaxHeight,
                    style: 'border: 1px solid lightgrey;',
                    items: [{
                        xtype: 'groupsavelistview',
                        listeners: {
                            render: function(v)
                            {
                                this.grouplist = v;
                            },
                            select: function(sm, group)
                            {
                                this.setActive(group, replaceForm.getForm());
                            },
                            viewready: function(v)
                            {
                                var group = v.getStore().getAt(0);
                                if (group)
                                {
                                    v.getSelectionModel().select(0);
                                    this.setActive(group, replaceForm.getForm());
                                }
                                var bodyBox = Ext.getBody().getBox();
                                this.onWindowResize(bodyBox.width, bodyBox.height);
                            },
                            scope: this
                        },
                        scope: this
                    }]
                },{
                    itemId: 'creategroupform',
                    xtype: 'form',
                    ui: 'custom',
                    width: '100%',
                    style: 'padding-top: 10px;',
                    defaults: {
                        width: '100%'
                    },
                    flex: 1,
                    items: [{
                        xtype: 'box',
                        autoEl: {
                            tag: 'div',
                            style: 'padding: 5px 0; font-family: Verdana, sans-serif; font-size: 10pt;',
                            html: 'Description:'
                        }
                    },{
                        xtype: 'textareafield',
                        id: 'updategroupdescription',
                        itemId: 'groupdescription',
                        name: 'mabgroupdescription',
                        emptyText: 'No description provided',
                        maxLength: 200
                    },{
                        xtype: 'checkbox',
                        id: 'updategroupshared',
                        itemId: 'groupshared',
                        name: 'mabgroupshared',
                        fieldLabel: 'Shared group',
                        checked: false,
                        hidden: true
                    }]
                },{
                    xtype: 'box',
                    autoEl: {
                        tag: 'div',
                        style: 'margin-top: 15px;',
                        html: 'Or...'
                    }
                },{
                    xtype: 'button',
                    itemId: 'create-grp-button',
                    style: 'margin-top: 15px;',
                    ui: 'linked-ul',
                    text: 'create a new group',
                    handler: function() { this.changeMode(Connector.view.GroupSave.modes.CREATE); },
                    scope: this
                },{
                    xtype: 'toolbar',
                    dock: 'bottom',
                    ui: 'lightfooter',
                    style: 'padding-top: 60px',
                    items: ['->',{
                        text: 'Cancel',
                        itemId: 'mabgroupcancel',
                        cls: 'groupcancelreplace' // tests
                    },this.getGroupUpdateSaveBtn()]
                }],
                getForm : function()
                {
                    return replaceForm.getComponent('creategroupform');
                },
                listeners : {
                    show: this.refresh,
                    scope: this
                },
                scope: this
            });

            this.replaceGroup = replaceForm;
        }

        return this.replaceGroup;
    },

    getGroupUpdateSaveBtn : function()
    {
        if (!this.groupUpdateSaveBtn) {
            this.groupUpdateSaveBtn = Ext.create('Ext.Button', {
                text: 'Save',
                itemId: 'groupupdatesave',
                cls: 'groupupdatesave' // tests
            });
        }
        return this.groupUpdateSaveBtn;
    },

    changeMode : function(mode)
    {
        this.mode = mode;
        var content = this.getComponent('content');
        if (content)
        {
            var cc = content.items.items;
            for (var i=0; i < cc.length; i++)
            {
                if (Ext.isDefined(cc[i].activeMode))
                {
                    if (cc[i].activeMode === mode)
                    {
                        // update the title
                        this.getTitle().update({
                            title: cc[i].title || this.defaultTitle
                        });

                        // show/hide selection message
                        this.getComponent('content').getComponent('selectionwarning').hide();

                        cc[i].show();
                    }
                    else
                    {
                        cc[i].hide();
                    }
                }
            }
            this.hideError();
        }
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

    editGroup : function(group)
    {
        if (group)
        {
            this.changeMode(Connector.view.GroupSave.modes.EDIT);
            this.setActive(group, this.getEditGroup().getForm());
        }
    },

    onSelectionChange : function(selections) {
        // update warning
        var sw = this.getComponent('content').getComponent('selectionwarning');
        if (sw) {
            sw.setVisible(selections.length !== 0);
        }
    },

    setActive : function(groupModel, form)
    {
        if (form)
        {
            var group = Connector.model.FilterGroup.fromCohortGroup(groupModel),
                    _id = form.getComponent('groupid'),
                    name = form.getComponent('mabgroupname'),
                    description = form.getComponent('mabgroupdescription'),
                    categoryId = form.getComponent('groupcategoryid'),
                    shared = form.getComponent('mabgroupshared'),
                    filters = form.getComponent('groupfilters'),
                    participantIds = form.getComponent('groupparticipantids');

            if (_id)
            {
                _id.setValue(group.get('id'));
            }

            if (name)
            {
                name.setValue(group.get('label'));
            }

            if (description)
            {
                description.setValue(group.get('description'));
            }

            if (categoryId)
            {
                categoryId.setValue(group.get('categoryId'));
            }

            if (shared)
            {
                shared.setValue(group.get('shared'));
            }

            if (filters)
            {
                filters.setValue(Ext.encode({
                    isLive : true,
                    filters : group.get('filters')
                }));
            }

            if (participantIds)
            {
                participantIds.setValue(Ext.encode(group.get('participantIds')));
            }
        }
    },

    getActiveForm : function()
    {
        var active,
            modes = Connector.view.GroupSave.modes,
            mode = this.getMode();

        if (mode === modes.CREATE)
        {
            active = this.getCreateGroup();
        }
        else if (mode === modes.EDIT)
        {
            active = this.getEditGroup();
        }
        else
        {
            active = this.getReplaceGroup();
        }

        return active.getComponent('creategroupform');
    },

    refresh : function()
    {
        if (this.grouplist)
        {
            this.grouplist.getSelectionModel().deselectAll();
            this.grouplist.isMab = this.isMabGroup;
            var me = this;
            this.grouplist.getStore().refreshData(function toggleSave() {
                me.grouplist.filterGroups();
                var group = me.grouplist.getStore().getAt(0);
                if (group)
                {
                    me.getGroupUpdateSaveBtn().setDisabled(false);
                    me.grouplist.getSelectionModel().select(0);
                    me.setActive(group, me.getReplaceGroup().getForm());
                }
                else
                {
                    me.getGroupUpdateSaveBtn().setDisabled(true);
                }
            }, me);
        }
    },

    getSelectedGroup : function()
    {
        var grp;
        if (this.grouplist)
        {
            var selections = this.grouplist.getSelectionModel().getSelection();
            if (!Ext.isEmpty(selections))
            {
                grp = Connector.model.FilterGroup.fromCohortGroup(selections[0]);
            }
        }
        return grp;
    },

    clear : function() {
        var form = this.getCreateGroup().getComponent('creategroupform');
        if (form) {
            form.getForm().reset();
        }
        form = this.getReplaceGroup().getComponent('creategroupform');
        if (form) {
            form.getForm().reset();
        }
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
            var grpName = Ext.getCmp('groupname-id');
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
            var grpName = Ext.getCmp('groupname-id');
            if (grpName && !grpName.hidden) {
                grpName.removeCls('invalid-group-name');
            }
            errorEl.hide();
        }
        if (!this.isMabGroup)
            Ext.getCmp('filterstatus-content-id').setMargin('0 0 0 0');
    },

    onWindowResize : function(width, height)
    {
        if (this.getMode() == Connector.view.GroupSave.modes.REPLACE)
        {
            var hdrHeight = 53,
                    paddingOffset = 20, // [10, 0, 10, 0]
                    trueHeight = height - hdrHeight - paddingOffset,
                    contentHeight = this.getComponent('content').getBox().height,
                    listHeight = this.grouplist.getBox().height,
                    h = listHeight;

            if (trueHeight < contentHeight)
            {
                h = listHeight - (contentHeight - trueHeight);
            }
            else
            {
                // window height allow for more space, see if group list can expand
                var lh = this.grouplist.getStore().getCount() * this.listRecordHeight,
                        maxHeight = Math.min(this.listMaxHeight, lh),
                        diff = trueHeight - contentHeight;

                h = Math.min(maxHeight, listHeight + diff);
            }

            this.grouplist.setHeight(h);
        }
    }
});

Ext.define('Connector.view.GroupSaveList', {

    extend: 'Ext.view.View',

    alias: 'widget.groupsavelistview',

    trackOver: true,

    emptyText: '<div><span class="empty-group-label x-form-field x-form-empty-field">No groups defined</span>',

    overItemCls: 'save-label-over',

    selectedItemCls: 'save-label-selected',

    itemSelector: 'div.save-label',

    tpl: new Ext.XTemplate(
            '<tpl for=".">',
            '<div class="save-label" title="{label:htmlEncode}">{label:htmlEncode}</div>',
            '</tpl>'
    ),

    loadMask: false,

    viewConfig: {
        loadMask: false
    },

    isMab: false,

    initComponent : function() {

        this.store = this.cloneGroupStore(Connector.model.Group.getGroupStore());
        this.filterGroups();
        this.callParent();
    },

    filterGroups: function() {
        var isMab = this.isMab;
        this.store.filterBy(function(record) {
            if (isMab)
                return record.get('type') === 'mab';
            else
                return record.get('type') !== 'mab';
        });
    },

    cloneGroupStore: function(source) {

        var clone = Ext.create('Ext.data.Store', {
            model : 'Connector.model.Group'
        });
        Ext.each(source.getRange(), function(record) {
            clone.add(Ext.clone(record.copy()));
        });
        clone.refreshData = source.refreshData;

        return clone;
    }
});
