/*
 * Copyright (c) 2016-2019 LabKey Corporation
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
        '</tpl>'
    ),
    initComponent : function() {
        var data = this.initialConfig.data.model.data;
        data['title_contact'] = this.initialConfig.data.title;
        this.update(data);
    }
});
