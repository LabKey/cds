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
        this.mabGroups = undefined;
        this.subjectGroups = undefined;

        var me = this;

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_groups',
            success: this.onLoadLearnGroups,
            scope: this
        });

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'mabgroup',
            scope: this,
            success: function (mabGroupData) {
                this.mabGroups = [];
                Ext.each(mabGroupData.rows, function (row) {
                    this.mabGroups.push({
                        group_id: row.RowId,
                        group_name: row.Label,
                        description: row.Description,
                        shared: row.Shared
                    })
                }, this);
            }
        });

        Ext4.Ajax.request({
            url: LABKEY.ActionURL.buildURL('participant-group', 'browseParticipantGroups.api', null, {
                includeParticipantIds: true,
                type: 'participantGroup'
            }),
            method: 'GET',
            success: LABKEY.Utils.getCallbackWrapper(function (response) {
                me.onLoadParticipantGroups(response);
            }, me)
        });
    },

    onLoadParticipantGroups : function(response) {
        this.groupDetails = [];
        this.subjectGroups = [];
        Ext.each(response.groups, function(group) {
            if (group.id !== -1) {
                // todo, delete group details
                this.groupDetails.push(group);
                this.subjectGroups.push(group);
            }
        }, this);

        this._onLoadComplete();
    },

    onLoadLearnGroups: function (groupsInfo) {
        this.groupsData = groupsInfo.rows;
        this._onLoadComplete();
    },

    _onLoadComplete: function () {

        if (Ext.isDefined(this.groupsData) && Ext.isDefined(this.groupDetails) && Ext.isDefined(this.mabGroups) && Ext.isDefined(this.subjectGroups)) {

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

                //groupTypes are "My Saved Groups" and "Curated Groups"
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

                if (studiesPerGrp.length > 0) {
/*
                    learnGroups.push({
                        group_type: groupTypes[0],
                        group_name: grpName,
                        studies: studies.map(function (study) {
                            return { study_label: study }
                        }, this),
                        study_names: studies,
                        study_names_to_sort_on: study_to_sort_on,
                        studySpecies: species.map(function (s) {
                            return { species: s }
                        }, this),
                        species_names: species,
                        species_to_sort_on: species_to_sort_on,
                        products: products.map(function (p) {
                            return { product_name: p }
                        }, this),
                        product_names: products,
                        product_to_sort_on: product_to_sort_on,
                        assays: assays.map(function (a) {
                            return { assay_identifier: a }
                        }, this),
                        assay_to_sort_on: assay_to_sort_on,
                        assay_names: assays,
                        description: groupDetail.length > 0 && groupDetail[0].description ? groupDetail[0].description : "No description given.",
                        group_id: groupDetail[0].id,
                        isMab: false
                    });
*/
                }

            }, this);

            Ext.each(this.mabGroups, function (mabGrp) {
                // note 1_my_saved_groups & 2_curated_groups below, so that it displays in the
                // "Ext template grouping" order we want. It's the same for subject groups (in learn_groups.sql)
/*
                learnGroups.push({
                    group_id: mabGrp.group_id,
                    group_type: mabGrp.shared ? '2_curated_groups' : '1_my_saved_groups',
                    group_name: mabGrp.group_name,
                    description: !mabGrp.description ? "No description given." : mabGrp.description,
                    isMab: true
                });
*/
            });

            Ext.each(this.subjectGroups, function(group) {
                console.log(group);

                // clean up redundancies between the merged stores
                group.group_id = group.id;
                group.group_type = group.shared ? '2_curated_groups' : '1_my_saved_groups';
                group.group_name = group.label;
                group.description = group.description ? group.description : "No description given."

                // parse the filters
                if (Ext.isString(group.filters))
                {
                    let studies = [];
                    let assays = [];
                    let species = [];
                    let products = [];

                    Ext.each(Connector.model.Filter.fromJSON(group.filters), function(filter)
                    {
                        //console.log(filter);
                        let members = undefined;

                        switch (filter.hierarchy)
                        {
                            // species
                            case '[Subject.Species]':
                                members = species;
                                break;

                            // products
                            case '[Study Product.Product Name]':
                            case '[Study Product.Product Type]':
                            case '[Study Product.Developer]':
                            case '[Study Product.Product Class]':
                                members = products;
                                break;

                            // treatment groups and studies via assay
                            case '[Study.Treatment]':
                            case '[Assay.Study]':
                                members = studies;
                                break;

                            // assay types
                            case '[Assay.Name]':
                                members = assays;
                                break;
                        }
                        if (members)
                            this.parseLevelMembers(filter.hierarchy, filter.members, members);

                    }, this);

                    // need to get sorts figured out for each column
                    group.study_names = studies;
                    group.studies = studies.map(function(study) {
                        return {study_label: study}
                    });

                    group.species_names = species;
                    group.studySpecies = species.map(function(s) {
                        return {species: s}
                    });
                    group.product_names = products;
                    group.products = products.map(function(p) {
                        return {product_name : p}
                    });

                    group.assay_names = assays;
                    group.assays = assays.map(function (a) {
                        return {assay_identifier: a}
                    });
                }
                learnGroups.push(group);
            }, this);

            this.groupsData = undefined;
            this.mabGroups = undefined;
            this.subjectGroups = undefined;

            this.loadRawData(learnGroups);
            this.dataLoaded = true;
            this.fireEvent('dataloaded');
        }
    },

    parseLevelMembers : function(hierarchy, members, collection) {
        Ext.each(members, function(member){
            var memberName = member.uniqueName;
            var parts = memberName.split('.');

            if (memberName.startsWith(hierarchy) && parts.length > 1) {
                let val = parts[parts.length - 1];
                val = val.replace('[', '').replace(']', '');
                collection.push(val);
            }
        }, this);
    },

    refreshData: function(cb, cbScope) {
        console.log('hooray, refreshing store', cb, cbScope);
        this.removeAll();
        this.loadSlice();
    }
});
