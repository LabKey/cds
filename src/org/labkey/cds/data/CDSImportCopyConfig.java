/*
 * Copyright (c) 2015-2023 LabKey Corporation
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
package org.labkey.cds.data;

import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.UpdateableTableInfo;
import org.labkey.api.dataiterator.CopyConfig;
import org.labkey.api.dataiterator.DataIteratorBuilder;
import org.labkey.api.dataiterator.DataIteratorContext;
import org.labkey.api.dataiterator.Pump;
import org.labkey.api.dataiterator.ResultSetDataIterator;
import org.labkey.api.dataiterator.StandardDataIteratorBuilder;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.util.FileUtil;

import java.io.File;
import java.io.IOException;
import java.sql.ResultSet;

public abstract class CDSImportCopyConfig extends CopyConfig
{
    public abstract String getFileExtension();
    public abstract DataIteratorBuilder getTabLoader(File file) throws IOException;

    private final String _fileName;
    QueryUpdateService.InsertOption _option = QueryUpdateService.InsertOption.IMPORT;

    CDSImportCopyConfig(String sourceSchema, String source, String targetSchema, String target, String fileName)
    {
        super(sourceSchema, source, targetSchema, target);
        _fileName = fileName;
    }

    public DataIteratorBuilder selectFromSource(Container container, User user, DataIteratorContext context,
                                         @Nullable File dir, Logger log) throws IOException
    {
        if (null == dir)
        {
            QuerySchema sourceSchema = DefaultSchema.get(user, container, this.getSourceSchema());
            if (null == sourceSchema)
            {
                context.getErrors().addRowError(new ValidationException("Could not find source schema: " + this.getSourceSchema()));
                return null;
            }
            String sql = getSourceQuery().startsWith("SELECT") ? getSourceQuery() : "SELECT * FROM " + getSourceQuery();
            ResultSet rs = QueryService.get().select(sourceSchema, sql);
            return new DataIteratorBuilder.Wrapper(ResultSetDataIterator.wrap(rs, context));
        }
        else
        {
            File file = getByExtension(dir, getFileExtension(), ".txt");
            if (null == file || !file.exists())
            {
                context.getErrors().addRowError(new ValidationException("Could not find data file: \'" + _fileName + "\' (" + getFileExtension() + ", .txt)."));
                return null;
            }

            if (file.length() == 0)
                return null;

            return getTabLoader(file);
        }
    }

    public int copyFrom(Container c, User u, DataIteratorContext context, DataIteratorBuilder from)
            throws BatchValidationException
    {
        assert this.getTargetSchema().size()==1;
        context.setInsertOption(_option);
        DbSchema targetSchema = DbSchema.get(this.getTargetSchema().getName());
        TableInfo targetTableInfo = targetSchema.getTable(getTargetQuery());
        return copy(context, from, targetTableInfo, c, u);
    }

    // Like DataIteratorUtil.copy, but with cancel support
    static int copy(final DataIteratorContext context, DataIteratorBuilder from, TableInfo to, Container c, User user)
    {
        StandardDataIteratorBuilder etl = StandardDataIteratorBuilder.forInsert(to, from, c, user, context);
        DataIteratorBuilder insert = ((UpdateableTableInfo)to).persistRows(etl, context);
        Pump pump = new Pump(insert, context);
        pump.run();
        return pump.getRowCount();
    }

    @Nullable
    public File getByExtension(File dir, String... extensions)
    {
        File file = null;
        for (String ext : extensions)
        {
            String fileName = _fileName + ext;
            file = FileUtil.getAbsoluteCaseSensitiveFile(new File(dir, fileName));
            if (file.exists() && file.getName().equals(fileName))
                break;
        }
        return file;
    }
}
