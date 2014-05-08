/*
 * Copyright (c) 2014 LabKey Corporation
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

    padding: '0 20 0 20',

    overItemCls: 'status-over',

    tpl: new Ext.XTemplate(
            '<ul class="detailstatus">',
                '<tpl for=".">',
                    '<div class="status-row {highlight:this.isHighlight}">',
                        '<tpl if="highlight != undefined && highlight == true">',
                                '<li>',
                                      '<span class="statme hl-status-label">{label:htmlEncode}</span>',
                                      '<span class="statme hl-status-count status-subcount {subcount:this.subFormat}">{subcount:this.commaFormat}</span>',
                                      '<span class="statme hl-status-count status-of {subcount:this.subFormat}">of</span>',
                                      '<span class="statme hl-status-count">{count:this.commaFormat}</span>',
                                '</li>',
                            '</div>',
                        '</tpl>',
                        '<tpl if="highlight == undefined || !highlight">',
                            '<li>',
                                '<span class="statme status-label">{label:htmlEncode}</span>',
                                '<span class="statme status-count status-subcount {subcount:this.subFormat}">{subcount:this.commaFormat}</span>',
                                '<span class="statme status-count status-of {subcount:this.subFormat}">of</span>',
                                '<span class="statme status-count">{count:this.commaFormat}</span>',
                            '</li>',
                        '</tpl>',
                    '</div>',
                '</tpl>',
            '<ul>',
            {
                isHighlight : function(highlight) {
                    return (highlight === true ? 'hl-status-row' : '');
                },
                commaFormat : function(v) {
                    return Ext.util.Format.number(v, '0,000');
                },
                subFormat : function(subcount) {
                    return subcount === -1 ? 'hideit' : '';
                }
            }
    ),

    initComponent : function() {
        this.filterTask  = new Ext.util.DelayedTask(this.filterChange, this);

        this.callParent();

        if (this.store.state) {
            var state = this.store.state;
            state.on('filtercount', this.onFilterChange, this);
            state.on('filterchange', this.onFilterChange, this);
            state.on('selectionchange', this.onFilterChange, this);
        }
    },

    onFilterChange : function() {
        this.filterTask.delay(100);
    },

    filterChange : function() {
        this.showLoad();
        this.store.load();
    },

    showLoad : function() {
        var el = Ext.get('statusloader');
        if (el) {
            el.setStyle('visibility', 'visible');
        }
    },

    hideLoad : function() {
        var el = Ext.get('statusloader');
        if (el) {
            el.setStyle('visibility', 'hidden');
        }
    }
});