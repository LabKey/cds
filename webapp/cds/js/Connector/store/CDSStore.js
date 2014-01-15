/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.store.CDSStore', {
    extend: 'Ext.data.Store',
    alias: 'store.cds-store',
    //the page size defaults to 25, which can give odd behavior for combos or other applications.
    //applications that want to use paging should modify this.
    pageSize: 10000,
    constructor: function(config) {
        config = config || {};

        config.updatable = Ext4.isDefined(config.updatable) ? config.updatable : true;

        var baseParams = this.generateBaseParams(config);

        Ext4.apply(this, config);

        //specify an empty fields array instead of a model.  the reader will creates a model later
        this.fields = [];

        this.proxy = {
            type: 'CDSProxy',
            store: this,
            timeout: this.timeout,
            listeners: {
                scope: this,
                exception: this.onProxyException
            },
            extraParams: baseParams
        };

        //see note below
        var autoLoad = config.autoLoad;
        config.autoLoad = false;
        this.autoLoad = false;

        // call the superclass's constructor
        this.callParent([config]);

        //NOTE: if the config object contains a load lister it will be executed prior to this one...not sure if that's a problem or not
        this.on('beforeload', this.onBeforeLoad, this);
        this.on('load', this.onLoad, this);
        this.on('update', this.onUpdate, this);
        this.on('add', this.onAdd, this);

        this.proxy.reader.on('dataload', this.onReaderLoad, this);

        //Add this here instead of allowing Ext.store to autoLoad to make sure above listeners are added before 1st load
        if(autoLoad){
            this.autoLoad = autoLoad;
            Ext4.defer(this.load, 10, this, [
                typeof this.autoLoad == 'object' ? this.autoLoad : undefined
            ]);
        }

        this.addEvents('beforemetachange', 'exception', 'synccomplete');
    },
    //private
    generateBaseParams: function(config){
        if(config)
            this.initialConfig = Ext4.apply({}, config);

        config = config || this;
        var baseParams = {};
        baseParams.schemaName = config.schemaName;
        baseParams.apiVersion = 9.1;

        if (config.parameters){
            for (var n in config.parameters)
                baseParams["query.param." + n] = config.parameters[n];
        }

        if (config.containerFilter){
            //baseParams['query.containerFilterName'] = config.containerFilter;
            baseParams['containerFilter'] = config.containerFilter;
        }

        if(config.ignoreFilter)
            baseParams['query.ignoreFilter'] = 1;

        if(Ext4.isDefined(config.maxRows)){
            baseParams['query.maxRows'] = config.maxRows;
            if(config.maxRows < this.pageSize)
                this.pageSize = config.maxRows;

            if(config.maxRows === 0)
                this.pageSize = 0;
        }

        if (config.viewName)
            baseParams['query.viewName'] = config.viewName;

        if (config.columns)
            baseParams['query.columns'] = Ext4.isArray(config.columns) ? config.columns.join(",") : config.columns;

        if (config.queryName)
            baseParams['query.queryName'] = config.queryName;

        if (config.containerPath)
            baseParams.containerPath = config.containerPath;

        if(config.pageSize && config.maxRows !== 0 && this.maxRows !== 0)
            baseParams['limit'] = config.pageSize;

        //NOTE: sort() is a method in the store.  it's awkward to support a param, but we do it since selectRows() uses it
        if(this.initialConfig && this.initialConfig.sort)
            baseParams['query.sort'] = this.initialConfig.sort;
        delete config.sort; //important...otherwise the native sort() method is overridden

        if(config.sql){
            baseParams.sql = config.sql;
            this.updatable = false;
        }
        else {
            this.updatable = true;
        }

        LABKEY.Filter.appendFilterParams(baseParams, config.filterArray);

        return baseParams;
    },

    //private
    //NOTE: the purpose of this is to provide a way to modify the server-supplied metadata and supplement with a client-supplied object
    onReaderLoad: function(data){
        var meta = data.metaData;
        this.model.prototype.idProperty = this.proxy.reader.idProperty;

        if(meta.fields && meta.fields.length){
            var fields = [];
            Ext4.each(meta.fields, function(f){
                this.translateMetadata(f);

                if(this.metadataDefaults){
                    Ext4.Object.merge(f, this.metadataDefaults);
                }

                if(this.metadata){
                    //allow more complex metadata, per field
                    if(this.metadata[f.name]){
                        Ext4.Object.merge(f, this.metadata[f.name]);
                    }
                }

                fields.push(f.name);
            }, this);

            //allow mechanism to add new fields via metadata
            if(this.metadata){
                var field;
                for (var i in this.metadata){
                    field = this.metadata[i];
                    if(field.createIfDoesNotExist && Ext4.Array.indexOf(i)==-1){
                        field.name = field.name || i;
                        field.notFromServer = true;
                        this.translateMetadata(field);
                        if(this.metadataDefaults)
                            Ext4.Object.merge(field, this.metadataDefaults);

                        meta.fields.push(Ext4.apply({}, field));
                    }
                }
            }

            this.fireEvent('beforemetachange', this, meta);
        }
    },

    //private
    //NOTE: the intention of this method is to provide a standard, low-level way to translating Labkey metadata names into ext ones.
    translateMetadata: function(field){
        field.fieldLabel = Ext4.util.Format.htmlEncode(field.label || field.caption || field.header || field.name);
        field.dataIndex = field.dataIndex || field.name;
        field.editable = (field.userEditable!==false && !field.readOnly && !field.autoIncrement);
        field.allowBlank = field.nullable;
        field.jsonType = field.jsonType || LABKEY.ext.Ext4Helper.findJsonType(field);

    },

    //private
    setModel: function(model){
        this.model = model;
        this.implicitModel = false;
    },

    //private
    load: function(){
        this.generateBaseParams();

        this.proxy.on('exception', this.onProxyException, this, {single: true});
        return this.callParent(arguments);
    },

    //private
    sync: function(){
        this.generateBaseParams();

        if(!this.updatable){
            alert('This store is not updatable');
            return;
        }

        if(!this.syncNeeded()){
            this.fireEvent('synccomplete', this);
            return;
        }

        this.proxy.on('exception', this.onProxyException, this, {single: true});
        return this.callParent(arguments);
    },

    //private
    update: function(){
        this.generateBaseParams();

        if(!this.updatable){
            alert('This store is not updatable');
            return;
        }
        return this.callParent(arguments);
    },

    //private
    create: function(){
        this.generateBaseParams();

        if(!this.updatable){
            alert('This store is not updatable');
            return;
        }
        return this.callParent(arguments);
    },

    //private
    destroy: function(){
        this.generateBaseParams();

        if(!this.updatable){
            alert('This store is not updatable');
            return;
        }
        return this.callParent(arguments);
    },

    /**
     * Returns the case-normalized fieldName.  The fact that field names are not normally case-sensitive, but javascript is case-sensitive can cause prolems.  This method is designed to allow you to convert a string into the casing used by the store.
     * @param {String} fieldName The name of the field to test
     * @returns {String} The normalized field name or null if not found
     */
    getCanonicalFieldName: function(fieldName){
        var fields = this.getFields();
        if(fields.get(fieldName)){
            return fieldName;
        }

        var name;

        var properties = ['name', 'fieldKeyPath'];
        Ext4.each(properties, function(prop){
            fields.each(function(field){
                if(field[prop].toLowerCase() == fieldName.toLowerCase()){
                    name = field.name;
                    return false;
                }
            });

            if(name)
                return false;  //abort the loop
        }, this);

        return name;
    },

    //private
    //NOTE: the intent of this is to allow fields to have an initial value defined through a function.  see getInitialValue in LABKEY.ext.Ext4Helper.getDefaultEditorConfig
    onAdd: function(store, records, idx, opts){
        var val;
        this.getFields().each(function(meta){
            if(meta.getInitialValue){
                Ext4.each(records, function(record){
                    val = meta.getInitialValue(record.get(meta.name), record, meta);
                    record.set(meta.name, val);
                }, this);
            }
        }, this);
    },

    //private
    onBeforeLoad: function(operation){
        if(this.sql){
            operation.sql = this.sql;
        }
        this.proxy.containerPath = this.containerPath;
        this.proxy.extraParams = this.generateBaseParams();
    },

    //private
    //NOTE: maybe this should be a plugin to combos??
    onLoad : function(store, records, success) {
        if(!success)
            return;
        //the intent is to let the client set default values for created fields
        var toUpdate = [];
        this.getFields().each(function(f){
            if(f.setValueOnLoad && (f.getInitialValue || f.defaultValue))
                toUpdate.push(f);
        }, this);
        if(toUpdate.length){
            this.each(function(rec){
                Ext4.each(toUpdate, function(meta){
                    if(meta.getInitialValue)
                        rec.set(meta.name, meta.getInitialValue(rec.get(meta.name), rec, meta));
                    else if (meta.defaultValue && !rec.get(meta.name))
                        rec.set(meta.name, meta.defaultValue)
                }, this);
            });
        }
        //this is primarily used for comboboxes
        //create an extra record with a blank id column
        //and the null caption in the display column
        if(this.nullRecord){
            var data = {};
            data[this.model.idProperty] = "";

            //NOTE: unlike LABKEY.ext.Store, this does not default to the string [none].
            // we should rely on Ext tpls to do this since supplying a non-null string
            // defeats the purpose of a null record when the valueColumn is the same as the displayColumn
            data[this.nullRecord.displayColumn] = this.nullRecord.nullCaption || this.nullCaption;

            var record = this.model.create(data);
            this.insert(0, record);
        }
    },

    onProxyWrite: function(operation) {
        var me = this,
            success = operation.wasSuccessful(),
            records = operation.getRecords();

        switch (operation.action) {
            case 'saveRows':
                me.onSaveRows(operation, success);
                break;
            default:
                console.warn('something other than saveRows happened: ' + operation.action)
        }

        if (success) {
            me.fireEvent('write', me, operation);
            me.fireEvent('datachanged', me);
        }
        //this is a callback that would have been passed to the 'create', 'update' or 'destroy' function and is optional
        Ext4.callback(operation.callback, operation.scope || me, [records, operation, success]);

        //NOTE: this was created to give a single event to follow, regardless of success
        this.fireEvent('synccomplete', this, operation, success);
    },

    //private
    processResponse : function(rows){
        var idCol = this.proxy.reader.getIdProperty();
        var row;
        var record;
        var index;
        for(var idx = 0; idx < rows.length; ++idx)
        {
            row = rows[idx];

            if(!row || !row.values)
                return;

            //find the record using the id sent to the server
            record = (this.snapshot || this.data).map[row.oldKeys[idCol]];

            if(!record)
                return;

            //apply values from the result row to the sent record
            for(var col in record.data)
            {
                //since the sent record might contain columns form a related table,
                //ensure that a value was actually returned for that column before trying to set it
                if(undefined !== row.values[col]){
                    var x = record.fields.get(col);
                    record.set(col, record.fields.get(col).convert(row.values[col], row.values));
                }

                //clear any displayValue there might be in the extended info
                if(record.json && record.json[col])
                    delete record.json[col].displayValue;
            }

            //if the id changed, fixup the keys and map of the store's base collection
            //HACK: this is using private data members of the base Store class. Unfortunately
            //Ext Store does not have a public API for updating the key value of a record
            //after it has been added to the store. This might break in future versions of Ext
            if(record.internalId != row.values[idCol])
            {
                record.internalId = row.values[idCol];
                index = this.data.indexOf(record);
                if (index > -1) {
                    this.data.removeAt(index);
                    this.data.insert(index, record);
                }
            }

            //reset transitory flags and commit the record to let
            //bound controls know that it's now clean
            delete record.saveOperationInProgress;

            record.phantom = false;
            record.commit();
        }
    },

    //private
    getJson : function(response) {
        return (response && undefined != response.getResponseHeader && undefined != response.getResponseHeader('Content-Type')
                && response.getResponseHeader('Content-Type').indexOf('application/json') >= 0)
                ? Ext4.JSON.decode(response.responseText)
                : null;
    },

    //private
    onSaveRows: function(operation, success){
        var json = this.getJson(operation.response);
        if(!json || !json.result)
            return;

        for(var commandIdx = 0; commandIdx < json.result.length; ++commandIdx)
        {
            this.processResponse(json.result[commandIdx].rows);
        }
    },

    //private
    onProxyException : function(proxy, response, operation, eOpts) {
        var loadError = {message: response.statusText};
        var json = this.getJson(response);

        if(json){
            if(json && json.exception)
                loadError.message = json.exception;

            response.errors = json;

            this.validateRecords(json);
        }

        this.loadError = loadError;

        //TODO: is this the right behavior?
        if(response && response.status === 0){
            return;
        }

        var message = (json && json.exception) ? json.exception : response.statusText;

        var messageBody;
        switch(operation.action){
            case 'read':
                messageBody = 'Could not load records';
                break;
            case 'saveRows':
                messageBody = 'Could not save records';
                break;
            default:
                messageBody = 'There was an error';
        }

        if(message)
            messageBody += ' due to the following error:' + "<br>" + message;
        else
            messageBody += ' due to an unexpected error';

        if(false !== this.fireEvent("exception", this, messageBody, response, operation)){

            if(!this.supressErrorAlert)
                Ext4.Msg.alert("Error", messageBody);

            console.warn(response);
        }
    },

    validateRecords: function(errors){
        Ext4.each(errors.errors, function(error){
            //the error object for 1 row:
            if(Ext4.isDefined(error.rowNumber)){
                var record = this.getAt(error.rowNumber);
                record.serverErrors = {};

                Ext4.each(error.errors, function(e){
                    if(!record.serverErrors[e.field])
                        record.serverErrors[e.field] = [];

                    if(record.serverErrors[e.field].indexOf(e.message) == -1)
                        record.serverErrors[e.field].push(e.message);
                }, this);
            }
        }, this);
    },

    //private
    // NOTE: these values are returned by the store in the 9.1 API format
    // They provide the display value and information used in Missing value indicators
    // They are used by the Ext grid when rendering or creating a tooltip.  They are deleted here prsumably b/c if the value
    // is changed then we cannot count on them being accurate
    onUpdate : function(store, record, operation) {
        for(var field  in record.getChanges()){
            if(record.raw && record.raw[field]){
                delete record.raw[field].displayValue;
                delete record.raw[field].mvValue;
            }
        }
    },

    syncNeeded: function(){
        return this.getNewRecords().length > 0 ||
            this.getUpdatedRecords().length > 0 ||
            this.getRemovedRecords().length > 0
    },

    /**
     * Using the store's metadata, this method returns an Ext config object suitable for creating an Ext field.
     * The resulting object is configured to be used in a form, as opposed to a grid.
     * This is a convenience wrapper around LABKEY.ext.Ext4Helper.getFormEditorConfig
     * <p>
     * For information on using metadata, see LABKEY.ext.Ext4Helper
     *
     * @name getFormEditorConfig
     * @function
     * @param (string) fieldName The name of the field
     * @param (object) config Optional. This object will be recursively applied to the default config object
     * @returns {object} An Ext config object suitable to create a field component
     * @memberOf LABKEY.ext4.Store#
     *
     */
    getFormEditorConfig: function(fieldName, config){
        var meta = this.findFieldMetadata(fieldName);
        return LABKEY.ext.Ext4Helper.getFormEditorConfig(meta, config);
    },

    /**
     * Using the store's metadata, this method returns an Ext config object suitable for creating an Ext field.
     * The resulting object is configured to be used in a grid, as opposed to a form.
     * This is a convenience wrapper around LABKEY.ext.Ext4Helper.getGridEditorConfig
     * <p>
     * For information on using metadata, see LABKEY.ext.Ext4Helper
     *
     * @name getGridEditorConfig
     * @function
     * @param (string) fieldName The name of the field
     * @param (object) config Optional. This object will be recursively applied to the default config object
     * @returns {object} An Ext config object suitable to create a field component
     * @memberOf LABKEY.ext4.Storee#
     *
     */
    getGridEditorConfig: function(fieldName, config){
        var meta = this.findFieldMetadata(fieldName);
        return LABKEY.ext.Ext4Helper.getGridEditorConfig(meta, config);
    },

    /**
     * Returns an Ext.util.MixedCollection containing the fields associated with this store
     *
     * @name getFields
     * @function
     * @returns {Ext.util.MixedCollection} The fields associated with this store
     * @memberOf LABKEY.ext4.Store#
     *
     */
    getFields: function(){
        return this.proxy.reader.model.prototype.fields;
    },

    /**
     * Returns an array of the raw column objects returned from the server along with the query metadata
     *
     * @name getColumns
     * @function
     * @returns {array} The columns associated with this store
     * @memberOf LABKEY.ext4.Store#
     *
     */
    getColumns: function(){
        return this.proxy.reader.rawData.columnModel;
    },

    /**
     * Returns a field metadata object fo the specified field
     *
     * @name findFieldMetadata
     * @function
     * @param (string) fieldName The name of the field
     * @returns {object} Metatdata for this field
     * @memberOf LABKEY.ext4.Store#
     *
     */
    findFieldMetadata : function(fieldName){
        var fields = this.getFields();
        if(!fields)
            return null;

        return fields.get(fieldName);
    },

    exportData : function(format) {
        if (this.sql)
        {
            LABKEY.Query.exportSql(this.getExportConfig(format));
        }

        var config = this.getExportConfig(format);
        var params = config.params;

        // These are filters that are custom created (aka not from a defined view).
        LABKEY.Filter.appendFilterParams(params, this.filterArray);

        window.location = LABKEY.ActionURL.buildURL("query", config.action, this.containerPath, params);
    },

    getExportConfig : function(format) {
        format = format || 'excel';
        if (this.sql) {
            return {
                schemaName: this.schemaName,
                sql: this.sql,
                format: format,
                containerPath: this.containerPath,
                containerFilter: this.containerFilter
            };
        }

        var params = {
            schemaName: this.schemaName,
            "query.queryName": this.queryName,
            "query.containerFilterName": this.containerFilter
        };

        if (this.columns) {
            params['query.columns'] = Ext4.isArray(this.columns) ? this.columns.join(",") : this.columns;
        }

        if (this.sortInfo) {
            params['query.sort'] = "DESC" == this.sortInfo.direction ? "-" + this.sortInfo.field : this.sortInfo.field;
        }

        return {
            action : ("tsv" == format) ? "exportRowsTsv" : "exportRowsExcel",
            params : params
        };
    },

    //Ext3 compatability??
    commitChanges: function(){
        this.sync();
    },

    //private
    getKeyField: function(){
        return this.model.prototype.idProperty;
    },

    //private, experimental
    getQueryConfig: function(){
        return {
            containerPath: this.containerPath,
            schemaName: this.schemaName,
            queryName: this.queryName,
            viewName: this.viewName,
            sql: this.sql,
            columns: this.columns,
            filterArray: this.filterArray,
            sort: this.initialConfig.sort,
            maxRows: this.maxRows,
            containerFilter: this.containerFilter,
        }
    }

});


