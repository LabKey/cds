/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This class is meant to be a dumb view over a substatus model
 */
Ext.define('Connector.view.DetailStatus', {

    extend: 'Ext.view.View',

    alias: 'widget.detailstatus',

    trackOver: true,

    itemSelector: 'div.status-row',

    padding: '0 12',

    cls: 'detailstatuslist',

    overItemCls: 'status-over',

    loadMask: false,

    tpl: new Ext.XTemplate(
            '<ul class="detailstatus">',
                '<tpl for=".">',
                    '<div class="status-row {highlight:this.isHighlight} {[this.isLink(values)]} {count:this.shouldHide}">',
                        '<tpl if="highlight != undefined && highlight == true">',
                            '<li>',
                                '<span class="statme hl-status-label">',
                                    '{label:htmlEncode}',
                                '</span>',
                                '<span class="statme hl-status-count status-subcount {plotBasedCount:this.shouldMask} {subcount:this.shouldHide}">',
                                    '{subcount:this.commaFormat}',
                                '</span>',
                                '<span class="statme hl-status-count status-of {subcount:this.shouldHide}">',
                                    '/',
                                '</span>',
                                '<span class="statme hl-status-count {plotBasedCount:this.shouldMask}">',
                                    '{count:this.commaFormat}',
                                '</span>',
                            '</li>',
                            '</div>',
                        '</tpl>',
                        '<tpl if="highlight == undefined || !highlight">',
                            '<li>',
                                '<span class="statme status-label">',
                                    '{label:htmlEncode}',
                                '</span>',
                                '<span class="statme status-count status-subcount {plotBasedCount:this.shouldMask} {subcount:this.shouldHide}">',
                                    '{subcount:this.commaFormat}',
                                '</span>',
                                '<span class="statme status-count status-of {subcount:this.shouldHide}">',
                                    '/',
                                '</span>',
                                '<span class="statme status-count {plotBasedCount:this.shouldMask}">',
                                    '{count:this.commaFormat}',
                                '</span>',
                            '</li>',
                        '</tpl>',
                    '</div>',
                '</tpl>',
            '<ul>',
            {
                isLink : function(values) {
                    return (values.activeCountLink === true && values.count != -1 ? '' : 'nolink');
                },
                isHighlight : function(highlight) {
                    return (highlight === true ? 'hl-status-row' : '');
                },
                commaFormat : function(v) {
                    return Ext.util.Format.number(v, '0,000');
                },
                shouldHide : function(value) {
                    return value === -1 ? 'hideit' : '';
                },
                shouldMask : function(value) {
                    return value ? 'plotmaskit' : 'maskit';
                }
            }
    ),

    initComponent : function() {
        this.filterTask  = new Ext.util.DelayedTask(this.filterChange, this);

        this.callParent();

        var state = Connector.getState();
        state.on('filtercount', this.onFilterChange, this);
        state.on('filterchange', this.onFilterChange, this);
        state.on('selectionchange', this.onFilterChange, this);

        // plugin to handle loading mask for the info pane
        this.addPlugin({
            ptype: 'loadingmask',
            blockingMask: false,
            beginConfig: [{
                component: this.store,
                itemsMaskCls: 'item-spinner-mask',
                events: ['beforeload']
            },{
                component: this.store,
                itemsMaskCls: 'item-spinner-plotmask',
                events: ['showplotmask']
            }],
            endConfig: [{
                component: this.store,
                itemsMaskCls: 'item-spinner-mask',
                events: ['load']
            },{
                component: this.store,
                itemsMaskCls: 'item-spinner-plotmask',
                events: ['hideplotmask']
            }]
        });
    },

    onFilterChange : function() {
        this.filterTask.delay(100);
    },

    filterChange : function() {
        this.store.load();
    }
});
