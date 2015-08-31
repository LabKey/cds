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

    loadSlice : function() {
        this.variableData = Connector.getService('Query').getVariables('Study');
        var measures = [];
        Ext.each(this.variableData, function(datum) {
            measures.push(datum.data);
        });
        this.loadRawData(measures);

    },

    getByAssayName : function (assayName) {
        if (this.getCount() == 0) {
            this.loadSlice();
        }
        if (this.isFiltered) {
            this.clearFilter();
        }
        this.filterBy(function (record) {
            return record.get('queryName') === assayName;
        });

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
        return this.getRange();
    }

});
