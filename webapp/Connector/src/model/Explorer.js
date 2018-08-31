/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Explorer', {

    extend: 'Ext.data.Model',

    fields: [
        {name : 'label'},
        {name : 'count', type : 'int'},
        {name : 'subcount', type : 'int', defaultValue: 0},
        {name : 'hierarchy'},
        {name : 'value'},
        {name : 'level'},
        {name : 'levelUniqueName'},
        {name : 'lvlDepth', type: 'int', defaultValue: 0},
        {name : 'ordinal', type: 'int', defaultValue: -1},
        {name : 'uniqueName'},
        {name : 'isGroup', type : 'boolean'},
        {name : 'isLeafNode', type : 'boolean', defaultValue: false},
        {name : 'isSelected', type : 'boolean', defaultValue: false},
        {name : 'collapsed', type : 'boolean'},
        {name : 'btnId'},

        // Global properties
        {name : 'maxcount', type : 'int'},
        {name : 'hasSelect', type : 'boolean', defaultValue: false}
    ]
});