/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.TimepointPane', {

    extend: 'Connector.view.InfoPane',

    padding: '10',

    showSort: true,

    isShowOperator: false,

    displayTitle: 'Time points in the plot',

    updateSelections : function()
    {
        var grid = this.getGrid();
        grid.getSelectionModel().select(grid.getStore().query('hasData', true).items);
        grid.fireEvent('selectioncomplete', this);
    },

    onUpdate : function() {
        var interval = this.getModel().getIntervalAlias(),
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