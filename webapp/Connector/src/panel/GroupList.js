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

    emptyText: '<div class="emptytext"><span class="left-label">No groups defined</span></div>',

    cls: 'grouplist-view',

    overItemCls: 'grouplist-label-over',

    itemSelector: 'div.nav-label',

    tpl: new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="nav-label">{label}</div>',
            '</tpl>'
    ),

    initComponent : function() {

        this.selectedItemCls = 'grouplist-label-selected '+ this.arrow;

        this.store = Connector.model.Group.getGroupStore();

        this.callParent();
    }
});