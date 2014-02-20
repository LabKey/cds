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
package org.labkey.cds.model;

import org.labkey.api.data.Container;
import org.labkey.cds.CDSManager;

import java.util.ArrayList;
import java.util.List;

/**
 * User: markigra
 * Date: 6/22/12
 * Time: 9:52 AM
 */
public class Citable
{
    private String _URI;
    private String _title;
    private String _description;
    private String _citableType;
    private String _link;
    private Container _container;
    private String _entityId;
    private List<Citation> _citationList;
    private List<CitableAuthor> _authorList;

    public String getURI()
    {
        return _URI;
    }

    public void setURI(String URI)
    {
        this._URI = URI;
    }

    public String getEntityId()
    {
        return _entityId;
    }

    public void setEntityId(String entityId)
    {
        _entityId = entityId;
    }

    public Container getContainer()
    {
        return _container;
    }

    public void setContainer(Container container)
    {
        _container = container;
    }

    public String getLink()
    {
        return _link;
    }

    public void setLink(String link)
    {
        _link = link;
    }

    public String getCitableType()
    {
        return _citableType;
    }

    public void setCitableType(String citableType)
    {
        _citableType = citableType;
    }

    public String getDescription()
    {
        return _description;
    }

    public void setDescription(String description)
    {
        _description = description;
    }

    public String getTitle()
    {
        return _title;
    }

    public void setTitle(String title)
    {
        _title = title;
    }

    public List<Citation> getCitations()
    {
        if (null == _citationList)
            _citationList = CDSManager.get().getCitationList(getURI(), getContainer());

        return _citationList;
    }

    public List<Citation> getCitations(CitationType type)
    {
        String citationTypeName = type.name();
        List<Citation> list = new ArrayList<>();
        for (Citation citation : getCitations())
            if (citation.getCitationType().equalsIgnoreCase(citationTypeName))
                list.add(citation);

        return list;
    }

    public List<CitableAuthor> getAuthors()
    {
        if (null == _authorList)
            _authorList = CDSManager.get().getAuthorList(getURI(), getContainer());

        return _authorList;
    }

    public List<Citation> getDataSources()
    {
        return getCitations(CitationType.DATASOURCE);
    }

    public List<Citation> getReferences()
    {
        return getCitations(CitationType.REFERENCE);
    }
}
