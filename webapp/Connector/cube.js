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
        //      hidden          - declare whether a dimension is hidden. Defaults to false.
        //      priority        - relative priority to be shown in displays. Default is 0.
        //      querySchema     - metadata member query schema. Defaults to undefined.
        //      supportsDetails - multinoun views are supported for this dimension. defaults to false.
        //      supportsSummary - summary views are supported for this dimension. defaults to true but respects hidden.
        //      summaryTargetLevel - summary views will respect this levels count when querying. Defaults to first hierarchy, second level.
        //
        // Hierarchies:
        //      hidden          - declare whether a hierarchy is hidden. Defaults to false.
        //      supportsSummary - summary views are supported for this hierarchy. defaults to true but respects hidden.
        //
        // Levels:
        //      activeCount     - false/true/highlight. Default is false.
        //      dataBasedCount  - false/true. Default is false.
        //      countPriority   - Default is 0.
        //      countSingular   - Default is undefined.
        //      countPlural     - Default is undefined.
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
                hierarchies: [{
                    uniqueName: '[Subject]',
                    hidden: true
                },{
                    uniqueName: '[Subject.Sex]',
                    levels: [{
                        uniqueName: '[Subject.Sex].[Sex]',
                        activeCount: true,
                        countPriority: 10,
                        countSingular: 'Gender',
                        countPlural: 'Genders'
                    }]
                },{
                    uniqueName: '[Subject.Race]',
                    sortable: true,
                    levels: [{
                        uniqueName: '[Subject.Race].[Race]',
                        activeCount: true,
                        countPriority: 20,
                        countSingular: 'Race & Subtype',
                        countPlural: 'Races & Subtypes'
                    }]
                },{
                    uniqueName: '[Subject.Country]',
                    sortable: true,
                    levels: [{
                        uniqueName: '[Subject.Country].[Country]',
                        countSingular: 'Country',
                        countPlural: 'Countries'
                    }]
                }]
            },{
                uniqueName: '[Vaccine]',
                pluralName: 'Study products',
                priority: 20,
                supportsDetails: true,
                detailCollection: 'Connector.app.store.StudyProducts',
                detailModel: 'Connector.app.model.StudyProducts',
                detailView: 'Connector.app.view.StudyProducts',
                // detailDataSource: {
                //     schema: 'Study',
                //     query: 'StudyProperties'
                // },
                // detailPageViews: {
                //     leadContributer: 'Connector.app.view.Person',

                // },

                hierarchies: [{
                    uniqueName: '[Vaccine.Type]',
                    levels: [{
                        uniqueName: '[Vaccine.Type].[Name]',
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
                supportsDetails: true,
                summaryTargetLevel: '[Assay.Target Area].[Name]',
                detailCollection: 'Connector.app.store.Assay',
                detailModel: 'Connector.app.model.Assay',
                detailView: 'Connector.app.view.Assay',

                // detailItemView: 'Connector.app.view.StudyDetail',

                hierarchies: [{
                    uniqueName: '[Assay.Target Area]',
                    levels: [{
                        uniqueName: '[Assay.Target Area].[Target Area]',
                        countSingular: 'Target Area',
                        countPlural: 'Target Areas'
                    },{
                        uniqueName: '[Assay.Target Area].[Name]',
                        activeCount: 'highlight',
                        countPriority: 50,
                        countSingular: 'Assay',
                        countPlural: 'Assays'
                    }]
                },{
                    uniqueName: '[Assay.Methodology]',
                    levels: [{
                        uniqueName: '[Assay.Methodology].[Methodology]',
                        countSingular: 'Methodology',
                        countPlural: 'Methodologies'
                    }]
                }]
            },{
                uniqueName: '[Study]',
                pluralName: 'Studies',
                priority: 1,
                supportsDetails: true,
                detailCollection: 'Connector.app.store.Study',
                detailModel: 'Connector.app.model.Study',
                detailView: 'Connector.app.view.Study',

                detailItemView: 'Connector.app.view.StudyDetail',
                detailItemModules: [[{
                    type: 'studyheader'
                }, {
                    type: 'text',
                    staticData: {
                        title: 'Data connector editorial'
                    },
                    modelData: {
                        text: 'Editorial'
                    }
                }, {
                    type: 'text',
                    staticData: {
                        title: 'Overview'
                    },
                    modelData: {
                        text: 'Description'
                    }
                }, {
                    type: 'studyproducts',
                    staticData: {
                        title: 'Products'
                    }
                }, {
                    type: 'studysites',
                    staticData: {
                        title: 'Cohort & sites'
                    }
                }], [{
                    type: 'person',
                    staticData: {
                        title: 'Study point of contact'
                    },
                    modelData: {
                        name: 'MainContact.Name',
                        picture: 'MainContact.Portrait',
                        line1: 'MainContact.Role',
                        line2: 'MainContact.Team'
                    }
                }, {
                    type: 'studyassays',
                    staticData: {
                        title: 'Immune Assays'
                    }
                }]],

                hierarchies: [{
                    uniqueName: '[Study]',
                    levels: [{
                        uniqueName: '[Study].[(All)]',
                        activeCount: 'highlight',
                        countPriority: 0,
                        countSingular: 'Subject',
                        countPlural: 'Subjects',
                        cellbased: false
                    },{
                        uniqueName: '[Study].[Study]',
                        activeCount: 'highlight',
                        countPriority: 30,
                        countSingular: 'Study',
                        countPlural: 'Studies'
                    }]
                }]
            },{
                uniqueName: '[Antigen]',
                pluralName: 'Assay antigens',
                priority: 50,
                supportsDetails: false,
                summaryTargetLevel: '[Antigen.Clade].[Name]',

                hierarchies: [{
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
                    },{
                        uniqueName: '[Antigen.Tier].[Name]',
                        activeCount: true,
                        dataBasedCount: true,
                        countPriority: 60,
                        countSingular: 'Antigen',
                        countPlural: 'Antigens'
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
                priority: 60,
                supportsDetails: true,
                detailCollection: 'Connector.app.store.Labs',
                detailModel: 'Connector.app.model.Labs',
                detailView: 'Connector.app.view.Labs',

                hierarchies: [{
                    uniqueName: '[Lab]',
                    levels: [{
                        uniqueName: '[Lab].[Lab]',
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

            //
            // Apply dimension metadata (dimensionDefaults)
            //
            var dd = {
                singularName: undefined, // defaults to dim.name
                pluralName: undefined, // defaults to dim.name
                hidden: false,
                priority: 0,
                querySchema: undefined,
                supportsDetails: false,
                supportsSummary: true,
                detailCollection: undefined,
                detailModel: undefined,
                detailView: undefined,
                detailItemCollection: undefined,
                detailItemModel: undefined,
                detailItemView: undefined,
                detailItemModules: []
            };

            var hh = {
                hidden: false,
                supportsSummary: true
            };

            var ll = {
                activeCount: false,
                dataBasedCount: false,
                countPriority: 0,
                countSingular: undefined,
                countPlural: undefined,
                cellbased: true
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
                            hidden: Ext.isDefined(cd.hidden) ? cd.hidden : dd.hidden,
                            priority: Ext.isDefined(cd.priority) ? cd.priority : dd.priority,
                            querySchema: Ext.isDefined(cd.querySchema) ? cd.querySchema : dd.querySchema,
                            supportsDetails: Ext.isDefined(cd.supportsDetails) ? cd.supportsDetails : dd.supportsDetails,
                            supportsSummary: Ext.isDefined(cd.supportsSummary) ? cd.supportsSummary : dd.supportsSummary,
                            summaryTargetLevel: Ext.isDefined(cd.summaryTargetLevel) ? cd.summaryTargetLevel : defaultTargetLevel,
                            detailCollection: Ext.isDefined(cd.detailCollection) ? cd.detailCollection : dd.detailCollection,
                            detailModel: Ext.isDefined(cd.detailModel) ? cd.detailModel : dd.detailModel,
                            detailView: Ext.isDefined(cd.detailView) ? cd.detailView : dd.detailView,
                            detailItemCollection: Ext.isDefined(cd.detailItemCollection) ? cd.detailItemCollection : dd.detailItemCollection,
                            detailItemModel: Ext.isDefined(cd.detailItemModel) ? cd.detailItemModel : dd.detailItemModel,
                            detailItemView: Ext.isDefined(cd.detailItemView) ? cd.detailItemView : dd.detailItemView,
                            detailItemModules: Ext.isDefined(cd.detailItemModules) ? cd.detailItemModules : dd.detailItemModules
                        });

                        //
                        // Iterate over the set of cube hierarchies applying context
                        //
                        ch = cd.hierarchies;

                        for (_h=0; _h < _hier.length; _h++) {

                            var ctx = Ext.clone(hh);
                            var contextHierarchy = false;

                            if (ch) {
                                // order of the context hierarhcies might not match the dimension declarations
                                // so find each one before overlaying
                                for (h=0; h < ch.length; h++) {
                                    if (ch[h].uniqueName === _hier[_h].uniqueName) {
                                        contextHierarchy = ch[h];
                                    }
                                }

                                if (contextHierarchy) {
                                    ctx = {};

                                    Ext.apply(ctx, {
                                        hidden: Ext.isDefined(contextHierarchy.hidden) ? contextHierarchy.hidden === true : hh.hidden,
                                        supportsSummary: Ext.isDefined(contextHierarchy.supportsSummary) ? contextHierarchy.supportsSummary === true : hh.supportsSummary
                                    });
                                }
                            }

                            Ext.apply(_hier[_h], ctx);

                            //
                            // Apply hierarchy level context
                            //
                            Connector.cube.Configuration.getLevels(_hier[_h], contextHierarchy, ll);
                        }
                    }
                }
            }

            return mdx;
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
                                dataBasedCount: Ext.isDefined(lvl.dataBasedCount) ? lvl.dataBasedCount : defaults.dataBasedCount,
                                countPriority: Ext.isDefined(lvl.countPriority) ? lvl.countPriority : defaults.countPriority,
                                countSingular: Ext.isDefined(lvl.countSingular) ? lvl.countSingular : defaults.countSingular,
                                countPlural: Ext.isDefined(lvl.countPlural) ? lvl.countPlural : defaults.countPlural,
                                cellbased: Ext.isDefined(lvl.cellbased) ? lvl.cellbased : defaults.cellbased
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