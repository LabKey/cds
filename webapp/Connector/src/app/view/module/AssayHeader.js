/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AssayHeader', {

    xtype : 'app.module.assayheader',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl>',
            Connector.constant.Templates.module.title,
            '<table class="learn-study-info">',
                '<tr>',
                    '<td class="item-label">Name:</td><td class="item-value">{assay_short_name:htmlEncode} ({assay_label:htmlEncode})</td>',
                '</tr>',
                '<tr>',
                    '<td class="item-label">Methodology:</td><td class="item-value">{assay_detection_platform:htmlEncode}</td>',
                '</tr>',
                '<tr>',
                    '<td class="item-label">Target area:</td><td class="item-value">',
                        '{assay_body_system_type:htmlEncode}:',
                        '{assay_body_system_target:htmlEncode} and {assay_general_specimen_type:htmlEncode}',
                    '</td>',
                '</tr>',
            '</table>',
        '</tpl>'
    ),

    initComponent : function() {
        var data = this.initialConfig.data.model.data;
        data['title'] = this.initialConfig.data.title;
        this.update(data);
    }

});
