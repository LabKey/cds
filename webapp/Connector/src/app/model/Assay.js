/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Assay', {

    extend : 'Ext.data.Model',

    idProperty: 'assay_identifier',
    
    fields: [
        {name: 'assay_identifier'},
        {name: 'Container'},
        {name: 'assay_type'},
        {name: 'assay_label'},
        {name: 'assay_short_name'},
        {name: 'assay_category'},
        {name: 'assay_detection_platform'},
        {name: 'assay_body_system_type'},
        {name: 'assay_body_system_target'},
        {name: 'assay_general_specimen_type'},
        {name: 'assay_description'},
        {name: 'assay_method_description'},
        {name: 'assay_endpoint_description'},
        {name: 'assay_endpoint_statistical_analysis'},
        {name: 'study_count'} //generated when the assay store is loaded.
    ]
});