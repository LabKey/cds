/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.cds;

import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QuerySettings;
import org.labkey.api.query.QueryView;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.study.DataSet;

import java.util.ArrayList;
import java.util.List;

/**
 * Loads summary of facts from a study dataset in the current container into the fact table.
 * Tries to map columns from the dataset into the dimension cols of the fact table using lookups and column name conventions
 * Essentially executes a group by of ParticipantId, Study (source study), Assay, Lab & Antigen
 * If not supplied in a column the Assay will be set to the dataset name. Other columns will be null
 */
public class FactLoader
{
    private DataSet _sourceDataset;
    private TableInfo _sourceTableInfo;
    private final Container _container;
    private User _user;
    private ColumnMapper[] _colsToMap;
    private int _rowsInserted = -1;

    public FactLoader(DataSet sourceDataset, User user, Container c)
    {
        _sourceDataset = sourceDataset;
        _sourceTableInfo = sourceDataset.getTableInfo(user);
        _container = c;
        _user = user;
        CDSUserSchema cdsSchema = new CDSUserSchema(user, c);

        /*
         * ColumnMappers find the correct columns in the dataset to map into cube columns and can map a const if not found.
         * They also ensure that the values from the dataset have corresponding rows in the appropriate
         * tables in the star schema.
         */
        _colsToMap = new ColumnMapper[] {
            new ColumnMapper("ParticipantId", null, null, "ParticipantId"),
            new ColumnMapper("Study", cdsSchema.getTable("Studies"), null, "Study", "StudyName"),
            new ColumnMapper("Assay", cdsSchema.getTable("Assays"), _sourceTableInfo.getName(), "Assay"),
            new ColumnMapper("Lab", cdsSchema.getTable("Labs"), null, "Lab"),
            new ColumnMapper("Antigen", cdsSchema.getTable("Antigens"), null, "Antigen", "VirusName", "Virus"),
            new ColumnMapper("Container", null, c.getId())
        };
    }


    public ColumnMapper[] getMappings()
    {
        return _colsToMap;
    }

    public String getGroupBySql()
    {
        List<String> selectCols = new ArrayList<>();
        List<String> groupByCols = new ArrayList<>();

        for (ColumnMapper col : _colsToMap)
        {
            selectCols.add(col.getSelectSql());
            if (null != col.getGroupByName())
                groupByCols.add(col.getGroupByName());
        }

        String sql = "SELECT " + StringUtils.join(selectCols, ", ") + " FROM study.\"" + _sourceTableInfo.getName() + "\" GROUP BY " + StringUtils.join(groupByCols, ", ");

        return sql;
    }

    public String getGroupBySqlTranslated()
    {
        UserSchema schema = QueryService.get().getUserSchema(_user, _container, "study");
        QuerySettings settings = new TempQuerySettings(getGroupBySql());

        QueryView queryView = new QueryView(schema, settings, null);

        return queryView.getTable().getFromSQL("x").toString();
    }

    public SQLFragment getPopulateSql()
    {
        List<String> selectCols = new ArrayList<>();
        for (ColumnMapper col : _colsToMap)
            selectCols.add(col.getSelectName());

        String selectColsStr = StringUtils.join(selectCols, ", ");

        return new SQLFragment("INSERT INTO cds.facts (" + selectColsStr + ")  \nSELECT " + selectColsStr + " FROM \n" + getGroupBySqlTranslated());
    }

    public int populateCube()
    {
         for (ColumnMapper columnMapper : _colsToMap)
            columnMapper.ensureKeys();

        _rowsInserted = new SqlExecutor(CDSSchema.getInstance().getSchema()).execute(getPopulateSql());

        //Vacuum Analyze
        new SqlExecutor(CDSSchema.getInstance().getSchema()).execute("VACUUM ANALYZE cds.Facts; VACUUM ANALYZE cds.Antigens; VACUUM ANALYZE cds.People; VACUUM ANALYZE cds.Citations; VACUUM ANALYZE cds.Citable;");

        return _rowsInserted;
    }

    public boolean isLoadComplete()
    {
        return _rowsInserted == -1;
    }

    public int getRowsInserted()
    {
        return _rowsInserted;
    }

    public DataSet getSourceDataset()
    {
        return _sourceDataset;
    }


    public class ColumnMapper
    {
        private ColumnInfo _sourceColumn;
        private String _constValue;
        private String _selectName;
        private TableInfo _lookupTarget;
        private int _rowsInserted = -1;

        ColumnMapper(String selectName, TableInfo lookupTarget, @Nullable String constValue, String... altNames)
        {
            this._sourceColumn = findMappingColumn(lookupTarget, altNames);
            this._selectName = selectName;
            this._constValue = constValue;
            this._lookupTarget = lookupTarget;
        }

        private String getSelectSql()
        {
            if (null != _sourceColumn)
                return _sourceColumn.getName() + " AS " + _selectName;
            else if (null != _constValue)
                return _sourceTableInfo.getSqlDialect().getStringHandler().quoteStringLiteral(_constValue) + " AS " + _selectName;
            else
                return "NULL AS " + _selectName;
        }

