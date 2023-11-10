/*
 * Copyright (c) 2023 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.StudyOverview', {

    extend : 'Connector.app.store.SavedReports',

    mixins: {
        studyAccessHelper: 'Connector.app.store.PermissionedStudy'
    },

    model : 'Connector.app.model.StudyOverview',

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadSlice : function(slice, id) {
        this.callParent(slice);

        this.studyData = undefined;
        this.productData = undefined;
        this.assayData = undefined;
        this.documentData = undefined;
        this.niDocumentData = undefined;
        this.publicationData = undefined;
        this.relationshipData = undefined;
        this.relationshipOrderData = undefined;
        this.mabMixData = undefined;
        this.assayIdentifiers = undefined;
        this.studyReportsData = undefined;
        this.studyCuratedGroupData = undefined;

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
            filterArray: [
                LABKEY.Filter.create('study_name', id, LABKEY.Filter.Types.EQUALS)
            ],
            success: this.onLoadProducts,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_assaysforstudies',
            filterArray: [
                LABKEY.Filter.create('prot', id, LABKEY.Filter.Types.EQUALS)
            ],
            success: this.onLoadAssays,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_documentsforstudies',
            filterArray: [
                LABKEY.Filter.create('prot', id, LABKEY.Filter.Types.EQUALS)
            ],
            success: this.onLoadDocuments,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_publicationsforstudies',
            filterArray: [
                LABKEY.Filter.create('prot', id, LABKEY.Filter.Types.EQUALS)
            ],
            success: this.onLoadPublications,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_relationshipsforstudies',
            filterArray: [
                LABKEY.Filter.create('prot', id, LABKEY.Filter.Types.EQUALS)
            ],
            success: this.onLoadRelationships,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_studyrelationshiporder',
            success: this.onLoadRelationshipOrder,
            scope: this,
            sort: 'rel_sort_order'
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_mab_mix_forstudies',
            filterArray: [
                LABKEY.Filter.create('prot', id, LABKEY.Filter.Types.EQUALS)
            ],
            success: this.onLoadMabs,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'integratedAssays',
            success: this.onLoadAssayIdentifiers,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'studyReport',
            filterArray: [
                LABKEY.Filter.create('prot', id, LABKEY.Filter.Types.EQUALS)
            ],
            success: this.onLoadStudyReport,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'studyCuratedGrpWithLabel',
            filterArray: [
                LABKEY.Filter.create('prot', id, LABKEY.Filter.Types.EQUALS)
            ],
            success: this.onLoadStudyCuratedGroup,
            scope: this
        });
        LABKEY.Ajax.request({
            url : LABKEY.ActionURL.buildURL("cds", "getNonIntegratedDocument.api", null, {prot: id}),
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

    onLoadRelationships : function(relationshipData) {
        this.relationshipData = relationshipData.rows;
        this._onLoadComplete();
    },

    onLoadRelationshipOrder : function(relationshipOrderData) {
        this.relationshipOrderData = relationshipOrderData.rows;
        this._onLoadComplete();
    },

    onLoadMabs : function(mabMixData) {
        this.mabMixData = mabMixData.rows;
        this._onLoadComplete();
    },

    onLoadAssayIdentifiers : function(assayIdentifiers) {
        this.assayIdentifiers = assayIdentifiers.rows;
        this._onLoadComplete();
    },

    onLoadStudyReport : function(studyReports) {
        this.studyReportsData = studyReports.rows;
        this._onLoadComplete();
    },

    onLoadStudyCuratedGroup : function(studyCuratedGroup) {
        this.studyCuratedGroupData = studyCuratedGroup.rows;
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
                && Ext.isDefined(this.relationshipData)
                && Ext.isDefined(this.relationshipOrderData)
                && Ext.isDefined(this.accessibleStudies)
                && Ext.isDefined(this.mabMixData)
                && Ext.isDefined(this.assayIdentifiers)
                && Ext.isDefined(this.studyReportsData)
                && Ext.isDefined(this.studyCuratedGroupData)
                && this.isLoadComplete()) {
            var studies = [], products, productNames, productClasses;
            var relationshipOrderList = this.relationshipOrderData.map(function(relOrder) {
                return relOrder.relationship;
            });
            var studyNames = this.studyData.map(function(study) {
                return study.study_name;
            });

            var integratedAssays = this.assayIdentifiers.map(function(integratedAssay) {return integratedAssay.assay_identifier});
            var assaysWithLearnPage = this.assayData.map(function(assay) { return assay.assay_identifier}).filter(function (value, index, self) {
                return value === undefined || value === null ? false : self.indexOf(value) === index;
            });

            // join products to study
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
                            has_access: hasStudyAccess,
                            data_status: this.assayData[a].assay_status,
                            has_assay_learn: assaysWithLearnPage.includes(this.assayData[a].assay_identifier) //if there's a learn assay page
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
                    if (study.study_name === this.documentData[d].prot)
                    {
                        if (this.documentData[d].document_type === 'grant_document') {
                            study.cavd_affiliation = this.documentData[d].label;
                            study.cavd_affiliation_filename = this.documentData[d].filename;
                            study.cavd_affiliation_file_accessible = undefined;  // not set until we check (when StudyHeader is actually loaded)
                            study.cavd_affiliation_file_has_permission = this.documentData[d].accessible;
                            study.cavd_affiliation_file_path = Connector.plugin.DocumentValidation.getStudyDocumentUrl(this.documentData[d].filename, study.study_name, this.documentData[d].document_id);
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
                        id: pub.id,
                        title: pub.title,
                        label: pub.publication_label,
                        authors: pub.author_all,
                        pub_abstract: pub.publication_abstract,
                        journal: pub.journal_short,
                        date: pub.date,
                        volume: pub.volume,
                        issue: pub.issue,
                        location: pub.location,
                        pmid: pub.pmid,
                        link: pub.link,
                        sortIndex: pub.publication_order,
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
                        suffix: '(' + Connector.utility.FileExtension.fileDisplayType(doc.filename) +')',
                        sortIndex: doc.document_order,
                        filePath: Connector.plugin.DocumentValidation.getStudyDocumentUrl(doc.filename, study.study_name, doc.document_id),
                        hasPermission: doc.accessible,
                        assayIdentifier: doc.assay_identifier,
                        hasAssayLearn: assaysWithLearnPage.includes(doc.assay_identifier),
                        dataStatus: this.assayData.filter(function(assay) {
                            return doc.assay_identifier !== null && assay.data_link_id === doc.assay_identifier;
                        }, this)[0]

                    }
                }, this).sort(function(docA, docB){
                    return (docA.sortIndex || 0) - (docB.sortIndex || 0);
                }, this);

                var relationships = this.relationshipData.filter(function(rel){
                    // only return studies this user can see and that are related
                    return (studyNames.indexOf(rel.rel_prot) !== -1) && (rel.prot === study.study_name);
                }).map(function(rel) {
                    return {
                        prot: rel.prot,
                        rel_prot: rel.rel_prot,
                        relationship: rel.relationship,
                        // sort not-found relationships last
                        sortIndex: relationshipOrderList.indexOf(rel.relationship) === -1 ? relationshipOrderList.length : relationshipOrderList.indexOf(rel.relationship),
                        rel_prot_label: this.studyData.filter(function (study) {
                            return study.study_name === rel.rel_prot;
                        })[0].label
                    };
                }, this).sort(function(relA, relB){
                    if(relA.sortIndex !== relB.sortIndex)
                        return relA.sortIndex - relB.sortIndex;
                    return Connector.model.Filter.sorters.natural(relA.rel_prot, relB.rel_prot);
                });


                var mabs = this.mabMixData.filter(function(mab) {
                    return mab.prot === study.study_name;
                }).map(function(mab) {
                    return {
                        name: mab.mab_mix_name_std,
                        link: null,
                        label: mab.mab_label == null || mab.mab_label.length == 0 ? null : mab.mab_label
                    };
                }, this).sort(function(a, b) {
                    return Connector.model.Filter.sorters.natural(a.name, b.name);
                });

                study.products = products;
                study.product_names = productNames;
                study.product_classes = productClasses;
                study.assays = assays;
                study.assays_added = assaysAdded;
                study.assays_added_count = assaysAdded.length;
                study.publications = publications;
                study.relationships = relationships;
                study.monoclonal_antibodies = mabs;
                study.protocol_docs_and_study_plans = documents.filter(function (doc) {
                    return doc.label && doc.docType === 'Study plan or protocol';
                });
                study.protocol_docs_and_study_plans_has_permission = study.protocol_docs_and_study_plans.filter(function(doc) {
                    return doc.hasPermission === true
                }).length > 0;
                study.data_listings_and_reports = documents.filter(function (doc) {
                    return doc.label && doc.docType === 'Report or summary';
                });
                study.data_listings_and_reports_has_permission = study.data_listings_and_reports.filter(function(doc) {
                            return doc.hasPermission === true
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
                        fileName: undefined,
                        docType: undefined,
                        isLinkValid: undefined,
                        suffix: undefined,
                        sortIndex: undefined,
                        filePath: undefined,
                        hasPermission: hasStudyAccess,
                        assayIdentifier: niAssay.data_id,
                        hasAssayLearn: niAssay.has_assay_learn,
                        dataStatus: niAssay.data_status,
                        hasData: niAssay.has_data
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
                            fileName: existingAssay.fileName ? existingAssay.fileName : niAssay.fileName,
                            docType: existingAssay.docType ? existingAssay.docType : niAssay.docType,
                            isLinkValid: Ext.isDefined(existingAssay.isLinkValid) ? existingAssay.isLinkValid : niAssay.isLinkValid,
                            suffix: '(' + Connector.utility.FileExtension.fileDisplayType(existingAssay.fileName || niAssay.fileName) +')',
                            sortIndex: existingAssay.sortIndex ? existingAssay.sortIndex : niAssay.sortIndex,
                            filePath: Connector.plugin.DocumentValidation.getStudyDocumentUrl(existingAssay.fileName || niAssay.fileName, study.study_name, existingAssay.id || niAssay.id),
                            hasPermission: hasStudyAccess,
                            assayIdentifier: existingAssay.assayIdentifier ? existingAssay.assayIdentifier : niAssay.assayIdentifier,
                            hasAssayLearn: existingAssay.hasAssayLearn ? existingAssay.hasAssayLearn : niAssay.hasAssayLearn,
                            dataStatus: existingAssay.dataStatus ? existingAssay.dataStatus : niAssay.dataStatus,
                            hasData: !!existingAssay.filePath || !!niAssay.filePath
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

                var interactiveReports = [];
                for (var i=0; i < this.studyReportsData.length; i++) {
                    if (study.study_name === this.studyReportsData[i].prot) {
                        var id = this.studyReportsData[i].cds_report_id ? this.studyReportsData[i].cds_report_id.toString() : undefined;
                        var reportLink = this.studyReportsData[i].cds_report_link ? this.studyReportsData[i].cds_report_link: undefined;
                        var reportLabel = this.studyReportsData[i].cds_report_label ? this.studyReportsData[i].cds_report_label: undefined;

                        var reportObj = this.savedReportsData.filter(function(val) { return val.reportId === id;}, this);

                        if ((reportObj && reportObj.length > 0) || (reportLink && reportLabel)){
                            var report  = {
                                report_id: id,
                                report_link: reportLink,
                                label: reportLabel ? reportLabel : (id && reportObj && reportObj[0] ? reportObj[0].reportName : undefined)
                            };
                            interactiveReports.push(report);
                        }
                    }
                }
                interactiveReports.sort(function (r1, r2) {
                    return r1.label.toLowerCase().localeCompare(r2.label.toLowerCase())
                });
                study.interactive_reports = interactiveReports;

                var curatedGroups = [];
                for (var j=0; j < this.studyCuratedGroupData.length; j++) {
                    if (study.study_name === this.studyCuratedGroupData[j].prot) {
                        curatedGroups.push(this.studyCuratedGroupData[j]);
                    }
                }
                study.curated_groups = curatedGroups;

                // process 'groups' to display 10 or more with show all/show less
                var grpHeader= study.groups && study.groups.length > 0 ? study.groups.split('<ul>', 1) : undefined;
                study.groups_header = grpHeader ? grpHeader[0] : undefined;
                var groupDiv = document.createElement('div');
                groupDiv.innerHTML = study.groups;
                var groups = groupDiv.querySelectorAll('div > ul > li');
                var groupsArray = [];

                this.parseGroupList(study.groups);

                if (groups && groups.length > 0) {
                    for (var k = 0; k < groups.length; k++) {
                        var str = groups[k].innerText;
                        if (groupsArray.indexOf(str) === -1) {
                            groupsArray.push({label: str});
                        }
                    }
                }
                study.groups_data = groupsArray;

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
            this.relationshipData = undefined;
            this.relationshipOrderData = undefined;
            this.assayIdentifiers = undefined;
            this.studyReportsData = undefined;
            this.savedReportsData = [];
            this.studyCuratedGroupData = undefined;

            this.loadRawData(studies);
            this.dataLoaded = true;
            this.fireEvent('dataloaded');
        }
    },

    parseGroupList : function(groupHtml){
        // inject the raw HTML into a div, so we can query it
        var groupDiv = document.createElement('div');
        groupDiv.innerHTML = groupHtml;

        // get all the top level items
        var groups = groupDiv.querySelectorAll(':scope > ul > li');

        var getChildren = function(group, indent){
            // ignore empty list items <li></li>
            if (group.firstChild){
                var text = group.firstChild.data;
                console.log(indent + text);
                var children = group.querySelectorAll(':scope > ul > li');
                if (children && children.length > 0){
                    return children;
                }
                else {
                    return [];
                }
            }
        };

        console.log('found ' + groups.length + ' top level items');

        // handle at most 2 levels of nesting, anything deeper will be ignored
        Ext.each(groups, function(group){
            var children = getChildren(group, '');

            Ext.each(children, function(child){
                var children2 = getChildren(child, '\t');

                Ext.each(children2, function(child){
                    getChildren(child, '\t\t');
                });
            });
        });
    }
});
