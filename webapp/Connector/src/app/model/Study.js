/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Study', {

    extend : 'Ext.data.Model',

    idProperty: 'study_name',

    resolvableField: 'label',

    dataAvailabilityField: 'assays_added',

    ni_dataAvailabilityField: 'ni_assays_added',

    fields: [
        {name: 'study_name'},
        {name: 'Container'},
        {name: 'network'},
        {name: 'label', sortType: 'asUCString'},
        {name: 'type'},
        {name: 'status'},
        {name: 'stage'},
        {name: 'species'},
        {name: 'description'},
        {name: 'strategy'},
        {name: 'start_date', defaultValue: undefined },
        {name: 'public_date', defaultValue: undefined },
        {name: 'data_availability'},
        {name: 'ni_data_availability'},
        {name: 'data_accessible'},
        {name: 'cavd_affiliation'},
        {name: 'first_enr_date', defaultValue: undefined },
        {name: 'followup_complete_date', defaultValue: undefined },
        {name: 'date_to_sort_on', sortType: function(dateToSortOn) {
            if (!dateToSortOn)
                return;

            var row = dateToSortOn.split("|");
            var stage = row[0];
            var date = new Date(row[1]);

            switch (stage) {
                case "In Progress":
                    stage = 1;
                    break;
                case "Assays Completed":
                    stage = 2;
                    break;
                case "Primary Analysis Complete":
                    stage = 3;
                    break;
                default:
                    stage = 4;
                    break;
            }

            return [stage,
                    date.getFullYear(),
                    date.getMonth().toString().length == 1 ? '0' + date.getMonth() : date.getMonth(),
                    date.getDay().toString().length == 1 ? '0' + date.getDay() : date.getDay()].join('');
        }},
        {name: 'start_year'},
        {name: 'product_to_sort_on'},
        {name: 'products', convert : Connector.model.Filter.asArray},
        {name: 'product_classes', convert : Connector.model.Filter.asArray},
        {name: 'product_names', convert : Connector.model.Filter.asArray},
        {name: 'assays_added_count'},
        {name: 'ni_assays_added_count'},
        {name: 'assays_added', convert : Connector.model.Filter.asArray},
        {name: 'ni_assays_added', convert : Connector.model.Filter.asArray},
        {name: 'publications', convert : Connector.model.Filter.asArray},
        {name: 'pub_available_data_count'},
        {name: 'data_available'}
    ]
});