Ext4.define('Connector.reader.ExtendedJsonReader', {
    extend: 'Ext.data.reader.Json',
    alias: 'reader.CDSExtendedJsonReader',
    config: {
        userFilters: null,
        useSimpleAccessors: true
    },
    mixins: {
        observable: 'Ext.util.Observable'
    },
    constructor: function(){
        this.callParent(arguments);
        this.addEvents('dataload');
    },
    readRecords: function(data) {
        if(data.metaData){
            this.idProperty = data.metaData.id; //NOTE: normalize which field holds the PK.
            this.model.prototype.idProperty = this.idProperty;
            this.totalProperty = data.metaData.totalProperty; //NOTE: normalize which field holds total rows.
            this.model.prototype.totalProperty = this.totalProperty;

            //NOTE: it would be interesting to convert this JSON into a more functional object here
            //for example, columns w/ lookups could actually reference their target
            //we could add methods like getDisplayString(), which accept the ext record and return the appropriate display string
            Ext4.each(data.metaData.fields, function(meta){
                if(meta.jsonType == 'int' || meta.jsonType=='float' || meta.jsonType=='boolean')
                    meta.useNull = true;  //prevents Ext from assigning 0's to field when record created

                //convert string into function
                if(meta.extFormatFn){
                    try {
                        meta.extFormatFn = eval(meta.extFormatFn);
                    }
                    catch (ex)
                    {
                        //this is potentially the sort of thing we'd want to log to mothership??
                    }

                }
            });

            this.fireEvent('dataload', data); //NOTE: provide an event the store can consume in order to modify the server-supplied metadata
        }

        return this.callParent([data]);
    },

    onMetaChange : function(meta) {
        var fields = meta.fields,
            newModel;

        Ext4.apply(this, meta);

        //NOTE: In Ext4.1 the store restores the metachange event, so we can probably simplify this
        if (fields) {
            newModel = Ext4.define("Ext.data.reader.Json-Model" + Ext4.id(), {
                extend: 'Ext.data.Model',
                idProperty: this.model.prototype.idProperty,
                fields: fields,
                defaultProxyType:'CDSProxy'
            });
            this.setModel(newModel, true);
        } else {
            this.buildExtractors(true);
        }
    },

    //NOTE: because our 9.1 API format returns results as objects, we transform them here
    buildFieldExtractors: function() {
        //now build the extractors for all the fields
        var me = this,
            fields = me.getFields(),
            ln = fields.length,
            i  = 0,
            extractorFunctions = [],
            field, map;

        for (; i < ln; i++) {
            field = fields[i];
            map   = field.fieldKey || field.name;
            if(!field.notFromServer)
                extractorFunctions.push(me.createAccessor('["'+map+'"].value'));  //NOTE: modified to support 9.1 API format and to support lookups, ie. field1/field2.
            else
                extractorFunctions.push(me.createAccessor(map));  //if this field doesnt exist on the server, it wont have a value
        }
        me.fieldCount = ln;

        me.extractorFunctions = extractorFunctions;
    },
    /*
    NOTE: see above comment on 9.1 API.  In addition to extracting the values, Ext creates an accessor for the record's ID
    this must also be modified to support the 9.1 API.  Because I believe getId() can be called both on initial load (prior to
    when we transform the data) and after, I modified the method to test whether the field's value is an object instead of
    looking for '.value' exclusively.
     */
    buildExtractors: function(force) {
        this.callParent(arguments);

        var idProp = this.getIdProperty();
        var me = this;
        if (idProp) {
            var accessor = me.createAccessor(idProp);

            me.getId = function(record) {
                var id = accessor.call(me, record);
                return (id === undefined || id === '') ? null
                : (id && Ext4.isObject(id)) ? id.value  //NOTE: added line to support 9.1 API
                : id;
            };
        } else {
            me.getId = function() {
                return null;
            };
        }
    }
});