        private ColumnInfo findLookupColumn(TableInfo target)
        {
            String targetSchemaName = target.getSchema().getName();
            String targetTableName = target.getName();
            for (ColumnInfo col : _sourceTableInfo.getColumns())
            {
                if (col.isLookup())
                {
                    TableInfo colTarget = col.getFkTableInfo();
                    //Not sure -- does TableInfo.equals work??
                    if (colTarget.getSchema().getName().equalsIgnoreCase(targetSchemaName) && colTarget.getName().equalsIgnoreCase(targetTableName))
                        return col;
                }
            }

            return null;
        }

        private ColumnInfo findMappingColumn(TableInfo target, String... altNames)
        {
            ColumnInfo col = null;
            if (null != target)
                col = findLookupColumn(target);

            if (null != col)
                return col;

            if (null != altNames && altNames.length > 0)
                for (String s : altNames)
                    if (null != _sourceTableInfo.getColumn(s))
                        return _sourceTableInfo.getColumn(s);

            return null;
        }

        private String getGroupByName()
        {
            return null == _sourceColumn ? null : _sourceColumn.getName();
        }

        public String getSelectName()
        {
            return _selectName;
        }

        public ColumnInfo getSourceColumn()
        {
            return _sourceColumn;
        }

        public String getConstValue()
        {
            return _constValue;
        }

        public SQLFragment getEnsureKeysSql()
        {
            if (null == _lookupTarget)
                return null;

            List<String> pkCols = _lookupTarget.getPkColumnNames();
            String pkName;

            if (pkCols.size() == 1)
                pkName = pkCols.get(0);
            else if (pkCols.size() == 2 && pkCols.get(0).equalsIgnoreCase("container"))
                pkName = pkCols.get(1);
            else
                throw new IllegalStateException("Expected one pk field in table " + _lookupTarget);

            if (null == _sourceColumn && null != _constValue)
            {
                /*
                INSERT INTO cds.Assays ( container, id)
                        SELECT 'c994c269-4924-102f-afd2-4b5bd87e1a4c', 'neut'  WHERE 'neut' NOT IN (SELECT id from cds.Assays WHERE container = 'c994c269-4924-102f-afd2-4b5bd87e1a4c')
                */

                SimpleFilter filter = SimpleFilter.createContainerFilter(_container);
                String sql = "INSERT INTO cds." + _lookupTarget.getName() + " (container, " + pkName + ") SELECT ?, ? WHERE ? NOT IN (SELECT " + pkName + " from cds." + _lookupTarget.getName() + " WHERE container=?)";
                SQLFragment sqlFragment = new SQLFragment(sql, _container, _constValue, _constValue, _container);

                return sqlFragment;
            }
            else if (null != _sourceColumn)
            {
                /*
                INSERT INTO cds.Assays ( container, id)
                        SELECT 'c994c269-4924-102f-afd2-4b5bd87e1a4c', Assay FROM (SELECT DISTINCT Assay FROM study.neut WHERE Assay NOT IN (SELECT id FROM cds.Assays)) x
                 */

                //Translate LK sql into db sql then wrap in an insert statement.
                String lkSelect = "SELECT DISTINCT " + _sourceColumn.getName() + " FROM study.\"" + _sourceTableInfo.getName()  + "\" WHERE " + _sourceColumn.getName() + " NOT IN (SELECT " + pkName + " FROM cds." + _lookupTarget.getName() + ")";
                UserSchema schema = QueryService.get().getUserSchema(_user, _container, "study");
                QuerySettings settings = new TempQuerySettings(lkSelect);

                QueryView queryView = new QueryView(schema, settings, null);

                SQLFragment source =  queryView.getTable().getFromSQL("x");

                SQLFragment sql = new SQLFragment("INSERT INTO cds." + _lookupTarget.getName() + " (container, " + pkName + ") SELECT ? , " + _sourceColumn.getName() + " FROM ", _container);
                sql.append(source);

                return sql;

            }
            else
                return null;
        }

        public int ensureKeys()
        {
            SQLFragment ensureKeysSql = getEnsureKeysSql();
            if (null != ensureKeysSql)
                _rowsInserted = new SqlExecutor(CDSSchema.getInstance().getSchema()).execute(getEnsureKeysSql());
            else
                _rowsInserted = 0;

            return _rowsInserted;
        }

        public int getRowsInserted()
        {
            return _rowsInserted;
        }
    }

    /**
     * This class may be used ot create a QuerySettings from a given SQL statement,
     * schema name, and container.
     */
    private class TempQuerySettings extends QuerySettings
    {
        private String _sql;

        public TempQuerySettings(String sql)
        {
            super("query");
            _sql = sql;
            setQueryName("sql");
        }

        @Override
        protected QueryDefinition createQueryDef(UserSchema schema)
        {
            QueryDefinition qdef;
            qdef = QueryService.get().createQueryDef(schema.getUser(), _container, schema, getQueryName());
            qdef.setSql(_sql);
            return qdef;
        }
    }
}
