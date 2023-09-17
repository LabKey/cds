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

            Ext.each(this.groupsData, function(group) {
                learnGroups.push(group);
            }, this);

            this.groupsData = undefined;

            this.loadRawData(learnGroups);
            this.dataLoaded = true;
            this.fireEvent('dataloaded');
        }
    }
});
