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
        this.addEvents('requestmabgroupdelete');
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
    },

    onDelete : function()
    {
        if (this.group)
        {
            Ext.Msg.show({
                title: 'Delete Group',
                msg: 'Are you sure you want to delete "' + Ext.htmlEncode(this.group.get('label')) + '"?',
                // buttons are in a fixed order that cannot be changed without subclassing Ext.window.Messagebox
                // [ok yes no cancel] is the predefined order. We want the button order cancel -> delete. That's why
                // even though we want a cancel button, we are using the Ext.Msg.OK constant.
                buttons: Ext.Msg.OK+Ext.Msg.YES,
                buttonText: {
                    ok: 'Cancel',
                    yes: 'Delete'
                },
                fn: function(id) {
                    if (id === 'yes') {
                        this.fireEvent('requestmabgroupdelete', this.group.get('rowid'), true);
                    }
                },
                scope: this
            });
        }
    }
})
