Ext.define('Connector.model.Grid', {
    extend: 'Ext.data.Model',

    fields: [
        {name: 'columnSet', defaultValue: []},

        /**
         * columns not reachable via getData API but joined in via the grid API.
         * Each lookup col has array of Connector.model.ColumnInfo objects.
         */
        {name: 'foreignColumns', defaultValue: {}},

        {name: 'filterArray', defaultValue: []},
        {name: 'measures', defaultValue: []},
        {name: 'metadata', defaultValue: undefined},
        {name: 'wrappedMeasures', defaultValue: []},
        {name: 'sorts', defaultValue: []}
    ],

    statics : {
        findSourceMeasure : function(allMeasures, datasetName) {
            Ext.each(allMeasures, function(measure) {
                if (measure.name.toLowerCase() == "source/title" && measure.queryName == datasetName) {

                    var sourceMeasure = Ext.clone(measure);

                    return Ext.apply(sourceMeasure, {
                        name: sourceMeasure.name.substring(0, sourceMeasure.name.indexOf("/")), //Don't want the lookup
                        hidden: true,
                        isSourceURI: true,
                        alias: LABKEY.MeasureUtil.getAlias(sourceMeasure, true) //Can't change the name without changing the alias
                    });
                }
            });
        },
        getMetaData : function(gridModel, config) {

            var wrapped = gridModel.getWrappedMeasures();
            var sorts = gridModel.getSorts();

            if (wrapped.length > 0 && sorts.length > 0) {
                Ext.Ajax.request({
                    url     : LABKEY.ActionURL.buildURL('visualization', 'getData.api'),
                    method  : 'POST',
                    jsonData: {
                        measures: gridModel.getWrappedMeasures(),
                        sorts: gridModel.getSorts(),
                        metaDataOnly: true
                    },
                    success : function(response) {

                        var metadata = Ext.decode(response.responseText);
                        gridModel.set('metadata', metadata);

                        if (Ext.isFunction(config.onSuccess)) {
                            config.onSuccess.call(config.scope, gridModel, metadata);
                        }
                    },
                    failure : config.onFailure,
                    scope   : config.scope
                });
            }
            else {
                console.warn('0 length measures or sorts');
            }
        },
        getColumnList : function(gridModel) {
            var measures = gridModel.getMeasures();
            var metadata = gridModel.get('metadata');

            var colMeasure = {};
            Ext.each(measures, function(measure) {
                colMeasure[measure.alias] = measure;
            });
            colMeasure[metadata.measureToColumn[Connector.studyContext.subjectColumn]] = {label: "Subject ID"};
            colMeasure[metadata.measureToColumn[Connector.studyContext.subjectVisitColumn + "/VisitDate"]] = {label : "Visit Date"};

            var columns = [];
            var foreignColumns = gridModel.get('foreignColumns');

            Ext.each(metadata.metaData.fields, function(column) {
                if (colMeasure[column.name]) {
                    columns.push(column.fieldKey);
                }
                if (foreignColumns[column.fieldKeyPath]) {
                    Connector.model.Grid.addLookupColumns(gridModel, column, columns);
                }
            });

            return columns;
        },
        addLookupColumns : function(gridModel, keyColumn, columns) {
            var foreignColumns = gridModel.get('foreignColumns');
            if (!foreignColumns[keyColumn.fieldKeyPath]) {
                return;
            }

            var names = foreignColumns[keyColumn.name], fieldKeyPath;
            Ext.each(names, function(column) {
                fieldKeyPath = column.get("fieldKeyPath");
                columns.push(fieldKeyPath);

                // Recurse since fk's lookup to more fk's
                if (foreignColumns[fieldKeyPath]) {
                    Connector.model.Grid.addLookupColumns(column.raw, columns);
                }
            });
        }
    },

    constructor : function(config) {
        this.callParent([config]);

        this.addEvents('measurechange');
    },

    changeMeasures : function(selectedMeasures, allMeasures) {

        var measureSet = [], sourceMeasure,
                item,
                sourceMeasuresRequired = {};  //Make sure we select the "source" measure for all datasets that have it

        Ext.each(selectedMeasures, function(measure) {
            item = Ext.clone(measure.data);
            if (!(item.queryName in sourceMeasuresRequired))
                sourceMeasuresRequired[item.queryName] = true;

            //We don't want to lose foreign key info -- measure picker follows these by default
            if (item.name.indexOf("/") != -1) {
                if (item.name.toLowerCase() == "source/title") {
                    sourceMeasuresRequired[item.queryName] = false;
                    item.isSourceURI = true;
                }

                item.name = item.name.substring(0, item.name.indexOf("/"));
                item.alias = LABKEY.MeasureUtil.getAlias(item, true); //Since we changed the name need to recompute the alias
            }
            measureSet.push(item);
        });

        Ext.iterate(sourceMeasuresRequired, function(queryName, value) {
            if (value) {
                sourceMeasure = Connector.model.Grid.findSourceMeasure(allMeasures, queryName);
                if (null != sourceMeasure)
                    measureSet.push(sourceMeasure);
            }
        });

        var wrapped = [];
        Ext.each(measureSet, function(measure) {
            wrapped.push({
                measure: measure,
                time: 'visit'
            });
        });

        // set the raw measures
        this.set('measures', measureSet);

        // set the wrapped measures
        this.set('wrappedMeasures', wrapped);

        // update sorts
        this._updateSorts(measureSet);

        this.fireEvent('measurechange', this, this.getMeasures());
    },

    getColumnSet : function() {
        return this.get('columnSet');
    },

    getFilterArray : function() {
        return this.get('filterArray');
    },

    getMeasures : function() {
        return this.get('measures');
    },

    getSorts : function() {
        return this.get('sorts');
    },

    getWrappedMeasures : function() {
        return this.get('wrappedMeasures');
    },

    _updateSorts : function(newMeasures) {

        var first = newMeasures[0];

        // if we can help it, the sort should use the first non-demographic measure
        for (var i=0; i < newMeasures.length; i++) {
            if (!newMeasures[i].isDemographic) {
                first = newMeasures[i];
                break;
            }
        }

        if (!first) {
            return [];
        }

        var sorts = [{
            schemaName: first.schemaName,
            queryName: first.queryName,
            name: Connector.studyContext.subjectColumn
        },{
            schemaName: first.schemaName,
            queryName: first.queryName,
            name: 'Study' // it is currently hidden by default in the server configuration
        },{
            schemaName: first.schemaName,
            queryName: first.queryName,
            name: Connector.studyContext.subjectVisitColumn + '/VisitDate'
        }];

        this.set('sorts', sorts);
    }
});
