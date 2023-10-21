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
        {name: 'modified', type: 'DATE'}
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
                                    success: function(response)
                                    {
                                        var subjectGroups = Ext.JSON.decode(response.responseText).groups;

                                        // id needs to be unique in order to avoid collision
                                        // ex. in the case where id=19, i.e its the same rowid for both for participant and mab group
                                        // it only shows one group in the list, so below is the way to make id unique.
                                        for (var y = 0; y < mabGroups.length; y++) {
                                            mabGroups[y].id = mabGroups[y].id + "-" + mabGroups[y].type;
                                        }

                                        var subjGrps = subjectGroups.filter(function(grp) {return grp.id !== -1});

                                        //add index for display
                                        var savedGroups = subjGrps.filter(function(grp) {return !grp.shared});
                                        for (var i = 0; i < savedGroups.length; i++) {
                                            savedGroups[i].index = i+1;
                                        }

                                        //add index for display
                                        var sharedGroups = subjGrps.filter(function(grp) {return grp.shared});
                                        for (var j = 0; j < sharedGroups.length; j++) {
                                            sharedGroups[j].index = j+1;
                                        }
                                        var groups = mabGroups.concat(savedGroups).concat(sharedGroups);

                                        this.loadRawData(groups);
                                        if (cb)
                                            cb.call(cbScope);
                                    },
                                    scope: this
                                });
                            },
                            scope: this
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
                Connector.model.Group._groupStore.refreshData();
            }

            return Connector.model.Group._groupStore;
        }
    }
});