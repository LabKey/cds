/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
// This is a singleton for cds getData query utilities
Ext.define('Connector.utility.Query', {

    alternateClassName: ['QueryUtils'],

    singleton: true,

    STUDY_ALIAS_PREFIX: 'cds_GridBase_',

    DEMOGRAPHICS_ALIAS_PREFIX: 'study_Demographics_',

    logging: false,

    constructor : function(config)
    {
        this.callParent([config]);

        this.SUBJECTVISIT_TABLE = (Connector.studyContext.gridBaseSchema + '.' + Connector.studyContext.gridBase).toLowerCase();
        this.SUBJECTVISIT_ALIAS = [Connector.studyContext.gridBaseSchema, Connector.studyContext.gridBase].join('_').toLowerCase();
        this.DATASET_ALIAS = this.STUDY_ALIAS_PREFIX + 'Dataset';
        this.SUBJECT_ALIAS = this.STUDY_ALIAS_PREFIX + Connector.studyContext.subjectColumn;
        this.SUBJECT_SEQNUM_ALIAS = [Connector.studyContext.gridBaseSchema, Connector.studyContext.gridBase, 'ParticipantSequenceNum'].join('_');
        this.SEQUENCENUM_ALIAS = this.STUDY_ALIAS_PREFIX + 'SequenceNum';
        this.CONTAINER_ALIAS = this.STUDY_ALIAS_PREFIX + 'Container';
        this.VISITROWID_ALIAS = this.STUDY_ALIAS_PREFIX + 'VisitRowId';
        this.STUDY_ALIAS = this.STUDY_ALIAS_PREFIX + 'Study';
        this.TREATMENTSUMMARY_ALIAS = this.STUDY_ALIAS_PREFIX + 'TreatmentSummary';
        this.PROTOCOLDAY_ALIAS = this.STUDY_ALIAS_PREFIX + 'ProtocolDay';

        this.DEMOGRAPHICS_STUDY_SHORT_NAME_ALIAS = this.DEMOGRAPHICS_ALIAS_PREFIX + 'study_short_name';
        this.DEMOGRAPHICS_STUDY_LABEL_ALIAS = this.DEMOGRAPHICS_ALIAS_PREFIX + 'study_label';
        this.DEMOGRAPHICS_STUDY_ARM_ALIAS = this.DEMOGRAPHICS_ALIAS_PREFIX + 'study_arm_summary';

        if (Ext.isDefined(LABKEY.ActionURL.getParameters()['logQuery']))
        {
            this.logging = true;
        }
    },

    /**
     *  Wrapper for generating the cds getData SQL instead of calling LABKEY.Query.Visualization.getData()
     */
    getData : function(config)
    {
        var result = this._generateVisGetDataSql(config.measures, config.extraFilters, {});

        LABKEY.Query.executeSql({
            schemaName: Connector.studyContext.schemaName,
            sql: result.sql,
            requiredVersion: '9.1',
            saveInSession: true,
            maxRows: config.metaDataOnly ? 0 : undefined,
            success: function(response)
            {
                response.columnAliasMap = result.columnAliasMap;
                if (this.logging)
                {
                    console.log('Query:', window.location.origin + LABKEY.ActionURL.buildURL('query', 'executeQuery', undefined, {
                        schemaName: 'study',
                        queryName: response.queryName
                    }));
                }
                config.success.call(config.scope, response);
            },
            failure: config.failure,
            scope: this
        });
    },

    getDataSql : function(config)
    {
        return this._generateVisGetDataSql(config.measures, config.extraFilters, {}).sql;
    },

    getSubjectIntersectSQL : function(config)
    {
        return this._generateVisGetDataSql(config.measures, config.extraFilters, {subjectOnly: true, intersect: true}).sql;
    },

    getDistinctTimepointSQL : function(config)
    {
        return this._generateVisGetDataSql(config.measures, config.extraFilters, {timepointOnly: true}).sql;
    },

    _createTableObj : function(schema, query, joinKeys, isAssayDataset)
    {
        var queryName = query.toLowerCase();
        return {
            displayName: query,
            schemaName: schema,
            queryName: queryName,
            fullQueryName: schema + '.' + queryName,
            tableAlias: schema + '_' + queryName,
            isAssayDataset: isAssayDataset === true,
            joinKeys: joinKeys
        };
    },

    _getTables : function()
    {
        // get the datasets from the query service and track properties for the joinKeys, isDemographic, etc.
        var datasetSources = Connector.getQueryService().getSources('queryType', 'datasets'),
            schema, query, key, joinKeys, tables = {};

        Ext.each(datasetSources, function(dataset)
        {
            schema = dataset.get('schemaName');
            query = dataset.get('queryName');
            key = schema.toLowerCase() + '.' + query.toLowerCase();
            joinKeys = dataset.get('isDemographic') ? ['container', 'subjectid'] : ['container', 'participantsequencenum'];

            tables[key] = this._createTableObj(schema, query, joinKeys, !dataset.get('isDemographic'));
        }, this);

        // add on the cds.GridBase query to the tables object
        tables[this.SUBJECTVISIT_TABLE] = this._createTableObj(Connector.studyContext.gridBaseSchema, Connector.studyContext.gridBase, ['container', 'participantsequencenum'], false);

        return tables;
    },

    _acceptMeasureFn : function(datasetName, tables, queryProp) {
        return function(m) {
            if (m[queryProp] === datasetName) {
                return true;
            }

            var t = tables[m.queryName];
            return t && !t.isAssayDataset;
        };
    },

    _sqlLiteralFn : function(type) {
        if (type == "VARCHAR" || type.indexOf("Text") == 0) {
            return LABKEY.Query.sqlStringLiteral;
        }
        else if (type == "DOUBLE") {
            return this._toSqlNumber;
        }

        return this._toSqlLiteral;
    },

    _toSqlNumber : function(v) {
        if (!Ext.isDefined(v) || null === v) {
            return "NULL";
        }
        else if (Ext.isNumber(v)) {
            return "" + v;
        }
        else if (Ext.isNumeric(v)) {
            var number = new Number(v);
            if (!isNaN(number))
                return number.toString();
        }
        else if (Ext.isString(v)) {
            return LABKEY.Query.sqlStringLiteral(v);
        }
        else if (Ext.isDate(v)) {
            return LABKEY.Query.sqlDatetimeLiteral(v);
        }

        throw "unsupported constant: " + v;
    },

    _toSqlLiteral : function(v)
    {
        if (!Ext.isDefined(v) || null === v)
        {
            return "NULL";
        }
        else if (Ext.isNumber(v))
        {
            return "" + v;
        }
        else if (Ext.isString(v))
        {
            return LABKEY.Query.sqlStringLiteral(v);
        }
        else if (Ext.isDate(v))
        {
            return LABKEY.Query.sqlDatetimeLiteral(v);
        }
        else if (Ext.isBoolean(v))
        {
            return v;
        }

        throw "unsupported constant: " + v;
    },

    _generateVisGetDataSql : function(measuresIN, extraFilters, options)
    {
        var me = this,
            tables = this._getTables(),
            columnAliasMap = {},
            aliasMeasureMap = {},
            datasets = {}, assayDatasets = {},
            subjectVisitTableRequested = false;

        // I want to modify these measures for internal bookkeeping,
        // but I don't own this config, so clone here.
        // Add "fullQueryName", "table", "columnName", "literalFn", and "queryName"
        var measures = measuresIN.map(function(m)
        {
            var _m = Ext.clone(m),
                alias = (_m.measure.alias || [_m.measure.schemaName, _m.measure.queryName, _m.measure.name].join('_')).toLowerCase(),
                queryName = (_m.measure.schemaName + '.' + m.measure.queryName).toLowerCase(),
                axisQueryName = queryName + (m.measure.axisName ? '.' + m.measure.axisName : ''),
                table = tables[axisQueryName];

            if (!table)
            {
                table = tables[queryName];
                if (!table)
                {
                    throw "table not found: " + queryName;
                }

                var axisTable = Ext.clone(table);
                axisTable.displayName = m.measure.axisName;
                tables[axisQueryName] = axisTable;
                table = axisTable;
            }

            _m.fullQueryName = axisQueryName;
            _m.table = table;
            _m.queryName = queryName;
            _m.literalFn = me._sqlLiteralFn(m.measure.type);

            // find the full list of datasets and hold on to a separate list of just the assay datasets
            if (_m.table)
            {
                datasets[_m.fullQueryName] = _m.table;
                if (_m.table.isAssayDataset)
                {
                    assayDatasets[_m.fullQueryName] = _m.table;
                }
                else if (_m.queryName == this.SUBJECTVISIT_TABLE)
                {
                    subjectVisitTableRequested = true;
                }
            }

            aliasMeasureMap[alias] = _m;

            return _m;
        }, this);

        // if we don't have any assay datasets, use GridBase as the root for the intersect SQL case or if it was requested
        if (Object.keys(assayDatasets).length == 0 && (subjectVisitTableRequested || options.intersect))
        {
            assayDatasets[this.SUBJECTVISIT_TABLE] = tables[this.SUBJECTVISIT_TABLE];
        }

        // if we have at least one assayDatasets value, use that instead of the full datasets map
        if (Object.keys(assayDatasets).length > 0)
        {
            datasets = assayDatasets;
        }
        else
        {
            // sanity check that no axis has measures from more than one assay dataset
            var mapAxisToAssay = {};
            for (var i=0 ; i< measures.length ; i++)
            {
                var m = measures[i];
                if (!m.measure.axisName || !datasets[m.fullQueryName])
                    continue;
                if (!mapAxisToAssay[m.measure.axisName])
                    mapAxisToAssay[m.measure.axisName] = m.measure.queryName;
                else if (mapAxisToAssay[m.measure.axisName] != m.measure.queryName)
                {
                    console.warn("Two datasets on axis '" + m.measure.axisName + "' - '" + mapAxisToAssay[m.measure.axisName] + "' and '" + m.measure.queryName + "'");
                    break;
                }
            }
        }


        // calculate a map of source to filter.
        // Each compound filter should match to 1 and only 1 source.
        var extraFilterMap = {},
            baseAlias = this.STUDY_ALIAS_PREFIX.toLowerCase();

        if (!Ext.isEmpty(extraFilters))
        {
            Ext.each(extraFilters, function(f)
            {
                var included = false,
                    targetQuery,
                    baseQuery,
                    hasBaseFilter = false,
                    baseMeasures = {},
                    isStudyAxis = f.isStudyAxis;

                Ext.iterate(f.getAliases(), function(alias)
                {
                    var lowerAlias = alias.toLowerCase(),
                        altAlias = Connector.getQueryService().getMeasureSourceAlias(alias, 'child'),
                        measure;

                    // if measure does not exist by the given alias, try looking up by the sourceMeasureAlias
                    if (!Ext.isDefined(aliasMeasureMap[lowerAlias]) && altAlias != null)
                    {
                        lowerAlias = altAlias.toLowerCase();
                    }

                    measure = aliasMeasureMap[lowerAlias];
                    if (Ext.isDefined(measure))
                    {
                        if (lowerAlias.indexOf(baseAlias) === 0)
                        {
                            hasBaseFilter = true;
                            baseQuery = measure.queryName;
                            baseMeasures[alias] = measure;
                            if (!isStudyAxis) {
                                return;
                            }
                        }

                        if (tables[measure.queryName])
                        {
                            if (!extraFilterMap[measure.queryName])
                            {
                                targetQuery = measure.queryName;
                                extraFilterMap[measure.queryName] = {
                                    measures : {},
                                    filterArray: []
                                };
                            }

                            extraFilterMap[measure.queryName].measures[alias] = measure;

                            if (!included)
                            {
                                included = true;
                                extraFilterMap[measure.queryName].filterArray.push(f);
                                if (isStudyAxis) {
                                    extraFilterMap[measure.queryName].isStudyAxis = isStudyAxis;
                                }
                            }
                        }
                        else
                        {
                            throw 'Unable to resolve table "' + measure.queryName + '". It may not be white-listed for getData queries.';
                        }
                    }
                    else
                    {
                        throw 'Unable to find measure "' + alias + '" from compound filter. This measure must be included.';
                    }
                });

                if (hasBaseFilter)
                {
                    var queryName = Ext.isDefined(targetQuery) ? targetQuery : baseQuery;
                    Ext.iterate(baseMeasures, function(alias, measure)
                    {
                        if (!extraFilterMap[queryName])
                        {
                            extraFilterMap[measure.queryName] = {
                                measures : {},
                                filterArray: []
                            };
                        }

                        extraFilterMap[queryName].measures[alias] = measure;

                        if (!included)
                        {
                            included = true;
                            extraFilterMap[queryName].filterArray.push(f);
                        }
                    });
                }
            });
        }

        // generate the UNION ALL (checkerboard) sql for the set of datasets
        var unionSQL = '',
            debugUnionSQL = '',
            union = '',
            term,
            hasMultiple = Object.keys(datasets).length > 1,
            setOperator = options.intersect ? "\nINTERSECT\n" : "\nUNION ALL\n",
            orderSQL,
            wildcardSQL,
            debugSql,
            psnFilter,
            sql;

        Ext.iterate(datasets, function(name)
        {
            term = this._generateVisDatasetSql(measures, name, tables, hasMultiple, extraFilterMap, options);
            unionSQL += union + term.sql;

            if (this.logging)
            {
                term = this._generateVisDatasetSql(measures, name, tables, hasMultiple, extraFilterMap, options, true);
                debugUnionSQL += union + term.sql;
            }

            psnFilter = psnFilter || term.participantsequencenum;

            union = setOperator;

            Ext.applyIf(columnAliasMap, term.columnAliasMap);
        }, this);

        // sort by the study, subject, and visit
        if (options.subjectOnly || options.timepointOnly)
        {
            orderSQL = "\nORDER BY 1 ASC";

            if (psnFilter && options.subjectOnly)
            {
                var psnSelect = [union, 'SELECT '],
                    sep = '\n\t';

                psnSelect.push(sep + this.SUBJECTVISIT_ALIAS + '.container AS "' + this.CONTAINER_ALIAS + '" @title=\'Container\',');
                psnSelect.push(sep + this.SUBJECTVISIT_ALIAS + '.subjectid AS "' + this.SUBJECT_ALIAS + '" @title=\'Subject Id\'');
                psnSelect.push(sep + 'FROM ' + this.SUBJECTVISIT_TABLE + ' AS ' + this.SUBJECTVISIT_ALIAS);
                psnSelect.push(sep + 'WHERE ' + this.SUBJECTVISIT_ALIAS + '.participantsequencenum IN ');

                unionSQL += psnSelect.join('') + this._toSqlValuesList(psnFilter, LABKEY.Query.sqlStringLiteral, false);

                if (this.logging)
                {
                    debugUnionSQL += psnSelect.join('') + this._toSqlValuesList(psnFilter, LABKEY.Query.sqlStringLiteral, true);
                }
            }
        }
        else
        {
            orderSQL = '\nORDER BY ' + this.CONTAINER_ALIAS + ', ' + this.SUBJECT_ALIAS + ', ' + this.SEQUENCENUM_ALIAS;
        }

        wildcardSQL = options.timepointOnly ? 'DISTINCT *' : '*';

        sql = 'SELECT ' + wildcardSQL + ' FROM (' + unionSQL + ') AS _0' + orderSQL;

        if (this.logging)
        {
            debugSql = 'SELECT ' + wildcardSQL + ' FROM (' + debugUnionSQL + ') AS _0' + orderSQL;

            console.log(debugSql); //show truncated in clauses
            //console.log(sql); //show full sql without truncated in clauses
        }

        return {
            sql: sql,
            columnAliasMap: columnAliasMap
        };
    },

    _generateVisDatasetSql : function(allMeasures, datasetName, tables, hasMultiple, extraFilterMap, options, forDebugging)
    {
        datasetName = datasetName || this.SUBJECTVISIT_TABLE;

        var rootTable = tables[datasetName],
            acceptMeasureForSelect = this._acceptMeasureFn(rootTable.fullQueryName, tables, 'queryName'),
            filterQueryMeasures = allMeasures.filter(this._acceptMeasureFn(datasetName, tables, 'fullQueryName')),
            optimizedFilterValues,
            optimizerResult,
            columnAliasMap = {},
            visitAlignmentTag = null;

        // we use sourceTable in the SQL generation, usually the same as table, see _optimizeFilters()
        allMeasures.forEach(function(m) { m.sourceTable = m.table; });

        // now optimize subjectid and participantsequencenum filters over rootTable
        // The only tricky part is is that I don't really want to hack on my measures
        // SO return new copies optimized guys
        optimizerResult = this._optimizeFilters(filterQueryMeasures, rootTable);
        filterQueryMeasures = optimizerResult.measures;
        optimizedFilterValues = optimizerResult.filters;

        //
        // SELECT
        //
        var SELECT = ["SELECT "],
            sep = "\n\t",
            visitRowIdAlias = 'VisitRowId',
            protDayAlias = 'ProtocolDay';

        if (options.timepointOnly)
        {
            if (rootTable.fullQueryName !== this.SUBJECTVISIT_TABLE)
            {
                visitRowIdAlias = 'SubjectVisit.Visit.RowId';
                protDayAlias = 'SubjectVisit.Visit.ProtocolDay';
            }

            SELECT.push(sep + rootTable.tableAlias + '.' + visitRowIdAlias + ' AS RowId,');
            Ext.iterate(Connector.getQueryService().getTimeAliases(), function(timeAlias)
            {
                SELECT.push(sep + this._getIntervalSelectClause(rootTable.tableAlias + '.' + protDayAlias, timeAlias, false) + ' AS ' + timeAlias + ',');
            }, this);

            // still need to see if there is a study axis measure with a visit tag alignment value
            Ext.each(allMeasures, function (m)
            {
                if (acceptMeasureForSelect(m) && Ext.isObject(m.dateOptions) && m.dateOptions.zeroDayVisitTag != null)
                {
                    visitAlignmentTag = m.dateOptions.zeroDayVisitTag;
                }
            });
        }
        else
        {
            SELECT.push(sep + rootTable.tableAlias + '.container AS "' + this.CONTAINER_ALIAS + '" @title=\'Container\'');
            columnAliasMap[this.CONTAINER_ALIAS] = {
                name: 'Container',
                queryName: rootTable.displayName,
                schemaName: rootTable.schemaName
            };

            sep = ",\n\t";
            SELECT.push(sep + rootTable.tableAlias + '.subjectid AS "' + this.SUBJECT_ALIAS + '" @title=\'Subject Id\'');
            columnAliasMap[this.SUBJECT_ALIAS] = {
                name: 'SubjectId',
                queryName: rootTable.displayName,
                schemaName: rootTable.schemaName
            };
        }

        if (!options.subjectOnly && !options.timepointOnly)
        {
            if (hasMultiple)
            {
                // only include the Dataset column if we have multiple assay datasets in the query
                SELECT.push(sep + LABKEY.Query.sqlStringLiteral(rootTable.displayName) + " AS " + "\"" + this.DATASET_ALIAS + "\" @title=\'Dataset\'");
                columnAliasMap[this.DATASET_ALIAS] = {name: 'Dataset'};
            }

            SELECT.push(sep + rootTable.tableAlias + '.sequencenum AS "' + this.SEQUENCENUM_ALIAS + '" @title=\'Sequence Num\'');
            columnAliasMap[this.SEQUENCENUM_ALIAS] = {
                name: 'SequenceNum',
                queryName: rootTable.displayName,
                schemaName: rootTable.schemaName
            };

            SELECT.push(sep + rootTable.tableAlias + '.participantsequencenum AS "' + this.SUBJECT_SEQNUM_ALIAS + '" @title=\'Participant Sequence Num\'');
            columnAliasMap[this.SUBJECT_SEQNUM_ALIAS] = {
                name: 'ParticipantSequenceNum',
                queryName: rootTable.displayName,
                schemaName: rootTable.schemaName
            };

            // include for info pane timepoint count and subcount
            SELECT.push(sep + rootTable.tableAlias + '.VisitRowId AS "' + this.VISITROWID_ALIAS + '" @title=\'Visit Row Id\'');
            columnAliasMap[this.VISITROWID_ALIAS] = {
                name: 'VisitRowId',
                queryName: rootTable.displayName,
                schemaName: rootTable.schemaName
            };

            Ext.each(allMeasures, function (m)
            {
                var isKeyCol = m.measure.name.toLowerCase() == 'subjectid'
                                || m.measure.name.toLowerCase() == 'container'
                                || m.measure.name.toLowerCase() == 'sequencenum'
                                || m.measure.name.toLowerCase() == 'participantsequencenum',
                        alias = m.measure.alias || LABKEY.Utils.getMeasureAlias(m.measure),
                        colLabel = m.measure.shortCaption || m.measure.label,
                        title = Ext.isDefined(colLabel) ? " @title='" + colLabel + "'" : "",
                        intervalSelectClause;

                if (acceptMeasureForSelect(m))
                {
                    alias = this.ensureAlignmentAlias(m, (m.measure.alias || LABKEY.Utils.getMeasureAlias(m.measure)));
                }

                if (columnAliasMap[alias] || isKeyCol)
                {
                    return;
                }

                columnAliasMap[alias] = {
                    name: m.measure.name,
                    schemaName: m.measure.schemaName,
                    queryName: m.measure.queryName
                };

                if (acceptMeasureForSelect(m))
                {
                    if (Ext.isObject(m.dateOptions))
                    {
                        if (m.dateOptions.zeroDayVisitTag != null)
                        {
                            visitAlignmentTag = m.dateOptions.zeroDayVisitTag;
                            title = Ext.isDefined(colLabel) ? " @title='" + colLabel + " (" + visitAlignmentTag + ")'" : "";
                        }

                        intervalSelectClause = this._getIntervalSelectClause(m.sourceTable.tableAlias + "." + m.measure.name, m.dateOptions.interval, m.dateOptions.zeroDayVisitTag != null);
                        SELECT.push(",\n\t" + intervalSelectClause + " AS " + alias + title);
                    }
                    else
                    {
                        SELECT.push(",\n\t" + m.sourceTable.tableAlias + "." + m.measure.name + " AS " + alias + title);
                    }
                }
                else
                {
                    SELECT.push(",\n\tCAST(NULL AS " + m.measure.type + ") AS " + alias + title);
                }
            }, this);
        }

        //
        // FROM
        //
        var fromTables = {};
        filterQueryMeasures.forEach(function(m)
        {
            if (m.sourceTable && m.sourceTable.fullQueryName !== rootTable.fullQueryName)
            {
                fromTables[m.sourceTable.fullQueryName] = m.sourceTable;
            }
        });

        var FROM = "FROM " + rootTable.fullQueryName + " " + rootTable.tableAlias;
        Ext.iterate(fromTables, function(name, t)
        {
            FROM += "\nINNER JOIN " + t.fullQueryName + " " + t.tableAlias;

            sep = "\n\tON ";
            t.joinKeys.forEach(function(k)
            {
                FROM += sep + rootTable.tableAlias + "." + k + "=" + t.tableAlias + "." + k;
                sep = "\n\tAND ";
            });
        });

        //
        // Visit Tag alignment INNER JOIN
        //
        if (visitAlignmentTag != null)
        {
            var gridBaseAlias = this.SUBJECTVISIT_TABLE.replace('.', '_');
            FROM += "\nINNER JOIN (SELECT Container, ParticipantId, MIN(ProtocolDay) AS ProtocolDay FROM cds.visittagalignment  "
                + "\n\t\tWHERE visittagname='" + visitAlignmentTag + "' GROUP BY Container, ParticipantId) AS visittagalignment"
                + "\n\tON " + gridBaseAlias + ".container=visittagalignment.container"
                + "\n\tAND " + gridBaseAlias + ".subjectid=visittagalignment.participantid";
        }

        //
        // WHERE
        //
        var WHERE = [], f, fType;

        // process filters on the measures
        Ext.each(filterQueryMeasures, function(mdef)
        {
            // two places to look for filters, filterArray or measure.values (i.e. IN clause)
            if (!Ext.isEmpty(mdef.filterArray))
            {
                Ext.each(mdef.filterArray, function(f)
                {
                    WHERE.push(this._getWhereClauseFromFilter(f, mdef, false /* recursed */, forDebugging));
                }, this);
            }
            else if (Ext.isArray(mdef.measure.values))
            {
                // I don't like this extra join/split (maybe make a helper IN function)
                fType = mdef.measure.values.length == 1 ? LABKEY.Filter.Types.EQUAL : LABKEY.Filter.Types.IN;
                f = LABKEY.Filter.create(mdef.measure.name, mdef.measure.values.join(';'), fType);
                WHERE.push(this._getWhereClauseFromFilter(f, mdef, false /* recursed */, forDebugging));
            }
        }, this);

        for (var property in extraFilterMap)
        {
            if (extraFilterMap.hasOwnProperty(property))
            {
                // process study axis filters or any extra filters for this dataset
                if (extraFilterMap[property].isStudyAxis || property === datasetName)
                {
                    Ext.each(extraFilterMap[property], function (filterDef)
                    {
                        Ext.each(filterDef.filterArray, function (filter)
                        {
                            WHERE.push(this._getWhereClauseFromFilter(filter, filterDef.measures, false /* recursed */, forDebugging));
                        }, this);
                    }, this);
                }
            }
        }

        // and optimized filters
        Ext.iterate(optimizedFilterValues, function(name, values)
        {
            if (null !== values)
            {
                if (options.subjectOnly && name === 'participantsequencenum')
                {
                    return;
                }
                if (0 == values.length)
                    WHERE.push('1=0');
                else
                    WHERE.push(rootTable.tableAlias + '.' + name + ' IN ' + this._toSqlValuesList(values, LABKEY.Query.sqlStringLiteral, forDebugging));
            }
        }, this);

        // to be defensive, clear sourceTable before we return
        Ext.each(allMeasures, function(m) { delete m.sourceTable; });

        return {
            sql: SELECT.join('') + "\n" + FROM + (WHERE.length == 0 ? "" : "\nWHERE ") + WHERE.join("\n\tAND "),
            columnAliasMap: columnAliasMap,
            participantsequencenum: optimizedFilterValues.participantsequencenum
        };
    },

    _optimizeFilters : function(measures, rootTable)
    {
        var gridBaseAliasableColumns = {
            subjectid: true,
            sequencenum: true,
            participantsequencenum:true
        };
        var optimizableColumns = {
            subjectid: true,
            participantsequencenum:true
        };
        var mapoflistofFilters = {
            subjectid: [],
            participantsequencenum: []
        };

        var optimizedMeasures = [];
        Ext.each(measures, function(m)
        {
            // look for aliases we can rewrite e.g. cds.gridbase.subjectid -> cds.{dataset}.subjectid
            // we reset sourceTable every time so we can overwrite without cloning the measure
            if (m.table.fullQueryName === this.SUBJECTVISIT_TABLE && gridBaseAliasableColumns[m.measure.name.toLowerCase()])
            {
                m.sourceTable = rootTable;
            }

            // collect subject id and participantsequencenum filters
            if (m.sourceTable == rootTable && optimizableColumns[m.measure.name.toLowerCase()] && (m.measure.value || m.filterArray))
            {
                var listofFilters = mapoflistofFilters[m.measure.name.toLowerCase()];

                // create shallow copy. so we can remove/alter the filters
                m = Ext.apply({}, m);
                m.measure = Ext.apply({}, m.measure);

                if (Ext.isArray(m.measure.values))
                {
                    listofFilters.push(m.measure.values);
                    m.measure.values = null;
                }

                if (m.filterArray)
                {
                    var filters = m.filterArray;
                    m.filterArray = [];
                    Ext.each(filters, function(f)
                    {
                        var operator = f.getFilterType().getURLSuffix();
                        if (operator == 'eq' || operator == 'in')
                        {
                            var strvalue = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
                            listofFilters.push(operator=='eq' ? [strvalue] : strvalue.split(';'));
                        }
                        else
                            m.filterArray.push(f);
                    });
                }
            }

            optimizedMeasures.push(m);
        }, this);

        // and optimize the values lists

        var subjectids = this._intersect(mapoflistofFilters.subjectid),
            psnums = this._intersect(mapoflistofFilters.participantsequencenum);

        if (null !== subjectids && null !== psnums)
        {
            var _set = {},
                intersectArray = [];

            Ext.each(subjectids, function(s)
            {
                _set[s] = 1;
            });
            Ext.each(psnums, function(psnum)
            {
                var ptid = psnum.substring(0, psnum.indexOf('|'));
                if (_set[ptid])
                {
                    intersectArray.push(psnum);
                }
            });
            psnums = intersectArray;
            subjectids = null;
        }

        return {
            measures: optimizedMeasures,
            filters: {
                subjectid: subjectids,
                participantsequencenum: psnums
            }
        };
    },


    _intersect : function(lists)
    {
        if (lists.length == 0)
            return null;
        if (lists.length == 1)
            return lists[0];

        // I'm going to be pessimistic and not assume that each individual list is guaranteed to be unique
        var _set = {};

        Ext.each(lists[0], function(s)
        {
            _set[s] = 1;
        });

        for (var i=1; i < lists.length; i++)
        {
            var intersectSet = {};
            Ext.each(lists[i],function(s)
            {
                if (_set[s])
                    intersectSet[s] = 1;
            });
            _set = intersectSet;
        }
        return Ext.Object.getKeys(_set);
    },


    _getIntervalSelectClause : function(protDayCol, interval, hasAlignment)
    {
        var denom = this.getIntervalDenominator(interval),
            clause = hasAlignment ? '(' + protDayCol + ' - visittagalignment.ProtocolDay)' : protDayCol;

        if (denom > 1)
        {
            clause = 'CAST(FLOOR(' + clause + '/' + denom + ') AS Integer)';
        }

        return clause;
    },

    getIntervalDenominator : function(interval)
    {
        if (interval.lastIndexOf(this.STUDY_ALIAS_PREFIX + 'Weeks', 0) === 0)
            return 7;
        else if (interval.lastIndexOf(this.STUDY_ALIAS_PREFIX + 'Months', 0) === 0)
            return 365.25/12;
        else if (interval.lastIndexOf(interval == this.STUDY_ALIAS_PREFIX + 'Years', 0) === 0)
            return 365.25;
        return 1;
    },

    _getWhereClauseFromFilter : function(_f, measure, recursed, forDebugging)
    {
        var f = _f,
            _measure = measure,
            literalFn,
            columnName;

        if (f.$className)
        {
            if (f.isCompound())
            {
                var clauses = [];
                for (var i=0; i < f._filters.length; i++)
                {
                    clauses.push(this._getWhereClauseFromFilter(f._filters[i], measure, true /* recursed */, forDebugging));
                }
                return '(' + clauses.join(' ' + f.operator + ' ') + ')';
            }
            else
            {
                f = f._filters[0];
                _measure = measure[f.getColumnName()];
                if (!_measure)
                    throw 'Unable to map measure for "' + f.getColumnName() + '"';
            }
        }
        else if (recursed)
        {
            _measure = measure[f.getColumnName()];
            if (!_measure)
                throw 'Unable to map measure for "' + f.getColumnName() + '"';
        }

        columnName = _measure.sourceTable.tableAlias + '.' + _measure.measure.name;
        literalFn = _measure.literalFn;

        var v, arr, clause = '',
            operator = f.getFilterType().getURLSuffix(),
            operatorMap = {eq:"=",lt:"<",lte:"<=",gt:">",gte:">=",neq:"<>"};

        switch (operator)
        {
            case 'eq':
            case 'lt':
            case 'lte':
            case 'gt':
            case 'gte':
            case 'neq':
                v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
                clause = columnName + operatorMap[operator] + literalFn(v);
                break;
            case 'in':
            case 'notin':
                v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
                clause = columnName + (operator==='in' ? " IN " : " NOT IN ") + this._toSqlValuesList(v.split(';'),literalFn,forDebugging);
                break;
            case 'isblank':
                clause = columnName + " IS NULL";
                break;
            case 'isnonblank':
                clause = columnName + " IS NOT NULL";
                break;
            case 'between':
            case 'notbetween':
                v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
                if (!Ext.isString(v))
                    throw "invalid value for between: " + v;
                arr = v.split(",");
                if (arr.length != 2)
                    throw "invalid value for between: " + v;
                clause = columnName + (operator==='between'?" BETWEEN ":" NOT BETWEEN ") +
                        literalFn(arr[0]) + " AND " + literalFn(arr[1]);
                break;
            case 'startswith':
            case 'doesnotstartwith':
                v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
                v = v.replace(/([%_!])/g, "!$1") + '%';
                clause = columnName + (operator==='like'?" LIKE ":" NOT LIKE ") +
                        literalFn(v) + " ESCAPE '!'";
                break;
            case 'contains':
            case 'doesnotcontain':
                v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
                v = '%' + v.replace(/([%_!])/g, "!$1") + '%';
                clause = (operator==='like'?" LIKE ":" NOT LIKE ") +
                        literalFn(v) + " ESCAPE '!'";
                break;
            case 'hasmvvalue':
            case 'nomvvalue':
            case 'dateeq':
            case 'dateneq':
            case 'datelt':
            case 'datelte':
            case 'dategt':
            case 'dategte':
            default:
                throw "operator is not supported: " + operator;
        }

        return clause;
    },

    _toSqlValuesList : function(values, literalFn, forDebugging)
    {
        var parts = [];
        parts.push('(');
        if (forDebugging === true && values.length > 10)
        {
            parts.push('{' + values.length + ' ITEMS}');
        }
        else
        {
            var sep = '';
            values.forEach(function(v)
            {
                parts.push(sep + (literalFn||this._toSqlLiteral)(v));
                sep = ',';
            });
        }
        parts.push(')');
        return parts.join('');
    },

    isGeneratedColumnAlias : function(alias)
    {
        return alias.indexOf(QueryUtils.STUDY_ALIAS_PREFIX) == 0;
    },

    ensureAlignmentAlias : function(wrapped, defaultAlias)
    {
        var alias = defaultAlias || wrapped.measure.alias;

        if (Ext.isObject(wrapped.dateOptions) && wrapped.dateOptions.zeroDayVisitTag != null)
        {
            alias += '_' + wrapped.dateOptions.zeroDayVisitTag.replace(/ /g, '_');
        }

        return alias;
    }
});