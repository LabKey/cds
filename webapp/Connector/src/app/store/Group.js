/*
 * Copyright (c) 2023 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Group', {

    extend: 'Ext.data.Store',

    model: 'Connector.app.model.Group',

    groupField: 'shared',

    sorters : [{
        sorterFn: function (group1, group2) {
            var g1shared = group1.get('shared');
            var g2shared = group2.get('shared');
            if(g1shared !== g2shared) {  // all non-shared items come before all shared items
                if (g1shared === true) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
            if(g1shared === false) {  // both unshared, sort alphabetically
                return group1.get('label').localeCompare(group2.get('label'));
            }
            else {  // both shared, sort by modified date descending
                var g1modified = group1.get('modified');
                var g2modified = group2.get('modified');

                if(g1modified < g2modified) {
                    return 1;
                }
                if(g1modified === g2modified) {
                    return 0;
                }
                else {
                    return -1;
                }
            }
        }
    }],

    constructor: function (config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    load: function() {
        if (this.getCount() === 0)
            this.loadSlice();
    },

    loadSlice: function () {
        this.mabGroups = undefined;
        this.subjectGroups = undefined;
        this.studiesForGroups = undefined;

        var me = this;

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_studiesforgroups',
            success: this.onLoadStudiesForGroups,
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
                        id : row.RowId,
                        rowid : row.RowId,
                        label: row.Label,
                        filters: row.Filters,
                        modified: row.Modified,
                        type: row.Type,
                        containsPlot: false,
                        description: row.Description,
                        shared: row.Shared
                    })
                }, this);
                this._onLoadComplete();
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
        this.subjectGroups = [];
        Ext.each(response.groups, function(group) {
            if (group.id !== -1) {
                this.subjectGroups.push(group);
            }
        }, this);

        this._onLoadComplete();
    },

    onLoadStudiesForGroups: function(studies){
        // create a map of study name to information that the data availability module needs
        this.studiesForGroups = {};
        Ext.each(studies.rows, function(study) {
            this.studiesForGroups[study.study_label] = study;
        }, this);

        this._onLoadComplete();
    },

    _onLoadComplete: function () {

        if (Ext.isDefined(this.mabGroups) && Ext.isDefined(this.subjectGroups) && Ext.isDefined(this.studiesForGroups)) {

            let learnGroups = [];

            Ext.each(this.mabGroups, function (mab) {
                // id needs to be unique in order to avoid collision
                // ex. in the case where id=19, i.e it's the same rowid for both for participant and mab group
                // it only shows one group in the list, so below is the way to make id unique.
                mab.id = mab.id + "-" + mab.type;

                learnGroups.push(mab);
            });

            Ext.each(this.subjectGroups, function(group) {
                // parse the filters to add category information to the learn grid
                if (Ext.isString(group.filters))
                {
                    let studies = [];
                    let assays = [];
                    let species = [];
                    let products = [];

                    Ext.each(Connector.model.Filter.fromJSON(group.filters), function(filter)
                    {
                        let members = undefined;

                        switch (filter.hierarchy)
                        {
                            // species
                            case '[Subject.Species]':
                                members = species;
                                break;

                            // products uncomment to collect additional categories
                            case '[Study Product.Product Name]':
                            //case '[Study Product.Product Type]':
                            //case '[Study Product.Developer]':
                            //case '[Study Product.Product Class]':
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

                    studies.sort(function (p1, p2) {
                        return p1.toLowerCase().localeCompare(p2.toLowerCase())
                    });
                    group.study_names_to_sort_on = studies[0] ? studies[0].toLowerCase() : '';
                    group.study_names = studies;
                    group.studies = studies.map(function(name, index, arr) {

                        let study = this.studiesForGroups[name];
                        if (study){
                            return {
                                study_label: name,
                                data_label: study.study_label,
                                data_id: study.study_name,
                                data_link_id: study.study_name,
                                has_data: study.has_data,
                                data_index: index,
                                data_show: index < 10,
                                has_access: true,
                                data_description: study.description ? study.description : "No description given."
                            };
                        } else {
                            // shouldn't really happen
                            return {
                                study_label: name,
                                data_label: name
                            };
                        }
                    }, this);

                    species.sort(function (p1, p2) {
                        return p1.toLowerCase().localeCompare(p2.toLowerCase())
                    });
                    group.species_to_sort_on = species[0] ? species[0].toLowerCase() : '';
                    group.species_names = species;
                    group.studySpecies = species.map(function(s) {
                        return {species: s}
                    });

                    products.sort(function (p1, p2) {
                        return p1.toLowerCase().localeCompare(p2.toLowerCase())
                    });
                    group.product_to_sort_on = products[0] ? products[0].toLowerCase() : '';
                    group.product_names = products;
                    group.products = products.map(function(p) {
                        return {product_name : p}
                    });

                    assays.sort(function (p1, p2) {
                        return p1.toLowerCase().localeCompare(p2.toLowerCase())
                    });
                    group.assay_to_sort_on = assays[0] ? assays[0].toLowerCase() : '';
                    group.assay_names = assays;
                    group.assays = assays.map(function (a) {
                        return {assay_identifier: a}
                    });
                }
                learnGroups.push(group);
            }, this);

            this.mabGroups = undefined;
            this.subjectGroups = undefined;
            this.studiesForGroups = undefined;

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
        this.loadSlice();
    }
});
