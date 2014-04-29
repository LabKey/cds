/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Summary', {

    extend : 'Ext.panel.Panel',

    requires : ['Connector.model.Summary'],

    alias  : 'widget.summary',

    ui: 'custom',

    cls : 'summaryview',

    layout : 'anchor',

    initComponent : function() {

        this.refreshRequired = true;

        this.titlePanel = Ext.create('Ext.panel.Panel', {
            ui  : 'custom',
            cls : 'titlepanel',
            html: '<span>find subjects...</span>'
        });

        this.items = [this.titlePanel, this.getSummaryDataView()];

        this.callParent();

        this.store.on('mdxerror', this.showMessage, this);
        this.store.on('beforeload', this.displayLoad, this);
        this.store.on('load', this.removeLoad, this);

        this.on('afterrender', this.refresh, this, {single: true});
    },

    getSummaryDataView : function() {

        if (!Ext.isDefined(this.summaryPanel))
        {
            this.summaryPanel = Ext.create('Connector.view.SummaryDataView', {
                anchor: '100% 50%',
                ui: 'custom',
                store: this.store
            });
        }

        return this.summaryPanel;
    },

    refresh : function () {
        this.refreshRequired = false;
        this.summaryPanel.getStore().load();
    },

    onFilterChange : function(f) {
        if (this.isVisible()) {
            this.refresh();
        }
        else {
            this.refreshRequired = true;
        }
    },

    onViewChange : function(controller, xtype) {
        if (xtype == 'summary') {
            if (this.refreshRequired) {
                this.refresh();
            }
        }
    },

    showMessage : function(msg) {

        var box = this.summaryPanel.getBox();

        this.msg = Ext.create('Connector.window.SystemMessage', {
            msg : msg,
            x   : Math.floor(box.width/2),
            y   : (box.y-70) // height of message window
        });
    },

    displayLoad : function() {
        this.titlePanel.addCls('showload');
    },

    removeLoad : function() {
        this.titlePanel.removeCls('showload');
    }
});

Ext.define('Connector.view.SummaryDataView', {

    extend : 'Ext.view.View',

    alias : 'widget.summarydataview',

    itemSelector: 'div.row',

    loadMask : false,

    statics : {
        linksTpl: new Ext.XTemplate(
                '<tpl for="details">',
                '{[ this.showValue(values, parent) ]}',
                '</tpl>',
                '{[ this.clearSep(values) ]}',
                {
                    showValue: function(values, parent) {
                        if (!Ext.isDefined(parent.sep)) {
                            parent.sep = '';
                        }
                        else if (parent.sep.length == 0) {
                            parent.sep = ', ';
                        }
                        var nav = (values.nav ? ' class="nav" nav="' + values.nav + '"' : '');
                        return parent.sep + values.counter + ' <a' + nav + '>' + values.text + '</a>';
                    },
                    clearSep: function(p) {
                        p.sep = undefined;
                    }
                })
    },

    tpl : new Ext.XTemplate(
            '<tpl for=".">',
            '<div class="row">',
            '<div class="line"></div>',
            '<div class="column bycolumn"><span class="pp">by</span><span class="label"> {label}</span></div>',
            '<div class="column detailcolumn">{[ Connector.view.SummaryDataView.linksTpl.apply(values) ]}</div>',
            '<div class="column endcolumn totalcolumn">{total} {subject}</div>',
            '</div>',
            '</tpl>'
    )
});