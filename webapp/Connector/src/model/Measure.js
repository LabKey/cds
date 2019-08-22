/*
 * Copyright (c) 2015-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Measure', {
    extend : 'Ext.data.Model',
    idProperty : 'lowerAlias',
    fields : [
        {name: 'id'},
        {name: 'alias'},
        {
            name: 'lowerAlias',
            convert: function(val, rec) {
                return rec.get('alias').toLowerCase();
            }
        },

        // Properties from the LabKey schema and query
        {name: 'name', defaultValue: undefined},
        {name: 'label', defaultValue: undefined},
        {name: 'description', defaultValue: undefined},
        {name: 'schemaName', defaultValue: undefined},
        {name: 'queryName', defaultValue: undefined},
        {name: 'queryLabel', defaultValue: undefined},
        {name: 'altSourceKey', defaultValue: undefined},
        {name: 'altPlotLabel', defaultValue: undefined},
        {name: 'altDescription', defaultValue: undefined},
        {name: 'queryDescription', defaultValue: undefined},
        {name: 'lookup', defaultValue: {}},
        {name: 'type', defaultValue: undefined},

        // Boolean properties describing the type of measure/column
        {name: 'hidden', type: 'boolean', defaultValue: false},
        {name: 'hiddenInPlot', type: 'boolean', defaultValue: false},
        {name: 'hiddenInGrid', type: 'boolean', defaultValue: false},
        // for dimension that's hidden on X and color (hidden:true), but visible on advanced option and grid
        {name: 'requiredInGrid', type: 'boolean', defaultValue: false},
        // used for fields hidden from advanced options but available on X, color & grid
        {name: 'hiddenInAdvancedOptions', type: 'boolean', defaultValue: false},
        {name: 'isDemographic', type: 'boolean', defaultValue: false},
        {name: 'isUserDefined', type: 'boolean', defaultValue: undefined},
        {name: 'isMeasure', type: 'boolean', defaultValue: false},
        {name: 'isDimension', type: 'boolean', defaultValue: false},
        {name: 'isDiscreteTime', type: 'boolean', defaultValue: false},
        {name: 'isHoursType', type: 'boolean', defaultValue: false},
        {name: 'allowHoursTimePoint', type: 'boolean', defaultValue: false},

        // Misc properties about the measure display in the application
        {name: 'sourceTitle', convert: function(val, rec) {
            if (Ext.isString(val) && val.length > 0) {
                return val;
            }
            else {
                if (rec.get('altSourceKey')) {
                    var sourceContextMap = Connector.measure.Configuration.context.sources;
                    if (Ext.isDefined(sourceContextMap[rec.get('altSourceKey')])) {
                        return sourceContextMap[rec.get('altSourceKey')].queryLabel;
                    }
                }
                var title = rec.get('queryLabel');
                if (rec.get('queryType') == 'datasets' && !rec.get('isDemographic')) {
                    title = rec.get('queryName') + ' (' + title + ')';
                }

                return title;
            }
        }},
        {name: 'isRecommendedVariable', type: 'boolean', defaultValue: false},
        {name: 'recommendedVariableGrouper', convert: function(val, rec) {
            // see Selector.js measuresGridGrouping for mapping to display value
            if (rec.get('isRecommendedVariable')) {
                return '0_Recommended'; // Recommended
            }
            else if (rec.get('dimensions') && rec.get('dimensions').indexOf(rec.get('alias')) > -1) {
                return '1_AssayRequired'; // Assay required columns
            }
            return '2_Additional'; // Additional
        }},
        {name: 'defaultScale', defaultValue: 'LINEAR'},
        {name: 'sortOrder', type: 'int', defaultValue: 0},
        {name: 'variableType', defaultValue: null}, // i.e. TIME, USER_GROUPS (default to null for query based variables)
        {name: 'queryType', defaultValue: null}, // see LABKEY.Query.Visualization.Filter.QueryType
        {name: 'sourceCount', type: 'int', defaultValue: undefined},
        {name: 'uniqueKeys', defaultValue: undefined},
        {name: 'selectedSourceKey', defaultValue: undefined}, // when used with variable selected, track what source it was selected from
        {name: 'sourceMeasureAlias', defaultValue: undefined}, // mapping from one measure alias to another for filtering in the grid

        // Array of configs for what options to display in the Advanced options panel of the Variable Selector.
        // If undefined, fallback to the dimensions defined on the source query.
        {name: 'dimensions', defaultValue: undefined},

        // True to require selection of this option in the Advanced options panel of the Variable Selector.
        {name: 'requiresSelection', type: 'boolean', defaultValue: false},

        // True to allow multiple values of this option to be selected in the Advanced options panel of the Variable Selector.
        {name: 'allowMultiSelect', type: 'boolean', defaultValue: true},

        // True to allow 'Align By' in the Advanced options panel of Time Options Selector.
        {name: 'allowTimeAlignment', type: 'boolean', defaultValue: true},

        // The default selection state for this option. Configurations include: select all {all: true},
        // select first {all: false}, or select a specific value {all: false, value: 'XYZ'}.
        {name: 'defaultSelection', defaultValue: {all: true, value: undefined}},

        // If the selection method for this option involves a hierarchical relationship with other columns,
        // this property lists the parent column's alias.
        {name: 'hierarchicalSelectionParent', defaultValue: undefined},

        // If provided, the column alias specified will be used for hierarchical selection filtering on the plot's
        // getData API request from the Advanced options panel of the Variable Selector.
        {name: 'hierarchicalFilterColumnAlias', defaultValue: undefined},

        // If a distinctValueFilterColumnAlias and distinctValueFilterColumnValue are provided, they will be used as
        // a WHERE clause for the query to get the distinct values for the given measure in the Advanced options
        // panel of the Variable Selector.
        {name: 'distinctValueFilterColumnAlias', defaultValue: undefined},
        {name: 'distinctValueFilterColumnValue', defaultValue: undefined},

        // Array of alias to add when generating plot queries
        {name: 'plotDependencyColumnAlias', defaultValue: undefined},

        // Alternative alias to use for sorting on Time plot
        {name: 'timePointSortColumnAlias', defaultValue: undefined},

        {name: 'defaultPlotType', defaultValue: undefined},
        {name: 'hideInColorSelector', defaultValue : undefined}
    ],

    statics : {
        getPlotAxisFilterMeasureRecords : function(measure) {
            var records = [], record;

            if (Ext.isObject(measure.options) && Ext.isObject(measure.options.dimensions)) {
                Ext.iterate(measure.options.dimensions, function(alias, values) {
                    record = Connector.model.Measure.createMeasureRecord({
                        schemaName: measure.schemaName,
                        queryName: measure.queryName,
                        name: Connector.getQueryService().getMeasureNameFromAlias(alias),
                        values: values
                    });

                    if (Ext.isDefined(record.values)) {
                        records.push(record);
                    }
                });
            }

            return records;
        },

        createMeasureRecord : function(obj) {
            return new LABKEY.Query.Visualization.Measure({
                axisName: obj.axis,
                schemaName: obj.schemaName,
                queryName: obj.queryName,
                name: obj.name,
                type: obj.type,
                isMeasure: false,
                isDimension: true,
                values: Ext.isArray(obj.values) && obj.values.length > 0 ? obj.values : undefined
            });
        }
    },

    shouldShowScale : function() {
        return !this.get('isDimension') && this.get('variableType') == null && (this.get('type') == 'INTEGER' || this.get('type') == 'DOUBLE');
    },

    getHierarchicalMeasures : function() {
        var measures = [], queryService = Connector.getService('Query');

        // traverse the dimension hierarchical selection parent lookups to get the full tree set
        if (Ext.isDefined(this.get('hierarchicalSelectionParent'))) {
            measures = [this];

            var parentAlias = this.get('hierarchicalSelectionParent');
            while (parentAlias) {
                var parentMeasure = queryService.getMeasureRecordByAlias(parentAlias);
                if (parentMeasure) {
                    measures.splice(0, 0, parentMeasure);
                    parentAlias = parentMeasure.get('hierarchicalSelectionParent');
                }
                else {
                    parentAlias = null;
                }
            }
        }

        return measures;
    },

    getFilterMeasure : function() {
        if (Ext.isDefined(this.get('hierarchicalFilterColumnAlias'))) {
            return Connector.getService('Query').getMeasureRecordByAlias(this.get('hierarchicalFilterColumnAlias'));
        }
        return this;
    },

    getDistinctValueStoreFilter : function() {
        if (Ext.isDefined(this.get('distinctValueFilterColumnAlias')) && Ext.isDefined(this.get('distinctValueFilterColumnValue'))) {
            return {
                property: this.get('distinctValueFilterColumnAlias'),
                value: this.get('distinctValueFilterColumnValue'),
                exactMatch: true
            };
        }

        return null;
    },

    getDistinctValueWhereClause : function() {
        if (Ext.isDefined(this.get('distinctValueFilterColumnAlias')) && Ext.isDefined(this.get('distinctValueFilterColumnValue'))) {
            return ' WHERE ' + this.get('distinctValueFilterColumnAlias') + ' = \'' + this.get('distinctValueFilterColumnValue') + '\'';
        }

        return '';
    },

    getPlotDependencyMeasures : function() {
        return this.getMeasuresFromAlias(this.get('plotDependencyColumnAlias'));
    },

    getTimePointSortColumnAlias : function() {
        return this.getMeasuresFromAlias(this.get('timePointSortColumnAlias'));
    },

    getMeasuresFromAlias: function(alias) {
        if (Ext.isArray(alias) && alias.length > 0) {
            var measures = [];
            Ext.each(alias, function(name){
                measures.push(Connector.getService('Query').getMeasureRecordByAlias(name));
            });
            return measures;
        }
        return null;
    }
});