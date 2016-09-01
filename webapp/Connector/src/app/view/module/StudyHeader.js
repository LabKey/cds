/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyHeader', {

    xtype : 'app.module.studyheader',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl if="network || cavd_affiliation || type || stage || start_date || public_date || first_enr_date || followup_complete_date">',
            Connector.constant.Templates.module.title,
            '<table class="learn-study-info">',
                '<tpl if="network">',
                    '<tr>',
                        '<td class="item-label">Network:</td><td class="item-value">{network:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="cavd_affiliation">',
                    '<tr>',
                        '<td class="item-label">Grant Affiliation:</td>',
                        '<td class="item-value">',
                            '<tpl if="!cavd_affiliation_filename || cavd_affiliation_file_exists !== true">',
                                '{cavd_affiliation:htmlEncode}</td>',
                            '<tpl else>',
                                '<a href="' + LABKEY.contextPath + LABKEY.moduleContext.cds.StaticPath + '{cavd_affiliation_filename}" target="_blank">{cavd_affiliation:htmlEncode}</a></td>',
                        '</tpl>',
                    '</tr>',
                '</tpl>',
                '<tpl if="type">',
                    '<tr>',
                        '<td class="item-label">Study Type:</td><td class="item-value">{type:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="stage">',
                    '<tr>',
                        '<td class="item-label">Stage:</td><td class="item-value">{stage:htmlEncode}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="start_date">',
                    '<tr>',
                        '<td class="item-label">Study start:</td>',
                        '<td class="item-value">{[Connector.app.view.LearnSummary.dateRenderer(values.start_date)]}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="public_date">',
                    '<tr>',
                        '<td class="item-label">Study made public:</td>',
                        '<td class="item-value">{[Connector.app.view.LearnSummary.dateRenderer(values.public_date)]}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="first_enr_date">',
                    '<tr>',
                        '<td class="item-label">First enrollment:</td>',
                        '<td class="item-value">{[Connector.app.view.LearnSummary.dateRenderer(values.first_enr_date)]}</td>',
                    '</tr>',
                '</tpl>',
                '<tpl if="followup_complete_date">',
                    '<tr>',
                        '<td class="item-label">Follow up complete:</td>',
                        '<td class="item-value">{[Connector.app.view.LearnSummary.dateRenderer(values.followup_complete_date)]}</td>',
                    '</tr>',
                '</tpl>',
            '</table>',
        '</tpl>'
    ),

    initComponent : function() {
        var data = this.initialConfig.data.model.data;
        data['title'] = this.initialConfig.data.title;
        if (data['cavd_affiliation_file_exists'] !== true) {  // if it's true, we've already verified this link is good previously
            LABKEY.Ajax.request({
                method: 'GET',
                url: LABKEY.contextPath + LABKEY.moduleContext.cds.StaticPath + data.cavd_affiliation_filename,
                success: LABKEY.Utils.getCallbackWrapper(function (json, response)
                {
                    if (200 === response.status)
                    {
                        data['cavd_affiliation_file_exists'] = true;
                    }
                    this.update(data);
                }, this),
                scope: this
            });
        }
        this.update(data);
    }

});
