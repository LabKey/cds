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
            var savedGroupLabel = "My saved groups";
            var curatedGroupLabel = "Curated groups";

            var savedGroups = [];
            var curatedGroups = [];

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
                        study_label: grp.studyLabel,
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

                var species = studiesPerGrp.map(function (study) {
                    return study.species;
                }).filter(function (value, index, self) {
                    return null !== value && self.indexOf(value) === index;
                });

                var products = studiesPerGrp.map(function (study) {
                    return study.product_name;
                }).filter(function (value, index, self) {
                    return null !== value && self.indexOf(value) === index;
                });

                var assays = studiesPerGrp.map(function (study) {
                    return study.assay;
                }).filter(function (value, index, self) {
                    return null !== value && self.indexOf(value) === index;
                });

                if (studiesPerGrp.length > 0)
                    learnGroups.push({
                        group_type: groupTypes[0],
                        group_name: grpName,
                        studies: studies.map(function (study) {
                            return {study_label: study}
                        }, this),
                        studySpecies: species.map(function (s) {
                            return {species: s}
                        }, this),
                        products: products.map(function (p) {
                            return {product_name: p}
                        }, this),
                        assays: assays.map(function (p) {
                            return {assay_identifier: p}
                        }, this),
                        description: groupDetail.length > 0 && groupDetail[0].description  ? groupDetail[0].description : "No description given.",
                    });

            }, this);

            this.groupsData = undefined;

            this.loadRawData(learnGroups);
            this.dataLoaded = true;
            this.fireEvent('dataloaded');
        }
    }
});
