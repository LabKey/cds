/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.measure.Configuration', {
    statics: {
        context: {

            // override information about sources defined by the server
            sources: {
                //'study|Demographics': {
                //    queryLabel: 'Subject Characteristics'
                //},
                'study|SubjectVisit': {
                    queryLabel: 'Time points'
                },
                'study|SubjectGroupMap': {
                    queryLabel: 'User groups'
                }
            },

            dimensions: {
                'study_Demographics_SubjectId': {
                    hidden: true
                },
                'study_Lab Results_SubjectId': {
                    hidden: true
                },
                'study_Demographics_DataSets': {
                    hidden: true
                },
                'study_Lab Results_DataSets': {
                    hidden: true
                }
            },

            // override information about a measure by alias
            // OR declare a measure. All measures defined here will be added and assumed to be understood
            // by the server
            measures: {
                'Days': {
                    alias: 'Days',
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
                    alias: 'Weeks',
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
                    alias: 'Months',
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
                    alias: 'SavedGroups',
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
                'study_Demographics_Height': {
                    dimensions: ['study_Demographics_EnrolledClinicalSite']
                }
            }
        }
    }
});