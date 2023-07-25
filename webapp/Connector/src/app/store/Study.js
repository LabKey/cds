/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Study', {

    extend : 'Connector.app.store.SavedReports',

    mixins: {
        studyAccessHelper: 'Connector.app.store.PermissionedStudy'
    },

    model : 'Connector.app.model.Study',

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadSlice : function(slice) {
        this.callParent(slice);

        this.studyData = undefined;
        this.productData = undefined;
        this.assayData = undefined;
        this.documentData = undefined;
        this.niDocumentData = undefined;
        this.publicationData = undefined;
        this.assayIdentifiers = undefined;

        this.loadAccessibleStudies(this._onLoadComplete, this); // populate this.accessibleStudies

        LABKEY.Query.selectRows({
            schemaName: 'cds.metadata',
            queryName: 'study',
            success: this.onLoadStudies,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_productsforstudies',
            success: this.onLoadProducts,
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
            queryName: 'learn_documentsforstudies',
            success: this.onLoadDocuments,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_publicationsforstudies',
            success: this.onLoadPublications,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'integratedAssays',
            success: this.onLoadAssayIdentifiers,
            scope: this
        });
        LABKEY.Ajax.request({
            url : LABKEY.ActionURL.buildURL("cds", "getNonIntegratedDocument.api"),
            method : 'GET',
            success: this.onNILoadDocuments,
            scope: this
        });
    },

    onLoadStudies : function(studyData) {
        this.studyData = studyData.rows;
        this._onLoadComplete();
    },

    onLoadProducts : function(productData) {
        this.productData = productData.rows;
        this._onLoadComplete();
    },

    onLoadAssays : function(assayData) {
        this.assayData = assayData.rows;
        this._onLoadComplete();
    },

    onLoadDocuments : function(documentData) {
        this.documentData = documentData.rows;
        this._onLoadComplete();
    },

    onLoadPublications : function(publicationData) {
        this.publicationData = publicationData.rows;
        this._onLoadComplete();
    },

    onLoadAssayIdentifiers : function(assayIdentifiers) {
        this.assayIdentifiers = assayIdentifiers.rows;
        this._onLoadComplete();
    },

    //For using valid downloadable link as an "availability" indicator for Non-integrated data on Learn > Studies page
    onNILoadDocuments : function(documentData) {
        var json = Ext.decode(documentData.responseText);
        this.niDocumentData = json.results;
        this._onLoadComplete();
    },

    _onLoadComplete: function () {
        if (Ext.isDefined(this.studyData)
                && Ext.isDefined(this.productData)
                && Ext.isDefined(this.assayData)
                && Ext.isDefined(this.documentData)
                && Ext.isDefined(this.niDocumentData)
                && Ext.isDefined(this.publicationData)
                && Ext.isDefined(this.accessibleStudies)
                && Ext.isDefined(this.assayIdentifiers)
                && this.isLoadComplete()) {
            var studies = [], products, productNames, productClasses;

            var integratedAssays = this.assayIdentifiers.map(function(integratedAssay) {return integratedAssay.assay_identifier});

            Ext.each(this.studyData, function(study) {
                var hasStudyAccess = this.accessibleStudies[study.study_name] === true;
                study.study_title = study.title;

                var startDate = study.first_enr_date || study.start_date;
                if (startDate) {
                    study.start_year = (new Date(startDate)).getFullYear().toString();
                } else {
                    study.start_year = 'Not available';
                }
                study.date_to_sort_on = study.stage + "|" + startDate;

                products = [];
                productNames = [];
                productClasses = [];
                for (var p=0; p < this.productData.length; p++) {
                    if (study.study_name === this.productData[p].study_name) {
                        if (this.productData[p].product_name.toLowerCase().trim() !== Connector.app.model.StudyProducts.markerProducts.NONE) {
                            // Consider: These should probably be of type Connector.app.model.StudyProducts
                            // but it'd be good to then have a common sourcing mechanism for LA models
                            products.push({
                                product_id: this.productData[p].product_id,
                                product_name: this.productData[p].product_name
                            });
                            productNames.push(this.productData[p].product_name);
                            productClasses.push(this.productData[p].product_class || '[Unknown]');
                        }
                    }
                }
                products.sort(function (p1, p2) {
                    return p1.product_name.toLowerCase().localeCompare(p2.product_name.toLowerCase())
                });
                study.product_to_sort_on = products[0] ? products[0].product_name.toLowerCase() : '';

                var assays = [], assaysAdded = [], nonIntegratedAssays = [], assayAddedCount = 0;
                study.data_availability = false;
                study.ni_data_availability = false;
                study.data_accessible = hasStudyAccess;
                for (var a=0; a < this.assayData.length; a++) {
                    if (study.study_name === this.assayData[a].prot) {
                        study.data_availability = study.data_availability || this.assayData[a].has_data;
                        var assay = {
                            data_label: this.assayData[a].assay_short_name,
                            data_id: this.assayData[a].study_assay_id, //same as assay_identifier as per learn_assaysforstudies.sql
                            data_link_id: this.assayData[a].assay_identifier,
                            has_data: this.assayData[a].has_data,
                            has_access: hasStudyAccess
                        };

                        if (integratedAssays.includes(this.assayData[a].assay_identifier)) {
                            assays.push(assay);
                        }
                        else {
                            nonIntegratedAssays.push(assay);
                      }
                    }
                }

                assays.sort(Connector.view.module.DataAvailabilityModule.dataAddedSortFn);
                Ext.each(assays, function(assay, index){
                    if (assay.has_data) {
                        assaysAdded.push(assay);
                        assayAddedCount += 1;
                    }

                    assay.data_index = index; //for show all/show less on display, maybe not needed since there will be max of 5 integrated assays, but adding for consistency
                    assay.data_show = index < 10; //for show all/show less on display
                });

                for (var d=0; d < this.documentData.length; d++) {
                    if (study.study_name === this.documentData[d].prot) {
                        if (this.documentData[d].document_type === 'grant_document') {
                            study.cavd_affiliation = this.documentData[d].label;
                        }
                    }
                }

                if(!study.cavd_affiliation) {
                    study.cavd_affiliation = "[Unaffiliated]";
                }

                study.pub_available_data_count = 0;
                var publications = this.publicationData.filter(function(pub){
                    return pub.prot === study.study_name;
                }).map(function(pub) {
                    return {
                        label: pub.publication_label,
                        available_data_count: pub.available_data_count
                    };
                }).sort(function(pubA, pubB){
                    return ((pubA.sortIndex || 0) - (pubB.sortIndex || 0)) ||
                            ((new Date(pubA.date)) > (new Date(pubB.date)) ? -1 : 1)
                });

                var documents = this.documentData.filter(function(doc) {
                    return doc.document_type === 'Report or summary' || doc.document_type === 'Study plan or protocol' || doc.document_type === 'Non-Integrated Assay';
                }, this).filter(function(doc) {
                    return study.study_name === doc.prot;
                }, this).map(function(doc) {
                    return {
                        id: doc.document_id,
                        label: doc.label,
                        fileName: doc.filename,
                        docType: doc.document_type,
                        isLinkValid: doc.isLinkValid,
                        hasPermission: doc.accessible,
                        dataStatus: this.assayData.filter(function(assay) {
                            return doc.assay_identifier !== null && assay.data_link_id === doc.assay_identifier;
                        }, this)[0]

                    }
                }, this).sort(function(docA, docB){
                    return (docA.sortIndex || 0) - (docB.sortIndex || 0);
                }, this);

                study.products = products;
                study.product_names = productNames;
                study.product_classes = productClasses;
                study.assays = assays;
                study.assays_added = assaysAdded;
                study.assays_added_count = assaysAdded.length;
                study.publications = publications;
                study.protocol_docs_and_study_plans = documents.filter(function (doc) {
                    return doc.label && doc.docType === 'Study plan or protocol';
                });
                study.protocol_docs_and_study_plans_has_permission = study.protocol_docs_and_study_plans.filter(function(doc) {
                    return doc.hasPermission === true;
                }).length > 0;

                // non-integrated assay with potentially downloadable data, which may or may not also have a learn assay page
                var non_integrated_assay = this.niDocumentData.filter(function (niData) {
                    return niData.prot === study.study_name;
                });

                //non-integrated assay that has metadata in cds.studyassay, which may or may not also have a learn assay page
                Ext.each(nonIntegratedAssays, function(niAssay) {
                    var nonIntegratedAssay = {
                        id: undefined,
                        label: niAssay.data_id,
                        isLinkValid: undefined,
                        hasPermission: hasStudyAccess,
                        assayIdentifier: niAssay.data_id,
                        // hasData: niAssay.has_data
                    };
                    non_integrated_assay.push(nonIntegratedAssay);
                });

                //combine duplicates
                var non_integrated_assay_data_map = [];
                Ext.each(non_integrated_assay, function (niAssay) {
                    var existingAssay = non_integrated_assay_data_map[niAssay.assayIdentifier];
                    if (existingAssay) {

                        var combinedAssay = {
                            id: existingAssay.id ? existingAssay.id : niAssay.id,
                            label: existingAssay.label ? existingAssay.label : niAssay.label,
                            isLinkValid: Ext.isDefined(existingAssay.isLinkValid) ? existingAssay.isLinkValid : niAssay.isLinkValid,
                            // filePath: Connector.plugin.DocumentValidation.getStudyDocumentUrl(existingAssay.fileName || niAssay.fileName, study.study_name, existingAssay.id || niAssay.id),
                            hasPermission: hasStudyAccess,
                            assayIdentifier: existingAssay.assayIdentifier ? existingAssay.assayIdentifier : niAssay.assayIdentifier,
                            // hasData: !!existingAssay.filePath || !!niAssay.filePath
                        };
                        non_integrated_assay_data_map[niAssay.assayIdentifier] = combinedAssay;
                    }
                    else {
                        non_integrated_assay_data_map[niAssay.assayIdentifier] = niAssay;
                    }
                }, this);

                study.non_integrated_assay_data =[];
                for (var prop in non_integrated_assay_data_map) {
                    if (non_integrated_assay_data_map.hasOwnProperty(prop)) {
                        study.non_integrated_assay_data.push(non_integrated_assay_data_map[prop]);
                    }
                }

                study.non_integrated_assay_data.sort(function(a, b) {
                    return Connector.model.Filter.sorters.natural(a.label, b.label);
                });

                study.non_integrated_assay_data_has_permission = study.non_integrated_assay_data.filter(function(doc) {
                    return doc.hasPermission === true
                }).length > 0;

                var niAssaysAdded = study.non_integrated_assay_data.filter(function (value) {
                    return value.isLinkValid;
                });

                study.ni_assays_added = niAssaysAdded;
                study.ni_assays_added_count = niAssaysAdded.length;

                if (study.ni_assays_added_count > 0) {
                    study.ni_data_availability = true;
                }

                var pubDataAvailable = study.publications.filter(function(pub) {
                    return pub.available_data_count > 0;
                })
                study.pub_available_data_count = pubDataAvailable.length;
                study.data_types_available = this.getDataTypesAvailable(study);
                study.data_available = (study.assays_added_count > 0 || study.ni_assays_added_count > 0 || study.pub_available_data_count > 0) ? 'Data added' : 'Data not added';

                studies.push(study);
            }, this);

            studies.sort(function(studyA, studyB) {
                return Connector.model.Filter.sorters.natural(studyA.label, studyB.label);
            });

            this.studyData = undefined;
            this.assayData = undefined;
            this.productData = undefined;
            this.documentData = undefined;
            this.niDocumentData = undefined;
            this.publicationData = undefined;
            this.assayIdentifiers = undefined;

            this.loadRawData(studies);
            this.dataLoaded = true;
            this.fireEvent('dataloaded');
        }
    }
});
