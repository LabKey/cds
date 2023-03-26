/*
 * Copyright (c) 2023 LabKey Corporation
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

import org.labkey.api.dataiterator.DataIteratorBuilder;
import org.labkey.api.reader.TabLoader;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

public class TSVCopyConfig extends CDSImportCopyConfig
{
    public TSVCopyConfig(String table, String fileName)
    {
        super("#TSV#", table, "cds", "import_" + table, fileName);
    }

    public TSVCopyConfig(String table)
    {
        this(table, table);
    }

    @Override
    public String getFileExtension()
    {
        return ".tsv";
    }

    @Override
    public DataIteratorBuilder getTabLoader(File file) throws IOException
    {
        TabLoader tabLoader = (TabLoader) new TabLoader.TsvFactory().createLoader(new FileInputStream(file), true);
        tabLoader.setInferTypes(false);
        return tabLoader;
    }
}
