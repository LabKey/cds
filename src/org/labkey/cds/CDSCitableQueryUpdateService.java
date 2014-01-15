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
package org.labkey.cds;

import org.apache.commons.lang3.StringUtils;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.cds.model.CitableAuthor;

import java.sql.SQLException;
import java.util.Map;

/**
 * User: markigra
 * Date: 6/22/12
 * Time: 5:01 PM
 */
public class CDSCitableQueryUpdateService extends CDSSimpleQueryUpdateService
{
    public CDSCitableQueryUpdateService(Container container, final SimpleUserSchema.SimpleTable queryTable, TableInfo dbTable)
    {
        super(container, queryTable, dbTable);
    }

    @Override
    protected Map<String, Object> insertRow(User user, Container container, Map<String, Object> row) throws DuplicateKeyException, ValidationException, QueryUpdateServiceException, SQLException
    {
        Map<String, Object> newRow = super.insertRow(user, container, row);
        insertCitableAuthors(user, container, row);
        return newRow;
    }

    @Override
    protected Map<String, Object> updateRow(User user, Container container, Map<String, Object> row, Map<String, Object> oldRow) throws InvalidKeyException, ValidationException, QueryUpdateServiceException, SQLException
    {
        Map<String, Object> newRow =  super.updateRow(user, container, row, oldRow);
        deleteCitableAuthors(user, container, oldRow);
        insertCitableAuthors(user, container, row);
        return newRow;
    }

    @Override
    protected Map<String, Object> deleteRow(User user, Container container, Map<String, Object> oldRowMap) throws InvalidKeyException, QueryUpdateServiceException, SQLException
    {
        return super.deleteRow(user, container, oldRowMap);
    }

    private void deleteCitableAuthors(User user, Container container, Map<String, Object> row) throws SQLException
    {
        SimpleFilter filter = SimpleFilter.createContainerFilter(container);
        filter.addCondition(FieldKey.fromParts("CitableURI"), row.get("URI"));
        Table.delete(CDSSchema.getTableInfoCitableAuthors(), filter);
    }

    private void insertCitableAuthors(User user, Container container, Map<String, Object> row) throws SQLException
    {
        if (null != row.get("Authors"))
        {
            String[] authorIds = StringUtils.split((String) row.get("Authors"), ",");
            for (int i = 0; i < authorIds.length; i++)
                authorIds[i] = authorIds[i].trim();

            int sortIndex = 0;
            for (String authorId : authorIds)
            {
                CDSManager.get().ensurePerson(authorId, container, user);
                CitableAuthor citableAuthor = new CitableAuthor();
                citableAuthor.setAuthorId(authorId);
                citableAuthor.setCitableURI((String) row.get("URI"));
                citableAuthor.setContainer(container);
                citableAuthor.setSortIndex(sortIndex++);
                Table.insert(user, CDSSchema.getTableInfoCitableAuthors(), citableAuthor);
            }
        }

    }
}
