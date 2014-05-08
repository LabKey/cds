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

        this.sels = {};

        if (mdx) {
            //
            // Binds cube metadata on a per level basis
            //
            var dims = mdx.getDimensions(), requestId = 0;
            for (var d=0; d < dims.length; d++) {
                var hiers = dims[d].getHierarchies();
                for (var h=0; h < hiers.length; h++) {
                    var lvls = hiers[h].levels, lvl;
                    for (var l=0; l < lvls.length; l++) {
                        lvl = lvls[l];
                        if (lvl.activeCount) {

                            requestId++;

                            //
                            // Filter based request
                            //
                            request.configs.push({
                                requestId: requestId,
                                onRows: [ { level: lvl.uniqueName } ],
                                useNamedFilters: ['statefilter'],
                                dd: dims[d].uniqueName,
                                hh: hiers[h].uniqueName,
                                label: {
                                    singular: lvl.countSingular,
                                    plural: lvl.countPlural
                                },
                                highlight: lvl.activeCount === 'highlight',
                                dataBasedCount: lvl.dataBasedCount,
                                cellbased: lvl.cellbased,
                                priority: Ext.isDefined(lvl.countPriority) ? lvl.countPriority : 1000
                            });

                            //
                            // Selection based request
                            //
                            this.sels[requestId] = {
                                requestId: requestId,
                                selectionBased: true,
                                onRows: [ { level: lvl.uniqueName } ],
                                useNamedFilters: ['stateSelectionFilter', 'statefilter'],
                                cellbased: lvl.cellbased
                            };
                        }
                    }
                }
            }

            // sort according to priority
            request.configs.sort(function(a,b) {
                return a.priority - b.priority;
            });

            // tack on selections
            for (var s in this.sels) {
                if (this.sels.hasOwnProperty(s)) {
                    request.configs.push(this.sels[s]);
                    this.sels[s] = request.configs[request.configs.length-1];
                }
            }
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

        var recs = [], rec = {}, count, subcount, qrSels = {};

        // pick out selections
        for (var i=0; i < qrArray.length; i++) {
            if (configArray[i]['selectionBased'] === true) {
                qrSels[configArray[i].requestId] = qrArray[i];
            }
        }

        var hasSelections = this.state.hasSelections(), qr, ca;
        for (i=0; i < qrArray.length; i++) {

            qr = qrArray[i];
            ca = configArray[i];

            if (ca['selectionBased'] === true) {
                continue;
            }

            count = 0; subcount = 0;
            if (ca.cellbased) {

                var t = qr;
                for (var c=0; c < t.cells.length; c++) {

                    if (t.cells[c][0].value > 0)
                        count++;
                }

                t = qrSels[ca.requestId];
                for (c=0; c < t.cells.length; c++) {

                    if (t.cells[c][0].value > 0)
                        subcount++;
                }
            }
            else {
                if (qr.cells.length > 0)
                    count = qr.cells[0][0].value;
                if (qrSels[ca.requestId].cells.length > 0)
                    subcount = qrSels[ca.requestId].cells[0][0].value;
            }

            rec = {
                dimension: ca.dd,
                hierarchy: ca.hh,
                count: count,
                subcount: hasSelections ? subcount : -1,
                highlight: ca.highlight,
                dataBasedCount: ca.dataBasedCount
            };

            rec.label = rec.count != 1 ? ca.label.plural : ca.label.singular;

            recs.push(rec);
        }

        this.loadData(recs);
    }
});
