/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.GroupSummary', {

    extend : 'Ext.panel.Panel',

    alias : 'widget.groupsummary',

    requires: ['Connector.model.Group'],

    plugins : [{
        ptype: 'messaging',
        calculateY : function(cmp, box) {
            return box.y + 145;
        }
    }],

    group: undefined,

    groupId: undefined,

    constructor : function(config) {
        this.callParent([config]);

        this.addEvents('requestfilterundo', 'loadgroupfilters', 'requestgroupdelete', 'requestback');
    },

    initComponent : function() {
        if (!this.groupId) {
            throw 'groupId must be specified';
        }

        this.items = [];

        this.callParent();

        if (this.store.getCount() > 0) {
            var recIdx = this.store.find('id', this.groupId, false, true, true);
            if (recIdx > -1) {
                this.group = this.store.getAt(recIdx);
                this.onStoreLoad();
            }
        }
        else {
            this.store.on('load', this.onStoreLoad, this, {single: true});
        }
    },

    onStoreLoad: function()
    {
        this.removeAll();
        this.add([this.generateHeader(this.group), this.generateBody(this.group)]);
        this.doLayout();

        this.requestFilterChange();
    },

    showFiltersMessage: function() {
        var id = Ext.id();

        this.showMessage('Your filters have been replaced by this saved group. <a id="' + id + '">Undo</a>', true);

        var undo = Ext.get(id);

        if (undo) {
            undo.on('click', function() {
                this.fireEvent('requestfilterundo');
                this.hideMessage(true);
            }, this, {single: true});
        }
    },

    filterChange: function() {
        this.fireEvent('loadgroupfilters');
        this.showFiltersMessage();
    },

    requestFilterChange: function() {
        if (this.showMessage) {
            this.filterChange();
        }
        else {
            this.on('boxready', this.filterChange, this, {single: true});
        }
    },

    generateHeader : function(group) {
        return Ext.create('Connector.view.PageHeader', {
            title: group.get('label'),
            upText: 'Group',
            upLink: {
                controller: 'home'
            }
        });
    },

    onDelete : function(group) {
        if (this.showMessage) {
            this.hideMessage(true);
            var id = Ext.id();
            var cancelId = Ext.id();
            this.showMessage('Are you sure you want to delete "' + Ext.String.ellipsis(Ext.htmlEncode(group.get('label')), 35, true) + '"? <a id="' + id + '">Delete</a>&nbsp;<a id="' + cancelId + '">Cancel</a>', true, false, true);
            var deleteLink = Ext.get(id);
            if (deleteLink) {
                deleteLink.on('click', function() { this.fireEvent('requestgroupdelete', group.get('id')); }, this, {single: true});
            }
            var cancelLink = Ext.get(cancelId);
            if (cancelLink) {
                cancelLink.on('click', function() { this.hideMessage(true); }, this, {single: true});
            }
        }
    },

    generateBody : function(group) {
        return Ext.create('Connector.view.GroupSummaryBody', {
            group: group
        });
    },

    updateView : function(id) {
        var idx;

        if (id !== undefined && id !== null) {
            this.groupId = id;
        }

        idx = this.store.find('id', this.groupId, false, true, true);

        if (idx > -1) {
            this.group = this.store.getAt(idx);
            this.onStoreLoad();
        }
        else {
            console.log('group not found, throw not found.');
        }
    },

    getGroup : function() {
        if (this.group) {
            return Ext.clone(this.group.data);
        }
    }
});

Ext.define('Connector.view.GroupSummaryHeader', {
    extend : 'Ext.container.Container',

    alias : 'widget.groupsummaryheader',

    margin: '25 0 0 25',

    layout: {
        type : 'vbox',
        align: 'stretch'
    },

    cls: 'header-container',

    height: 180,

    defaults: {
        ui: 'custom'
    },

    constructor : function(config) {
        this.callParent([config]);

        this.addEvents('loadgroupfilters', 'requestgroupdelete', 'requestback');
    },

    initComponent : function() {
        if (this.group) {
            this.groupLabel = this.group.get('label');
        }
        else {
            this.groupLabel = '';
        }

        this.items = [{
            itemId: 'grouplabel',
            xtype: 'box',
            margin: '0 0 20 0',
            tpl: new Ext.XTemplate('<h2 class="lhdv active">{groupLabel:htmlEncode}</h2>'),
            data: {groupLabel: this.groupLabel}
        },{
            xtype: 'container',
            cls: 'dimgroup',
            items: [{
                xtype: 'button',
                text: '&#9668;&nbsp;back',
                handler: this.back,
                scope: this
            }, {
                xtype: 'button',
                text: 'delete',
                margin: '0 0 0 10',
                handler: this.deleteGroup,
                scope: this
            }]
        }];

        this.callParent();
    },

    back : function() {
        this.fireEvent('requestback');
    },

    applyFilters : function() {
        this.fireEvent('loadgroupfilters');
    },

    deleteGroup : function() {
        this.fireEvent('deletegroup', this.group);
    },

    updateView : function(group) {
        this.group = group;
        this.groupLabel = group.get('label');
        this.getComponent('grouplabel').update({groupLabel: this.groupLabel});
        this.doLayout();
    }
});

Ext.define('Connector.view.GroupSummaryBody', {
    extend : 'Ext.container.Container',

    margin: '25 0 0 25',

    initComponent: function()
    {
        this.items = [{
            xtype: 'box',
            tpl: '<div class="module"><h3>Description</h3></div>',
            data: {}
        },{
            xtype: 'displayfield',
            itemId: 'descDisplay',
            margin: '10 0 20 0',
            bodyPadding: 10,
            width: '50%',
            htmlEncode: true,
            value: this._getDescription(this.group)
        }];

        this.callParent();
    },

    updateView: function(group)
    {
        this.group = group;
        this.getComponent('descDisplay').setValue(this._getDescription(this.group));
        this.doLayout();
    },

    _getDescription : function(group)
    {
        var desc = '';

        if (group) {
            desc = group.get('description');
            if (Ext.isEmpty(desc)) {
                desc = 'No description given.';
            }
        }

        return desc;
    }
});
