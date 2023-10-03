/*
 * Copyright (c) 2014-2023 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.GroupDetailsSection', {

    xtype : 'app.module.groupdetailssection',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl>',
            '<h3 id="group-description-id">{group_description:htmlEncode}</h3>',
        '</tpl>'
    // TODO: More to come, this is just a placeholder
    ),

    initComponent : function() {
        this.callParent();

        var data = this.initialConfig.data.model.data;
        data['group_description'] = data.description;
        this.update(data);
    }
});
