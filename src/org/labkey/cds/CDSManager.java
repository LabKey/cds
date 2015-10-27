/*
 * Copyright (c) 2014-2015 LabKey Corporation
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
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.exp.list.ListDefinition;
import org.labkey.api.exp.list.ListService;
import org.labkey.api.security.User;
import org.labkey.api.util.ContainerUtil;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class CDSManager
{
    private static final CDSManager _instance = new CDSManager();

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


    public boolean isTutorialAvailable(Container c, User user)
    {
        ListDefinition resource = ListService.get().getList(c, "Resource");
        if (null != resource)
        {
            TableInfo info = resource.getTable(user);
            if (null != info)
            {
                return new TableSelector(info).exists();
            }
        }
        return false;
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
                    "StudyProductMap",
                    "TreatmentArmSubjectMap",
                    "TreatmentArm",
                    "Product",
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

    public CDSController.HelpForm getHelpCenterForm(Container container, String pageName) throws SQLException
    {
        if (pageName == null)
            return null;
        SQLFragment sql = new SQLFragment("SELECT\n" +
                "\tBody AS Html, \tTitle\n" +
                "FROM comm.PageVersions as WikiVersions\n" +
                "JOIN comm.Pages AS Wiki ON \n" +
                "\tWikiVersions.PageEntityId = Wiki.EntityId\n" +
                "WHERE Wiki.Name = ? and Wiki.Container = ?\n" +
                "ORDER BY WikiVersions.Version DESC", pageName, container);

        SqlSelector selector = new SqlSelector(DbSchema.get("comm", DbSchemaType.Module), sql);
        CDSController.HelpForm helpForm = new CDSController.HelpForm();
        try (ResultSet rs = selector.getResultSet())
        {
            if (rs.next())
            {
                helpForm.setTitle(rs.getString("Title"));
                helpForm.setHtmlBody(rs.getString("Html"));
            }

        }
        return helpForm;
    }
}