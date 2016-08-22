/*
 * Copyright (c) 2014-2015 LabKey Corporation
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
                                if(this.isValidReportType(view)) {
                                    reports.push(view);
                                }
                            }, this);
                        }
                        else {  // no children, so might be a report -- let's check
                            if (this.isValidReportType(subcategory)) {  // not a subcategory, actually a report instead
                                reports.push(subcategory)
                            }
                        }
                    }, this);
                }
                else {  // no children, so might be a report -- let's check
                    if (this.isValidReportType(category)) {  // not a category, actually a report instead
                        reports.push(category);
                    }
                }
            }, this);

            this.loadRawData(reports);
        }
    },

    isValidReportType: function(record)
    {
        if (record.dataType != 'reports')
            return false;
        return record.type == 'R Report';
    }
});
