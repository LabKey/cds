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
            '<p class="item-row">Network: {[values.model.get("Network")]}</p>',
            '<p class="item-row">Study Type: {[this.typeString(values.model)]}</p>',
            '<tpl if="model.get(\'Stage\')">',
                '<p class="item-row">Stage: {[values.model.get("Stage")]}</p>',
            '</tpl>',
            '<tpl if="model.get(\'StartDate\')">',
                '<p class="item-row">First participant enrolled: {[Connector.app.view.Study.dateRenderer(values.model.get("StartDate"))]}</p>',
            '</tpl>',
            '<tpl if="model.get(\'EndDate\')">',
                '<p class="item-row">Follow up complete: {[Connector.app.view.Study.dateRenderer(values.model.get("EndDate"))]}</p>',
            '</tpl>',
        '</tpl>',
    {
        typeString : function(model) {
            var phase = model.get('Phase');
            var type = model.get('Type');
            return type;
        }
    })
});
