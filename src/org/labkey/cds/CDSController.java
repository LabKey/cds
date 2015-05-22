/*
 * Copyright (c) 2014-2015 LabKey Corporation
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

package org.labkey.cds;


import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.action.Action;
import org.labkey.api.action.ActionType;
import org.labkey.api.action.ApiAction;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.BaseViewAction;
import org.labkey.api.action.FormViewAction;
import org.labkey.api.action.HasBindParameters;
import org.labkey.api.action.Marshal;
import org.labkey.api.action.Marshaller;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.NullSafeBindException;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.ColumnHeaderType;
import org.labkey.api.data.Container;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.ExcelWriter;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.pipeline.PipelineUrls;
import org.labkey.api.query.QueryForm;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryView;
import org.labkey.api.query.UserSchema;
import org.labkey.api.rss.RSSFeed;
import org.labkey.api.rss.RSSService;
import org.labkey.api.security.IgnoresTermsOfUse;
import org.labkey.api.security.RequiresLogin;
import org.labkey.api.security.RequiresNoPermission;
import org.labkey.api.security.RequiresPermissionClass;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.study.Dataset;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.util.URLHelper;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.HtmlView;
import org.labkey.api.view.HttpView;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.template.PageConfig;
import org.labkey.cds.model.Citable;
import org.labkey.cds.model.CitableAuthor;
import org.labkey.cds.model.Citation;
import org.labkey.cds.view.template.ConnectorTemplate;
import org.springframework.beans.PropertyValue;
import org.springframework.beans.PropertyValues;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;



public class CDSController extends SpringActionController
{
    static
    {
        try
        {
            Class.forName("org.labkey.query.jdbc.QueryDriver");
        }
        catch (ClassNotFoundException x)
        {
            ;
        }
    }

    private static final Logger LOG = Logger.getLogger(CDSController.class);

    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(CDSController.class);

    public CDSController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermissionClass(ReadPermission.class)
    public class BeginAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            return new JspView("/org/labkey/cds/view/begin.jsp");
        }

        public NavTree appendNavTrail(NavTree root)
        {
            return root.addChild("Dataspace Management");
        }
    }

    @RequiresPermissionClass(ReadPermission.class)
    public class NewsAction extends SimpleViewAction
    {
        @Override
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            List<RSSFeed> feeds = RSSService.get().getFeeds(getContainer(), getUser());

            getViewContext().getResponse().setContentType("text/xml");
            RSSService.get().aggregateFeeds(feeds, getViewContext().getResponse().getWriter());

            return null;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return null;
        }
    }

    @RequiresNoPermission
    @IgnoresTermsOfUse
    public class AppAction extends SimpleViewAction
    {
        @Override
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            JspView view = new JspView("/org/labkey/cds/view/app.jsp");

            HttpView template = new ConnectorTemplate(getViewContext(), getContainer(), view, defaultPageConfig(), new NavTree[0]);
            getPageConfig().setTemplate(PageConfig.Template.None);

            return template;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return root;
        }
    }


    void resetCube()
    {
        QueryService.get().cubeDataChanged(getContainer());
    }


    @RequiresPermissionClass(AdminPermission.class)
    public class ClearFactTableAction extends FormViewAction
    {

        @Override
        public void validateCommand(Object target, Errors errors)
        {

        }

        @Override
        public ModelAndView getView(Object o, boolean reshow, BindException errors) throws Exception
        {
            return new JspView("/org/labkey/cds/view/clearFacts.jsp");
        }

        @Override
        public boolean handlePost(Object o, BindException errors) throws Exception
        {
            CDSManager.get().deleteFacts(getContainer());
            resetCube();
            return true;
        }

        @Override
        public URLHelper getSuccessURL(Object o)
        {
            return new ActionURL(BeginAction.class, getContainer());
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            root.addChild("Dataspace Management", new ActionURL(BeginAction.class, getContainer())).addChild("Clear Fact Table");
            return root;
        }
    }


    @RequiresPermissionClass(AdminPermission.class)
    public class PopulateCubeAction extends FormViewAction
    {
        List<FactLoader> _factLoaders = new ArrayList<>();

        @Override
        public void validateCommand(Object target, Errors errors)
        {
            List<String> selectedDatasets = getViewContext().getList("dataset");

            if (null == selectedDatasets || selectedDatasets.size() == 0)
                errors.reject(ERROR_MSG, "No datasets selected");
        }

        @Override
        public ModelAndView getView(Object o, boolean reshow, BindException errors) throws Exception
        {
            return new JspView<>("/org/labkey/cds/view/populateCube.jsp", new PopulateBehavior(null, false), errors);
        }

        @Override
        public boolean handlePost(Object o, BindException errors) throws Exception
        {
            Container c = getContainer();
            User u = getUser();
            List<String> selectedDatasets = getViewContext().getList("dataset");
            UserSchema studySchema = QueryService.get().getUserSchema(u, c, "study");
            StudyService.Service studyService = StudyService.get();

            //
            // Populate fact loaders for each dataset
            //
            for (String dsName : selectedDatasets)
            {
                Dataset dataset = studyService.getDataset(c, studyService.getDatasetIdByName(c, dsName));
                if (null == dataset)
                {
                    errors.reject(ERROR_MSG, "Could not find dataset: '" + dsName + "'. Ensure that this dataset is properly exposed at the project level.");
                    return false;
                }
                _factLoaders.add(new FactLoader(studySchema, dataset, u, c));
            }

            //
            // Add any participants with no assay data to the cube...
            // Should be more robust in finding this dataset
            //
            Dataset demographicsDataset = studyService.getDataset(c, studyService.getDatasetIdByName(c, DemographicsFactLoader.TABLE_NAME));
            if (null == demographicsDataset)
            {
                errors.reject(ERROR_MSG, "Could not find dataset: '" + DemographicsFactLoader.TABLE_NAME + "'. It is required.");
                return false;
            }
            _factLoaders.add(new DemographicsFactLoader(studySchema, demographicsDataset, u, c));

            //
            // We're ready to go, delete old facts and populate the new ones. Then, reset the cube so it picks
            // up new datas!
            //
            CDSManager.get().deleteFacts(c);
            for (FactLoader loader : _factLoaders)
                loader.populateCube();
            resetCube();

            return true;
        }

        @Override
        public ModelAndView getSuccessView(Object o)
        {
            return new JspView<>("/org/labkey/cds/view/populateCubeComplete.jsp", new PopulateBehavior(_factLoaders, false /* isUpdateParticipantGroups */));
        }

        @Override
        public URLHelper getSuccessURL(Object o)
        {
            return null;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return root.addChild("Dataspace Management", new ActionURL(BeginAction.class, getContainer())).addChild("Populate Fact Table");
        }
    }


    public static class PropertiesForm
    {
        private int _rowId = -1;
        private Container _container;
        private int _primaryCount = 0;
        private int _dataCount = 0;

        public int getRowId()
        {
            return _rowId;
        }

        public void setRowId(int rowId)
        {
            _rowId = rowId;
        }

        public int getPrimaryCount()
        {
            return _primaryCount;
        }

        public void setPrimaryCount(int primaryCount)
        {
            _primaryCount = primaryCount;
        }

        public int getDataCount()
        {
            return _dataCount;
        }

        public void setDataCount(int dataCount)
        {
            _dataCount = dataCount;
        }

        public String getContainerId()
        {
            return _container != null ? _container.getId() : "";
        }

        @JsonIgnore
        public Container getContainer()
        {
            return _container;
        }

        public void setContainer(Container container)
        {
            _container = container;
        }
    }

    @RequiresNoPermission
    @Marshal(Marshaller.Jackson)
    public class PropertiesAction extends ApiAction<PropertiesForm>
    {
        @Override
        public Object execute(PropertiesForm form, BindException errors) throws Exception
        {
            Container container = getContainer();
            CDSManager manager = CDSManager.get();
            PropertiesForm model = manager.getProperties(container);

            //
            // Check if the user is attempting to update the values via POST
            //
            if (isPost())
            {
                model = manager.ensureProperties(model, form, container, getUser());
            }

            //
            // If properties have not been set the result could be null, just hand back a
            // default form to the client
            //
            if (model == null)
            {
                model = new PropertiesForm();
            }

            //
            // Generate the reponse by querying for this containers result
            //
            return model;
        }

        @Override
        public ModelAndView handlePost() throws Exception
        {
            return super.handlePost();
        }
    }

    @RequiresPermissionClass(AdminPermission.class)
    public class ResetAction extends SimpleViewAction
    {
        @Override
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            resetCube();
            return new HtmlView("ok");
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return root;
        }
    }


    @RequiresPermissionClass(AdminPermission.class)
    public class UpdateParticipantGroupsAction extends PopulateCubeAction
    {
        @Override
        public ModelAndView getView(Object o, boolean reshow, BindException errors) throws Exception
        {
            return new JspView<>("/org/labkey/cds/view/populateCube.jsp", new PopulateBehavior(null, true), errors);
        }

        @Override
        public ModelAndView getSuccessView(Object o)
        {
            return new JspView<>("/org/labkey/cds/view/populateCubeComplete.jsp", new PopulateBehavior(_factLoaders, true));
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            root.addChild("Dataspace Management", new ActionURL(BeginAction.class, getContainer())).addChild("Update Participant Groups");
            return root;
        }
    }

    public static class GetCitationsForm
    {
        private String[] _root;


        public String[] getRoot()
        {
            return _root;
        }

        public void setRoot(String[] root)
        {
            _root = root;
        }
    }

    @RequiresPermissionClass(ReadPermission.class)
    public class GetCitationsAction extends ApiAction<GetCitationsForm>
    {
        public ApiResponse execute(GetCitationsForm form, BindException errors) throws Exception
        {
            List<Citable> citables = new ArrayList<>();
            for (String uri : form.getRoot())
            {
                Citable citable = CDSManager.get().getCitable(uri, getContainer());
                if (null != citable)
                    citables.add(citable);
            }

            JSONObject root = new JSONObject();
            root.put("status", "OK");
            JSONArray jsonCitables = new JSONArray();
            for (Citable citable : citables)
                jsonCitables.put(jsonCitable(citable, true));

            root.put("citations", jsonCitables);

            return new ApiSimpleResponse(root);
        }

        private JSONObject jsonCitable(Citable citable, boolean includeChildren)
        {
            JSONObject obj = new JSONObject();
            obj.put("URI", citable.getURI());
            obj.put("title", citable.getTitle());
            obj.put("description", citable.getDescription());
            obj.put("link", citable.getLink());

            JSONArray authors = new JSONArray();
            for (CitableAuthor author : citable.getAuthors())
                authors.put(author.getAuthorId());
            obj.put("authors", authors);

            if (includeChildren)
            {
                JSONArray jsonReferences = new JSONArray();
                for (Citation reference : citable.getReferences())
                    jsonReferences.put(jsonCitable(reference.getCited(), false));

                obj.put("references", jsonReferences);

                JSONArray jsonDatasources = new JSONArray();
                for (Citation datasource : citable.getDataSources())
                    jsonDatasources.put(jsonCitable(datasource.getCited(), false));

                obj.put("dataSources", jsonDatasources);
            }

            return obj;
        }
    }


    public static class StateForm implements HasBindParameters
    {
        String category = "CDS.state";
        Map<String,String> properties = new CaseInsensitiveHashMap<>();
        public String getCategory()
        {
            return category;
        }

        public void setCategory(String category)
        {
            if (!StringUtils.startsWith(category, "CDS."))
                category = "CDS." + category;
            this.category = category;
        }

        public Map<String, String> getProperties()
        {
            return properties;
        }

        public void setProperties(Map<String, String> properties)
        {
            this.properties = properties;
        }

        @Override
        public BindException bindParameters(PropertyValues m)
        {
            BindException errors = new NullSafeBindException(new BaseViewAction.BeanUtilsPropertyBindingResult(this, "form"));
            for (PropertyValue pv : m.getPropertyValues())
            {
                if (StringUtils.equals("category", pv.getName()) && null != pv.getValue())
                    this.setCategory(String.valueOf(pv.getValue()));
                if (StringUtils.startsWith(pv.getName(), "properties.") && null != pv.getValue())
                    this.getProperties().put(pv.getName().substring("properties.".length()), String.valueOf(pv.getValue()));
            }
            return errors;
        }
    }


    @RequiresPermissionClass(ReadPermission.class) @RequiresLogin
    public class GetStateAction extends ApiAction<StateForm>
    {
        @Override
        public ApiResponse execute(StateForm form, BindException errors) throws Exception
        {
            Map<String,String> properties = PropertyManager.getProperties(getUser(), getContainer(), form.getCategory());
            JSONObject ret = new JSONObject();
            ret.put("success", true);
            JSONObject props = new JSONObject();
            props.putAll(properties);
            ret.put("properties", props);
            return new ApiSimpleResponse(ret);
        }
    }


    @RequiresPermissionClass(ReadPermission.class) @RequiresLogin
    public class SaveStateAction extends MutatingApiAction<StateForm>
    {
        @Override
        public ApiResponse execute(StateForm form, BindException errors) throws Exception
        {
            PropertyManager.PropertyMap properties = PropertyManager.getWritableProperties(getUser(), getContainer(), form.getCategory(), true);
            properties.clear();
            properties.putAll(form.getProperties());
            properties.save();

            JSONObject ret = new JSONObject();
            ret.put("success", true);
            ret.put("count", properties.size());
            return new ApiSimpleResponse(ret);
        }
    }


    /***** experimenting with derby/mondrian ******/

    @RequiresPermissionClass(ReadPermission.class)
    @Action(ActionType.Export.class)
    public class ExportRowsXLSXAction extends SimpleViewAction<ExportForm>
    {
        @Override
        public ModelAndView getView(ExportForm form, BindException errors) throws Exception
        {
            QueryView view = new ExcelExportQueryView(form, errors);
            view.exportToExcel(getViewContext().getResponse(), form.getHeaderType(), ExcelWriter.ExcelDocumentType.xlsx);
            return null;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return null;
        }
    }

    public class ExcelExportQueryView extends QueryView
    {
        private String[] _columnNamesOrdered;
        private Map<String, String> _columnAliases;

        public ExcelExportQueryView(ExportForm form, Errors errors)
        {
            super(form, errors);
            _columnNamesOrdered = form.getColumnNamesOrdered();
            _columnAliases = form.getColumnAliases();
        }

        @Override
        public List<DisplayColumn> getExportColumns(List<DisplayColumn> list)
        {
            List<DisplayColumn> retColumns = super.getExportColumns(list);
            List<DisplayColumn> exportColumns = new ArrayList<>();

            // issue 20850: set export column headers to be "Dataset - Variable"
            for (String colName : _columnNamesOrdered)
            {
                for (DisplayColumn col : retColumns)
                {
                    if (col.getColumnInfo() != null && colName.equals(col.getColumnInfo().getName()))
                    {
                        col.setCaption(_columnAliases.get(col.getColumnInfo().getName()));
                        exportColumns.add(col);
                        break;
                    }
                    else if (colName.equals(col.getName()))
                    {
                        col.setCaption(_columnAliases.get(col.getName()));
                        exportColumns.add(col);
                        break;
                    }
                }
            }
            return exportColumns;
        }
    }

    public static class ExportForm extends QueryForm
    {
        private String[] _columnNamesOrdered;
        private Map<String, String> _columnAliases = new HashMap<String, String>();

        protected ColumnHeaderType _headerType = null; // QueryView will provide a default header type if the user doesn't select one

        public ColumnHeaderType getHeaderType()
        {
            return _headerType;
        }

        public void setHeaderType(ColumnHeaderType headerType)
        {
            _headerType = headerType;
        }

        protected BindException doBindParameters(PropertyValues in)
        {
            BindException errors = super.doBindParameters(in);

            String[] columnNames = getValues("columnNames", in);
            String[] columnAliases = getValues("columnAliases", in);
            if (columnNames.length == columnAliases.length)
            {
                _columnNamesOrdered = columnNames;

                for (int i = 0; i < columnNames.length; i++)
                    _columnAliases.put(columnNames[i], columnAliases[i]);
            }

            return errors;
        }

        public String[] getColumnNamesOrdered()
        {
            return _columnNamesOrdered;
        }

        public Map<String, String> getColumnAliases()
        {
            return _columnAliases;
        }
    }

    public static class CopyBean
    {
        String path;

        public String getPath()
        {
            return path;
        }

        @SuppressWarnings("UnusedDeclaration")
        public void setPath(String path)
        {
            this.path = path;
        }
    }

    @RequiresPermissionClass(AdminPermission.class)
    public class ImportArchiveAction extends FormViewAction<CopyBean>
    {
        @Override
        public void validateCommand(CopyBean target, Errors errors)
        {
        }

        @Override
        public ModelAndView getView(CopyBean copyBean, boolean reshow, BindException errors) throws Exception
        {
            return new JspView("/org/labkey/cds/view/importArchive.jsp");
        }

        @Override
        public boolean handlePost(CopyBean form, BindException errors) throws Exception
        {
//            if (null == form.getPath() || !new File(form.getPath()).exists())
//            {
//                errors.reject(ERROR_MSG, "Directory not found: " + form.getPath());
//                return false;
//            }
//            PipelineJob j = new CDSImportLoader(getContainer(), getUser(), form.getPath());
//            PipelineService.get().queueJob(j);
            return true;
        }

        @Override
        public URLHelper getSuccessURL(CopyBean copyBean)
        {
            return PageFlowUtil.urlProvider(PipelineUrls.class).urlBegin(getContainer());
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return null;
        }
    }
}
