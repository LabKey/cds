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
                    queryLabel: 'Time points',
                    queryDescription: 'Creates a categorical x axis, unlike the other time axes that are ordinal.'
                },
                'study|SubjectGroupMap': {
                    queryLabel: 'User groups',
                    queryDescription: 'Creates a categorical x axis of the selected user groups'
                },
                'study|Ad5': {
                    category: 'Assays'
                },
                'study|Demographics': {
                    queryLabel: 'Subject characteristics'
                },
                'study|ICS': {
                    category: 'Assays',
                    dimensions: [
                        'study_ICS_cell_type',
                        'study_ICS_functional_marker_name',
                        'study_ICS_summary_level',
                        'study_ICS_antigen',
                        'study_ICS_specimen_type',
                        'study_ICS_lab_code'
                    ]
                },
                'study|NAb': {
                    category: 'Assays',
                    dimensions: [
                        'study_NAb_target_cell',
                        'study_NAb_summary_level',
                        'study_NAb_neutralization_tier',
                        'study_NAb_specimen_type',
                        'study_NAb_lab_code'
                    ]
                },
                'study|BAMA': {
                    category: 'Assays',
                    dimensions: [
                        'study_BAMA_antigen_isotype',
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
                        'study_ELISPOT_protein_panel',
                        'study_ELISPOT_specimen_type',
                        'study_ELISPOT_lab_code'
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
                'study_ICS_antigen': {
                    requiresSelection: true,
                    hierarchicalSelectionChild: 'study_ICS_protein'
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
                'study_NAb_neutralization_tier': {
                    requiresSelection: true,
                    hierarchicalSelectionChild: 'study_NAb_clade'
                },
                'study_NAb_clade': {
                    hierarchicalSelectionChild: 'study_NAb_antigen'
                },
                // study|BAMA
                'study_BAMA_antigen_isotype': {
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
                    hierarchicalSelectionChild: null
                },
                'study_BAMA_dilution': {
                    requiresSelection: true,
                    allowMultiSelect: false,
                    defaultSelection: {all: false}
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
                    defaultSelection: {all: false, value: 'Protein Panel'}
                },
                'study_ELISPOT_protein_panel': {
                    requiresSelection: true,
                    hierarchicalSelectionChild: 'study_ELISPOT_protein'
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
                    name: Connector.studyContext.protocolDayColumn,
                    label: 'Study days',
                    type: 'INTEGER',
                    description:  'Creates a categorical x axis, unlike the other time axes that are ordinal. Each visit with data for the y axis is labeled separately with its study day.',
                    variableType: 'TIME'
                },
                'Weeks': {
                    sortOrder: -3,
                    schemaName: Connector.studyContext.schemaName,
                    queryName: Connector.studyContext.subjectVisit,
                    inNotNullSet: false,
                    name: Connector.studyContext.protocolDayColumn,
                    label: 'Study weeks',
                    type: 'DOUBLE',
                    description: 'Creates a categorical x axis, unlike the other time axes that are ordinal. Each visit with data for the y axis is labeled separately with its study week.',
                    variableType: 'TIME'
                },
                'Months': {
                    sortOrder: -2,
                    schemaName: Connector.studyContext.schemaName,
                    queryName: Connector.studyContext.subjectVisit,
                    inNotNullSet: false,
                    name: Connector.studyContext.protocolDayColumn,
                    label: 'Study months',
                    type: 'DOUBLE',
                    description: 'Creates a categorical x axis, unlike the other time axes that are ordinal. Each visit with data for the y axis is labeled separately with its study month.',
                    variableType: 'TIME'
                },
                'SavedGroups': {
                    sortOrder: -1,
                    schemaName: Connector.studyContext.schemaName,
                    queryName: 'SubjectGroupMap',
                    inNotNullSet: false,
                    name: 'GroupId',
                    label: 'My saved groups',
                    description: 'Creates a categorical x axis of the selected saved groups',
                    type: 'VARCHAR',
                    isDemographic: true, // use this to tell the visualization provider to only join on Subject (not Subject and Visit)
                    variableType: 'USER_GROUPS'
                },

                'study_BAMA_antigen': {
                    label: 'Antigen'
                },
                'study_NAb_neutralization_tier': {
                    label: 'Tier'
                },
                'study_NAb_antigen': {
                    label: 'Isolate'
                }
            }
        }
    }
});