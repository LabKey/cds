/*
 * Copyright (c) 2015-2018 LabKey Corporation
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
                'cds|GridBase': {
                    queryLabel: 'Time points',
                    subjectCountQueryName: 'SubjectVisit'
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
                        'study_ICS_lab_code',
                        'study_ICS_antigen',
                        'study_ICS_pooled_info'
                    ],
                    defaultScale: 'LOG'
                },
                'study|NAb': {
                    category: 'Assays',
                    dimensions: [
                        'study_NAb_target_cell',
                        'study_NAb_summary_level',
                        'study_NAb_virus',
                        'study_NAb_initial_dilution',
                        'study_NAb_specimen_type',
                        'study_NAb_lab_code'
                    ],
                    defaultScale: 'LOG'
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
                        'study_ELISPOT_lab_code',
                        'study_ELISPOT_antigen'
                    ],
                    defaultScale: 'LOG'
                },
                'study|PKMAb': {
                    category: 'Assays',
                    dimensions: [
                        'study_PKMAb_mab_mix_name_std',
                         'study_PKMAb_summary_level',
                        'study_PKMAb_source_assay',
                        'study_PKMAb_specimen_type',
                        'study_PKMAb_lab_code'
                    ],
                    defaultScale: 'LOG'
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
                        'study_Demographics_SubjectId',
                        'study_Demographics_species',
                        'study_Demographics_subspecies',
                        'study_Demographics_sexatbirth',
                        'study_Demographics_race',
                        'study_Demographics_ethnicity',
                        'study_Demographics_country_enrollment',
                        'study_Demographics_circumcised_enrollment',
                        'study_Demographics_bmi_enrollment',
                        'study_Demographics_bmi_category',
                        'study_Demographics_agegroup_range',
                        'study_Demographics_age_enrollment',
                        'study_Demographics_genderidentity',
                        'study_Demographics_studycohort'
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
                        'study_Demographics_study_grant_pi_name',
                        'study_Demographics_study_strategy',
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
                    hidden: true,
                    requiresSelection: true,
                    allowMultiSelect: false,
                    defaultSelection: {all: false}
                },
                'study_ICS_summary_level': {
                    hidden: true,
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
                    hidden: true,
                    requiresSelection: true,
                    allowMultiSelect: false,
                    defaultSelection: {all: false, value: 'TZM-bl'}
                },
                'study_NAb_summary_level': {
                    hidden: true,
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
                    defaultSelection: {all: false, value: 'IgG'}
                },
                'study_BAMA_summary_level': {
                    hidden: true,
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
                    hidden: true,
                    requiresSelection: true,
                    allowMultiSelect: false,
                    defaultSelection: {all: false}
                },
                'study_ELISPOT_summary_level': {
                    hidden: true,
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
                },
                'cds_GridBase_Study': {
                    sourceMeasureAlias: 'study_Demographics_study_label'
                },
                'cds_GridBase_SubjectId': {
                    sourceMeasureAlias: 'study_Demographics_SubjectId'
                },
                'cds_GridBase_TreatmentSummary': {
                   sourceMeasureAlias: 'study_Demographics_study_arm_summary'
                }
            },

            // Override information about measures (i.e. query columns) defined by the server OR declare a measure.
            // All measures defined here will be added to the Query service MEASURE_STORE and assumed to be understood by the server.
            // The key for this map is the column alias, which is the key used for the Query service MEASURE_STORE.
            // See Connector.model.Measure for the set of properties and default values.
            measures: {
                'cds_GridBase_Days': {
                    sortOrder: 0,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: true,
                    isRecommendedVariable: true,
                    name: Connector.studyContext.protocolDayColumn,
                    label: 'Study days',
                    description: 'The number of calendar days relative to Day 0, where Day 0 is typically defined as enrollment and/or first vaccination.',
                    type: 'INTEGER',
                    variableType: 'TIME'
                },
                'cds_GridBase_Weeks': {
                    sortOrder: 1,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: true,
                    name: Connector.studyContext.protocolDayColumn,
                    label: 'Study weeks',
                    description: 'The number of weeks relative to Day 0 (Week 0), where Day 0 is typically defined as enrollment and/or first vaccination.',
                    type: 'DOUBLE',
                    variableType: 'TIME'
                },
                'cds_GridBase_Months': {
                    sortOrder: 2,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: true,
                    name: Connector.studyContext.protocolDayColumn,
                    label: 'Study months',
                    description: 'The number of months relative to Day 0 (Month 0), where Day 0 is typically defined as enrollment and/or first vaccination.',
                    type: 'DOUBLE',
                    variableType: 'TIME'
                },
                'cds_GridBase_Days_First_Vaccination': { //note that this measure alias matches the generated alias from the plot alignment selection
                    sortOrder: 3,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: true,
                    name: 'FirstVaccinationDay',
                    label: 'Study days relative to first vaccination',
                    description: 'The number of calendar days relative to the visit where the first vaccination was scheduled for the subject\'s assigned treatment group.',
                    type: 'INTEGER',
                    variableType: 'TIME'
                },
                'cds_GridBase_Weeks_First_Vaccination': { //note that this measure alias matches the generated alias from the plot alignment selection
                    sortOrder: 4,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: true,
                    name: 'FirstVaccinationDay',
                    label: 'Study weeks relative to first vaccination',
                    description: 'The number of weeks relative to the visit where the first vaccination was scheduled for the subject\'s assigned treatment group.',
                    type: 'DOUBLE',
                    variableType: 'TIME'
                },
                'cds_GridBase_Months_First_Vaccination': { //note that this measure alias matches the generated alias from the plot alignment selection
                    sortOrder: 5,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: true,
                    name: 'FirstVaccinationDay',
                    label: 'Study months relative to first vaccination',
                    description: 'The number of months relative to the visit where the first vaccination was scheduled for the subject\'s assigned treatment group.',
                    type: 'DOUBLE',
                    variableType: 'TIME'
                },
                'cds_GridBase_Days_Last_Vaccination': { //note that this measure alias matches the generated alias from the plot alignment selection
                    sortOrder: 6,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: true,
                    name: 'LastVaccinationDay',
                    label: 'Study days relative to last vaccination',
                    description: 'The number of calendar days relative to the visit where the last vaccination was scheduled for the subject\'s assigned treatment group.',
                    type: 'INTEGER',
                    variableType: 'TIME'
                },
                'cds_GridBase_Weeks_Last_Vaccination': { //note that this measure alias matches the generated alias from the plot alignment selection
                    sortOrder: 7,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: true,
                    name: 'LastVaccinationDay',
                    label: 'Study weeks relative to last vaccination',
                    description: 'The number of weeks relative to the visit where the last vaccination was scheduled for the subject\'s assigned treatment group.',
                    type: 'DOUBLE',
                    variableType: 'TIME'
                },
                'cds_GridBase_Months_Last_Vaccination': { //note that this measure alias matches the generated alias from the plot alignment selection
                    sortOrder: 8,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: true,
                    name: 'LastVaccinationDay',
                    label: 'Study months relative to last vaccination',
                    description: 'The number of months relative to the visit where the last vaccination was scheduled for the subject\'s assigned treatment group.',
                    type: 'DOUBLE',
                    variableType: 'TIME'
                },
                // include other alignment visit tab measures so we can reference the alias, but these won't be shown in grid
                'cds_GridBase_Days_Enrollment': {
                    hidden: true,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    name: 'EnrollmentDay',
                    label: 'Study days relative to enrollment',
                    description: 'The number of calendar days relative to the visit where the enrollment was scheduled for the subject\'s assigned treatment group.',
                    type: 'INTEGER'
                },
                'cds_GridBase_Weeks_Enrollment': {
                    hidden: true,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    name: 'EnrollmentDay',
                    label: 'Study weeks relative to enrollment',
                    description: 'The number of calendar weeks relative to the visit where the enrollment was scheduled for the subject\'s assigned treatment group.',
                    type: 'DOUBLE'
                },
                'cds_GridBase_Months_Enrollment': {
                    hidden: true,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    name: 'EnrollmentDay',
                    label: 'Study months relative to enrollment',
                    description: 'The number of calendar months relative to the visit where the enrollment was scheduled for the subject\'s assigned treatment group.',
                    type: 'DOUBLE'
                },
                // include discrete versions of the timepoint variables for the plot color variable selector
                'cds_GridBase_Days_Discrete': {
                    sortOrder: 9,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: false,
                    name: Connector.studyContext.protocolDayColumn,
                    label: 'Study days',
                    description: 'The number of calendar days relative to Day 0, where Day 0 is typically defined as enrollment and/or first vaccination.',
                    type: 'INTEGER',
                    variableType: 'TIME',
                    isDiscreteTime: true
                },
                'cds_GridBase_Weeks_Discrete': {
                    sortOrder: 10,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: false,
                    name: Connector.studyContext.protocolDayColumn,
                    label: 'Study weeks',
                    description: 'The number of weeks relative to Day 0 (Week 0), where Day 0 is typically defined as enrollment and/or first vaccination.',
                    type: 'DOUBLE',
                    variableType: 'TIME',
                    isDiscreteTime: true
                },
                'cds_GridBase_Months_Discrete': {
                    sortOrder: 11,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: false,
                    name: Connector.studyContext.protocolDayColumn,
                    label: 'Study months',
                    description: 'The number of months relative to Day 0 (Month 0), where Day 0 is typically defined as enrollment and/or first vaccination.',
                    type: 'DOUBLE',
                    variableType: 'TIME',
                    isDiscreteTime: true
                },
                'cds_GridBase_Days_Discrete_Last_Vaccination': {
                    hidden: true,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: false,
                    name: 'LastVaccinationDay',
                    label: 'Study days relative to last vaccination',
                    description: 'The number of calendar days relative to the visit where the last vaccination was scheduled for the subject\'s assigned treatment group.',
                    type: 'INTEGER',
                    variableType: 'TIME',
                    isDiscreteTime: true
                },
                'cds_GridBase_Weeks_Discrete_Last_Vaccination': {
                    hidden: true,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: false,
                    name: 'LastVaccinationDay',
                    label: 'Study weeks relative to last vaccination',
                    description: 'The number of weeks relative to the visit where the last vaccination was scheduled for the subject\'s assigned treatment group.',
                    type: 'DOUBLE',
                    variableType: 'TIME',
                    isDiscreteTime: true
                },
                'cds_GridBase_Months_Discrete_Last_Vaccination': {
                    hidden: true,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: false,
                    name: 'LastVaccinationDay',
                    label: 'Study months relative to last vaccination',
                    description: 'The number of months relative to the visit where the last vaccination was scheduled for the subject\'s assigned treatment group.',
                    type: 'DOUBLE',
                    variableType: 'TIME',
                    isDiscreteTime: true
                },
                'cds_GridBase_Days_Discrete_First_Vaccination': {
                    hidden: true,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: false,
                    name: 'FirstVaccinationDay',
                    label: 'Study days relative to first vaccination',
                    description: 'The number of calendar days relative to the visit where the first vaccination was scheduled for the subject\'s assigned treatment group.',
                    type: 'INTEGER',
                    variableType: 'TIME',
                    isDiscreteTime: true
                },
                'cds_GridBase_Weeks_Discrete_First_Vaccination': {
                    hidden: true,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: false,
                    name: 'FirstVaccinationDay',
                    label: 'Study weeks relative to first vaccination',
                    description: 'The number of weeks relative to the visit where the first vaccination was scheduled for the subject\'s assigned treatment group.',
                    type: 'DOUBLE',
                    variableType: 'TIME',
                    isDiscreteTime: true
                },
                'cds_GridBase_Months_Discrete_First_Vaccination': {
                    hidden: true,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: false,
                    name: 'FirstVaccinationDay',
                    label: 'Study months relative to first vaccination',
                    description: 'The number of months relative to the visit where the first vaccination was scheduled for the subject\'s assigned treatment group.',
                    type: 'DOUBLE',
                    variableType: 'TIME',
                    isDiscreteTime: true
                },
                'cds_GridBase_Days_Discrete_Enrollment': {
                    hidden: true,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: false,
                    name: 'EnrollmentDay',
                    label: 'Study days relative to enrollment',
                    description: 'The number of calendar days relative to the visit where the enrollment was scheduled for the subject\'s assigned treatment group.',
                    type: 'INTEGER',
                    variableType: 'TIME',
                    isDiscreteTime: true
                },
                'cds_GridBase_Weeks_Discrete_Enrollment': {
                    hidden: true,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: false,
                    name: 'EnrollmentDay',
                    label: 'Study weeks relative to enrollment',
                    description: 'The number of calendar weeks relative to the visit where the enrollment was scheduled for the subject\'s assigned treatment group.',
                    type: 'DOUBLE',
                    variableType: 'TIME',
                    isDiscreteTime: true
                },
                'cds_GridBase_Months_Discrete_Enrollment': {
                    hidden: true,
                    schemaName: Connector.studyContext.gridBaseSchema,
                    queryName: Connector.studyContext.gridBase,
                    isMeasure: false,
                    name: 'EnrollmentDay',
                    label: 'Study months relative to enrollment',
                    description: 'The number of calendar months relative to the visit where the enrollment was scheduled for the subject\'s assigned treatment group.',
                    type: 'DOUBLE',
                    variableType: 'TIME',
                    isDiscreteTime: true
                },

                // recommended variables
                'study_ICS_pctpos_adj': {
                    isRecommendedVariable: true
                },
                'study_ICS_response_call': {
                    isRecommendedVariable: true
                },
                'study_ICS_functionality_score': {
                    defaultScale: 'LINEAR'
                },
                'study_ICS_polyfunctionality_score': {
                    defaultScale: 'LINEAR'
                },
                'study_ICS_study_prot': {
                    hidden: true
                },
                'study_NAb_titer_ID50': {
                    sortOrder: -1,
                    isRecommendedVariable: true
                },
                'study_NAb_nab_response_ID50': {
                    isRecommendedVariable: true,
                    isMeasure: false
                },
                'study_NAb_study_prot': {
                    hidden: true
                },
                'study_BAMA_mfi_delta': {
                    isRecommendedVariable: true
                },
                'study_BAMA_response_call': {
                    isRecommendedVariable: true
                },
                'study_BAMA_study_prot': {
                    hidden: true
                },
                'study_ELISPOT_mean_sfc': {
                    isRecommendedVariable: true
                },
                'study_ELISPOT_response_call': {
                    isRecommendedVariable: true
                },
                'study_ELISPOT_study_prot': {
                    hidden: true
                },
                'study_PKMAb_mab_concentration': {
                    isRecommendedVariable: true
                },
                'study_PKMAb_mab_mix_name_std': {
                    isRecommendedVariable: true
                },
                'study_Demographics_species': {
                    isRecommendedVariable: true
                },
                'study_Demographics_age_enrollment': {
                    isRecommendedVariable: true,
                    hidden: true
                },
                'study_Demographics_study_label': {
                    isRecommendedVariable: true
                },
                'study_Demographics_study_arm_summary': {
                    isRecommendedVariable: true
                },

                'study_NAb_nab_response_ID80': {
                    isMeasure: false
                },

                // hidden variables
                'study_ICS_assay_identifier': {
                    hidden: true
                },
                'study_ICS_ics_lab_source_key': {
                    hidden: true
                },
                'study_ICS_exp_assayid': {
                    hidden: true
                },
                'study_ICS_functional_marker_type': {
                    hidden: true
                },
                'study_ICS_protein_panel_protein_peptide_pool': {
                    hidden: true
                },
                'study_ICS_protein_panel_protein': {
                    hidden: true
                },
                'study_ICS_SubjectId': {
                    hidden: true
                },
                'study_ICS_SubjectVisit_Visit': {
                    hidden: true
                },
                'study_ICS_visit_day': {
                    hidden: true
                },
                'study_NAb_titer_ic50' : {
                    hidden: true
                },
                'study_NAb_titer_ic80' : {
                    hidden: true
                },
                'study_NAb_response_call' : {
                    hidden: true
                },
                'study_NAb_virus_insert_name' : {
                    hidden: true
                },
                'study_NAb_assay_identifier': {
                    hidden: true
                },
                'study_NAb_exp_assayid': {
                    hidden: true
                },
                'study_NAb_nab_lab_source_key': {
                    hidden: true
                },
                'study_NAb_tier_clade_virus': {
                    hidden: true
                },
                'study_NAb_SubjectId': {
                    hidden: true
                },
                'study_NAb_SubjectVisit_Visit': {
                    hidden: true
                },
                'study_NAb_visit_day': {
                    hidden: true
                },
                'study_BAMA_assay_identifier': {
                    hidden: true
                },
                'study_BAMA_bama_lab_source_key': {
                    hidden: true
                },
                'study_BAMA_exp_assayid': {
                    hidden: true
                },
                'study_BAMA_SubjectId': {
                    hidden: true
                },
                'study_BAMA_SubjectVisit_Visit': {
                    hidden: true
                },
                'study_BAMA_visit_day': {
                    hidden: true
                },
                'study_ELISPOT_assay_identifier': {
                    hidden: true
                },
                'study_ELISPOT_protein_panel_protein_peptide_pool': {
                    hidden: true
                },
                'study_ELISPOT_protein_panel_protein': {
                    hidden: true
                },
                'study_ELISPOT_els_ifng_lab_source_key': {
                    hidden: true
                },
                'study_ELISPOT_exp_assayid': {
                    hidden: true
                },
                'study_ELISPOT_functional_marker_type': {
                    hidden: true
                },
                'study_ELISPOT_SubjectId': {
                    hidden: true
                },
                'study_ELISPOT_SubjectVisit_Visit': {
                    hidden: true
                },
                'study_ELISPOT_visit_day': {
                    hidden: true
                },
                'study_PKMAb_assay_identifier': {
                    hidden: true
                },
                'study_PKMAb_hours_post_initial_infusion': {
                    hidden: true
                },
                'study_PKMAb_hours_post_recent_infusion': {
                    hidden: true
                },
                'study_PKMAb_study_prot': {
                    hidden: true
                },
                'study_PKMAb_SubjectId': {
                    hidden: true
                },
                'study_PKMAb_SubjectVisit_Visit': {
                    hidden: true
                },
                'study_PKMAb_visit_day': {
                    hidden: true
                },
                'study_Demographics_bmi_enrollment': {
                    hidden: true
                },
                'study_Demographics_study_arm': {
                    hidden: true
                },
                'study_Demographics_study_first_enr_date': {
                    hidden: true
                },
                'study_Demographics_study_fu_complete_date': {
                    hidden: true
                },
                'study_Demographics_study_public_date': {
                    hidden: true
                },
                'study_Demographics_study_start_date': {
                    hidden: true
                },
                'study_Demographics_subspecies': {
                    hidden: true
                },
                'study_Demographics_SubjectVisit_Visit': {
                    hidden: true
                }
            }
        }
    }
});