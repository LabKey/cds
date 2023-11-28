/*
 * Copyright (c) 2023 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Group', {

    extend: 'Ext.data.Store',

    model: 'Connector.app.model.Group',

    groupField: 'group_type',

    constructor: function (config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadSlice: function () {

        this.groupsData = undefined;
        this.groupDetails = undefined;
        var me = this;

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_groups',
            success: this.onLoadLearnGroups,
            scope: this
        });

        Ext4.Ajax.request({
            url: LABKEY.ActionURL.buildURL('participant-group', 'browseParticipantGroups.api', null, {
                includeParticipantIds: true,
                type: 'participantGroup'
            }),
            method: 'GET',
            success: LABKEY.Utils.getCallbackWrapper(function (response) {
                me.groupDetails = response.groups.filter(function (grp) {
                    return grp.id !== -1
                });
                me._onLoadComplete();
            }, me)
        });
    },

    onLoadLearnGroups: function (groupsInfo) {
        this.groupsData = groupsInfo.rows;
        this._onLoadComplete();
    },

    _onLoadComplete: function () {
        if (Ext.isDefined(this.groupsData) && Ext.isDefined(this.groupDetails)) {

            var learnGroups = [];

            var uniqueGroupNames = this.groupsData.map(function (grp) {
                return grp.group_name;
            }).filter(function (value, index, self) {
                return self.indexOf(value) === index;
            });

            Ext.each(uniqueGroupNames, function (grpName) {

                var groupDetail = this.groupDetails.filter(function (grp) {
                    return grp.label === grpName;
                });

                var studiesPerGrp = this.groupsData.filter(function (grp) {
                    return grp.group_name === grpName;
                }).map(function (grp) {
                    return {
                        group_type: grp.group_type,
                        study_label: grp.study_label,
                        species: grp.species,
                        product_name: grp.product_name,
                        assay: grp.assay_identifier
                    };
                });

                var groupTypes = studiesPerGrp.map(function (study) {
                    return study.group_type;
                }).filter(function (value, index, self) {
                    return self.indexOf(value) === index;
                });

                var studies = studiesPerGrp.map(function (study) {
                    return study.study_label;
                }).filter(function (value, index, self) {
                    return self.indexOf(value) === index;
                });
                studies.sort(function (p1, p2) {
                    return p1.toLowerCase().localeCompare(p2.toLowerCase())
                });
                var study_to_sort_on = studies[0] ? studies[0].toLowerCase() : '';

                var species = studiesPerGrp.map(function (study) {
                    return study.species;
                }).filter(function (value, index, self) {
                    return null !== value && self.indexOf(value) === index;
                });
                species.sort(function (p1, p2) {
                    return p1.toLowerCase().localeCompare(p2.toLowerCase())
                });
                var species_to_sort_on = species[0] ? species[0].toLowerCase() : '';

                var products = studiesPerGrp.map(function (study) {
                    return study.product_name;
                }).filter(function (value, index, self) {
                    return null !== value && self.indexOf(value) === index;
                });

                products.sort(function (p1, p2) {
                    return p1.toLowerCase().localeCompare(p2.toLowerCase())
                });
                var product_to_sort_on = products[0] ? products[0].toLowerCase() : '';

                var assays = studiesPerGrp.map(function (study) {
                    return study.assay;
                }).filter(function (value, index, self) {
                    return null !== value && self.indexOf(value) === index;
                });

                assays.sort(function (p1, p2) {
                    return p1.toLowerCase().localeCompare(p2.toLowerCase())
                });
                var assay_to_sort_on = assays[0] ? assays[0].toLowerCase() : '';


                if (studiesPerGrp.length > 0)
                    learnGroups.push({
                        group_type: groupTypes[0],
                        group_name: grpName,
                        studies: studies.map(function (study) {
                            return {study_label: study}
                        }, this),
                        study_names: studies,
                        study_names_to_sort_on: study_to_sort_on,
                        studySpecies: species.map(function (s) {
                            return {species: s}
                        }, this),
                        species_names: species,
                        species_to_sort_on: species_to_sort_on,
                        products: products.map(function (p) {
                            return {product_name: p}
                        }, this),
                        product_names: products,
                        product_to_sort_on: product_to_sort_on,
                        assays: assays.map(function (a) {
                            return {assay_identifier: a}
                        }, this),
                        assay_to_sort_on: assay_to_sort_on,
                        assay_names: assays,
                        description: groupDetail.length > 0 && groupDetail[0].description  ? groupDetail[0].description : "No description given.",
                        group_id: groupDetail[0].id
                    });

            }, this);

            this.groupsData = undefined;

            this.loadRawData(learnGroups);
            this.dataLoaded = true;
            this.fireEvent('dataloaded');
        }
    }
});
