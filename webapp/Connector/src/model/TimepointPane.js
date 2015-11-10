
Ext.define('Connector.model.TimepointPane', {

    extend: 'Connector.model.InfoPane',

    fields: [
        {name: 'dataRows', defaultValue: []}
    ],

    /* Override */
    configure : function(dimName, hierName, lvlName, deferToFilters) {
        var intervalAlias;

        // clear out for initialization
        this.set({
            dimension: undefined,
            hierarchy: undefined,
            level: undefined
        });

        if (this.get('hierarchyItems').length == 0)
        {
            this.populateSortBy();
        }
        intervalAlias = this.setSortByLabel(hierName);

        this.populateFilterMembers(intervalAlias);

        this.fireEvent('change', this);
        this.setReady();
    },

    populateFilterMembers : function(intervalAlias)
    {
        var modelDatas = [],
            intervalName = intervalAlias.replace(QueryUtils.STUDY_ALIAS_PREFIX, '').replace('s', ''),
            intervalVisitRowIdMap = {},
            store = this.get('memberStore');

        // populate the member store based on the data rows from the distinct timepoint query results
        Ext.each(this.get('dataRows'), function(row)
        {
            if (!Ext.isDefined(intervalVisitRowIdMap[row[intervalAlias]]))
            {
                intervalVisitRowIdMap[row[intervalAlias]] = [];
            }

            intervalVisitRowIdMap[row[intervalAlias]].push(row['RowId']);
        });

        // convert and load the interval visitRowId data into the memberStore
        Ext.iterate(intervalVisitRowIdMap, function(key, value)
        {
            modelDatas.push({
                name: intervalName + ' ' + key + ' (' + value.length + ' stud' + (value.length == 1 ? 'y' : 'ies') + ')',
                uniqueName: value,
                count: value.length
            });
        });
        store.loadRawData(modelDatas);
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
        var selectedLabel, selectedAlias;

        Ext.each(this.get('hierarchyItems'), function(item)
        {
            if (intervalAlias == item.uniqueName || (!Ext.isDefined(intervalAlias) && !Ext.isDefined(selectedLabel)))
            {
                selectedLabel = item.text;
                selectedAlias = item.uniqueName;
            }
        });

        this.set('hierarchyLabel', selectedLabel);
        return selectedAlias;
    }
});