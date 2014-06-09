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

    // For a fixed number of columns, assign a number here. Otherwise the length
    // of the modules array passed to this object will be used to determine the
    // column count
    columns : null,

    cls : 'modulecontainer',

    initComponent : function() {
        this.items = [];

        // If this.columns is null or undefined, use the number of module arrays
        // as the column count.
        var columns = this.columns || this.modules.length;
        var i;

        for (i = 0; i < columns; ++i) {
            this.items.push({
                flex: 1,
                xtype: 'container',
                itemId: 'column'+i,
                cls: 'modulecontainercolumn',
                layout : {
                    type : 'vbox',
                    align: 'stretch'
                }
            })
        }

        this.callParent();

//this.model && console.log("Model:",this.model,JSON.stringify(this.model.raw, undefined, 4));

        for (i = 0; i < columns; ++i) {
            if (i < this.modules.length) {
                var column = this.getComponent('column'+i);
                column.add(Connector.factory.Module.defineViews(this.modules[i], this.model, this.state));
            }
        }
    }
});
