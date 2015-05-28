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

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.TableInfo;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;


/**
 * User: markigra
 * Date: 3/2/12
 * Time: 2:30 PM
 */
public class CDSUserSchema extends SimpleUserSchema
{
    public static final String SCHEMA_NAME = "CDS";

    public CDSUserSchema(User user, Container container)
    {
        super(SCHEMA_NAME, "Schema for HIV Collaborative Dataspace. Detail data is stored in datasets of study schema.", user, container, DbSchema.get("cds"));
        _restricted = true;
    }


    @Override
    public QuerySchema getSchema(String name)
    {
        if (_restricted)
        {
            if ("cds".equalsIgnoreCase(name))
                return this;
            if ("study".equalsIgnoreCase(name))
            {
                QuerySchema ret = DefaultSchema.get(_user, _container).getSchema(name);
                ((UserSchema)ret).setRestricted(true);
                return ret;
            }
            return null;
        }
        else
        {
            return super.getSchema(name);
        }
    }


    @Override
    protected TableInfo createWrappedTable(String name, @NotNull TableInfo sourceTable)
    {
        if (sourceTable.getName().equalsIgnoreCase("Citable"))
            return new CDSCitableTable(getContainer(), this, sourceTable).init();
        else
            return new CDSSimpleTable(this, sourceTable).init();
    }

    static public void register(final Module module)
    {
        DefaultSchema.registerProvider(SCHEMA_NAME, new DefaultSchema.SchemaProvider(module)
        {
            public QuerySchema createSchema(DefaultSchema schema, Module module)
            {
                return new CDSUserSchema(schema.getUser(), schema.getContainer());
            }
        });
    }


}
