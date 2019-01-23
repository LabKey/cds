/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.window.Facet', {

    extend: 'Connector.window.AbstractFilter',

    alias: 'widget.columnfacetwin',

    bodyStyle: 'overflow-y: auto; padding: 10px;',

    width: 290,

    height: 375,

    getItems : function()
    {
        var model = this.dataView.getModel(),
            wrappedMeasures = model.getWrappedMeasures(),
            fieldAlias = this.columnMetadata.filterField.toLowerCase(),
            matchFilters = [],
            newMeasures = [];

        var loader = Ext.create('Ext.Component', {
            html: 'Loading...'
        });

        // Include all measures in the request removing the matching filters
        Ext.each(wrappedMeasures, function(wrapped)
        {
            var wrappedAlias = wrapped.measure.alias.toLowerCase();

            // base measures should not show up in filtering (e.g. subject filter)
            if (!wrapped.isBaseMeasure)
            {
                if (wrappedAlias === fieldAlias)
                {
                    var newMeasure = {
                        measure: Ext.clone(wrapped.measure)
                    };

                    if (wrapped.dateOptions)
                    {
                        newMeasure.dateOptions = Ext.clone(wrapped.dateOptions);
                    }

                    Ext.each(wrapped.filterArray, function(f)
                    {
                        matchFilters.push(f);
                    });

                    newMeasures.push(newMeasure);
                }
                else
                {
                    newMeasures.push(wrapped);
                }
            }
        });

        var datasource = model.getDataSource();
        var isDemographicsOnlyQuery = datasource === QueryUtils.DATA_SOURCE_SUBJECT_CHARACTERISTICS;
        var extraFilters = isDemographicsOnlyQuery ? model.getDemographicsSubjectFilters() : model.get('extraFilters');

        Connector.getQueryService().getData(newMeasures, function(metadata) {
                this.remove(loader);

                var faceted = Ext.create('LABKEY.dataregion.filter.Faceted', {
                    itemId: 'faceted',
                    maxRows: -1,
                    maxGroup: -1,
                    border: false,
                    useGrouping: true,
                    useStoreCache: false,
                    filters: matchFilters,
                    groupFilters: model.getFilterArray(true),
                    model: {
                        column: this.columnMetadata,
                        schemaName: metadata.schemaName,
                        queryName: metadata.queryName
                    },
                    // query for all values, but truncate to short list for display AFTER grouping so that 'has data in current selection' is not empty
                    displaySize: 250,
                    // Override
                    getLookupStore : function() {

                        var model = this.getModel();
                        var storeId = [model.get('schemaName'), model.get('queryName'), model.get('fieldKey')].join('||');

                        // cache
                        if (this.useStoreCache === true) {
                            var store = Ext.StoreMgr.get(storeId);
                            if (store) {
                                this.storeReady = true;
                                return store;
                            }
                        }

                        var storeConfig = {
                            fields: [
                                'value', 'strValue', 'displayValue',
                                {name: 'hasData', type: 'boolean', defaultValue: true}
                            ],
                            storeId: storeId
                        };

                        if (this.useGrouping === true) {
                            storeConfig['groupField'] = 'hasData';
                        }

                        store = Ext.create('Ext.data.ArrayStore', storeConfig);

                        var baseConfig = {
                            method: 'POST',
                            schemaName: model.get('schemaName'),
                            queryName: model.get('queryName'),
                            dataRegionName: model.get('dataRegionName'),
                            viewName: model.get('viewName'),
                            column: model.get('fieldKey'),
                            container: model.get('container'),
                            parameters: model.get('parameters'),
                            maxRows: this.maxRows + 1
                        };

                        var onSuccess = function() {
                            if (Ext.isDefined(this.distinctValues) && Ext.isDefined(this.groupedValues)) {
                                var d = this.distinctValues;
                                var g = this.groupedValues;
                                var gmap = {};

                                if(Ext.isDefined(this.onOverValueLimit) && Ext.isFunction(this.onOverValueLimit) &&
                                        ((d.values.length > this.maxRows) || (g.values.length > this.maxRows))) {
                                    this.onOverValueLimit(this, this.scope);
                                    return;
                                }

                                if (g && g.values) {
                                    Ext.each(g.values, function(_g) {
                                        if (_g === null) {
                                            gmap[_g] = true;
                                        }
                                        else {
                                            gmap[_g.toString()] = true;
                                        }
                                    });
                                }

                                if (d && d.values) {
                                    var recs = [], hasDataRecs = [], v, i=0, hasBlank = false, hasBlankGrp = false, isString, formattedValue;
                                    for (; i < d.values.length; i++) {
                                        v = d.values[i];
                                        formattedValue = this.formatValue(v);
                                        isString = Ext.isString(formattedValue);

                                        if (formattedValue == null || (isString && formattedValue.length == 0) || (!isString && isNaN(formattedValue))) {
                                            hasBlank = true;
                                            hasBlankGrp = (gmap[null] === true);
                                        }
                                        else if (Ext.isDefined(v)) {
                                            var datas = [v, v.toString(), v.toString(), true];
                                            if (this.useGrouping === true) {
                                                if (gmap[v.toString()] !== true) {
                                                    datas[3] = false;
                                                }
                                            }
                                            recs.push(datas);
                                            if (datas[3])
                                                hasDataRecs.push(datas);
                                        }
                                    }

                                    if (hasDataRecs.length > this.displaySize) {
                                        recs = hasDataRecs;
                                    }
                                    else if (recs.length > this.displaySize) {
                                        recs.sort(function(a, b) {
                                            if (a[3] === b[3])
                                                return a[1].localeCompare(b[1]);
                                            else if (a[3])
                                                return -1;
                                            else
                                                return 1;
                                        });
                                    }


                                    if (hasBlank)
                                        recs.unshift(['', '', this.emptyDisplayValue, hasBlankGrp]);

                                    if (recs.length > this.displaySize)
                                        recs = Ext.Array.slice(recs, 0, this.displaySize);

                                    store.loadData(recs);
                                    store.group(store.groupField, 'DESC');
                                    store.isLoading = false;
                                    this.storeReady = true;
                                    this.onViewReady();
                                    this.distinctValues = undefined; this.groupedValues = undefined;
                                }
                            }
                        };

                        // Select Disinct Configuration
                        var config = Ext.apply({
                            success: function(d) {
                                this.distinctValues = d;
                                onSuccess.call(this);
                            },
                            scope: this
                        }, baseConfig);

                        if (this.useGrouping === true) {
                            var grpConfig = Ext.apply(Ext.clone(baseConfig), {
                                filterArray: this.groupFilters,
                                maxRows: this.maxGroup,
                                success: function(d) {
                                    this.groupedValues = d;
                                    onSuccess.call(this);
                                },
                                scope: this
                            });
                            LABKEY.Query.selectDistinctRows(grpConfig);
                        }
                        else {
                            this.groupedValues = true;
                        }

                        LABKEY.Query.selectDistinctRows(config);

                        return store;
                    }
                });

                this.add(faceted);
            },
            function() {
                console.log('Failed to load...');
            },
            this,
            extraFilters,
            {
                dataSource: datasource,
                demographicsOnly: isDemographicsOnlyQuery
            }
        );

        return [loader];
    },

    onAfterRender : function() {
        this.callParent(arguments);
        if (this.hasFilters) {
            this.getButton('dofilter').setText('Update');
        }
    },

    applyFiltersAndColumns : function()
    {
        var view = this.getComponent('faceted');
        if (view.checkValid())
        {
            this.fireEvent('filter', this, view.getModel().get('column'), view.getOriginalFilters(), view.getFilters());
            this.close();
        }
    },

    onClear : function() {
        var column = this.columnMetadata;
        var fieldKeyPath = column.displayField ? column.displayField : column.fieldKeyPath;

        this.fireEvent('clearfilter', this, fieldKeyPath);
        this.close();
    }
});
