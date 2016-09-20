/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyHeader', {

    xtype : 'app.module.studyheader',

    plugins : ['documentvalidation'],

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl if="network || cavd_affiliation || type || stage || start_date || public_date || first_enr_date || followup_complete_date || protocol_docs_and_study_plans.length &gt; 0">',
            '<h3>{title_studyheader}</h3>',
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
                '<tpl if="protocol_docs_and_study_plans.length &gt; 0">',
                    '<tpl for="protocol_docs_and_study_plans">',
                        '<tr>',
                            '<tpl if="xindex == 1">',
                                '<td class="item-label">Documents:</td>',
                            '<tpl else>',
                                '<td class="item-label">&nbsp;</td>',
                            '</tpl>',
                            '<tpl if="isLinkValid">',
                                '<td class="item-value"><a href="{fileName}" target="_blank">{label:htmlEncode} {suffix}</a></td>',
                            '<tpl else>',
                                '<td class="item-value">{label:htmlEncode}</td>',
                            '</tpl>',
                        '</tr>',
                    '</tpl>',
                '</tpl>',
            '</table>',
        '</tpl>'
    ),

    initComponent : function() {
        this.callParent();

        var data = this.initialConfig.data.model.data;
        data['title_studyheader'] = this.initialConfig.data.title;

        if (data['cavd_affiliation_file_exists'] !== true) {  // if it's true, we've already verified this link is good previously
            var cavdLinkIsValid = function() {
                data['cavd_affiliation_file_exists'] = true;
                this.update(data);
            };
            this.on("afterrender", function() {
                this.validateDocLinks([{
                    fileName: LABKEY.contextPath + LABKEY.moduleContext.cds.StaticPath + data.cavd_affiliation_filename,
                    isLinkValid: false
                }], cavdLinkIsValid, function() {
                    this.update(data);
                })
            }, this);
        }

        if (data.protocol_docs_and_study_plans.length > 0) {
            var docIsValidAction = function(doc) {
                doc.isLinkValid = true;
                this.update(data);
            };
            this.on("afterrender", function() {
                this.validateDocLinks(data.protocol_docs_and_study_plans, docIsValidAction, function() {
                    this.update(data);
                }, this);
            }, this);
        }

        if (data['cavd_affiliation_file_exists'] === true && data.protocol_docs_and_study_plans.length == 0) {
            this.update(data);
        }
    }
});
