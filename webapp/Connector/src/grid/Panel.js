/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.grid.Panel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.connector-gridpanel',

    defaultColumnWidth: 100,

    /**
     * True to constrain column dragging so that a column cannot be dragged
     * in or out of it's current group.
     */
    sealedColumns: true,

    enableColumnMove: false,

    allowLookups: true,

    cls: 'connector-grid',

    config: {
        defaultFieldWidth: 200,
        editable: false, // If true, must reconcile with remoteSort
        pageSize: Connector.model.Grid.getMaxRows(),
        autoSave: false,
        multiSelect: true
    },

    model: undefined, // instance of Connector.model.Grid

    /*
     * The intent of these options is to infer column widths based on the data being shown
     */
    charWidth: 6,
    colPadding: 10,
    maxColWidth: 400,

    statics: {
        groupColumns : function(columns, isMeasure)
        {
            var defaultGroup = QueryUtils.DATA_SOURCE_STUDY_AND_TIME,
                    subjectCharacteristicsGroup = QueryUtils.DATA_SOURCE_SUBJECT_CHARACTERISTICS,
                    addedTimeGroup = QueryUtils.DATA_SOURCE_ADDED_TIME_POINT,
                    queryService = Connector.getQueryService(),
                    defaultColumns = queryService.getDefaultGridAliases(false, true),
                    definedMeasureSourceMap = queryService.getDefinedMeasuresSourceTitleMap(),
                    groups = [],
                    groupMap = {},
                    studyTime = [],
                    time = [],
                    remainder = [];

            // Split columns into groups
            Ext.each(columns, function(col)
            {
                var name = isMeasure ? col.measure.alias : col.dataIndex;
                if (defaultColumns[name.toLowerCase()])
                {
                    studyTime.push(col);
                }
                else if (name.toLowerCase().indexOf(QueryUtils.STUDY_ALIAS_PREFIX.toLowerCase()) == 0)
                {
                    if (name.toLowerCase() === QueryUtils.SUBJECT_SEQNUM_ALIAS.toLowerCase())
                        studyTime.push(col);
                    else
                        time.push(col);
                }
                else
                {
                    remainder.push(col);
                }
            });

            if (studyTime.length > 0)
            {
                groups.push({
                    text: defaultGroup,
                    columns: studyTime
                });
            }

            if (time.length > 0) // demographics tab doesn't include time points
            {
                groups.push({
                    text: addedTimeGroup,
                    columns: time
                });
            }

            // All other groups based on query label
            Ext.each(remainder, function(col)
            {
                var name = isMeasure ? col.measure.alias : col.dataIndex;
                var measure = !QueryUtils.isGeneratedColumnAlias(name) ? queryService.getMeasure(name) : undefined,
                        queryName;

                if (Ext.isObject(measure))
                {
                    if (Ext.isDefined(definedMeasureSourceMap[measure.alias]))
                    {
                        queryName = definedMeasureSourceMap[measure.alias];
                    }
                    else
                    {
                        queryName = measure.queryName;
                    }
                }
                else
                {
                    queryName = name.split('_')[1];
                }

                if (Ext.isDefined(queryName))
                {
                    if (!groupMap[queryName])
                    {
                        groupMap[queryName] = [];
                    }

                    groupMap[queryName].push(col);
                }
            });

            var columnCharacterWidth = 14;

            //handle sorting of nab virus metadata
            var nabVirusCols = [];
            var nabOtherCols = [];
            var nabVirusMetaSorted = [];

            //separate out Nab's virus meta cols from non-virus cols
            Ext.iterate(groupMap, function(key, value) {
                if (key === QueryUtils.DATA_SOURCE_NAb) {
                    Ext.each(value, function(col) {
                        var name = col.measure && col.measure.alias ? col.measure.alias : col.dataIndex;
                        if (QueryUtils.NAB_VIRUS_META_SORT_ORDER[name]) {
                            nabVirusCols.push(col);
                        }
                        else {
                            nabOtherCols.push(col);
                        }
                    });
                }
            });

            //sorted nab virus cols
            if (nabVirusCols.length > 0) {
                nabVirusMetaSorted = nabVirusCols.sort(function (a, b) {
                    var aname = a.measure && a.measure.alias ? a.measure.alias : a.dataIndex;
                    var bname = b.measure && b.measure.alias ? b.measure.alias : b.dataIndex;
                    return QueryUtils.NAB_VIRUS_META_SORT_ORDER[aname] - QueryUtils.NAB_VIRUS_META_SORT_ORDER[bname];
                });
            }

            Ext.iterate(groupMap, function(key, value)
            {
                //non-virus metadata cols for Nab
                if (key === QueryUtils.DATA_SOURCE_NAb) {
                    value = nabOtherCols;
                }
                groups.push({
                    text: key,
                    columns: value.sort(function(a, b) {

                        var ah = isMeasure ? a.measure.label.toLowerCase() : a.header.toLowerCase(),
                                bh = isMeasure ? b.measure.label.toLowerCase() : b.header.toLowerCase();

                        if (ah.toLowerCase() === Connector.studyContext.subjectColumn.toLowerCase() || ah.toLowerCase() === Connector.studyContext.subjectLabel.toLowerCase())
                            return -1;
                        else if (bh.toLowerCase() === Connector.studyContext.subjectColumn.toLowerCase() || bh.toLowerCase() === Connector.studyContext.subjectColumn.toLowerCase())
                            return 1;

                        // sort columns alphabetically by title
                        return ah == bh ? 0 : (ah > bh ? 1 : -1);
                    })
                });
            });

            //concat sorted nab virus cols with other sorted non-virus cols
            Ext.each(groups, function (grp) {
                if (grp.text === QueryUtils.DATA_SOURCE_NAb) {
                    grp.columns = grp.columns.concat(nabVirusMetaSorted);
                }
            });

            groups.sort(function(a, b)
            {
                if (a.text === subjectCharacteristicsGroup)
                    return -1;
                else if (b.text === subjectCharacteristicsGroup)
                    return 1;
                else if (a.text === defaultGroup)
                    return -1;
                else if (b.text === defaultGroup)
                    return 1;
                else if (a.text === addedTimeGroup)
                    return -1;
                else if (b.text === addedTimeGroup)
                    return 1;
                return a.text == b.text ? 0 : (a.text > b.text ? 1 : -1);
            });

            return groups;
        }

    },

    constructor : function(config)
    {
        this.callParent([config]);

        /**
         * @event columnmodelcustomize
         */
        this.addEvents('columnmodelcustomize');
    },

    initComponent : function()
    {
        if (!this.store)
        {
            throw 'Must provide a store or store config when creating a ' + this.$className;
        }

        Ext.applyIf(this, {
            columns: []
        });

        this.callParent();

        if (LABKEY.ext4.Util.hasStoreLoaded(this.store))
        {
            this.setupColumnModel();
        }
        else
        {
            this.mon(this.store, 'load', this.setupColumnModel, this, {single: true});
            if (!this.store.isLoading())
            {
                this.store.load({
                    params: {
                        start: 0,
                        limit: this.pageSize
                    }
                });
            }
        }
    },

    setupColumnModel : function()
    {
        var columns = this.getColumnsConfig();
        var columnGroups = Connector.grid.Panel.groupColumns(columns);

        if (!this.model.isDemographicsTab())
        {
            columns = this.flattenColumns(columnGroups);
        }

        this.fireEvent('columnmodelcustomize', this, columnGroups);

        this.columns = columns;

        //reset the column model
        this.reconfigure(this.store, columns);
    },

    flattenColumns: function(columnGroups)
    {
        var columns = [];
        Ext.each(columnGroups, function(columnGroup) {
             columns = columns.concat(columnGroup.columns);
        });
        return columns;
    },

    _getColumnsConfig : function(config)
    {
        var columns = LABKEY.ext4.Util.getColumnsConfig(this.store, this, config),
            measureNameToQueryMap = {};

        if (Ext.isDefined(this.model))
        {
            Ext.each(this.model.get('measures'), function(measure)
            {
                if (measure.queryLabel)
                {
                    measureNameToQueryMap[measure.alias] = measure.queryLabel;
                }
            });

            Ext.each(columns, function(column)
            {
                if (measureNameToQueryMap[column.dataIndex])
                {
                    column.queryLabel = measureNameToQueryMap[column.dataIndex];
                }

                column.width = this.defaultColumnWidth;

                var meta = LABKEY.ext4.Util.findFieldMetadata(this.store, column.dataIndex);
                if (meta) {
                    var type  = meta.displayFieldJsonType || meta.jsonType;
                    if  (type === 'float') {
                        column.renderer = function(value) {
                            if (value == undefined)
                                return value;
                            if (Math.abs(value) < 0.0001) {
                                // show the 1st significant digit, we don't want to show 0
                                return value.toPrecision(1) * 1; // toPrecision returns string, use *1 to convert back to number
                            }
                            else {
                                return parseFloat(value.toFixed(4));
                            }
                        };
                    }
                }
            }, this);
        }

        // This is removed in an effort to speed-up grid rendering. If the usage of lookup
        // columns becomes something that is needed again, comment this code back in to get
        // column displays to resolve properly.
        //Ext.each(columns, function(column)
        //{
        //    var meta = LABKEY.ext4.Util.findFieldMetadata(this.store, column.dataIndex),
        //        lookupStore;
        //
        //    if (meta)
        //    {
        //        // listen for changes to the underlying data in lookup store
        //        if (this.allowLookups === true && Ext.isObject(meta.lookup) &&
        //            meta.lookups !== false && meta.lookup.isPublic === true)
        //        {
        //            lookupStore = LABKEY.ext4.Util.getLookupStore(meta);
        //
        //            // this causes the whole grid to rerender, which is very expensive.  better solution?
        //            if (lookupStore)
        //            {
        //                this.mon(lookupStore, 'load', this.onLookupStoreLoad, this, {delay: 100});
        //            }
        //        }
        //    }
        //
        //}, this);

        return columns;
    },

    getColumnsConfig : function()
    {
        var config = {
            editable: this.editable,
            defaults: {
                sortable: false
            }
        };

        if (this.metadataDefaults)
        {
            Ext.Object.merge(config, this.metadataDefaults);
        }

        return this._getColumnsConfig(config);
    },

    onLookupStoreLoad : function()
    {
        this.getView().refresh();
    },

    getColumnById : function(colName)
    {
        return this.getColumnModel().getColumnById(colName);
    }
});