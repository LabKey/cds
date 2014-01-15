/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.store.Details', {

    extend : 'Ext.data.Store',

    model : 'Connector.model.Detail',

    cache : [],

    constructor : function(config) {

        /**
         * maps ydimensions to detail views
         */
        this.queryConfigs = {
            assay : {
                    configs : [
                        {
                            onRows : [ { level : '[Assay.Target Area].[Name]'} ],
                            useNamedFilters : ['stateSelectionFilter', 'statefilter']
                        }
                    ],
                    success : this.loadResults,
                    scope   : this
                },
            study : {
                    configs : [
                        {
                            onRows : [ { level : '[Study].[Study]'} ],
                            useNamedFilters : ['stateSelectionFilter', 'statefilter']
                        }
                    ],
                    success : this.loadResults,
                    scope   : this
                },
            lab : {
                    configs : [
                        {
                            onRows : [ { level : '[Lab].[Lab]'} ],
                            useNamedFilters : ['stateSelectionFilter', 'statefilter']
                        }
                    ],
                    success : this.loadResults,
                    scope   : this
                },
            antigen : {
                    configs : [
                        {
                            onRows : [ { level : '[Antigen.Tier].[Name]'} ],
                            useNamedFilters : ['stateSelectionFilter', 'statefilter']
                        }
                    ],
                    success : this.loadResults,
                    scope   : this
                },
            participant : {
                    configs : [
                        {
                            onRows : [ { hierarchy : 'Study', lnum: 0 } ],
                            useNamedFilters : ['stateSelectionFilter', 'statefilter']
                        }
                    ],
                    success : this.loadResults,
                    scope   : this
                }
        };

        this.configMap = {
            assay   : this.queryConfigs.assay,
            study   : this.queryConfigs.study,
            antigen : this.queryConfigs.antigen,
            lab : this.queryConfigs.lab
        };

        this.callParent([config]);
    },

    loadSelections : function(detail) {

        this.removeAll();
        var query = this.configMap[detail.hierarchy];
        if (query) {
            this.state.onMDXReady(function(mdx){
                mdx.queryMultiple(query.configs, query.success, query.failure, query.scope);
            }, this);
        }
    },

    done : function() {
        this.removeAll();
        this.add(this.cache);
        this.cache = [];
        this.sort('sort', 'ASC');
        this.fireEvent('load', this);
    },

    _aggregate : function(cellset) {
        var total = 0;
        for (var c=0; c < cellset.cells.length; c++)
        {
            if (cellset.cells[c][0].value > 0)
                total++;
        }
        return total;
    },

    _listNames : function(cellset) {
        var d = '', sep = '', val;
        for (var r=0; r < cellset.axes[1].positions.length; r++) {
            if (cellset.cells[r][0].value > 0)
            {
                val = cellset.axes[1].positions[r][0].name;
                val = (val == '#null') ? 'Unknown' : val;
                d += sep + val;
                sep = ', ';
            }
        }
        return d;
    },

    loadResults : function(qrArray, configArray) {
        var cellset = qrArray[0];

        for (var r=0; r < cellset.axes[1].positions.length; r++) {
            if (cellset.cells[r][0].value > 0)
            {
                var val = cellset.axes[1].positions[r][0].name;
                val = (val == '#null') ? 'Unknown' : val;

                var rec = {
                    total     : this._aggregate(cellset),
                    label     : val,
                    hierarchy : cellset.axes[1].positions[0][0].level.hierarchy.name,
                    sort      : 0
                };
                this.cache.push(Ext4.create('Connector.model.Detail', rec));
            }
        }
        this.done();
    }
});
