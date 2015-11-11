
Ext.define('Connector.model.TimepointPane', {

    extend: 'Connector.model.InfoPane',

    fields: [
        {name: 'selectedRows', defaultValue: []}, // array of selected visitRowIds for all application filters
        {name: 'dataRows', defaultValue: []} // array of visitRowIds for all application filters except time filters
    ],

    /* Override */
    configure : function(dimName, hierName, lvlName, deferToFilters) {
        var emptyInterval = !Ext.isDefined(hierName) || hierName == '',
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

        if (this.get('hierarchyItems').length == 0)
        {
            this.populateSortBy();
        }
        intervalAlias = this.setSortByLabel(hierName);

        this.populateFilterMembers(intervalAlias);
    },

    populateFilterMembers : function(intervalAlias)
    {
        var store = this.get('memberStore'),
            selectedVisitRowIds,
            intervalName,
            intervalVisitRowIdMap = {selected: {}, unselected: {}},
            rowSelType,
            modelDatas;

        // trim interval name based on the alias (TODO need a better way to get this)
        intervalName = intervalAlias.replace(QueryUtils.STUDY_ALIAS_PREFIX, '').replace('s', '')

        selectedVisitRowIds = Ext.Array.pluck(this.get('selectedRows'), 'RowId');

        // populate the member store based on the data rows from the distinct timepoint query results
        // keep track of which visitRowIds are selected (have data) and which do not (no data because of time filter)
        Ext.each(this.get('dataRows'), function(row)
        {
            rowSelType = selectedVisitRowIds.indexOf(row['RowId']) != -1 ? 'selected' : 'unselected';

            if (!Ext.isDefined(intervalVisitRowIdMap[rowSelType][row[intervalAlias]]))
            {
                intervalVisitRowIdMap[rowSelType][row[intervalAlias]] = [];
            }
            intervalVisitRowIdMap[rowSelType][row[intervalAlias]].push(row['RowId']);
        });

        // convert and load the interval visitRowId data into the memberStore
        modelDatas = this.getMemberDataModels(intervalName, intervalVisitRowIdMap, 'selected');
        modelDatas = modelDatas.concat(this.getMemberDataModels(intervalName, intervalVisitRowIdMap, 'unselected'));
        store.loadRawData(modelDatas);
        store.group(store.groupField, 'DESC');

        this.setReady();
    },

    getMemberDataModels : function(intervalName, intervalVisitRowIdMap, type)
    {
        var datas = [];
        Ext.iterate(intervalVisitRowIdMap[type], function(key, value)
        {
            datas.push({
                name: intervalName + ' ' + key + ' - (' + value.length + ' stud' + (value.length == 1 ? 'y' : 'ies') + ')',
                uniqueName: value,
                count: type == 'selected' ? 1 : 0
            });
        }, this);

        return datas;
    },

    populateSortBy : function()
    {
        var queryService = Connector.getQueryService(),
            timeLabel,
            items = [];

        // set the 'sorted by' choices based on the timeAliases
        Ext.iterate(queryService.getTimeAliases(), function(alias, value)
        {
            timeLabel = queryService.getMeasure(alias).label;
            items.push({
                text: timeLabel,
                uniqueName: alias
            });
        });

        this.set('hierarchyItems', items);
    },

    setSortByLabel : function(intervalAlias)
    {
        var emptyInterval = !Ext.isDefined(intervalAlias) || intervalAlias == '',
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
    }
});