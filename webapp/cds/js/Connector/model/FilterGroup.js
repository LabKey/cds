/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.model.FilterGroup', {
    extend : 'Ext.data.Model',
    fields : [
        {name : 'label'},
        {name : 'participantIds'},
        {name : 'description'},
        {name : 'shared', type: 'boolean'},
        {name : 'type'},
        {name : 'filters'}
    ],

    addFilter : function(filter) {},

    removeFilter : function(id) {},

    getName : function() {
        if (this.data.label)
            return this.data.label;
        return this.data.name;
    },

    isGroup : function() {
        return true;
    }
});