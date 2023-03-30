/*
 * Copyright (c) 2014-2023 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.AntigenProductionSection', {

    xtype : 'app.module.antigenproductionsection',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl if="isolate_host_cell || antigen_purification || antigen_reagents || antigen_manufacturer || antigen_codon_optimize">',
            '<h3 id="antigen-prod-section-id">{title_antigen_production}</h3>',
            '<table class="learn-study-info">',
                '<tpl if="isolate_host_cell">',
                    '<tr>',
                        '<td class="item-label">Host cell:</td>',
                        '<td class="item-value">{isolate_host_cell:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="antigen_purification">',
                    '<tr>',
                        '<td class="item-label">Purification methods:</td>',
                        '<td class="item-value">{antigen_purification:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="antigen_reagents">',
                    '<tr>',
                        '<td class="item-label">Special reagents:</td>',
                        '<td class="item-value">{antigen_reagents:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="antigen_manufacturer">',
                    '<tr>',
                        '<td class="item-label">Manufacturer:</td>',
                        '<td class="item-value">{antigen_manufacturer:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="antigen_codon_optimize">',
                    '<tr>',
                        '<td class="item-label">Codon optimization:</td>',
                        '<td class="item-value">{antigen_codon_optimize:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
            '</table>',
        '</tpl>'
    ),

    initComponent : function() {
        this.callParent();

        var data = this.initialConfig.data.model.data;
        data['title_antigen_production'] = this.initialConfig.data.title;
        this.update(data);
    }
});
