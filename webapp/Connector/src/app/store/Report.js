/*
 * Copyright (c) 2016-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Report', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.Report',

    reportData: undefined,

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadSlice : function() {
        if (this.reportData) // already loaded
            return;
        var me = this;

        Ext4.Ajax.request({
            url : LABKEY.ActionURL.buildURL('reports', 'browseDataTree'),
            method : 'GET',
            success: LABKEY.Utils.getCallbackWrapper(function(response){
                this.reportData = response;
                me._onLoadComplete();

            }, me)
        });


    },

    _onLoadComplete: function () {
        if (Ext.isDefined(this.reportData)) {

            var reports = [];
            var excludedReports = this.getExcludedReports();
            // category level
            Ext4.each(this.reportData.children, function(category){  // some of these may be reports instead
                var subcategories = category.children;
                if (subcategories.length > 0) {

                    // subcategory level
                    Ext4.each(subcategories, function (subcategory) {  // some of these may be reports instead
                        var views = subcategory.children;
                        if (views && views.length > 0) {

                            // report level
                            Ext4.each(views, function (view) {  // no categories/subcategories here, but not all are reports
                                if(this.isValidReportType(view, excludedReports)) {
                                    reports.push(view);
                                }
                            }, this);
                        }
                        else {  // no children, so might be a report -- let's check
                            if (this.isValidReportType(subcategory, excludedReports)) {  // not a subcategory, actually a report instead
                                reports.push(subcategory)
                            }
                        }
                    }, this);
                }
                else {  // no children, so might be a report -- let's check
                    if (this.isValidReportType(category, excludedReports)) {  // not a category, actually a report instead
                        reports.push(category);
                    }
                }
            }, this);

            reports.sort(function(a, b){
               return (new Date(b.created)).getTime() - (new Date(a.created)).getTime();
            });
            Ext.each(reports, function(report){
               if (report.created)
               {
                   report.created_display = Connector.app.view.LearnSummary.dateRenderer(report.created);
               }

            });
            this.loadRawData(reports);
        }
    },

    isValidReportType: function(record, excludedReports)
    {
        if (record.dataType != 'reports' || !record.visible)
            return false;
        if (excludedReports && record.reportId && excludedReports.indexOf(record.reportId) > -1)
            return false;
        return record.type == 'R Report';
    },

    getExcludedReports: function() {
        var mAbParameterizedReports = [];
        for (var i = 1 ; i < 3; i++) {
            var reportId = LABKEY.getModuleProperty('cds', Connector.view.MabGrid.MAbReportID_PROP_PREFIX + i);
            if (reportId) {
                mAbParameterizedReports.push(reportId)
            }
        }
        return mAbParameterizedReports;
    }
});
