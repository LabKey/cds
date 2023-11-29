/*
 * Copyright (c) 2014-2016 LabKey Corporation
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
            '{[this.setSavedGroupsLength(values)]}',
            '{[this.setSharedGroupsLength(values)]}',
        '<tpl for=".">',
            '<tpl if="this.isShared(values) === false">',
            '{[this.incrementSavedGroupCounter(this)]}',
                '<tpl if="this.savedGroupCounter &lt; 6">',
                    '{[this.renderGroupHeading(values, parent, xindex)]}',
                        '<div class="grouprow">',
                            '<div title="{description:htmlEncode}" class="grouplabel">{label:this.groupLabel}</div>',
                            '<tpl if="this.plotter(containsPlot)">',
                                '<div class="groupicon"><img src="' + Connector.resourceContext.imgPath + '/plot.png"></div>',
                            '</tpl>',
                        '</div>',
                '<tpl elseif="this.savedGroupLength &gt; 5 && this.savedGroupCounter === 6">',
                    '<div class="grouprow">',
                        'and {[this.getRemainderSavedGroups()]} more ',
                        '<a href="cds-app.view#learn/learn/Group">(View all)</a>',
                    '</div>',
                '</tpl>',

            '</tpl>',
        '</tpl>',
        '<tpl for=".">',
            '<tpl if="this.isShared(values) === true">',
            '{[this.incrementSharedGroupCounter(this)]}',
                '<tpl if="this.sharedGroupCounter &lt; 6">',
                    '{[this.renderGroupHeading(values, parent, xindex)]}',
                    '<div class="grouprow">',
                        '<div title="{description:htmlEncode}" class="grouplabel">{label:this.groupLabel}</div>',
                        '<tpl if="this.plotter(containsPlot)">',
                            '<div class="groupicon"><img src="' + Connector.resourceContext.imgPath + '/plot.png"></div>',
                        '</tpl>',
                    '</div>',
                '<tpl elseif="this.sharedGroupLength &gt; 5 && this.sharedGroupCounter === 6">',
                    '<div class="grouprow">',
                        'and {[this.getRemainderSharedGroups()]} more ',
                        '<a href="cds-app.view#learn/learn/Group">(View all)</a>',
                    '</div>',
                '</tpl>',
            '</tpl>',
        '</tpl>',
        {
            isEmpty : function(v) {
                return (!Ext.isArray(v) || v.length === 0);
            },
            isShared : function(value) {
                return value.shared;
            },
            setSavedGroupsLength : function(v) {
                var mySavedGrps = v.filter(function(item) {
                    return !item.shared;
                });
                this.savedGroupsLength = mySavedGrps.length;
            },
            setSharedGroupsLength : function(v) {
                var sharedGrps = v.filter(function(item) {
                    return item.shared;
                });
                this.sharedGroupsLength = sharedGrps.length;
            },
            getRemainderSavedGroups : function() {
                return this.savedGroupsLength - 5;
            },
            getRemainderSharedGroups : function() {
                return this.sharedGroupsLength - 5;
            },
            getSavedGroupIndex : function(v) {
                return v.index;
            },
            getSharedGroupIndex : function(v) {
                return v.index;
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
                if (prev === undefined || prev.shared !== values.shared) {

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
            },
            incrementSavedGroupCounter() {
                this.savedGroupCounter++;
            },
            incrementSharedGroupCounter() {
                this.sharedGroupCounter++;
            },
            me: this,
            savedGroupCounter: 0,
            savedGroupsLength: 0,
            sharedGroupCounter: 0,
            sharedGroupsLength: 0
        }
    ),

    constructor: function(config) {

        this.callParent([config]);

        this.addEvents('deletegroup');
    },

    initComponent : function() {

        this.selectedItemCls = 'grouplist-label-selected '+ this.arrow;

        this.store = Connector.model.Group.getGroupStore();

        this.on('beforerefresh', function(){
            // reset template state variables before the template refreshes
            this.tpl.savedGroupCounter = 0;
            this.tpl.savedGroupsLength = 0;
            this.tpl.sharedGroupCounter = 0;
            this.tpl.sharedGroupsLength = 0;
        }, this);

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