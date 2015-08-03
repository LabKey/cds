/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.ModuleContainer', {

    extend : 'Ext.container.Container',

    layout : {
    	type: 'hbox',
        pack: 'start',
        align: 'stretch'
    },

    /**
     * For a fixed number of columns, assign a number here.
     * Otherwise the length of the modules array passed to this object will be used to determine the column count.
     */
    columns: undefined,

    cls: 'modulecontainer',

    initComponent : function() {
        this.items = [];

        // If this.columns is null or undefined, use the number of module arrays
        // as the column count.
        var columns = this.columns || this.modules.length,
            i, config;

        for (i = 0; i < columns; ++i) {
            config = {
                xtype: 'container',
                flex: 1,
                itemId: 'column' + i,
                cls: 'modulecontainercolumn',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                }
            };
            if (i < this.modules.length) {
                config.items = Connector.factory.Module.defineViews(this.modules[i], this.model, this.state);
            }
            this.items.push(config);
        }

        this.callParent();
    }
});
