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
            this.helpTest();
        }, this);
    },

    // Helper to let the test know that everything should be loaded
    helpTest : function() {
        Ext.getBody().addCls('appready');
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

    inverseSelection : function() {
        var selections = this.getSelections(),
            data;

        //Only handle one selection
        if (selections.length > 0) {
            data = selections[0].getData();
        }

        if (data && !Ext.isEmpty(data.gridFilter)) {
            var sqlFilters = [null, null, null, null];
            var oldFilter = data.gridFilter[0];

            // Only support inverse of equal or equals one of right now
            switch (oldFilter.getFilterType()) {
                case LABKEY.Filter.Types.EQUALS_ONE_OF:
                    sqlFilters[0] = LABKEY.Filter.create(oldFilter.getColumnName(), oldFilter.getValue(), LABKEY.Filter.Types.EQUALS_NONE_OF);
                    break;
                case LABKEY.Filter.Types.EQUAL:
                    sqlFilters[0] = LABKEY.Filter.create(oldFilter.getColumnName(), oldFilter.getValue(), LABKEY.Filter.Types.NOT_EQUAL);
                    break;
                default:
                    sqlFilters = data.gridFilter;
            }

            var filter = Ext.create('Connector.model.Filter', {
                gridFilter: data.gridFilter,
                plotMeasures: data.plotMeasures,
                hierarchy: data.hierarchy,
                isPlot: data.isPlot,
                isGrid: data.isGrid,
                operator: data.operator,
                filterSource: data.filterSource,
                isWhereFilter: data.isWhereFilter,
                showInverseFilter: data.showInverseFilter
            });

            this.addSelection([filter], true, false, true);
        }
    },

    moveSelectionToFilter : function() {
        var s, f, ss, ff, g, gf, pm, fSet, mSet;

        // prior to moving, merge any measure-based selections into equivalent measure-based filters
        for (s=0; s < this.selections.length; s++) {
            ss = this.selections[s];
            // determine if an equivalent filter can be found for this selection
            for (f=0; f < this.filters.length; f++) {
                ff = this.filters[f];
                if (this.equalMeasures(ss, ff)) {
                    gf = ss.get('gridFilter'); pm = ss.get('plotMeasures'); fSet = []; mSet = [];

                    for (g=0; g < gf.length; g++) {
                        fSet.push(gf[g]);
                    }
                    for (g=0; g < pm.length; g++) {
                        mSet.push(pm[g]);
                    }

                    ff.set('gridFilter', fSet);
                    ff.set('plotMeasures', mSet);
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