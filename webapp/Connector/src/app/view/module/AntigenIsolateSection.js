/*
 * Copyright (c) 2014-2023 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AntigenIsolateSection', {

    xtype : 'app.module.antigenisolatesection',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl if="isolate_name_component || isolate_species || isolate_donor_id || isolate_differentiate || isolate_clade || isolate_TF_status || isolate_transfection_method || ' +
            'isolate_clone || isolate_mutations || isolate_neut_tier || isolate_clone_pi || isolate_country_origin || isolate_year_isolated || isolate_fiebig_stage">',
            '<h3>{title_antigen_isolate}</h3>',
            '<table class="learn-study-info">',
                '<tpl if="isolate_species">',
                    '<tr>',
                        '<td class="item-label">Species:</td>',
                        '<td class="item-value">{isolate_species:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="isolate_clade">',
                    '<tr>',
                        '<td class="item-label">Clade:</td>',
                        '<td class="item-value">{isolate_clade:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="isolate_neut_tier">',
                    '<tr>',
                        '<td class="item-label">Neutralization tier:</td>',
                        '<td class="item-value">{isolate_neut_tier:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="isolate_donor_id">',
                    '<tr>',
                        '<td class="item-label">Donor ID:</td>',
                        '<td class="item-value">{isolate_donor_id:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="isolate_differentiate">',
                    '<tr>',
                        '<td class="item-label">Differentiate:</td>',
                        '<td class="item-value">{isolate_differentiate:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="isolate_clone">',
                    '<tr>',
                        '<td class="item-label">Clone:</td>',
                        '<td class="item-value">{isolate_clone:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="isolate_mutations">',
                    '<tr>',
                        '<td class="item-label">Mutations:</td>' +
                        '<td class="item-value">{isolate_mutations:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="isolate_country_origin">',
                    '<tr>',
                        '<td class="item-label">Country of origin:</td>',
                        '<td class="item-value">{isolate_country_origin:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="isolate_year_isolated">',
                    '<tr>',
                        '<td class="item-label">Year isolated:</td>',
                        '<td class="item-value">{isolate_year_isolated:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="isolate_fiebig_stage">',
                    '<tr>',
                        '<td class="item-label">Fiebig stage:</td>',
                        '<td class="item-value">{isolate_fiebig_stage:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="isolate_clone_pi">',
                    '<tr>',
                        '<td class="item-label">Cloner PI:</td>',
                        '<td class="item-value">{isolate_clone_pi:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="isolate_transfection_method">',
                    '<tr>',
                        '<td class="item-label">Transfection method:</td>',
                        '<td class="item-value">{isolate_transfection_method:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="isolate_TF_status">',
                    '<tr>',
                        '<td class="item-label">Transmitter/founder:</td>',
                        '<td class="item-value">{isolate_TF_status:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
            '</table>',
        '</tpl>'
    ),

    initComponent : function() {
        this.callParent();

        var data = this.initialConfig.data.model.data;
        data['title_antigen_isolate'] = this.initialConfig.data.title;
        this.update(data);
    }
});
