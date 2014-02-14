/*
 * Copyright (c) 2012-2013 LabKey Corporation
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
            REPLACE: 'REPLACE'
        }
    },

    layout: {
        type: 'anchor'
    },

    constructor : function(config) {

        Ext.applyIf(config, {
            mode: Connector.view.GroupSave.modes.CREATE
        });

        this.callParent([config]);
    },

    initComponent : function() {

        this.items = [{
            xtype: 'container',
            itemId: 'content',
            style: 'margin: 10px; background-color: #fff; border: 1px solid lightgrey; padding: 10px',
            anchor: '100%',
            items: [
                {
                    xtype: 'box',
                    autoEl: {
                        tag: 'h2',
                        html: 'Save group'
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
                this.getReplaceGroup()
            ]
        }];

        this.callParent();
    },

    getCreateGroup : function() {
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
                        name: 'groupname',
                        emptyText: 'Enter a group name',
                        height: 30,
                        allowBlank: false,
                        validateOnBlur: false
                    },{
                        xtype: 'textareafield',
                        name: 'groupdescription',
                        emptyText: 'Group description'
                    },{
                        xtype: 'radiogroup',
                        columns: 1,
                        allowBlank: false,
                        validateOnBlur: false,
                        items: [
                            { boxLabel: 'Live Filters: Update group with new data', name: 'groupselect', inputValue: 'live', checked: true},
                            { boxLabel: 'Snapshot: Keep this group static', name: 'groupselect', inputValue: 'static' }
                        ]
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
                    ui: 'rounded-inverted-accent',
                    text: 'replace an existing group',
                    handler: function() { this.changeMode(Connector.view.GroupSave.modes.REPLACE); },
                    scope: this
                },{
                    xtype: 'toolbar',
                    dock: 'bottom',
                    ui: 'footer',
                    style: 'padding-top: 60px',
                    items: ['->',{
                        text: 'save',
                        itemId: 'groupcreatesave',
                        cls: 'groupcreatesave', // tests
                        ui: 'rounded-inverted-accent'
                    },{
                        text: 'cancel',
                        itemId: 'cancelgroupsave',
                        cls: 'cancelgroupsave', // tests
                        ui: 'rounded-inverted-accent'
                    }]
                }],
                listeners : {
                    afterrender : {
                        fn: function(c) {
                            c.getComponent('creategroupform').getComponent('groupname').focus(false, true);
                        },
                        single: true,
                        scope: this
                    }
                },
                scope: this
            });
        }

        return this.createGroup;
    },

    getReplaceGroup : function() {

        // models Participant Groups and Cohorts mixed
        Ext.define('LABKEY.study.GroupCohort', {
            extend : 'Ext.data.Model',
            fields : [
                {name : 'id'},
                {name : 'label'},
                {name : 'description'},
                {name : 'filters'},
                {name : 'type'}
            ]
        });

        if (!this.replaceGroup) {
            this.replaceGroup = Ext.create('Ext.Container', {
                hidden: this.mode !== Connector.view.GroupSave.modes.REPLACE,
                activeMode: Connector.view.GroupSave.modes.REPLACE,
                style: 'padding-top: 10px;',
                items: [{
                    xtype: 'box',
                    autoEl: {
                        tag: 'div',
                        style: 'padding: 5px 0; font-family: Arial; font-size: 11pt;',
                        html: 'My groups:'
                    }
                },{
                    xtype: 'container',
                    height: 70,
                    overflowY: 'auto',
                    style: 'border: 1px solid lightgrey;',
                    items: [{
                        xtype: 'groupsavelistview',
                        listeners: {
                            select: function(sm, group) {
                                this.setActive(group);
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
                    items: [{
                        xtype: 'box',
                        autoEl: {
                            tag: 'div',
                            style: 'padding: 5px 0; font-family: Arial; font-size: 11pt;',
                            html: 'Description:'
                        }
                    },{
                        xtype: 'textareafield',
                        itemId: 'groupdescription',
                        name: 'groupdescription'
                    },{
                        xtype: 'radiogroup',
                        columns: 1,
                        allowBlank: false,
                        items: [
                            { boxLabel: 'Live Filters: Update group with new data', name: 'groupselect', inputValue: 'live', checked: true},
                            { boxLabel: 'Snapshot: Keep this group static', name: 'groupselect', inputValue: 'static' }
                        ]
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
                    ui: 'rounded-inverted-accent',
                    text: 'create a new group',
                    handler: function() { this.changeMode(Connector.view.GroupSave.modes.CREATE); },
                    scope: this
                },{
                    xtype: 'toolbar',
                    dock: 'bottom',
                    ui: 'footer',
                    style: 'padding-top: 60px',
                    items: ['->',{
                        text: 'save',
                        itemId: 'dogroupsave',
                        cls: 'groupupdatesave', // tests
                        ui: 'rounded-inverted-accent'
                    },{
                        text: 'cancel',
                        itemId: 'cancelgroupsave',
                        cls: 'groupupdatecancel', // tests
                        ui: 'rounded-inverted-accent'
                    }]
                }],
                scope: this
            });
        }

        return this.replaceGroup;
    },

    changeMode : function(mode) {
        var content = this.getComponent('content');
        if (content) {
            var contentComponents = content.items.items;
            for (var i=0; i < contentComponents.length; i++) {
                if (Ext.isDefined(contentComponents[i].activeMode)) {
                    if (contentComponents[i].activeMode === mode) {
                        contentComponents[i].show();
                    }
                    else {
                        contentComponents[i].hide();
                    }
                }
            }
            this.hideError();
        }
    },

    getMode : function() {
        return this.mode;
    },

    setActive : function(groupModel) {
        var form = this.replaceGroup.getComponent('creategroupform');
        if (form) {
            var description = form.getComponent('groupdescription');
            var d = groupModel.get('description');
            console.log(groupModel.get('label'));
            console.log(d);
            description.setValue(d);
        }
    },

    clearForm : function() {
        if (this.form) {
            this.form.getForm().reset();
            this.hideError();
        }
    },

    getError : function() {
        return this.getComponent('content').getComponent('error');
    },

    showError : function(error) {
        var errorEl = this.getError();
        if (errorEl) {
            errorEl.update(error);
            errorEl.show();
        }
    },

    hideError : function() {
        var errorEl = this.getError();
        if (errorEl) {
            errorEl.hide();
        }
    }
});

Ext.define('Connector.view.GroupSaveList', {

    extend: 'Ext.view.View',

    alias: 'widget.groupsavelistview',

    trackOver: true,

    emptyText: '<div class="emptytext"><span class="left-label">No groups defined</span>',

    overItemCls: 'save-label-over',

    selectedItemCls: 'save-label-selected',

    itemSelector: 'div.save-label',

    tpl: new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="save-label">{label}</div>',
            '</tpl>'
    ),

    initComponent : function() {

        // models Participant Groups and Cohorts mixed
        if (!Ext4.ModelManager.isRegistered('LABKEY.study.GroupCohort')) {
            Ext.define('LABKEY.study.GroupCohort', {
                extend : 'Ext.data.Model',
                fields : [
                    {name : 'id'},
                    {name : 'label'},
                    {name : 'description'},
                    {name : 'filters'},
                    {name : 'type'}
                ]
            });
        }

        var storeConfig = {
            pageSize : 100,
            model    : 'LABKEY.study.GroupCohort',
            autoLoad : true,
            proxy    : {
                type   : 'ajax',
                url    : LABKEY.ActionURL.buildURL('participant-group', 'browseParticipantGroups.api'),
                reader : {
                    type : 'json',
                    root : 'groups'
                }
            },
            listeners : {
                load : function(s, recs) {
                    for (var i=0; i < recs.length; i++)
                    {
                        if (recs[i].data.id < 0)
                            s.remove(recs[i]);
                    }
                }
            }
        };

        var groupConfig = Ext.clone(storeConfig);
        Ext.apply(groupConfig.proxy, {
            extraParams : { type : 'participantGroup'}
        });

        this.store = Ext.create('Ext.data.Store', groupConfig);

        this.callParent();
    }
});