/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.MabGroupSummary', {

    extend: 'Connector.view.GroupSummary',

    alias: 'widget.mabgroupsummary',

    initComponent: function () {
        this.callParent();
    },

    _getActiveGroup : function()
    {
        var group;

        //notice getting 'rowid' instead of id here unlike when getting participant group
        var idx = this.store.find('rowid', this.groupId, 0 /*start position*/, false /*any match, set to false for exact match*/, true, true);
        if (idx > -1)
        {
            group = this.store.getAt(idx);
        }
        return group;
    }
})
