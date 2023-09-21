/*
 * Copyright (c) 2023 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Group', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.Group',

    groupField: 'group_type',

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadSlice : function() {

        this.groupsData = undefined;

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_groups',
            success: this.onLoadLearnGroups,
            scope: this
        });
    },

    onLoadLearnGroups : function(groupsInfo) {
        this.groupsData = groupsInfo.rows;
        this._onLoadComplete();
    },

    _onLoadComplete : function() {
        if (Ext.isDefined(this.groupsData)) {

            var learnGroups = [];
            var savedGroupLabel = "My saved groups";
            var curatedGroupLabel = "Curated groups";

            var savedGroups = [];
            var curatedGroups = [];

            var uniqueGroupNames = this.groupsData.map(function(grp) {
                return grp.group_name;
            }).filter(function(value, index, self) {
                return self.indexOf(value) === index;
            });

            Ext.each(uniqueGroupNames, function(grpName) {
               var studiesPerGrp = this.groupsData.filter(function(grp) { return grp.group_type === savedGroupLabel && grp.group_name === grpName; }).map(function (grp) {
                   return { study_label: grp.studyLabel, species: grp.species };
               });
                var species = studiesPerGrp.map(function(study) {
                    return null !== study.species ? study.species : 'Unknown';
                }).filter(function(value, index, self) {
                    return self.indexOf(value) === index;
                });

               if (studiesPerGrp.length > 0)
                   savedGroups.push({ group_type: savedGroupLabel, group_name: grpName, studies: studiesPerGrp, studySpecies: species.map(function(s) {return {species:s}}) });

            }, this);

            Ext.each(uniqueGroupNames, function(grpName) {
                var studiesPerGrp = this.groupsData.filter(function(grp) { return grp.group_name === grpName && grp.group_type === curatedGroupLabel; }).map(function (grp) {
                    return { study_label: grp.studyLabel, species: grp.species };
                });

                var species = studiesPerGrp.map(function(study) {
                    return null !== study.species ? study.species : 'Unknown';
                }).filter(function(value, index, self) {
                    return self.indexOf(value) === index;
                });

                if (studiesPerGrp.length > 0)
                    curatedGroups.push({ group_type: curatedGroupLabel, group_name: grpName, studies: studiesPerGrp, studySpecies: species.map(function(s) {return {species:s}}) });
            }, this);

            learnGroups = savedGroups.concat(curatedGroups);

            this.groupsData = undefined;

            this.loadRawData(learnGroups);
            this.dataLoaded = true;
            this.fireEvent('dataloaded');
        }
    }
});
