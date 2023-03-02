/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.MAb', {

    extend : 'Connector.app.store.SavedReports',

    statics: {
        LANL_URL_PREFIX: 'https://www.hiv.lanl.gov/content/immunology/ab_search?results=Search&id='
    },

    mixins: {
        studyAccessHelper: 'Connector.app.store.PermissionedStudy'
    },

    model : 'Connector.app.model.MAb',

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadSlice: function() {
        this.callParent();
        this.mabMixData = undefined;
        this.mabMixStudies = undefined;

        this.loadAccessibleStudies(this._onLoadComplete, this); // populate this.accessibleStudies

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_mab_mix_meta',
            success: this.onLoadMAbs,
            scope: this
        });

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_mabStudies',
            success: this.onLoadStudies,
            scope: this
        })
    },

    onLoadMAbs: function (mabData) {
        this.mabMixData = mabData.rows;
        this._onLoadComplete();
    },

    onLoadStudies: function (mabMixStudies) {
        this.mabMixStudies = mabMixStudies.rows;
        this._onLoadComplete();
    },

    _onLoadComplete : function() {
        if (Ext.isDefined(this.mabMixData)
                && Ext.isDefined(this.mabMixStudies)
                && Ext.isDefined(this.accessibleStudies)
                && this.isLoadComplete()) {

            this.mabMixData.sort(function(mab1, mab2) {
                return Connector.model.Filter.sorters.natural(mab1.mab_mix_name_std, mab2.mab_mix_name_std);
            });

            var mabs = [], mabMixes = {}, mabStudies = {}, mixRecs = [];
            Ext.each(this.mabMixData, function(mab) {
                var stdName = mab.mab_mix_name_std;
                if (mabMixes[stdName] == null)
                    mabMixes[stdName] = [];
                mabMixes[stdName].push(mab);
            });

            Ext.each(this.mabMixStudies, function(mab) {
                var stdName = mab.mab_mix_name_std;
                if (mabStudies[stdName] == null)
                    mabStudies[stdName] = [];
                mabStudies[stdName].push(mab);
            });

            Ext.iterate(mabMixes, function(mixStd){
                var mixes =  mabMixes[mixStd];
                var mstudies = mabStudies[mixStd];

                var metaMix = mixes[0];
                var mixRec = {
                    mab_mix_name_std: metaMix.mab_mix_name_std,
                    mab_mix_type: metaMix.mab_mix_type,
                    mab_mix_lanlid: metaMix.mab_mix_lanlid,
                    mab_mix_lanlid_link: this.getLanlLink(metaMix.mab_mix_lanlid),
                    mab_mix_name_other: metaMix.mab_mix_name_other,
                    other_labels: metaMix.mix_labels
                };

                var donors = [], isotypes = [], hxb2Locs = [], abBindings = [], mabnames = [], mabs, mabIdMap = {};

                // process mix and mab metadata
                Ext.each(mixes, function(mix) {
                    var donorSpecies = mix.mab_donor_species;
                    var isotype = mix.mab_isotype;
                    var hxb2Loc = mix.mab_hxb2_location;
                    var abBinding = mix.mab_ab_binding_type;
                    var mabName = mix.mab_name_std;
                    if (donorSpecies && donors.indexOf(donorSpecies) === -1)
                        donors.push(donorSpecies);
                    if (isotype && isotypes.indexOf(isotype) === -1)
                        isotypes.push(isotype);
                    if (hxb2Loc && hxb2Locs.indexOf(hxb2Loc) === -1)
                        hxb2Locs.push(hxb2Loc);
                    if (abBinding && abBindings.indexOf(abBinding) === -1)
                        abBindings.push(abBinding);
                    if (mabName && mabnames.indexOf(mabName) === -1)
                        mabnames.push(mabName);

                    var mabId = mix.mab_id;
                    if (mabIdMap[mabId])
                        return;

                    mabIdMap[mabId] = {
                        mabName: mabName,
                        isotype: isotype,
                        hxb2Loc: hxb2Loc,
                        mab_lanlid: mix.mab_lanlid,
                        mab_lanlid_link: this.getLanlLink(mix.mab_lanlid),
                        bindingType: mix.mab_ab_binding_type,
                        donorSpecies: donorSpecies,
                        donorId: mix.mab_donorid,
                        donorClade: mix.mab_donor_clade
                    };
                }, this);

                mixRec.donors = donors;
                mixRec.donors_str = donors.join(', ');
                mixRec.isotypes = isotypes;
                mixRec.isotypes_str = isotypes.join(', ');
                mixRec.hxb2Locs = hxb2Locs;
                mixRec.hxb2Locs_str = hxb2Locs.join(', ');
                mixRec.abBindings = abBindings;
                mixRec.abBindings_str = abBindings.join(', ');
                mixRec.mabnames_str = mabnames.join(', ');

                mabs = Ext.Object.getValues(mabIdMap);
                mabs.sort(function(a, b) {
                    return Connector.model.Filter.sorters.natural(a.mabName, b.mabName);
                });
                mixRec.mabs = mabs;

                // process study data
                var studies = [], studiesWithData = [], groupWithIndexes = [];

                //group with indexes in order to show all/show less for long lists
                if (mstudies) {
                    var groupedStudyData = mstudies.map(function(studymab) {return studymab.study_type}).filter(function(value, index, self) {
                        return index === self.indexOf(value);
                    });

                    Ext.each(groupedStudyData, function(gName) {
                        var groupIdx = {
                            groupName: gName,
                            groupIndex: 0
                        };
                        groupWithIndexes.push(groupIdx);
                    })
                }

                Ext.each(mstudies, function(studymab) {
                    var study_id = studymab.prot;

                    //get index of a group/study_type (so far there are just the two groups: 'MAb Characterization Studies' & 'MAb Administration Studies')
                    var grpIdx = groupWithIndexes.findIndex(function(value) {
                       return value ? value.groupName === studymab.study_type : false;
                    });

                    var study = {
                        data_label: studymab.label,
                        data_id: study_id,
                        data_link_id: study_id,
                        has_data: studymab.has_data,
                        has_access: this.accessibleStudies[study_id] === true,
                        data_status: studymab.assay_status,
                        alt_label: studymab.mix_labels && studymab.mix_labels.length > 0 ? studymab.mix_labels : null,
                        data_group: studymab.study_type,
                        data_group_instr: studymab.subheader_instr,
                        data_description: studymab.description
                    };
                    if (grpIdx >= 0) {
                        study.data_index = groupWithIndexes[grpIdx].groupIndex; //update data_index for the group
                        study.data_show = groupWithIndexes[grpIdx].groupIndex < 10;
                        groupWithIndexes[grpIdx].groupIndex++;
                    }
                    studies.push(study);
                }, this);
                Ext.each(studies, function(study) {
                    if (study.has_data) {
                        mixRec.data_availability = true;
                        studiesWithData.push(study);
                        if (!study.data_accessible && study.has_access)
                            mixRec.data_accessible = true;
                    }
                });
                mixRec.studies = studies;
                mixRec.studies_with_data = studiesWithData;
                mixRec.studies_with_data_count = studiesWithData.length;
                mixRec.data_types_available = this.getDataTypesAvailable(mixRec);

                mixRecs.push(mixRec);
            }, this);

            this.mabMixData = undefined;
            this.mabMixStudies = undefined;

            this.loadRawData(mixRecs);

            LABKEY.Utils.signalWebDriverTest("learnAboutMabsLoaded");
        }
    },

    getLanlLink: function(id)
    {
        if (!id)
            return '';
        return Connector.app.store.MAb.LANL_URL_PREFIX + id;
    }
});