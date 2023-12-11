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
                cls : 'export-item', //todo: create a similar cls
                // iconCls: 'export-item-icon',
            },
            items : [{
                text: 'Update this group',
                itemId : 'update-grp-menu-item'
            },{
                text: 'Save as new group',
                itemId : 'save-as-new-grp-menu-item'
            }]
        };

        this.on('click', this.handleClick, this);
        this.callParent();
    },

    handleClick : function(cmp, item) {
        if (item.itemId) {
            switch (item.itemId) {
                case 'update-grp-menu-item' :
                    this.fireEvent('updateGroup', item);
                    break;
                case 'save-as-new-grp-menu-item' :
                    this.fireEvent('saveNewGroup', item);
                    break;
            }
        }
    }
});