Ext4.define('Connector.proxy.AjaxProxy', {
    extend: 'Ext.data.proxy.Ajax',
    alias: 'proxy.CDSProxy',
    constructor: function(config){
        config = config || {};

        Ext4.apply(config, {
            api: {
                create: "saveRows.view",
                read: "selectRows.api",
                update: "saveRows.view",
                destroy: "saveRows.view",
                //NOTE: added in order to batch create/update/destroy into 1 request
                saveRows: "saveRows.view"
            },
            actionMethods: {
                create: "POST",
                read: "POST",
                update: "POST",
                destroy: "POST",
                saveRows: "POST"
            }
        });
        this.addEvents('exception');
        this.callParent(arguments);
    },
    saveRows: function(operation, callback, scope){
        var request = operation.request;
        Ext4.apply(request, {
            timeout       : this.timeout,
            scope         : this,
            callback      : this.createRequestCallback(request, operation, callback, scope),
            method        : this.getMethod(request),
            disableCaching: false // explicitly set it to false, ServerProxy handles caching
        });

        Ext4.Ajax.request(request);

        return request;
    },
    reader: 'CDSExtendedJsonReader',
    writer: {
        type: 'json',
        write: function(request){
            return request;
        }
    },
    headers: {
        'Content-Type' : 'application/json'
    },

    //NOTE: these are overriden so we can batch insert/update/deletes into a single request, rather than submitting 3 sequential ones
    batch: function(operations, listeners) {
        var batch = this.buildBatch(operations, listeners);

        batch.start();
        return batch;
    },
    buildBatch: function(operations, listeners){
        var me = this,
            batch = Ext4.create('Ext.data.Batch', {
                proxy: me,
                listeners: listeners || {}
            }),
            useBatch = me.batchActions,
            records;

        var commands = [];
        Ext4.each(me.batchOrder.split(','), function(action) {
            records = operations[action];
            if (records) {
                var operation = Ext4.create('Ext.data.Operation', {
                    action: action,
                    records: records
                });

                if(action == 'read'){
                    batch.add(operation);
                }
                else {
                    commands.push(this.buildCommand(operation));
                }
            }
        }, me);
        if(commands.length){
            var request = Ext4.create('Ext.data.Request', {
                action: 'saveRows',
                url: LABKEY.ActionURL.buildURL("query", 'saveRows', this.extraParams.containerPath),
                jsonData: Ext4.apply(this.extraParams, {
                    commands: commands
                })
            });

            var b = Ext4.create('Ext.data.Operation', {
                action: 'saveRows',
                request: request
            });
            batch.add(b);
        }

        return batch;
    },
    buildRequest: function(operation) {
        if(this.extraParams.sql){
            this.api.read = "executeSql.api";
        }
        else {
            this.api.read = "selectRows.api";
        }

        var request = this.callParent(arguments);
        request.jsonData = request.jsonData || {};
        Ext4.apply(request.jsonData, request.params);
        if (request.method == 'POST' || request.url.indexOf('selectRows') > -1 || request.url.indexOf('saveRows') > -1) {
            delete request.params;  //would be applied to the URL
        }

        //morph request into the commands expected by saverows:
        request.jsonData.commands = request.jsonData.commands || [];

        var command = this.buildCommand(operation);
        if(command && command.rows.length){
            request.jsonData.commands.push(command);
        }

        return request;
    },
    buildCommand: function(operation){
        if(operation.action!='read'){
            var command = {
                schemaName: this.extraParams.schemaName,
                queryName: this.extraParams['query.queryName'],
                rows: [],
                extraContext: {
                    storeId: this.storeId,
                    queryName: this.extraParams['query.queryName'],
                    schemaName: this.extraParams.schemaName,
                    keyField: this.reader.getIdProperty()
                }
            };

            if(operation.action=='create')
                command.command = "insertWithKeys";
            else if (operation.action=='update')
                command.command = "updateChangingKeys";
            else if (operation.action=='destroy')
                command.command = "delete";

            Ext4.each(operation.records, function(record){
                var oldKeys = {};
                oldKeys[this.reader.getIdProperty()] = record.internalId;

                if(command.command == 'delete'){
                    command.rows.push(this.getRowData(record));
                }
                else {
                    command.rows.push({
                        values: this.getRowData(record),
                        oldKeys : oldKeys
                    });
                }
            }, this);

            return command;
        }
    },
    buildUrl: function(request) {
        var url = this.callParent(arguments);
        return LABKEY.ActionURL.buildURL("query", url, request.params.containerPath);
    },
    getRowData : function(record) {
        //convert empty strings to null before posting
        var data = {};
        Ext4.apply(data, record.data);
        for(var field in data)
        {
            if(Ext4.isEmpty(data[field]))
                data[field] = null;
        }
        return data;
    },

    getParams: function(operation){
        var params = this.callParent(arguments);
        if(params.filter && params.filter.length){
            var val;
            Ext4.each(params.filter, function(f){
                val = f.split('=');
                params[val[0]] = val[1];
            }, this);
            delete params.filter;
        }
        return params;
    },

    sortParam: 'query.sort',
    encodeSorters: function(sorters){
         var length   = sorters.length,
             sortStrs = [],
             sorter, i;

         for (i = 0; i < length; i++) {
             sorter = sorters[i];

             sortStrs[i] = (sorter.direction=='DESC' ? '-' : '') + sorter.property
         }

         return sortStrs.join(",");
    },

    encodeFilters: function(filters){
        var result = [];
        if(filters && filters.length){
            Ext4.each(filters, function(filter){
                if(filter.filterType)
                    result.push(Ext4.htmlEncode('query.' + filter.property + '~' + filter.filterType.getURLSuffix()) + '=' + Ext4.htmlEncode(filter.value));
            }, this);
        }
        return result;
    }
});


