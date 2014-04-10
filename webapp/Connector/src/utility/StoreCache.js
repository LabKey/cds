/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

// This is a singleton that allows store instances to be lazily created and cached for later reuse. The
// getStore method will create the store if it doesn't exist, otherwise it'll return the existing
// instance.
Ext.define('StoreCache', {
    singleton: true,
    sharedStores: {},
    getStore: function(options) {
        if (Ext.isString(options)) {
            options = { type: options };
        }
        var id = options.id;
        var type = options.type || 'Ext.data.Store';
        if (!id) {
            // Generate an id based on type and model if id isn't supplied
            id = type + '-' + (options.model || '');
        }
        if (this.sharedStores[id]) {
            //console.log("Reusing shared store",id);
            return this.sharedStores[id];
        }

        var type = options.type;
        var createParams = {};
        if (options.model) {
            createParams.model = options.model;
        }

        //console.log("Creating shared store",id);
        this.sharedStores[id] = Ext.create(type, createParams);

        return this.sharedStores[id];
    }
});
