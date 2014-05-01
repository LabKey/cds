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
        editable: true,
        pageSize: 10000,
        autoSave: false,
        multiSelect: true,
        clicksToEdit: 2,
        editingPluginId: 'editingplugin'
    },

    initComponent : function() {
        this.initStore();

        Ext.QuickTips.init({
            constrainPosition: true
        });

        Ext.applyIf(this, {
            columns: [],

            /*
             * The intent of these options is to infer column widths based on the data being shown
             */
            charWidth  : 6,  //TODO: this should be measured, but measuring is expensive so we only want to do it once
            colPadding : 10, //TODO: also should be calculated
            maxColWidth: 400
        });

        if(this.showPagingToolbar){
            this.dockedItems = this.dockedItems || [];
            this.dockedItems.push({
                xtype: 'pagingtoolbar',
                store: this.store,   // same store GridPanel is using
                dock: 'bottom',
                ui: this.ui,
                displayInfo: true
            });
        }

        this.configurePlugins();

        if(LABKEY.ext4.Util.hasStoreLoaded(this.store)){
            this.columns = this.getColumnsConfig();
        }

        this.callParent();

        this.configureHeaders();

        if(!this.columns.length){
            this.mon(this.store, 'load', this.setupColumnModel, this, {single: true});
            if(!this.store.isLoading()){
                this.store.load({ params : {
                    start: 0,
                    limit: this.pageSize
                }});
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
    }

    ,configureHeaders : function() {
        if(!this.headerCt)
            return;

        this.mon(this.headerCt, 'menucreate', this.onMenuCreate, this);
    }

    ,onMenuCreate : function(header, menu) {
        menu.insert(2, {xtype : 'menuseparator'});
        menu.insert(3, {text: 'Filter...', handler : this.onShowFilter, scope : this});
        menu.remove(4);
    }

    ,onShowFilter : function(x,y,z) {
        console.log('would show filter');
        console.log([x,y,z]);
    }

    ,initStore : function() {
        if(!this.store){
            alert('Must provide a store or store config when creating a gridpanel');
            return;
        }

        //allow creation of panel using store config object
        if(!this.store.events)
            this.store = Ext.create('LABKEY.ext4.data.Store', this.store);

        this.store.supressErrorAlert = true;

        //TODO: need a better solution to this problem.  maybe be smarter when processing load() in the store?
        //if we sort/filter remotely, we risk losing changes made on the client
        if(this.editable){
            this.store.remoteSort = false;
            this.store.remoteFilter = false;
        }

        if(this.autoSave)
            this.store.autoSync = true;  //could we just obligate users to put this on the store directly?
    }

    //separated to allow subclasses to override
    ,configurePlugins : function() {
        this.plugins = this.plugins || [];

        if(this.editable)
            this.plugins.push(this.getEditingPlugin());
    }

    ,getEditingPlugin : function() {
        return Ext.create('Ext.grid.plugin.CellEditing', {
            pluginId: this.editingPluginId,
            clicksToEdit: this.clicksToEdit
        });
    }

    ,setupColumnModel : function() {
        var columns = this.getColumnsConfig();

        //TODO: make a map of columnNames -> positions like Ext3?
        this.fireEvent("columnmodelcustomize", this, columns);

        this.columns = columns;

        //reset the column model
        this.reconfigure(this.store, columns);

    }
    ,getColumnsConfig : function() {
        var config = {
            editable: this.editable,
            defaults: {
                sortable: false
            }
        };

        if(this.metadataDefaults){
            Ext.Object.merge(config, this.metadataDefaults);
        }
        if(this.metadata && this.metadata[c.name]){
            Ext.Object.merge(config, this.metadata[c.name]);
        }

        var columns = LABKEY.ext4.Util.getColumnsConfig(this.store, this, config);

        for (var idx=0;idx<columns.length;idx++){
            var col = columns[idx];

            //remember the first editable column (used during add record)
            if(!this.firstEditableColumn && col.editable)
                this.firstEditableColumn = idx;

            if (this.hideNonEditableColumns && !col.editable) {
                col.hidden = true;
            }

            var meta = LABKEY.ext4.Util.findFieldMetadata(this.store, col.dataIndex);
            if(!meta)
                continue;

            if(meta.isAutoExpandColumn && !col.hidden){
                this.autoExpandColumn = idx;
            }

            //listen for changes in underlying data in lookup store
            if(meta.lookup && meta.lookups !== false && meta.lookup.isPublic){
                var lookupStore = LABKEY.ext4.Util.getLookupStore(meta);

                //this causes the whole grid to rerender, which is very expensive.  better solution?
                if(lookupStore){
                    this.mon(lookupStore, 'load', this.onLookupStoreLoad, this, {delay: 100});
                }
            }
        }

        this.inferColumnWidths(columns);

        for (var i=0; i < columns.length; i++) {
            columns[i].width = this.defaultColumnWidth;
        }

        // Split columns into groups
        var groups = [];

        // A special group of recognized columns
        var studyTime = [], remainder = [];
        var studyCols = {
            subjectid: true,
            study: true,
            startdate: true,
            visitdate: true
        };
        Ext.each(columns, function(col) {
            var dataIndex = col.dataIndex.split('_');
            var colName = dataIndex[dataIndex.length-1].toLowerCase();

            if (studyCols[colName]) {
                studyTime.push(col);
            }
            else {
                remainder.push(col);
            }

        }, this);
        groups.push({
            text: 'Study and time',
            columns: studyTime
        });

        // All other groups based on query name
        var groupMap = {};
        Ext.each(remainder, function(col) {
            var queryName = col.dataIndex.split('_')[1];

            if (Ext.isDefined(queryName)) {
                if (!groupMap[queryName]) {
                    groupMap[queryName] = [];
                }

                groupMap[queryName].push(col);
            }
        }, this);

        Ext.iterate(groupMap, function(key, value) {
            var group = {
                text: key,
                columns: value
            };
            groups.push(group);
        }, this);

        return groups;
    }

    //private.  separated to allow buffering, since refresh is expensive
    ,onLookupStoreLoad : function(lookupStore) {
        if(!this.rendered || !this.getView()){
            return;
        }
        this.fireEvent('lookupstoreload');
    }

    //private
    ,onLookupStoreEventFired : function() {
        this.getView().refresh();
    }

    ,inferColumnWidths : function(columns) {
        var col,
                meta,
                value,
                values,
                totalRequestedWidth = 0;

        for (var i=0;i<columns.length;i++){

            col = columns[i];
            meta = LABKEY.ext4.Util.findFieldMetadata(this.store, col.dataIndex);

            if(meta && !meta.fixedWidthCol){
                values = [];
                var records = this.store.getRange();
                for (var j=0;j<records.length;j++){
                    var rec = records[j];
                    value = LABKEY.ext4.Util.getDisplayString(rec.get(meta.name), meta, rec, rec.store);
                    if(!Ext.isEmpty(value)) {
                        values.push(value.length);
                    }
                }

                //TODO: this should probably take into account mean vs max, and somehow account for line wrapping on really long text
                var avgLen = values.length ? (Ext.Array.sum(values) / values.length) : 1;

                col.width = Math.max(avgLen, col.header ? col.header.length : 0) * this.charWidth + this.colPadding;
                col.width = Math.min(col.width, this.maxColWidth);
            }

            if (!col.hidden) {
                totalRequestedWidth += col.width || 0;
            }
        }

        if (this.constraintColumnWidths) {

            for (i=0;i<columns.length;i++){
                col = columns[i];
                if (!col.hidden) {
                    col.flex  = (col.width / totalRequestedWidth);
                    col.width = null;
                }
            }
        }
    }

    ,getColumnById : function(colName) {
        return this.getColumnModel().getColumnById(colName);
    }

    ,onCommitException : function(store, message, response, operation) {
        var msg = message || 'There was an error with the submission';

        if (!this.supressErrorAlert) {
            Ext.Msg.alert('Error', msg);
        }
    }
});

