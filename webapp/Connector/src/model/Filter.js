/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Filter', {
    extend: 'Ext.data.Model',

    fields: [
        {name : 'hierarchy'},
        {name : 'level'},
        {name : 'members', defaultValue: []},
        {name : 'membersName'},
        {name : 'perspective'},
        {name : 'operator'},
        {name : 'isGrid', type: 'boolean', defaultValue: false},
        {name : 'isPlot', type: 'boolean', defaultValue: false},
        {name : 'ranges', defaultValue: []},

        // array of LABKEY.Filter instances
        {name : 'gridFilter', defaultValue: [], convert: function(raw) {
            var filters = [];
            if (Ext.isArray(raw)) {
                Ext.each(raw, function(r) {
                    if (Ext.isString(r)) {
                        if (r === "_null") {
                            filters.push(null);
                        }
                        else {
                            var build = LABKEY.Filter.getFiltersFromUrl(r, 'query');
                            if (Ext.isArray(build)) {
                                filters.push(build[0]); // assume single filters
                            }
                        }
                    }
                    else if (Ext.isDefined(r)) {
                        filters.push(r);
                    }
                });
            }
            else if (Ext.isDefined(raw)) {
                filters.push(raw);
            }
            return filters;
        }},

        // array of measures
        {name : 'plotMeasures', defaultValue: [null, null, null], convert: function(o) {
            var arr = [null, null, null];

            if (Ext.isArray(o)) {
                if (o.length === 1) {
                    arr[1] = o[0]; // If there's only 1 element then it's the y measure.
                }
                else if (o.length === 2) {
                    arr[0] = o[0];
                    arr[1] = o[1];
                }
                else if (o.length === 3) {
                    arr = o;
                }
                else {
                    console.warn('You provided an invalid value for plotMeasures.');
                }
            }


            Ext.each(arr, function (measure) {
                if (measure && !Ext.isEmpty(measure.filterArray)) {
                    var filters = [];
                    Ext.each(measure.filterArray, function (filter) {
                        if (Ext.isString(filter)) {
                            if (filter === "_null") {
                                filters.push(null);
                            }
                            else {
                                var build = LABKEY.Filter.getFiltersFromUrl(filter, 'query');
                                if (Ext.isArray(build)) {
                                    filters.push(build[0]); // assume single filters
                                }
                            }
                        }
                        else if (Ext.isDefined(filter)) {
                            filters.push(filter);
                        }
                    });
                    measure.filterArray = filters;
                }
            });


            return arr;
        }},

        {name : 'isWhereFilter', type: 'boolean', defaultValue: false},
        {name : 'showInverseFilter', type: 'boolean', defaultValue: false},
        {name : 'filterSource', defaultValue: 'OLAP'}, // OLAP or GETDATA

        /**
         * Calculated field that is updated whenever the filter is modified (including creation).
         * Can be accessed using filter.getDataFilters()
         */
        {name : 'dataFilter', defaultValue: {}},
        {name : 'xSource'},
        {name : 'ySource'},

        {name : 'measureSet', defaultValue: []},
        {name : 'xMeasureSet', defaultValue: []},
        {name : 'yMeasureSet', defaultValue: []},

        {name : 'plotAxisMeasures', defaultValue: []},
        {name : 'isAggregated', type: 'boolean', defaultValue: false},

        {name : 'isTime', type: 'boolean', defaultValue: false},
        {name : 'timeMeasure', defaultValue: undefined},
        {name : 'timeFilters', defaultValue: [], convert: function(raw)
        {
            var filters = [];
            if (Ext.isArray(raw))
            {
                Ext.each(raw, function(r)
                {
                    if (Ext.isString(r))
                    {
                        var build = LABKEY.Filter.getFiltersFromUrl(r, 'query');
                        if (Ext.isArray(build))
                        {
                            filters.push(build[0]); // assume single filters
                        }
                    }
                    else if (Ext.isDefined(r))
                    {
                        filters.push(r);
                    }
                });
            }
            else if (Ext.isDefined(raw))
            {
                filters.push(raw);
            }
            return filters;
        }},

        {name : 'isStudyAxis', type: 'boolean', defaultValue: false},
        {name : 'studyAxisKeys', defaultValue: []},
        {name : 'studyAxisFilter', defaultValue: undefined},
        {name : 'isStudySelectionActive', type: 'boolean', defaultValue: false},

        {name : 'filterDisplayString', defaultValue: undefined}
    ],

    statics: {
        // Data Filter Provider
        dfProvider: undefined,

        dynamicOperatorTypes: true,

        emptyLabelText: 'Unknown',

        loaded: false,

        Operators: {
            UNION: 'UNION',
            INTERSECT: 'INTERSECT',
            EXCEPT : 'EXCEPT'
        },

        OperatorTypes: {
            AND: 'AND',
            REQ_AND: 'REQ_AND',
            OR: 'OR',
            REQ_OR: 'REQ_OR'
        },

        sorters: {
            // 0 == 'auto / no special treatment', 1 == 'first', 2 == 'last',
            SORT_EMPTY_TYPE: {
                AUTO: 0,
                FIRST: 1,
                LAST: 2
            },

            SORT_EMPTY: 0,

            _reA: /[^a-zA-Z]/g,

            _reN: /[^0-9]/g,

            asArray: function(value) {
                return Ext.isArray(value) ? value : [];
            },

            /**
             * A valid Array.sort() function that sorts an Array of strings alphanumerically. This sort is case-insensitive
             * and only permits valid instances of string (not undefined, null, etc).
             * @param a
             * @param b
             * @returns {number}
             */
            alphaNum : function(a, b) {
                a = a.toLowerCase(); b = b.toLowerCase();

                var _empty = Connector.model.Filter.sorters.handleEmptySort(a, b);
                if (_empty !== undefined) {
                    return _empty;
                }

                var aA = a.replace(Connector.model.Filter.sorters._reA, "");
                var bA = b.replace(Connector.model.Filter.sorters._reA, "");
                if (aA === bA) {
                    var aN = parseInt(a.replace(Connector.model.Filter.sorters._reN, ""), 10);
                    var bN = parseInt(b.replace(Connector.model.Filter.sorters._reN, ""), 10);
                    return aN === bN ? 0 : aN > bN ? 1 : -1;
                }
                return aA > bA ? 1 : -1;
            },

            natural : function (aso, bso) {
                // http://stackoverflow.com/questions/19247495/alphanumeric-sorting-an-array-in-javascript
                var a, b, a1, b1, i= 0, n, L,
                        rx=/(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
                if (aso === bso) return 0;
                a = aso.toLowerCase().match(rx);
                b = bso.toLowerCase().match(rx);

                var _empty = Connector.model.Filter.sorters.handleEmptySort(a, b);
                if (_empty !== undefined) {
                    return _empty;
                }

                L = a.length;
                while (i < L) {
                    if (!b[i]) return 1;
                    a1 = a[i]; b1 = b[i++];
                    if (a1 !== b1) {
                        n = a1 - b1;
                        if (!isNaN(n)) return n;
                        return a1 > b1 ? 1 : -1;
                    }
                }
                return b[i] ? -1 : 0;
            },

            handleEmptySort : function(a, b) {
                if (Connector.model.Filter.sorters.SORT_EMPTY !== 0 && (a === 'null' || b === 'null')) {
                    var aEmpty = a === 'null';
                    var bEmpty = b === 'null';

                    // both are empty
                    if (aEmpty && bEmpty) {
                        return 0;
                    }

                    if (Connector.model.Filter.sorters.SORT_EMPTY === 1 /* first */) {
                        return aEmpty ? -1 : 1;
                    }
                    else if (Connector.model.Filter.sorters.SORT_EMPTY === 2 /* last */) {
                        return aEmpty ? 1 : -1;
                    }
                }
                // return undefined;
            },

            resolveSortStrategy : function(sortStrategy) {
                switch (sortStrategy) {
                    case 'ALPHANUM':
                        return Connector.model.Filter.sorters.alphaNum;
                    case 'ALPHANUM-RANGE':
                        return function(a, b) {
                            return Connector.model.Filter.sorters.alphaNum(a.split('-')[0], b.split('-')[0]);
                        };
                    case 'NATURAL':
                        return Connector.model.Filter.sorters.natural;
                    case 'SERVER':
                    default:
                        return false;
                }
            }
        },

        subjectMap: {},

        _buildGetDataFilter : function(filter, data) {
            var M = Connector.model.Filter;
            return  M.dfProvider.fn.call(M.dfProvider.scope, filter, data);
        },

        addFilterArguments: function(filter, level, hierarchy, members) {
            Ext.each(members, function (member) {
                filter.arguments.push({
                    level: level,
                    membersQuery: {
                        hierarchy: hierarchy,
                        members: [member]
                    }
                });
            });
        },

        convertOperator : function(operator) {
            var TYPES = Connector.model.Filter.OperatorTypes;
            var OPS = Connector.model.Filter.Operators;

            switch (operator) {
                case OPS.UNION:
                    return TYPES.OR;
                case OPS.INTERSECT:
                    return TYPES.AND;
            }

            console.error('invalid operator:', operator);
        },

        convertOperatorType : function(type) {

            if (!type || (Ext.isString(type) && type.length === 0)) {
                return Connector.model.Filter.Operators.INTERSECT;
            }

            var TYPES = Connector.model.Filter.OperatorTypes;
            var OPS = Connector.model.Filter.Operators;

            switch (type) {
                case TYPES.AND:
                    return OPS.INTERSECT;
                case TYPES.REQ_AND:
                    return OPS.INTERSECT;
                case TYPES.OR:
                    return OPS.UNION;
                case TYPES.REQ_OR:
                    return OPS.UNION;
            }

            console.error('invalid operator type:', type);
        },

        /**
         * Save a participant group/filter.
         *
         * @param config, an object which takes the following configuration properties.
         * @param {Object} [config.mdx] mdx object against which participants are queried
         * @param {Function} [config.failure] Optional. Function called when the save action fails. If not specified
         *        then a default function will be provided
         * @param {Function} [config.success] Function called when the save action is successful
         * @param {Object} [config.group] group definition. The group object should have the following fields
         *         label - name of the group
         *         participantIds - array of participant Ids
         *         description - optional description for the group
         *         filters - array of Connector.model.Filter instances to apply
         *         isLive - boolean, true if this is a query or false if just a group of participant ids.
         *         isOwnerShared - boolean, true if owner ID should be set to value that means shared (-1 currently,
         *                          see ParticipantCategory.java -> OWNER_SHARED)
         */
        doGroupSave : function(config) {
            if (!config)
                throw "You must specify a config object";

            if (!config.mdx || !config.group || !config.success)
                throw "You must specify mdx, group, and success members in the config";

            var group = config.group;
            var ownerId = LABKEY.user.id;
            if (config.group.isOwnerShared) {
                ownerId = -1;  // shared owner ID, see ParticipantCategory.java -> OWNER_SHARED
            }

            // setup config for save call
            var requestConfig = {
                url: LABKEY.ActionURL.buildURL('participant-group', 'createParticipantCategory'),
                method: 'POST',
                headers:{'X-LABKEY-CSRF': LABKEY.CSRF},
                success: config.success,
                scope: config.scope,
                failure: config.failure || Connector.model.Filter.getErrorCallback(),
                jsonData: {
                    label: config.group.label,
                    participantIds: [],
                    description: config.group.description,
                    ownerId: ownerId,
                    type: 'list',
                    visibility: config.group.visibility,
                    filters: Connector.model.Filter.toJSON(config.group.filters, config.group.isLive)
                },
                headers: {"Content-Type": 'application/json'}
            };

            config.mdx.queryParticipantList({
                useNamedFilters : [Connector.constant.State.STATE_FILTER],
                success : function(cs) {
                    // add the fetched participant ids to our json data
                    requestConfig.jsonData.participantIds = Ext.Array.pluck(Ext.Array.flatten(cs.axes[1].positions), 'name');
                    Ext.Ajax.request(requestConfig);
                }
            });
        },

        fromJSON : function(jsonFilter) {
            return Ext.decode(jsonFilter).filters;
        },

        getContainer : function(subjectID) {
            return Connector.model.Filter.subjectMap[subjectID];
        },

        getErrorCallback : function () {
            return function(response) {
                var json = Ext.decode(response.responseText);
                if (json.exception) {
                    if (json.exception.indexOf('There is already a group named') > -1 ||
                            json.exception.indexOf('duplicate key value violates') > -1) {
                        // custom error response for invalid name
                        Ext.Msg.alert("Error", json.exception);
                    }
                    else {
                        Ext.Msg.alert("Error", json.exception);
                    }
                }
                else {
                    Ext.Msg.alert('Failed to Save', response.responseText);
                }
            }
        },

        getFilterValuesAsArray : function(gf) {
            var values = [];
            Ext.each(gf.getValue(), function(value) {
                Ext.each(value.split(';'), function(v) {
                    values.push(Ext.htmlEncode(v == '' ? ChartUtils.emptyTxt : v));
                });
            });

            return values;
        },

        getGridFilterLabel : function(gf) {
            var endLabel = "";

            if (Ext.isFunction(gf.getColumnName)) {
                var splitLabel = gf.getColumnName().split('/');
                var first = splitLabel[0].split('_');
                var real = first[first.length-1];

                if (splitLabel.length > 1) {
                    // we're dealing with a presumed lookup filter
                    endLabel = real + '/' + splitLabel[splitLabel.length-1];
                }
                else {
                    // Just a normal column
                    endLabel = real;
                }
            }
            else {
                console.warn('invalid filter object being processed.');
                endLabel = Connector.model.Filter.emptyLabelText;
            }

            return endLabel;
        },

        getGridLabel : function(data) {

            var filterLabel = function(gf) {
                if (gf) {
                    if (!Ext.isFunction(gf.getFilterType)) {
                        console.warn('invalid label being processed');
                        return Connector.model.Filter.emptyLabelText;
                    }

                    var value = gf.getValue();
                    if (value === undefined || value === null) {
                        value = '';
                    }

                    var label = Connector.model.Filter.getShortFilter(gf.getFilterType().getDisplayText());

                    if (gf.getFilterType().getURLSuffix() === 'dategte' || gf.getFilterType().getURLSuffix() === 'datelte') {
                        return label + ' ' + ChartUtils.tickFormat.date(gf.getValue());
                    }

                    return label + ' ' + Ext.htmlEncode(value);
                }
                return Connector.model.Filter.emptyLabelText;
            };

            if (data['gridFilter']) {
                var label = '';
                var sep = '';
                Ext.each(data.gridFilter, function(gf) {
                    label += sep + filterLabel(gf);
                    sep = ', ';
                });
                return label;
            }

            return filterLabel(data);
        },

        getIncludeExcludeMap : function(members) {
            var membersMap = {
                excluded: [],
                included: []
            };

            for (var m = 0; m < members.length; m++) {
                if (members[m].isNegated) {
                    membersMap.excluded.push(members[m]);
                }
                else {
                    membersMap.included.push(members[m]);
                }
            }

            return membersMap;
        },

        getMemberLabel : function(member) {
            var label = member;
            if (!Ext.isString(label) || label.length === 0 || label === "#null") {
                label = Connector.model.Filter.emptyLabelText;
            }
            return label;
        },

        getOlapFilter : function(mdx, model, subjectName, modelName) {
            if (!Ext.isDefined(mdx) || mdx.$className !== 'LABKEY.query.olap.MDX') {
                console.error('must provide mdx to getOlapFilter');
            }

            var M = Connector.model.Filter,
                    data = model.data;

            if (!modelName) {
                modelName = this.$className;
            }

            var filter = {
                filterType: data.isWhereFilter === true ? 'WHERE' : 'COUNT'
            };

            if (data.filterSource === 'GETDATA') {

                if (Ext.isDefined(M.dfProvider)) {
                    // TODO: Figure out how this works with perspectives, maybe it doesn't care at all?
                    filter = M._buildGetDataFilter(filter, model);
                }
                else {
                    console.error('Failed to register a data filter provider. See Connector.model.Filter.registerDataFilterProvider()');
                }
            }
            else {

                filter.operator = M.lookupOperator(data);
                filter.arguments = [];

                if (data.perspective) {

                    filter.perspective = data.perspective;

                    //
                    // The target hierarchy is
                    //
                    if (data.hierarchy == subjectName) {
                        filter.arguments.push({
                            hierarchy: subjectName,
                            members: data.members
                        });
                    }
                    else {
                        var membersMap = this.getIncludeExcludeMap(data.members);
                        // if we have nothing excluded, simply add a filter argument for each included member
                        if (membersMap['excluded'].length === 0) {
                            this.addFilterArguments(filter, mdx.perspectives[data.perspective].level, data.hierarchy, membersMap['included']);
                        }
                        // if we have only excluded members, we need to add a "members.members" argument first
                        else if (membersMap['included'].length === 0) {
                            if (filter.operator === Connector.model.Filter.Operators.INTERSECT) {
                                filter.operator = Connector.model.Filter.Operators.EXCEPT;
                                // first include all of the members
                                filter.arguments.push({
                                    level: mdx.perspectives[data.perspective].level,
                                    members: "members"
                                });
                                // then exclude the selected members
                                this.addFilterArguments(filter, mdx.perspectives[data.perspective].level, data.hierarchy, membersMap['excluded']);
                            }
                            else {
                                // get a set for each excluded member and union those sets together.
                                for (var m = 0; m < membersMap['excluded'].length; m++) {
                                    filter.arguments.push(
                                            this.getOlapFilter(mdx, Ext.create(modelName, {
                                                hierarchy: data.hierarchy,
                                                level: data.level,
                                                members: [membersMap['excluded'][m]],
                                                membersName: data.membersName,
                                                perspective: data.perspective
                                            }), subjectName, modelName)
                                    );
                                }
                            }
                        }
                        else { // have both included and excluded
                            if (filter.operator === Connector.model.Filter.Operators.INTERSECT) {
                                filter.operator = Connector.model.Filter.Operators.EXCEPT;
                                // get the filter for the included members.  This will be the set to exclude members from
                                filter.arguments.push(
                                        this.getOlapFilter(mdx, Ext.create(modelName, {
                                            hierarchy: data.hierarchy,
                                            level: data.level,
                                            members: membersMap['included'],
                                            membersName: data.membersName,
                                            perspective: data.perspective
                                        }), subjectName, modelName)
                                );
                                this.addFilterArguments(filter, mdx.perspectives[data.perspective].level, data.hierarchy, membersMap['excluded']);
                            }
                            else {
                                // add the filter arguments for all included members
                                this.addFilterArguments(filter, mdx.perspectives[data.perspective].level, data.hierarchy, membersMap['included']);
                                // for each excluded member, get an except query
                                for (var m = 0; m < membersMap['excluded'].length; m++) {
                                    filter.arguments.push(
                                            this.getOlapFilter(mdx, Ext.create(modelName, {
                                                hierarchy: data.hierarchy,
                                                level: data.level,
                                                members: [membersMap['excluded'][m]],
                                                membersName: data.membersName,
                                                perspective: data.perspective
                                            }), subjectName, modelName)
                                    );
                                }
                            }
                        }
                    }
                }
                else {
                    if (M.usesMemberName(data, subjectName)) {

                        var m = data.members;
                        if (data.membersName && data.membersName.length > 0) {
                            m = { namedSet: data.membersName };
                        }

                        filter.arguments.push({
                            hierarchy: subjectName,
                            members: m
                        });
                    }
                    else {
                        // CONSIDER: If we need to implement negation of individual subjects, this loop will need to change,
                        // but it seems that we might be able to get rid of this code.
                        for (var m=0; m < data.members.length; m++) {
                            filter.arguments.push({
                                hierarchy: subjectName,
                                membersQuery: {
                                    hierarchy: data.hierarchy,
                                    members: [data.members[m]]
                                }
                            });
                        }
                    }
                }
            }

            return filter;
        },

        getShortFilter : function(displayText) {
            switch (displayText) {
                case "Does Not Equal":
                    return '&#8800;';
                case "Equals":
                    return '=';
                case "Is Greater Than":
                    return '>';
                case "Is Less Than":
                    return '<';
                case "Is Greater Than or Equal To":
                    return '&#8805;';
                case "Is Less Than or Equal To":
                    return '&#8804;';
                default:
                    return displayText;
            }
        },

        getSubjectUniqueName : function(subjectID) {
            return '[Subject].[' + Connector.model.Filter.getContainer(subjectID) + '].[' + subjectID + ']';
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
                        var uniqueName = member.uniqueName.split('].'),
                                containerID = uniqueName[1].replace('[', '');

                        Connector.model.Filter.subjectMap[member.name] = containerID;
                    }
                });

                Connector.model.Filter.loaded = true;
            }
        },

        lookupOperator : function(data) {

            if (Connector.model.Filter.dynamicOperatorTypes) {
                return Connector.model.Filter.convertOperatorType(data.operator);
            }
            else {
                // Backwards compatible
                if (data.operator) {
                    return data.operator;
                }
            }

            return Connector.model.Filter.Operators.INTERSECT;
        },

        mergeRanges : function(filterA, filterB) {

            // If filterA is a member list and the new filter is a range, drop the range from filterB and merge will be a member list
            // if filterA is a range and the filterB is a member list, drop the range from filterA and merge will be a member list
            // else concatenate the ranges filters

            var numRangesA = filterA.getRanges().length,
                numRangesB = filterB.getRanges().length;

            // no ranges to merge
            if (numRangesA === 0 && numRangesB === 0) {
                return;
            }

            if (numRangesA === 0 && numRangesB > 0) {
                filterB.set('ranges', []);
            }
            else if (numRangesA > 0 && numRangesB === 0) {
                filterA.set('ranges', []);
            }
            else {
                // They both contain ranges
                filterA.set('ranges', filterA.getRanges().concat(filterB.getRanges()));
            }
        },

        /**
         *
         * @param {Array} filters Array of Connector.model.Filter instances to encode
         * @param {boolean} isLive
         * @returns {*}
         */
        toJSON : function(filters, isLive) {

            var jsonFilters = [];
            Ext.each(filters, function(f) {
                jsonFilters.push(f.jsonify());
            });

            return Ext.encode({
                isLive : isLive,
                filters : jsonFilters
            });
        },

        usesMemberName : function(data, subjectName) {
            return data.hierarchy == subjectName;
        }
    },

    constructor : function(config)
    {
        this.callParent([config]);
        this._initFilter();
    },

    _initFilter : function()
    {
        Connector.getQueryService().onQueryReady(function()
        {
            this._generateMeasures();
            this._generateDataFilters();
        }, this);
    },

    _canMergeGridFilters : function(data, fdata)
    {
        var merge = true,
            pm, fpm, i=0;

        for (; i < data.gridFilter.length; i++)
        {
            pm = data.gridFilter[i];
            fpm = fdata.gridFilter[i];

            if (pm === null)
            {
                if (fpm !== null)
                {
                    merge = false;
                    break;
                }

                // they are both null, OK
            }
            else
            {
                // equivalent if they have the same URL prefix -- value can change
                if (fpm && pm.getURLParameterName().toLowerCase() !== fpm.getURLParameterName().toLowerCase())
                {
                    merge = false;
                    break;
                }
            }
        }

        return merge;
    },

    _canMergePlotMeasures : function(data, fdata)
    {
        var _merge = true, pm, fpm, i=0;

        for (; i < data.plotMeasures.length; i++)
        {
            pm = data.plotMeasures[i];
            fpm = fdata.plotMeasures[i];

            if (pm === null)
            {
                if (fpm !== null)
                {
                    _merge = false;
                    break;
                }

                // they are both null, OK
            }
            else if (fpm === null)
            {
                _merge = false;
                break;
            }
            else
            {
                // equivalent if they have the same alias
                if (pm.measure && fpm.measure)
                {
                    if (pm.measure.alias !== fpm.measure.alias)
                    {
                        _merge = false;
                        break;
                    }
                    //else if (ChartUtils.getAssayDimensionsWithDifferentValues(pm.measure, fpm.measure).length > 0)
                    //{
                    //    // compare the options to determine if the axis values are different
                    //    _merge = false;
                    //    break;
                    //}
                }
                else
                {
                    console.warn('Unknown plot measure configuration. Expected to have \'measure\' property on each \'plotMeasure\'. Unable to determine merge strategy.');
                    _merge = false;
                    break;
                }
            }
        }

        return _merge;
    },

    /**
     * Assumes both filters being inspected are time filters
     * @param data
     * @param fdata
     * @returns {boolean}
     * @private
     */
    _canMergeTimeFilters : function(data, fdata) {
        var _merge = false,
            dTimeMeasure = data.timeMeasure,
            fTimeMeasure = fdata.timeMeasure;

        if (data.isPlot === fdata.isPlot && dTimeMeasure.measure.alias === fTimeMeasure.measure.alias) {
            if (dTimeMeasure.dateOptions.interval === fTimeMeasure.dateOptions.interval) {
                if (dTimeMeasure.dateOptions.zeroDayVisitTag === fTimeMeasure.dateOptions.zeroDayVisitTag) {
                    _merge = true;
                }
            }
        }

        return _merge;
    },

    /**
     * Complex comparator that says two filters can be merged. This should always be called
     * in advance of calling merge() to be safe.
     * @param f
     */
    canMerge : function(f) {
        var data = this.data,
            fdata = f.data,
            _merge = false;

        if (data.isAggregated && fdata.isAggregated) {
            _merge = this._canMergeGridFilters(data, fdata);
        }
        else if (data.isTime || fdata.isTime) {
            if (data.isTime && fdata.isTime) {
                _merge = this._canMergeTimeFilters(data, fdata);
            }
        }
        else if (data.isPlot || fdata.isPlot || data.isGrid || fdata.isGrid) {
            if (data.isPlot === fdata.isPlot && data.isGrid === fdata.isGrid) {
                var _mergeMeasures = true;

                if (data.isPlot) {
                    _mergeMeasures = this._canMergePlotMeasures(data, fdata);
                    if (_mergeMeasures) {
                        _mergeMeasures = this._canMergeGridFilters(data, fdata);
                    }
                }
                else {
                    // isGrid
                    _mergeMeasures = this._canMergeGridFilters(data, fdata);
                }

                _merge = _mergeMeasures;
            }
            // else they don't match
        }
        else if (data.hierarchy && fdata.hierarchy && data.hierarchy === fdata.hierarchy) {
            _merge = true;
        }

        return _merge;
    },

    merge : function(f) {

        var update = {
            members: this._mergeMembers(this.get('members'), f.get('members'))
        };

        if (this.isAggregated() || this.isPlot() || this.isTime()) {
            update.gridFilter = this._mergeGridFilters(this.get('gridFilter'), f.get('gridFilter'));
        }

        if (this.isTime()) {
            update.timeFilters = this._mergeGridFilters(this.get('timeFilters'), f.get('timeFilters'));
        }

        if (this.get('isStudyAxis') && f.get('isStudyAxis')) {
            update.filterDisplayString = this.get('filterDisplayString') + '<br/><br/>AND<br/><br/>' + f.get('filterDisplayString');
        }

        this.set(update);

        return this;
    },

    _mergeMembers : function(aMembers, bMembers) {
        if (this.isAggregated()) {
            return bMembers;
        }

        var _members = Ext.Array.clone(aMembers);
        for (var i=0; i < bMembers.length; i++) {
            if (!this._hasMember(_members, bMembers[i])) {
                _members.push(bMembers[i]);
            }
        }
        return _members;
    },

    getLevel : function() {
        return this.get('level');
    },

    getDataFilters : function() {
        return this.get('dataFilter');
    },

    getGridLabel : function() {
        return Connector.model.Filter.getGridLabel(this.data);
    },

    getMeasureSet : function(axis) {
        if (axis) {
            if (axis.toLowerCase() === 'x')
                return Ext.clone(this.get('xMeasureSet'));
            else if (axis.toLowerCase() === 'y')
                return Ext.clone(this.get('yMeasureSet'));
            else
                throw 'Invalid axis requested. "' + axis + '"';
        }

        return Ext.clone(this.get('measureSet'));
    },

    getTimeFilters : function() {
        return this.get('timeFilters')
    },

    getPlotAxisMeasures: function(axisName, compareMeasure, comparator)
    {
        var matchingMeasures = [],
            plotAxisMeasures = this.get('plotAxisMeasures');

        if (this.isTime() && plotAxisMeasures.length > 0)
        {
            matchingMeasures.push(plotAxisMeasures[0]);
        }

        Ext.each(plotAxisMeasures, function(m)
        {
            var paMeasure = Ext.clone(m);
            if (axisName)
            {
                paMeasure.measure.axisName = axisName;
            }

            if (compareMeasure)
            {
                if (Ext.isFunction(comparator))
                {
                    if (paMeasure && comparator(compareMeasure, paMeasure.measure))
                    {
                        matchingMeasures.push(paMeasure);
                    }
                }
                else
                {
                    throw 'A "comparator" function must be supplied when attempting to match a measure';
                }
            }
            else
            {
                matchingMeasures.push(paMeasure);
            }
        }, this);

        return matchingMeasures;
    },

    /**
     * Returns abbreviated display value. (E.g. 'Equals' returns '=');
     * @param displayText - display text from LABKEY.Filter.getFilterType().getDisplayText()
     */
    getShortFilter : function(displayText) {
        return Connector.model.Filter.getShortFilter(displayText);
    },

    getValue : function(key) {
        return this.data[key];
    },

    /**
     * Do not call this directly from within this model's implementation. Use this._set() instead.
     * @param fieldName
     * @param newValue
     */
    'set': function(fieldName, newValue)
    {
        this.callParent(arguments);

        if (!this.SET_LOCK)
        {
            this._initFilter();
        }
    },

    /**
     * An internal 'set' function that can be used to safely set values
     * @param fieldName
     * @param newValue
     * @private
     */
    _set : function(fieldName, newValue)
    {
        this.SET_LOCK = true;
        this.set(fieldName, newValue);
        this.SET_LOCK = false;
    },

    isAggregated : function()
    {
        return this.get('isAggregated') === true;
    },

    isTime : function()
    {
        return this.get('isTime') === true;
    },

    /**
     * Returns true iff the x and y plotMeasures are the same source (e.g. NAb and NAb)
     * @returns {*|boolean}
     */
    samePlotMeasureSources : function()
    {
        var plotMeasures = this.get('plotMeasures');
        return plotMeasures[0] && plotMeasures[1] &&
            plotMeasures[0].measure.queryName.toLowerCase() === plotMeasures[1].measure.queryName.toLowerCase();
    },

    /**
     * Generates the set of measures that can be used to express this filter as a count filter.
     * These measures are persisted in 'measureSet' property.
     * @private
     */
    _generateMeasures : function()
    {
        var queryService = Connector.getQueryService(),
            measureMap = {},
            xMeasureMap = {},
            yMeasureMap = {};
        if (this.isAggregated())
        {
            // aggregation filter

            /**
             * "Apply aggregate filters as subject filters from the brushed set of points."
             */
            var subjectMeasure = queryService.getMeasure(queryService.getSubjectColumnAlias());

            measureMap[subjectMeasure.alias] = {
                measure: Ext.clone(subjectMeasure),
                filterArray: []
            };

            var filter = this._generateFilter(subjectMeasure.alias, this.get('members'));
            measureMap[subjectMeasure.alias].filterArray.push(filter);
        }
        else if (this.isPlot() && this.isGrid())
        {
            // plot selection filter

            this._processPlotMeasures(measureMap, xMeasureMap, yMeasureMap);
            this._processGridMeasures(measureMap, xMeasureMap, yMeasureMap);
        }
        else if (this.isPlot())
        {
            // in the plot filter

            this._processPlotMeasures(measureMap, xMeasureMap, yMeasureMap);
        }
        else if (this.isGrid())
        {
            // grid filter

            this._processGridMeasures(measureMap, xMeasureMap, yMeasureMap);
        }
        else
        {
            // olap filter -- nothing to do
        }

        // convert the map into an array of 'wrapped' measures
        this._set({
            measureSet: this._mapToMeasures(measureMap),
            xMeasureSet: this._mapToMeasures(xMeasureMap),
            yMeasureSet: this._mapToMeasures(yMeasureMap)
        });
    },

    /**
     * Used to process the 'plotMeasures' property to determine the set of measures to include
     * @param measureMap
     * @param xMeasureMap
     * @param yMeasureMap
     * @private
     */
    _processPlotMeasures : function(measureMap, xMeasureMap, yMeasureMap)
    {
        var queryService = Connector.getQueryService(),
            xSource, ySource;

        Ext.each(this.get('plotMeasures'), function(plotMeasure, i)
        {
            if (plotMeasure)
            {
                var measure = queryService.getMeasure(plotMeasure.measure.alias);

                if (measure)
                {
                    // index 0 => x-axis plot measure
                    if (i == 0)
                    {
                        measureMap[measure.alias] = {
                            measure: Ext.clone(measure),
                            filterArray: Ext.isArray(plotMeasure.filterArray) ? plotMeasure.filterArray : []
                        };

                        if (!xSource)
                        {
                            xSource = measure.schemaName + '|' + measure.queryName;
                        }
                        xMeasureMap[measure.alias] = {
                            measure: Ext.clone(measure),
                            filterArray: Ext.isArray(plotMeasure.filterArray) ? plotMeasure.filterArray : []
                        };
                    }
                    // index 1 => y-axis plot measure
                    else if (i == 1)
                    {
                        measureMap[measure.alias] = {
                            measure: Ext.clone(measure),
                            filterArray: Ext.isArray(plotMeasure.filterArray) ? plotMeasure.filterArray : []
                        };

                        if (!ySource)
                        {
                            ySource = measure.schemaName + '|' + measure.queryName;
                        }
                        yMeasureMap[measure.alias] = {
                            measure: Ext.clone(measure),
                            filterArray: Ext.isArray(plotMeasure.filterArray) ? plotMeasure.filterArray : []
                        };
                    }
                    // index 2 => color plot measure
                    else if (i == 2 && ChartUtils.hasValidColorMeasure(this.get('plotMeasures')))
                    {
                        measureMap[measure.alias] = {
                            measure: Ext.clone(measure),
                            filterArray: Ext.isArray(plotMeasure.filterArray) ? plotMeasure.filterArray : []
                        };
                    }

                    if (plotMeasure.time)
                    {
                        measureMap[measure.alias].time = plotMeasure.time;

                        if (i == 0)
                        {
                            xMeasureMap[measure.alias].time = plotMeasure.time;
                        }
                        else if (i == 1)
                        {
                            yMeasureMap[measure.alias].time = plotMeasure.time;
                        }
                    }

                    if (plotMeasure.dimension)
                    {
                        measureMap[measure.alias].dimension = plotMeasure.dimension;

                        if (i == 0)
                        {
                            xMeasureMap[measure.alias].dimension = plotMeasure.dimension;
                        }
                        else if (i == 1)
                        {
                            yMeasureMap[measure.alias].dimension = plotMeasure.dimension;
                        }
                    }

                    if (plotMeasure.dateOptions)
                    {
                        measureMap[measure.alias].dateOptions = plotMeasure.dateOptions;

                        if (i == 0)
                        {
                            xMeasureMap[measure.alias].dateOptions = plotMeasure.dateOptions;
                        }
                        else if (i == 1)
                        {
                            yMeasureMap[measure.alias].dateOptions = plotMeasure.dateOptions;
                        }
                    }

                    // plotMeasures can have 'Advanced Options' (i.e. axis filters) which need to be added to the measure set
                    Ext.each(Connector.model.Measure.getPlotAxisFilterMeasureRecords(plotMeasure.measure), function(axisFilterRecord)
                    {
                        var optionAlias = LABKEY.Utils.getMeasureAlias(axisFilterRecord),
                            optionMeasure = queryService.getMeasure(optionAlias);

                        if (optionMeasure)
                        {
                            // ensure mapping
                            if (!measureMap[optionAlias])
                            {
                                measureMap[optionAlias] = {
                                    measure: optionMeasure,
                                    filterArray: []
                                }
                            }

                            if (i == 0)
                            {
                                if (!xMeasureMap[optionAlias])
                                {
                                    xMeasureMap[optionAlias] = {
                                        measure: queryService.getMeasure(optionAlias), // Issue 24728: make sure to get a new clone of the measure from the queryService
                                        filterArray: []
                                    }
                                }
                            }
                            else if (i == 1)
                            {
                                if (!yMeasureMap[optionAlias])
                                {
                                    yMeasureMap[optionAlias] = {
                                        measure: queryService.getMeasure(optionAlias), // Issue 24728: make sure to get a new clone of the measure from the queryService
                                        filterArray: []
                                    }
                                }
                            }

                            // ensure filters
                            if (!Ext.isEmpty(axisFilterRecord.values))
                            {
                                if (Ext.isEmpty(measureMap[optionAlias].measure.values))
                                {
                                    measureMap[optionAlias].measure.values = [];
                                }

                                // Issue 24136: concatenate values array filters for measure aliases that exist on both x and y axis
                                measureMap[optionAlias].measure.values = Ext.Array.unique(measureMap[optionAlias].measure.values.concat(axisFilterRecord.values));

                                if (i == 0)
                                {
                                    if (Ext.isEmpty(xMeasureMap[optionAlias].measure.values))
                                    {
                                        xMeasureMap[optionAlias].measure.values = [];
                                    }

                                    xMeasureMap[optionAlias].measure.values = Ext.Array.unique(xMeasureMap[optionAlias].measure.values.concat(axisFilterRecord.values));
                                }
                                else if (i == 1)
                                {
                                    if (Ext.isEmpty(yMeasureMap[optionAlias].measure.values))
                                    {
                                        yMeasureMap[optionAlias].measure.values = [];
                                    }

                                    yMeasureMap[optionAlias].measure.values = Ext.Array.unique(yMeasureMap[optionAlias].measure.values.concat(axisFilterRecord.values));
                                }
                            }
                        }
                        else
                        {
                            console.warn('Unable to resolve measure from filter option:', optionAlias);
                        }
                    }, this);
                }
            }
        }, this);

        this._set({
            xSource: xSource ? xSource.toLowerCase() : undefined,
            ySource: ySource ? ySource.toLowerCase() : undefined
        });
    },

    /**
     * Used to process the 'gridFilter' property to determine the set of measures to include
     * @param measureMap
     * @param xMeasureMap
     * @param yMeasureMap
     * @private
     */
    _processGridMeasures : function(measureMap, xMeasureMap, yMeasureMap)
    {
        var queryService = Connector.getQueryService();

        Ext.each(this.get('gridFilter'), function(gf, i)
        {
            if (gf && gf !== '_null')
            {
                if (Ext.isString(gf))
                {
                    gf = LABKEY.Filter.getFiltersFromUrl(gf, 'query')[0];
                }

                var measure = queryService.getMeasure(gf.getColumnName());
                if (measure)
                {
                    var isTimeBased = measure.alias in queryService.getTimeAliases();

                    if (!measureMap[measure.alias])
                    {
                        measureMap[measure.alias] = {
                            measure: Ext.clone(measure),
                            filterArray: []
                        };

                        if (isTimeBased)
                        {
                            measureMap[measure.alias].dateOptions = {
                                interval: measure.alias,
                                zeroDayVisitTag: null
                            };
                        }
                    }

                    measureMap[measure.alias].filterArray.push(gf);

                    if (i < 2)
                    {
                        if (Ext.isDefined(xMeasureMap))
                        {
                            if (!xMeasureMap[measure.alias])
                            {
                                xMeasureMap[measure.alias] = {
                                    measure: Ext.clone(measure),
                                    filterArray: []
                                };

                                if (isTimeBased)
                                {
                                    xMeasureMap[measure.alias].dateOptions = {
                                        interval: measure.alias,
                                        zeroDayVisitTag: null
                                    };
                                }
                            }

                            xMeasureMap[measure.alias].filterArray.push(gf);
                        }
                    }
                    else if (i < 4)
                    {
                        if (Ext.isDefined(yMeasureMap))
                        {
                            if (!yMeasureMap[measure.alias])
                            {
                                yMeasureMap[measure.alias] = {
                                    measure: Ext.clone(measure),
                                    filterArray: []
                                };

                                if (isTimeBased)
                                {
                                    yMeasureMap[measure.alias].dateOptions = {
                                        interval: measure.alias,
                                        zeroDayVisitTag: null
                                    };
                                }
                            }

                            yMeasureMap[measure.alias].filterArray.push(gf);
                        }
                    }
                }
                else
                {
                    console.warn('Unable to find measure for query parameter', gf.getURLParameterName() + '=' + gf.getURLParameterValue());
                }
            }
        });
    },

    _mapToMeasures : function(measureMap)
    {
        var measures = [];

        Ext.iterate(measureMap, function(alias, config)
        {
            var mc = {
                measure: config.measure
            };
            if (config.dimension)
            {
                mc.dimension = config.dimension;
            }
            if (config.dateOptions)
            {
                mc.dateOptions = config.dateOptions;
            }
            if (config.filterArray.length > 0)
            {
                mc.filterArray = config.filterArray;
            }

            measures.push(mc);
        }, this);

        return measures;
    },

    _dataFilterHelper : function(filterMap, alias, filter)
    {
        if (!Ext.isArray(filterMap[alias]))
        {
            filterMap[alias] = [];
        }
        filterMap[alias].push(filter);
    },

    _generateDataFilters : function()
    {
        var dataFilterMap = {},
            studyAxisFilterMap = {},
            plotAxisMeasures = [];

        if (this.isAggregated())
        {
            // aggregation filter -- do nothing
        }
        else if (this.isPlot())
        {
            /**
             * "In the Plot filters, including the axis filters, are applied as a data filter globally."
             */

            /**
             * "Plot selection filters, including axis filters, are global data filters on the dragged measure
             * (each axis considered separately), unless both axes are the same source then plot selection filters,
             * including axis filters, are applied as a compound global data filter."
             */
            var sameSource = this.samePlotMeasureSources(),
                accountedForTime = false,
                xFilters = [],
                yFilters = [];

            if (sameSource)
            {
                this._generateCompoundFilter(dataFilterMap);
            }
            else if (this.get('isStudyAxis')) {
                var oldSelection = null;
                if (this.get('studyAxisFilter') && this.get('studyAxisFilter')['_COMPOUND']) {
                    oldSelection = this.get('studyAxisFilter')['_COMPOUND'][0];
                }
                this._generateCompoundStudyAxisFilter(studyAxisFilterMap, oldSelection);
            }

            // plot selection filter
            if (this.isGrid())
            {
                Ext.each(this.get('gridFilter'), function(gridFilter, i)
                {
                    if (gridFilter)
                    {
                        if (i < 2)
                        {
                            xFilters.push(gridFilter);
                        }
                        else if (i < 4)
                        {
                            yFilters.push(gridFilter);
                        }

                        if (!sameSource && !this.get('isStudyAxis'))
                            this._dataFilterHelper(dataFilterMap, gridFilter.getColumnName(), gridFilter);
                    }
                }, this);
            }

            // in the plot filter
            Ext.each(this.get('plotMeasures'), function(plotMeasure, i)
            {
                if (i < 2 /* do not include color */ && plotMeasure && plotMeasure.measure)
                {
                    var measure = plotMeasure.measure;

                    if (!sameSource && !this.get('isStudyAxis'))
                    {
                        // axis filters -> data filters
                        if (measure.options && measure.options.dimensions)
                        {
                            Ext.iterate(measure.options.dimensions, function(alias, values)
                            {
                                if (Ext.isArray(values) && !Ext.isEmpty(values))
                                {
                                    var genFilter = this._generateFilter(alias, values);
                                    if (genFilter)
                                    {
                                        this._dataFilterHelper(dataFilterMap, genFilter.getColumnName(), genFilter);
                                    }
                                }
                            }, this);
                        }

                        if (Ext.isArray(plotMeasure.filterArray))
                        {
                            Ext.each(plotMeasure.filterArray, function(filter)
                            {
                                if (filter)
                                {
                                    if (filter.getColumnName().toLowerCase() !== measure.alias.toLowerCase())
                                        throw 'A filter on "' + filter.getColumnName() + '" cannot be specified on the "' + measure.alias + '" measure.';

                                    this._dataFilterHelper(dataFilterMap, filter.getColumnName(), filter);
                                }
                            }, this);
                        }
                    }

                    if (this.isGrid())
                    {
                        // plot selection
                        var wrapped = {
                            measure: measure
                        };

                        if (plotMeasure.dateOptions)
                        {
                            wrapped.dateOptions = Ext.clone(plotMeasure.dateOptions);
                        }

                        if (this.isTime() && !accountedForTime)
                        {
                            accountedForTime = true;
                            Ext.each(this.getMeasureSet(), function(_wrapped)
                            {
                                if (_wrapped.measure.alias.toLowerCase() === QueryUtils.SUBJECT_SEQNUM_ALIAS.toLowerCase())
                                {
                                    plotAxisMeasures.push(_wrapped);
                                }
                            });
                        }
                        else if (wrapped.measure.variableType !== 'TIME')
                        {
                            wrapped.filterArray = i == 0 ? xFilters : yFilters;
                        }

                        plotAxisMeasures.push(wrapped);
                    }
                }
            }, this);
        }
        else if (this.isGrid())
        {
            // grid filter

            /**
             * "Grid filters are global data filters."
             */
            Ext.each(this.get('gridFilter'), function(gridFilter)
            {
                if (gridFilter)
                {
                    this._dataFilterHelper(dataFilterMap, gridFilter.getColumnName(), gridFilter);
                }
            }, this);

            // grid filters apply to both x/y
            var queryService = Connector.getQueryService();
            Ext.iterate(dataFilterMap, function(alias, filters)
            {
                var measure = queryService.getMeasure(alias);
                if (measure)
                {
                    plotAxisMeasures.push({
                        measure: measure,
                        filterArray: filters
                    });
                }
            }, this);
        }
        else
        {
            // olap filter -- nothing to do
        }

        this._set({
            dataFilter: dataFilterMap,
            plotAxisMeasures: plotAxisMeasures,
            studyAxisFilter: studyAxisFilterMap
        });
    },

    /**
     * Attempts to generate a filter from the specified
     * @param alias
     * @param values
     * @private
     */
    _generateFilter : function(alias, values)
    {
        var filter;

        if (values.length > 1)
        {
            filter = LABKEY.Filter.create(alias, values.join(';'), LABKEY.Filter.Types.IN);
        }
        else if (values.length === 1)
        {
            filter = LABKEY.Filter.create(alias, values[0]);
        }
        else
        {
            filter = LABKEY.Filter.create(alias, undefined, LABKEY.Filter.Types.ISBLANK);
        }

        return filter;
    },

    _generateCompoundStudyAxisFilter: function(filterMap, existingCompoundFilter) {
        var filterSets = this.get('gridFilter'),
            plotMeasures = this.get('plotMeasures');

        var compounds = [];
        var newFilter = Connector.Filter.compound(filterSets, 'AND');
        if (!existingCompoundFilter) {
            compounds.push(newFilter);
        }
        else {
            var isStudyAxisSelection = this.get('isStudySelectionActive');

            // if a study axis selection has been promoted to filter, then use AND
            // use OR for multiple active selections
            var operator = isStudyAxisSelection ? 'OR' : 'AND';
            var compounded = Connector.Filter.compound([
                newFilter,
                existingCompoundFilter
            ], operator);

            compounds.push(compounded);
        }
        // the 1st time this is called is when a new selection is added, use OR for filters in a multi selection
        // the 2nd time this is called is when selection is promoted to filter, use AND for different compound filter.
        this._set('isStudySelectionActive', false);

        filterMap[Connector.Filter.COMPOUND_ALIAS] = compounds;
    },

    /**
     * Generates a compound filter based on the current plot measures. Applies it to the filterMap.
     * @param filterMap
     * @private
     */
    _generateCompoundFilter : function(filterMap)
    {
        // create a compound filter
        var gridFilter = this.get('gridFilter'),
            plotMeasures = this.get('plotMeasures'),
            xGridFilter = [gridFilter[0], gridFilter[1]],
            yGridFilter = [gridFilter[2], gridFilter[3]],
            xMeasure = plotMeasures[0],
            yMeasure = plotMeasures[1],
            measure,
            xfilterSet = [],
            yfilterSet = [];

        // process grid filter(s)
        Ext.each(xGridFilter, function(gridFilter)
        {
            if (gridFilter)
            {
                xfilterSet.push(gridFilter);
            }
        }, this);

        Ext.each(yGridFilter, function(gridFilter)
        {
            if (gridFilter)
            {
                yfilterSet.push(gridFilter);
            }
        }, this);

        // axis filters -> data filters
        measure = xMeasure.measure;
        if (measure.options && measure.options.dimensions)
        {
            Ext.iterate(measure.options.dimensions, function(alias, values)
            {
                if (Ext.isArray(values) && !Ext.isEmpty(values))
                {
                    var genFilter = this._generateFilter(alias, values);
                    if (genFilter)
                    {
                        xfilterSet.push(genFilter);
                    }
                }
            }, this);
        }

        measure = yMeasure.measure;
        if (measure.options && measure.options.dimensions)
        {
            Ext.iterate(measure.options.dimensions, function(alias, values)
            {
                if (Ext.isArray(values) && !Ext.isEmpty(values))
                {
                    var genFilter = this._generateFilter(alias, values);
                    if (genFilter)
                    {
                        yfilterSet.push(genFilter);
                    }
                }
            }, this);
        }

        if (Ext.isEmpty(xfilterSet) && Ext.isEmpty(yfilterSet))
        {
            return;
        }

        var compounds = [];
        if (Ext.isEmpty(yfilterSet))
        {
            compounds.push(Connector.Filter.compound(xfilterSet, 'AND'));
        }
        else if (Ext.isEmpty(xfilterSet))
        {
            compounds.push(Connector.Filter.compound(yfilterSet, 'AND'));
        }
        else
        {
            compounds.push(Connector.Filter.compound([
                Connector.Filter.compound(xfilterSet, 'AND'),
                Connector.Filter.compound(yfilterSet, 'AND')
            ], 'OR'));
        }

        filterMap[Connector.Filter.COMPOUND_ALIAS] = compounds;
    },

    _hasMember : function(memberArray, newMember) {
        // issue 19999: don't push duplicate member if re-selecting
        for (var k = 0; k < memberArray.length; k++) {
            if (!memberArray[k].hasOwnProperty('uniqueName') || !newMember.hasOwnProperty('uniqueName'))
                continue;

            if (memberArray[k].uniqueName == newMember.uniqueName)
                return true;
        }

        return false;
    },

    _mergeGridFilters : function(aGridFilters, bGridFilters) {
        var _measures = Ext.Array.clone(aGridFilters);

        for (var i=0; i < bGridFilters.length; i++) {
            _measures[i] = Ext.clone(bGridFilters[i]);
        }

        return _measures;
    },

    /**
     * Complex comparator that says two filters are equal if and only if they match on the following:
     * - isGrid, isPlot, hierarchy, member length, and member set (member order insensitive)
     * @param f - Filter to compare this object against.
     */
    isEqual : function(f) {
        var eq = false;

        if (Ext.isDefined(f) && Ext.isDefined(f.data)) {
            var d = this.data;
            var fd = f.data;

            eq = (d.isGrid == fd.isGrid) &&
                    (d.isPlot == fd.isPlot) && (d.hierarchy == fd.hierarchy) &&
                    (d.members.length == fd.members.length) && (d.operator == fd.operator);

            if (eq) {
                // member set equivalency
                var keys = {}, m, uniqueName;
                for (m=0; m < d.members.length; m++) {
                    uniqueName = d.members[m].uniqueName;
                    keys[uniqueName] = true;
                }

                for (m=0; m < fd.members.length; m++) {
                    uniqueName = fd.members[m].uniqueName;
                    if (!Ext.isDefined(keys[uniqueName])) {
                        eq = false;
                        break;
                    }
                }
            }
        }

        return eq;
    },

    /**
     * This method should be called before attempting to write a filter model to JSON.
     * This is due to the fact that some properties do not represent themselves properly using
     * JSON.stringify and they have to be manually curated.
     * @returns {Object}
     */
    jsonify : function() {
        var jsonable = Ext.clone(this.data);
        if (Ext.isArray(jsonable.gridFilter)) {
            var jsonGridFilters = [];
            Ext.each(jsonable.gridFilter, function(filter) {
                if (Ext.isDefined(filter)) {
                    if (filter === null) {
                        jsonGridFilters.push("_null");
                    }
                    else if (Ext.isString(filter)) {
                        jsonGridFilters.push(filter);
                    }
                    else {
                        var composed = filter.getURLParameterName() + '=' + filter.getURLParameterValue();
                        jsonGridFilters.push(composed);
                    }
                }
            });
            jsonable.gridFilter = jsonGridFilters;
        }

        if (Ext.isArray(jsonable.plotMeasures)) {
            Ext.each(jsonable.plotMeasures, function(measure) {
                if (Ext.isDefined(measure)) {
                    if (measure === null || Ext.isString(measure)) {
                        return;
                    }
                    else {
                        if (measure && Ext.isArray(measure.filterArray)) {
                            var jsonFilters = [];
                            Ext.each(measure.filterArray, function (filter) {
                                if (Ext.isDefined(filter)) {
                                    if (filter === null) {
                                        jsonFilters.push("_null");
                                    }
                                    else if (Ext.isString(filter)) {
                                        jsonFilters.push(filter);
                                    }
                                    else {
                                        var composed = filter.getURLParameterName() + '=' + filter.getURLParameterValue();
                                        jsonFilters.push(composed);
                                    }
                                }
                            });
                            measure.filterArray = jsonFilters;
                        }
                    }
                }
            });
        }


        if (Ext.isArray(this.getTimeFilters())) {
            jsonable.timeFilters = this._convertToJsonFilters(this.getTimeFilters(), false);
        }

        if (Ext.isArray(this.get('gridFilter'))) {
            jsonable.gridFilter = this._convertToJsonFilters(this.get('gridFilter'), true);
        }

        if (Ext.isArray(this.get('studyAxisFilter'))) {
            jsonable.studyAxisFilter = this._convertToJsonFilters(this.get('studyAxisFilter'), true);
        }

        // remove properties that do not persist across refresh
        delete jsonable.studyAxisFilter;
        delete jsonable.dataFilter;
        delete jsonable.id;
        delete jsonable.measureSet;
        delete jsonable.membersName;
        delete jsonable.xMeasure;
        delete jsonable.yMeasure;
        delete jsonable.xSource;
        delete jsonable.ySource;

        return jsonable;
    },

    _convertToJsonFilters : function(origFilters, encodeValue) {
        var jsonFilters = [];
        Ext.each(origFilters, function(filter) {
            if (filter) {
                if (Ext.isString(filter)) {
                    jsonFilters.push(filter);
                }
                else {
                    jsonFilters.push(filter.getURLParameterName() + '='
                            + (encodeValue ? encodeURIComponent(filter.getURLParameterValue()) : filter.getURLParameterValue()));
                }
            }
            else {
                jsonFilters.push(null);
            }
        });

        return jsonFilters;
    },

    /**
     * Allows for this filter to replace any data filters
     * @param {Array} oldFilters
     * @param {Array} newFilters
     * @param {Function} callback
     * @param {Object} [scope=undefined]
     */
    replace : function(oldFilters, newFilters, callback, scope)
    {
        var remove = false;

        if (Ext.isEmpty(oldFilters))
        {
            throw this.$className + '.replace() cannot be used to only add filters.';
        }

        if (this.isTime())
        {
            if (newFilters.length === 0)
            {
                remove = true;
                callback.call(scope, this, remove);
            }
            else
            {
                Connector.getFilterService().getTimeFilter(this.get('timeMeasure'), newFilters, function(_filter)
                {
                    this.data.gridFilter[0] = _filter;

                    this.set('timeFilters', newFilters);

                    callback.call(scope, this, remove);
                }, this);
            }
            return;
        }

        // Determine the sourcing measure
        var sourceMeasure = Connector.getQueryService().getMeasure(oldFilters[0].getColumnName());
        if (!sourceMeasure)
        {
            throw 'Unable to determine source measure';
        }

        if (this.isAggregated())
        {
            throw 'Aggregate filters do not support replace()';
        }
        else if (this.isPlot() && !this.isGrid())
        {
            // in the plot
            if (this.samePlotMeasureSources())
            {
                throw 'In the plot filter cannot replace() compound filters';
            }

            // examine plotMeasures
            remove = this._replacePlotMeasures(sourceMeasure, oldFilters, newFilters);
        }
        else if (this.isPlot())
        {
            // plot selection
            if (this.samePlotMeasureSources())
            {
                throw 'Plot selection filter cannot replace() compound filters';
            }

            // determine if the filters being replaced come from gridFilter
            var isGridFilter = false,
                gridFilter = [null, null, null, null];

            Ext.each(this.get('gridFilter'), function(gf, i)
            {
                // only examine indices 0/2
                if (i % 2 == 0)
                {
                    var filterA = null,
                        filterB = null;

                    if (gf && gf.getColumnName().toLowerCase() === oldFilters[0].getColumnName().toLowerCase())
                    {
                        isGridFilter = true;

                        // old matching filters + empty new filters means this filter is being removed
                        if (Ext.isEmpty(newFilters))
                        {
                            remove = true;
                            return false;
                        }
                        else
                        {
                            filterA = newFilters[0];
                            filterB = newFilters.length > 1 ? newFilters[1] : null;
                        }
                    }
                    else
                    {
                        var filters = this.get('gridFilter');
                        filterA = filters[i];
                        filterB = filters[i+1];
                    }

                    gridFilter[i] = filterA;
                    gridFilter[i+1] = filterB;
                }
            }, this);


            if (!remove)
            {
                if (isGridFilter)
                {
                    this.set('gridFilter', gridFilter);
                }
                else
                {
                    // determine if the filters being replaced come from plotMeasures
                    remove = this._replacePlotMeasures(sourceMeasure, oldFilters, newFilters);
                }
            }
        }
        else if (this.isGrid())
        {
            // grid filter
            this.set('gridFilter', newFilters);

            if (Ext.isEmpty(newFilters))
            {
                remove = true;
            }
        }
        else
        {
            throw this.$className + '.replace() is not supported for OLAP filters';
        }

        // This is a bit of an optimization, but there is no need to initialize
        // the filter if it is about to be removed
        if (!remove)
        {
            this._initFilter();
        }

        callback.call(scope, this, remove);
    },

    _replacePlotMeasures : function(sourceMeasure, oldFilters, newFilters) {
        var remove = false;

        Ext.each(this.get('plotMeasures'), function(plotMeasure, i) {
            if (plotMeasure && i < 2) { // only examine x, y
                if (plotMeasure.measure.options.dimensions[sourceMeasure.alias]) {
                    if (Ext.isEmpty(newFilters)) {
                        remove = true;
                    }
                    else if (newFilters.length === 1) {
                        var value = newFilters[0].getValue();
                        if (newFilters[0].getFilterType() === LABKEY.Filter.Types.IN) {
                            value = value.split(';');
                        }
                        else {
                            value = [value];
                        }

                        plotMeasure.measure.options.dimensions[sourceMeasure.alias] = value;
                    }
                    else {
                        throw this.$className + '.replace() does not support multiple filters for a measure.option.dimension.';
                    }

                    return false;
                }

                // TODO: Support situational filters
            }
        }, this);

        return remove;
    },

    hasMultiLevelMembers : function() {
        var level = 0;
        var hasMultiLevel = false;
        var members = this.get('members');
        if (members) {
            Ext.each(members, function(member) {
                if (member) {
                    var levelCount = (member.uniqueName.match(/\[/g) || []).length;
                    if (levelCount > 0 && level === 0) {
                        level = levelCount;
                    }
                    if (levelCount !== level) {
                        hasMultiLevel = true;
                    }
                }
            });
        }
        return hasMultiLevel;
    },

    isGrid : function() {
        return this.get('isGrid');
    },

    isPlot : function() {
        return this.get('isPlot');
    },

    isWhereFilter : function() {
        return this.get('isWhereFilter');
    },

    usesCaching : function(subjectName) {
        return Connector.model.Filter.usesMemberName(this.data, subjectName);
    },

    getOlapFilter : function(mdx, subjectName, modelName) {
        return Connector.model.Filter.getOlapFilter(mdx, this, subjectName, modelName);
    },

    getHierarchy : function() {
        return this.get('hierarchy');
    },

    getRanges : function() {
        return this.get('ranges');
    },

    getMembers : function() {
        return this.get('members');
    },

    removeMember : function(memberUniqueName) {

        // Allow for removal of the entire filter if a unique name is not provided
        var newMembers = [];
        if (memberUniqueName) {
            var dataUniqueName;

            for (var m=0; m < this.data.members.length; m++) {
                dataUniqueName = this.data.members[m].uniqueName;
                if (memberUniqueName !== dataUniqueName)
                {
                    newMembers.push(this.data.members[m]);
                }
            }
        }
        return newMembers;
    }
});

