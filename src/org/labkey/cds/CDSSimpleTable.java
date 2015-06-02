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

import org.labkey.api.data.DatabaseTableType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.study.DataspaceContainerFilter;

/**
 * User: markigra
 * Date: 3/11/12
 * Time: 9:34 PM
 */
public class CDSSimpleTable extends SimpleUserSchema.SimpleTable<SimpleUserSchema>
{
    public CDSSimpleTable(SimpleUserSchema schema, TableInfo table)
    {
        super(schema, table);

        setContainerFilter(new DataspaceContainerFilter(schema.getUser()));
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        TableInfo table = getRealTable();
        if (table != null && table.getTableType() == DatabaseTableType.TABLE)
            return new CDSSimpleQueryUpdateService(_userSchema.getContainer(), this, table);
        return null;
    }
}
