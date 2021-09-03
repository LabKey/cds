/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Publication', {
    extend : 'Connector.app.store.SavedReports',

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
        this.callParent();

        this.publicationData = undefined;
        this.studyData = undefined;
        this.assayData = undefined;
        this.publicationDocuments = undefined;
        this.publicationReportsData = undefined;
        this.publicationCuratedGroupData = undefined;

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

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_publicationdata',
            success: this.onLoadPublicationData,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'publicationReport',
            success: this.onLoadPublicationReport,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'pubCuratedGrpWithLabel',
            success: this.onLoadPublicationCuratedGroup,
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

    onLoadPublicationData: function(data) {
        this.publicationDocuments = data.rows;
        this._onLoadComplete();
    },

    onLoadPublicationReport : function(pubReports) {
        this.publicationReportsData = pubReports.rows;
        this._onLoadComplete();
    },

    onLoadPublicationCuratedGroup : function(pubCuratedGroup) {
        this.publicationCuratedGroupData = pubCuratedGroup.rows;
        this._onLoadComplete();
    },

    _onLoadComplete : function() {
        if (Ext.isDefined(this.publicationData) && Ext.isDefined(this.studyData)
                && Ext.isDefined(this.assayData) && Ext.isDefined(this.accessibleStudies)
                && Ext.isDefined(this.publicationDocuments)
                && Ext.isDefined(this.publicationReportsData) && Ext.isDefined(this.publicationCuratedGroupData)) {

            this.publicationData.sort(function(row1, row2) {
                var date1Str = Connector.model.Filter.sorters.getPublicationDateSortStr(row1.date);
                var date2Str = Connector.model.Filter.sorters.getPublicationDateSortStr(row2.date);
                return -1 * Connector.model.Filter.sorters.natural(date1Str, date2Str);
            });

            var studyAssays = {};
            Ext.each(this.assayData, function(assay) {
                var prot = assay.prot;
                if (!studyAssays[prot])
                    studyAssays[prot] = [];
                studyAssays[prot].push(assay);
            });

            var productStudies = {};
            Ext.each(this.studyData, function(study) {
                var productId = study.id;
                delete study.id;
                if (!productStudies[productId])
                    productStudies[productId] = [];
                study.assays = studyAssays[study.prot];

                study.data_label = study.study_label;

                if (!study.study_label)
                    study.study_label = study.prot;
                study.data_id = study.prot;
                study.data_link_id = study.prot;
                study.has_access = this.accessibleStudies[study.prot];
                var dataStatus = 'Data not added';
                if (study.assays)
                {
                    var hasDataAssays = [];
                    Ext.each(study.assays, function(assay) {
                        if (assay.has_data)
                            hasDataAssays.push(assay.assay_short_name);
                    });
                    study.has_data = hasDataAssays.length > 0;
                    if (study.has_data)
                    {
                        dataStatus = '<p class="data-availability-tooltip-header">Assays ' + (study.has_access ? 'with' : 'without') + ' data accessible</p>';
                        Ext.each(hasDataAssays, function(assay){
                            dataStatus += assay + '<br>';
                        });
                    }
                }
                study.data_status = dataStatus;
                productStudies[productId].push(study);
            }, this);

            // publication data documents
            var documents = this.publicationDocuments.filter(function(doc) {
                return doc.document_type === 'Publication Data';
            }, this).map(function(doc) {
                return {
                    publication_id: doc.publication_id,
                    document_id: doc.document_id,
                    label: doc.label,
                    fileName: doc.filename,
                    docType: doc.document_type,
                    isLinkValid: undefined,
                    hasPermission: true,                // publication documents are always public
                    suffix: '(' + Connector.utility.FileExtension.fileDisplayType(doc.filename) +')',
                    filePath: Connector.plugin.DocumentValidation.getPublicationDocumentUrl(doc.filename, doc.document_id),
                    has_access: true                    // needed for the data available tooltip on the learn page
                }
            }, this).sort(function(docA, docB){
                return Connector.model.Filter.sorters.natural(docA.label, docB.label);
            }, this);

            // map the docs to each publication
            var publicationMap = {};
            Ext.each(documents, function (doc) {
                publicationMap[doc.publication_id] = publicationMap[doc.publication_id] || [];
                publicationMap[doc.publication_id].push(doc);
            }, this);

            var savedReports = [];
            for (var i=0; i < this.publicationReportsData.length; i++) {
                var id = this.publicationReportsData[i].cds_report_id.toString();
                var savedReportObj = this.savedReportsData.filter(function (savedReport) {
                    return savedReport.reportId === id;
                }, this);
                if (savedReportObj && savedReportObj.length > 0) {
                    var report  = {
                        report_id: id,
                        publication_id: this.publicationReportsData[i].publication_id,
                        label: savedReportObj && savedReportObj[0] ? savedReportObj[0].reportName : id
                    };
                    savedReports.push(report);
                }
            }

            var curatedGroups = [];
            for (var j=0; j < this.publicationCuratedGroupData.length; j++) {
                curatedGroups.push(this.publicationCuratedGroupData[j]);
            }

            var publications = [];
            Ext.each(this.publicationData, function(publication) {

                publication.publication_id = publication.id;
                delete publication.id;
                publication.publication_title = publication.title;
                if (publication.date)
                {
                    publication.year = publication.date.trim().split(/\s+/)[0];
                }
                publication.studies = productStudies[publication.publication_id];
                if (publication.studies)
                {
                    publication.studies.sort(function(a, b){
                        return a.study_label.localeCompare(b.study_label);
                    });
                    publication.study_to_sort_on = publication.studies[0].study_label;
                    var studyNames = [];
                    Ext.each(publication.studies, function(study, index){
                        study.data_index = index; //for show all/show less on display
                        study.data_show = index < 10; //for show all/show less on display
                        studyNames.push(study.study_label);
                    });
                    publication.study_names = studyNames;
                }

                // publication data
                publication.publication_data = publicationMap[publication.publication_id] || [];
                publication.publication_data_count = publication.publication_data.length;
                publication.data_availability = publication.publication_data.length > 0;

                //saved reports
                var savedRep = savedReports.filter(function (value) {
                    return value.publication_id.toString() === publication.publication_id;
                });

                if (savedRep && savedRep.length > 0) {
                    publication.interactive_reports = savedRep;
                }

                //curated groups
                var curatedGrp = curatedGroups.filter(function (value) {
                    return value.publication_id.toString() === publication.publication_id;
                });
                if (curatedGrp && curatedGrp.length > 0) {
                    publication.curated_groups = curatedGrp;
                }

                publications.push(publication);
            });


            this.publicationData = undefined;
            this.studyData = undefined;
            this.assayData = undefined;
            this.publicationReportsData = undefined;
            this.savedReportsData = [];
            this.publicationCuratedGroupData = undefined;

            this.loadRawData(publications);

            LABKEY.Utils.signalWebDriverTest("learnPublicationsLoaded");
        }
    }
});