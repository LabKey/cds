/*
 * Copyright (c) 2014-2019 LabKey Corporation
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

import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.cds.query.MabGroupTable;

public class CDSSchema
{
    private static final CDSSchema _instance = new CDSSchema();

    public static CDSSchema getInstance()
    {
        return _instance;
    }

    private CDSSchema()
    {
        // private constructor to prevent instantiation from
        // outside this class: this singleton should only be
        // accessed via org.labkey.cds.CDSSchema.getInstance()
    }

    public DbSchema getSchema()
    {
        return DbSchema.get("cds", DbSchemaType.Module);
    }

    public TableInfo getTableInfoMabGroup()
    {
        return getSchema().getTable(MabGroupTable.NAME);
    }
}
