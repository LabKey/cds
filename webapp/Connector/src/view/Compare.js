/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Compare', {

    extend : 'Ext.Panel',

    alias  : 'widget.compareview',

    cls : 'compareview',

    initComponent : function() {

        this.items = [];

        this.headerPanel = Ext.create('Ext.Panel', {
            ui : 'custom',
            layout : {
                type : 'hbox'
            },
            items : [{
                itemId : 'comparetitle',
                xtype  : 'box',
                autoEl : {
                    tag : 'div',
                    cls : 'dimgroup',
                    html: 'Compare Demography -- Under Construction'
                }
            }],
            updateTitle : function(titleText) {
                var title = this.getComponent('comparetitle');
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