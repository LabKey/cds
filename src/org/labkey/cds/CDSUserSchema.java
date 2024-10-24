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

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.collections.CaseInsensitiveTreeSet;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.module.Module;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.visualization.VisualizationProvider;
import org.labkey.cds.query.MabGroupTable;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

/**
 * User: markigra
 * Date: 3/2/12
 * Time: 2:30 PM
 */
public class CDSUserSchema extends SimpleUserSchema
{
    public static final String SCHEMA_NAME = "CDS";
    public static final String METADATA_SCHEMA_NAME = "metadata";
    private static final List<String> SUBJECT_IMPORT_TABLES = Arrays.asList("import_ics", "import_nab", "import_els_ifng", "import_bama",
            "import_studypartgrouparmsubject", "import_studypartgrouparmproduct", "import_studypartgrouparmvisit", "import_studypartgrouparmvisitproduct",
            "import_studypartgrouparm", "import_studysubject", "import_nabmab");

    private boolean metadata = false;

    public CDSUserSchema(User user, Container container)
    {
        super(SCHEMA_NAME, "Schema for DataSpace. Detail data is stored in datasets of study schema.", user, container, CDSSchema.getInstance().getSchema());
    }


    @Override
    public Set<String> getVisibleTableNames()
    {
        Set<String> available = new CaseInsensitiveTreeSet();
        available.addAll(super.getVisibleTableNames());

        if (!getContainer().hasPermission(getUser(), AdminPermission.class))
            available.removeAll(SUBJECT_IMPORT_TABLES);

        return Collections.unmodifiableSet(available);
    }

    @Override
    protected TableInfo createWrappedTable(String name, @NotNull TableInfo sourceTable, ContainerFilter cf)
    {
        if (SUBJECT_IMPORT_TABLES.contains(name.toLowerCase()) && !getContainer().hasPermission(getUser(), AdminPermission.class))
            return null;

        if (name.equalsIgnoreCase(MabGroupTable.NAME))
            return super.createWrappedTable(name, sourceTable, cf);

        return new CDSSimpleTable(this, sourceTable, cf).init();
    }

    @Override
    public TableInfo createTable(String name, ContainerFilter cf)
    {
        if (name.equalsIgnoreCase(MabGroupTable.NAME))
        {
            return new MabGroupTable(getDbSchema().getTable(MabGroupTable.NAME), this, cf);
        }

        if (name.equalsIgnoreCase("MabMixMetadata") || name.equalsIgnoreCase("nabantigen"))
        {
            // MAb metadata is always defined at the project level, override the passed in CF
            cf = ContainerFilter.Type.Project.create(this);
        }
        return super.createTable(name, cf);
    }

    static public void register(final Module module)
    {
        DefaultSchema.registerProvider(SCHEMA_NAME, new DefaultSchema.SchemaProvider(module)
        {
            @Override
            public QuerySchema createSchema(DefaultSchema schema, Module module)
            {
                return new CDSUserSchema(schema.getUser(), schema.getContainer());
            }
        });
    }

    @Nullable
    @Override
    public VisualizationProvider createVisualizationProvider()
    {
        return new CDSVisualizationProvider(this);
    }


    @Override
    public QuerySchema getSchema(String name)
    {
        if (METADATA_SCHEMA_NAME.equals(name))
        {
            CDSUserSchema cds = new CDSUserSchema(getUser(), getContainer())
            {
                private final Set<String> _metatables = Collections.unmodifiableSet(new CaseInsensitiveTreeSet(Arrays.asList("study", "studyproductmap", "studypartgrouparmproduct", "studyassay")));

                @Override
                public @NotNull String getName()
                {
                    return METADATA_SCHEMA_NAME;
                }

                @Override
                public TableInfo createTable(String name, ContainerFilter cf)
                {
                    TableInfo sourceTable = createSourceTable(name);

                    if (sourceTable != null)
                    {
                        return new CDSMetadataTable(this, sourceTable, cf).init();
                    }

                    return super.createTable(name, cf);
                }

                @Override
                public Set<String> getTableNames()
                {
                    return _metatables;
                }

                @Override
                public Set<String> getVisibleTableNames()
                {
                    return _metatables;
                }

                @Override
                @NotNull
                public Map<String, QueryDefinition> getQueryDefs()
                {
                    return Collections.emptyMap();
                }

            };
            cds.metadata = true;
            return cds;
        }
        return super.getSchema(name);
    }

    @Override
    public Set<String> getSchemaNames()
    {
        Set<String> names = new TreeSet<>(super.getSchemaNames());
        if (!this.metadata)
        {
            names.add(METADATA_SCHEMA_NAME);
        }
        return names;
    }
}
