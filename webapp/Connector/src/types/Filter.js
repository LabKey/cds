/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.types.Filter', {

    extend : 'Ext.Base',

    singleton : true,

    constructor : function() {

        Ext.data.Types.FILTER = {
            convert : function(val, data) {
                var fObj = Ext.create('Connector.model.Filter', {
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