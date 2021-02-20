/*
 * Copyright (c) 2014-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.cube.Configuration', {
    statics : {

        //
        // Dimensions are looked up by their 'uniqueName' property.
        //
        // Dimensions:
        //      singularName    - Declare a singular name for this dimension. Defaults to name value.
        //      pluralName      - Declare a plural name for this dimension. Defaults to name value.
        //      friendlyName    - Declare a friendly, possibly more contextual, name for this dimension. Defaults to name value.
        //      hidden          - declare whether a dimension is hidden. Defaults to false.
        //      itemDetail      - A specific view configuration for the learn about pages. Defaults to undefined.
        //      itemDetailTabs  - An array of tab names used in learn views. Requires itemDetail. Defaults to undefined.
        //      priority        - relative priority to be shown in displays. A value of 0 would show on top. Default is 200.
        //      querySchema     - metadata member query schema. Defaults to undefined.
        //      supportsDetails - Learn About views are supported for this dimension. If true, additional view configuration is required. Default is false.
        //      supportsSummary - summary views are supported for this dimension. defaults to true but respects hidden.
        //      summaryTargetLevel - specify the default level to go to when select from find subjects summary view. Defaults to first hierarchy, second level.
        //      defaultOperator - AND/OR/REQ_AND/REQ_OR. Defaults to AND.
        //      showOperator    - hide operator in info pane if false. Default is true.
        //      filterType      - The default way of filtering for this dimension. Options are COUNT/WHERE. Defaults to COUNT.
        //      findSubjectSummaryLevel - Specify the level to count for this dimension for Find subjects. Defaults to first hierarchy, second level.
        //
        // Hierarchies:
        //      hidden          - declare whether a hierarchy is hidden. Defaults to false.
        //      supportsSummary - summary views are supported for this hierarchy. defaults to true but respects hidden.
        //      defaultOperator - AND/OR/REQ_AND/REQ_OR. Defaults to dimensions value.
        //      displayLevels   - Views that support this property will display the levels of this hierarchy rather than the hierarchy itself. Default is false.
        //      filterType      - The default way of filtering for this hierarchy. Options are COUNT/WHERE. Defaults to dimensions value.
        //      findSubjectSubSummaryLevel - Specify the level to count for this hierarchy for Find subjects, will use second level if undefined. Default is undefined.
        //      label           - Default is parsed name.
        //      showOperator    - hide operator in info pane if false. Default to dimensions value.
        //
        // Levels:
        //      activeCount     - false/true/highlight. Default is false.
        //      activeCountLink - declare whether an 'activeCount' level exposes navigation. false/true. Default is true.
        //      cellbased       - Specific to how the query response is handled to this level. Defaults to true.
        //      countPriority   - Default is 0.
        //      countSingular   - The count label displayed when there is one match. Default is undefined.
        //      countPlural     - The count label displayed when there are zero/multiple matches. Default is undefined.
        //      defaultOperator - AND/OR/REQ_AND/REQ_OR. Defaults to hierarchies value.
        //      filterType      - The default way of filtering for this level. Options are COUNT/WHERE. Defaults to hierarchy's value.
        //      hidden          - Allow a level to be hidden. Note, sometimes it is not possible to hide a level (e.g. nested bar). Defaults to false.
        //      levelLabel      - Default is the parsed name, only used when the current hierarchy supports displayLevels.
        //      lookupDimension - Specify a dimension to look up learn about pages if the level's elements belong to different dimension than the parent. For example a study level in the assay dimension. Default is undefined.
        //      plotBasedCount  - false/true whether this is a plot specific info pane count. Default is false.
        //      prependParent   - If true then prepend parent level when displaying in info pane. Default is false.
        //      showOperator    - hide operator in info pane if false. Default to hierarchies value.
        //      supportsLearn   - Whether or not the elements in the level are backed by learn about pages. Defaults to false.
        //

        context: {
            dimensions: [{
                uniqueName: '[Measures]',
                hidden: true
            },{
                uniqueName: '[Subject]',
                supportsDetails: false,
                pluralName: 'Subject characteristics',
                summaryTargetLevel: '[Subject.Species].[Species]',
                findSubjectSummaryLevel: '[Subject.Species].[Species]',
                priority: 0,
                defaultOperator: 'OR',
                showOperator: false,
                hierarchies: [{
                    uniqueName: '[Subject]',
                    hidden: true,
                    levels: [{
                        uniqueName: '[Subject].[(All)]',
                        activeCount: 'highlight',
                        activeCountLink: false,
                        countPriority: 0,
                        countSingular: 'Subject',
                        countPlural: 'Subjects',
                        cellbased: false
                    }]
                },{
                    uniqueName: '[Subject.Sex]',
                    defaultOperator: 'REQ_OR',
                    label: 'Sex at birth',
                    levels: [{
                        uniqueName: '[Subject.Sex].[Sex]',
                        countSingular: 'Sex',
                        countPlural: 'Sexes'
                    }]
                },{
                    uniqueName: '[Subject.Race]',
                    defaultOperator: 'OR',
                    label: 'Race',
                    levels: [{
                        uniqueName: '[Subject.Race].[Race]',
                        countSingular: 'Race',
                        countPlural: 'Races'
                    }]
                },{
                    uniqueName: '[Subject.Country]',
                    label: 'Country at enrollment',
                    levels: [{
                        uniqueName: '[Subject.Country].[Country]',
                        countSingular: 'Country',
                        countPlural: 'Countries'
                    }]
                },{
                    uniqueName: '[Subject.Ethnicity]',
                    label: 'Hispanic or Latino origin',
                    levels: [{
                        uniqueName: '[Subject.Ethnicity].[Ethnicity]',
                        countSingular: 'Ethnicity',
                        countPlural: 'Ethnicities'
                    }]
                },{
                    uniqueName: '[Subject.Species]',
                    levels: [{
                        uniqueName: '[Subject.Species].[Species]',
                        activeCount: true,
                        countPriority: 15,
                        countSingular: 'Species',
                        countPlural: 'Species'
                    }]
                },{
                    uniqueName: '[Subject.Age]',
                    levels: [{
                        uniqueName: '[Subject.Age].[Age]',
                        countSingular: 'Decade by Age',
                        countPlural: 'Decades by Age'
                    }]
                },{
                    uniqueName: '[Subject.Circumcised]',
                    label: 'Circumcised at enrollment',
                    levels: [{
                        uniqueName: '[Subject.Circumcised].[Circumcised]',
                        countSingular: 'Circumcision category',
                        countPlural: 'Circumcision categories'
                    }]
                },{
                    uniqueName: '[Subject.BMI]',
                    label: 'BMI category',
                    levels: [{
                        uniqueName: '[Subject.BMI].[BMI]',
                        countSingular: 'BMI category',
                        countPlural: 'BMI categories'
                    }]
                },{
                    uniqueName: '[Subject.GenderIdentity]',
                    label: 'Gender identity',
                    levels: [{
                        uniqueName: '[Subject.GenderIdentity].[GenderIdentity]',
                        countSingular: 'Gender identity',
                        countPlural: 'Gender identities'
                    }]
                },{
                    uniqueName: '[Subject.Cohort]',
                    label: 'Study cohort',
                    levels: [{
                        uniqueName: '[Subject.Cohort].[Cohort]',
                        countSingular: 'Study cohort',
                        countPlural: 'Study cohorts'
                    }]
                }]
            },{
                uniqueName: '[Study]',
                pluralName: 'Studies',
                priority: 40,
                defaultOperator: 'OR',
                summaryTargetLevel: '[Study.Treatment].[Arm]',
                findSubjectSummaryLevel: '[Study.Treatment].[Treatment]',
                showOperator: false,

                hierarchies: [{
                    uniqueName: '[Study]',
                    label: 'Name',
                    hidden: true
                },{
                    uniqueName: '[Study.Treatment]',
                    label: 'Treatment Summary',
                    displayLevels: true,
                    findSubjectSubSummaryLevel: '[Study.Treatment].[Arm]',
                    levels: [{
                        uniqueName: '[Study.Treatment].[Treatment]',
                        activeCount: 'highlight',
                        countPriority: 30,
                        countSingular: 'Study',
                        countPlural: 'Studies',
                        levelLabel: 'Name',
                        supportsLearn: true
                    },{
                        uniqueName: '[Study.Treatment].[Arm]',
                        countTarget: '',
                        activeCount: true,
                        countPriority: 40,
                        countSingular: 'Treatment',
                        countPlural: 'Treatments',
                        levelLabel: 'Treatment Summary',
                        supportsLearn: true,
                        prependParent: true
                    }]
                },{
                    uniqueName: '[Study.Treatment Arm Coded Label]',
                    displayLevels: true,
                    findSubjectSubSummaryLevel: '[Study.Treatment Arm Coded Label].[Treatment Arm Coded Label]',
                    levels: [{
                        uniqueName: '[Study.Treatment Arm Coded Label].[Name]',
                        hidden: true
                    },{
                        uniqueName: '[Study.Treatment Arm Coded Label].[Treatment Arm Coded Label]',
                        countSingular: 'Coded Label',
                        countPlural: 'Coded Labels',
                        prependParent: true
                    }]
                },{
                    uniqueName: '[Study.Type]',
                    label: 'Study Type',
                    levels: [{
                        uniqueName: '[Study.Type].[Type]',
                        countSingular: 'Study Type',
                        countPlural: 'Study Types'
                    },{
                        uniqueName: '[Study.Type].[Name]',
                        supportsLearn: true
                    }]
                },{
                    uniqueName: '[Study.Network]',
                    levels:[{
                        uniqueName: '[Study.Network].[Network]',
                        countSingular: 'Network',
                        countPlural: 'Networks'
                    },{
                        uniqueName: '[Study.Network].[Name]',
                        supportsLearn: true
                    }]
                }],

                supportsDetails: true,
                detailCollection: 'Connector.app.store.Study',
                detailModel: 'Connector.app.model.Study',
                detailView: 'Connector.app.view.Study',
                itemDetailTabs: [{
                    url: 'overview',
                    isDefault: true,
                    label: 'Overview'
                }],
                itemDetail: [{
                    view: 'Connector.app.view.ModuleContainer',
                    modules: [[{
                        type: 'studyheader',
                        staticData: {
                            title: 'Study information'
                        }
                    },{
                        type: 'text',
                        staticData: {
                            title: 'Title'
                        },
                        modelData: {
                            text: 'study_title'
                        }
                    },{
                        type: 'html',
                        staticData: {
                            title: 'Description'
                        },
                        modelData: {
                            text: 'description'
                        }
                    },{
                        type: 'text',
                        staticData: {
                            title: 'Population'
                        },
                        modelData: {
                            text: 'population'
                        }
                    },{
                        type: 'html',
                        staticData: {
                            title: 'Objectives'
                        },
                        modelData: {
                            text: 'objectives'
                        }
                    },{
                        type: 'html',
                        staticData: {
                            title: 'Rationale'
                        },
                        modelData: {
                            text: 'rationale'
                        }
                    },{
                        type: 'treatmentschemagroup',
                        staticData: {
                            title: 'Groups'
                        },
                        modelData: {
                            text: 'groups_treatment_schema'
                        }
                    },{
                        type: 'assayschemamethod',
                        staticData: {
                            title: 'Methods'
                        },
                        modelData: {
                            text: 'methods_assay_schema'
                        }
                    },{
                        type: 'html',
                        staticData: {
                            title: 'Findings'
                        },
                        modelData: {
                            text: 'findings'
                        }
                    },{
                        type: 'html',
                        staticData: {
                            title: 'Conclusions'
                        },
                        modelData: {
                            text: 'conclusions'
                        }
                    },{
                        type: 'studypublications',
                        staticData: {
                            title: 'Publications'
                        },
                        modelData: {
                            text: 'publications'
                        }
                    },{
                        type: 'html',
                        staticData: {
                            title: 'DataSpace editorial'
                        },
                        modelData: {
                            text: 'context'
                        }
                    },{
                        type: 'studysites',
                        staticData: {
                            title: 'Sites'
                        }
                    }],[{
                        type: 'contactcds',
                        staticData: {
                            title: 'Contact information'
                        }
                    },{
                        type: 'studyresources',
                        staticData: {
                            title: 'Other study resources'
                        }
                    },{
                        type: 'studyproducts',
                        staticData: {
                            title: 'Products'
                        }
                    },{
                        type: 'studyrelationships',
                        staticData: {
                            title: 'Related studies'
                        }
                    },{
                        type: 'dataavailability',
                        staticData: {
                            title: 'Integrated data',
                            dataField: 'assays',
                            dataLink: 'Assay',
                            instructions: 'Visualize subject-level data in Plot or export from Grid. For mAb data, go to Monoclonal antibodies.'
                        }
                    }, {
                        type: 'studynonintegrateddata',
                        staticData: {
                            title: 'Non-integrated data',
                            instructions: 'Download individual files'
                        }
                     }, {
                        type: 'studyreports',
                        staticData: {
                            title: "Reports"
                        }
                    }, {
                        type: 'studymabs',
                        staticData: {
                            title: 'Monoclonal antibodies'
                        }
                    }, {
                        type: 'interactivereports',
                        staticData: {
                            title: 'Interactive reports'
                        }
                    }, {
                        type: 'curatedgroups',
                        staticData: {
                            title: 'Curated groups and plots'
                        }
                    }
                    ]]
                }]
            },{
                uniqueName: '[Study Product]',
                priority: 20,
                friendlyName: 'Subjects given study products',
                singularName: 'Study product',
                pluralName: 'Products',
                summaryTargetLevel: '[Study Product.Product Name].[Product Name]',
                findSubjectSummaryLevel: '[Study Product.Product Name].[Product Name]',
                defaultOperator: 'OR',
                hierarchies: [{
                    uniqueName: '[Study Product.Product Name]',
                    label: 'Name',
                    hidden: false,
                    levels: [{
                        uniqueName: '[Study Product.Product Name].[Product Name]',
                        activeCount: true,
                        countPriority: 30,
                        countSingular: 'Product',
                        countPlural: 'Products',
                        supportsLearn: true
                    }]
                },{
                    uniqueName: '[Study Product.Product Type]',
                    levels: [{
                        uniqueName: '[Study Product.Product Type].[Product Type]',
                        countSingular: 'Type',
                        countPlural: 'Types'
                    },{
                        uniqueName: '[Study Product.Product Type].[Name]',
                        supportsLearn: true
                    }]
                },{
                    uniqueName: '[Study Product.Developer]',
                    levels: [{
                        uniqueName: '[Study Product.Developer].[Developer]',
                        countSingular: 'Developer',
                        countPlural: 'Developers'
                    },{
                        uniqueName: '[Study Product.Developer].[Name]',
                        supportsLearn: true
                    }]
                },{
                    uniqueName: '[Study Product.Product Class]',
                    levels: [{
                        uniqueName: '[Study Product.Product Class].[Product Class]',
                        countSingular: 'Class',
                        countPlural: 'Classes'
                    },{
                        uniqueName: '[Study Product.Product Class].[Name]',
                        supportsLearn: true
                    }]
                }],
                supportsDetails: true,
                detailCollection: 'Connector.app.store.StudyProducts',
                detailModel: 'Connector.app.model.StudyProducts',
                detailView: 'Connector.app.view.StudyProducts',
                itemDetailTabs: [{
                    url: 'overview',
                    isDefault: true,
                    label: 'Overview'
                }],
                itemDetail: [{
                    view: 'Connector.app.view.ModuleContainer',
                    modules: [[{
                        type: 'productheader',
                        staticData: {
                            title: 'Product information'
                        }
                    },{
                        type: 'html',
                        staticData: {
                            title: 'Description'
                        },
                        modelData: {
                            text: 'product_description'
                        }
                    }],[{
                        type: 'dataavailability',
                        staticData: {
                            title: 'Integrated data',
                            dataField: 'studies',
                            dataLink: 'Study',
                            instructions: 'Visualize subject-level data in Plot or export from Grid. Additional data may be available. See study page.'
                        }
                    },{
                        type: 'productotherproducts',
                        staticData: {
                            title: 'Used with other products'
                        }
                    }]]
                }]
            },{
                uniqueName: '[Assay]',
                priority: 30,
                singularName: 'Assay',
                pluralName: 'Assays',
                summaryTargetLevel: '[Assay.Study].[Study]',
                findSubjectSummaryLevel: '[Assay.Name].[Assay]',
                hierarchies: [{
                    uniqueName: "[Assay.Name]",
                    label: "Assay Type",
                    findSubjectSubSummaryLevel: '[Assay.Name].[Assay Type]',
                    levels: [{
                        uniqueName: '[Assay.Name].[Assay Type]',
                        countSingular: 'Type',
                        countPlural: 'Types'
                    },{
                        uniqueName: '[Assay.Name].[Assay]',
                        supportsLearn: true
                    }]
                },{
                    uniqueName: '[Assay.Study]',
                    findSubjectSubSummaryLevel: '[Assay.Study].[Study]',
                    levels: [{
                        uniqueName: '[Assay.Study].[Assay]',
                        supportsLearn: true
                    },{
                        uniqueName: '[Assay.Study].[Study]',
                        supportsLearn: true,
                        lookupDimension: '[Study]',
                        countSingular: 'Study',
                        countPlural: 'Studies'
                    }]
                },{
                    uniqueName: '[Assay.Lab]',
                    findSubjectSubSummaryLevel: '[Assay.Lab].[Lab]',
                    levels: [{
                        uniqueName: '[Assay.Lab].[Assay]',
                        supportsLearn: true
                    },{
                        uniqueName: '[Assay.Lab].[Lab]',
                        countSingular: 'Lab',
                        countPlural: 'Labs'
                    }]
                },{
                    uniqueName: '[Assay.Immunogenicity Type]',
                    levels: [{
                        uniqueName: '[Assay.Immunogenicity Type].[Immunogenicity Type]',
                        countSingular: 'Immunogenicity Type',
                        countPlural: 'Immunogenicity Types'
                    },{
                        uniqueName: '[Assay.Immunogenicity Type].[Assay]',
                        supportsLearn: true
                    }]
                }],

                supportsDetails: true,
                detailCollection: 'Connector.app.store.Assay',
                detailModel: 'Connector.app.model.Assay',
                detailView: 'Connector.app.view.Assay',
                itemDetailTabs: [{
                    url: 'overview',
                    isDefault: true,
                    label: 'Overview'
                },{
                    url: 'vars',
                    label: 'Variables',
                    hasSearch: true
                },{
                    url: 'antigens',
                    label: 'Antigens',
                    hasSearch: true,
                    matchField: 'hasAntigen' // assay.hasAntigen must be true for tab to show up
                }],
                itemDetail: [{
                    view: 'Connector.app.view.ModuleContainer',
                    modules: [[{
                        type: 'assayheader',
                        staticData: {
                            title: 'Assay information'
                        }
                    },{
                        type: 'assayanalytelist',
                        staticData: {
                            title: 'Assay dimensions'
                        }
                    },{
                        type: 'html',
                        staticData: {
                            title: 'Description'
                        },
                        modelData: {
                            text: 'assay_description'
                        }
                    },{
                        type: 'text',
                        staticData: {
                            title: 'Method description'
                        },
                        modelData: {
                            text: 'assay_method_description'
                        }
                    },{
                        type: 'text',
                        staticData: {
                            title: 'Endpoint description'
                        },
                        modelData: {
                            text: 'assay_endpoint_description'
                        }
                    }],[{
                        type: 'contactcds',
                        staticData: {
                            title: 'Contact information'
                        }
                    },{
                        type: 'dataavailability',
                        staticData: {
                            title: 'Integrated data',
                            dataField: 'studies',
                            dataLink: 'Study',
                            instructions: 'Visualize subject-level data in Plot or export from Grid',
                            nabMabInstructions: 'Go to Monoclonal antibodies to visualize or export mAb data'
                        }
                    }]]
                },{
                    view: 'Connector.view.module.VariableList'
                },{
                    view: 'Connector.view.AssayAntigen'
                }]
            },{
                uniqueName: '[Report]',
                priority: 2,
                singularName: 'Report',
                pluralName: 'Reports',
                hidden: false,
                supportsSummary: false, // doesn't show up in Find subjects
                supportsDetails: true, // should show up in Learn about
                detailCollection: 'Connector.app.store.Report',
                detailModel: 'Connector.app.model.Report',
                detailView: 'Connector.app.view.Report',
                itemDetailTabs: [{
                    url: 'overview',
                    isDefault: true,
                    label: 'Overview'
                }],
                itemDetail: [{
                    view: 'Connector.app.view.ReportModuleContainer'
                }]
            }, {
                uniqueName: '[MAb]',
                priority: 3,
                singularName: 'MAb',
                pluralName: 'MAbs',
                hidden: false,
                supportsSummary: false,
                supportsDetails: true,
                detailCollection: 'Connector.app.store.MAb',
                detailModel: 'Connector.app.model.MAb',
                detailView: 'Connector.app.view.MAb',
                itemDetailTabs: [{
                    url: 'overview',
                    isDefault: true,
                    upText: 'Monoclonal Antibodies',
                    label: 'Overview'
                }],
                itemDetail: [{
                    view: 'Connector.app.view.ModuleContainer',
                    isIdString: true,
                    modules: [[{
                        type: 'mabdetails',
                        staticData: {
                            title: 'Monoclonal antibody information'
                        }
                    }],[{
                        type: 'dataavailability',
                        staticData: {
                            title: 'Integrated data',
                            dataField: 'studies',
                            dataLink: 'Study',
                            hasGrouping: true,
                            groupDir: 'DESC'
                        }
                    }]]
                }]
            }, {
                uniqueName: '[Publication]',
                priority: 1,
                singularName: 'Publication',
                pluralName: 'Publications',
                hidden: false,
                supportsSummary: false,
                supportsDetails: true,
                detailCollection: 'Connector.app.store.Publication',
                detailModel: 'Connector.app.model.Publication',
                detailView: 'Connector.app.view.Publication',
                itemDetailTabs: [{
                    url: 'overview',
                    isDefault: true,
                    upText: 'Publication',
                    label: 'Overview'
                }],
                itemDetail: [{
                    view: 'Connector.app.view.ModuleContainer',
                    isIdString: true,
                    modules: [[{
                        type: 'publicationdetails',
                        staticData: {
                            title: 'Publication'
                        }
                    },{
                        type: 'html',
                        staticData: {
                            title: 'Title'
                        },
                        modelData: {
                            text: 'publication_title'
                        }
                    },{
                        type: 'html',
                        staticData: {
                            title: 'Authors'
                        },
                        modelData: {
                            text: 'author_all'
                        }
                    }],[{
                        type: 'dataavailability',
                        staticData: {
                            title: 'Integrated data for related studies',
                            dataField: 'studies',
                            dataLink: 'Study',
                            instructions: 'Go to Plot to view or Grid to export.  Additional non-integrated data files may be available for download. See study page.'
                        }
                    },{
                        type: 'publicationnonintegrateddata',
                        staticData: {
                            title: 'Publication data',
                            instructions: 'Download files'
                        }
                    },{
                        type: 'interactivereports',
                        staticData: {
                            title: 'Interactive reports'
                        }
                    },{
                        type: 'curatedgroups',
                        staticData: {
                            title: 'Curated groups and plots'
                        }
                    }]]
                }]
            }]
        },

        defaults: {
            dimension: {
                singularName: 'prop::name', // defaults to dim.name
                pluralName: 'prop::name', // defaults to dim.name
                friendlyName: 'prop::name', // defaults to dim.name
                hidden: false,
                priority: 200,
                querySchema: undefined,
                supportsDetails: false,
                supportsSummary: true,
                summaryTargetLevel: 'path::0|1',
                detailCollection: undefined,
                detailModel: undefined,
                detailView: undefined,
                itemDetail: undefined,
                itemDetailTabs: undefined,
                defaultOperator: 'AND',
                filterType: 'COUNT',
                findSubjectSummaryLevel: 'path::0|1',
                showOperator: true
            },
            hierarchy: {
                hidden: false,
                supportsSummary: true,
                defaultOperator: 'parent::defaultOperator',
                displayLevels: false,
                label: 'label::',
                filterType: 'parent::filterType',
                findSubjectSubSummaryLevel: undefined,
                showOperator: 'parent::showOperator'
            },
            level: {
                activeCount: false,
                activeCountLink: true,
                plotBasedCount: false,
                countPriority: 0,
                countSingular: undefined,
                countPlural: undefined,
                cellbased: true,
                defaultOperator: 'parent::defaultOperator',
                filterType: 'parent::filterType',
                hidden: false,
                supportsLearn: false,
                lookupDimension: undefined,
                prependParent: false,
                levelLabel: 'label::',
                showOperator: 'parent::showOperator'
            }
        }
    }
});

Ext4.define('Connector.cube.Loader', {

    singleton: true,

    _cube: undefined,
    _loaded: false,

    defaultConfig: {
        deferLoad: true,
        defaultCube: {
            configId: 'CDS:/CDS',
            schemaName: 'CDS',
            name: 'DataspaceCube'
        },
        defaultContext: {
            defaults: Connector.cube.Configuration.defaults,
            values: Connector.cube.Configuration.context
        }
    },

    getCube : function(callback, scope, doLoad) {
        var me = this;
        Ext4.onReady(function() {
            if (!Ext4.isDefined(me._cube)) {
                Ext4.Ajax.request({
                    url : LABKEY.ActionURL.buildURL('olap', 'getActiveAppConfig'),
                    method : 'POST',
                    success: LABKEY.Utils.getCallbackWrapper(function(response){

                        var config = Ext4.apply(me.defaultConfig, response.config);
                        me._cube = LABKEY.query.olap.CubeManager.getCube(config);

                        if (doLoad === true && !me._loaded) {
                            me._loaded = true;
                            me._cube.load();
                        }

                        if (Ext4.isFunction(callback)) {
                            callback.call(scope, me._cube);
                        }

                    }, me)
                });
            }
            else if (Ext4.isFunction(callback)) {
                callback.call(scope, me._cube);
            }
        }, me);
    }
});