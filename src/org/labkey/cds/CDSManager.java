/*
 * Copyright (c) 2014-2017 LabKey Corporation
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
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.util.ContainerUtil;
import org.labkey.api.util.PageFlowUtil;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class CDSManager
{
    private static final CDSManager _instance = new CDSManager();

    private static final String CDS_ACTIVE_USER = "cdsActiveUser";

    private CDSManager()
    {
        // prevent external construction with a private default constructor
    }


    public static CDSManager get()
    {
        return _instance;
    }


    public void deleteFacts(Container c)
    {
        new SqlExecutor(CDSSchema.getInstance().getSchema()).execute("DELETE FROM cds.Facts WHERE Container = ?", c);
    }


    /**
     * Return string containing table names of uncleaned tables in schema
     * @param c
     * @return Comma delimited string showing tables with orphaned rows
     */
    private String orphanedRows(Container c) throws SQLException
    {
        List<String> hasOrphans = new ArrayList<>();
        for (String tableName : CDSSchema.getInstance().getSchema().getTableNames())
        {
            TableInfo t = CDSSchema.getInstance().getSchema().getTable(tableName);
            if (null != t.getColumn("container"))
            {
                if (new TableSelector(t, SimpleFilter.createContainerFilter(c), null).exists())
                    hasOrphans.add(tableName);
            }

        }
        return hasOrphans.size() > 0 ? StringUtils.join(hasOrphans, ", ") : null;
    }


    public void cleanContainer(Container c)
    {

        try
        {
            deleteFacts(c);
            DbSchema dbSchema = CDSSchema.getInstance().getSchema();

            for (String s : new String[] {
                    "nabantigen",
                    "icsantigen",
                    "elispotantigen",
                    "bamaantigen",
                    "GridBase",
                    "Sites",
                    "Feedback",
                    "Properties",
                    "VisitTagAlignment",
                    "VisitTagMap",
                    "StudyGroupVisitMap",
                    "StudyGroup",
                    "SubjectProductMap",
                    "StudyPartGroupArmProduct",
                    "StudyProductMap",
                    "TreatmentArmSubjectMap",
                    "TreatmentArm",
                    "Product",
                    "StudyAssay",
                    "StudyDocument",
                    "Document",
                    "StudyPublication",
                    "Publication",
                    "StudyRelationship",
                    "Study",
                    "Assay",
                    "Lab"
            })
            {
                TableInfo t = dbSchema.getTable(s);
                if (null != t)
                {
                    ContainerUtil.purgeTable(t, c, null);
                }
            }
            String orphans;
            assert (orphans = orphanedRows(c)) == null : "Orphaned rows in tables: " + orphans;
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
    }


    public CDSController.PropertiesForm getProperties(Container container)
    {
        SQLFragment sql = new SQLFragment("SELECT * FROM cds.Properties WHERE Container = ?", container);
        return new SqlSelector(CDSSchema.getInstance().getSchema(), sql).getObject(CDSController.PropertiesForm.class);
    }


    public void resetActiveUserProperties(User user, Container container)
    {
        PropertyManager.getNormalStore().deletePropertySet(user, container, CDS_ACTIVE_USER);
    }


    public Map<String, String> getActiveUserProperties(User user, Container container)
    {
        return PropertyManager.getNormalStore().getProperties(user, container, CDS_ACTIVE_USER);
    }


    public void setActiveUserProperties(User user, Container container, Map<String, String> properties)
    {
        PropertyManager.PropertyMap activeUserProperties = PropertyManager.getWritableProperties(user, container, CDS_ACTIVE_USER, true);
        for (Map.Entry<String, String> property : properties.entrySet())
        {
            activeUserProperties.put(property.getKey(), property.getValue());
        }
        activeUserProperties.save();
    }

    public boolean isStudyDocumentAccessible(String studyName, String docId, User user, Container container)
    {
        TableInfo tableInfo = getCDSQueryTableInfo("learn_documentsforstudies", user, container);
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromParts("prot"), studyName);
        filter.addCondition(FieldKey.fromParts("document_id"), docId);

        TableSelector selector = new TableSelector(tableInfo, Collections.singleton("accessible"), filter, null);
        return selector.getObject(Boolean.class);
    }


    public static TableInfo getCDSQueryTableInfo(String queryName, User user, Container container)
    {
        QueryService queryService = QueryService.get();
        QueryDefinition qd = queryService.getQueryDef(user, container, "cds", queryName);

        ArrayList<QueryException> qerrors = new ArrayList<>();
        return qd.getTable(qerrors, true);
    }

    public String getStudyDocumentPath(Container container)
    {
        ModuleProperty mp = ModuleLoader.getInstance().getModule(CDSModule.class).getModuleProperties().get(CDSModule.STUDY_DOCUMENT_PATH);
        return PageFlowUtil.decode(mp.getEffectiveValue(container));
    }

    public String getCDSImportFolderPath(Container container)
    {
        ModuleProperty mp = ModuleLoader.getInstance().getModule(CDSModule.class).getModuleProperties().get(CDSModule.CDS_IMPORT_PATH);
        return PageFlowUtil.decode(mp.getEffectiveValue(container));
    }

}