/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.cube.Configuration', {
    statics : {

        //
        // Dimensions are looked up by their 'uniqueName' property.
        //
        // Dimensions:
        //      singularName    - Declaure a singluar name for this dimension. Defaults to name value.
        //      pluralName      - Declaure a plural name for this dimension. Defaults to name value.
        //      friendlyName    - Declaure a friendly, possibly more contextual, name for this dimension. Defaults to name value.
        //      hidden          - declare whether a dimension is hidden. Defaults to false.
        //      priority        - relative priority to be shown in displays. Default is 0.
        //      querySchema     - metadata member query schema. Defaults to undefined.
        //      supportsDetails - multinoun views are supported for this dimension. defaults to false.
        //      supportsSummary - summary views are supported for this dimension. defaults to true but respects hidden.
        //      summaryTargetLevel - summary views will respect this levels count when querying. Defaults to first hierarchy, second level.
        //      defaultOperator - AND/OR/REQ_AND/REQ_OR. Defaults to AND.
        //
        // Hierarchies:
        //      hidden          - declare whether a hierarchy is hidden. Defaults to false.
        //      supportsSummary - summary views are supported for this hierarchy. defaults to true but respects hidden.
        //      defaultOperator - AND/OR/REQ_AND/REQ_OR. Defaults to dimensions value.
        //      label           - Default is parsed name.
        //
        // Levels:
        //      activeCount     - false/true/highlight. Default is false.
        //      activeCountLink - declare whether an 'activeCount' level exposes navigation. false/true. Default is true.
        //      dataBasedCount  - false/true. Default is false.
        //      countPriority   - Default is 0.
        //      countSingular   - The count label displayed when there is one match. Default is undefined.
        //      countPlural     - The count label displayed when there are zero/multiple matches. Default is undefined.
        //      defaultOperator - AND/OR/REQ_AND/REQ_OR. Defaults to hierarchies value.
        //
        context: {
            dimensions: [{
                uniqueName: '[Measures]',
                hidden: true
            },{
                uniqueName: '[Subject]',
                supportsDetails: false,
                pluralName: 'Subject characteristics',
                summaryTargetLevel: '[Subject].[Subject]',
                priority: 10,
                defaultOperator: 'OR',
                hierarchies: [{
                    uniqueName: '[Subject]',
                    hidden: true
                },{
                    uniqueName: '[Subject.Sex]',
                    defaultOperator: 'REQ_OR',
                    label: 'Sex at birth',
                    levels: [{
                        uniqueName: '[Subject.Sex].[Sex]',
                        activeCount: true,
                        countPriority: 10,
                        countSingular: 'Sex',
                        countPlural: 'Sexes'
                    }]
                },{
                    uniqueName: '[Subject.Race]',
                    defaultOperator: 'OR',
                    label: 'Race & Subtype',
                    levels: [{
                        uniqueName: '[Subject.Race].[Race]',
                        activeCount: true,
                        countPriority: 20,
                        countSingular: 'Race & subtype',
                        countPlural: 'Races & subtypes'
                    }]
                },{
                    uniqueName: '[Subject.Country]',
                    levels: [{
                        uniqueName: '[Subject.Country].[Country]',
                        countSingular: 'Country',
                        countPlural: 'Countries'
                    }]
                },{
                    uniqueName: '[Subject.Randomization]',
                    label: 'Randomization',
                    supportsSummary: false,
                    levels: [{
                        uniqueName: '[Subject.Randomization].[Randomization]',
                        countSingular: 'Randomization',
                        countPlural: 'Randomizations'
                    }]
                },{
                    uniqueName: '[Subject.Ad5grp]',
                    label: 'Baseline Ad5 titer category',
                    supportsSummary: false,
                    levels: [{
                        uniqueName: '[Subject.Ad5grp].[Ad5grp]',
                        countSingular: 'Baseline Ad5 titer category',
                        countPlural: 'Baseline Ad5 titer categories'
                    }]
                },{
                    uniqueName: '[Subject.Circumcised]',
                    label: 'Circumcision Status',
                    supportsSummary: false
                },{
                    uniqueName: '[Subject.Hivinf]',
                    label: 'HIV infection status',
                    levels: [{
                        uniqueName: '[Subject.Hivinf].[Hivinf]',
                        countSingular: 'HIV infection status',
                        countPlural: 'HIV infection statuses'
                    }]
                },{
                    uniqueName: '[Subject.PerProtocol]',
                    label: 'Protocol completion',
                    supportsSummary: false,
                    levels: [{
                        uniqueName: '[Subject.PerProtocol].[PerProtocol]',
                        countSingular: 'Protocol completion',
                        countPlural: 'Protocol completions'
                    }]
                },{
                    uniqueName: '[Subject.BmiGrp]',
                    label: 'Baseline BMI category',
                    supportsSummary: false,
                    levels: [{
                        uniqueName: '[Subject.BmiGrp].[BmiGrp]',
                        countSingular: 'Baseline BMI category',
                        countPlural: 'Baseline BMI categories'
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
                }]
            },{
                uniqueName: '[Vaccine]',
                singularName: 'Study product',
                pluralName: 'Study products',
                friendlyName: 'Subjects given study product',
                priority: 20,
                summaryTargetLevel: '[Vaccine.Type].[Name]',
                supportsDetails: true,
                detailCollection: 'Connector.app.store.StudyProducts',
                detailModel: 'Connector.app.model.StudyProducts',
                detailView: 'Connector.app.view.StudyProducts',

                itemDetail: {
                    view: 'Connector.app.view.ModuleContainer',
                    modules: [[{
                        type: 'productheader'
                    }, {
                        type: 'text',
                        staticData: {
                            title: 'Description'
                        },
                        modelData: {
                            text: 'Description'
                        }
                    }, {
                        type: 'productprovidedby',
                        staticData: {
                            title: 'Product provided by'
                        }
                    }, {
                        type: 'productmanufacturing',
                        staticData: {
                            title: 'Product manufacturing'
                        }
                    }], [{
                        type: 'productotherproducts',
                        staticData: {
                            title: 'Used with other products'
                        }
                    }, {
                        type: 'productstudies',
                        staticData: {
                            title: 'Studies where used'
                        }
                    }]]
                },
    
                hierarchies: [{
                    uniqueName: '[Vaccine.Name]',
                    hidden: true,
                    levels: [{
                        uniqueName: '[Vaccine.Name].[Name]',
                        activeCount: true,
                        countPriority: 40,
                        countSingular: 'Study Product',
                        countPlural: 'Study Products'
                    }]
                }]
            },{
                uniqueName: '[Vaccine Component]',
                pluralName: 'Vaccine immunogens',
                hidden: true
            },{
                uniqueName: '[Assay]',
                pluralName: 'Assays',
                priority: 40,
                summaryTargetLevel: '[Assay.Type].[Name]',
                supportsDetails: true,
                detailCollection: 'Connector.app.store.Assay',
                detailModel: 'Connector.app.model.Assay',
                detailView: 'Connector.app.view.Assay',

                itemDetail: [{
                    label: 'Overview',
                    content: {
                        view: 'Connector.app.view.ModuleContainer',
                            modules: [[{
                            type: 'assayheader'
                        }, {
                            type: 'text',
                            staticData: {
                                title: 'Description'
                            },
                            modelData: {
                                text: 'Summary'
                            }
                        }, {
                            type: 'text',
                            staticData: {
                                title: 'Endpoint Description'
                            },
                            modelData: {
                                text: 'Description'
                            }
                        }], [{
                            type: 'person',
                            staticData: {
                                title: 'Contact'
                            },
                            modelData: {
                                name: 'Contact'
                                // picture: 'MainContact.Portrait',
                                // line1: 'MainContact.Role',
                                // line2: 'MainContact.Team'
                            }
                        }, {
                            type: 'person',
                            staticData: {
                                title: 'Lead contributor'
                            },
                            modelData: {
                                name: 'LeadContributor'
                                // picture: 'MainContact.Portrait',
                                // line1: 'MainContact.Role',
                                // line2: 'MainContact.Team'
                            }
                        }]]
                    }
                }, {
                    label: 'Antigens, Analytes, Variables',
                    content: {
                        view: 'Connector.app.view.ModuleContainer',
                        modules: [[{
                            type: 'assayantigenlist',
                            staticData: {
                                title: 'Antigens'
                            }
                        }], [{
                            type: 'assayanalytelist',
                            staticData: {
                                title: 'Analytes'
                            }
                        }], [{
                            type: 'assayvariablelist',
                            staticData: {
                                title: 'Variables'
                            }
                        }]]
                    }
                }],

                hierarchies: [{
                    uniqueName: '[Assay.Name]',
                    supportsSummary: false,
                    levels: [{
                        uniqueName: '[Assay.Name].[Name]',
                        activeCount: 'highlight',
                        countPriority: 50,
                        countSingular: 'Assay',
                        countPlural: 'Assays'
                    }]
                },{
                    uniqueName: '[Assay.Type]',
                    levels: [{
                        uniqueName: '[Assay.Type].[Type]',
                        countSingular: 'Type',
                        countPlural: 'Types'
                    }]
                },{
                    uniqueName: '[Assay.Platform]',
                    levels: [{
                        uniqueName: '[Assay.Platform].[Platform]',
                        countSingular: 'Platform',
                        countPlural: 'Platforms'
                    }]
                }]
            },{
                uniqueName: '[Study]',
                pluralName: 'Studies',
                priority: 60,
                supportsDetails: true,
                detailCollection: 'Connector.app.store.Study',
                detailModel: 'Connector.app.model.Study',
                detailView: 'Connector.app.view.Study',
                defaultOperator: 'OR',

                hierarchies: [{
                    uniqueName: '[Study]',
                    label: 'Name',
                    levels: [{
                        uniqueName: '[Study].[(All)]',
                        activeCount: 'highlight',
                        activeCountLink: false,
                        countPriority: 0,
                        countSingular: 'Subject',
                        countPlural: 'Subjects',
                        cellbased: false
                    },{
                        uniqueName: '[Study].[Name]',
                        activeCount: 'highlight',
                        countPriority: 30,
                        countSingular: 'Study',
                        countPlural: 'Studies'
                    }]
                }],

                itemDetail: {
                    view: 'Connector.app.view.ModuleContainer',
                    modules: [[{
                        type: 'studyheader'
                    }, {
                        type: 'text',
                        staticData: {
                            title: 'Title'
                        },
                        modelData: {
                            text: 'Title'
                        }
                    }, {
                        type: 'text',
                        staticData: {
                            title: 'Description'
                        },
                        modelData: {
                            text: 'Description'
                        }
                    }, {
                        type: 'text',
                        staticData: {
                            title: 'CDS editorial'
                        },
                        modelData: {
                            text: 'Editorial'
                        }
                    }, {
                        type: 'text',
                        staticData: {
                            title: 'Study objectives'
                        },
                        modelData: {
                            text: 'Objectives'
                        }
                    }, {
                        type: 'text',
                        staticData: {
                            title: 'Population'
                        },
                        modelData: {
                            text: 'StudyPopulation'
                        }
                    }, {
                        type: 'studysites',
                        staticData: {
                            title: 'Sites'
                        }
                    }], [{
                        staticData: {
                            title: 'Contact information'
                        },
                        type: 'contactcds'
                    }, {
                        type: 'studyproducts',
                        staticData: {
                            title: 'Products'
                        }
                    }, {
                        type: 'studydatasets',
                        staticData: {
                            title: "Lab & clinical data"
                        }
                    }]]
                }
            },{
                uniqueName: '[Antigen]',
                pluralName: 'Assay antigens',
                priority: 0,
                supportsDetails: false,
                supportsSummary: false,
                summaryTargetLevel: '[Antigen.Name].[Name]',

                hierarchies: [{
                    uniqueName: '[Antigen.Name]',
                    supportsSummary: false,
                    levels: [{
                        uniqueName: '[Antigen.Name].[Name]',
                        activeCount: true,
                        dataBasedCount: true,
                        countPriority: 60,
                        countSingular: 'Antigen',
                        countPlural: 'Antigens'
                    }]
                },{
                    uniqueName: '[Antigen.Clade]',
                    levels: [{
                        uniqueName: '[Antigen.Clade].[Clade]',
                        countSingular: 'Clade',
                        countPlural: 'Clades'
                    }]
                },{
                    uniqueName: '[Antigen.Tier]',
                    levels: [{
                        uniqueName: '[Antigen.Tier].[Tier]',
                        countSingular: 'Tier',
                        countPlural: 'Tiers'
                    }]
                },{
                    uniqueName: '[Antigen.Sample Type]',
                    levels: [{
                        uniqueName: '[Antigen.Sample Type].[Sample Type]',
                        countSingular: 'Sample Type',
                        countPlural: 'Sample Types'
                    }]
                }]
            },{
                uniqueName: '[Lab]',
                pluralName: 'Labs',
                priority: 20,
                supportsDetails: false,
                supportsSummary: false,
                detailCollection: 'Connector.app.store.Labs',
                detailModel: 'Connector.app.model.Labs',
                detailView: 'Connector.app.view.Labs',

                hierarchies: [{
                    uniqueName: '[Lab]',
                    label: 'Name',
                    levels: [{
                        uniqueName: '[Lab].[Name]',
                        activeCount: true,
                        dataBasedCount: true,
                        countPriority: 70,
                        countSingular: 'Lab',
                        countPlural: 'Labs'
                    }]
                }]
            }]
        },

        defaults: {
            dimension: {
                singularName: 'prop::name', // defaults to dim.name
                pluralName: 'prop::name', // defaults to dim.name
                friendlyName: 'prop::name', // defaults to dim.name
                hidden: false,
                priority: 0,
                querySchema: undefined,
                supportsDetails: false,
                supportsSummary: true,
                summaryTargetLevel: 'path::0|1',
                detailCollection: undefined,
                detailModel: undefined,
                detailView: undefined,
                itemDetail: undefined,
                defaultOperator: 'AND'
            },
            hierarchy: {
                hidden: false,
                supportsSummary: true,
                defaultOperator: 'parent::defaultOperator',
                label: 'label::'
            },
            level: {
                activeCount: false,
                activeCountLink: true,
                dataBasedCount: false,
                countPriority: 0,
                countSingular: undefined,
                countPlural: undefined,
                cellbased: true,
                defaultOperator: 'parent::defaultOperator'
            }
        },

        /**
         * Defines the application level context that wraps an OLAP cube provided for the data connector
         */
        applyContext : function(mdx) {

            var defaults = Connector.cube.Configuration.defaults;
            var values = Connector.cube.Configuration.context;

            return LABKEY.query.olap.AppContext.applyContext(mdx, defaults, values);
        }
    }
});