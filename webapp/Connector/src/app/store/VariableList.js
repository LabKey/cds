/*
 * Copyright (c) 2015-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.VariableList', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.VariableList',

    isVariablesLoaded: false,

    assayType: "",

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadVariables : function() {
        if (this.isVariablesLoaded)
            return;

        var measures = Connector.getService('Query').getVariables('Study')
                .filter(function(datum) {
                    return datum.get('queryName') === this.assayType;
                }, this)
                .map(function(datum) {
                    return {
                        alias: datum.get('alias'),
                        label: datum.get('label'),
                        isRecommendedVariable: datum.get('isRecommendedVariable'),
                        sortOrder: datum.get("sortOrder"),
                        description: datum.get('description'),
                        queryName: datum.get('queryName')
                    }
                });
        this.loadRawData(measures);
        this.sort([
            {
                property : 'sortOrder',
                direction : 'ASC'
            },
            {
                property : 'isRecommendedVariable',
                direction: 'DESC'
            },
            {
                property : 'label',
                direction: 'ASC'
            }
        ]);
        this.isVariablesLoaded = true;
    }
});
