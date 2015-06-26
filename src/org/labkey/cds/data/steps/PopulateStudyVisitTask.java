package org.labkey.cds.data.steps;

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.util.DateUtil;

import java.util.Arrays;
import java.util.Map;

public class PopulateStudyVisitTask extends AbstractPopulateTask
{
    @Override
    protected void populate(Logger logger) throws PipelineJobException
    {
        SQLFragment sql;
        BatchValidationException errors = new BatchValidationException();

        // populate cohorts
        QuerySchema sourceSchema;
        TableInfo sourceTable;

        QuerySchema targetSchema;
        TableInfo targetTable;

        QueryUpdateService targetService;
        Map<String, Object>[] rows;

        logger.info("Starting visit management.");
        long start = System.currentTimeMillis();
        for (Container container : project.getChildren())
        {
            sourceSchema = DefaultSchema.get(user, container).getSchema("study");

            if (sourceSchema == null)
                throw new PipelineJobException("Unable to find study schema for folder " + container.getPath());

            targetSchema = DefaultSchema.get(user, container).getSchema("cds");

            if (targetSchema == null)
                throw new PipelineJobException("Unable to find cds schema for folder " + container.getPath());

            sourceTable = sourceSchema.getTable("ds_studygroup");
            targetTable = targetSchema.getTable("studygroup");

            targetService = targetTable.getUpdateService();

            if (targetService == null)
                throw new PipelineJobException("Unable to find update service for study.cohort in folder " + container.getPath());

            //
            // Delete Study Groups
            //
            try
            {
                targetService.truncateRows(user, container, null, null);
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
            // Insert Study Groups
            //
            sql = new SQLFragment("SELECT * FROM ").append(sourceTable).append(" WHERE prot = ?");
            sql.add(container.getName());

            rows = new SqlSelector(sourceTable.getSchema(), sql).getMapArray();
            if (rows.length > 0)
            {
                try
                {
                    targetService.insertRows(user, container, Arrays.asList(rows), errors, null, null);
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

            //
            // Update Visits
            //
            sourceTable = sourceSchema.getTable("ds_visit");
            targetTable = sourceSchema.getTable("visit");
            targetService = targetTable.getUpdateService();

            if (targetService == null)
                throw new PipelineJobException("Unable to find update service for study.visit in folder " + container.getPath());

            sql = new SQLFragment("SELECT * FROM ").append(sourceTable).append(" WHERE prot = ?");
            sql.add(container.getName());

            rows = new SqlSelector(sourceTable.getSchema(), sql).getMapArray();
            if (rows.length > 0)
            {
                try
                {
                    targetService.insertRows(user, container, Arrays.asList(rows), errors, null, null);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(), e);
                }
            }

            //
            // Populate Study Group Visit Map (Schedule)
            //
            sourceTable = sourceSchema.getTable("ds_studygroupvisit");
            targetTable = targetSchema.getTable("studygroupvisitmap");
            targetService = targetTable.getUpdateService();

            if (targetService == null)
                throw new PipelineJobException("Unable to find update service for cds.studygroupvisitmap in folder " + container.getPath());

            sql = new SQLFragment("SELECT * FROM ").append(sourceTable).append(" WHERE prot = ?");
            sql.add(container.getName());

            rows = new SqlSelector(sourceTable.getSchema(), sql).getMapArray();
            if (rows.length > 0)
            {
                try
                {
                    targetService.insertRows(user, container, Arrays.asList(rows), errors, null, null);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(), e);
                }
            }
        }

        //
        // Populate Visit Tags (Project level only)
        //
        sourceSchema = DefaultSchema.get(user, project).getSchema("study");

        if (sourceSchema == null)
            throw new PipelineJobException("Unable to find study schema for project " + project.getPath());

        sourceTable = sourceSchema.getTable("ds_visittag");
        targetTable = sourceSchema.getTable("visittag");
        targetService = targetTable.getUpdateService();

        if (targetService == null)
            throw new PipelineJobException("Unable to find update service for cds.visittag in project " + project.getPath());

        sql = new SQLFragment("SELECT * FROM ").append(sourceTable);

        rows = new SqlSelector(sourceTable.getSchema(), sql).getMapArray();
        if (rows.length > 0)
        {
            try
            {
                targetService.insertRows(user, project, Arrays.asList(rows), errors, null, null);
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

        //
        // Populate Visit Tag Map
        //
        for (Container container : project.getChildren())
        {
            sourceSchema = DefaultSchema.get(user, container).getSchema("study");

            if (sourceSchema == null)
                throw new PipelineJobException("Unable to find study schema for folder " + container.getPath());

            targetSchema = DefaultSchema.get(user, container).getSchema("cds");

            if (targetSchema == null)
                throw new PipelineJobException("Unable to find cds schema for folder " + container.getPath());

            sourceTable = sourceSchema.getTable("ds_visittagmap");
            targetTable = targetSchema.getTable("visittagmap");
            targetService = targetTable.getUpdateService();

            if (targetService == null)
                throw new PipelineJobException("Unable to find update service for cds.visittagmap in folder " + container.getPath());

            sql = new SQLFragment("SELECT * FROM ").append(sourceTable).append(" WHERE prot = ?");
            sql.add(container.getName());

            rows = new SqlSelector(sourceTable.getSchema(), sql).getMapArray();
            if (rows.length > 0)
            {
                try
                {
                    targetService.insertRows(user, container, Arrays.asList(rows), errors, null, null);
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

        long finish = System.currentTimeMillis();

        logger.info("Visit management took " + DateUtil.formatDuration(finish - start) + ".");
    }
}
