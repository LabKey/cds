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
            '<p class="item-row">Network: {[values.model.get("network")]}</p>',
            '<p class="item-row">Study Type: {[values.model.get("type")]}</p>',
            '<tpl if="model.get(\'stage\')">',
                '<p class="item-row">Stage: {[values.model.get("stage")]}</p>',
            '</tpl>',
            '<tpl if="model.get(\'start_date\')">',
                '<p class="item-row">First participant enrolled: {[Connector.app.view.Study.dateRenderer(values.model.get("start_date"))]}</p>',
            '</tpl>',
            '<tpl if="model.get(\'followup_complete_date\')">',
                '<p class="item-row">Follow up complete: {[Connector.app.view.Study.dateRenderer(values.model.get("followup_complete_date"))]}</p>',
            '</tpl>',
        '</tpl>'
    )
});
