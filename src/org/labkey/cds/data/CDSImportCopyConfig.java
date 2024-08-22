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
import org.labkey.api.reader.DataLoaderFactory;
import org.labkey.api.reader.DataLoaderService;
import org.labkey.api.security.User;
import org.labkey.api.util.FileUtil;

import java.io.File;
import java.io.IOException;
import java.sql.ResultSet;
import java.util.List;

public class CDSImportCopyConfig extends CopyConfig
{
    private final String _fileName;
    private File _importFile;
    private static final List<String> VALID_EXTENSIONS = List.of(".xls", ".xlsx", ".csv", ".tsv", ".txt");

    QueryUpdateService.InsertOption _option = QueryUpdateService.InsertOption.IMPORT;

    /**
     * Constructor which imports a text file into a table in the CDS schema.
     * @param targetQuery the target table
     * @param fileName the name of the file, without the extension
     */
    public CDSImportCopyConfig(String targetQuery, String fileName)
    {
        super(null, null, "cds", targetQuery);
        _fileName = fileName;
    }

    /**
     * Constructor which imports a text file into a table (of the same name) in the CDS schema.
     * @param fileName the name of the file, without the extension
     */
    public CDSImportCopyConfig(String fileName)
    {
        super(null, null, "cds", fileName);
        _fileName = fileName;
    }

    public File getImportFile()
    {
        return _importFile;
    }

    private DataIteratorBuilder getDataLoader(File file) throws IOException
    {
        DataLoaderFactory factory = DataLoaderService.get().findFactory(file, null);
        return factory.createLoader(file, true);
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
            _importFile = getImportFile(dir);
            if (null == _importFile || !_importFile.exists())
            {
                context.getErrors().addRowError(new ValidationException("Could not find data file: '" + _fileName + "' (xls, xlsx, csv, tsv, txt)."));
                return null;
            }

            if (_importFile.length() == 0)
                return null;

            return getDataLoader(_importFile);
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
    private File getImportFile(File dir)
    {
        File file = null;
        for (String ext : VALID_EXTENSIONS)
        {
            String fileName = _fileName + ext;
            file = FileUtil.getAbsoluteCaseSensitiveFile(new File(dir, fileName));
            if (file.exists() && file.getName().equals(fileName))
                break;
        }
        return file;
    }
}
