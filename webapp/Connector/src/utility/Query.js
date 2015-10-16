// This is a singleton for cdsGetData query utilities
Ext.define('Connector.utility.Query', {

    alternateClassName: ['QueryUtils'],

    singleton: true,

    SUBJECTVISIT_TABLE: "study.gridbase",

    STUDY_ALIAS_PREFIX: 'cds_Study_',

    constructor : function(config)
    {
        this.callParent([config]);

        this.DATASET_ALIAS = this.STUDY_ALIAS_PREFIX + 'Dataset';
        this.SUBJECT_ALIAS = this.STUDY_ALIAS_PREFIX + Connector.studyContext.subjectColumn;
        this.SEQUENCENUM_ALIAS = this.STUDY_ALIAS_PREFIX + 'SequenceNum';
        this.CONTAINER_ALIAS = this.STUDY_ALIAS_PREFIX + 'Container';
        this.FOLDER_ALIAS = 'Folder';
    },

    /**
     *  Wrapper for generating the cdsGetData SQL instead of calling LABKEY.Query.Visualization.getData()
     */
    getData : function(config)
    {
        var result = this._generateVisGetDataSql(config.measures, config.extraFilters);

        LABKEY.Query.executeSql({
            schemaName: 'study',
            sql: result.sql,
            requiredVersion: '9.1',
            saveInSession: true,
            maxRows: config.metaDataOnly ? 0 : undefined,
            success: function(response)
            {
                response.columnAliasMap = result.columnAliasMap;
                config.success.call(config.scope, response);
            },
            failure: config.failure,
            scope: config.scope
        });
    },

    getDataSQL : function(config)
    {
        return this._generateVisGetDataSql(config.measures, config.extraFilters).sql;
    },

    _getTables : function()
    {
        var table = function(schema, query, joinKeys, isAssayDataset)
        {
            this.displayName = query;
            this.queryName = query.toLowerCase();
            this.fullQueryName = schema + '.' + this.queryName;
            this.tableAlias = schema + '_' + this.queryName;
            this.schemaName = schema;
            this.isAssayDataset = isAssayDataset === true;
            this.joinKeys = joinKeys;
        };

        return {
            'study.gridbase':     new table('study', 'GridBase', ['container', 'participantsequencenum']),
            'study.demographics': new table('study', 'Demographics', ['container', 'subjectid']),
            'study.ics':          new table('study', 'ICS', ['container', 'participantsequencenum'], true),
            'study.bama':         new table('study', 'BAMA', ['container', 'participantsequencenum'], true),
            'study.elispot':      new table('study', 'Elispot', ['container', 'participantsequencenum'], true),
            'study.nab':          new table('study', 'NAb', ['container', 'participantsequencenum'], true)
        };
    },

    _acceptMeasureFn : function(datasetName, tables) {
        return function(m) {
            if (m.fullQueryName === datasetName) {
                return true;
            }

            var t = tables[m.fullQueryName];
            return t && !t.isAssayDataset;
        };
    },

    _sqlLiteralFn : function(type) {
        if (type == "VARCHAR" || type.startsWith("Text")) {
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

    _toSqlLiteral : function(v) {
        if (!Ext.isDefined(v) || null === v) {
            return "NULL";
        }
        else if (Ext.isNumber(v)) {
            return "" + v;
        }
        else if (Ext.isString(v)) {
            return LABKEY.Query.sqlStringLiteral(v);
        }
        else if (Ext.isDate(v)) {
            return LABKEY.Query.sqlDatetimeLiteral(v);
        }

        throw "unsupported constant: " + v;
    },

    _generateVisGetDataSql : function(measuresIN, extraFilters)
    {
        var me = this,
            tables = this._getTables(),
            columnAliasMap = {},
            aliasMeasureMap = {},
            datasets = {},
            hasAssayDataset = false;

        // I want to modify these measures for internal bookkeeping,
        // but I don't own this config, so clone here.
        // Add "fullQueryName", "table", "columnName", "literalFn", and "queryName"
        var measures = measuresIN.map(function(m)
        {
            var _m = Ext.clone(m),
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
                axisTable.tableAlias += '_' + m.measure.axisName;
                axisTable.displayName = m.measure.axisName;
                tables[axisQueryName] = axisTable;
                table = axisTable;
            }

            _m.fullQueryName = axisQueryName;
            _m.table = table;
            _m.columnName = table.tableAlias + '.' + m.measure.name;
            _m.queryName = queryName;
            _m.literalFn = me._sqlLiteralFn(m.measure.type);

            // find the list of datasets
            if (_m.table && _m.table.isAssayDataset)
            {
                hasAssayDataset = true;
                datasets[_m.table.fullQueryName] = _m.table;
            }

            aliasMeasureMap[_m.measure.alias] = _m;

            return _m;
        });

        // if we don't have any assay datasets, use GridBase as the root
        if (!hasAssayDataset)
        {
            datasets[this.SUBJECTVISIT_TABLE] = tables[this.SUBJECTVISIT_TABLE];
        }

        // calculate a map of source to filter.
        // Each compound filter should match to 1 and only 1 source.
        var extraFilterMap = {};
        if (!Ext.isEmpty(extraFilters))
        {
            Ext.each(extraFilters, function(f)
            {
                var aliases = f.getAliases(),
                    included = false;

                Ext.iterate(aliases, function(alias)
                {
                    var measure = aliasMeasureMap[alias];
                    if (measure)
                    {
                        if (tables[measure.queryName])
                        {
                            if (!extraFilterMap[measure.queryName])
                            {
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
            });
        }

        // generate the UNION ALL (checkerboard) sql for the set of datasets
        var unionSQL = '',
            union = '',
            term,
            hasMultiple = Object.keys(datasets).length > 1;

        Ext.iterate(datasets, function(name)
        {
            term = this._generateVisDatasetSql(measures, name, tables, hasMultiple, extraFilterMap);
            unionSQL += union + term.sql;
            union = "\nUNION ALL\n";

            Ext.applyIf(columnAliasMap, term.columnAliasMap);
        }, this);

        // sort by the study, subject, and visit
        var orderSQL = '\nORDER BY "' + this.CONTAINER_ALIAS + '","' + this.SUBJECT_ALIAS + '","' + this.SEQUENCENUM_ALIAS + '"';

        return {
            sql: 'SELECT * FROM (' + unionSQL + ') AS _0' + orderSQL,
            columnAliasMap: columnAliasMap
        };
    },

    _generateVisDatasetSql : function(allMeasures, datasetName, tables, hasMultiple, extraFilterMap)
    {
        datasetName = datasetName || this.SUBJECTVISIT_TABLE;

        var rootTable = tables[datasetName],
            acceptMeasure = this._acceptMeasureFn(datasetName, tables),
            queryMeasures = allMeasures.filter(acceptMeasure),
            gridBaseAliasableColumns = {
                subjectid: true,
                sequencenum: true
            },
            columnAliasMap = {},
            visitAlignmentTag = null;

        // look for aliases, e.g. study.gridbase.subjectid -> study.{dataset}.subjectid
        allMeasures.map(function(m) { m.sourceTable = m.table; return m;})
            .filter(function(m) { return m.table.fullQueryName === this.SUBJECTVISIT_TABLE &&  gridBaseAliasableColumns[m.measure.name.toLowerCase()];})
            .forEach(function(m) { m.sourceTable = rootTable;});

        //
        // SELECT
        //
        var SELECT = ["SELECT "];
        sep = "\n\t";
        if (hasMultiple) {
            // only include the Dataset column if we have multiple assay datasets in the query
            SELECT.push(LABKEY.Query.sqlStringLiteral(rootTable.displayName) + " AS " + "\"" + this.DATASET_ALIAS + "\" @title=\'Dataset\'");
            columnAliasMap[this.DATASET_ALIAS] = {name: 'Dataset'};
            sep = ",\n\t";
        }
        SELECT.push(sep + rootTable.tableAlias + '.container AS "' + this.CONTAINER_ALIAS +'" @title=\'Container\''); sep = ",\n\t";
        SELECT.push(sep + rootTable.tableAlias + '.subjectid AS "' + this.SUBJECT_ALIAS +'" @title=\'Subject Id\'');
        SELECT.push(sep + rootTable.tableAlias + '.sequencenum AS "' + this.SEQUENCENUM_ALIAS +'" @title=\'Sequence Num\'');

        columnAliasMap[this.CONTAINER_ALIAS] = {
            name: 'Container',
            queryName: rootTable.displayName,
            schemaName: rootTable.schemaName
        };

        columnAliasMap[this.SUBJECT_ALIAS] = {
            name: 'SubjectId',
            queryName: rootTable.displayName,
            schemaName: rootTable.schemaName
        };

        columnAliasMap[this.SEQUENCENUM_ALIAS] = {
            name: 'SequenceNum',
            queryName: rootTable.displayName,
            schemaName: rootTable.schemaName
        };

        Ext.each(allMeasures, function(m)
        {
            var isKeyCol = m.measure.name.toLowerCase() == 'subjectid'
                    || m.measure.name.toLowerCase() == 'container'
                    || m.measure.name.toLowerCase() == 'sequencenum',
                alias = m.measure.alias || LABKEY.Utils.getMeasureAlias(m.measure),
                colLabel = m.measure.shortCaption || m.measure.label,
                title = Ext.isDefined(colLabel) ? " @title='" + colLabel + "'" : "";

            if (columnAliasMap[alias] || isKeyCol)
            {
                return;
            }

            columnAliasMap[alias] = {
                name: m.measure.name,
                schemaName: m.measure.schemaName,
                queryName: m.measure.queryName
            };

            if (acceptMeasure(m))
            {
                if (Ext.isObject(m.dateOptions)) {
                    visitAlignmentTag = m.dateOptions.zeroDayVisitTag;
                    SELECT.push(",\n\t" + this._getIntervalSelectClause(m, visitAlignmentTag != null) + " AS " + alias + title);
                }
                else {
                    SELECT.push(",\n\t" + m.sourceTable.tableAlias + "." + m.measure.name + " AS " + alias + title);
                }
            }
            else
            {
                SELECT.push(",\n\tNULL AS " + alias + title);
            }
        }, this);

        //
        // FROM
        //
        var fromTables = {};
        queryMeasures.forEach(function(m)
        {
            if (m.sourceTable && m.sourceTable.fullQueryName !== datasetName)
            {
                fromTables[m.sourceTable.fullQueryName] = m.sourceTable;
            }
        });

        var FROM = "FROM " + rootTable.fullQueryName + " " + rootTable.tableAlias,
            sep = "\n\tON ";
        Ext.iterate(fromTables, function(name, t)
        {
            FROM += "\nINNER JOIN " + t.fullQueryName + " " + t.tableAlias;
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
            FROM += "\nINNER JOIN (SELECT Container, ParticipantId, MIN(ProtocolDay) AS ProtocolDay FROM cds.visittagalignment  "
                + "\n\t\tWHERE visittagname='" + visitAlignmentTag + "' GROUP BY Container, ParticipantId) AS visittagalignment"
                + "\n\tON study_gridbase.container=visittagalignment.container"
                + "\n\tAND study_gridbase.subjectid=visittagalignment.participantid";
        }

        //
        // WHERE
        //
        var WHERE = [], f;

        // process filters on the measures
        Ext.each(queryMeasures, function(mdef)
        {
            // two places to look for filters, filterArray or measure.values (i.e. IN clause)
            if (!Ext.isEmpty(mdef.filterArray))
            {
                Ext.each(mdef.filterArray, function(f)
                {
                    WHERE.push(this._getWhereClauseFromFilter(f, mdef));
                }, this);
            }
            else if (Ext.isArray(mdef.measure.values))
            {
                f = LABKEY.Filter.create(mdef.measure.name, mdef.measure.values.join(';'), LABKEY.Filter.Types.IN);
                WHERE.push(this._getWhereClauseFromFilter(f, mdef));
            }
        }, this);

        // process any extra filters for this dataset
        if (extraFilterMap[datasetName])
        {
            Ext.each(extraFilterMap[datasetName], function(filterDef)
            {
                Ext.each(filterDef.filterArray, function(filter)
                {
                    WHERE.push(this._getWhereClauseFromFilter(filter, filterDef.measures));
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
            startDayCol = hasAlignment ? 'visittagalignment.ProtocolDay' : '0';

        if (m.dateOptions.interval == 'Weeks') {
            return 'CAST(FLOOR((' + protDayCol + ' - ' + startDayCol + ')/7) AS Integer)';
        }
        else if (m.dateOptions.interval == 'Months') {
            return 'CAST(FLOOR((' + protDayCol + ' - ' + startDayCol + ')/(365.25/12)) AS Integer)';
        }
        else if (m.dateOptions.interval == 'Years') {
            return 'CAST(FLOOR((' + protDayCol + ' - ' + startDayCol + ')/365.25) AS Integer)';
        }

        return '(' + protDayCol + ' - ' + startDayCol + ')';
    },

    _getWhereClauseFromFilter : function(_f, measure, recursed)
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
                    clauses.push(this._getWhereClauseFromFilter(f._filters[i], measure, true /* recursed */));
                }
                return '(' + clauses.join(' ' + f.operator + ' ') + ')';
            }
            else
            {
                f = f._filters[0];
                _measure = measure[f.getColumnName()];
            }
        }
        else if (recursed)
        {
            _measure = measure[f.getColumnName()];
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
                arr.forEach(function(v)
                {
                    clause += sep + literalFn(v);
                    sep = ",";
                });
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

    isGeneratedColumnAlias : function(alias) {
        return alias.indexOf(QueryUtils.STUDY_ALIAS_PREFIX) == 0 || alias == QueryUtils.FOLDER_ALIAS
    }
});