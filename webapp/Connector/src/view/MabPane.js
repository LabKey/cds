/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.MabPane', {

    extend: 'Connector.view.InfoPane',

    columnHeaderText: undefined,

    groupTitle: 'mAb grid',

    hideHeaders: true,

    isShowOperator: false,

    showSelection: false,

    showSort: false,

    getToolbarConfig : function(model) {
        return {
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'lightfooter',
            items: ['->',
                {
                    text: 'Close',
                    cls: 'infoplotcancel', // tests
                    handler: function() { this.hide(); },
                    scope: this
                }
            ]
        }
    },

    inSelectionMode : function() {
        return false;
    }
});