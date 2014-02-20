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

/**
 * User: markigra
 * Date: 6/21/12
 * Time: 3:56 PM
 */
public class CitableAuthor
{
    private int _rowId;
    private String _authorId;
    private String _citableURI;
    private String _authorType;
    private Boolean _contact;
    private int _sortIndex;
    private Container _container;
    private Person _author;

    public int getRowId()
    {
        return _rowId;
    }

    public void setRowId(int rowId)
    {
        _rowId = rowId;
    }

    public String getAuthorId()
    {
        return _authorId;
    }

    public void setAuthorId(String authorId)
    {
        _authorId = authorId;
    }

    public String getCitableURI()
    {
        return _citableURI;
    }

    public void setCitableURI(String citableURI)
    {
        _citableURI = citableURI;
    }

    public String getAuthorType()
    {
        return _authorType;
    }

    public void setAuthorType(String authorType)
    {
        _authorType = authorType;
    }

    public Boolean isContact()
    {
        return _contact;
    }

    public void setContact(Boolean contact)
    {
        _contact = contact == null ? false : true;
    }

    public int getSortIndex()
    {
        return _sortIndex;
    }

    public void setSortIndex(int sortIndex)
    {
        _sortIndex = sortIndex;
    }

    public Container getContainer()
    {
        return _container;
    }

    public void setContainer(Container container)
    {
        _container = container;
    }

    public Person getAuthor()
    {
        if (null == _author)
            _author = CDSManager.get().getPerson(getAuthorId(), getContainer());

        return _author;
    }
}
