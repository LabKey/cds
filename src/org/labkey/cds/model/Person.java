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
package org.labkey.cds.model;

import org.labkey.api.data.Container;

/**
 * User: markigra
 * Date: 6/21/12
 * Time: 10:36 AM
 */
public class Person
{
    private String _id;
    private String _fullName;
    private String _foreName;
    private String _lastName;
    private String _initials;
    private String _labid;
    private String _role;
    private String _description;
    private Container _container;
    private String _pictureFile;
    private String _email;

    public Person()
    {

    }

    public Person(String authorId)
    {
        this._id = authorId;
        String[] nameParts = authorId.split(" ");
        this._lastName = nameParts[0];
        if (nameParts.length > 1)
        {
            this._initials = nameParts[1];
            this._fullName = this._initials + " " + this._lastName;
        }
        else
            this._fullName = this._lastName;
    }

    public String getId()
    {
        return _id;
    }

    public void setId(String id)
    {
        _id = id;
    }

    public String getFullName()
    {
        return _fullName;
    }

    public void setFullName(String fullName)
    {
        _fullName = fullName;
    }

    public String getLabid()
    {
        return _labid;
    }

    public void setLabid(String labid)
    {
        _labid = labid;
    }

    public String getRole()
    {
        return _role;
    }

    public void setRole(String role)
    {
        _role = role;
    }

    public String getDescription()
    {
        return _description;
    }

    public void setDescription(String description)
    {
        _description = description;
    }

    public Container getContainer()
    {
        return _container;
    }

    public void setContainer(Container container)
    {
        _container = container;
    }

    public String getPictureFile()
    {
        return _pictureFile;
    }

    public void setPictureFile(String pictureFile)
    {
        _pictureFile = pictureFile;
    }

    public String getEmail()
    {
        return _email;
    }

    public void setEmail(String email)
    {
        _email = email;
    }

    public String getForeName()
    {
        return _foreName;
    }

    public void setForeName(String foreName)
    {
        _foreName = foreName;
    }

    public String getLastName()
    {
        return _lastName;
    }

    public void setLastName(String lastName)
    {
        _lastName = lastName;
    }

    public String getInitials()
    {
        return _initials;
    }

    public void setInitials(String initials)
    {
        _initials = initials;
    }
}
