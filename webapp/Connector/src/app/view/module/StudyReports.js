/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyReports', {

    xtype : 'app.module.studyreports',

    extend : 'Connector.view.module.BaseModule',

    plugins : ['documentvalidation'],

    tpl : new Ext.XTemplate(
            '<tpl if="data_listings_and_reports.length &gt; 0">',
                '<h3>{title_study_reports}</h3>',
                '<table class="learn-study-info">',
                    '<tpl for="data_listings_and_reports">',
                        '<tr>',
                            '<tpl if="isLinkValid">',
                                '<td class="item-value"><a href="{fileName}" target="_blank">{label:htmlEncode}</a> {suffix}</td>',
                            '<tpl else>',
                                '<td class="item-value">{label:htmlEncode}</td>',
                            '</tpl>',
                        '</tr>',
                    '</tpl>',
                '</table>',
            '</tpl>'
    ),

    initComponent : function() {
        this.callParent();

        var data = this.initialConfig.data.model.data;
        data['title_study_reports'] = this.initialConfig.data.title;

        if (data.data_listings_and_reports.length > 0) {
            var docIsValidAction = function(doc) {
                doc.isLinkValid = true;
                this.update(data);
            };
            this.on("afterrender", function() {
                this.validateDocLinks(data.data_listings_and_reports, docIsValidAction, function(){
                    this.update(data);
                });
            }, this);
        }
    },

    hasContent : function() {
        var reports = this.initialConfig.data.model.data.data_listings_and_reports;
        if (reports) {
            return reports.length > 0;
        }
        return false;
    }
});
