/*
 * Copyright (c) 2014 LabKey Corporation
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
                    '<td class="item-label">Name:</td><td class="item-value">{[values.model.get("assay_short_name")]} ({[values.model.get("assay_label")]})</td>',
                '</tr>',
                '<tr>',
                    '<td class="item-label">Methodology:</td><td class="item-value">{[values.model.get("assay_detection_platform")]}</td>',
                '</tr>',
                '<tr>',
                    '<td class="item-label">Target area:</td><td class="item-value">',
                        '{[values.model.get("assay_body_system_type")]}:',
                        '{[values.model.get("assay_body_system_target")]} and {[values.model.get("assay_general_specimen_type")]}',
                    '</td>',
                '</tr>',
            '</table>',
        '</tpl>'
    )
});
