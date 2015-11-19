/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.Application', {
    name: 'Connector',

    extend: 'LABKEY.app.Application',

    requires: [
        'Connector.app.model.Assay',
        'Connector.app.model.Labs',
        'Connector.app.model.Study',
        'Connector.app.model.StudyProducts',
        'Connector.app.model.VariableList',

        'Connector.app.store.Assay',
        'Connector.app.store.Labs',
        'Connector.app.store.StudyProducts',
        'Connector.app.store.VariableList',

        'Connector.app.view.Assay',
        'Connector.app.view.Labs',
        'Connector.app.view.Study',
        'Connector.app.view.StudyProducts'
    ],

    controllers: [
        'Connector', // View Manager must be registered first to properly initialize
        'HttpInterceptor',
        'Messaging',
        'State',
        'Query',
        'Filter',
        'Analytics',
        'Group',
        'Main',
        'Router',
        'Chart',
        'Explorer',
        'FilterStatus',
        'Home',
        'Learn',
        'Navigation',
        'Data',
        'Summary'
    ],

    defaultController: 'Home',

    views: [],

    stores: [],

    defaultUserProperties: {
        showIntro: true
    },

    userProperties: {},

    init : function()
    {
        this.callParent();

        if (Ext.isObject(Connector.user.properties))
        {
            this.userProperties = Connector.user.properties;
        }

        this._initUserProperties(this.userProperties);
    },

    _initUserProperties : function(properties)
    {
        var userProps = {};
        Ext.iterate(properties, function(k, v)
        {
            userProps[k] = Ext.decode(v).value;
        });
        this.userProperties = userProps;

        Ext.applyIf(this.userProperties, this.defaultUserProperties);

        return Ext.clone(this.userProperties);
    },

    initNamespace : function() {
        this.callParent(arguments);

        var me = this;
        var ns = Ext.namespace(me.name);

        if (ns) {
            // public methods
            ns.getService = Ext.bind(this.getService, this);
            ns.getState = Ext.bind(this.getState, this);
            ns.getFilterService = Ext.bind(this.getFilterService, this);
            ns.getQueryService = Ext.bind(this.getQueryService, this);

            // property interface
            ns.getProperty = Ext.bind(this.getProperty, this);
            ns.setProperty = Ext.bind(this.setProperty, this);
            ns.clearProperties = Ext.bind(this.clearProperties, this);
        }
    },

    getState : function() {
        return this.getService('State');
    },

    getFilterService : function() {
        return this.getService('Filter');
    },

    getQueryService : function() {
        return this.getService('Query');
    },

    setDataSource : function(datasource) {
        this.getState().setDataSource(datasource);
    },

    getProperty : function(property)
    {
        return this.userProperties[property];
    },

    setProperty : function(property, value, callback, scope)
    {
        var knownProps = Ext.Object.getKeys(this.defaultUserProperties),
            props = {};

        if (Ext.isString(property))
        {
            if (Ext.Array.contains(knownProps, property))
            {
                props[property] = {
                    value: value
                };

                Ext.Ajax.request({
                    url: LABKEY.ActionURL.buildURL('cds', 'userProperty.api'),
                    method: 'POST',
                    jsonData: {
                        properties: props
                    },
                    success: function(response)
                    {
                        var json = Ext.decode(response.responseText),
                            props = this._initUserProperties(json.properties);

                        if (Ext.isFunction(callback))
                        {
                            callback.call(scope || this, true, props);
                        }
                    },
                    failure: function()
                    {
                        if (Ext.isFunction(callback))
                        {
                            callback.call(scope || this, false, Ext.clone(this.userProperties));
                        }
                    },
                    scope: this
                });
            }
            else
            {
                throw '"' + property + '" is not a known user property. Unable to set.';
            }
        }
        else
        {
            throw this.$className + '.setProperty() "property" must be of type string.';
        }
    },

    clearProperties : function(callback, scope)
    {
        Ext.Ajax.request({
            url: LABKEY.ActionURL.buildURL('cds', 'userProperty.api'),
            method: 'DELETE',
            success: function()
            {
                var props = this._initUserProperties({});

                if (Ext.isFunction(callback))
                {
                    callback.call(scope || this, true, props);
                }
            },
            failure: function()
            {
                if (Ext.isFunction(callback))
                {
                    callback.call(scope || this, false, Ext.clone(this.userProperties));
                }
            },
            scope: this
        });
    }
});
