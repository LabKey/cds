/*
 * Copyright (c) 2015 LabKey Corporation
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

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.Logger;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.ValidationException;
import org.labkey.api.util.DateUtil;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class PopulateStudyReportTask extends AbstractPopulateTask
{
    @Override
    protected void populate(Logger logger) throws PipelineJobException
    {
        long start = System.currentTimeMillis();

        BatchValidationException errors = new BatchValidationException();

        QuerySchema cdsSchema = DefaultSchema.get(user, project).getSchema("cds");

        if (cdsSchema == null)
            throw new PipelineJobException("Unable to find cds schema for folder " + project.getPath());

        TableInfo sourceTable = cdsSchema.getTable("import_studyReport");
        TableInfo targetTable = cdsSchema.getTable("studyReport");

        QueryUpdateService targetService = targetTable.getUpdateService();

        if (targetService == null)
            throw new PipelineJobException("Unable to find update service for cds.studyReport in folder " + project.getPath());

        //
        // Truncate cds.studyReport
        //
        try
        {
            targetService.truncateRows(user, project, null, null);
        }
        catch (Exception e)
        {
            logger.error(e.getMessage(), e);
        }

        if (errors.hasErrors())
        {
            for (ValidationException error : errors.getRowErrors())
            {
                logger.error(error.getMessage());
            }
            return;
        }

        //
        // Identify illegal combination of values
        //
        TableSelector source_ts = new TableSelector(sourceTable);

        for (Map<String, Object> stringObjectMap : source_ts.getMapArray())
        {
            Integer reportId = (Integer) stringObjectMap.get("cds_report_id");
            String reportLink = (String) stringObjectMap.get("cds_report_link");
            String reportLabel = (String) stringObjectMap.get("cds_report_label");

            // providing both an id and URL is illegal - we won't know which to render
            if (null != reportId && StringUtils.isNotBlank(reportLink))
            {
                String msg = "Illegal combination: Both Report Id '" + reportId + "' and Report Link '" + reportLink + "' are provided, either Report Id or Report Link is expected.";
                throw new PipelineJobException(msg);
            }

            // URL without a label should be illegal
            if (StringUtils.isNotBlank(reportLink) && StringUtils.isBlank(reportLabel))
            {
                String msg = "Illegal combination: Report Label cannot be blank if Report Link is provided. Please provide a Report Label for Report Link '" + reportLink + "'.";
                throw new PipelineJobException(msg);
            }
        }

        if (source_ts.getRowCount() > 0)
        {
            try
            {
                List<Map<String, Object>> insertedRows = targetService.insertRows(user, project, Arrays.asList(source_ts.getMapArray()), errors, null, null);
                long finish = System.currentTimeMillis();
                logger.info("Inserted " + insertedRows.size() + " rows in cds.studyReport in " + DateUtil.formatDuration(finish - start) + ".");
            }
            catch (Exception e)
            {
                logger.error(e.getMessage(), e);
            }
        }

        if (errors.hasErrors())
        {
            for (ValidationException error : errors.getRowErrors())
            {
                logger.error(error.getMessage());
            }
            return;
        }
    }
}