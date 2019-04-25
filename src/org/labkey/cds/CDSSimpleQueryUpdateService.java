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

import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.SimpleQueryUpdateService;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * User: markigra
 * Date: 3/11/12
 * Time: 9:36 PM
 */
public class CDSSimpleQueryUpdateService extends SimpleQueryUpdateService implements QueryUpdateService
{
    Container _container;

    public CDSSimpleQueryUpdateService(Container container, final SimpleUserSchema.SimpleTable queryTable, TableInfo dbTable)
    {
        super(queryTable, dbTable);
        _container = container;
    }

    @Override
    protected Object[] getKeys(Map<String, Object> map, Container container) throws InvalidKeyException
    {
        //Since many of our tables fake a single column primary key but actually have a compound key including container,
        //we need to ensure the container is in the key set if necessary.
        //Still rely on super.getKeys() for impl
        TableInfo table = getDbTable();
        List<ColumnInfo> pks = table.getPkColumns();
        for (ColumnInfo pkCol : pks)
        {
            if ("container".equalsIgnoreCase(pkCol.getName()))
            {
                if (null == map.get(pkCol.getName()))
                {
                    map = new CaseInsensitiveHashMap<>(map);
                    map.put(pkCol.getName(), _container.getId());
                }
                break;
            }
        }
        return super.getKeys(map, container);
    }
}
