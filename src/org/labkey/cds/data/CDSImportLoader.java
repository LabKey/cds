package org.labkey.cds.data;

import org.apache.log4j.Logger;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.etl.DataIteratorBuilder;
import org.labkey.api.etl.DataIteratorContext;
import org.labkey.api.pipeline.CancelledException;
import org.labkey.api.pipeline.PipelineJob;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.PipelineService;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.util.DateUtil;
import org.labkey.api.util.ExceptionUtil;
import org.labkey.api.util.FileUtil;
import org.labkey.api.util.URLHelper;
import org.labkey.api.view.ViewBackgroundInfo;
import org.springframework.dao.DataAccessException;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;

public class CDSImportLoader extends PipelineJob
{
    static Logger _log = Logger.getLogger(CDSImportLoader.class);

    static DataspaceCopyConfig[] dataspaceTables = new DataspaceCopyConfig[]
    {
        // Core Tables
        new DataspaceCopyConfig.TSVCopyConfig("Study"),

        // Datasets
        new DataspaceCopyConfig.TSVCopyConfig("Demographic"),
        new DataspaceCopyConfig.TSVCopyConfig("ICS")
    };

    //
    // PipelineJob
    //
    final String _archive;

    public CDSImportLoader(Container container, User user, String archive)
    {
        super("Dataspace", new ViewBackgroundInfo(container, user, null), PipelineService.get().getPipelineRootSetting(container));
        _archive = archive;
        setLogFile(new File(new File(archive).getParentFile(), FileUtil.makeFileNameWithTimestamp("dataspace", "log")));
    }


    @Override
    public void run()
    {
        try
        {
            _run();
        }
        catch (CancelledException e)
        {
            setStatus(TaskStatus.cancelled);
        }
        catch (RuntimeException|Error e)
        {
            setStatus(TaskStatus.error);
            ExceptionUtil.logExceptionToMothership(null, e);
            // Rethrow to let the standard Mule exception handler fire and deal with the job state
            throw e;
        }
    }


    public void _run()
    {
        if (checkInterrupted())
            throw new CancelledException();
        setStatus(TaskStatus.running, "Starting Dataspace import");
        loadFromArchive();
        if (checkInterrupted())
            throw new CancelledException();
        setStatus(PipelineJob.TaskStatus.complete);
    }


    public void loadFromArchive()
    {
        try
        {
//            Path path = FileSystems.getDefault().getPath(_archive);
//            FileSystem system = FileSystems.newFileSystem(path, null);
//            FileSystem system = FileSystems.getDefault().getPath(_archive).getFileSystem();
//            FileSystem system = FileSystems.newFileSystem(URI.create(_archive), new HashMap<String, Object>());
            execute(dataspaceTables, new File(_archive));
        }
        catch (IOException |SQLException |PipelineJobException x)
        {
            error("Unexpected exception", x);
        }
    }


    public void execute(DataspaceCopyConfig[] configs, @Nullable File dir) throws IOException, SQLException, PipelineJobException
    {
        for (DataspaceCopyConfig config : configs)
        {
            if (checkInterrupted())
                throw new CancelledException();
            try
            {
                setStatus(TaskStatus.running, "COPY to " + config.getTargetQuery());
                executeCopy(config, dir);
            }
            catch (SQLException | DataAccessException x)
            {
                error("copying to " + config.getTargetQuery() + "\n\t" + x.getMessage());
            }
        }
    }

    public boolean executeCopy(DataspaceCopyConfig config, @Nullable File dir) throws IOException, SQLException
    {
        DbSchema targetSchema = DbSchema.get(config.getTargetSchema().getName());

        DataIteratorContext context = new DataIteratorContext();
        context.setInsertOption(QueryUpdateService.InsertOption.IMPORT);
        context.setFailFast(true);

        assert !targetSchema.getScope().isTransactionActive();
        try (DbScope.Transaction tx = targetSchema.getScope().ensureTransaction())
        {
            long start = System.currentTimeMillis();
            DataIteratorBuilder source = config.selectFromSource(this, context, dir, getLogger());

            if (null != source)
            {
                if (null == dir)
                {
                    info("Copying data from " + config.getSourceSchema() + "." + config.getSourceQuery() + " to " +
                            config.getTargetSchema() + "." + config.getTargetQuery());
                }
                else
                {
                    info("Copying data from " + dir.toString() + " to " +
                            config.getTargetSchema() + "." + config.getTargetQuery());
                }

//                if (config instanceof ImmPortCopyConfig)
//                {
//                    if (((ImmPortCopyConfig)config).file.startsWith("lk_"))
//                    {
//
//                        CaseInsensitiveHashMap<String> values = new CaseInsensitiveHashMap<>();
//                        _lookupDictionary.put(((ImmPortCopyConfig)config).file,values);
//                        source = new CollectLookups(source,values);
//                    }
//                    else if (((ImmPortCopyConfig)config).file.equals("experiment"))
//                    {
//                        source = new FixLookups(source,"purpose",_lookupDictionary.get("lk_experiment_purpose"));
//                    }
//                }

                int count = config.copyFrom(getContainer(), getUser(), context, source, this);

                tx.commit();

                long finish = System.currentTimeMillis();
                if (!context.getErrors().hasErrors())
                    info("Copied " + count + " row" + (count != 1 ? "s" : "") + " in " + DateUtil.formatDuration(finish - start) + ".");
            }
        }
        catch (BatchValidationException x)
        {
            assert x == context.getErrors();
            /* fall through */
        }
        catch (Exception x)
        {
            error(null == x.getMessage() ? x.toString() : x.getMessage());
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
                error(msg);
            }
            return false;
        }
        return true;
    }

//    public void executeDefineProtocols(CopyConfig[] configs, @Nullable File dir) throws IOException, SQLException
//    {
//        DataIteratorContext dix = new DataIteratorContext();
//        DataspaceCopyConfig.TSVCopyConfig tsvCC = new DataspaceCopyConfig.TSVCopyConfig("protocols");
//        DataIterator di = tsvCC.selectFromSource(this, dix, dir, getLogger()).getDataIterator(dix);
//
//        Set<String> studies = new TreeSet<>();
//
//        try
//        {
//            while (di.next())
//            {
//                String study = (String) di.get(1);
//                studies.add(study);
//            }
//        }
//        catch (Exception x)
//        {
//
//        }
//
//        if (getContainer().isProject() && getContainer().getFolderType().equals(ModuleLoader.getInstance().getFolderType(StudyService.DATASPACE_FOLDERTYPE_NAME)))
//        {
//            // Clear out old studies
//            for (Container container : getContainer().getChildren())
//            {
//                ContainerManager.delete(container, getUser());
//            }
//
//            // Declare Datasets in Project
////            StudyService.get().defineDatasets(getContainer(), getUser(), this, new FileSystemFile(new File("C:/code/labkey/trunk/build/deploy/modules/cds/schemas/study")));
//
//            FolderType folderType = ModuleLoader.getInstance().getFolderType("Study");
//
//            // Declare new studies
//            for (String studyName : studies)
//            {
//                Container c = ContainerManager.createContainer(getContainer(), studyName, null, null, Container.TYPE.normal, getUser());
//                c.setFolderType(folderType, getUser());
//                StudyService.get().createStudy(c, getUser(), studyName, TimepointType.DATE, false);
//            }
//        }
//    }


    @Override
    public URLHelper getStatusHref()
    {
        return null;
    }


    @Override
    public String getDescription()
    {
        return "Load Dataspace archive";
    }
}
