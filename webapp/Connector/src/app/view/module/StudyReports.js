/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyReports', {

    xtype : 'app.module.studyreports',

    extend : 'Connector.view.module.ShowList',

    plugins : ['documentvalidation'],

    showAll: false,

    tpl : new Ext.XTemplate(
            '<tpl>',
                '<tpl if="data_listings_and_reports.length &gt; 0 && data_listings_and_reports_has_permission">',
                    '<h3 id="reports_listing_title" class="listing_title">{title_study_reports}</h3>',
                    '<table class="learn-study-info"><tbody>',
                        '<tpl for="data_listings_and_reports">',
                            '<tpl if="xindex &lt; 11">',
                                '<tr>',
                                    '<tpl if="isLinkValid">',
                                        '<td class="item-value"><a href="{filePath}" target="_blank">{label:htmlEncode}</a> {suffix}</td>',
                                    '<tpl elseif="hasPermission">',
                                        '<td class="item-value">{label:htmlEncode}</td>',
                                    '</tpl>',
                                '</tr>',
                            '</tpl>',
                        '</tpl>',
                    '</tbody></table>',

                    '<tpl if="data_listings_and_reports.length &gt; 10">',
                        'and {data_listings_and_reports.length - 10} more ',
                        '<tpl if="showAll">',
                            '<span class="show-hide-toggle-reports">(show less)</span>',
                        '<tpl else>',
                            '<span class="show-hide-toggle-reports">(show all)</span>',
                        '</tpl>',
                        '</br></br>',
                    '</tpl>',

                    '<table class="learn-study-info"><tbody>',
                        '<tpl for="data_listings_and_reports">',
                            '<tpl if="parent.showAll && (xindex &gt; 10)">',
                                '<tr>',
                                    '<tpl if="isLinkValid">',
                                        '<td class="item-value"><a href="{filePath}" target="_blank">{label:htmlEncode}</a> {suffix}</td>',
                                    '<tpl elseif="hasPermission">',
                                        '<td class="item-value">{label:htmlEncode}</td>',
                                    '</tpl>',
                                '</tr>',
                            '</tpl>',
                        '</tpl>',
                    '</tbody></table>',
                '</tpl>',
            '</tpl>'
    ),

    initComponent : function() {

        var data = this.getListData();

        data['title_study_reports'] = this.initialConfig.data.title;
        data['showAll'] = this.showAll;
        this.update(data);
        this.callParent();

        if (data.data_listings_and_reports.length > 0) {
            var docIsValidAction = function(doc, status) {
                doc.isLinkValid = status;
                this.update(data);
                this.registerListToggle(); //this is needed, registering in 'render' and 'refresh' listeners is not enough.
            };
            this.on("afterrender", function() {
                this.validateDocLinks(data.data_listings_and_reports, docIsValidAction);
            }, this);
        }
    },

    hasContent : function() {
        var reports = this.initialConfig.data.model.data.data_listings_and_reports;
        if (reports) {
            return reports.length > 0;
        }
        return false;
    },

    getListData : function () {
        return this.initialConfig.data.model.data;
    },

    scrollListIntoView: function() {
        Ext.get('reports_listing_title').el.dom.scrollIntoView();
    },

    getToggleId : function () {
        return Ext.query('.show-hide-toggle-reports');
    }
});
