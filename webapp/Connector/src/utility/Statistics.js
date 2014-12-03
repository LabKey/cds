/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

// This is a singleton for resolving statistics
Ext.define('Statistics', {
    singleton: true,
    statistics: null,
    resolve: function(callback, scope) {
        scope = scope || this;
        if (this.statistics) {
            callback.call(scope, this.statistics);
        } else {
            Ext.Ajax.request({
                url: LABKEY.ActionURL.buildURL('cds', 'properties'),
                method: 'GET',
                success: function(response) {
                    var json = Ext.decode(response.responseText);
                    this.statistics = json;
                    if (Ext.isFunction(callback)) {
                        callback.call(scope, json);
                    }
                },
                scope: this
            });
        }
    },
    update : function(properties, callback, failureCallback, scope) {
        Ext.Ajax.request({
            url: LABKEY.ActionURL.buildURL('cds', 'properties'),
            method: 'POST',
            jsonData: {
                primaryCount: properties.primaryCount,
                dataCount: properties.dataCount
            },
            success : function(response) {
                var json = Ext.decode(response.responseText);
                this.statistics = json;

                if (Ext.isFunction(callback)) {
                    callback.call(scope, json);
                }
            },
            failure : function() {
                if (Ext.isFunction(failureCallback)) {
                    failureCallback.call(scope);
                }
            },
            scope: this
        });
    }
});
