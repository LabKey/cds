/*
 * Copyright (c) 2014-2015 LabKey Corporation
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
        }
        else {
            Ext.Ajax.request({
                url: LABKEY.ActionURL.buildURL('cds', 'properties.api'),
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
    }
});
