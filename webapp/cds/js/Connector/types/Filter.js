/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.types.Filter', {

    extend : 'Ext.Base',

    singleton : true,

    constructor : function() {

        Ext4.data.Types.FILTER = {
            convert : function(val, data) {
                var fObj = Ext4.create('Connector.model.Filter', {
                    x : val.x,
                    y : val.y
                });
                return fObj;
            },
            sortType : function(val) {
                return val.x;
            },
            type : 'filter'
        };
    }
});