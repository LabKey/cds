/*
 * Copyright (c) 2014-2023 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AntigenInformationSection', {

    xtype : 'app.module.antigeninformationsection',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl if="antigen_category || antigen_full_name || antigen_plot_label || antigen_name_other || antigen_accession_num">',
            '<h3>{title_antigen_info}</h3>',
            '<table class="learn-study-info">',
                '<tpl if="antigen_category">',
                    '<tr>',
                        '<td class="item-label">Category:</td>',
                        '<td class="item-value">{antigen_category:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="antigen_full_name">',
                    '<tr>',
                        '<td class="item-label">Full name:</td>',
                        '<td class="item-value">{antigen_full_name:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="antigen_plot_label">',
                    '<tr>',
                        '<td class="item-label">Plot label:</td>',
                        '<td class="item-value">{antigen_plot_label:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="antigen_name_other">',
                    '<tr>',
                        '<td class="item-label">Aliases:</td>',
                        '<td class="item-value">{antigen_name_other:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="antigen_accession_num">',
                    '<tr>',
                        '<td class="item-label">Accession #:</td>',
                        '<td class="item-value">{antigen_accession_num:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
            '</table>',
        '</tpl>'
    ),

    initComponent : function() {
        this.callParent();

        var data = this.initialConfig.data.model.data;
        data['title_antigen_info'] = this.initialConfig.data.title;
        this.update(data);
    }
});