Ext.define('Connector.Filter', {

    statics: {
        COMPOUND_ALIAS: '_COMPOUND',

        Types: (function() {
            var types = LABKEY.Filter.Types;
            types.COMPOUND = {
                // duck-typing LABKEY.Filter.FilterDefinition
                getDisplayText: function() {
                    return 'Compound Filter';
                }
            };
            return types;
        })(),

        create : function(columnName, value, filterType, operator) {
            return new Connector.Filter(columnName, value, filterType, operator);
        },

        /**
         * Create a compound filter from a set of LABKEY.Filter
         * @param {LABKEY.Filter[]} filters
         * @param {string} [operator]
         * @returns {Connector.Filter}
         */
        compound : function(filters, operator) {
            var filteredFilters = [];
            Ext.each(filters, function(filter){
               if (filter) { // get rid of null
                   filteredFilters.push(filter);
               }
            });
            return new Connector.Filter(undefined, filteredFilters, Connector.Filter.Types.COMPOUND, operator);
        },

        _initAliasMap : function(aliasMap, filter) {
            if (filter.$className) {
                for (var i=0; i < filter._filters.length; i++) {
                    Connector.Filter._initAliasMap(aliasMap, filter._filters[i]);
                }
            }
            else {
                aliasMap[filter.getColumnName()] = true;
            }
        }
    },

    _filters: undefined,

    _isCompound: false,

    constructor : function(columnName, value, filterType, operator) {

        this.operator = operator || 'AND';

        if (filterType === Connector.Filter.Types.COMPOUND) {
            if (Ext.isArray(value)) {
                this._filters = value;
            }
            else {
                this._filters = [value];
            }
            this._isCompound = true;
        }
        else {
            this._filters = [ LABKEY.Filter.create(columnName, value, filterType) ];
        }

        this.aliasMap = {};
        Connector.Filter._initAliasMap(this.aliasMap, this);
    },

    toJSON : function() {
        var value = [];

        if (this._isCompound) {
            Ext.each(this._filters, function(filter) {
                if (Ext.isDefined(filter.$className)) {
                    value.push(filter.toJSON());
                }
                else {
                    // LABKEY Filter
                    value.push(this.encodeFilter(filter));
                }
            }, this);
        }
        else {
            value.push(this.encodeFilter(this._filters[0]));
        }

        return {
            type: this._isCompound ? 'compound' : 'singular',
            op: this.operator,
            value: value
        };
    },

    isCompound : function() {
        return this._isCompound === true;
    },

    getAliases : function() {
        return Ext.clone(this.aliasMap);
    },

    encodeFilter : function(filter) {
        return encodeURIComponent(filter.getURLParameterName()) + '=' + encodeURIComponent(filter.getURLParameterValue());
    },

    getColumnName : function() {
        return this._filters[0].getColumnName();
    }
});
