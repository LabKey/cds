/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Study', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.Study',

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadSlice : function(slice) {
        this.studyData = undefined;
        this.productData = undefined;
        this.assayData = undefined;
        this.documentData = undefined;
        this.publicationData = undefined;
        this.relationshipData = undefined;

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'study',
            success: this.onLoadStudies,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'ds_productsforstudies',
            success: this.onLoadProducts,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'ds_assaysforstudies',
            success: this.onLoadAssays,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'ds_documentsforstudies',
            success: this.onLoadDocuments,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'ds_publicationsforstudies',
            success: this.onLoadPublications,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'ds_relationshipsforstudies',
            success: this.onLoadRelationships,
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

    onLoadRelationships : function(relationshipData) {
        this.relationshipData = relationshipData.rows;
        this._onLoadComplete();
    },

    _onLoadComplete : function() {
        if (Ext.isDefined(this.studyData) && Ext.isDefined(this.productData) && Ext.isDefined(this.assayData)
                && Ext.isDefined(this.documentData) && Ext.isDefined(this.publicationData) && Ext.isDefined(this.relationshipData)) {
            var studies = [], products, productNames;

            // join products to study
            Ext.each(this.studyData, function(study) {
                study.study_title = study.title;
                if (study.groups || study.treatment_schema_link) {
                    study.groups_treatment_schema = '';
                    if (study.treatment_schema_link) {
                        study.groups_treatment_schema += '<div class="schema-link"><a href="';
                        study.groups_treatment_schema += study.treatment_schema_link;
                        study.groups_treatment_schema += '" target="_blank">Click for treatment schema</a></div>';
                    }
                    if (study.groups) {
                        study.groups_treatment_schema += study.groups;
                    }
                }
                if (study.methods || study.assay_schema_link) {
                    study.methods_assay_schema = '';
                    if (study.assay_schema_link) {
                        study.methods_assay_schema += '<div class="schema-link"><a href="';
                        study.methods_assay_schema += study.assay_schema_link;
                        study.methods_assay_schema += '" target="_blank">Click for assay schema</a></div>';
                    }
                    if (study.methods) {
                        study.methods_assay_schema += study.methods;
                    }
                }

                if (!study.strategy) {
                    study.strategy = '[blank]';
                }

                var startDate = study.first_enr_date || study.start_date;
                if (startDate) {
                    study.start_year = (new Date(startDate)).getFullYear().toString();
                } else {
                    study.start_year = 'Not available';
                }
                study.date_to_sort_on = study.stage + "|" + startDate;

                products = [];
                productNames = [];
                for (var p=0; p < this.productData.length; p++) {
                    if (study.study_name === this.productData[p].study_name) {
                        // Consider: These should probably be of type Connector.app.model.StudyProducts
                        // but it'd be good to then have a common sourcing mechanism for LA models
                        products.push({
                            product_id: this.productData[p].product_id,
                            product_name: this.productData[p].product_name
                        });
                        productNames.push(this.productData[p].product_name);
                    }
                }
                products.sort(function (p1, p2) {
                    return p1.product_name.toLowerCase().localeCompare(p2.product_name.toLowerCase())
                });
                study.product_to_sort_on = products[0] ? products[0].product_name.toLowerCase() : '';

                var assays = [], assaysAdded = [], assayAddedCount = 0;
                study.data_availability = false;
                for (var a=0; a < this.assayData.length; a++) {
                    if (study.study_name === this.assayData[a].prot) {
                        study.data_availability = study.data_availability || this.assayData[a].has_data;
                        var assay = {
                            assay_short_name: this.assayData[a].assay_short_name,
                            study_assay_id: this.assayData[a].study_assay_id,
                            assay_identifier: this.assayData[a].assay_identifier,
                            has_data: this.assayData[a].has_data,
                            assay_status: this.assayData[a].assay_status
                        };
                        assays.push(assay);
                        if (this.assayData[a].has_data) {
                            assaysAdded.push(assay);
                            assayAddedCount += 1;
                        }
                    }
                }

                assaysAdded.sort(function (a1, a2) {
                    return a1.assay_short_name.toLowerCase().localeCompare(a2.assay_short_name.toLowerCase())
                });
                assays.sort(function (a1, a2) {
                    var val1 = a1.assay_short_name ? a1.assay_short_name : a1.study_assay_id;
                    var val2 = a2.assay_short_name ? a2.assay_short_name : a2.study_assay_id;
                    return val1.toLowerCase().localeCompare(val2.toLowerCase())
                });

                for (var d=0; d < this.documentData.length; d++) {
                    if (study.study_name === this.documentData[d].prot)
                    {
                        if (this.documentData[d].document_type === 'grant_document') {
                            study.cavd_affiliation = this.documentData[d].label;
                            study.cavd_affiliation_filename = this.documentData[d].filename;
                            study.cavd_affiliation_file_exists = false;  // set to false until we check (when StudyHeader is actually loaded)
                        }
                    }
                }

                var publications = this.publicationData.filter(function(pub){
                    return pub.prot === study.study_name;
                }).map(function(pub) {
                    return {
                        id: pub.id,
                        title: pub.title,
                        authors: pub.author_all,
                        journal: pub.journal_short,
                        date: pub.date,
                        volume: pub.volume,
                        issue: pub.issue,
                        location: pub.location,
                        pmid: pub.pmid,
                        link: pub.link,
                        sortIndex: pub.publication_order
                    };
                }).sort(function(pubA, pubB){
                    return ((pubA.sortIndex || 0) - (pubB.sortIndex || 0)) ||
                            ((new Date(pubA.date)) > (new Date(pubB.date)) ? -1 : 1)
                });

                var documentsAndPublications = this.publicationData.concat(this.documentData.filter(function(doc) {
                    return doc.document_type === 'Report or summary' || doc.document_type === 'Study plan or protocol'
                })).filter(function(doc) {
                    return study.study_name === doc.prot;
                }).map(function(doc) {
                    return {
                        id: doc.document_id,
                        label: doc.label,
                        fileName: LABKEY.contextPath + LABKEY.moduleContext.cds.StaticPath + doc.filename,
                        docType: doc.document_type,
                        isLinkValid: false,
                        suffix: '(' + Connector.utility.FileExtension.fileDisplayType(doc.filename) +')',
                        sortIndex: doc.document_order
                    }
                }).sort(function(docA, docB){
                    return (docA.sortIndex || 0) - (docB.sortIndex || 0);
                });

                var relationshipOrder = ['Main study', 'Extension study', 'Co-conducted study', 'HIV follow up study', 'Ancillary study'];

                var relationships = this.relationshipData.filter(function(rel){
                    return rel.prot === study.study_name;
                }).map(function(rel) {
                    return {
                        prot: rel.prot,
                        rel_prot: rel.rel_prot,
                        relationship: rel.relationship,
                        // sort not-found relationships last
                        sortIndex: relationshipOrder.indexOf(rel.relationship) === -1 ? relationshipOrder.length : relationshipOrder.indexOf(rel.relationship)
                    };
                }).sort(function(relA, relB){
                    if(relA.sortIndex !== relB.sortIndex)
                        return relA.sortIndex - relB.sortIndex;
                    return LABKEY.app.model.Filter.sorters.natural(relA.rel_prot, relB.rel_prot);
                });

                study.products = products;
                study.product_names = productNames;
                study.assays = assays;
                study.assays_added = assaysAdded;
                study.assays_added_count = assaysAdded.length;
                study.publications = publications;
                study.relationships = relationships;
                study.protocol_docs_and_study_plans = documentsAndPublications.filter(function (doc) {
                    return doc.label && doc.docType === 'Study plan or protocol';
                });
                study.data_listings_and_reports = documentsAndPublications.filter(function (doc) {
                    return doc.label && doc.docType === 'Report or summary';
                });
                studies.push(study);
            }, this);

            studies.sort(function(studyA, studyB) {
                return LABKEY.app.model.Filter.sorters.natural(studyA.label, studyB.label);
            });

            this.studyData = undefined;
            this.assayData = undefined;
            this.productData = undefined;
            this.documentData = undefined;
            this.publicationData = undefined;
            this.relationshipData = undefined;

            this.loadRawData(studies);
        }
    }
});
