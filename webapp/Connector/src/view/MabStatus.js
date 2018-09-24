/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.MabStatus', {
    extend: 'Ext.panel.Panel',

    alias: 'widget.mabstatus',

    ui: 'custom',

    cls: 'filterstatus',

    initComponent : function() {
        this.items = [
            this.getHeader(),
            this.getEmptyText()
        ];

        this.callParent();
    },

    getEmptyText : function() {
        if (!this.emptyText) {
            this.emptyText = Ext.create('Ext.Component', {
                tpl: new Ext.XTemplate('<div class="emptytext">From the mAb grid</div>'),
                data: {}
            });
        }
        return this.emptyText;
    },

    getHeader : function () {

        return {
            xtype: 'container',
            itemId: 'header',
            ui: 'custom',
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'box',
                cls: 'filterpanel-header',
                tpl: new Ext.XTemplate(
                    '<h2 class="filterheader-text section-title">{title:htmlEncode}</h2>'
                ),
                data: {
                    title: 'MAb Info'
                }
            }]
        }
    }
});
