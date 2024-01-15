/*
 * Copyright (c) 2008-2022 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.button.GroupSaveButton', {

    extend: 'Ext.button.Button',

    alias: 'widget.groupsavebutton',

    text : 'Save',

    arrowCls : 'arrow-light',

    cls : 'group-save',

    initComponent : function() {

        this.menu = {
            bubbleEvents : ['click'],
            defaults : {
                cls : 'group-save-menu-items'
            },
            items : [{
                text: 'Update this group',
                itemId : 'update-grp-menu-item'
            },{
                text: 'Save as new group',
                itemId : 'save-as-new-grp-menu-item'
            }]
        };

        this.callParent();
    },
});