LABKEY.ext4.GRIDBUTTONS = {
    /**
     *
     * @param name
     * @param config
     */
    getButton: function(name, config){
        return LABKEY.ext4.GRIDBUTTONS[name] ? LABKEY.ext4.GRIDBUTTONS[name](config) : null;
    },

    //TODO: make these private?
    ADDRECORD: function(config){
        return Ext.Object.merge({
            text: 'Add Record',
            tooltip: 'Click to add a row',
            handler: function(btn){
                var grid = btn.up('gridpanel');
                if(!grid.store || !LABKEY.ext4.Util.hasStoreLoaded(grid.store))
                    return;

                var cellEditing = grid.getPlugin('cellediting');
                if(cellEditing)
                    cellEditing.completeEdit();

                var model = grid.store.createModel({});
                grid.store.insert(0, [model]); //add a blank record in the first position

                if(cellEditing)
                    cellEditing.startEditByPosition({row: 0, column: this.firstEditableColumn || 0});
            }
        }, config);
    },
    DELETERECORD: function(config){
        return Ext.Object.merge({
            text: 'Delete Records',
            tooltip: 'Click to delete selected rows',
            handler: function(btn){
                var grid = btn.up('gridpanel');
                var selections = grid.getSelectionModel().getSelection();

                if(!grid.store || !selections || !selections.length)
                    return;

                grid.store.remove(selections);
            }
        }, config);
    },
    SUBMIT: function(config){
        return Ext.Object.merge({
            text: 'Submit',
            formBind: true,
            handler: function(btn, key){
                var panel = btn.up('gridpanel');
                panel.store.on('write', function(store, success){
                    Ext.Msg.alert("Success", "Your upload was successful!", function(){
                        window.location = btn.successURL || LABKEY.ActionURL.buildURL('query', 'executeQuery', null, {schemaName: this.store.schemaName, 'query.queryName': this.store.queryName})
                    }, panel);
                }, this);
                panel.store.sync();
            }
        }, config);
    },
    CANCEL: function(config){
        return Ext.Object.merge({
            text: 'Cancel',
            handler: function(btn, key){
                window.location = btn.returnURL || LABKEY.ActionURL.getParameter('srcURL') || LABKEY.ActionURL.buildURL('project', 'begin')
            }
        }, config)
    }
};