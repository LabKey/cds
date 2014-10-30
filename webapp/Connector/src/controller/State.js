/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.State', {
    extend: 'LABKEY.app.controller.State',

    defaultTitle: 'HIV Vaccine Collaborative Dataspace',

    subjectName: 'Subject',

    appVersion: '0.5',

    supportColumnServices: true,

    isService: true,

    init : function() {
        this.callParent();

        this.onMDXReady(function(mdx) {
            Connector.model.Filter.loadSubjectContainer(mdx);
        });
    },

    checkReady : function() {
        Connector.getService('Query').onQueryReady(function() {
            this.fireReady();
        }, this);
    },

    initColumnListeners : function() {

        this.control('groupdatagrid', {
            measureselected: function(selected) {
                Ext.each(selected, function(rec) { this.addSessionColumn(rec.raw); }, this);
            }
        });

        this.control('plot', {
            axisselect: function(plot, axis, selection) {
                Ext.each(selection, this.addSessionColumn, this);
            }
        });
    },

    getTitle : function(viewname) {
        return 'Connector: ' + viewname;
    },

    requestFilterUndo : function() {
        var index = this.getPreviousState();
        if (index > -1) {
            this.loadFilters(index);
        }
        else {
            console.warn('FAILED TO UNDO. NOT ABLE TO FIND STATE');
        }
    },

    getFilterModelName : function() {
        return 'Connector.model.Filter';
    },

    moveSelectionToFilter : function() {
        var s, f;

        // prior to moving, merge any measure-based selections into equivalent measure-based filters
        for (s=0; s < this.selections.length; s++) {

            // determine if an equivalent filter can be found for this selection
            for (f=0; f < this.filters.length; f++) {
                if (this.equalMeasures(this.selections[s], this.filters[f])) {
                    var gridFilter = this.selections[s].get('gridFilter'), filterSet = [];
                    for (var g=0; g < gridFilter.length; g++) {
                        filterSet.push(gridFilter[g]);
                    }
                    this.filters[f].set('gridFilter', filterSet);
                }
            }
        }

        this.callParent();
    },

    equalMeasures : function(filterA, filterB) {

        // 'In the plot'
        if ((filterA.isPlot() && !filterA.isGrid()) || (filterB.isPlot() && !filterB.isGrid())) {
            return false;
        }

        // Must be equivalent in plot/grid configuration
        if ((filterA.isPlot() != filterB.isPlot()) || (filterA.isGrid() != filterB.isGrid())) {
            return false;
        }

        var aMeasures = filterA.get('plotMeasures'), am;
        var bMeasures = filterB.get('plotMeasures'), bm;

        for (var m=0; m < aMeasures; m++) {
            am = aMeasures[m]; bm = bMeasures[m];
            if (am != null && bm != null && am.measure.alias.toLowerCase === bm.measure.alias.toLowerCase) {
                continue;
            }
            return false;
        }

        return true;
    }
});