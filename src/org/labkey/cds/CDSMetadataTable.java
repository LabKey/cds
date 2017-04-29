package org.labkey.cds;

import org.labkey.api.data.TableInfo;
import org.labkey.api.query.SimpleUserSchema;

/**
 * Created by xingyang on 4/28/17.
 */
public class CDSMetadataTable extends SimpleUserSchema.SimpleTable<SimpleUserSchema>
{
    public CDSMetadataTable(SimpleUserSchema schema, TableInfo table)
    {
        super(schema, table);

        setContainerFilter(new CDSMetadataContainerFilter(schema.getUser()));
    }
}
