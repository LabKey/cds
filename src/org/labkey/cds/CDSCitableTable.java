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

import org.labkey.api.data.Container;
import org.labkey.api.data.DatabaseTableType;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.SimpleUserSchema;

/**
 * User: markigra
 * Date: 6/22/12
 * Time: 4:29 PM
 */
public class CDSCitableTable extends CDSSimpleTable
{
    public CDSCitableTable(Container container, SimpleUserSchema schema, TableInfo table)
    {
        //TODO: Fix this up to use multi-value lookup. This likely only works for single table query, but it's just for quick data entry/viewing
        super(schema, table);
    }

    public SimpleUserSchema.SimpleTable<SimpleUserSchema> init()
    {
        super.init();
        ExprColumn authorsCol = new ExprColumn(this, "Authors", new SQLFragment(
                "(SELECT array_to_string(core.array_accum(cds.CitableAuthors.AuthorId), ', ') FROM cds.CitableAuthors " +
                        "WHERE cds.CitableAuthors.CitableURI=" + ExprColumn.STR_TABLE_ALIAS + ".URI " +
                        "AND cds.CitableAuthors.Container=" + ExprColumn.STR_TABLE_ALIAS + ".Container " +
                        "GROUP BY cds.CitableAuthors.CitableURI)"), JdbcType.LONGVARCHAR);
        authorsCol.setReadOnly(false);
        authorsCol.setUserEditable(true);
        authorsCol.setShownInInsertView(true);
        authorsCol.setShownInUpdateView(true);
        authorsCol.setDescription("Comma separated list of authors in the form: Smith J, Spade S");
        addColumn(authorsCol);
        return this;
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        TableInfo table = getRealTable();
        if (table != null && table.getTableType() == DatabaseTableType.TABLE)
            return new CDSCitableQueryUpdateService(getContainer(), this, table);
        return null;
    }
}
