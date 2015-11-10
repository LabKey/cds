// This is a singleton for cds getData query utilities
Ext.define('Connector.utility.Query', {

    alternateClassName: ['QueryUtils'],

    singleton: true,

    STUDY_ALIAS_PREFIX: 'cds_GridBase_',

    logging: false,

    constructor : function(config)
    {
        this.callParent([config]);

        this.SUBJECTVISIT_TABLE = (Connector.studyContext.gridBaseSchema + '.' + Connector.studyContext.gridBase).toLowerCase();
        this.DATASET_ALIAS = this.STUDY_ALIAS_PREFIX + 'Dataset';
        this.SUBJECT_ALIAS = this.STUDY_ALIAS_PREFIX + Connector.studyContext.subjectColumn;
        this.SUBJECT_SEQNUM_ALIAS = [Connector.studyContext.gridBaseSchema, Connector.studyContext.gridBase, 'ParticipantSequenceNum'].join('_');
        this.SEQUENCENUM_ALIAS = this.STUDY_ALIAS_PREFIX + 'SequenceNum';
        this.CONTAINER_ALIAS = this.STUDY_ALIAS_PREFIX + 'Container';

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
            schemaName: 'study',
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

    getSubjectIntersectSQL : function(config)
    {
        return this._generateVisGetDataSql(config.measures, config.extraFilters, {subjectOnly: true, intersect: true}).sql;
    },

    _createTableObj : function(schema, query, joinKeys, isAssayDataset)
    {
        var obj = {};
        obj.displayName = query;
        obj.queryName = query.toLowerCase();
        obj.fullQueryName = schema + '.' + obj.queryName;
        obj.tableAlias = schema + '_' + obj.queryName;
        obj.schemaName = schema;
        obj.isAssayDataset = isAssayDataset === true;
        obj.joinKeys = joinKeys;
        return obj;
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
            _m.columnName = table.tableAlias + '.' + m.measure.name;
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
                    baseMeasures = {};

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
                            return;
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

            union = setOperator;

            Ext.applyIf(columnAliasMap, term.columnAliasMap);
        }, this);

        // sort by the study, subject, and visit
        if (options.subjectOnly)
            orderSQL = "\nORDER BY 1 ASC";
        else
            orderSQL = '\nORDER BY ' + this.CONTAINER_ALIAS + ', ' + this.SUBJECT_ALIAS + ', ' + this.SEQUENCENUM_ALIAS;

        sql = 'SELECT * FROM (' + unionSQL + ') AS _0' + orderSQL;

        if (this.logging)
        {
            var debugSql = 'SELECT * FROM (' + debugUnionSQL + ') AS _0' + orderSQL;
            var SHOW_TRUNCATED_IN_CLAUSES = true;
            console.log(SHOW_TRUNCATED_IN_CLAUSES ? debugSql : sql);
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
            gridBaseAliasableColumns = {
                subjectid: true,
                sequencenum: true
            },
            columnAliasMap = {},
            visitAlignmentTag = null;

        // look for aliases, e.g. cds.gridbase.subjectid -> cds.{dataset}.subjectid
        allMeasures.map(function(m) { m.sourceTable = m.table; return m;})
            .filter(function(m) { return m.table.fullQueryName === this.SUBJECTVISIT_TABLE &&  gridBaseAliasableColumns[m.measure.name.toLowerCase()];})
            .forEach(function(m) { m.sourceTable = rootTable;});

        //
        // SELECT
        //
        var SELECT = ["SELECT "],
            sep = "\n\t";

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

        if (!options.subjectOnly)
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

            Ext.each(allMeasures, function (m)
            {
                var isKeyCol = m.measure.name.toLowerCase() == 'subjectid'
                                || m.measure.name.toLowerCase() == 'container'
                                || m.measure.name.toLowerCase() == 'sequencenum'
                                || m.measure.name.toLowerCase() == 'participantsequencenum',
                        alias = m.measure.alias || LABKEY.Utils.getMeasureAlias(m.measure),
                        colLabel = m.measure.shortCaption || m.measure.label,
                        title = Ext.isDefined(colLabel) ? " @title='" + colLabel + "'" : "";

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

                        SELECT.push(",\n\t" + this._getIntervalSelectClause(m, m.dateOptions.zeroDayVisitTag != null) + " AS " + alias + title);
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
                fType = mdef.measure.values.length == 1 ? LABKEY.Filter.Types.EQUAL : LABKEY.Filter.Types.IN;
                f = LABKEY.Filter.create(mdef.measure.name, mdef.measure.values.join(';'), fType);
                WHERE.push(this._getWhereClauseFromFilter(f, mdef, false /* recursed */, forDebugging));
            }
        }, this);

        // process any extra filters for this dataset
        if (extraFilterMap[datasetName])
        {
            Ext.each(extraFilterMap[datasetName], function(filterDef)
            {
                Ext.each(filterDef.filterArray, function(filter)
                {
                    WHERE.push(this._getWhereClauseFromFilter(filter, filterDef.measures, false /* recursed */, forDebugging));
                }, this);
            }, this);
        }

        return {
            sql: SELECT.join('') + "\n" + FROM + (WHERE.length == 0 ? "" : "\nWHERE ") + WHERE.join("\n\tAND "),
            columnAliasMap: columnAliasMap
        };
    },

    _getIntervalSelectClause : function(m, hasAlignment)
    {
        var protDayCol = m.sourceTable.tableAlias + "." + m.measure.name,
            startDayCol = hasAlignment ? 'visittagalignment.ProtocolDay' : '0',
            denom = this.getIntervalDenominator(m.dateOptions.interval),
            clause = '(' + protDayCol + ' - ' + startDayCol + ')';

        if (denom > 1)
        {
            clause = 'CAST(FLOOR(' + clause + '/' + denom + ') AS Integer)';
        }

        return clause;
    },

    getIntervalDenominator : function(interval)
    {
        if (interval == this.STUDY_ALIAS_PREFIX + 'Weeks')
            return 7;
        else if (interval == this.STUDY_ALIAS_PREFIX + 'Months')
            return 365.25/12;
        else if (interval == this.STUDY_ALIAS_PREFIX + 'Years')
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

        columnName = _measure.columnName;
        literalFn = _measure.literalFn;


        var v, arr, sep = '', clause = '',
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
                clause = columnName + (operator==='in' ? " IN (" : " NOT IN (");
                v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
                arr = v.split(';');
                if (forDebugging === true && arr.length > 10)
                {
                    clause += '{' + arr.length + ' ITEMS}';
                }
                else
                {
                    arr.forEach(function(v)
                    {
                        clause += sep + literalFn(v);
                        sep = ',';
                    });
                }
                clause += ')';
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