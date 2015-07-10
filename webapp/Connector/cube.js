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
        //      summaryTargetLevel - summary views will respect this levels count when querying. Defaults to first hierarchy, second level.
        //      defaultOperator - AND/OR/REQ_AND/REQ_OR. Defaults to AND.
        //      filterType      - The default way of filtering for this dimension. Options are COUNT/WHERE. Defaults to COUNT.
        //
        // Hierarchies:
        //      hidden          - declare whether a hierarchy is hidden. Defaults to false.
        //      supportsSummary - summary views are supported for this hierarchy. defaults to true but respects hidden.
        //      defaultOperator - AND/OR/REQ_AND/REQ_OR. Defaults to dimensions value.
        //      label           - Default is parsed name.
        //      filterType      - The default way of filtering for this hierarchy. Options are COUNT/WHERE. Defaults to dimensions value.
        //
        // Levels:
        //      activeCount     - false/true/highlight. Default is false.
        //      activeCountLink - declare whether an 'activeCount' level exposes navigation. false/true. Default is true.
        //      dataBasedCount  - false/true. Default is false.
        //      countPriority   - Default is 0.
        //      countSingular   - The count label displayed when there is one match. Default is undefined.
        //      countPlural     - The count label displayed when there are zero/multiple matches. Default is undefined.
        //      defaultOperator - AND/OR/REQ_AND/REQ_OR. Defaults to hierarchies value.
        //      filterType      - The default way of filtering for this level. Options are COUNT/WHERE. Defaults to hierarchy's value.
        //
        context: {
            dimensions: [{
                uniqueName: '[Measures]',
                hidden: true
            },{
                uniqueName: '[Subject]',
                supportsDetails: false,
                pluralName: 'Subject characteristics',
                summaryTargetLevel: '[Subject.Race].[Race]',
                priority: 0,
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
                    label: 'Race',
                    levels: [{
                        uniqueName: '[Subject.Race].[Race]',
                        activeCount: true,
                        countPriority: 20,
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
                    label: 'Hispanic or Latino origin'
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
                }]
            },{
                uniqueName: '[Study]',
                pluralName: 'Studies',
                priority: 40,
                defaultOperator: 'OR',
                summaryTargetLevel: '[Study.Treatment].[Treatment]',

                hierarchies: [{
                    uniqueName: '[Study]',
                    label: 'Name',
                    hidden: true,
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
                },{
                    uniqueName: '[Study.Treatment]',
                    label: 'Treatment Assignment Summary',
                    levels: [{
                        uniqueName: '[Study.Treatment].[Treatment]',
                        countSingular: 'Treatment Assignment Summary',
                        countPlural: 'Treatment Assignment Summaries'
                    }]
                },{
                    uniqueName: '[Study.Type]',
                    label: 'Study Type',
                    levels: [{
                        uniqueName: '[Study.Type].[Type]',
                        countSingular: 'Study Type',
                        countPlural: 'Study Types'
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
                            text: 'title'
                        }
                    },{
                        type: 'text',
                        staticData: {
                            title: 'Description'
                        },
                        modelData: {
                            text: 'description'
                        }
                    },{
                        type: 'text',
                        staticData: {
                            title: 'CDS editorial'
                        },
                        modelData: {
                            text: 'context'
                        }
                    },{
                        type: 'text',
                        staticData: {
                            title: 'Study objectives'
                        },
                        modelData: {
                            text: 'objectives'
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
                        type: 'studyproducts',
                        staticData: {
                            title: 'Products'
                        }
                    },{
                        type: 'studydatasets',
                        staticData: {
                            title: "Lab & clinical data"
                        }
                    }]]
                }]
            },{
                uniqueName: '[Study Product]',
                priority: 20,
                singularName: 'Study product',
                pluralName: 'Study products',

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
                        type: 'text',
                        staticData: {
                            title: 'Description'
                        },
                        modelData: {
                            text: 'product_description'
                        }
                    }],[{
                        type: 'productstudies',
                        staticData: {
                            title: 'Studies using this product'
                        }
                    }]]
                    //},{
                    //    type: 'productprovidedby',
                    //    staticData: {
                    //        title: 'Product provided by'
                    //    }
                    //},{
                    //    type: 'productmanufacturing',
                    //    staticData: {
                    //        title: 'Product manufacturing'
                    //    }
                    //}],[{
                    //    type: 'productotherproducts',
                    //    staticData: {
                    //        title: 'Used with other products'
                    //    }
                    //}]]
                }]
            },{
                uniqueName: '[Assay]',
                priority: 30,
                singularName: 'Assay',
                pluralName: 'Assays'
                //supportsDetails: true
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
                filterType: 'COUNT'
            },
            hierarchy: {
                hidden: false,
                supportsSummary: true,
                defaultOperator: 'parent::defaultOperator',
                label: 'label::',
                filterType: 'parent::filterType'
            },
            level: {
                activeCount: false,
                activeCountLink: true,
                dataBasedCount: false,
                countPriority: 0,
                countSingular: undefined,
                countPlural: undefined,
                cellbased: true,
                defaultOperator: 'parent::defaultOperator',
                filterType: 'parent::filterType'
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