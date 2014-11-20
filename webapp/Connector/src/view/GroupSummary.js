/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.GroupSummary', {

    extend : 'Ext.panel.Panel',

    alias : 'widget.groupsummary',

    requires: ['Connector.model.Group'],

    plugins : [{
        ptype: 'messaging',
        calculateY : function(cmp, box, msg) {
            return box.y + 145;
        }
    }],

    constructor : function(config) {
        this.callParent([config]);

        this.addEvents('requestfilterundo', 'loadgroupfilters', 'requestgroupupdate', 'requestgroupdelete', 'requestback');
    },

    initComponent : function() {
        this.group = null;

        if (!this.groupId) {
            console.log("No id, throw not found error.");
        }

        if (this.store.getCount() > 0) {
            var recIdx = this.store.find('id', this.groupId, false, true, true);
            if (recIdx > -1) {
                this.group = this.store.getAt(recIdx);
                this.requestFilterChange();
            }
        } else {
            this.store.on('load', this.onStoreLoad, this, {single: true});
        }

        this.items = [
            this.getHeader(),
            this.getBody()
        ];

        this.callParent();
    },

    onStoreLoad: function() {
        this.updateView();
    },

    showFiltersMessage: function() {
        var id = Ext.id();

        this.showMessage('Your filters have been replaced by this saved group. <a id="' + id + '">Undo</a>', true);

        var undo = Ext.get(id);

        if (undo) {
            undo.on('click', function(){
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
        } else {
            this.on('boxready', this.filterChange, this, {single: true});
        }
    },

    getHeader : function(){
        if (!this.summaryHeader) {
            this.summaryHeader = Ext.create('Connector.view.GroupSummaryHeader', {
                group: this.group,
                padding : '15 0 0 0',
                listeners: {
                    scope: this,
                    requestgroupdelete: function(id) {
                        this.fireEvent('requestgroupdelete', id);
                    },
                    loadgroupfilters: function() {
                        this.requestFilterChange();
                    },
                    requestback: function(){
                        this.fireEvent('requestback');
                    }
                }
            });

            this.summaryHeader.on('deletegroup', this.onDelete, this);
        }
        return this.summaryHeader;
    },

    onDelete : function(group) {
        if (this.showMessage) {
            this.hideMessage(true);
            var id = Ext.id();
            var cancelId = Ext.id();
            this.showMessage('Are you sure you want to delete "' + Ext.String.ellipsis(Ext.htmlEncode(group.get('label')), 35, true) + '"? <a id="' + id + '">Delete</a>&nbsp;<a id="' + cancelId + '">Cancel</a>', true, false, true);
            var deleteLink = Ext.get(id);
            if (deleteLink) {
//                this.fireEvent('requestgroupdelete', this.group.data.id);
                deleteLink.on('click', function() { this.fireEvent('requestgroupdelete', group.get('id')); }, this, {single: true});
            }
            var cancelLink = Ext.get(cancelId);
            if (cancelLink) {
                cancelLink.on('click', function() { this.hideMessage(true); }, this, {single: true});
            }
        }
    },

    getBody : function(){
        if (!this.summaryBody) {
            this.summaryBody = Ext.create('Connector.view.GroupSummaryBody', {
                group: this.group,
                listeners: {
                    scope: this,
                    requestgroupupdate : function(group) {
                        this.fireEvent('requestgroupupdate', group);
                    }
                }
            });
        }
        return this.summaryBody;
    },

    updateView : function(id){
        var idx;

        if (id !== undefined && id !== null) {
            this.groupId = id;
        }

        idx = this.store.find('id', this.groupId, false, true, true);

        if (idx > -1) {
            this.group = this.store.getAt(idx);
            this.requestFilterChange();
            this.summaryHeader.updateView(this.group);
            this.summaryBody.updateView(this.group);
        } else {
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

    layout: {
        type : 'vbox',
        align: 'stretch'
    },

    cls: 'dimensionview',

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
        } else {
            this.groupLabel = '';
        }

        this.items = [{
            itemId: 'grouplabel',
            xtype: 'box',
            autoEl: {
                tag: 'div',
                cls: 'titlepanel',
                children: [{
                    tag: 'h1',
                    html: Ext.String.htmlEncode(this.groupLabel)
                }]
            }
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
                text: 'apply filters',
                margin: '0 0 0 10',
                handler: this.applyFilters,
                scope: this
            }, {
                xtype: 'button',
                text: 'delete',
                margin: '0 0 0 10',
                handler: this.deleteGroup,
                scope: this
            }]
        }];

        this.height = 160;

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
        this.getComponent('grouplabel').update('<h1>' + Ext.String.htmlEncode(this.groupLabel) + '</h1>');
        this.doLayout();
    }
});

Ext.define('Connector.view.GroupSummaryBody', {
    extend : 'Ext.container.Container',

    alias : 'widget.groupsummarybody',

    margin: '25 0 0 25',

    constructor : function(config) {
        this.callParent([config]);

        this.addEvents('requestgroupupdate');
    },

    initComponent: function() {
        var desc = '', isLive = false;

        if (this.group) {
            desc = this.group.get('description');
            if (desc.length == 0) {
                desc = 'No description given.';
            }
            isLive = JSON.parse(this.group.get('filters')).isLive;
        }

        this.descDisplay = Ext.create('Ext.form.field.Display', {
            xtype: 'displayfield',
            margin: '10 0 20 0',
            bodyPadding: 10,
            width: '50%',
            htmlEncode: true,
            value: desc
        });

        this.radioGroup = Ext.create('Ext.form.RadioGroup', {
            bodyPadding: 10,
            margin: '10 0 0 0',
            vertical: true,
            columns: 1,
            listeners: {
                scope: this,
                change: function(rg, newValue, oldValue) {
                    var isLive = newValue.updates;
                    var grp = Ext.clone(this.group.data);
                    var fil = Ext.decode(grp.filters).filters;
                    var models = [];
                    Ext.each(fil, function(f) {
                        models.push(Ext.create('Connector.model.Filter', f));
                    });
                    grp.filters = LABKEY.app.model.Filter.toJSON(models, isLive);
                    this.fireEvent('requestgroupupdate', grp);
                }
            },
            items: [{
                boxLabel: 'Live: Update group with new data',
                name: 'updates',
                inputValue: true,
                checked: isLive
            }, {
                boxLabel: 'Snapshot: Keep this group static',
                name: 'updates',
                inputValue: false,
                checked: !isLive
            }]
        });

        this.items = [
            {xtype: 'box', cls: 'headline', autoEl: { tag: 'h3', html: 'Description' }},
            this.descDisplay,
            {xtype: 'box', cls: 'headline', autoEl: { tag: 'h3', html: 'Updates' }},
            this.radioGroup
        ];
        this.callParent();
    },

    updateView: function(group) {
        this.group = group;
        var desc = this.group.get('description');
        if (desc.length == 0) {
            desc = 'No description given.';
        }
        this.descDisplay.setValue(desc);
        // Temporarily suspend events because we don't want to trigger a group save when we're loading a group.
        this.radioGroup.suspendEvents(false);
        this.radioGroup.setValue({updates: JSON.parse(group.get('filters')).isLive});
        this.radioGroup.resumeEvents();
        this.doLayout();
    }
});
