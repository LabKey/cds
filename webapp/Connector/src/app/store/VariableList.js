/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.VariableList', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.VariableList',

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadVariables : function(assayName) {
        this.variableData = Connector.getService('Query').getVariables('Study');
        var measures = [];
        Ext.each(this.variableData, function(datum) {
            if (datum.data.queryName === assayName) {
                measures.push({
                    alias: datum.data.alias,
                    label: datum.data.label,
                    isRecommendedVariable: datum.data.isRecommendedVariable,
                    description: datum.data.description,
                    queryName: datum.data.queryName
                });
            }
        });
        this.loadRawData(measures);
        this.sort([
            {
                property : 'isRecommendedVariable',
                direction: 'DESC'
            },
            {
                property : 'label',
                direction: 'ASC'
            }
        ]);
    }
});
