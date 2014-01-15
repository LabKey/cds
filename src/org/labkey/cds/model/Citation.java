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
import org.labkey.cds.CDSManager;

/**
 * User: markigra
 * Date: 6/21/12
 * Time: 3:55 PM
 */
public class Citation
{
    private String _citableURI;
    private String _objectURI;
    private Container _container;
    private String _citationType;
    private int _sortIndex;
    private Citable _citable;

    public String getCitableURI()
    {
        return _citableURI;
    }

    public void setCitableURI(String citableURI)
    {
        _citableURI = citableURI;
    }

    public String getObjectURI()
    {
        return _objectURI;
    }

    public void setObjectURI(String objectURI)
    {
        _objectURI = objectURI;
    }

    public Container getContainer()
    {
        return _container;
    }

    public void setContainer(Container container)
    {
        _container = container;
    }

    public int getSortIndex()
    {
        return _sortIndex;
    }

    public void setSortIndex(int sortIndex)
    {
        _sortIndex = sortIndex;
    }

    public String getCitationType()
    {
        return _citationType;
    }

    public void setCitationType(String citationType)
    {
        _citationType = citationType;
    }

    public Citable getCited()
    {
        if (null == _citable)
            _citable = CDSManager.get().getCitable(this.getCitableURI(), this.getContainer());

        return _citable;
    }
}
