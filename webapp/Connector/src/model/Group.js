/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Group', {

    extend : 'Ext.data.Model',

    fields : [
        {name: 'id'},
        {name: 'rowid'},
        {name: 'label'},
        {name: 'description'},
        {name: 'filters'},
        {name: 'containsPlot', type: 'boolean', defaultValue: false, convert : function(value, partial) {
            if (partial.raw.type === 'mab')
                return value;
            var raw = partial.raw.filters;
            var containsPlot = false;
            if (Ext.isString(raw)) {
                var filterArray = Connector.model.Filter.fromJSON(raw);
                if (Ext.isArray(filterArray)) {
                    Ext.each(filterArray, function(filter) {
                        if (filter.isPlot === true) {
                            containsPlot = true;
                        }
                    });
                }
            }
            return containsPlot;
        }},
        {name: 'categoryId'},
        {name: 'shared', type: 'boolean', defaultValue: false, convert : function(value, partial) {
            if (partial.raw.type === 'mab')
                return value;
            return partial.raw.category.shared;
        }},
        {name: 'type'},
        {name: 'participantIds', convert : Connector.model.Filter.asArray},
        {name: 'modified', type: 'DATE'},
        {name: 'studies', defaultValue: []}
    ],

    statics: {
        _groupStore: null,
        getGroupStore: function() {
            if (!Connector.model.Group._groupStore) {
                var storeConfig = {
                    pageSize : 100,
                    model    : 'Connector.model.Group',
                    autoLoad : false,
                    sorters  : [{
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
                    refreshData: function(cb, cbScope) {
                        LABKEY.Query.selectRows({
                            schemaName: 'cds',
                            queryName: 'mabgroup',
                            scope: this,
                            success: function(mabGroupData) {
                                var mabGroups = [];
                                Ext.each(mabGroupData.rows, function(row) {
                                    mabGroups.push({
                                        id : row.RowId,
                                        rowid : row.RowId,
                                        label: row.Label,
                                        description: row.Description,
                                        filters: row.Filters,
                                        modified: row.Modified,
                                        shared: row.Shared,
                                        type: row.Type,
                                        containsPlot: false
                                    })
                                }, this);
                                Ext.Ajax.request({
                                    url: LABKEY.ActionURL.buildURL('participant-group', 'browseParticipantGroups.api', null, {
                                        includeParticipantIds: true,
                                        type : 'participantGroup'
                                    }),
                                    scope: this,
                                    success: function(response)
                                    {
                                        LABKEY.Query.selectRows({
                                            schemaName: 'cds',
                                            queryName: 'learn_studiesforgroups',
                                            scope: this,
                                            success: function (groupData) {

                                                var subjectGroups = Ext.JSON.decode(response.responseText).groups;

                                                // id needs to be unique in order to avoid collision
                                                // ex. in the case where id=19, i.e its the same rowid for both for participant and mab group
                                                // it only shows one group in the list, so below is the way to make id unique.
                                                for (var y = 0; y < mabGroups.length; y++) {
                                                    mabGroups[y].id = mabGroups[y].id + "-" + mabGroups[y].type;
                                                }

                                                var subjGrps = subjectGroups.filter(function(grp) {return grp.id !== -1});

                                                //add index for display
                                                var savedGroups = subjGrps.filter(function(grp) {return !grp.category.shared});
                                                for (var i = 0; i < savedGroups.length; i++) {
                                                    if (!savedGroups[i].description) {
                                                        savedGroups[i].description = "No description given.";
                                                    }
                                                    savedGroups[i].index = i+1;
                                                }

                                                //add index for display
                                                var sharedGroups = subjGrps.filter(function(grp) {return grp.category.shared});
                                                for (var j = 0; j < sharedGroups.length; j++) {
                                                    if (!sharedGroups[j].description) {
                                                        sharedGroups[j].description = "No description given.";
                                                    }
                                                    sharedGroups[j].index = j+1;
                                                }

                                                //to display studies on Group Details page
                                                var groups = mabGroups.concat(savedGroups).concat(sharedGroups);
                                                var groupsWithStudies = [];

                                                var studyPerGroup = groupData.rows.map(function(grp) {
                                                    var hasData = false;
                                                    if (grp.has_data.length === 1) {
                                                        var has_data_arr = grp.has_data[0].split(',');
                                                        Ext.each(has_data_arr, function(dataAvail) {
                                                            if (dataAvail === 't') {
                                                                hasData = true;
                                                            }
                                                        });
                                                    }
                                                    return {
                                                        group_label: grp.group_name,
                                                        group_id: grp.group_id,
                                                        has_data: hasData,
                                                        data_label: grp.study_label,
                                                        data_id: grp.study_name,
                                                        data_link_id: grp.study_name,
                                                        data_show: true,
                                                        has_access: true,
                                                        data_description: grp.description ? grp.description : "No description given."
                                                    }
                                                }, this);

                                                Ext.each(groups, function(group) {
                                                    var groupId = group.id;
                                                    var groupLabel = group.label;

                                                    group.studies = studyPerGroup.filter(function(grp, index, self) {
                                                        return index === self.indexOf(grp) && grp.group_id === groupId && grp.group_label === groupLabel;
                                                    });

                                                    Ext.each(group.studies, function(study, index) {
                                                        study.data_index = index; //for show all/show less
                                                        study.data_show = index < 10; //for show all/show less
                                                    }, this);

                                                    groupsWithStudies.push(group);
                                                }, this);

                                                this.loadRawData(groupsWithStudies);

                                                //display group label of a newly saved group, and update group label store with label and groupId for the hyperlink
                                                if (cb && typeof cb === 'string' && cbScope) {
                                                    var saveOrUpdatedGrp = groupsWithStudies.filter(function (grp) { return grp.label === cb });
                                                    var grpId = -1;
                                                    if (saveOrUpdatedGrp.length === 1) {
                                                        grpId = saveOrUpdatedGrp[0].id;
                                                        var groupLabel = Ext.getCmp('savedgroupname-id');
                                                        groupLabel.items.get(0).update({savedGroupName: saveOrUpdatedGrp[0].label, groupId: grpId});
                                                        groupLabel.show();
                                                    }
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    },
                    listeners : {
                        load : function(s, recs) {
                            if (recs)
                            {
                                for (var i=0; i < recs.length; i++)
                                {
                                    // no filters = LabKey group, not CDS, which won't work in CDS
                                    if ((recs[i].data.id < 0) || (recs[i].data.filters === ""))
                                        s.remove(recs[i]);
                                }
                            }

                        }
                    }
                };

                Connector.model.Group._groupStore = Ext.create('Ext.data.Store', storeConfig);
                if (!this.loadDataTask) {
                    this.loadDataTask = new Ext.util.DelayedTask(function(store) {
                        store.refreshData();
                    });
                }
                this.loadDataTask.delay(300, undefined, this, [Connector.model.Group._groupStore]);
            }

            return Connector.model.Group._groupStore;
        }
    }
});