/*
 * Copyright (c) 2021 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.SavedReports', {
    extend : 'Ext.data.Store',

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadSlice : function(slice) {
        this.savedReportsData = [];

        LABKEY.Ajax.request({
            url : LABKEY.ActionURL.buildURL("reports", "browseDataTree"),
            method : 'GET',
            success: this.onLoadSavedReportsData,
            scope: this
        });
    },

    onLoadSavedReportsData : function(savedReports) {
        var json = Ext.decode(savedReports.responseText);
        var rreports = [];

        Ext4.each(json.children, function(category) {

            //get shared R reports
            var reports = category.children.filter(function(rep){ return rep.type === "R Report" && rep.shared; });
            rreports = rreports.concat(reports);
        });

        for (var x =0; x < rreports.length; x++) {
            this.savedReportsData.push({reportId: rreports[x].reportId.split(":")[1], reportName:rreports[x].name});
        }
        this.loadComplete = true;
        this._onLoadComplete();
    },

    isLoadComplete : function() {
        return this.loadComplete;
    },

    _onLoadComplete: function () {
        // override and implement
    },

    getDataTypesAvailable: function (rec) {
        var available_data_types = [];
        if (rec.data_availability)
            available_data_types.push('Integrated data');
        if (rec.ni_data_availability)
            available_data_types.push('Non-integrated data');

        if (rec.publications) {
            var pubDataAvailable = rec.publications.filter(function (pub) {
                return pub.available_data_count > 0;
            })
            if (pubDataAvailable.length > 0)
                available_data_types.push('Publication data');
        }
        if (available_data_types.length === 0)
            available_data_types.push('Data not added');

        return available_data_types;
    }
});