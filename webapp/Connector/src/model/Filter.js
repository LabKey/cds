/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Filter', {
    extend: 'LABKEY.app.model.Filter',

    fields: [
        {name : 'dataFilter', defaultValue: {}}
    ],

    statics: {
        loaded: false,
        subjectMap: {},
        getSubjectUniqueName : function(subjectID) {
            return '[Subject].[' + Connector.model.Filter.getContainer(subjectID) + '].[' + subjectID + ']';
        },
        getContainer : function(subjectID) {
            return Connector.model.Filter.subjectMap[subjectID];
        },
        loadSubjectContainer : function(mdx) {

            if (!Connector.model.Filter.loaded) {
                // load from mdx
                var level = mdx.getDimension('Subject').getHierarchies()[0].levelMap['Subject'];
                var members = level.members;

                Ext.each(members, function(member) {
                    if (Connector.model.Filter.subjectMap[member.name]) {
                        var msg = 'Unable to process the same subject identifier in multiple studies.';
                        if (LABKEY.devMode) {
                            msg += " ID: " + member.name;
                        }
                        console.error(msg);
                    }
                    else {
                        var uniqueName = member.uniqueName.split('].');
                        var containerID = uniqueName[1].replace('[', '');
                        Connector.model.Filter.subjectMap[member.name] = containerID;
                    }
                });

                Connector.model.Filter.loaded = true;
            }
        },

        getGridLabel : function(gf) {
            if (gf.getFilterType().getURLSuffix() === 'dategte' || gf.getFilterType().getURLSuffix() === 'datelte') {
                return LABKEY.app.model.Filter.getShortFilter(gf.getFilterType().getDisplayText()) + ' ' + ChartUtils.tickFormat.date(gf.getValue());
            }
            return LABKEY.app.model.Filter.getGridLabel(gf);
        },

        getFilterValuesAsArray : function(gf) {
            var values = [];
            Ext.each(gf.getValue(), function(value) {
                Ext.each(value.split(';'), function(v) {
                    values.push(Ext.htmlEncode(v == '' ? ChartUtils.emptyTxt : v));
                });
            });

            return values;
        }
    },

    constructor : function(config) {
        this.callParent([config]);

        Connector.getQueryService().onQueryReady(function() {
            this._generateDataFilters();
        }, this);
    },

    getDataFilters : function() {
        return this.get('dataFilter');
    },

    modify : function(datas) {
        // TODO: Need to switch real-time updates to use this modify method, so data filters can be updated
    },

    _dataFilterHelper : function(filterMap, alias, filter) {
        if (!Ext.isArray(filterMap[alias])) {
            filterMap[alias] = [];
        }
        filterMap[alias].push(filter);
    },

    _generateDataFilters : function() {

        var dataFilterMap = {};

        if (this.isPlot() && this.isGrid()) {
            // plot selection filter

            /**
             * "Plot selection filters, including axis filters, are global data filters on the dragged measure
             * (each axis considered separately), unless both axes are the same source then plot selection filters,
             * including axis filters, are applied as a compound global data filter."
             */

            // TODO: Compare the axes to determine if they meet the "unless" condition stated above

            Ext.each(this.get('gridFilter'), function(gridFilter) {
                if (gridFilter) {
                    this._dataFilterHelper(dataFilterMap, gridFilter.getColumnName(), gridFilter);
                }
            }, this);

            Ext.each(this.get('plotMeasures'), function(plotMeasure) {
                if (plotMeasure && plotMeasure.measure) {

                    // axis filters -> data filters
                    var measure = plotMeasure.measure;
                    if (measure.options && measure.options.dimensions) {
                        Ext.iterate(measure.options.dimensions, function(columnName, values) {
                            if (Ext.isArray(values) && !Ext.isEmpty(values)) {
                                // TODO: Switch axis filters to using alias rather than column name.
                                // TODO: Once done, the dependency on QueryService can be removed
                                var genFilter = this._generateFilter(measure, columnName, values);
                                if (genFilter) {
                                    this._dataFilterHelper(dataFilterMap, genFilter.getColumnName(), genFilter);
                                }
                            }
                        }, this);
                    }
                }
            }, this);
        }
        else if (this.isPlot()) {
            // in the plot filter

            /**
             * "In the Plot filters, including the axis filters, are applied as a data filter globally."
             */
            Ext.each(this.get('plotMeasures'), function(plotMeasure) {
                if (plotMeasure && plotMeasure.measure) {

                    // axis filters -> data filters
                    var measure = plotMeasure.measure;
                    if (measure.options && measure.options.dimensions) {
                        Ext.iterate(measure.options.dimensions, function(columnName, values) {
                            if (Ext.isArray(values) && !Ext.isEmpty(values)) {
                                // TODO: Switch axis filters to using alias rather than column name.
                                // TODO: Once done, the dependency on QueryService can be removed
                                var genFilter = this._generateFilter(measure, columnName, values);
                                if (genFilter) {
                                    this._dataFilterHelper(dataFilterMap, genFilter.getColumnName(), genFilter);
                                }
                            }
                        }, this);
                    }

                    // TODO: Deal with situational filters (e.g. log plots use "measure > 0" filter)
                }
            }, this);
        }
        else if (this.isGrid()) {
            // grid filter

            /**
             * "Grid filters are global data filters."
             */
            Ext.each(this.get('gridFilter'), function(gridFilter) {
                if (gridFilter) {
                    this._dataFilterHelper(dataFilterMap, gridFilter.getColumnName(), gridFilter);
                }
            }, this);
        }
        else {
            // olap filter -- nothing to do
        }

        this.set('dataFilter', dataFilterMap);
    },

    /**
     * Attempts to generate a filter from the specified
     * @param measure
     * @param columnName
     * @param values
     * @private
     */
    _generateFilter : function(measure, columnName, values) {
        var alias = [measure.schemaName, measure.queryName, columnName].join('_'),
            queryMeasure = Connector.getQueryService().getMeasure(alias),
            filter;

        if (!queryMeasure) {
            throw 'Unable to resolve filter alias: ' + alias;
        }

        if (values.length > 1) {
            filter = LABKEY.Filter.create(queryMeasure.alias, values, LABKEY.Filter.Types.EQUALS_ONE_OF);
        }
        else {
            filter = LABKEY.Filter.create(queryMeasure.alias, values[0]);
        }

        return filter;
    }
});
