/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.ContactCDS', {

    xtype : 'app.module.contactcds',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl>',
            '<h3>{title_contact:htmlEncode}</h3>',
            '<table class="learn-study-info">',

            '<tpl if="primary_poc_name">',
                '<tr>',
                    '<td class="item-label">First point of contact:</td>',
                    '<td class="item-value">',
                        '<tpl if="primary_poc_email">',
                            '<a href="mailto:',
                            '{primary_poc_email}',
                            '">',
                        '</tpl>',
                        '{primary_poc_name:htmlEncode}',
                        '<tpl if="primary_poc_email">',
                            '</a>',
                        '</tpl>',
                    '</td>',
                '</tr>',
            '</tpl>',

            '<tpl if="grant_pi_name">',
                '<tr>',
                    '<td class="item-label">Grant Principal Investigator:</td>',
                    '<td class="item-value">',
                        '<tpl if="grant_pi_email">',
                            '<a href="mailto:',
                            '{grant_pi_email}',
                            '">',
                        '</tpl>',
                        '{grant_pi_name:htmlEncode}',
                        '<tpl if="grant_pi_email">',
                            '</a>',
                        '</tpl>',
                    '</td>',
                '</tr>',
            '</tpl>',

            '<tpl if="grant_pm_name">',
                '<tr><td class="item-label">Grant Project Manager:</td>',
                    '<td class="item-value">',
                        '<tpl if="grant_pm_email">',
                            '<a href="mailto:',
                            '{grant_pm_email}',
                            '">',
                        '</tpl>',
                        '{grant_pm_name:htmlEncode}',
                        '<tpl if="grant_pm_email">',
                            '</a>',
                        '</tpl>',
                    '</td>',
                '</tr>',
            '</tpl>',

            '<tpl if="investigator_name">',
                '<tr>',
                    '<td class="item-label">Study Investigator:</td>',
                    '<td class="item-value">',
                        '<tpl if="investigator_email">',
                            '<a href="mailto:',
                            '{investigator_email}',
                            '">',
                        '</tpl>',
                        '{investigator_name:htmlEncode}',
                        '<tpl if="investigator_email">',
                            '</a>',
                        '</tpl>',
                    '</td>',
                '</tr>',
            '</tpl>',

            '</table>',
            '<div class="item-row">',
                'Contact the <a href="mailto:dataspace.support@scharp.org?Subject=CAVD%20DataSpace%20request%20for%20information" onclick="Connector.controller.Analytics.onMailRequest();" target="_blank">CAVD DataSpace team</a> for more information<br/>',
            '</div>',
            '<div class="item-row">',
                'Request <a href="https://portal.cavd.org/CAVDStudyProposals/Pages/RequestCSFServices.aspx" target="_blank">Central Service Facilities support</a> for an ancillary study',
            '</div>',
            '<tpl if="atlas_link">',
                '<div class="item-row">',
                'View this study in <a href="{atlas_link}" target="_blank">ATLAS <img src="' + LABKEY.contextPath + '/Connector/images/outsidelink.png' + '"/></a><br/>',
                '</div>',
            '</tpl>',
            '<tpl if="cavd_link">',
                '<div class="item-row">',
                'View this study on the <a href="{cavd_link}" target="_blank">CAVD Portal <img src="' + LABKEY.contextPath + '/Connector/images/outsidelink.png' + '"/></a><br/>',
                '</div>',
            '</tpl>',
            '<tpl if="clintrials_id && species == \'Human\'"]}>',
                '<div class="item-row">',
                'View this study on <a href=" https://clinicaltrials.gov/show/{clintrials_id}" target="_blank">clintrials.gov <img src="' + LABKEY.contextPath + '/Connector/images/outsidelink.png' + '"/></a><br/>',
                '</div>',
            '</tpl>',
        '</tpl>'
    ),
    initComponent : function() {
        var data = this.initialConfig.data.model.data;
        data['title_contact'] = this.initialConfig.data.title;
        this.update(data);
    }
});
