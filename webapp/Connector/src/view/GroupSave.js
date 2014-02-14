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
                        name: 'groupname',
                        emptyText: 'Enter a group name',
                        height: 30,
                        allowBlank: false
                    },{
                        xtype: 'textareafield',
                        name: 'groupdescription',
                        emptyText: 'Group description'
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
                scope: this
            });
        }

        return this.createGroup;
    },

    getReplaceGroup : function() {
        if (!this.replaceGroup) {
            this.replaceGroup = Ext.create('Ext.Container', {
                hidden: this.mode !== Connector.view.GroupSave.modes.REPLACE,
                activeMode: Connector.view.GroupSave.modes.REPLACE,
                items: [{
                    itemId: 'creategroupform',
                    xtype: 'form',
                    ui: 'custom',
                    width: '100%',
                    defaults: {
                        width: '100%'
                    },
                    items: [{
                        xtype: 'textareafield',
                        name: 'groupdescription',
                        emptyText: 'Group description'
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