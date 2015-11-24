/*
 * Copyright (c) 2014-2015 LabKey Corporation
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

        this.fireEvent('columnmodelcustomize', this, columns);

        this.columns = columns;

        //reset the column model
        this.reconfigure(this.store, columns);
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
                            if (Math.abs(value) < 0.0001) {
                                // show the 1st significant digit, we don't want to show 0
                                return value.toPrecision(1);
                            }
                            else {
                                return parseFloat(value.toFixed(4));

                            };
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

        var columns = this._getColumnsConfig(config);

        return this.groupColumns(columns);
    },

    groupColumns : function(columns)
    {
        var defaultGroup = 'Study and time',
            queryService = Connector.getQueryService(),
            defaultColumns = queryService.getDefaultGridAliases(false, true),
            definedMeasureSourceMap = queryService.getDefinedMeasuresSourceTitleMap(),
            groups = [],
            groupMap = {},
            studyTime = [],
            remainder = [];

        // Split columns into groups
        Ext.each(columns, function(col)
        {
            if (defaultColumns[col.dataIndex.toLowerCase()] ||
                col.dataIndex.indexOf(QueryUtils.STUDY_ALIAS_PREFIX) == 0)
            {
                studyTime.push(col);
            }
            else
            {
                remainder.push(col);
            }
        }, this);

        groups.push({
            text: defaultGroup,
            columns: studyTime
        });

        // All other groups based on query label
        Ext.each(remainder, function(col)
        {
            var measure = !QueryUtils.isGeneratedColumnAlias(col.dataIndex) ? queryService.getMeasure(col.dataIndex) : undefined,
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
                queryName = col.dataIndex.split('_')[1];
            }

            if (Ext.isDefined(queryName))
            {
                if (!groupMap[queryName])
                {
                    groupMap[queryName] = [];
                }

                groupMap[queryName].push(col);
            }
        }, this);

        var columnCharacterWidth = 14;
        Ext.iterate(groupMap, function(key, value)
        {
            groups.push({
                text: value.length > 2 ? key : Ext.String.ellipsis(key, columnCharacterWidth * value.length, true),
                columns: value.sort(function(a, b)
                {
                    var ah = a.header.toLowerCase(),
                        bh = b.header.toLowerCase();

                    // sort columns alphabetically by header
                    return ah == bh ? 0 : (ah > bh ? 1 : -1);
                })
            });
        });

        groups.sort(function(a, b)
        {
            if (a.text === defaultGroup)
                return -1;
            else if (b.text === defaultGroup)
                return 1;
            return a.text == b.text ? 0 : (a.text > b.text ? 1 : -1);
        });

        return groups;
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