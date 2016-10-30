/*
 * Copyright (c) 2014-2016 LabKey Corporation
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
            summaryLevelName,
            subSummaryLevel, d;

        for (d=0; d < dims.length; d++) {

            dim = dims[d];

            if (!dim.hidden && dim.supportsSummary === true) {

                summaryLevelName = dim.findSubjectSummaryLevel;
                if (summaryLevelName) {

                    //
                    // Dimension requests
                    //
                    configs.push({
                        level: summaryLevelName,
                        dimName: dim.name,
                        priority: dim.priority
                    });

                    //
                    // Hierarchy requests
                    //
                    Ext.each(dim.getHierarchies(), function(hier, i) {
                        if (!hier.hidden && hier.supportsSummary) {
                            subSummaryLevel = hier.levels[1];
                            if (Ext.isDefined(hier.findSubjectSubSummaryLevel)) {
                                Ext.each(hier.levels, function(level) {
                                    if (level.uniqueName === hier.findSubjectSubSummaryLevel) {
                                        subSummaryLevel = level;
                                        return false;
                                    }
                                });
                            }

                            configs.push({
                                level: subSummaryLevel.uniqueName,
                                dimName: dim.name,
                                hierarchyIndex: i,
                                targetLevel: subSummaryLevel.uniqueName,
                                singleLabel: subSummaryLevel.countSingular || subSummaryLevel.name,
                                multiLabel: subSummaryLevel.countPlural || subSummaryLevel.name,
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
                    var targetLevel = mdx.getLevel(ca.targetLevel),
                        count = lvlCounts[ca.level] || 0;

                    if (!dimResults[ca.dimName]) {
                        dimResults[ca.dimName] = [];
                    }

                    dimResults[ca.dimName].push({
                        text: (count == 1 ? ca.singleLabel : ca.multiLabel).toLowerCase(),
                        nav: 'explorer/singleaxis/' + dim.name + '/' + targetLevel.name,
                        counter: count
                    });
                }
                else {
                    // dimension
                    var label = Ext.isDefined(dim.pluralName) ? dim.pluralName : dim.name,
                        hierarchies = dim.getHierarchies(),
                        summaryLevel, defaultLevel, hier, h, l;

                    for (h=0; h < hierarchies.length; h++) {
                        hier = hierarchies[h];

                        for (l=0; l < hier.levels.length; l++) {
                            if (hier.levels[l].uniqueName === dim.findSubjectSummaryLevel) {
                                summaryLevel = hier;
                            }
                            if (hier.levels[l].uniqueName === dim.summaryTargetLevel) {
                                defaultLevel = hier;
                            }
                        }
                    }

                    if (Ext.isDefined(summaryLevel)) {
                        recs.push({
                            dimName: ca.dimName,
                            total: lvlCounts[ca.level] || 0,
                            label: label,
                            subject: label.toLowerCase(),
                            defaultLvl: defaultLevel.name,
                            hierarchy: summaryLevel.name,
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