Ext4.namespace('LABKEY.ext');

LABKEY.ext.Ext4Helper = new function(){
    return {
        /**
         * Constructs an ext field component based on the supplied metadata.  Same as getFormEditorConfig, but actually constructs the editor.
         * The resulting editor is tailored for usage in a form, as opposed to a grid. Unlike getGridEditorConfig or getEditorConfig, if the metadata
         * contains a formEditorConfig property, this config object will be applied to the resulting field.  See getDefaultEditorConfig for config options.
         *
         * @name getFormEditor
         * @function
         * @returns {object} Returns an Ext field component
         * @memberOf LABKEY.ext.Ext4Helper#
         *
         */
        getFormEditor: function(meta, config){
            var editorConfig = LABKEY.ext.Ext4Helper.getFormEditorConfig(meta, config);
            return Ext4.ComponentMgr.create(editorConfig);
        },

        /**
         * Constructs an ext field component based on the supplied metadata.  Same as getFormEditorConfig, but actually constructs the editor.
         * The resulting editor is tailored for usage in a grid, as opposed to a form. Unlike getFormEditorConfig or getEditorConfig, if the metadata
         * contains a gridEditorConfig property, this config object will be applied to the resulting field.  See getDefaultEditorConfig for config options.
         *
         * @name getGridEditor
         * @function
         * @returns {object} Returns an Ext field component
         * @memberOf LABKEY.ext.Ext4Helper#
         *
         */
        getGridEditor: function(meta, config){
            var editorConfig = LABKEY.ext.Ext4Helper.getGridEditorConfig(meta, config);
            return Ext4.ComponentMgr.create(editorConfig);
        },

        /**
         * Return an Ext config object to create an Ext field based on the supplied metadata.
         * The resulting config object is tailored for usage in a grid, as opposed to a form. Unlike getFormEditorConfig or getEditorConfig, if the metadata
         * contains a gridEditorConfig property, this config object will be applied to the resulting field.  See getDefaultEditorConfig for config options.
         *
         * @name getGridEditorConfig
         * @function
         * @returns {object} Returns an Ext config object
         * @memberOf LABKEY.ext.Ext4Helper#
         *
         */
        getGridEditorConfig: function(meta, config){
            //this produces a generic editor
            var editor = LABKEY.ext.Ext4Helper.getDefaultEditorConfig(meta);

            //for multiline fields:
            if(editor.editable && meta.inputType == 'textarea'){
                editor = new LABKEY.ext.LongTextField({
                    columnName: editor.dataIndex
                });
            }

            //now we allow overrides of default behavior, in order of precedence
            if(meta.editorConfig)
                Ext4.Object.merge(editor, meta.editorConfig);

            //note: this will screw up cell editors
            delete editor.fieldLabel;

            if(meta.gridEditorConfig)
                Ext4.Object.merge(editor, meta.gridEditorConfig);
            if(config)
                Ext4.Object.merge(editor, config);

            return editor;
        },

        /**
         * Return an Ext config object to create an Ext field based on the supplied metadata.
         * The resulting config object is tailored for usage in a form, as opposed to a grid. Unlike getGridEditorConfig or getEditorConfig, if the metadata
         * contains a gridEditorConfig property, this config object will be applied to the resulting field.  See getDefaultEditorConfig for config options.
         *
         * @name getFormEditorConfig
         * @function
         * @returns {object} Returns an Ext config object
         * @memberOf LABKEY.ext.Ext4Helper#
         *
         */
        getFormEditorConfig: function(meta, config){
            var editor = LABKEY.ext.Ext4Helper.getDefaultEditorConfig(meta);

            //now we allow overrides of default behavior, in order of precedence
            if(meta.editorConfig)
                Ext4.Object.merge(editor, meta.editorConfig);
            if(meta.formEditorConfig)
                Ext4.Object.merge(editor, meta.formEditorConfig);
            if(config)
                Ext4.Object.merge(editor, config);

            return editor;
        },

        //this is designed to be called through either .getFormEditorConfig or .getGridEditorConfig
        /**
         * Uses the given meta-data to generate a field config object.
         *
         * This function accepts a mish-mash of config parameters to be easily adapted to
         * various different metadata formats.
         *
         * Note: you can provide any Ext config options using the editorConfig, formEditorConfig or gridEditorConfig objects
         * These config options can also be used to pass arbitrary config options used by your specific Ext component
         *
         * @param {string} [config.type] e.g. 'string','int','boolean','float', or 'date'. for consistency this will be translated into the property jsonType
         * @param {object} [config.editable]
         * @param {object} [config.required]
         * @param {string} [config.label] used to generate fieldLabel
         * @param {string} [config.name] used to generate fieldLabel (if header is null)
         * @param {string} [config.caption] used to generate fieldLabel (if label is null)
         * @param {integer} [config.cols] if input is a textarea, sets the width (style:width is better)
         * @param {integer} [config.rows] if input is a textarea, sets the height (style:height is better)
         * @param {string} [config.lookup.schemaName] the schema used for the lookup.  schemaName also supported
         * @param {string} [config.lookup.queryName] the query used for the lookup.  queryName also supported
         * @param {Array} [config.lookup.columns] The columns used by the lookup store.  If not set, the <code>[keyColumn, displayColumn]</code> will be used.
         * @param {string} [config.lookup.keyColumn]
         * @param {string} [config.lookup.displayColumn]
         * @param {string} [config.lookup.sort] The sort used by the lookup store.
         * @param {boolean} [config.lookups] use lookups=false to prevent creating default combobox for lookup columns
         * @param {object}  [config.editorConfig] is a standard Ext config object (although it can contain any properties) that will be merged with the computed field config
         *      e.g. editorConfig:{width:120, tpl:new Ext.Template(...), arbitraryOtherProperty: 'this will be applied to the editor'}
         *      this will be merged will all form or grid editors
         * @param {object}  [config.formEditorConfig] Similar to editorConfig; however, it will only be merged when getFormEditor() or getFormEditorConfig() are called.
         *      The intention is to provide a mechanism so the same metadata object can be used to generate editors in both a form or a grid (or other contexts).
         * @param {object}  [config.gridEditorConfig] similar to formEditorConfig; however, it will only be merged when getGridEditor() or getGridEditorConfig() are called.
         * @param {object}  [config.columnConfig] similar to formEditorConfig; however, it will only be merged when getColumnConfig() is getColumnsConfig() called.
         * @param {object} [config.lookup.store] advanced! Pass in your own custom store for a lookup field
         * @param {boolean} [config.lazyCreateStore] If false, the store will be created immediately.  If true, the store will be created when the component is created. (default true)
         * @param {boolean} [config.createIfDoesNotExist] If true, this field will be created in the store, even if it does not otherwise exist on the server. Can be used to force custom fields to appear in a grid or form or to pass additional information to the server at time of import
         * @param {function} [config.buildQtip] This function will be used to generate the qTip for the field when it appears in a grid instead of the default function.  It will be passed a single object as an argument.  This object has the following properties: qtip, data, cellMetaData, meta, record, store. Qtip is an array which will be merged to form the contents of the tooltip.  Your code should modify the array to alter the tooltip.  For example:
         * buildQtip: function(config){
         *      qtip.push('I have a tooltip!');
         *      qtip.push('This is my value: ' + config.value);
         * }
         * @param {function} [config.buildDisplayString] This function will be used to generate the display string for the field when it appears in a grid instead of the default function.  It will be passed the same argument as buildQtip()
         * @param {function} [config.buildUrl] This function will be used to generate the URL encapsulating the field
         * @param {string} [config.urlTarget] If the value is rendered in a LABKEY.ext4.EditorGridPanel (or any other component using this pathway), and it contains a URL, this will be used as the target of <a> tag.  For example, use _blank for a new window.
         * @param (boolean) [config.setValueOnLoad] If true, the store will attempt to set a value for this field on load.  This is determined by the defaultValue or getInitialValue function, if either is defined
         * @param {function} [config.getInitialValue] When a new record is added to this store, this function will be called on that field.  If setValueOnLoad is true, this will also occur on load.  It will be passed the record and metadata.  The advantage of using a function over defaultValue is that more complex and dynamic initial values can be created.  For example:
         *  //sets the value to the current date
         *  getInitialValue(val, rec, meta){
         *      return val || new Date()
         *  }
         * @param {boolean} [config.wordWrap] If true, when displayed in an Ext grid the contents of the cell will use word wrapping, as opposed to being forced to a single line
         *
         * Note: the follow Ext params are automatically defined based on the specified Labkey metadata property:
         * dataIndex -> name
         * editable -> userEditable && readOnly
         * header -> caption
         * xtype -> set within getDefaultEditorConfig() based on jsonType, unless otherwise provided

         *
         */
        getDefaultEditorConfig: function(meta){
            var field =
            {
                //added 'caption' for assay support
                fieldLabel: Ext4.util.Format.htmlEncode(meta.label || meta.caption || meta.caption || meta.header || meta.name),
                originalConfig: meta,
                //we assume the store's translateMeta() will handle this
                allowBlank: meta.allowBlank!==false,
                //disabled: meta.editable===false,
                name: meta.name,
                dataIndex: meta.dataIndex || meta.name,
                value: meta.value || meta.defaultValue,
                width: meta.width,
                height: meta.height,
                msgTarget: 'qtip',
                validateOnChange: true
            };

            var helpPopup = meta.helpPopup || [
                'Type: ' + (meta.friendlyType ? meta.friendlyType : ''),
                'Required: ' + !meta.allowBlank,
                'Description: ' + (meta.description || '')
            ];
            if(Ext4.isArray(helpPopup))
                helpPopup = helpPopup.join('<br>');
            field.helpPopup = helpPopup;

            if (meta.hidden)
            {
                field.xtype = 'hidden';
            }
            else if (meta.editable === false)
            {
                field.xtype = 'displayfield';
            }
            else if (meta.lookup && meta.lookup['public'] !== false && meta.lookups !== false)
            {
                var l = meta.lookup;

                //test whether the store has been created.  create if necessary
                if (Ext4.isObject(meta.store) && meta.store.events)
                    field.store = meta.store;
                else
    //                field.store = LABKEY.ext.Ext4Helper.getLookupStoreConfig(meta);
                    field.store = LABKEY.ext.Ext4Helper.getLookupStore(meta);

    //            if (field.store && meta.lazyCreateStore === false){
    //                field.store = LABKEY.ext.Ext4Helper.getLookupStore(field);
    //            }

                Ext4.apply(field, {
                    //this purpose of this is to allow other editors like multiselect, checkboxGroup, etc.
                    xtype: (meta.xtype || 'labkey-combo'),
                    forceSelection: true,
                    typeAhead: true,
                    queryMode: 'local',
                    displayField: l.displayColumn,
                    valueField: l.keyColumn,
                    //NOTE: supported for non-combo components
                    initialValue: field.value,
                    showValueInList: meta.showValueInList,
    //                listClass: 'labkey-grid-editor',
                    lookupNullCaption: meta.lookupNullCaption
                });
            }
            else
            {
                switch (meta.jsonType)
                {
                    case "boolean":
                        field.xtype = meta.xtype || 'checkbox';
                        break;
                    case "int":
                        field.xtype = meta.xtype || 'numberfield';
                        field.allowDecimals = false;
                        break;
                    case "float":
                        field.xtype = meta.xtype || 'numberfield';
                        field.allowDecimals = true;
                        break;
                    case "date":
                        field.xtype = meta.xtype || 'datefield';
                        field.format = meta.extFormat || Date.patterns.ISO8601Long;
                        field.altFormats = LABKEY.Utils.getDateAltFormats();
                        break;
                    case "string":
                        if (meta.inputType=='textarea')
                        {
                            field.xtype = meta.xtype || 'textarea';
                            field.width = meta.width;
                            field.height = meta.height;
                            if (!this._textMeasure)
                            {
                                this._textMeasure = {};
                                var ta = Ext4.DomHelper.append(document.body,{tag:'textarea', rows:10, cols:80, id:'_hiddenTextArea', style:{display:'none'}});
                                this._textMeasure.height = Math.ceil(Ext4.util.TextMetrics.measure(ta,"GgYyJjZ==").height * 1.2);
                                this._textMeasure.width  = Math.ceil(Ext4.util.TextMetrics.measure(ta,"ABCXYZ").width / 6.0);
                            }
                            if (meta.rows && !meta.height)
                            {
                                if (meta.rows == 1)
                                    field.height = undefined;
                                else
                                {
                                    // estimate at best!
                                    var textHeight =  this._textMeasure.height * meta.rows;
                                    if (textHeight)
                                        field.height = textHeight;
                                }
                            }
                            if (meta.cols && !meta.width)
                            {
                                var textWidth = this._textMeasure.width * meta.cols;
                                if (textWidth)
                                    field.width = textWidth;
                            }

                        }
                        else
                            field.xtype = meta.xtype || 'textfield';
                        break;
                    default:
                        field.xtype = meta.xtype || 'textfield';
                }
            }

            return field;
        },

        // private
        getLookupStore : function(storeId, c)
        {
            if (typeof(storeId) != 'string')
            {
                c = storeId;
                storeId = LABKEY.ext.Ext4Helper.getLookupStoreId(c);
            }

            // Check if store has already been created.
            if (Ext4.isObject(c.store) && c.store.events)
                return c.store;

            var store = Ext4.StoreMgr.lookup(storeId);
            if (!store)
            {
                var config = c.store || LABKEY.ext.Ext4Helper.getLookupStoreConfig(c);
                config.storeId = storeId;
                store = Ext4.create('Connector.store.CDSStore', config);
            }
            return store;
        },

        // private
        getLookupStoreId : function (c)
        {
            if (c.store && c.store.storeId)
                return c.store.storeId;

            if (c.lookup)
                return [c.lookup.schemaName || c.lookup.schema , c.lookup.queryName || c.lookup.table, c.lookup.keyColumn, c.lookup.displayColumn].join('||');

            return c.name;
        },

        //private
        getLookupStoreConfig : function(c)
        {
            var l = c.lookup;

            // normalize lookup
            l.queryName = l.queryName || l.table;
            l.schemaName = l.schemaName || l.schema;

            if (l.schemaName == 'core' && l.queryName =='UsersData')
                l.queryName = 'Users';

            var config = {
                xtype: "labkey-store",
                storeId: LABKEY.ext.Ext4Helper.getLookupStoreId(c),
                containerFilter: 'CurrentOrParentAndWorkbooks',
                schemaName: l.schemaName,
                queryName: l.queryName,
                containerPath: l.container || l.containerPath || LABKEY.container.path,
                autoLoad: true
            };

            if (l.viewName)
                config.viewName = l.viewName;

            if (l.filterArray)
                config.filterArray = l.filterArray;

            if (l.columns)
                config.columns = l.columns;
            else
            {
                var columns = [];
                if (l.keyColumn)
                    columns.push(l.keyColumn);
                if (l.displayColumn && l.displayColumn != l.keyColumn)
                    columns.push(l.displayColumn);
                if (columns.length == 0){
                    columns = ['*'];
                }
                config.columns = columns;
            }

            if (l.sort)
                config.sort = l.sort;
            else if (l.sort !== false)
                config.sort = l.displayColumn;

            if (!c.required && c.includeNullRecord !== false)
            {
                config.nullRecord = c.nullRecord || {
                    displayColumn: l.displayColumn,
                    nullCaption: (l.displayColumn==l.keyColumn ? null : (c.lookupNullCaption!==undefined ? c.lookupNullCaption : '[none]'))
                };
            }

            return config;
        },

        //private
        getColumnsConfig: function(store, grid, config){
            config = config || {};

            var fields = store.getFields();
            var columns = store.getColumns();
            var cols = new Array();

            var col;
            fields.each(function(field, idx){
                var col;

                if(field.shownInGrid === false)
                    return;

                Ext4.each(columns, function(c){
                    if(c.dataIndex == field.dataIndex){
                        col = c;
                        return false;
                    }
                }, this);

                if(!col)
                    col = {dataIndex: field.dataIndex};

                cols.push(LABKEY.ext.Ext4Helper.getColumnConfig(store, col, config, grid));

            }, this);

            return cols;
        },

        //private
        getColumnConfig: function(store, col, config, grid){
            col = col || {};

            var meta = store.findFieldMetadata(col.dataIndex);
            col.customized = true;

            col.hidden = meta.hidden;
            col.format = meta.extFormat;


            //this.updatable can override col.editable
            col.editable = config.editable && col.editable && meta.userEditable;

    //        //will use custom renderer
    //        if(meta.lookup && meta.lookups!==false)
    //            delete col.xtype;

            if(col.editable && !col.editor)
                col.editor = LABKEY.ext.Ext4Helper.getGridEditorConfig(meta);

            col.renderer = LABKEY.ext.Ext4Helper.getDefaultRenderer(col, meta, grid);

            //HTML-encode the column header
            col.text = Ext4.util.Format.htmlEncode(meta.label || meta.name || col.header);

            if(meta.ignoreColWidths)
                delete col.width;

           //allow override of defaults
            if(meta.columnConfig)
                Ext4.Object.merge(col, meta.columnConfig);
            if(config && config[col.dataIndex])
                Ext4.Object.merge(col, config[col.dataIndex]);

            return col;

        },

        //private
        getDefaultRenderer : function(col, meta, grid) {
            return function(value, cellMetaData, record, rowIndex, colIndex, store)
            {
                var displayValue = value;
                var cellStyles = [];

                if(null === value || undefined === value || value.toString().length == 0)
                    return value;

                //format value into a string
                displayValue = LABKEY.ext.Ext4Helper.getDisplayString(value, meta, record, store);

                if(meta.buildDisplayString){
                    displayValue = meta.buildDisplayString({
                        displayValue: displayValue,
                        value: value,
                        col: col,
                        meta: meta,
                        cellMetaData: cellMetaData,
                        record: record,
                        store: store
                    });
                }

                displayValue = Ext4.util.Format.htmlEncode(displayValue);

                //if meta.file is true, add an <img> for the file icon
                if(meta.file){
                    displayValue = "<img src=\"" + LABKEY.Utils.getFileIconUrl(value) + "\" alt=\"icon\" title=\"Click to download file\"/>&nbsp;" + displayValue;
                    //since the icons are 16x16, cut the default padding down to just 1px
                    cellStyles.push('padding: 1px 1px 1px 1px');
                }

                //build the URL
                if(col.showLink !== false){
                    var url = LABKEY.ext.Ext4Helper.getColumnUrl(displayValue, value, col, meta, record);
                    if(url){
                        displayValue = "<a " + (meta.urlTarget ? "target=\""+meta.urlTarget+"\"" : "") + " href=\"" + url + "\">" + displayValue + "</a>";
                    }
                }

    //            //TODO: consider supporting other attributes like style, class, align, etc.
    //            //possibly allow a cellStyles object?
    //            Ext4.each(['style', 'className', 'align', 'rowspan', 'width'], function(attr){
    //
    //            }, this);

                if(meta.wordWrap){
                    cellStyles.push('white-space:normal !important');
                }

                if(record && record.errors && record.errors.length)
                    cellMetaData.css += ' x-grid3-cell-invalid';

                if(cellStyles.length){
                    cellMetaData.tdAttr = cellMetaData.tdAttr || '';
                    cellMetaData.tdAttr += ' style="'+(cellStyles.join(';'))+'"';
                }

                LABKEY.ext.Ext4Helper.buildQtip({
                    displayValue: displayValue,
                    value: value,
                    meta: meta,
                    col: col,
                    record: record,
                    store: store,
                    cellMetaData: cellMetaData
                });

                return displayValue;
            };
        },

        //private
        getDisplayString: function(value, meta, record, store){
            var displayType = Ext4.isObject(meta.type) ? meta.type.type : meta.type;
            var displayValue = value;
            var shouldCache;

            //NOTE: the labkey 9.1 API returns both the value of the field and the display value
            //the server is already doing the work, so we should rely on this
            //this does have a few problems:
            //if the displayValue equals the value, the API omits displayValue.  because we cant
            // count on the server returning the right value unless explicitly providing a displayValue,
            // we only attempt to use that
            if(record && record.raw && record.raw[meta.name]){
                if(Ext4.isDefined(record.raw[meta.name].displayValue))
                    return record.raw[meta.name].displayValue;
                //TODO: this needs testing before enabling.  would be nice if we could rely on this, but i dont think we will be able to (dates, for example)
                //perhaps only try this for lookups?
                //else if(Ext4.isDefined(record.raw[meta.name].value))
                //    return record.raw[meta.name].value;
            }

            //NOTE: this is substantially changed over LABKEY.ext.FormHelper
            if(meta.lookup && meta.lookup['public'] !== false && meta.lookups!==false){
                displayValue = LABKEY.ext.Ext4Helper.getLookupDisplayValue(meta, displayValue, record, store);
                meta.usingLookup = true;
                shouldCache = false;
                displayType = 'string';
            }

            if(meta.extFormatFn && Ext4.isFunction(meta.extFormatFn)){
                displayValue = meta.extFormatFn(displayValue);
            }
            else {
                if(!Ext4.isDefined(displayValue))
                    displayValue = '';

                switch (displayType){
                    case "date":
                        var date = new Date(displayValue);
                        //NOTE: java formats differ from ext
                        var format = meta.extFormat;
                        if(!format){
                            if (date.getHours() == 0 && date.getMinutes() == 0 && date.getSeconds() == 0)
                                format = "Y-m-d";
                            else
                                format = "Y-m-d H:i:s";
                        }
                        displayValue = date.format(format);
                        break;
                    case "int":
                        displayValue = (Ext4.util.Format.numberRenderer(this.format || '0'))(displayValue);
                        break;
                    case "boolean":
                        var t = this.trueText || 'true', f = this.falseText || 'false', u = this.undefinedText || ' ';
                        if(displayValue === undefined){
                            displayValue = u;
                        }
                        else if(!displayValue || displayValue === 'false'){
                            displayValue = f;
                        }
                        else {
                            displayValue = t;
                        }
                        break;
                    case "float":
                        displayValue = (Ext4.util.Format.numberRenderer(this.format || '0,000.00'))(displayValue);
                        break;
                    case "string":
                    default:
                        displayValue = (null == displayValue ? "" : displayValue.toString());
                }
            }

            //experimental.  cache the calculated value, so we dont need to recalculate each time.  this should get cleared by the store on update like any server-generated value
            if(shouldCache !== false){
                record.raw = record.raw || {};
                if(!record.raw[meta.name])
                    record.raw[meta.name] = {};
                record.raw[meta.name].displayValue = displayValue;
            }

            return displayValue;
        },

        //private
        getColumnUrl: function(displayValue, value, col, meta, record){
            //wrap in <a> if url is present in the record's original JSON
            var url;
            if(meta.buildUrl)
                url = meta.buildUrl({
                    displayValue: displayValue,
                    value: value,
                    col: col,
                    meta: meta,
                    record: record
                });
            else if(record.raw && record.raw[meta.name] && record.raw[meta.name].url)
                url = record.raw[meta.name].url;
            return Ext4.util.Format.htmlEncode(url);
        },

        //private
        buildQtip: function(config){
            var qtip = [];
            //NOTE: returned in the 9.1 API format
            if(config.record && config.record.raw && config.record.raw[config.meta.name] && config.record.raw[config.meta.name].mvValue){
                var mvValue = config.record.raw[config.meta.name].mvValue;

                //get corresponding message from qcInfo section of JSON and set up a qtip
                if(config.record.store && config.record.store.reader.rawData && config.record.store.reader.rawData.qcInfo && config.record.store.reader.rawData.qcInfo[mvValue])
                {
                    qtip.push(config.record.store.reader.rawData.qcInfo[mvValue]);
                    config.cellMetaData.css = "labkey-mv";
                }
                qtip.push(mvValue);
            }

            if(config.record.errors && config.record.getErrors().length){

                Ext4.each(config.record.getErrors(), function(e){
                    if(e.field==meta.name){
                        qtip.push((e.severity || 'ERROR') +': '+e.message);
                    }
                }, this);
            }

            //NOTE: the Ext3 API did this; however, i think a better solution is to support text wrapping in cells
    //        if(config.col.multiline || (undefined === config.col.multiline && config.col.scale > 255 && config.meta.jsonType === "string"))
    //        {
    //            //Ext3
    //            config.cellMetaData.tdAttr = "ext:qtip=\"" + Ext4.util.Format.htmlEncode(config.value || '') + "\"";
    //            //Ext4
    //            config.cellMetaData.tdAttr += " data-qtip=\"" + Ext4.util.Format.htmlEncode(config.value || '') + "\"";
    //        }

            if(config.meta.buildQtip){
                config.meta.buildQtip({
                    qtip: config.qtip,
                    value: config.value,
                    cellMetaData: config.cellMetaData,
                    meta: config.meta,
                    record: config.record
                });
            }

            if(qtip.length){
                //ext3
                config.cellMetaData.tdAttr = "ext:qtip=\"" + Ext4.util.Format.htmlEncode(qtip.join('<br>')) + "\"";
                //ext4
                config.cellMetaData.tdAttr += " data-qtip=\"" + Ext4.util.Format.htmlEncode(qtip.join('<br>')) + "\"";
            }
        },

        //private
        //NOTE: it would be far better if we did not need to pass the store.  this is done b/c we need to fire the 'datachanged' event
        //once the lookup store loads.  a better idea would be to force the store/grid to listen for event fired by the lookupStore or somehow get the
        //metadata to fire events itself
        getLookupDisplayValue : function(meta, data, record, store) {
            var lookupStore = LABKEY.ext.Ext4Helper.getLookupStore(meta);
            if(!lookupStore){
                return '';
            }

            meta.lookupStore = lookupStore;
            var lookupRecord;
            var recIdx = lookupStore.find(meta.lookup.keyColumn, data);
            if(recIdx != -1)
                lookupRecord = lookupStore.getAt(recIdx);

            if (lookupRecord)
                return lookupRecord.get(meta.lookup.displayColumn);
            else {
                //NOTE: shift this responsibility to the grid or other class consuming this
    //            //if store not loaded yet, retry rendering on store load
    //            if(store && !lookupStore.fields){
    //                this.lookupStoreLoadListeners = this.lookupStoreLoadListeners || [];
    //                if(Ext4.Array.indexOf(this.lookupStoreLoadListeners, lookupStore.storeId) == -1){
    //                    lookupStore.on('load', function(lookupStore){
    //                        this.lookupStoreLoadListeners.remove(lookupStore.storeId);
    //
    //                        //grid.getView().refresh();
    //                        store.fireEvent('datachanged', store);
    //
    //                    }, this, {single: true});
    //                    this.lookupStoreLoadListeners.push(lookupStore.storeId);
    //                }
    //            }
                if (data!==null){
                    return "[" + data + "]";
                }
                else {
                    return Ext4.isDefined(meta.lookupNullCaption) ? meta.lookupNullCaption : "[none]";
                }
            }
        },

        /**
         * Identify the proper name of a field using an input string such as an excel column label.  This helper will
         * perform a case-insensitive comparison of the field name, label, caption, shortCaption and aliases.
         *
         * @name resolveFieldNameFromLabel
         * @function
         * @param (string) fieldName The string to search
         * @param (array / Ext.util.MixedCollection) metadata The fields to search
         * @returns {string} Returns the normalized field name or null if not found
         * @memberOf LABKEY.ext.Ext4Helper#
         *
         */
        resolveFieldNameFromLabel: function(fieldName, meta){
            var fnMatch = [];
            var aliasMatch = [];
            if(meta.hasOwnProperty('each'))
                meta.each(testField, this);
            else
                Ext4.each(meta, testField, this);

            function testField(fieldMeta){
                if (LABKEY.Utils.caseInsensitiveEquals(fieldName, fieldMeta.name)
                    || LABKEY.Utils.caseInsensitiveEquals(fieldName, fieldMeta.caption)
                    || LABKEY.Utils.caseInsensitiveEquals(fieldName, fieldMeta.shortCaption)
                    || LABKEY.Utils.caseInsensitiveEquals(fieldName, fieldMeta.label)
                ){
                    fnMatch.push(fieldMeta.name);
                    return false;  //exit here because it should only match 1 name
                }

                if(fieldMeta.importAliases){
                    var aliases;
                    if(Ext4.isArray(fieldMeta.importAliases))
                        aliases = fieldMeta.importAliases;
                    else
                        aliases = fieldMeta.importAliases.split(',');

                    Ext4.each(aliases, function(alias){
                        if(LABKEY.Utils.caseInsensitiveEquals(fieldName, alias))
                            aliasMatch.push(fieldMeta.name);  //continue iterating over fields in case a fieldName matches
                    }, this);
                }
            }

            if(fnMatch.length==1)
                return fnMatch[0];
            else if (fnMatch.length > 1){
                //alert('Ambiguous Field Label: '+fieldName);
                return null;
            }
            else if (aliasMatch.length==1){
                return aliasMatch[0];
            }
            else {
                //alert('Unknown Field Label: '+fieldName);
                return null;
            }
        },

        //private
        findJsonType: function(fieldObj){
            var type = fieldObj.type || fieldObj.typeName;

            if (type=='DateTime')
                return 'date';
            else if (type=='Double')
                return 'float';
            else if (type=='Integer' || type=='int')
                return 'int';
            //if(type=='String')
            else
                return 'string';
        },

        /**
         * EXPERIMENTAL.  Provides a consistent implementation for determining whether a field should appear in a details view.
         * If any of the following are true, it will not appear: hidden, isHidden
         * If shownInDetailsView is defined, it will take priority
         *
         * @name shouldShowInDetailsView
         * @function
         * @param (object) metadata The field metadata object
         * @returns {boolean} Returns whether the field show appear in the default details view
         * @memberOf LABKEY.ext.Ext4Helper#
         *
         */
        shouldShowInDetailsView: function(meta){
            return Ext4.isDefined(meta.shownInDetailsView) ? meta.shownInDetailsView :
                (!meta.isHidden && !meta.hidden && meta.shownInDetailsView!==false);
        },

        /**
         * EXPERIMENTAL.  Provides a consistent implementation for determining whether a field should appear in an insert view.
         * If any of the following are false, it will not appear: userEditable and autoIncrement
         * If any of the follow are true, it will not appear: hidden, isHidden
         * If shownInInsertView is defined, this will take priority over all
         *
         * @name shouldShowInInsertView
         * @function
         * @param (object) metadata The field metadata object
         * @returns {boolean} Returns whether the field show appear in the default insert view
         * @memberOf LABKEY.ext.Ext4Helper#
         *
         */
        shouldShowInInsertView: function(meta){
            return Ext4.isDefined(meta.shownInInsertView) ?  meta.shownInInsertView :
                (!meta.isHidden && !meta.hidden && meta.userEditable!==false && !meta.autoIncrement);
        },

        /**
         * EXPERIMENTAL.  Provides a consistent implementation for determining whether a field should appear in an update view.
         * If any of the following are false, it will not appear: userEditable and autoIncrement
         * If any of the follow are true, it will not appear: hidden, isHidden, readOnly
         * If shownInUpdateView is defined, this will take priority over all
         *
         * @name shouldShowInUpdateView
         * @function
         * @param (object) metadata The field metadata object
         * @returns {boolean} Returns whether the field show appear
         * @memberOf LABKEY.ext.Ext4Helper#
         *
         */
        shouldShowInUpdateView: function(meta){
            return Ext4.isDefined(meta.shownInUpdateView) ? meta.shownInUpdateView :
                (!meta.isHidden && !meta.hidden && meta.userEditable!==false && !meta.autoIncrement && meta.readOnly!==false)
        },

        //private
        //a shortcut for LABKEY.ext.Ext4Helper.getLookupStore that doesnt require as complex a config object
        simpleLookupStore: function(c) {
            c.lookup = {
                containerPath: c.containerPath,
                schemaName: c.schemaName,
                queryName: c.queryName,
                viewName: c.viewName,
    //            sort: c.sort,
                displayColumn: c.displayColumn,
                keyColumn: c.keyColumn
            };

            return LABKEY.ext.Ext4Helper.getLookupStore(c);
        },

        /**
         * Experimental.  If a store has not yet loaded, the implicit model always has zero fields
         * @param store
         */
        hasStoreLoaded: function(store){
            return store.proxy &&
               store.proxy.reader &&
               store.proxy.reader.rawData;
        },

        /**
         * Experimental.  Returns the fields from the passed store
         * @param store
         * @returns {Ext.util.MixedCollection} The fields associated with this store
         */
        getStoreFields: function(store){
            return store.proxy.reader.model.prototype.fields;
        },

        findFieldMetadata : function(store, fieldName){
            var fields = store.model.prototype.fields;
            if(!fields)
                return null;

            return fields.get(fieldName);
        }
    }
};