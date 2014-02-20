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

import org.labkey.api.data.Container;

public class SourceQuery
{
    private Container container;
    private int rowId;
    private Container sourceContainer;
    private String queryName;
    private String schemaName;
    private String viewName;
    private int targetDatasetId;
    private String lab;
    private String assay;
    private String contact;
    private String batch;

    public Container getContainer()
    {
        return container;
    }

    public void setContainer(Container container)
    {
        this.container = container;
    }

    public Container getSourceContainer()
    {
        return sourceContainer;
    }

    public void setSourceContainer(Container sourceContainer)
    {
        this.sourceContainer = sourceContainer;
    }

    public String getQueryName()
    {
        return queryName;
    }

    public void setQueryName(String queryName)
    {
        this.queryName = queryName;
    }

    public String getSchemaName()
    {
        return schemaName;
    }

    public void setSchemaName(String schemaName)
    {
        this.schemaName = schemaName;
    }

    public String getViewName()
    {
        return viewName;
    }

    public void setViewName(String viewName)
    {
        this.viewName = viewName;
    }

    public int getTargetDatasetId()
    {
        return targetDatasetId;
    }

    public void setTargetDatasetId(int targetDatasetId)
    {
        this.targetDatasetId = targetDatasetId;
    }

    public String getLab()
    {
        return lab;
    }

    public void setLab(String lab)
    {
        this.lab = lab;
    }

    public String getAssay()
    {
        return assay;
    }

    public void setAssay(String assay)
    {
        this.assay = assay;
    }

    public String getContact()
    {
        return contact;
    }

    public void setContact(String contact)
    {
        this.contact = contact;
    }

    public String getBatch()
    {
        return batch;
    }

    public void setBatch(String batch)
    {
        this.batch = batch;
    }

    public int getRowId()
    {
        return rowId;
    }

    public void setRowId(int rowId)
    {
        this.rowId = rowId;
    }
}
