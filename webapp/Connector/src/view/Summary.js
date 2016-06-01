/*
 * Copyright (c) 2014-2015 LabKey Corporation
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

        this.items = [{
            xtype: 'box',
            cls: 'cascade-header',
            tpl: new Ext.XTemplate(
                '<h1>Find subjects of interest with assay data in DataSpace.</h1>',
                '<h1 class="middle">Filter multiple attributes.</h1>',
                '<h1 class="bottom">Discover relationships.</h1>'
            ),
            data: {}
        }, this.getSummaryDataView()];

        this.callParent();

        this.store.on('mdxerror', this.showMessage, this);

        this.on('afterrender', this.refresh, this, {single: true});

        // plugin to handle loading mask for the summary view
        this.addPlugin({
            ptype: 'loadingmask',
            configs: [{
                element: this.store,
                beginEvent: 'beforeload',
                endEvent: 'load'
            }]
        });
    },

    getSummaryDataView : function() {

        if (!Ext.isDefined(this.summaryPanel))
        {
            this.summaryPanel = Ext.create('Connector.view.SummaryDataView', {
                anchor: '100% -155',
                overflowY: 'auto',
                ui: 'custom',
                store: this.store
            });
        }

        return this.summaryPanel;
    },

    refresh : function() {
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

                    // TODO: EncodeURI
                    var nav = (values.nav ? ' class="nav" href="#' + values.nav + '"' : '');
                    return parent.sep + values.counter + '&nbsp;<a' + nav + '>' + values.text + '</a>';
                },
                clearSep: function(p) {
                    p.sep = undefined;
                }
            })
    },

    tpl: new Ext.XTemplate(
        '<tpl for=".">',
            '<div class="row">',
                '<div class="line"></div>',
                '<div class="column bycolumn"><span class="pp">by</span><span class="label"> {label}</span></div>',
                '<div class="column detailcolumn">{[ Connector.view.SummaryDataView.linksTpl.apply(values) ]}</div>',
                '<div class="column endcolumn totalcolumn">{total}&nbsp;{subject}</div>',
            '</div>',
        '</tpl>'
    )
});