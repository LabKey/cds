/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.Summary', {

    extend: 'Ext.data.Store',

    alias: 'store.summary',

    model: 'Connector.model.Summary',

    flight: 0,

    count: 0,

    load : function() {
        this.fireEvent('beforeload', this);

        Connector.getState().onMDXReady(this.makeRequest, this);
    },

    makeRequest : function(mdx) {

        var dims = mdx.getDimensions(),
            rows = [],
            configs = [], dim,
            targetLevel,
            targetHierLevel, d;

        for (d=0; d < dims.length; d++) {

            dim = dims[d];

            if (!dim.hidden && dim.supportsSummary === true) {

                targetLevel = dim.summaryTargetLevel;
                if (targetLevel) {

                    //
                    // Dimension requests
                    //
                    configs.push({
                        level: targetLevel,
                        dimName: dim.name,
                        priority: dim.priority
                    });

                    //
                    // Hierarchy requests
                    //
                    Ext.each(dim.getHierarchies(), function(hier, i) {
                        if (!hier.hidden && hier.supportsSummary) {
                            targetHierLevel = hier.levels[1];

                            configs.push({
                                level: targetHierLevel.uniqueName,
                                dimName: dim.name,
                                hierarchyIndex: i,
                                targetLevel: targetHierLevel.uniqueName,
                                label: targetHierLevel.countPlural || targetHierLevel.name,
                                priority: dim.priority
                            });
                        }
                    });
                }
                else {
                    console.warn('Dimension did not provide summaryTargetLevel:', dim.name);
                }
            }
        }

        if (configs.length > 0) {

            // sort according to priority
            configs.sort(function(a, b) {
                return a.priority - b.priority;
            });

            for (d=0; d < configs.length; d++) {
                rows.push({
                    level: configs[d].level
                });
            }

            configs[0].flight = ++this.flight;
            mdx.query({
                onRows: [{
                    operator: 'UNION',
                    arguments: rows
                }],
                useNamedFilters: [LABKEY.app.constant.STATE_FILTER],
                success: function(results) {
                    this.loadResults(mdx, results, configs);
                },
                scope: this
            });
        }
    },

    loadResults : function(mdx, result, configs) {

        if (this.flight !== configs[0].flight) {
            return;
        }

        //
        // process counts by level
        //
        var lvlCounts = {},
            lvlUniqueName,
            _rows = result.axes[1].positions,
            recs = [],
            dimResults = {},
            dim, r=0;

        for (; r < _rows.length; r++) {
            lvlUniqueName = _rows[r][0].level.uniqueName;
            if (lvlCounts[lvlUniqueName]) {
                lvlCounts[lvlUniqueName]++;
            }
            else {
                lvlCounts[lvlUniqueName] = 1;
            }
        }

        Ext.each(configs, function(ca, i) {

            dim = mdx.getDimension(ca.dimName);

            if (dim) {
                if (Ext.isDefined(ca.hierarchyIndex)) {
                    // hierarchy
                    var targetLevel = mdx.getLevel(ca.targetLevel);

                    if (!dimResults[ca.dimName]) {
                        dimResults[ca.dimName] = [];
                    }

                    dimResults[ca.dimName].push({
                        text: ca.label.toLowerCase(),
                        nav: 'explorer/singleaxis/' + dim.name + '/' + targetLevel.name,
                        counter: lvlCounts[ca.level] || 0
                    });
                }
                else {
                    // dimension
                    var label = Ext.isDefined(dim.pluralName) ? dim.pluralName : dim.name,
                            hierarchies = dim.getHierarchies(),
                            targetHierarchy, hier, h, l;

                    for (h=0; h < hierarchies.length; h++) {
                        hier = hierarchies[h];

                        for (l=0; l < hier.levels.length; l++) {
                            if (hier.levels[l].uniqueName === dim.summaryTargetLevel) {
                                targetHierarchy = hier;
                                break;
                            }
                        }
                    }

                    if (Ext.isDefined(targetHierarchy)) {
                        recs.push({
                            dimName: ca.dimName,
                            total: lvlCounts[ca.level] || 0,
                            label: label,
                            subject: label.toLowerCase(),
                            hierarchy: targetHierarchy.name,
                            details: [],
                            sort: i
                        });
                    }
                    else {
                        console.error('Unable to locate level:', dim.summaryTargetLevel);
                    }
                }
            }
            else {
                console.error('unable to locate dimension:', ca.dimName);
            }
        }, this);

        Ext.each(recs, function(rec) {
            if (rec.dimName in dimResults) {
                rec.details = dimResults[rec.dimName];
            }
        });

        this.loadData(recs);
        this.fireEvent('load', this);
    }
});
