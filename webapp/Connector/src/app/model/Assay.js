/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Assay', {

    extend : 'Ext.data.Model',

    idProperty: 'assay_identifier',

    resolvableField: 'assay_identifier',

    dataAvailabilityField: 'studies_with_data',

    labelProperty: 'assay_label',
    
    fields: [
        {name: 'assay_identifier'},
        {name: 'Container'},
        {name: 'assay_type'},
        {name: 'assay_label'},
        {name: 'assay_short_name', sortType: 'asUCString'},
        {name: 'assay_category'},
        {name: 'assay_detection_platform'},
        {name: 'assay_body_system_type'},
        {name: 'assay_body_system_target', sortType: 'asUCString'},
        {name: 'assay_general_specimen_type'},
        {name: 'assay_description'},
        {name: 'assay_method_description'},
        {name: 'assay_endpoint_description'},
        {name: 'assay_endpoint_statistical_analysis'},
        {name: 'data_availability'},
        {name: 'study_count'}, //generated when the assay store is loaded.
        {name: 'studies_with_data_count'},
        {name: 'studies', convert : function(value) {
            return Ext.isArray(value) ? value : [];
        }},
        {name: 'studies_with_data', convert : function(value) {
            return Ext.isArray(value) ? value : [];
        }}
    ]
});