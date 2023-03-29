/*
 * Copyright (c) 2014-2023 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AntigenTypeSection', {

    xtype : 'app.module.antigentypesection',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl if="antigen_type_region || antigen_type_scaffold || antigen_type_modifiers || antigen_type_tags || antigen_type_virus_type || ' +
            'antigen_type_backbone || isolate_PV_backbone_system || antigen_type_reporter_molecule || antigen_type_differentiate || antigen_type_control">',
            '<h3>{title_antigen_type}</h3>',
            '<table class="learn-study-info">',
                '<tpl if="antigen_type_region">',
                    '<tr>',
                        '<td class="item-label">Region:</td>',
                        '<td class="item-value">{antigen_type_region:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="antigen_type_scaffold">',
                    '<tr>',
                        '<td class="item-label">Scaffold:</td>',
                        '<td class="item-value">{antigen_type_scaffold:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="antigen_type_modifiers">',
                    '<tr>',
                        '<td class="item-label">Modifiers:</td>',
                        '<td class="item-value">{antigen_type_modifiers:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="antigen_type_tags">',
                    '<tr>',
                        '<td class="item-label">Tags:</td>',
                        '<td class="item-value">{antigen_type_tags:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="antigen_type_virus_type">',
                    '<tr>',
                        '<td class="item-label">Virus type:</td>',
                        '<td class="item-value">{antigen_type_virus_type:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="antigen_type_backbone">',
                    '<tr>',
                        '<td class="item-label">Backbone:</td>',
                        '<td class="item-value">{antigen_type_backbone:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="isolate_PV_backbone_system">',
                    '<tr>',
                        '<td class="item-label">Pseudovirus backbone system:</td>' +
                        '<td class="item-value">{isolate_PV_backbone_system:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="antigen_type_reporter_molecule">',
                    '<tr>',
                        '<td class="item-label">Reporter molecule:</td>',
                        '<td class="item-value">{antigen_type_reporter_molecule:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="antigen_type_differentiate">',
                    '<tr>',
                        '<td class="item-label">Differentiate antigen type:</td>',
                        '<td class="item-value">{antigen_type_differentiate:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="antigen_type_control">',
                    '<tr>',
                        '<td class="item-label">Control:</td>',
                        '<td class="item-value">{antigen_type_control:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
            '</table>',
        '</tpl>'
    ),

    initComponent : function() {
        this.callParent();

        var data = this.initialConfig.data.model.data;
        data['title_antigen_type'] = this.initialConfig.data.title;
        this.update(data);
    }
});
