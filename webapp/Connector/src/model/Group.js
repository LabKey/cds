/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Group', {

    extend : 'Ext.data.Model',

    fields : [
        {name: 'id'},
        {name: 'label'},
        {name: 'description'},
        {name: 'filters'},
        {name: 'containsPlot', type: 'boolean', defaultValue: false, convert : function(value, partial) {
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
            return partial.raw.category.shared;
        }},
        {name: 'type'},
        {name: 'participantIds'}, // array
        {name: 'modified', type: 'DATE'}
    ],

    statics: {
        _groupStore: null,
        getGroupStore: function() {
            if (!Connector.model.Group._groupStore) {
                var storeConfig = {
                    pageSize : 100,
                    model    : 'Connector.model.Group',
                    autoLoad : true,
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

                    proxy    : {
                        type   : 'ajax',
                        url: LABKEY.ActionURL.buildURL('participant-group', 'browseParticipantGroups.api', null, {
                            includeParticipantIds: true
                        }),
                        reader : {
                            type : 'json',
                            root : 'groups'
                        }
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

                var groupConfig = Ext.clone(storeConfig);
                Ext.apply(groupConfig.proxy, {
                    extraParams : { type : 'participantGroup'}
                });

                Connector.model.Group._groupStore = Ext.create('Ext.data.Store', groupConfig);
            }

            return Connector.model.Group._groupStore;
        }
    }
});