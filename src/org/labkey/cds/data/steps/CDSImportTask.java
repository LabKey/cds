package org.labkey.cds.data.steps;

import org.apache.log4j.Logger;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.etl.DataIteratorBuilder;
import org.labkey.api.etl.DataIteratorContext;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.RecordedActionSet;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.util.DateUtil;
import org.labkey.cds.data.CDSImportCopyConfig;
import org.labkey.cds.data.TSVCopyConfig;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;

public class CDSImportTask extends TaskRefTaskImpl
{
    private static final String DIRECTORY = "directory";

    private static CDSImportCopyConfig[] dataspaceTables = new CDSImportCopyConfig[]
    {
        // Core Tables
        new TSVCopyConfig("Study"),
        new TSVCopyConfig("Product"),
        new TSVCopyConfig("Personnel"),
        new TSVCopyConfig("Site"),
        new TSVCopyConfig("Lab"),

        // Dependent Tables
        new TSVCopyConfig("StudyTreatmentArm"),
        new TSVCopyConfig("StudyPersonnel"),
        new TSVCopyConfig("StudySiteFunction"),
        new TSVCopyConfig("ProductInsert"),
        new TSVCopyConfig("StudyArmVisit"),
        new TSVCopyConfig("StudyArmVisitTag"),
        new TSVCopyConfig("StudyArmVisitProduct"),

        // Mapping Tables
        new TSVCopyConfig("StudyProduct"),
        new TSVCopyConfig("StudySitePersonnel"),

        // Datasets
        new TSVCopyConfig("Demographic"),
        new TSVCopyConfig("ICS"),
        new TSVCopyConfig("ELISpot"),
        new TSVCopyConfig("NAb"),
        new TSVCopyConfig("BAMA")
    };

    @Override
    public RecordedActionSet run(Logger logger) throws PipelineJobException
    {
        String dir = settings.get(DIRECTORY);

        try
        {
            execute(dataspaceTables, new File(dir), logger);
        }
        catch (SQLException | IOException x)
        {
            logger.error("Unexpected exception", x);
        }

        return new RecordedActionSet(makeRecordedAction());
    }

    @Override
    public List<String> getRequiredSettings()
    {
        return Arrays.asList(DIRECTORY);
    }

    private void execute(CDSImportCopyConfig[] configs, @Nullable File dir, Logger logger) throws IOException, SQLException, PipelineJobException
    {
        for (CDSImportCopyConfig config : configs)
        {
            executeCopy(config, dir, logger);
        }
    }

    private boolean executeCopy(CDSImportCopyConfig config, @Nullable File dir, Logger logger) throws IOException, SQLException
    {
        User user = containerUser.getUser();
        Container container = containerUser.getContainer();

        DbSchema targetSchema = DbSchema.get(config.getTargetSchema().getName());

        DataIteratorContext context = new DataIteratorContext();
        context.setInsertOption(QueryUpdateService.InsertOption.IMPORT);
        context.setFailFast(true);

        assert !targetSchema.getScope().isTransactionActive();
        try (DbScope.Transaction tx = targetSchema.getScope().ensureTransaction())
        {
            long start = System.currentTimeMillis();
            DataIteratorBuilder source = config.selectFromSource(container, user, context, dir, logger);

            if (null != source)
            {
                if (null == dir)
                {
                    logger.info("Copying data from " + config.getSourceSchema() + "." + config.getSourceQuery() + " to " +
                            config.getTargetSchema() + "." + config.getTargetQuery());
                }
                else
                {
                    logger.info("Copying data from " + dir.toString() + " to " +
                            config.getTargetSchema() + "." + config.getTargetQuery());
                }

                int count = config.copyFrom(container, user, context, source);

                tx.commit();

                long finish = System.currentTimeMillis();
                if (!context.getErrors().hasErrors())
                    logger.info("Copied " + count + " row" + (count != 1 ? "s" : "") + " in " + DateUtil.formatDuration(finish - start) + ".");
            }
        }
        catch (BatchValidationException x)
        {
            assert x == context.getErrors();
            /* fall through */
        }
        catch (Exception x)
        {
            logger.error(null == x.getMessage() ? x.toString() : x.getMessage());
            return false;
        }
        finally
        {
            assert !targetSchema.getScope().isTransactionActive();
        }

        if (context.getErrors().hasErrors())
        {
            for (ValidationException v : context.getErrors().getRowErrors())
            {
                String msg = v.getMessage();
                logger.error(msg);
            }
            return false;
        }
        return true;
    }

}
