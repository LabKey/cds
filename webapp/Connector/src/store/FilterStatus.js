/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.FilterStatus', {

    extend: 'Ext.data.Store',

    model: 'Connector.model.Detail',

    constructor : function(config) {

        this.flight = 0;

        this.callParent([config]);
    },

    load : function() {
        this.loadGroups();
    },

    loadGroups : function() {
        this.flight++;
        var request = {
            configs : [
                {
                    onRows : [ { hierarchy : 'Study', lnum: 0 } ],
                    useNamedFilters : ['stateSelectionFilter', 'statefilter'],
                    label     : {
                        singular : 'Subject',
                        plural   : 'Subjects'
                    },
                    highlight : true,
                    flight    : this.flight
                },
                {
                    onRows : [ { level : '[Study].[Study]'} ],
                    useNamedFilters : ['stateSelectionFilter', 'statefilter'],
                    label     : {
                        singular : 'Study',
                        plural   : 'Studies'
                    },
                    cellbased : true
                },
                {
                    onRows : [ { level : '[Assay.Target Area].[Name]'} ],
                    useNamedFilters : ['stateSelectionFilter', 'statefilter'],
                    label     : {
                        singular : 'Assay',
                        plural   : 'Assays'
                    },
                    cellbased : true
                },
                {
                    onRows : [ { level : '[Lab].[Lab]'} ],
                    useNamedFilters : ['stateSelectionFilter', 'statefilter'],
                    label     : {
                        singular : 'Lab',
                        plural   : 'Labs'
                    },
                    cellbased : true
                },
                {
                    onRows : [ { level : '[Antigen.Tier].[Name]'} ],
                    useNamedFilters : ['stateSelectionFilter', 'statefilter'],
                    label     : {
                        singular : 'Antigen',
                        plural   : 'Antigens'
                    },
                    cellbased : true
                }
            ],
            success : this.loadResults,
            scope   : this
        };

        this.state.onMDXReady(function(mdx){
            mdx.queryMultiple(request.configs, request.success, request.failure, request.scope);
        }, this);
    },

    loadResults : function(qrArray, configArray) {
        if (configArray[0].flight != this.flight)
            return;

        var recs = [], rec = {}, count;
        for (var i=0; i < qrArray.length; i++) {

            count = 0;
            if (configArray[i].cellbased) {

                for (var c=0; c < qrArray[i].cells.length; c++) {

                    if (qrArray[i].cells[c][0].value > 0)
                        count++;
                }
            }
            else {
                count = qrArray[i].cells[0][0].value;
            }

            rec = {
                hierarchy : configArray[i].label.singular,
                count: count,
                highlight : configArray[i].highlight
            };

            rec.label = rec.count != 1 ? configArray[i].label.plural : configArray[i].label.singular;

            recs.push(rec);
        }

        this.loadData(recs);
    }
});
