/*
 * Copyright (c) 2014-2015 LabKey Corporation
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
                var filterArray = LABKEY.app.model.Filter.fromJSON(raw);
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
        {name: 'type'},
        {name: 'participantIds'} // array
    ],

    statics: {
        _groupStore: null,
        getGroupStore: function() {
            if (!Connector.model.Group._groupStore) {
                var storeConfig = {
                    pageSize : 100,
                    model    : 'Connector.model.Group',
                    autoLoad : true,
                    sorters  : [{property: 'label'}],
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
                            for (var i=0; i < recs.length; i++)
                            {
                                if (recs[i].data.id < 0)
                                    s.remove(recs[i]);
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