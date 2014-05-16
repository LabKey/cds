/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.GroupList', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.grouplist',

    cls: 'grouplist',

    plain: true,

    ui: 'custom',

    initComponent : function() {

        this.items = [this.getGroupListView()];

        this.callParent();
    },

    getGroupListView : function() {
        if (this.grouplist)
            return this.grouplist;

        this.grouplist = Ext.create('Connector.view.GroupListView', {
            arrow: this.arrow
        });

        return this.grouplist;
    }
});

Ext.define('Connector.view.GroupListView', {

    extend: 'Ext.view.View',

    alias: 'widget.grouplistview',

    trackOver: true,

    deferEmptyText: false,

    loadMask: false,

    margin: '30 0 0 0',

    cls: 'grouplist-view',

    overItemCls: 'grouplist-over',

    itemSelector: 'div.grouprow',

    tpl: new Ext.XTemplate(
        '<div class="grouplist-header">My Saved Groups and Plots</div>',
        '<tpl if="this.isEmpty(values)">',
            '<div class="grouplist-empty">Saved work will appear here</div>',
        '</tpl>',
        '<tpl for=".">',
            '<div class="grouprow">',
                '<div class="groupicon">&nbsp;</div>',
                '<div class="grouplabel">{label:htmlEncode}</div>',
                '<div class="closeitem"></div>',
            '</div>',
        '</tpl>',
        {
            isEmpty : function(v) {
                return (!Ext.isArray(v) || v.length === 0);
            }
        }
    ),

    initComponent : function() {

        this.selectedItemCls = 'grouplist-label-selected '+ this.arrow;

        this.store = Connector.model.Group.getGroupStore();

        this.callParent();
    }
});