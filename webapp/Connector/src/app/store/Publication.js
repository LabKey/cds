/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Publication', {
    extend : 'Ext.data.Store',

    mixins: {
        studyAccessHelper: 'Connector.app.store.PermissionedStudy'
    },

    model : 'Connector.app.model.Publication',

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadSlice: function() {
        this.publicationData = undefined;
        this.studyData = undefined;
        this.assayData = undefined;

        this.loadAccessibleStudies(this._onLoadComplete, this); // populate this.accessibleStudies

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'publication',
            success: this.onLoadPublications,
            scope: this
        });

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_publicationsforstudies',
            success: this.onLoadStudies,
            scope: this
        });

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_assaysforstudies',
            success: this.onLoadAssays,
            scope: this
        });
    },

    onLoadPublications: function (data) {
        this.publicationData = data.rows;
        this._onLoadComplete();
    },

    onLoadStudies: function (data) {
        this.studyData = data.rows;
        this._onLoadComplete();
    },

    onLoadAssays: function (data) {
        this.assayData = data.rows;
        this._onLoadComplete();
    },

    _onLoadComplete : function() {
        if (Ext.isDefined(this.publicationData) && Ext.isDefined(this.studyData)
                && Ext.isDefined(this.assayData) && Ext.isDefined(this.accessibleStudies)) {

            this.publicationData.sort(function(row1, row2) {
                var date1Str = Connector.model.Filter.sorters.getPublicationDateSortStr(row1.date);
                var date2Str = Connector.model.Filter.sorters.getPublicationDateSortStr(row2.date);
                return Connector.model.Filter.sorters.natural(date1Str, date2Str);
            });

            var studyAssays = {};
            Ext.each(this.assayData, function(assay) {
                var prot = assay.prot;
                if (!studyAssays[prot])
                    studyAssays[prot] = [];
                studyAssays[prot] = assay;
            });

            var productStudies = {};
            Ext.each(this.studyData, function(study) {
                var productId = study.id;
                if (!productStudies[productId])
                    productStudies[productId] = [];
                study.assays = studyAssays[study.prot];
                productStudies[productId].push(study);
            });


            var publications = [];
            Ext.each(this.publicationData, function(publication) {
                if (publication.date)
                {
                    publication.year = publication.date.trim().split(/\s+/)[0];
                }
                publication.studies = productStudies[publication.id];
                if (publication.studies)
                {
                    publication.studies.sort(function(a, b){
                        return a.study_label.localeCompare(b.study_label);
                    });
                    publication.study_to_sort_on = publication.studies[0];
                    var studyNames = [];
                    Ext.each(publication.studies, function(study){
                        studyNames.push(study.study_label);
                    });
                    publication.study_names = studyNames;
                }
                publications.push(publication);
            });


            this.publicationData = undefined;
            this.studyData = undefined;
            this.assayData = undefined;

            this.loadRawData(publications);

            LABKEY.Utils.signalWebDriverTest("learnPublicationsLoaded");
        }
    }
});