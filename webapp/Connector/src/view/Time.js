/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Time', {

    extend : 'Ext.Panel',

    alias  : 'widget.timeview',

    cls : 'timeview',

    initComponent : function() {

        this.items = [];

        this.headerPanel = Ext.create('Ext.Panel', {
            ui : 'custom',
            layout : {
                type : 'hbox'
            },
            items : [{
                itemId : 'timetitle',
                xtype  : 'box',
                autoEl : {
                    tag : 'div',
                    cls : 'dimgroup',
                    html: 'Chart by time -- Under Construction'
                }
            }],
            updateTitle : function(titleText) {
                var title = this.getComponent('timetitle');
                if (title)
                {
                    title.update(titleText);
                }
            }
        });

        this.items.push(this.headerPanel);
        this.callParent();
    }
});