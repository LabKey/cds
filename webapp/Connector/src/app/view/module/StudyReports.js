/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyReports', {

    xtype : 'app.module.studyreports',

    extend : 'Connector.view.module.BaseModule',

    plugins : ['documentvalidation'],

    tpl : new Ext.XTemplate(
            '<tpl if="data_listings_and_reports.length &gt; 0">',
                Connector.constant.Templates.module.title,
                '<table class="learn-study-info">',
                    '<tpl for="data_listings_and_reports">',
                        '<tr>',
                            '<tpl if="isLinkValid">',
                                '<td class="item-value"><a href="{fileName}">{label:htmlEncode} {suffix}</a></td>',
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

        this.on("afterrender", function() {
            this.validateDocLinks(data.data_listings_and_reports, data, function(){
                data['title'] = this.initialConfig.data.title;
                this.update(data);
            });
        }, this);
    }
});
