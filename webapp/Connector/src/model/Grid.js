Ext.define('Connector.model.Grid', {
    extend: 'Ext.data.Model',

    fields: [
        {name: 'columnSet', defaultValue: [
            'SubjectID', // Connector.studyContext.subjectColumn
            'Study',
            'StartDate'
        ]},

        /**
         * columns not reachable via getData API but joined in via the grid API.
         * Each lookup col has array of Connector.model.ColumnInfo objects.
         */
        {name: 'foreignColumns', defaultValue: {}},

        {name: 'subjectFilter', defaultValue: {}},
        {name: 'filterArray', defaultValue: []},

        {name: 'measures', defaultValue: []},
        {name: 'measuresMap', defaultValue: {}},

        {name: 'metadata', defaultValue: undefined},
        {name: 'wrappedMeasures', defaultValue: []},
        {name: 'schemaName', defaultValue: 'study'},
        {name: 'queryName', defaultValue: 'Demographics'},
        {name: 'sortSchemaName', defaultValue: 'study'},
        {name: 'sortQueryName', defaultValue: 'Demographics'},
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

            var measures = gridModel.getWrappedMeasures();
            var sorts = gridModel.getSorts();

            if (measures.length > 0 && sorts.length > 0)
            {
                LABKEY.Visualization.getData({
                    measures: measures,
                    sorts: sorts,
                    success: function(metadata)
                    {
//                        var metadata = Ext.decode(response.responseText);
                        gridModel.set('metadata', metadata);

                        if (Ext.isFunction(config.onSuccess))
                        {
                            config.onSuccess.call(config.scope, gridModel, metadata);
                        }
                    },
                    failure: config.onFailure,
                    scope: config.scope
                });
            }
            else
            {
                console.warn('0 length measures or sorts');
            }
        },
        getColumnList : function(gridModel) {
            var measures = gridModel.getMeasures();
            var metadata = gridModel.getMetadata();

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

            var names = foreignColumns[keyColumn.name];
            Ext.iterate(names, function(column, val) {
                columns.push(keyColumn.name + '/' + val.fieldKeyPath);
            });
        }
    },

    constructor : function(config) {

        this.callParent([config]);

        var columns = this.getColumnSet();
        var schema = this.get('schemaName');
        var query = this.get('queryName');

        var measures = [];
        Ext.each(columns, function(columnName) {
            measures.push({
                data: {
                    schemaName: schema,
                    queryName: query,
                    name: columnName
                }
            });
        });

        this.changeMeasures(measures, [], [], true);

        this.addEvents('measurechange');
    },

    changeMeasures : function(selectedMeasures, allMeasures, foreignColumns, silent) {

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

        // set the measures map
        var measureMap = {};
        Ext.each(measureSet, function(measure) {
            if (Ext.isDefined(measure.alias))
            {
                measureMap[measure.alias] = measure;
            }
        });

        // set the wrapped measures
        this.set('wrappedMeasures', wrapped);

        // set the foreign columns
        this.set('foreignColumns', foreignColumns);

        // update sorts
        this._updateSorts(measureSet);

        if (silent !== true)
        {
            this.fireEvent('measurechange', this, this.getMeasures());
        }
    },

    changeSubjectFilter : function(filter) {
        this.set('subjectFilter', filter);
        this.changeFilterArray(this.getFilterArray().slice(1), true);
    },

    changeFilterArray : function(filterArray, silent) {

        // include the subject filter
        var newFilterArray = [this.get('subjectFilter')];
        newFilterArray = newFilterArray.concat(Ext.clone(filterArray));

        this.set('filterArray', newFilterArray);

        if (silent !== true)
        {
            this.fireEvent('filterarraychange', newFilterArray);
        }
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

    getMetadata : function() {
        return this.get('metadata');
    },

    getSorts : function()
    {
        var measures = this.getMeasures();
        var targetMeasure;

        for (var m=0; m < measures.length; m++)
        {
            if (!measures[m].isDemographic)
            {
                targetMeasure = measures[m];
                break;
            }
        }

        var schema = targetMeasure.schemaName;
        var query = targetMeasure.queryName;

        return [{
            schemaName: schema,
            queryName: query,
            name: Connector.studyContext.subjectColumn
        },{
            schemaName: schema,
            queryName: query,
            name: 'Study' // it is currently hidden by default in the server configuration
        },{
            schemaName: schema,
            queryName: query,
            name: Connector.studyContext.subjectVisitColumn + '/VisitDate'
        }];
    },

    getWrappedMeasures : function() {
        return this.get('wrappedMeasures');
    },

    _updateSorts : function(newMeasures) {

//        var first = newMeasures[0];
//
//        // if we can help it, the sort should use the first non-demographic measure
//        for (var i=0; i < newMeasures.length; i++) {
//            if (!newMeasures[i].isDemographic) {
//                first = newMeasures[i];
//                break;
//            }
//        }
//
//        if (!first) {
//            return [];
//        }
//
//        var sorts = [{
//            schemaName: first.schemaName,
//            queryName: first.queryName,
//            name: Connector.studyContext.subjectColumn
//        },{
//            schemaName: first.schemaName,
//            queryName: first.queryName,
//            name: 'Study' // it is currently hidden by default in the server configuration
//        },{
//            schemaName: first.schemaName,
//            queryName: first.queryName,
//            name: Connector.studyContext.subjectVisitColumn + '/VisitDate'
//        }];
//
//        this.set('sorts', sorts);
    }
});
