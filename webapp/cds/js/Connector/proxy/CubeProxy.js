/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.proxy.CubeProxy', {
    extend : 'Ext.data.proxy.Proxy',
    alias  : 'proxy.CubeProxy',

    reader : 'ExtendedJsonReader', // See LABKEY.ext4.ExtendedJsonReader

//    writer : {
//        type  : 'json',
//        write : function(request) {
//            return request;
//        }
//    },

    read: function(op, cb, scope) {
        cb.call(scope);
    }
});