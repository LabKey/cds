/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.MabDetails', {

    xtype : 'app.module.mabdetails',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
            '<tpl>',
            Connector.constant.Templates.module.title,
            '<table class="learn-study-info">',
            '<tr>',
            '<td class="item-label">Standard name:</td><td class="item-value">{mab_mix_name_std:htmlEncode}</td>',
            '</tr>',
            '<tpl if="mab_mix_type">',
            '<tr>',
            '<td class="item-label">Antibody type:</td><td class="item-value">{mab_mix_type:htmlEncode}</td>',
            '</tr>',
            '</tpl>',
            '<tpl if="mab_mix_lanlid_link">',
            '<tr>',
            '<td class="item-label">LANLID:</td><td class="item-value">',
            '<a href="{mab_mix_lanlid_link}" target="_blank">{mab_mix_lanlid:htmlEncode} <img src="' + LABKEY.contextPath + '/Connector/images/outsidelink.png' + '"/></a>',
            '</td>',
            '</tr>',
            '</tpl>',
            '<tpl if="mab_mix_name_other">',
            '<tr>',
            '<td class="item-label">Other names:</td><td class="item-value">{mab_mix_name_other:htmlEncode}</td>',
            '</tr>',
            '</tpl>',
            '</table>',

            '<tpl if="mabs.length &gt; 0">',
            '<div class="reportmodulecontainer">',
            '</div>',
            '<tpl for="mabs">',
                '<div class="reportmodulecontainer">',
                '<h3>{mabName:htmlEncode} Details</h3>',

                '<tpl if="isotype || hxb2Loc || bindingType || mab_lanlid || donorSpecies || donorId || donorClade">',
                    '<table class="learn-study-info">',
                    '<tpl if="isotype">',
                    '<tr>',
                    '<td class="item-label">Isotype:</td><td class="item-value">{isotype:htmlEncode}</td>',
                    '</tr>',
                    '</tpl>',
                    '<tpl if="hxb2Loc">',
                    '<tr>',
                    '<td class="item-label">HXB2 Location:</td><td class="item-value">{hxb2Loc:htmlEncode}</td>',
                    '</tr>',
                    '</tpl>',
                    '<tpl if="bindingType">',
                    '<tr>',
                    '<td class="item-label">Antibody binding type:</td><td class="item-value">{bindingType:htmlEncode}</td>',
                    '</tr>',
                    '</tpl>',
                    '<tpl if="mab_lanlid">',
                    '<tr>',
                    '<td class="item-label">LANLID:</td><td class="item-value">',
                    '<a href="{mab_lanlid_link}" target="_blank">{mab_lanlid:htmlEncode} <img src="' + LABKEY.contextPath + '/Connector/images/outsidelink.png' + '"/></a>',
                    '</td>',
                    '</tr>',
                    '</tpl>',

                    '<tpl if="donorSpecies || donorId || donorClade">',
                    '<tr><td class="item-label">Donor</td><td></td></tr>',
                    '<tpl if="donorSpecies">',
                    '<tr>',
                    '<td class="item-label sub-label">Species:</td><td class="item-value">{donorSpecies:htmlEncode}</td>',
                    '</tr>',
                    '</tpl>',
                    '<tpl if="donorId">',
                    '<tr>',
                    '<td class="item-label sub-label">Donor ID:</td><td class="item-value">{donorId:htmlEncode}</td>',
                    '</tr>',
                    '</tpl>',
                    '<tpl if="donorClade">',
                    '<tr>',
                    '<td class="item-label sub-label">Donor clade:</td><td class="item-value">{donorClade:htmlEncode}</td>',
                    '</tr>',
                    '</tpl>',
                    '</tpl>',

                    '</table>',

                '<tpl else>',
                '<span>No details available.</span>',
                '</tpl>',

                '</div>',
            '</tpl>',
            '</tpl>'
    ),

    initComponent : function() {
        var data = this.initialConfig.data.model.data;
        data['title'] = this.initialConfig.data.title;
        this.update(data);
    }

});
