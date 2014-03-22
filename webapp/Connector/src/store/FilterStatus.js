/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.store.FilterStatus', {

    extend: 'Ext.data.Store',

    model: 'Connector.model.Detail',

    constructor : function(config) {

        this.flight = 0;
        this.loadTask = new Ext.util.DelayedTask(this._load, this);

        this.callParent([config]);
    },

    load : function() {
        this.loadTask.delay(50);
    },

    _load : function() {
        if (!this.state) {
            console.error('Connector.store.FilterStatus requires a state olap provider');
        }
        else {
            this.state.onMDXReady(function(mdx) {
                if (!this.requests) {
                    this.requests = this.bindRequestConfigs(mdx);
                }
                this.loadGroups();
            }, this);
        }
    },

    bindRequestConfigs : function(mdx) {

        var request = {
            configs: [],
            success: this.loadResults,
            scope: this
        };

        if (mdx) {
            //
            // Binds cube metadata on a per level basis
            //
            var dims = mdx.getDimensions();
            for (var d=0; d < dims.length; d++) {
                var hiers = dims[d].getHierarchies();
                for (var h=0; h < hiers.length; h++) {
                    var lvls = hiers[h].levels, lvl;
                    for (var l=0; l < lvls.length; l++) {
                        lvl = lvls[l];
                        if (lvl.activeCount) {

                            request.configs.push({
                                onRows: [ { level: lvl.uniqueName } ],
                                useNamedFilters: ['stateSelectionFilter', 'statefilter'],
                                label: {
                                    singular: lvl.countSingular,
                                    plural: lvl.countPlural
                                },
                                highlight: lvl.activeCount === 'highlight',
                                cellbased: lvl.cellbased,
                                priority: Ext.isDefined(lvl.countPriority) ? lvl.countPriority : 1000
                            });
                        }
                    }
                }
            }

            // sort according to priority
            request.configs.sort(function(a,b) {
                return a.priority - b.priority;
            });
        }

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

        var recs = [], rec = {}, count;
        for (var i=0; i < qrArray.length; i++) {

            count = 0;
            if (configArray[i].cellbased) {

                for (var c=0; c < qrArray[i].cells.length; c++) {

                    if (qrArray[i].cells[c][0].value > 0)
                        count++;
                }
            }
            else {
                count = qrArray[i].cells[0][0].value;
            }

            rec = {
                hierarchy: configArray[i].label.singular,
                count: count,
                highlight: configArray[i].highlight
            };

            rec.label = rec.count != 1 ? configArray[i].label.plural : configArray[i].label.singular;

            recs.push(rec);
        }

        this.loadData(recs);
    }
});
