/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.GroupList', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.grouplist',

    cls: 'grouplist',

    plain: true,

    ui: 'custom',

    bubbleEvents: ['deletegroup'],

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

    cls: 'grouplist-view',

    overItemCls: 'grouplist-over',

    itemSelector: 'div.grouprow',

    bubbleEvents: ['deletegroup'],

    tpl: new Ext.XTemplate(
        '<tpl if="this.isEmpty(values)">',
            '<h2 class="section-title bottom-spacer">Groups and plots</h2>',
            '<div class="grouplist-empty">Saved work will appear here</div>',
        '</tpl>',
        '<tpl for=".">',
            '{[this.renderGroupHeading(values, parent, xindex)]}',
            '<div class="grouprow">',
                '<div title="{label:htmlEncode}" class="grouplabel">{label:this.groupLabel}</div>',
                '<tpl if="this.plotter(containsPlot)">',
                    '<div class="groupicon"><img src="' + Connector.resourceContext.imgPath + '/plot.png"></div>',
                '</tpl>',
            '</div>',
        '</tpl>',
        {
            isEmpty : function(v) {
                return (!Ext.isArray(v) || v.length === 0);
            },
            groupLabel : function(label) {
                return Ext.String.ellipsis(Ext.htmlEncode(label), 35, true);
            },
            plotter : function(containsPlot) {
                return containsPlot === true;
            },
            renderGroupHeading : function(values, parent, xindex) {
                // Note: the xindex is 1-based so the previous tile is xindex - 2 in the parent array
                var prev = parent[xindex - 2];
                if (prev == undefined || prev.shared != values.shared) {

                    var shared = values.shared, topSpacer = '';
                    if (shared === false) {
                        heading = 'My saved groups and plots';
                    }
                    else {
                        heading = 'Curated groups and plots';
                        if (prev)
                            topSpacer = ' top-spacer-lg';
                    }
                    return '<h2 class=\"section-title bottom-spacer' + topSpacer + '\">' + Ext.htmlEncode(heading) + '</h2>';
                }

                return '';
            }
        }
    ),

    constructor: function(config) {

        this.callParent([config]);

        this.addEvents('deletegroup');
    },

    initComponent : function() {

        this.selectedItemCls = 'grouplist-label-selected '+ this.arrow;

        this.store = Connector.model.Group.getGroupStore();

        this.callParent();
    },

    onRemoveClick : function(evt, element) {

        if (element) {
            var el = Ext.get(element);
            var index = el.getAttribute('group-index');
            var store = this.getStore();
            var group = store.getAt(index);
            if (group) {
                evt.stopPropagation();
                this.fireEvent('deletegroup', group);
            }
        }
    }
});