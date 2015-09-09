/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.measure.Configuration', {
    statics: {
        context: {

            // Override information about sources (i.e. queries) defined by the server.
            // The key for this map is schemaName|queryName, which is the key used in the Query service SOURCE_STORE.
            // See Connector.model.Source for the set of properties and default values.
            sources: {
                'study|SubjectVisit': {
                    queryLabel: 'Time points'
                },
                'study|SubjectGroupMap': {
                    queryLabel: 'User groups'
                },
                'study|Ad5': {
                    category: 'Assays'
                },
                'study|ICS': {
                    category: 'Assays',
                    dimensions: [
                        'study_ICS_cell_type',
                        'study_ICS_functional_marker_name',
                        'study_ICS_summary_level',
                        'study_ICS_peptide_pool',
                        'study_ICS_protein_panel',
                        'study_ICS_protein',
                        'study_ICS_specimen_type',
                        'study_ICS_lab_code'
                    ]
                },
                'study|NAb': {
                    category: 'Assays',
                    dimensions: [
                        'study_NAb_target_cell',
                        'study_NAb_summary_level',
                        'study_NAb_virus',
                        'study_NAb_specimen_type',
                        'study_NAb_lab_code'
                    ]
                },
                'study|BAMA': {
                    category: 'Assays',
                    dimensions: [
                        'study_BAMA_antibody_isotype',
                        'study_BAMA_summary_level',
                        'study_BAMA_antigen',
                        'study_BAMA_dilution',
                        'study_BAMA_detection_ligand',
                        'study_BAMA_instrument_code',
                        'study_BAMA_specimen_type',
                        'study_BAMA_lab_code'
                    ]
                },
                'study|ELISPOT': {
                    category: 'Assays',
                    dimensions: [
                        'study_ELISPOT_functional_marker_name',
                        'study_ELISPOT_summary_level',
                        'study_ELISPOT_peptide_pool',
                        'study_ELISPOT_protein',
                        'study_ELISPOT_protein_panel',
                        'study_ELISPOT_specimen_type',
                        'study_ELISPOT_lab_code'
                    ]
                },

                // New/virtual sources
                'CurrentColumns': {
                    sortOrder: -100,
                    schemaName: '_current',
                    queryName: null,
                    queryLabel: 'Current columns',
                    variableType: 'VIRTUAL'
                },
                'SessionColumns': {
                    sortOrder: -99,
                    schemaName: '_session',
                    queryName: null,
                    queryLabel: 'All variables from this session',
                    variableType: 'VIRTUAL'
                },
                'SubjectCharacteristics': {
                    schemaName: 'study',
                    queryName: null,
                    queryLabel: 'Subject characteristics',
                    subjectCountQueryName: 'Demographics',
                    variableType: 'DEFINED_MEASURES',
                    measures: [
                        'study_Demographics_species',
                        'study_Demographics_subspecies',
                        'study_Demographics_sexatbirth',
                        'study_Demographics_race',
                        'study_Demographics_ethnicity',
                        'study_Demographics_country_enrollment',
                        'study_Demographics_circumcised_enrollment',
                        'study_Demographics_bmi_enrollment',
                        'study_Demographics_agegroup_range',
                        'study_Demographics_age_enrollment'
                    ]
                },
                'StudyTreatmentVariables': {
                    schemaName: 'study',
                    queryName: null,
                    queryLabel: 'Study and treatment variables',
                    subjectCountQueryName: 'Demographics',
                    variableType: 'DEFINED_MEASURES',
                    measures: [
                        'study_Demographics_study_label',
                        'study_Demographics_study_start_date',
                        'study_Demographics_study_first_enr_date',
                        'study_Demographics_study_fu_complete_date',
                        'study_Demographics_study_public_date',
                        'study_Demographics_study_network',
                        //'study_Demographics_study_last_vaccination_day',
                        'study_Demographics_study_type',
                        'study_Demographics_study_arm',
                        'study_Demographics_study_arm_summary',
                        'study_Demographics_study_arm_coded_label',
                        'study_Demographics_study_randomization',
                        'study_Demographics_study_product_class_combination',
                        'study_Demographics_study_product_combination'
                    ]
                }
            },

            // Override information about dimensions (i.e. query columns tagged as "isDimension") defined by the server.
            // The key for this map is the column alias, which is the key used for the Query service MEASURE_STORE.
            // See Connector.model.Measure for the set of properties and default values.
            dimensions: {
                // study|ICS
                'study_ICS_cell_type': {
                    requiresSelection: true,
                    defaultSelection: {all: false, value: 'CD4+'}
                },
                'study_ICS_functional_marker_name': {
                    requiresSelection: true,
                    allowMultiSelect: false,
                    defaultSelection: {all: false}
                },
                'study_ICS_summary_level': {
                    requiresSelection: true,
                    allowMultiSelect: false,
                    defaultSelection: {all: false, value: 'Protein Panel'}
                },
                'study_ICS_peptide_pool': {
                    requiresSelection: true,
                    hierarchicalSelectionParent: 'study_ICS_protein',
                    hierarchicalFilterColumnAlias: 'study_ICS_protein_panel_protein_peptide_pool',
                    distinctValueFilterColumnAlias: 'study_ICS_summary_level',
                    distinctValueFilterColumnValue: 'Peptide Pool'
                },
                'study_ICS_protein': {
                    requiresSelection: true,
                    hierarchicalSelectionParent: 'study_ICS_protein_panel',
                    hierarchicalFilterColumnAlias: 'study_ICS_protein_panel_protein',
                    distinctValueFilterColumnAlias: 'study_ICS_summary_level',
                    distinctValueFilterColumnValue: 'Protein'
                },
                'study_ICS_protein_panel': {
                    requiresSelection: true,
                    hierarchicalSelectionParent: null,
                    distinctValueFilterColumnAlias: 'study_ICS_summary_level',
                    distinctValueFilterColumnValue: 'Protein Panel'
                },
                // study|NAb
                'study_NAb_target_cell': {
                    requiresSelection: true,
                    allowMultiSelect: false,
                    defaultSelection: {all: false, value: 'TZM-bl'}
                },
                'study_NAb_summary_level': {
                    requiresSelection: true,
                    allowMultiSelect: false,
                    defaultSelection: {all: false, value: 'Virus'}
                },
                'study_NAb_virus': {
                    requiresSelection: true,
                    hierarchicalSelectionParent: 'study_NAb_clade',
                    hierarchicalFilterColumnAlias: 'study_NAb_tier_clade_virus',
                    distinctValueFilterColumnAlias: 'study_NAb_summary_level',
                    distinctValueFilterColumnValue: 'Virus'
                },
                'study_NAb_clade': {
                    hierarchicalSelectionParent: 'study_NAb_neutralization_tier'
                },
                'study_NAb_neutralization_tier': {
                    hierarchicalSelectionParent: null
                },
                // study|BAMA
                'study_BAMA_antibody_isotype': {
                    requiresSelection: true,
                    allowMultiSelect: false,
                    defaultSelection: {all: false}
                },
                'study_BAMA_summary_level': {
                    requiresSelection: true,
                    allowMultiSelect: false,
                    defaultSelection: {all: false, value: 'Antigen'}
                },
                'study_BAMA_antigen': {
                    requiresSelection: true,
                    hierarchicalSelectionParent: null,
                    distinctValueFilterColumnAlias: 'study_BAMA_summary_level',
                    distinctValueFilterColumnValue: 'Antigen'
                },
                'study_BAMA_dilution': {
                    requiresSelection: true
                },
                // study|ELISPOT
                'study_ELISPOT_functional_marker_name': {
                    requiresSelection: true,
                    allowMultiSelect: false,
                    defaultSelection: {all: false}
                },
                'study_ELISPOT_summary_level': {
                    requiresSelection: true,
                    allowMultiSelect: false,
                    defaultSelection: {all: false, value: 'Peptide Pool'}
                },
                'study_ELISPOT_peptide_pool': {
                    requiresSelection: true,
                    hierarchicalSelectionParent: 'study_ELISPOT_protein',
                    hierarchicalFilterColumnAlias: 'study_ELISPOT_protein_panel_protein_peptide_pool',
                    distinctValueFilterColumnAlias: 'study_ELISPOT_summary_level',
                    distinctValueFilterColumnValue: 'Peptide Pool'
                },
                'study_ELISPOT_protein': {
                    requiresSelection: true,
                    hierarchicalSelectionParent: 'study_ELISPOT_protein_panel',
                    hierarchicalFilterColumnAlias: 'study_ELISPOT_protein_panel_protein',
                    distinctValueFilterColumnAlias: 'study_ELISPOT_summary_level',
                    distinctValueFilterColumnValue: 'Protein'
                },
                'study_ELISPOT_protein_panel': {
                    requiresSelection: true,
                    hierarchicalSelectionParent: null,
                    distinctValueFilterColumnAlias: 'study_ELISPOT_summary_level',
                    distinctValueFilterColumnValue: 'Protein Panel'
                }
            },

            // Override information about measures (i.e. query columns) defined by the server OR declare a measure.
            // All measures defined here will be added to the Query service MEASURE_STORE and assumed to be understood by the server.
            // The key for this map is the column alias, which is the key used for the Query service MEASURE_STORE.
            // See Connector.model.Measure for the set of properties and default values.
            measures: {
                'Days': {
                    sortOrder: -4,
                    schemaName: Connector.studyContext.schemaName,
                    queryName: Connector.studyContext.subjectVisit,
                    inNotNullSet: false,
                    isRecommendedVariable: true,
                    isMeasure: true,
                    name: Connector.studyContext.protocolDayColumn,
                    label: 'Study days',
                    type: 'INTEGER',
                    variableType: 'TIME'
                },
                'Weeks': {
                    sortOrder: -3,
                    schemaName: Connector.studyContext.schemaName,
                    queryName: Connector.studyContext.subjectVisit,
                    inNotNullSet: false,
                    isMeasure: true,
                    name: Connector.studyContext.protocolDayColumn,
                    label: 'Study weeks',
                    type: 'DOUBLE',
                    variableType: 'TIME'
                },
                'Months': {
                    sortOrder: -2,
                    schemaName: Connector.studyContext.schemaName,
                    queryName: Connector.studyContext.subjectVisit,
                    inNotNullSet: false,
                    isMeasure: true,
                    name: Connector.studyContext.protocolDayColumn,
                    label: 'Study months',
                    type: 'DOUBLE',
                    variableType: 'TIME'
                },
                'study_SubjectGroupMap_GroupId_Label': {
                    sortOrder: -1,
                    schemaName: Connector.studyContext.schemaName,
                    queryName: 'SubjectGroupMap',
                    inNotNullSet: false,
                    name: 'GroupId/Label',
                    label: 'My saved groups',
                    type: 'VARCHAR',
                    isDemographic: true, // use this to tell the visualization provider to only join on Subject (not Subject and Visit)
                    variableType: 'USER_GROUPS'
                },

                // recommended variables
                'study_ICS_pctpos_adj': {
                    isRecommendedVariable: true
                },
                'study_ICS_response_call': {
                    isRecommendedVariable: true
                },
                'study_NAb_titer_ic50': {
                    isRecommendedVariable: true
                },
                'study_NAb_response_call': {
                    isRecommendedVariable: true
                },
                'study_BAMA_mfi_delta': {
                    isRecommendedVariable: true
                },
                'study_BAMA_response_call': {
                    isRecommendedVariable: true
                },
                'study_ELISPOT_mean_sfc': {
                    isRecommendedVariable: true
                },
                'study_ELISPOT_response_call': {
                    isRecommendedVariable: true
                },
                'study_Demographics_species': {
                    isRecommendedVariable: true
                },
                'study_Demographics_sexatbirth': {
                    isRecommendedVariable: true
                },
                'study_Demographics_age_enrollment': {
                    isRecommendedVariable: true
                },
                'study_Demographics_study_label': {
                    isRecommendedVariable: true
                },
                'study_Demographics_study_arm_summary': {
                    isRecommendedVariable: true
                },

                // hidden variables
                'study_ICS_summary_level': {
                    hidden: true
                },
                'study_ICS_protein_panel_protein_peptide_pool': {
                    hidden: true
                },
                'study_ICS_protein_panel_protein': {
                    hidden: true
                },
                'study_ICS_SubjectVisit_Visit': {
                    hidden: true
                },
                'study_NAb_summary_level': {
                    hidden: true
                },
                'study_NAb_tier_clade_virus': {
                    hidden: true
                },
                'study_NAb_SubjectVisit_Visit': {
                    hidden: true
                },
                'study_NAb_visit_day': {
                    hidden: true
                },
                'study_BAMA_summary_level': {
                    hidden: true
                },
                'study_BAMA_SubjectVisit_Visit': {
                    hidden: true
                },
                'study_BAMA_visit_day': {
                    hidden: true
                },
                'study_ELISPOT_summary_level': {
                    hidden: true
                },
                'study_ELISPOT_protein_panel_protein_peptide_pool': {
                    hidden: true
                },
                'study_ELISPOT_protein_panel_protein': {
                    hidden: true
                },
                'study_ELISPOT_SubjectVisit_Visit': {
                    hidden: true
                },
                'study_ELISPOT_visit_day': {
                    hidden: true
                },
                'study_Demographics_SubjectVisit_Visit': {
                    hidden: true
                }
            }
        }
    }
});