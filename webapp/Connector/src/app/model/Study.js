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

    fields: [
        {name: 'study_name'},
        {name: 'Container'},
        {name: 'network'},
        {name: 'label', sortType: 'asUCString'},
        {name: 'short_name'},
        {name: 'study_title'},
        {name: 'type'},
        {name: 'status'},
        {name: 'stage'},
        {name: 'species'},
        {name: 'population'},
        {name: 'executive_summary'},
        {name: 'description'},
        {name: 'strategy'},
        {name: 'groups'},
        {name: 'groups_header'},
        {name: 'groups_data'},
        {name: 'treatment_schema_link'},
        {name: 'rationale'},
        {name: 'hypothesis'},
        {name: 'objectives'},
        {name: 'methods'},
        {name: 'assay_schema_link'},
        {name: 'findings'},
        {name: 'conclusions'},
        {name: 'publications'},
        {name: 'start_date', defaultValue: undefined },
        {name: 'public_date', defaultValue: undefined },
        {name: 'data_availability'},
        {name: 'data_accessible'},
        {name: 'cavd_affiliation'},
        {name: 'cavd_affiliation_filename'},
        {name: 'cavd_affiliation_file_path'},
        {name: 'cavd_affiliation_file_accessible'},
        {name: 'cavd_affiliation_file_has_permission'},
        {name: 'study_cohort'},
        {name: 'first_enr_date', defaultValue: undefined },
        {name: 'followup_complete_date', defaultValue: undefined },
        {name: 'discussion'},
        {name: 'context'},
        {name: 'grant_pi_name'},
        {name: 'grant_pi_email'},
        {name: 'grant_pm_name'},
        {name: 'grant_pm_email'},
        {name: 'investigator_name'},
        {name: 'investigator_email'},
        {name: 'primary_poc_name'},
        {name: 'primary_poc_email'},
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
        {name: 'assays', convert : Connector.model.Filter.asArray},
        {name: 'groups_treatment_schema', defaultValue: undefined},
        {name: 'methods_assay_schema', defaultValue: undefined},
        {name: 'assays_added_count'},
        {name: 'ni_assays_added_count'},
        {name: 'assays_added', convert : Connector.model.Filter.asArray},
        {name: 'atlas_link'},
        {name: 'cavd_link'},

        {name: 'protocol_docs_and_study_plans', convert : Connector.model.Filter.asArray},
        {name: 'protocol_docs_and_study_plans_has_permission'},
        {name: 'data_listings_and_reports', convert : Connector.model.Filter.asArray},
        {name: 'data_listings_and_reports_has_permission'},
        {name: 'non_integrated_assay_data', convert : Connector.model.Filter.asArray},
        {name: 'non_integrated_assay_data_has_permission'},
        {name: 'publications', convert : Connector.model.Filter.asArray},
        {name: 'relationships', convert : Connector.model.Filter.asArray},
        {name: 'clintrials_id'},
        {name: 'specimen_repository_label'},
        {name: 'monoclonal_antibodies', convert : Connector.model.Filter.asArray},
        {name: 'interactive_reports', convert : Connector.model.Filter.asArray},
        {name: 'curated_groups', convert : Connector.model.Filter.asArray}
    ]
});