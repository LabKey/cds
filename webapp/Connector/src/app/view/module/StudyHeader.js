/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyHeader', {

    xtype : 'app.module.studyheader',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl>',
            Connector.constant.Templates.module.title,
            '<table class="learn-study-info">',
                '<tr>',
                    '<td class="item-label">Network:</td><td class="item-value">{[values.model.get("network")]}</td>',
                '</tr>',
                '<tr>',
                    '<td class="item-label">Study Type:</td><td class="item-value">{[values.model.get("type")]}</td>',
                '</tr>',
                '<tpl if="model.get(\'stage\')">',
                    '<tr>',
                        '<td class="item-label">Stage:</td><td class="item-value">{[values.model.get("stage")]}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="model.get(\'start_date\')">',
                    '<tr>',
                        '<td class="item-label">First enrollment:</td>',
                        '<td class="item-value">{[Connector.app.view.Study.dateRenderer(values.model.get("start_date"))]}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="model.get(\'followup_complete_date\')">',
                    '<tr>',
                        '<td class="item-label">Follow up complete:</td>',
                        '<td class="item-value">{[Connector.app.view.Study.dateRenderer(values.model.get("followup_complete_date"))]}</td>',
                    '</tr>',
                '</tpl>',
            '</table>',
        '</tpl>'
    )
});
