/*
 * Copyright (c) 2008-2022 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.button.ExportButton', {

    extend: 'Ext.button.Button',

    alias: 'widget.exportbutton',

    text : 'Export',

    arrowCls : 'arrow-light',

    cls : 'export-data',

    initComponent : function() {

        this.menu = {
            bubbleEvents : ['click'],
            defaults : {
                cls : 'export-item',
                iconCls: 'export-item-icon',
            },
            items : [{
                text: 'Comma separated values (*.CSV)',
                id : 'csv-menu-item'
            },{
                text: 'Excel (*.XLS)',
                id : 'excel-menu-item'
            }]
        };

        this.on('click', this.handleClick, this);
        this.callParent();
    },

    handleClick : function(cmp, item) {
        if (item.id) {
            switch (item.id) {
                case 'csv-menu-item' :
                    this.fireEvent('exportcsv', item);
                    break;
                case 'excel-menu-item' :
                    this.fireEvent('exportexcel', item);
                    break;
            }
        }
    }
});