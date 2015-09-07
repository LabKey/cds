/*
 * Copyright (c) 2014 LabKey Corporation
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

    constructor : function(config) {
        this.callParent([config]);

        /**
         * @event columnmodelcustomize
         */
        this.addEvents('columnmodelcustomize');
    },

    initComponent : function() {
        if (!this.store) {
            throw 'Must provide a store or store config when creating a ' + this.$className;
        }

        Ext.applyIf(this, {
            columns: []
        });

        this.callParent();

        if (LABKEY.ext4.Util.hasStoreLoaded(this.store)) {
            this.setupColumnModel();
        }
        else {
            this.mon(this.store, 'load', this.setupColumnModel, this, {single: true});
            if (!this.store.isLoading()) {
                this.store.load({
                    params: {
                        start: 0,
                        limit: this.pageSize
                    }
                });
            }
        }
    },

    setupColumnModel : function() {
        var columns = this.getColumnsConfig();

        //TODO: make a map of columnNames -> positions like Ext3?
        this.fireEvent('columnmodelcustomize', this, columns);

        this.columns = columns;

        //reset the column model
        this.reconfigure(this.store, columns);
    },

    _getColumnsConfig : function(config) {
        var columns = LABKEY.ext4.Util.getColumnsConfig(this.store, this, config);

        if (Ext.isDefined(this.model)) {
            var measureNameToQueryMap = {};
            Ext.each(this.model.get('measures'), function(measure) {
                if (measure.queryLabel) {
                    measureNameToQueryMap[measure.alias] = measure.queryLabel;
                }
            });

            var plotMeasures = this.model.getMeasures('plotMeasures');
            Ext.each(columns, function(column) {

                var lowerIndex = column.dataIndex.toLowerCase();

                column.plotted = false;
                for (var a=0; a < plotMeasures.length; a++) {
                    if (LABKEY.MeasureUtil.getAlias(plotMeasures[a], true).toLowerCase() === lowerIndex) {
                        column.plotted = true;
                    }
                }

                if (measureNameToQueryMap[column.dataIndex]) {
                    column.queryLabel = measureNameToQueryMap[column.dataIndex];
                }

                column.width = this.defaultColumnWidth;

            }, this);
        }

        Ext.each(columns, function(column) {

            var meta, lookupStore;

            meta = LABKEY.ext4.Util.findFieldMetadata(this.store, column.dataIndex);
            if (!meta) {
                return true; // continue
            }

            // listen for changes to the underlying data in lookup store
            if (this.allowLookups === true && Ext.isObject(meta.lookup) && meta.lookups !== false && meta.lookup.isPublic === true) {
                lookupStore = LABKEY.ext4.Util.getLookupStore(meta);

                // this causes the whole grid to rerender, which is very expensive.  better solution?
                if (lookupStore) {
                    this.mon(lookupStore, 'load', this.onLookupStoreLoad, this, {delay: 100});
                }
            }

        }, this);

        return columns;
    },

    getColumnsConfig : function() {
        var config = {
            editable: this.editable,
            defaults: {
                sortable: false
            }
        };

        if (this.metadataDefaults) {
            Ext.Object.merge(config, this.metadataDefaults);
        }

        var columns = this._getColumnsConfig(config);

        return this.groupColumns(columns);
    },

    groupColumns : function(columns) {
        var queryService = Connector.getService('Query'),
            defaultColumns = queryService.getDefaultGridAliases(),
            definedMeasureSourceMap = queryService.getDefinedMeasuresSourceTitleMap(),
            groups = [],
            groupMap = {},
            studyTime = [],
            remainder = [],
            plotted = [];

        // Split columns into groups
        Ext.each(columns, function(col) {
            if (defaultColumns[col.dataIndex]) {
                studyTime.push(col);
            }
            else if (col.plotted === true) {
                plotted.push(col);
            }
            else {
                remainder.push(col);
            }

        }, this);

        groups.push({
            text: 'Study and time',
            columns: studyTime
        });

        if (plotted.length > 0) {
            groups.push({
                text: 'Plot Data Results',
                columns: plotted
            });
        }

        // All other groups based on query label
        Ext.each(remainder, function(col) {
            var measure = queryService.getMeasure(col.dataIndex),
                queryName;

            if (measure) {
                if (Ext.isDefined(definedMeasureSourceMap[measure.alias])) {
                    queryName = definedMeasureSourceMap[measure.alias];
                }
                else {
                    queryName = measure.queryLabel || measure.queryName;
                }
            }
            else {
                queryName = col.dataIndex.split('_')[1];
            }

            // HACK: special case to map SubjectGroupMap -> User groups
            if (queryName == "SubjectGroupMap")
                queryName = "User groups";

            if (Ext.isDefined(queryName)) {
                if (!groupMap[queryName]) {
                    groupMap[queryName] = [];
                }

                groupMap[queryName].push(col);
            }
        }, this);

        Ext.iterate(groupMap, function(key, value) {
            groups.push({
                text: key,
                columns: value
            });
        }, this);

        return groups;
    },

    onLookupStoreLoad : function() {
        this.getView().refresh();
    },

    getColumnById : function(colName) {
        return this.getColumnModel().getColumnById(colName);
    }
});