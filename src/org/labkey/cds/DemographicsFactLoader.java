/*
 * Copyright (c) 2014 LabKey Corporation
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
import org.labkey.api.data.Container;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QuerySettings;
import org.labkey.api.query.QueryView;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.study.DataSet;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by markigra on 6/9/14.
 * This "specialized" fact loader will add additional rows for any subjects that have demographics rows but no assay rows
 * It should be run after all the other fact loaders.
 */
public class DemographicsFactLoader extends FactLoader
{
    public static final String TABLE_NAME = "Demographics";

    public DemographicsFactLoader(UserSchema studySchema, DataSet demographicsDataset, User user, Container c)
    {
        super(studySchema, demographicsDataset, user, c);

        //We have fewer columns to map than the typical table
        UserSchema coreSchema = QueryService.get().getUserSchema(user, c, "core");

        /*
         * ColumnMappers find the correct columns in the dataset to map into cube columns and can map a const if not found.
         * They also ensure that the values from the dataset have corresponding rows in the appropriate
         * tables in the star schema.
         */
        _colsToMap = new ColumnMapper[] {
            new ColumnMapper("ParticipantId", null, null, "SubjectID", "ParticipantId"),
            //The study column is the same as the container column and available directly in the table
            //For this reason we just use the container to find the lookup into the studyproperties table
            new ColumnMapper("Study", JdbcType.GUID, coreSchema.getTable("Container"), null, "Container", "Folder"),
            new ColumnMapper("Container", JdbcType.GUID, null, c.getId())
        };
   }

    //TODO: This is a totally unnecessary GROUP BY CLAUSE generated by reusing code
    public SQLFragment getPopulateSql()
    {
        return new SQLFragment("INSERT INTO cds.facts (ParticipantId, Study, Container) SELECT ParticipantId, Study, Container FROM " + getTranslatedSelect());
    }

    private String getTranslatedSelect()
    {
        UserSchema schema = QueryService.get().getUserSchema(_user, _container, "study");
        QuerySettings settings = new TempQuerySettings(getSelectSql());

        QueryView queryView = new QueryView(schema, settings, null);

        return queryView.getTable().getFromSQL("x").toString();

    }

    private String getSelectSql()
    {
        List<String> columns = new ArrayList<>();

        for (ColumnMapper col : _colsToMap)
        {
            columns.add(col.getColumnAliasSql());
        }

        ColumnMapper participantMapper = _colsToMap[0];
        String sql = "SELECT " + StringUtils.join(columns, ", ") + " FROM study.\"" + _sourceTableInfo.getName() + "\" WHERE " + participantMapper.getSourceColumn().getName() + " NOT IN (SELECT ParticipantId FROM cds.Facts)" ;

        return sql;
    }

    public int populateCube()
    {
         for (ColumnMapper columnMapper : _colsToMap)
            columnMapper.ensureKeys();

        _rowsInserted = new SqlExecutor(CDSSchema.getInstance().getSchema()).execute(getPopulateSql());

        return _rowsInserted;
    }

}
