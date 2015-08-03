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

    cls: 'connector-grid',

    config: {
        defaultFieldWidth: 200,
        editable: false, // If true, must reconcile with remoteSort
        pageSize: Connector.model.Grid.getMaxRows(),
        autoSave: false,
        multiSelect: true,
        clicksToEdit: 2,
        editingPluginId: 'editingplugin'
    },

    model: undefined, // instance of Connector.model.Grid

    // A special group of recognized columns
    studyColumns: {
        subjectid: true,
        study: true,
        startdate: true,
        visit: true,
        visitdate: true,
        days: true,
        weeks: true,
        months: true
    },

    /*
     * The intent of these options is to infer column widths based on the data being shown
     */
    charWidth: 6,   //TODO: this should be measured, but measuring is expensive so we only want to do it once
    colPadding: 10, //TODO: also should be calculated
    maxColWidth: 400,

    initComponent : function() {
        this.initStore();

        Ext.applyIf(this, {
            columns: []
        });

        if (LABKEY.ext4.Util.hasStoreLoaded(this.store)) {
            this.columns = this.getColumnsConfig();
        }

        this.callParent();

        if (Ext.isEmpty(this.columns)) {
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

        this.mon(this.store, 'exception', this.onCommitException, this);
        /**
         * @event columnmodelcustomize
         */
        /**
         * Experimental.  Lookups sometimes create a separate store to find the display string for a field.  When this
         * store loads, it can cause the grid to refresh, which is expensive.  This event is used internally
         * to batch these events and minimze the grid refreshes.
         * @private
         * @event lookupstoreload
         */
        this.addEvents('columnmodelcustomize', 'lookupstoreload');

        this.on('lookupstoreload', this.onLookupStoreEventFired, this, {buffer: 200});
    },

    initStore : function() {
        if (!this.store) {
            console.error('Must provide a store or store config when creating a gridpanel');
            return;
        }

        this.store.supressErrorAlert = true;

        //TODO: need a better solution to this problem.  maybe be smarter when processing load() in the store?
        //if we sort/filter remotely, we risk losing changes made on the client
        if (this.editable) {
            this.store.remoteSort = false;
            this.store.remoteFilter = false;
        }

        if (this.autoSave) {
            this.store.autoSync = true;  //could we just obligate users to put this on the store directly?
        }
    },

    setupColumnModel : function() {
        var columns = this.getColumnsConfig();

        //TODO: make a map of columnNames -> positions like Ext3?
        this.fireEvent("columnmodelcustomize", this, columns);

        this.columns = columns;

        //reset the column model
        this.reconfigure(this.store, columns);
    },

    _getColumnsConfig : function(store, config) {
        var columns = LABKEY.ext4.Util.getColumnsConfig(store, this, config);

        if (Ext.isDefined(this.model)) {
            var measureNameToQueryMap = {};
            Ext.each(this.model.get('measures'), function(measure) {
                if (measure.queryLabel) {
                    measureNameToQueryMap[measure.alias] = measure.queryLabel;
                }
            });

            var plotMeasures = this.model.getMeasures('plotMeasures');
            Ext.each(columns, function(column) {

                column.plotted = false;
                for (var a=0; a < plotMeasures.length; a++) {
                    if (LABKEY.MeasureUtil.getAlias(plotMeasures[a], true).toLowerCase() === column.dataIndex.toLowerCase()) {
                        column.plotted = true;
                    }
                }

                if (measureNameToQueryMap[column.dataIndex]) {
                    column.queryLabel = measureNameToQueryMap[column.dataIndex];
                }
            });
        }

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

        var columns = this._getColumnsConfig(this.store, config),
            groupMap = {},
            groups = [],
            studyTime = [],
            remainder = [],
            plotted = [],
            meta,
            lookupStore;

        Ext.each(columns, function(column) {

            column.width = this.defaultColumnWidth;

            meta = LABKEY.ext4.Util.findFieldMetadata(this.store, column.dataIndex);
            if (!meta) {
                return true; // continue
            }

            // listen for changes to the underlying data in lookup store
            if (Ext.isObject(meta.lookup) && meta.lookups !== false && meta.lookup.isPublic === true) {
                lookupStore = LABKEY.ext4.Util.getLookupStore(meta);

                // this causes the whole grid to rerender, which is very expensive.  better solution?
                if (lookupStore) {
                    this.mon(lookupStore, 'load', this.onLookupStoreLoad, this, {delay: 100});
                }
            }

        }, this);

        // Split columns into groups
        Ext.each(columns, function(col) {
            var dataIndex = col.dataIndex.split('_');
            var colName = dataIndex[dataIndex.length-1].toLowerCase();

            if (this.studyColumns[colName]) {
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

        // All other groups based on query name
        Ext.each(remainder, function(col) {
            var queryName = col.dataIndex.split('_')[1];

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

    //private.  separated to allow buffering, since refresh is expensive
    onLookupStoreLoad : function(/* store */) {
        if (this.rendered && this.getView()) {
            this.fireEvent('lookupstoreload');
        }
    },

    //private
    onLookupStoreEventFired : function() {
        this.getView().refresh();
    },

    getColumnById : function(colName) {
        return this.getColumnModel().getColumnById(colName);
    },

    onCommitException : function(store, message /*, response, operation */) {
        var msg = message || 'There was an error with the submission';

        if (!this.supressErrorAlert) {
            Ext.Msg.alert('Error', msg);
        }
    }
});