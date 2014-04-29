/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.Summary', {

    extend : 'Ext.data.Store',

    alias: 'store.summary',

    model : 'Connector.model.Summary',

    cache : [],

    flight : 0,

    count : 0,

    load : function() {
        this.fireEvent('beforeload', this);

        this.state.onMDXReady(function(mdx) {
            if (!this.requests) {
                this.requests = this.bindRequestConfigs(mdx);
            }
            this.loadGroups();
        }, this);
    },

    bindRequestConfigs : function(mdx) {

        var request = {
            configs: [],
            success: this.loadResults,
            scope: this
        };

        if (mdx) {

            var dims = mdx.getDimensions(), requestId = 0;
            for (var d=0; d < dims.length; d++) {
                if (!dims[d].hidden && dims[d].supportsSummary) {

                    requestId++;

                    var targetLevel = dims[d].summaryTargetLevel;
                    if (targetLevel) {

                        //
                        // Dimension requests
                        //
                        request.configs.push({
                            requestId: requestId,
                            dimName: dims[d].name,
                            useNamedFilters: ['statefilter'],
                            onRows: [ { level: targetLevel } ],
                            priority: dims[d].priority
                        });

                        //
                        // Hierarchy requests
                        //
                        var hiers = dims[d].getHierarchies();
                        for (var h=0; h < hiers.length; h++) {
                            if (!hiers[h].hidden && hiers[h].supportsSummary) {

                                var targetHierLevel = hiers[h].levels[1];

                                request.configs.push({
                                    requestId: requestId,
                                    dimName: dims[d].name,
                                    useNamedFilters: ['statefilter'],
                                    hierarchyIndex: h,
                                    targetLevel: targetHierLevel,
                                    label: targetHierLevel.countPlural || targetHierLevel.name,
                                    onRows: [ { level: targetHierLevel.uniqueName } ],
                                    priority: dims[d].priority
                                });
                            }
                        }
                    }
                    else {
                        console.warn('Dimension did not provide summaryTargetLevel:', dims[d].name);
                    }
                }
            }
        }

        // sort according to priority
        request.configs.sort(function(a, b) {
            return a.priority - b.priority;
        });

        return request;
    },

    loadGroups : function() {
        this.flight++;
        var requests = this.requests;
        requests.configs[0].flight = this.flight;

        this.state.onMDXReady(function(mdx) {
            mdx.queryMultiple(requests.configs, requests.success, requests.failure, requests.scope);
        }, this);
    },

    loadResults : function(qrArray, configArray) {

        if (configArray[0].flight != this.flight) {
            return;
        }

        this.state.onMDXReady(function(mdx) {

            var recs = [], dim, ca;

            //
            // Process dimensions
            //
            for (var i=0; i < configArray.length; i++) {

                if (Ext.isDefined(configArray[i].hierarchyIndex)) {
                    continue;
                }

                ca = configArray[i];

                dim = mdx.getDimension(ca.dimName);
                if (dim) {
                    var label = Ext.isDefined(dim.pluralName) ? dim.pluralName : dim.name;

                    var hierarchies = dim.getHierarchies();
                    var targetHierarchy;

                    Ext.each(hierarchies, function(hier)
                    {
                        Ext.each(hier.levels, function(lvl)
                        {
                            if (lvl.uniqueName == dim.summaryTargetLevel)
                            {
                                targetHierarchy = hier;
                            }
                        }, this);

                    }, this);

                    if (Ext.isDefined(targetHierarchy))
                    {
                        var cellset = qrArray[i];

                        var rec = {
                            dimName: ca.dimName,
                            total: this._aggregate(cellset),
                            label: label,
                            subject: label.toLowerCase(),
                            hierarchy: targetHierarchy.name,
                            details: [],
                            sort: i
                        };

                        recs.push(rec);
                    }
                    else
                    {
                        console.error('Unable to locate level:', dim.summaryTargetLevel);
                    }
                }
                else {
                    console.error('unable to locate dimension:', ca.dimName);
                }
            }

            //
            // Process hierarchies
            //
            for (i=0; i < configArray.length; i++) {
                if (Ext.isDefined(configArray[i].hierarchyIndex)) {

                    ca = configArray[i];

                    dim = mdx.getDimension(ca.dimName);
                    if (dim) {
                        // var hierarchy = dim.getHierarchies()[ca.hierarchyIndex];

                        //
                        // Iterate over processed dimensions adding on hierarchy based information
                        //
                        for (var r=0; r < recs.length; r++) {
                            if (recs[r].dimName === ca.dimName) {

                                var agg = {
                                    name: ca.label,
                                    aggregate: qrArray[i]
                                };

                                recs[r].details.push({
                                    counter: this._aggregate(agg.aggregate),
                                    text: agg.name.toLowerCase(),
                                    nav: 'explorer/singleaxis/' + dim.name + '/' + ca.targetLevel.name
                                });
                            }
                        }
                    }
                }
            }

            for (i=0; i < recs.length; i++) {
                if (recs[i].details.length == 1) {
                    recs[i].details = [];
                }
            }

            this.loadData(recs);
            this.fireEvent('load', this);

        }, this);
    },

    done : function() {
        this.count--;
        if (this.count == 0)
        {
            var subcache = [];
            for (var c=0; c < this.cache.length; c++)
            {
                if (this.cache[c].flight == this.flight)
                    subcache.push(Ext.create('Connector.model.Summary', this.cache[c].config));
            }
            this.removeAll();
            this.add(subcache);
            this.cache = [];
            this.sort('sort', 'ASC');
            this.fireEvent('load', this);
        }
    },

    _aggregate : function(cellset) {
        var total = 0, c;
        for (c=0; c < cellset.cells.length; c++)
        {
            if (cellset.cells[c][0].value > 0)
                total++;
        }
        return total;
    },

    _aggregateByGroup : function(cellset, skipConcat) {

        var cells = cellset.cells,
                types = {}, type, depth, sep = '', x,
                details = (skipConcat ? [] : ''), total = 0;

        for (x=0; x < cells.length; x++) {
            depth = cells[x][0].positions[1][0].level.depth;
            type  = cells[x][0].positions[1][0].name;

            if (depth == 0) {
                continue;
            }
            if (depth == 1 && cells[x][0].value >= 0) {
                types[type] = cells[x][0].value;
            }
            else if (depth == 1) {
                types[type] = 0;
            }
            else if (depth == 2) {
                if (types[type] === undefined) {
                    types[type] = cells[x][0].value;
                }
                else {
                    types[type]++;
                }
            }
        }

        for (x in types) {
            if (types.hasOwnProperty(x)) {
                details.push({
                    counter: types[x],
                    text: x
                });
                total++;
            }
        }

        return {
            details : details,
            total : total,
            types : types
        };
    },

    _getNames : function(cellset) {
        var d = [], val, r;
        for (r=0; r < cellset.axes[1].positions.length; r++) {
            if (cellset.cells[r][0].value > 0) {
                val = cellset.axes[1].positions[r][0].name;
                val = (val == '#null') ? 'Unknown' : val;
                d.push(val);
            }
        }
        return d;
    },

    _listNames : function(cellset) {
        var d = this._getNames(cellset), list = '', sep = '';
        for (var i=0; i < d.length; d++) {
            list += sep + d[i];
            sep = ',';
        }
        return list;
    },

    raiseError : function(msg) {
        this.fireEvent('mdxerror', msg);
    }
});
