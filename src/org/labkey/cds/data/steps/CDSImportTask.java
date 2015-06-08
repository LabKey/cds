package org.labkey.cds.data.steps;

import org.apache.log4j.Logger;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.etl.DataIteratorBuilder;
import org.labkey.api.etl.DataIteratorContext;
import org.labkey.api.pipeline.PipeRoot;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.PipelineService;
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
    private static final String PIPELINE_TOKEN = "{pipeline}";

    private static CDSImportCopyConfig[] dataspaceTables = new CDSImportCopyConfig[]
    {
        // Core Tables
        new TSVCopyConfig("Study"),
        new TSVCopyConfig("Product"),
//        new TSVCopyConfig("Personnel"),
//        new TSVCopyConfig("Site"),
//        new TSVCopyConfig("Lab"),

        // Dependent Tables
//        new TSVCopyConfig("StudyPersonnel"),
//        new TSVCopyConfig("StudySiteFunction"),
//        new TSVCopyConfig("ProductInsert"),
        new TSVCopyConfig("StudyPartGroupArm"),
        new TSVCopyConfig("StudyPartGroupArmVisit"),
//        new TSVCopyConfig("StudyPartGroupArmVisitTag"),
//        new TSVCopyConfig("StudyPartGroupArmVisitProduct"),

        // Mapping Tables
        new TSVCopyConfig("StudyProduct"),
        new TSVCopyConfig("StudySubjectArm"),
//        new TSVCopyConfig("StudySitePersonnel"),

        // Datasets
        new TSVCopyConfig("StudySubject"), // a.k.a Demographics, SubjectCharacteristics
        new TSVCopyConfig("ICS"),
        new TSVCopyConfig("ELS_IFNg"),
        new TSVCopyConfig("NAB"),
        new TSVCopyConfig("BAMA")
    };

    @Override
    public RecordedActionSet run(Logger logger) throws PipelineJobException
    {
        String dir = settings.get(DIRECTORY);

        if (dir.contains(PIPELINE_TOKEN))
        {
            PipeRoot pipelineRoot = PipelineService.get().getPipelineRootSetting(containerUser.getContainer());
            if (null != pipelineRoot)
            {
                dir = dir.replace(PIPELINE_TOKEN, pipelineRoot.getRootPath().getPath());
            }
            else
            {
                throw new PipelineJobException(PIPELINE_TOKEN + " was found in the path but the pipeline root has not been establised for folder: " + containerUser.getContainer().getPath());
            }
        }

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
        boolean truncateSuccessful = executeTruncate(configs, logger);

        if (truncateSuccessful)
        {
            for (CDSImportCopyConfig config : configs)
            {
                executeCopy(config, dir, logger);
            }
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


    private boolean executeTruncate(CDSImportCopyConfig[] configs, Logger logger)
    {
        logger.info("Initiating truncate for supplied copy configurations.");

        if (configs != null && configs.length > 0)
        {
            SQLFragment sql = new SQLFragment("TRUNCATE ");
            String sep = "";
            String info = "Truncating ";
            String schemaName = configs[0].getTargetSchema().getName();

            // reverse order, without mutating
            for (int i = configs.length-1; i >= 0; i--)
            {
                CDSImportCopyConfig config = configs[i];
                String table = config.getTargetSchema() + "." + config.getTargetQuery();
                sql.append(sep).append(table);

                info += sep + table;
                sep = ", ";
            }
            sql.append(" CASCADE;");

            logger.info(info);

            DbSchema targetSchema = DbSchema.get(schemaName);
            try (DbScope.Transaction tx = targetSchema.getScope().ensureTransaction())
            {
                SqlExecutor executor = new SqlExecutor(targetSchema);

                long start = System.currentTimeMillis();

                executor.execute(sql);
                tx.commit();

                long finish = System.currentTimeMillis();

                logger.info("Truncated tables in " + DateUtil.formatDuration(finish - start) + ".");
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
        }

        return true;
    }
}
