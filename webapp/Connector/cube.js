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
        //      friendlyName    - Declaure a friendly, possibly more contextual, name for this dimension. Defaults to singularName value.
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
        //      countSingular   - Default is undefined.
        //      countPlural     - Default is undefined.
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
                        countSingular: 'Race & Subtype',
                        countPlural: 'Races & Subtypes'
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
                    uniqueName: '[Subject.Species]'
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
                            title: 'Product production'
                        },
                        modelData: {
                            text: 'Production'
                        }
                    }, {
                        type: 'text',
                        staticData: {
                            title: 'Description'
                        },
                        modelData: {
                            text: 'Description'
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
                    label: 'Variables, Antigens, Analytes',
                    content: {
                        view: 'Connector.app.view.ModuleContainer',
                        modules: [[{
                            type: 'assayvariablelist',
                            staticData: {
                                title: 'Variables'
                            }
                        }], [{
                            type: 'assayantigenlist',
                            staticData: {
                                title: 'Antigens'
                            }
                        }], [{
                            type: 'assayanalytelist',
                            staticData: {
                                title: 'Analytes'
                            }
                        }]]
                    }
                }],

                hierarchies: [{
                    uniqueName: '[Assay.Name]',
                    hidden: true,
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
                            text: 'Population'
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
                supportsDetails: true,
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
            // Sites have been disabled until it is no longer dependent on the demographics dataset
//            },{
//                uniqueName: '[Site]',
//                pluralName: 'Sites',
//                supportsSummary: false,
//                supportsDetails: true,
//                detailCollection: 'Connector.app.store.Site',
//                detailModel: 'Connector.app.model.Site',
//                detailView: 'Connector.app.view.Site'
//            }]
        },

        /**
         * Defines the application level context that wraps an OLAP cube provided for the data connector
         */
        applyContext : function(mdx) {

            var OPERATOR = {
                AND: 'AND',
                REQ_AND: 'REQ_AND',
                OR: 'OR',
                REQ_OR: 'REQ_OR'
            };

            //
            // Apply dimension metadata (dimensionDefaults)
            //
            var dd = {
                singularName: undefined, // defaults to dim.name
                pluralName: undefined, // defaults to dim.name
                friendlyName: undefined, // defaults to dim.singularName
                hidden: false,
                priority: 0,
                querySchema: undefined,
                supportsDetails: false,
                supportsSummary: true,
                detailCollection: undefined,
                detailModel: undefined,
                detailView: undefined,
                itemDetail: undefined,
                defaultOperator: OPERATOR.AND
            };

            var hh = {
                hidden: false,
                supportsSummary: true,
                defaultOperator: dd.defaultOperator,
                label: '' // parsed later
            };

            var ll = {
                activeCount: false,
                activeCountLink: true,
                dataBasedCount: false,
                countPriority: 0,
                countSingular: undefined,
                countPlural: undefined,
                cellbased: true,
                defaultOperator: hh.defaultOperator
            };

            var context = Connector.cube.Configuration.context, cd, ch;
            var dims = mdx.getDimensions(), _dim, _hier, c, d, h, _h;

            //
            // Iterate over the set of context overridden dimensions
            //
            for (c=0; c < context.dimensions.length; c++) {

                cd = context.dimensions[c];

                //
                // For each context dimension, compare it against the cube dimensions
                //
                for (d=0; d < dims.length; d++) {

                    if (dims[d].uniqueName == cd.uniqueName) {

                        _dim = dims[d];
                        _hier = _dim.getHierarchies();

                        var defaultTargetLevel = '';
                        if (_hier.length > 0) {
                            if (_hier[0].levels.length > 1) {
                                defaultTargetLevel = _hier[0].levels[1].uniqueName;
                            }
                        }

                        //
                        // Overlay the metadata for the given dimension configuration
                        //
                        Ext.apply(_dim, {
                            singularName: Ext.isDefined(cd.singularName) ? cd.singularName : _dim.name,
                            pluralName: Ext.isDefined(cd.pluralName) ? cd.pluralName : _dim.name,
                            friendlyName: Ext.isDefined(cd.friendlyName) ? cd.friendlyName : (Ext.isDefined(cd.singularName) ? cd.singularName : _dim.name),
                            hidden: Ext.isDefined(cd.hidden) ? cd.hidden : dd.hidden,
                            priority: Ext.isDefined(cd.priority) ? cd.priority : dd.priority,
                            querySchema: Ext.isDefined(cd.querySchema) ? cd.querySchema : dd.querySchema,
                            supportsDetails: Ext.isDefined(cd.supportsDetails) ? cd.supportsDetails : dd.supportsDetails,
                            supportsSummary: Ext.isDefined(cd.supportsSummary) ? cd.supportsSummary : dd.supportsSummary,
                            summaryTargetLevel: Ext.isDefined(cd.summaryTargetLevel) ? cd.summaryTargetLevel : defaultTargetLevel,
                            detailCollection: Ext.isDefined(cd.detailCollection) ? cd.detailCollection : dd.detailCollection,
                            detailModel: Ext.isDefined(cd.detailModel) ? cd.detailModel : dd.detailModel,
                            detailView: Ext.isDefined(cd.detailView) ? cd.detailView : dd.detailView,
                            itemDetail: Ext.isDefined(cd.itemDetail) ? cd.itemDetail : dd.itemDetail,
                            defaultOperator: Ext.isDefined(cd.defaultOperator) ? cd.defaultOperator : dd.defaultOperator
                        });

                        if (_dim.itemDetail) {

                            if (Ext.isArray(_dim.itemDetail)) {
                                // itemDetail is an array of composite data structures with detail page content and tab info.
                                // Split it here
                                var items = _dim.itemDetail;
                                _dim.itemDetail = [];
                                _dim.itemDetailTabs = [];
                                Ext.each(items, function(item) {
                                    _dim.itemDetail.push(item.content);
                                    _dim.itemDetailTabs.push(item.label);
                                })
                            } else {
                                _dim.itemDetail = [_dim.itemDetail];
                            }
                        }

                        //
                        // Iterate over the set of cube hierarchies applying context
                        //
                        ch = cd.hierarchies;
                        var ctx = Ext.clone(hh);
                        var processed = false;

                        for (_h=0; _h < _hier.length; _h++) {

                            var ctxHier = false;
                            processed = false;

                            if (ch) {
                                // order of the context hierarchies might not match the dimension declarations
                                // so find each one before overlaying
                                for (h=0; h < ch.length; h++) {
                                    if (ch[h].uniqueName === _hier[_h].uniqueName) {
                                        ctxHier = ch[h];
                                    }
                                }

                                if (ctxHier) {
                                    ctx = {};

                                    processed = true;
                                    Ext.apply(ctx, {
                                        hidden: Ext.isDefined(ctxHier.hidden) ? ctxHier.hidden === true : hh.hidden,
                                        supportsSummary: Ext.isDefined(ctxHier.supportsSummary) ? ctxHier.supportsSummary === true : hh.supportsSummary,
                                        defaultOperator: Ext.isDefined(ctxHier.defaultOperator) ? ctxHier.defaultOperator : _dim.defaultOperator,
                                        label: Ext.isDefined(ctxHier.label) ? ctxHier.label : Connector.cube.Configuration.parseLabel(_hier[_h])
                                    });

                                    ll.defaultOperator = ctx.defaultOperator;
                                }
                            }

                            if (!processed) {
                                ctx = {};
                                Ext.apply(ctx, {
                                    hidden: hh.hidden,
                                    supportsSummary: hh.supportsSummary,
                                    defaultOperator: _dim.defaultOperator,
                                    label: Connector.cube.Configuration.parseLabel(_hier[_h])
                                });

                                ll.defaultOperator = hh.defaultOperator;
                            }

                            Ext.apply(_hier[_h], ctx);

                            //
                            // Apply hierarchy level context
                            //
                            Connector.cube.Configuration.getLevels(_hier[_h], ctxHier, ll);
                        }
                    }
                }
            }

            return mdx;
        },

        parseLabel : function(hierarchy) {
            var label = hierarchy.name.split('.');
            return label[label.length-1];
        },

        getLevels : function(cubeHierarchy, contextHierarchy, defaults) {

            //
            // Iterate over the set of cube hierarchies levels applying context
            //
            var _levels = cubeHierarchy['levels'], lvl, l, _l;

            for (_l=0; _l < _levels.length; _l++) {

                var ctx = Ext.clone(defaults);

                //
                // Determine if an override was supplied for this level
                //
                if (Ext.isDefined(contextHierarchy) && Ext.isDefined(contextHierarchy.levels)) {

                    for (l=0; l < contextHierarchy.levels.length; l++) {
                        lvl = contextHierarchy.levels[l];
                        if (lvl.uniqueName == _levels[_l].uniqueName) {
                            ctx = {};
                            Ext.apply(ctx, {
                                activeCount: Ext.isDefined(lvl.activeCount) ? lvl.activeCount : defaults.activeCount,
                                activeCountLink: Ext.isDefined(lvl.activeCountLink) ? lvl.activeCountLink : defaults.activeCountLink,
                                dataBasedCount: Ext.isDefined(lvl.dataBasedCount) ? lvl.dataBasedCount : defaults.dataBasedCount,
                                countPriority: Ext.isDefined(lvl.countPriority) ? lvl.countPriority : defaults.countPriority,
                                countSingular: Ext.isDefined(lvl.countSingular) ? lvl.countSingular : defaults.countSingular,
                                countPlural: Ext.isDefined(lvl.countPlural) ? lvl.countPlural : defaults.countPlural,
                                cellbased: Ext.isDefined(lvl.cellbased) ? lvl.cellbased : defaults.cellbased,
                                defaultOperator: Ext.isDefined(lvl.defaultOperator) ? lvl.defaultOperator : defaults.defaultOperator
                            });
                            break;
                        }
                    }
                }

                Ext.apply(_levels[_l], ctx);
            }
        }
    }
});