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
                'study|ICS': {
                    dimensions: [
                        {alias: 'study_ICS_cell_type'},
                        {alias: 'study_ICS_functional_marker_name'},
                        {alias: 'study_ICS_antigen_panel'},
                        {alias: 'study_ICS_specimen_type'},
                        {alias: 'study_ICS_lab'}
                    ]
                },
                'study|NAb': {
                    dimensions: [
                        {alias: 'study_NAb_assay_identifier'},
                        {alias: 'study_NAb_antigen_neutralization_tier'},
                        {alias: 'study_NAb_specimen_type'},
                        {alias: 'study_NAb_lab'}
                    ]
                },
                'study|BAMA': {
                    dimensions: [
                        {alias: 'study_BAMA_analyte'},
                        {alias: 'study_BAMA_antigen'},
                        {alias: 'study_BAMA_dilution'},
                        {alias: 'study_BAMA_detection_type'},
                        {alias: 'study_BAMA_instrument_type'},
                        {alias: 'study_BAMA_specimen_type'},
                        {alias: 'study_BAMA_lab'}
                    ]
                },
                'study|ELISPOT': {
                    dimensions: [
                        {alias: 'study_ELISPOT_functional_marker_name'},
                        {alias: 'study_ELISPOT_antigen'},
                        {alias: 'study_ELISPOT_specimen_type'},
                        {alias: 'study_ELISPOT_lab'}
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
                    defaultSelection: {all: false, value: 'CD4+ T-cell'}
                },
                'study_ICS_functional_marker_name': {
                    requiresSelection: true,
                    allowMultiSelect: false,
                    defaultSelection: {all: false}
                },
                'study_ICS_antigen_panel': {
                    requiresSelection: true,
                    hierarchicalSelectionChild: 'study_ICS_antigen_subpanel'
                },
                // study|NAb
                'study_NAb_assay_identifier': {
                    requiresSelection: true,
                    allowMultiSelect: false,
                    defaultSelection: {all: false, value: 'TZM-bl'}
                },
                'study_NAb_antigen_neutralization_tier': {
                    requiresSelection: true,
                    hierarchicalSelectionChild: 'study_NAb_antigen_isolate_clade'
                },
                'study_NAb_antigen_isolate_clade': {
                    hierarchicalSelectionChild: 'study_NAb_antigen_isolate_name'
                },
                // study|BAMA
                'study_BAMA_analyte': {
                    requiresSelection: true,
                    allowMultiSelect: false,
                    defaultSelection: {all: false}
                },
                'study_BAMA_antigen': {
                    requiresSelection: true
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
                'study_ELISPOT_antigen': {
                    requiresSelection: true,
                    hierarchicalSelectionChild: 'study_ELISPOT_antigen_subpanel'
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
                    queryLabel: 'Time points',
                    queryDescription: 'Creates a categorical x axis, unlike the other time axes that are ordinal.',
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
                    queryLabel: 'Time points',
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
                    queryLabel: 'Time points',
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
                    queryLabel: 'User groups',
                    inNotNullSet: false,
                    queryDescription: 'Creates a categorical x axis of the selected user groups',
                    name: 'GroupId',
                    label: 'My saved groups',
                    description: 'Creates a categorical x axis of the selected saved groups',
                    type: 'VARCHAR',
                    isDemographic: true, // use this to tell the visualization provider to only join on Subject (not Subject and Visit)
                    variableType: 'USER_GROUPS'
                },

                // Example overriding Advanced panel dimensions from the source. To be removed.
                'study_ELISPOT_specimen_type': {
                    dimensions: [{alias: 'study_ELISPOT_cell_type'}]
                }
            }
        }
    }
});