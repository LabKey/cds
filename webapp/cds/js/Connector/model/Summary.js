/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.model.Summary', {

    extend : 'Ext.data.Model',

//    requires : ['Connector.proxy.CubeProxy'],
//
//    proxy  : {
//        type : 'CubeProxy'
//    },

    fields : [
        {name : 'label'},
        {name : 'total', type : 'int'},
        {name : 'subject'}, // in the sentence "3 total regimens" this would be 'regimens'
        {name : 'details'}, // Array of {text, nav} objects
        {name : 'sort',  type : 'int'},
        {name : 'heirarchy'} // TODO: This is really the name of the dimesnion...
    ]

});