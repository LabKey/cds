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

    initComponent : function(){
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
                padding : '15 0 0 0'
            });
        }
        return this.summaryHeader;
    },

    getBody : function(){
        if (!this.summaryBody) {
            this.summaryBody = Ext.create('Connector.view.GroupSummaryBody', {group: this.group});
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

    initComponent: function(){
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
                cls: 'dimgroup',
                html: this.groupLabel
            }
        },{
            xtype: 'container',
            cls: 'dimgroup',
            items: [{
                xtype: 'button',
                ui : 'rounded-inverted-accent',
                text: 'back',
                handler: this.back
            },{
                xtype: 'button',
                ui : 'rounded-inverted-accent',
                text: 'delete',
                margin: '0 0 0 10',
                handler: this.deleteGroup
            }]
        }];

        this.height = 161;

        this.callParent();
    },

    back: function(){
        console.log("back clicked");
    },

    deleteGroup: function(){
        console.log("delete clicked");
    },

    updateView: function(group) {
        this.group = group;
        this.groupLabel = group.get('label');
        this.getComponent('grouplabel').update(this.groupLabel);
        this.doLayout();
    }
});

Ext.define('Connector.view.GroupSummaryBody', {
    extend : 'Ext.container.Container',

    alias : 'widget.groupsummarybody',

    margin: '25 0 0 25',

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
            value: desc
        });

        this.radioGroup = Ext.create('Ext.form.RadioGroup', {
            bodyPadding: 10,
            margin: '10 0 0 0',
            vertical: true,
            columns: 1,
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
            {xtype: 'box', html: '<h3>DESCRIPTION</h3>'},
            this.descDisplay,
            {xtype: 'box', html: '<h3>UPDATES</h3>'},
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
        this.radioGroup.setValue({updates: JSON.parse(group.get('filters')).isLive});
        this.doLayout();
    }
});
