/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.app.model.StudyProducts', {

    extend : 'Ext.data.Model',

    fields: [
        {name: 'VaccineName'},
        {name: 'Type'},
        {name: 'Class', mapping: 'class'},
        {name: 'Subclass', mapping: 'subclass'},
        {name: 'Developer', mapping: 'developer'},
        {name: 'Description', mapping: 'description'}
    ]
});