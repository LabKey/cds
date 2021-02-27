/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.InteractiveReports', {

    xtype : 'app.module.interactivereports',

    extend : 'Connector.view.module.ShowList',

    showAll: false,

    tpl : new Ext.XTemplate(
            '<tpl>',
            '<tpl if="interactive_reports && interactive_reports.length &gt; 0">',
                '<h3 id="interactive_report_title" class="listing_title">{interactive_report_title}</h3>',
                    '<table class="learn-study-info">',
                        '<tpl for="interactive_reports">',
                            '<tr><td>',
                                '<div class="item-value">',
                                    '<tpl if="report_id && label">',
                                        '<a href="#learn/learn/Report/db%3A{report_id}">{label:htmlEncode}</a>',
                                    '</tpl>',
                                '</div>',
                            '</td></tr>',
                        '</tpl>',
                    '</table>',
                '</tpl>',
            '</tpl>'
    ),

    initComponent : function() {
        var data = this.getListData();
        data['interactive_report_title'] = this.initialConfig.data.title;
        this.update(data);

        this.callParent();
    },

    getListData : function () {
        return this.initialConfig.data.model.data;
    },

    hasContent : function() {
        var d = this.getListData();
        return d["interactive_reports"].length > 0;
    }
});
