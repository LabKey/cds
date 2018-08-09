/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.MabPane', {

    extend: 'Connector.model.InfoPane',

    fields: [
        {name: 'title', convert: function(title, record) {
            if (!title && record.raw.label) {
                return record.raw.label;
            }

            return title;
        }}
    ],

    setDimensionHierarchy : function() {
        // TODO: Remove this and reconfigure init path for Connector.model.InfoPane to not require this
    }
});