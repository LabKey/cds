package org.labkey.cds.data;

import org.apache.log4j.Logger;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.etl.DataIteratorBuilder;
import org.labkey.api.etl.DataIteratorContext;
import org.labkey.api.query.ValidationException;
import org.labkey.api.reader.TabLoader;
import org.labkey.api.security.User;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.SQLException;

public class TSVCopyConfig extends CDSImportCopyConfig
{
    String tsvFileName;


    public TSVCopyConfig(String table, String fileName)
    {
        super("#TSV#", table, "cds", "import_" + table);
        tsvFileName = fileName;
    }


    public TSVCopyConfig(String table)
    {
        this(table, table);
    }


    @Override
    public DataIteratorBuilder selectFromSource(Container container, User user, DataIteratorContext context, @Nullable File dir, Logger log) throws SQLException, IOException
    {
        if (null == dir)
            return super.selectFromSource(container, user, context, dir, log);

        File tsvFile = getByExtension(dir, ".tsv", ".txt");
        if (null == tsvFile || !tsvFile.exists())
        {
            context.getErrors().addRowError(new ValidationException("Could not find data file: \'" + tsvFileName + "\' (.tsv, .txt)."));
            return null;
        }

        if (tsvFile.length() == 0)
            return null;

        TabLoader tabLoader = (TabLoader) new TabLoader.TsvFactory().createLoader(new FileInputStream(tsvFile), true);
        tabLoader.setInferTypes(false);
        return tabLoader;
    }


    @Nullable
    private File getByExtension(File dir, String... extensions)
    {
        File file = null;

        for (String ext : extensions)
        {
            file = new File(dir, tsvFileName + ext);
            if (file.exists())
                break;
        }

        return file;
    }
}