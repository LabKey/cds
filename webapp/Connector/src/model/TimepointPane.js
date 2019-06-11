/*
 * Copyright (c) 2015-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.define('Connector.model.TimepointPane', {

    extend: 'Connector.model.InfoPane',

    fields: [
        {name: 'measureSet', defaultValue: []}, // array of measures to use for the member query
        {name: 'membersWithData', defaultValue: []} // array of filter members with data in current filter set or selection
    ],

    constructor : function(config) {
        // if the user clicked the 'Time Points' info pane record, check if there is an existing filter to attach
        if (!Ext.isDefined(config.filter))
        {
            Ext.each(Connector.getState().getFilters(), function(filter)
            {
                // we want the time filter, but not the study axis plot time range filter
                if (filter.isTime() && !filter.isPlot())
                {
                    config.filter = filter;
                    return false;
                }
            });
        }

        this.callParent([config]);
    },

    /* Override */
    configure : function(dimName, hierName) {
        var emptyInterval = !Ext.isDefined(hierName) || hierName === '',
            intervalAlias,
            timeMeasure;

        // clear out for initialization
        this.set({
            dimension: undefined,
            hierarchy: undefined,
            level: undefined
        });

        // if we are displaying from a filter, get the intervalAlias from the timeMeasure
        if (Ext.isDefined(this.get('filter')) && emptyInterval)
        {
            timeMeasure = this.get('filter').get('timeMeasure');
            if (Ext.isDefined(timeMeasure) && Ext.isObject(timeMeasure.dateOptions))
            {
                hierName = timeMeasure.dateOptions.interval;
            }
        }

        if (this.get('hierarchyItems').length === 0) {
            this.populateSortBy();
        }
        intervalAlias = this.setSortByLabel(hierName);

        this.populateFilterMembers(intervalAlias);
    },

    populateFilterMembers : function(intervalAlias)
    {
        var store = this.get('memberStore'),
            selectedVisitRowIds = this.getFilterVisitRowIds(),
            membersWithData = this.get('membersWithData'),
            intervalName,
            intervalMap = {},
            rowHasData, rowIsSelected, key,
            modelDatas = [];

        // trim interval name based on the alias (TODO need a better way to get this)
        intervalName = intervalAlias.replace(QueryUtils.STUDY_ALIAS_PREFIX, '').replace('s', '');

        // populate the member store based on the data rows from the distinct timepoint query results
        // keep track of which visitRowIds have data in the current filter set or current selection
        ChartUtils.getTimepointFilterPaneMembers(this.get('measureSet'), function(dataRows)
        {
            Ext.each(dataRows, function(row)
            {
                rowHasData = membersWithData.indexOf(row['RowId']) > -1;
                rowIsSelected = !Ext.isDefined(selectedVisitRowIds) || selectedVisitRowIds.indexOf(row['RowId']) > -1;

                if (rowHasData && rowIsSelected) key = 'hasDataSelected';
                else if (rowHasData && !rowIsSelected) key = 'hasDataUnselected';
                else if (!rowHasData && rowIsSelected) key = 'noDataSelected';
                else key = 'noDataUnselected';

                if (!Ext.isDefined(intervalMap[row[intervalAlias]]))
                {
                    intervalMap[row[intervalAlias]] = {
                        hasDataSelected: [],
                        hasDataUnselected: [],
                        noDataSelected: [],
                        noDataUnselected: []
                    };
                }

                intervalMap[row[intervalAlias]][key].push(row['RowId']);
            });

            // convert and load the interval visitRowId data into the memberStore
            Ext.iterate(intervalMap, function(interval, types)
            {
                Ext.each(Ext.Object.getKeys(types), function(key)
                {
                    if (types[key].length > 0)
                    {
                        modelDatas.push({
                            name: intervalName + ' ' + interval + ' - (' + types[key].length + ' stud' + (types[key].length === 1 ? 'y' : 'ies') + ')',
                            uniqueName: types[key],
                            count: key === 'hasDataSelected' || key === 'hasDataUnselected' ? 1 : 0,
                            selected: key === 'hasDataSelected' || key === 'noDataSelected'
                        });
                    }
                });
            });

            store.loadRawData(modelDatas);
            store.group(store.groupField, 'DESC');

            this.setReady();
        }, this);
    },

    populateSortBy : function()
    {
        var queryService = Connector.getQueryService(),
            timeLabel,
            items = [];

        // set the 'sorted by' choices based on the timeAliases
        Ext.iterate(queryService.getTimeAliases(), function(alias, value)
        {
            if (value === 1) {
                timeLabel = queryService.getMeasure(alias).label;
                items.push({
                    text: timeLabel,
                    uniqueName: alias
                });
            }
        });

        this.set('hierarchyItems', items);
    },

    setSortByLabel : function(intervalAlias)
    {
        var emptyInterval = !Ext.isDefined(intervalAlias) || intervalAlias === '',
            selectedLabel,
            selectedAlias;

        Ext.each(this.get('hierarchyItems'), function(item)
        {
            if (intervalAlias == item.uniqueName || (emptyInterval && !Ext.isDefined(selectedLabel)))
            {
                selectedLabel = item.text;
                selectedAlias = item.uniqueName;
            }
        });

        this.set('hierarchyLabel', selectedLabel);
        this.fireEvent('change', this);

        return selectedAlias;
    },

    getIntervalAlias : function()
    {
        var alias = QueryUtils.STUDY_ALIAS_PREFIX + 'Days',
            selectedLabel = this.get('hierarchyLabel');

        Ext.each(this.get('hierarchyItems'), function(item)
        {
            if (selectedLabel == item.text)
            {
                alias = item.uniqueName;
                return false;
            }
        });

        return alias;
    },

    createTimeFilterConfig : function(members, callback, scope) {
        var interval = this.getIntervalAlias(),
            wrappedTimeMeasure,
            visitRowIds = [],
            visitRowIdFilter,
            filterDisplayStrs = [];

        // wrapped time interval (i.e. Days, Weeks, etc.) for the getTimeFilter request
        wrappedTimeMeasure = {
            dateOptions: {
                interval: interval,
                zeroDayVisitTag: null
            },
            measure: Connector.getQueryService().getMeasure(interval)
        };

        // get the selected visit rowIds from the grid selection model
        Ext.each(members, function(selected)
        {
            visitRowIds = visitRowIds.concat(selected.get('uniqueName'));
            filterDisplayStrs.push(selected.get('name'));
        });

        // build up the VisitRowId filter for the gridFilter array
        visitRowIdFilter = LABKEY.Filter.create(QueryUtils.VISITROWID_ALIAS, visitRowIds.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF);

        // get the array of ParticipantSequenceNum values for the selected VisitRowIds and apply as an app time filter
        Connector.getFilterService().getTimeFilter(wrappedTimeMeasure, [visitRowIdFilter], function(timeFilter)
        {
            callback.call(scope, {
                filterSource: 'GETDATA',
                isGrid: true,
                isTime: true,
                timeFilters: [visitRowIdFilter],
                timeMeasure: wrappedTimeMeasure,
                gridFilter: [timeFilter, null, null, null],
                filterDisplayString: 'Time points: ' + filterDisplayStrs.join(', ')
            });
        }, this);
    },

    /* Override */
    onCompleteFilter : function(members, totalCount)
    {
        this.createTimeFilterConfig(members, function(timeFilterConfig)
        {
            var noopFilter = members.length === totalCount,
                state = Connector.getState();

            if (this.isFilterBased())
            {
                var staleFilter = this.get('filter');
                if (staleFilter)
                {
                    if (members.length > 0 && !noopFilter)
                    {
                        state.updateFilter(staleFilter.id, timeFilterConfig);
                    }
                    else
                    {
                        this.clearFilter(true);
                    }
                }
                else
                {
                    console.warn('Invalid filter state. Filter not available');
                }
            }
            else if (!noopFilter)
            {
                state.addFilter(timeFilterConfig);
            }
        }, this);
    },

    getFilterVisitRowIds : function()
    {
        if (this.isFilterBased())
        {
            var visitRowsIds = [], value;

            Ext.each(this.get('filter').getTimeFilters(), function(filter)
            {
                Ext.each(filter.getValue(), function(idStr)
                {
                    visitRowsIds.push(parseInt(idStr));
                });
            });

            return visitRowsIds;
        }

        return undefined;
    }
});