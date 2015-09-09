/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Study', {

    extend : 'Ext.data.Model',

    idProperty: 'study_name',

    resolvableField: 'label',

    fields: [
        {name: 'study_name'},
        {name: 'Container'},
        {name: 'network'},
        {name: 'label'},
        {name: 'short_name'},
        {name: 'title'},
        {name: 'type'},
        {name: 'status'},
        {name: 'stage'},
        {name: 'population'},
        {name: 'species'},
        {name: 'study_cohort'},
        {name: 'first_enr_date', defaultValue: undefined },
        {name: 'followup_complete_date', defaultValue: undefined },
        {name: 'start_date', defaultValue: undefined },
        {name: 'public_date', defaultValue: undefined },
        {name: 'rationale'},
        {name: 'description'},
        {name: 'hypothesis'},
        {name: 'objectives'},
        {name: 'methods'},
        {name: 'findings'},
        {name: 'discussion'},
        {name: 'context'},
        {name: 'products', convert : function(value) {
            return Ext.isArray(value) ? value : [];
        }}
    ]
});