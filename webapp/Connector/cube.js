/*
 * Copyright (c) 2012-2013 LabKey Corporation
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
        //
        // Hierarchies:
        //      hidden          - declare whether a hierarchy is hidden. Defaults to false.
        context: {
            dimensions: [{
                uniqueName: '[Measures]',
                hidden: true
            },{
                uniqueName: '[Subject]',
                supportsDetails: false,
                hierarchies: [{
                    uniqueName: '[Subject]',
                    hidden: true
                }]
            },{
                uniqueName: '[Vaccine]',
                pluralName: 'Study products',
                priority: 8,
                supportsDetails: true,
                detailCollection: 'Connector.app.store.StudyProducts',
                detailModel: 'Connector.app.model.StudyProducts',
                detailView: 'Connector.app.view.StudyProducts'
            },{
                uniqueName: '[Assay]',
                pluralName: 'Assays',
                priority: 9,
                supportsDetails: true,
                detailCollection: 'Connector.app.store.Assay',
                detailModel: 'Connector.app.model.Assay',
                detailView: 'Connector.app.view.Assay'
            },{
                uniqueName: '[Study]',
                pluralName: 'Studies',
                priority: 10,
                supportsDetails: true,
                detailCollection: 'Connector.app.store.Study',
                detailModel: 'Connector.app.model.Study',
                detailView: 'Connector.app.view.Study'
            },{
                uniqueName: '[Antigen]',
                pluralName: 'Antigens',
                priority: 7,
                supportsDetails: false
            },{
                uniqueName: '[Lab]',
                pluralName: 'Labs',
                supportsDetails: true,
                detailCollection: 'Connector.app.store.Labs',
                detailModel: 'Connector.app.model.Labs',
                detailView: 'Connector.app.view.Labs'
            },{
                uniqueName: '[Site]',
                pluralName: 'Sites',
                supportsDetails: true,
                detailCollection: 'Connector.app.store.Site',
                detailModel: 'Connector.app.model.Site',
                detailView: 'Connector.app.view.Site'
            }]
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
                detailCollection: undefined,
                detailModel: undefined,
                detailView: undefined
            };

            var context = Connector.cube.Configuration.context, cd;
            var dims = mdx.getDimensions();

            //
            // Iterate over the set of context overridden dimensions
            //
            for (var c=0; c < context.dimensions.length; c++) {

                cd = context.dimensions[c];

                //
                // For each context dimension, compare it against the cube dimensions
                //
                for (var d=0; d < dims.length; d++) {

                    if (dims[d].uniqueName == cd.uniqueName) {

                        //
                        // Overlay the metadata for the given dimension configuration
                        //
                        dims[d].singularName = (Ext4.isDefined(cd.singularName) ? cd.singularName : dims[d].name);
                        dims[d].pluralName = (Ext4.isDefined(cd.pluralName) ? cd.pluralName : dims[d].name);
                        dims[d].hidden = (Ext4.isDefined(cd.hidden) ? cd.hidden : dd.hidden);
                        dims[d].priority = (Ext4.isDefined(cd.priority) ? cd.priority : dd.priority);
                        dims[d].querySchema = (Ext4.isDefined(cd.querySchema) ? cd.querySchema : dd.querySchema);
                        dims[d].supportsDetails = (Ext4.isDefined(cd.supportsDetails) ? cd.supportsDetails : dd.supportsDetails);
                        dims[d].detailCollection = (Ext4.isDefined(cd.detailCollection) ? cd.detailCollection : dd.detailCollection);
                        dims[d].detailModel = (Ext4.isDefined(cd.detailModel) ? cd.detailModel : dd.detailModel);
                        dims[d].detailView = (Ext4.isDefined(cd.detailView) ? cd.detailView : dd.detailView);
                    }

                }
            }

            return mdx;
        }
    }
});