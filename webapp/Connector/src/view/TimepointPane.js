/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.TimepointPane', {

    extend: 'Connector.view.InfoPane',

    padding: '10',

    showSort: false, // TODO

    isShowOperator: false,

    displayTitle: 'Timepoints in the plot',

    constructor : function(config)
    {
        var modelDatas = [],
            interval = 'Days',
            intervalVisitRowIdMap = {};
            store = config.model.get('memberStore');

        // populate the member store based on the data rows from the distinct timepoint query results
        Ext.each(config.params.data, function(row)
        {
            if (!Ext.isDefined(intervalVisitRowIdMap[row[interval]]))
            {
                intervalVisitRowIdMap[row[interval]] = [];
            }

            intervalVisitRowIdMap[row[interval]].push(row['RowId']);
        });

        // convert and load the interval visitRowId data into the memberStore
        Ext.iterate(intervalVisitRowIdMap, function(key, value)
        {
            modelDatas.push({
                name: interval + ' ' + key + ' (' + value.length + ' stud' + (value.length == 1 ? 'y' : 'ies') + ')',
                uniqueName: value,
                count: value.length
            });
        });
        store.loadRawData(modelDatas);

        // tell the view/model that the member store is ready
        config.model.setReady();

        this.callParent([config]);
    },

    updateSelections : function()
    {
        var grid = this.getGrid();
        grid.getSelectionModel().selectAll();
        grid.fireEvent('selectioncomplete', this);
    },

    onUpdate : function() {
        var interval = QueryUtils.STUDY_ALIAS_PREFIX + 'Days',
            gridSelection = this.getGrid().getSelectionModel().getSelection(),
            wrappedTimeMeasure,
            visitRowIds = [],
            visitRowIdFilter;

        // don't need to apply a Timepoint filter if all are selected
        if (gridSelection.length == this.getGrid().getStore().getCount())
        {
            this.hide();
        }
        else
        {
            // wrapped time interval (i.e. Days, Weeks, etc.) for the getTimeFilter request
            wrappedTimeMeasure = {
                dateOptions: {
                    interval: interval,
                    zeroDayVisitTag: null
                },
                measure: Connector.getQueryService().getMeasure(interval)
            };

            // get the selected visit rowIds from the grid selection model
            Ext.each(gridSelection, function(selected)
            {
                visitRowIds = visitRowIds.concat(selected.get('uniqueName'));
            });

            // build up the VisitRowId filter for the gridFilter array
            visitRowIdFilter = LABKEY.Filter.create(QueryUtils.VISITROWID_ALIAS, visitRowIds.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF);

            // get the array of ParticipantSequenceNum values for the selected VisitRowIds and apply as an app time filter
            Connector.getFilterService().getTimeFilter(wrappedTimeMeasure, [visitRowIdFilter], function(timeFilter)
            {
                Connector.getState().addFilter({
                    filterSource: 'GETDATA',
                    isGrid: true,
                    isTime: true,
                    timeFilters: [visitRowIdFilter],
                    timeMeasure: wrappedTimeMeasure,
                    gridFilter: [timeFilter, null, null, null]
                });
            }, this);
        }
    }
});