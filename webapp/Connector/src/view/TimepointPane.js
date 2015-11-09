/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.TimepointPane', {

    extend: 'Connector.view.InfoPane',

    padding: '10',

    showSort: false, // TODO

    isShowOperator: false,

    displayTitle: 'Timepoints in the plot',

    getMiddleContent : function(model) {
        var content = [{
            xtype: 'box',
            autoEl: {
                tag: 'div',
                html: 'Coming soon...'
            }
        }];

        return content;
    },

    getToolbarConfig : function(model) {
        return {
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            items: ['->',
                {
                //    id: 'filtertaskbtn',
                //    text: 'Update',
                //    cls: 'filterinfoaction', // tests
                //    handler: this.onUpdate,
                //    scope: this
                //},{
                    text: 'Close',
                    cls: 'infotimepointcancel', // tests
                    handler: function()
                    {
                        this.hide();
                    },
                    scope: this
                }
            ]
        }
    },

    onUpdate : function() {
        // TODO
        this.hide();
    }
});