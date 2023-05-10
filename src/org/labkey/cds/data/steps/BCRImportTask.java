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

package org.labkey.cds.data.steps;

import org.labkey.cds.data.CDSImportCopyConfig;
import org.labkey.cds.data.CSVCopyConfig;

public class BCRImportTask extends ImportTask
{
    private static CDSImportCopyConfig[] bcrTables = new CDSImportCopyConfig[]
    {
        // .csv source file names which have the same target table names
        // order matters due to FKs
        new CSVCopyConfig("sequence"),
        new CSVCopyConfig("run_log"),
        new CSVCopyConfig("allele_sequence"),
        new CSVCopyConfig("sequence_header"),
        new CSVCopyConfig("sequence_germline"),
        new CSVCopyConfig("antibody_sequence"),
        new CSVCopyConfig("alignment"),
        new CSVCopyConfig("antibody_class"),
        new CSVCopyConfig("preferred_allele")
    };

    @Override
    protected CDSImportCopyConfig[] getImportCopyConfig()
    {
        return bcrTables;
    }
}
