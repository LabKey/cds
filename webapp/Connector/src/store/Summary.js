/*
 * Copyright (c) 2012-2013 LabKey Corporation
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
        this.loadGroups();
    },

    setFilterSet : function(filterSet) {
        this.filterSet = filterSet;
    },

    getFilterSet : function() {
        if (!this.filterSet)
            this.filterSet = ['statefilter'];
        return this.filterSet;
    },

    loadGroups : function() {

        this.flight++;

        var order = [
            {
                configs : [
                    {
                        onRows : [ { level : '[Study].[Study]'} ],
                        useNamedFilters : this.getFilterSet(),
                        flight : this.flight
                    }
                ],
                success : this.byStudy,
                scope   : this
            }
            ,{
                configs : [
                    {
                        onRows : [ { level : '[Antigen.Clade].[Clade]'} ],
                        useNamedFilters : this.getFilterSet(),
                        flight : this.flight
                    },
                    {
                        onRows : [ { level : '[Antigen.Sample Type].[Sample Type]'} ],
                        useNamedFilters : this.getFilterSet()
                    },
                    {
                        onRows : [ { level : '[Antigen.Tier].[Tier]'} ],
                        useNamedFilters : this.getFilterSet()
                    },
                    {
                        onRows : [ { level : '[Antigen.Clade].[Name]'} ],
                        useNamedFilters : this.getFilterSet()
                    }
                ],
                success : this.byAntigens,
                scope   : this
            }
            ,{
                configs : [
                    {
                        onRows : [ { hierarchy : 'Assay.Target Area', lnum : 2 } ],
                        useNamedFilters : this.getFilterSet(),
                        flight : this.flight
                    }
                ],
                success : this.byAssay,
                scope   : this
            }
            ,{
                configs : [
                    {
                        onRows : [ { hierarchy : 'Lab', lnum : 1 } ],
                        useNamedFilters : this.getFilterSet(),
                        flight : this.flight
                    }
                ],
                success : this.byLab,
                scope   : this
            }
            ,{
                configs : [
                    {
                        onRows : [ { hierarchy : 'Participant.Race', lnum : 0 } ],
                        useNamedFilters : this.getFilterSet(),
                        flight : this.flight
                    },
                    {
                        onRows : [ { hierarchy : 'Participant.Race', lnum : 1 } ],
                        useNamedFilters : this.getFilterSet()
                    },
                    {
                        onRows : [ { hierarchy : 'Participant.Country', lnum : 1 } ],
                        useNamedFilters : this.getFilterSet()
                    },
                    {
                        onRows : [ { level : '[Participant.Sex].[Sex]' } ],
                        useNamedFilters : this.getFilterSet()
                    }
                ],
                success : this.byDemographic,
                scope   : this
            }
            ,{
                configs : [
                    {
                        onRows : [ { hierarchy : '[Vaccine.Type]', members:'members' } ],
                        useNamedFilters : this.getFilterSet(),
                        flight : this.flight
                    }
                ],
                success : this.byProduct,
                scope   : this
            }
            ,{
                configs : [
                    {
                        onRows : [ { hierarchy : '[Vaccine Component.Vaccine Insert]', members:'members'} ],
                        useNamedFilters : this.getFilterSet(),
                        flight : this.flight
                    }
                ],
                success : this.byVaccineComponent,
                scope   : this
            }
        ];

        this.count = this.count + order.length;
        this.state.onMDXReady(function(mdx){
            for (var i=0; i < order.length; i++)
            {
                mdx.queryMultiple(order[i].configs, order[i].success, order[i].failure, order[i].scope);
            }
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

    subAdd : function(config, flight) {

        this.cache.push({
            config : config,
            flight : flight
        });

    },

    byStudy : function(qrArray, configArray) {

        if (this.error) {
            return;
        }

        var cellset = qrArray[0];

        if (!cellset.axes[1].positions || cellset.axes[1].positions.length == 0) {
            this.raiseError('Unable to locate Study Information.');
            return;
        }

//        var studyNames = this._getNames(cellset);
//        var d = [];
//        for (var s=0; s < studyNames.length; s++) {
//            d.push({text: studyNames[s], nav: 'details/study/' + studyNames[s]});
//        }

        var rec = {
            total     : this._aggregate(cellset),
            label     : 'Studies',
            subject   : 'studies',
            hierarchy : cellset.axes[1].positions[0][0].level.hierarchy.name,
            details   : [], //d,
            sort      : 0
        };

        this.subAdd(rec, configArray[0].flight);
        this.done();
    },

    byAntigens : function(qrArray, configArray) {

        if (this.error) {
            return;
        }

        var clade1  = qrArray[0],
                source1 = qrArray[1],
                tier1   = qrArray[2],
                clade2  = qrArray[3];

        if (!tier1.axes[1].positions || tier1.axes[1].positions.length == 0) {
            this.raiseError('Unable to locate Antigen Information.');
            return;
        }

        var rec = {
            total     : this._aggregate(clade2),
            label     : 'Assay antigens',
            subject   : 'antigens',
            hierarchy : tier1.axes[1].positions[0][0].level.hierarchy.name,
            details   : [],
            sort      : 5
        };

        var agg = [
            {name : 'clades', hierarchy: 'clade', aggregate : clade1},
            {name : 'tiers', hierarchy: 'tier', aggregate : tier1},
            {name : 'sample types', hierarchy: 'sample type', aggregate : source1}
        ];

        for (var a=0; a < agg.length; a++) {
            rec.details.push({
                counter: this._aggregate(agg[a].aggregate),
                text: agg[a].name,
                nav: 'singleaxis/antigen/' + agg[a].hierarchy
            });
        }

        this.subAdd(rec, configArray[0].flight);
        this.done();
    },

    byAssay : function(qrArray, configArray) {

        if (this.error) {
            return;
        }

        var cellset = qrArray[0];

        if (!cellset.axes[1].positions || cellset.axes[1].positions.length == 0) {
            this.raiseError('Unable to locate Assay Information.');
            return;
        }

        var rec = {
            total     : this._aggregate(cellset),
            label     : 'Assays',
            subject   : 'assays',
            hierarchy : cellset.axes[1].positions[0][0].level.hierarchy.name,
            details   : [],
            sort      : 4
        };

//        var names = this._getNames(cellset);
//        for (var d=0; d < names.length; d++) {
//            rec.details.push({
//                text: names[d],
//                nav: 'details/assay/' + names[d]
//            });
//        }
//
//        if (rec.details.length == 0)
//            rec.details.push({text: 'No Matching Assays Found.'});

        this.subAdd(rec, configArray[0].flight);
        this.done();
    },

    byLab : function(qrArray, configArray) {

        if (this.error) {
            return;
        }

        var labCS = qrArray[0];

        if (!labCS.axes[1].positions || labCS.axes[1].positions.length == 0) {
            this.raiseError('Unable to locate Assay Information.');
            return;
        }

        var rec = {
            total     : this._aggregate(labCS),
            label     : 'Labs',
            subject   : 'labs',
            hierarchy : labCS.axes[1].positions[0][0].level.hierarchy.name,
            details   : [],
            sort      : 6
        };

//        var names = this._getNames(labCS);
//        for (var d=0; d < names.length; d++) {
//            rec.details.push({
//                text: names[d]
////                nav: 'labsdetailpanel/' + names[d] // labs dont currently provide a detail page
//            });
//        }
//
//        if (rec.details.length == 0)
//            rec.details.push({text: 'No Matching Assays Found.'});

        this.subAdd(rec, configArray[0].flight);
        this.done();
    },

    _genderHelper : function(g) {
        switch (g)
        {
            case 'm':
                return 'male';
            case 'f':
                return 'female';
            default :
                return g;
        }
    },

    byDemographic : function(qrArray, configArray) {

        if (this.error) {
            return;
        }

        var participantCS = qrArray[0],
                ethnicityCS   = qrArray[1],
                locationCS    = qrArray[2],
                genderCS      = qrArray[3],
                total         = participantCS.cells.length;

        if (!ethnicityCS.axes[1].positions || ethnicityCS.axes[1].positions.length == 0) {
            this.raiseError('Unable to locate Demographic Information.');
            return;
        }

        if (total != 0)
            total = participantCS.cells[0][0].value;

        var rec = {
            total     : total,
            label     : 'Subject characteristics',
            subject   : 'subjects',
            hierarchy : ethnicityCS.axes[1].positions[0][0].level.hierarchy.name,
            details   : [],
            sort      : 1
        };

        var agg = [
            {name : 'races',     aggregate : ethnicityCS},
            {name : 'locations', aggregate : locationCS}
        ], nav;

        for (var a=0; a < agg.length; a++) {
            nav = 'singleaxis/participant/' + (agg[a].name == 'races' ? 'race' : 'country');
            rec.details.push({
                counter: this._aggregate(agg[a].aggregate),
                text: agg[a].name,
                nav: nav
            });
        }

        /* Render by gender */
        agg = this._aggregateByGroup(genderCS, true);

        for (a in agg.types) {
            if (agg.types.hasOwnProperty(a)) {
                rec.details.push({
                    counter: agg.types[a],
                    text: this._genderHelper(a)
                });
            }
        }

        this.subAdd(rec, configArray[0].flight);
        this.done();
    },

    byProduct : function(qrArray, configArray) {

        if (this.error) {
            return;
        }

        var vaccineCS = qrArray[0],
                agg = this._aggregateByGroup(vaccineCS, true);

        if (!vaccineCS.axes[1].positions || vaccineCS.axes[1].positions.length == 0) {
            this.raiseError('Unable to locate Vaccine Information.');
            return;
        }

        var rec = {
            total     : agg.total,
            label     : 'Study products',
            subject   : 'products',
            hierarchy : vaccineCS.axes[1].positions[0][0].level.hierarchy.name,
            details   : agg.details,
            sort      : 2
        };

        this.subAdd(rec, configArray[0].flight);
        this.done();
    },

    byVaccineComponent : function(qrArray, configArray) {

        if (this.error) {
            return;
        }

        var vaccineCS = qrArray[0],
                agg = this._aggregateByGroup(vaccineCS, true);

        if (!vaccineCS.axes[1].positions || vaccineCS.axes[1].positions.length == 0) {
            this.raiseError('Unable to locate Immunogen Information.');
            return;
        }

        var rec = {
            total     : agg.total,
            label     : 'Vaccine immunogens',
            subject   : 'immunogens',
            hierarchy : vaccineCS.axes[1].positions[0][0].level.hierarchy.name,
            details   : agg.details, //Ext.String.ellipsis(agg.details, 100, true),
            sort      : 3
        };

        this.subAdd(rec, configArray[0].flight);
        this.done();
    },

    raiseError : function(msg) {
        this.error = true;
        this.fireEvent('mdxerror', msg);
    }
});
