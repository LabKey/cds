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

    margin: '30 0 0 0',

    cls: 'grouplist-view',

    overItemCls: 'grouplist-over',

    itemSelector: 'div.grouprow',

    bubbleEvents: ['deletegroup'],

    tpl: new Ext.XTemplate(
        '<div class="grouplist-header">My Saved Groups and Plots</div>',
        '<tpl if="this.isEmpty(values)">',
            '<div class="grouplist-empty">Saved work will appear here</div>',
        '</tpl>',
        '<tpl for=".">',
            '<div class="grouprow">',
                '<div class="groupicon">{containsPlot:this.plotter}</div>',
                '<div class="grouplabel">{label:htmlEncode}</div>',
                '<div class="closeitem" group-index="{[xindex-1]}"></div>',
            '</div>',
        '</tpl>',
        {
            isEmpty : function(v) {
                return (!Ext.isArray(v) || v.length === 0);
            },
            // This will be replaced by a plot image
            plotter : function(containsPlot) {
                return containsPlot === true ? 'P' : '';
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

        this.bindTask = new Ext.util.DelayedTask(this.bindItems, this);

        this.on('refresh', this.doBind, this);
    },

    bindItems : function() {

        var view = this;

        if (!view || !view.getEl()) {
            console.warn('unable to bind group listing events');
            return;
        }

        var closes = view.getEl().select('.closeitem');
        if (closes && Ext.isArray(closes.elements)) {
            closes = closes.elements;

            var el, modelId;

            Ext.each(closes, function(close) {
                el = Ext.get(close);
                modelId = el.getAttribute('group-index');
                modelId = parseInt(modelId);

                if (Ext.isNumber(modelId)) {
                    el.on('click', view.onRemoveClick, view);
                }
            });
        }
    },

    onRemoveClick : function(evt, element) {

        if (element) {
            var el = Ext.get(element);
            var index = el.getAttribute('group-index');
            var store = this.getStore();
            var group = store.getAt(index);

            GG = group;
            if (group) {
                evt.stopPropagation();
                this.fireEvent('deletegroup', group);
            }
        }
    },

    doBind : function() {
        this.bindTask.delay(50);
    }
});