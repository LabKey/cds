/*
 * Copyright (c) 2012-2014 LabKey Corporation
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


import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.action.ApiAction;
import org.labkey.api.action.ApiJsonWriter;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiResponseWriter;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.ApiVersion;
import org.labkey.api.action.BaseViewAction;
import org.labkey.api.action.CustomApiForm;
import org.labkey.api.action.ExtendedApiQueryResponse;
import org.labkey.api.action.FormViewAction;
import org.labkey.api.action.HasBindParameters;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.NullSafeBindException;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.cache.Cache;
import org.labkey.api.cache.CacheLoader;
import org.labkey.api.cache.CacheManager;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.DataRegion;
import org.labkey.api.data.ExcelWriter;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.ShowRows;
import org.labkey.api.data.Table;
import org.labkey.api.files.FileContentService;
import org.labkey.api.query.QueryForm;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QuerySettings;
import org.labkey.api.query.QueryView;
import org.labkey.api.query.TempQuerySettings;
import org.labkey.api.security.RequiresLogin;
import org.labkey.api.security.RequiresPermissionClass;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.services.ServiceRegistry;
import org.labkey.api.study.DataSet;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.Compress;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.util.ResultSetUtil;
import org.labkey.api.util.URLHelper;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.HtmlView;
import org.labkey.api.view.HttpView;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.ViewContext;
import org.labkey.api.view.template.PageConfig;
import org.labkey.cds.model.Citable;
import org.labkey.cds.model.CitableAuthor;
import org.labkey.cds.model.Citation;
import org.labkey.cds.view.template.CDSTemplate;
import org.labkey.cds.view.template.ConnectorTemplate;
import org.labkey.cds.view.template.SandboxTemplate;
import org.springframework.beans.MutablePropertyValues;
import org.springframework.beans.PropertyValue;
import org.springframework.beans.PropertyValues;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.StringWriter;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
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
    public class AppAction extends SimpleViewAction
    {
        @Override
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            JspView view = new JspView("/org/labkey/cds/view/app.jsp");

            HttpView template = new CDSTemplate(getViewContext(), getContainer(), view, defaultPageConfig(), new NavTree[0]);
            getPageConfig().setTemplate(PageConfig.Template.None);

            return template;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return root;
        }
    }

    @RequiresPermissionClass(ReadPermission.class)
    public class ExtAppAction extends SimpleViewAction
    {
        @Override
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            JspView view = new JspView("/org/labkey/cds/view/extApp.jsp");

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

    @RequiresPermissionClass(ReadPermission.class)
    public class SandboxAction extends SimpleViewAction
    {
        @Override
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            JspView view = new JspView("/org/labkey/cds/view/sandbox.jsp");

            HttpView template = new SandboxTemplate(getViewContext(), getContainer(), view, defaultPageConfig(), new NavTree[0]);
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
            return new HtmlView("<form method='post'>Click the button below to delete all facts from the fact table<br><input type=submit value='Delete Facts'>");
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
            return new JspView("/org/labkey/cds/view/populateCube.jsp", null, errors);
        }

        @Override
        public boolean handlePost(Object o, BindException errors) throws Exception
        {
            List<String> selectedDatasets = getViewContext().getList("dataset");

            for (String dsName : selectedDatasets)
            {
                DataSet dataSet = StudyService.get().getDataSet(getContainer(), StudyService.get().getDatasetIdByName(getContainer(), dsName));
                assert (null != dataSet) : "Couldn't find dataset " + dsName;

                FactLoader loader = new FactLoader(dataSet, getUser(), getContainer());
                _factLoaders.add(loader);
            }

            CDSManager.get().deleteFacts(getContainer());
            for (FactLoader loader : _factLoaders)
                loader.populateCube();

            // TODO:
            resetCube();

            return true;
        }

        @Override
        public ModelAndView getSuccessView(Object o)
        {
            return new JspView("/org/labkey/cds/view/populateCubeComplete.jsp", _factLoaders);
        }

        @Override
        public URLHelper getSuccessURL(Object o)
        {
            return null;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            root.addChild("Dataspace Management", new ActionURL(BeginAction.class, getContainer())).addChild("Populate Fact Table");
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

    public static class ExecuteSqlForm
    {
        private String _sql;
        private Integer _maxRows;
        private Integer _offset;
        private boolean _saveInSession;
        private boolean _includeTotalCount = true;

        public String getSql()
        {
            return _sql;
        }

        public void setSql(String sql)
        {
            _sql = sql;
        }

        public Integer getMaxRows()
        {
            return _maxRows;
        }

        public void setMaxRows(Integer maxRows)
        {
            _maxRows = maxRows;
        }

        public Integer getOffset()
        {
            return _offset;
        }

        public void setOffset(Integer offset)
        {
            _offset = offset;
        }

        public void setLimit(Integer limit)
        {
            _maxRows = limit;
        }

        public void setStart(Integer start)
        {
            _offset = start;
        }

        public boolean isSaveInSession()
        {
            return _saveInSession;
        }

        public void setSaveInSession(boolean saveInSession)
        {
            _saveInSession = saveInSession;
        }

        public boolean isIncludeTotalCount()
        {
            return _includeTotalCount;
        }

        public void setIncludeTotalCount(boolean includeTotalCount)
        {
            _includeTotalCount = includeTotalCount;
        }

        // this holds all our context for SQLCacheLoader, so we need to pass in a little context here
        ViewContext _context;

        ViewContext getViewContext()
        {
            return _context;
        }

        void setViewContext(ViewContext context)
        {
            _context = context;
        }

        BindException _errors;

        public BindException getErrors()
        {
            return _errors;
        }

        public void setErrors(BindException errors)
        {
            _errors = errors;
        }

    }


    class SQLCacheLoader implements CacheLoader<String,byte[]>
    {
        @Override
        public byte[] load(String key, @Nullable Object argument)
        {
            ExecuteSqlForm form = (ExecuteSqlForm)argument;

            String sql = StringUtils.trimToNull(form.getSql());
            if (null == sql)
                throw new IllegalArgumentException("No value was supplied for the required parameter 'sql'.");

            ViewContext context = form.getViewContext();
            BindException errors = form.getErrors();

            //create a temp query settings object initialized with the posted LabKey SQL
            //this will provide a temporary QueryDefinition to Query
            QuerySettings settings = new TempQuerySettings(context, sql);

            //need to explicitly turn off various UI options that will try to refer to the
            //current URL and query string
            settings.setAllowChooseView(false);
            settings.setAllowCustomizeView(false);

            // Issue 12233: add implicit maxRows=100k when using client API
            settings.setShowRows(ShowRows.PAGINATED);
            settings.setMaxRows(100000);

            //apply optional settings (maxRows, offset)
            boolean metaDataOnly = false;
            if (null != form.getMaxRows() && form.getMaxRows().intValue() >= 0)
            {
                settings.setShowRows(ShowRows.PAGINATED);
                settings.setMaxRows(Table.ALL_ROWS == form.getMaxRows() ? 1 : form.getMaxRows());
                metaDataOnly = (Table.ALL_ROWS == form.getMaxRows());
            }

            int offset = 0;
            if (null != form.getOffset())
            {
                settings.setOffset(form.getOffset().longValue());
                offset = form.getOffset();
            }

            //build a query view using the schema and settings
            CDSUserSchema schema = new CDSUserSchema(context.getUser(), context.getContainer(), true);
            QueryView view = new QueryView(schema, settings, errors);
            view.setShowRecordSelectors(false);
            view.setShowExportButtons(false);
            view.setButtonBarPosition(DataRegion.ButtonBarPosition.NONE);
            view.setShowPagination(form.isIncludeTotalCount());

            boolean isEditable = false;

            try
            {
                ExtendedApiQueryResponse res = new ExtendedApiQueryResponse(view, isEditable,
                        false, "cds", form.isSaveInSession() ? settings.getQueryName() : "sql", offset, null, metaDataOnly, false, false);
                StringWriter sw = new StringWriter();
                res.render(new ApiJsonWriter(sw));
                return Compress.compressGzip(sw.toString());
            }
            catch (Exception x)
            {
                errors.reject(ERROR_MSG, x.getMessage());
                return null;
            }
        }
    }


    // containerid:SQL
    static Cache<String,byte[]> resultsCache = CacheManager.getBlockingCache(1000, CacheManager.DAY, "CDS results cache", null);

    @RequiresPermissionClass(ReadPermission.class)
    @ApiVersion(9.1)
    public class ExecuteSqlAction extends ApiAction<ExecuteSqlForm>
    {

        public ApiResponse execute(ExecuteSqlForm form, BindException errors) throws Exception
        {
            String sql = StringUtils.trimToNull(form.getSql());
            if (null == sql)
                throw new IllegalArgumentException("No value was supplied for the required parameter 'sql'.");

            form.setViewContext(getViewContext());
            form.setErrors(errors);
            String key = getContainer().getId() + ":" + form.getSql();
            byte[] bytes = resultsCache.get(key, form, new SQLCacheLoader());

            getViewContext().getResponse().setContentType(ApiJsonWriter.CONTENT_TYPE_JSON);
            getViewContext().getResponse().setHeader("Content-Encoding", "gzip");
            getViewContext().getResponse().getOutputStream().write(bytes);
            return null;
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
            Map<String,String> properties = PropertyManager.getWritableProperties(getUser(), getContainer(), form.getCategory(), true);
            properties.clear();
            properties.putAll(form.getProperties());
            PropertyManager.saveProperties(properties);

            JSONObject ret = new JSONObject();
            ret.put("success", true);
            ret.put("count", properties.size());
            return new ApiSimpleResponse(ret);
        }
    }


    /***** experimenting with derby/mondrian ******/


    public static class ExecuteMdxForm
    {
        String _query = null;

        public String getQuery()
        {
            return _query;
        }

        public void setQuery(String query)
        {
            _query = query;
        }
    }


    public static class WarmCacheForm
    {
        private String _query;

        public String getQuery()
        {
            return _query;
        }

        public void setQuery(String query)
        {
            _query = query;
        }
    }

    private static Thread warmCacheThread;
    @RequiresPermissionClass(AdminPermission.class)
    public class WarmCacheAction extends FormViewAction<WarmCacheForm>
    {
        @Override
        public void validateCommand(WarmCacheForm target, Errors errors)
        {

        }

        @Override
        public ModelAndView getView(WarmCacheForm form, boolean reshow, BindException errors) throws Exception
        {
            if (null == form.getQuery())
            {
                File queryFile = getQueryFile();
                if (queryFile.exists())
                    form.setQuery(PageFlowUtil.getFileContentsAsString(queryFile));
            }
            return new JspView(CDSController.class, "view/warmCache.jsp", form, errors);
        }

        @Override
        public boolean handlePost(WarmCacheForm form, BindException errors) throws Exception
        {
            String query = StringUtils.trimToNull(form.getQuery());
            if (null != query)
                FileUtils.write(getQueryFile(), query);

            int index = 0;
            if (null != query)
            {
                // TODO
/*                OlapConnection conn = getConnection();
                List<String> statements = getStatements(query);
                for (String statement : statements)
                {
                    Throwable ex = null;
                    OlapStatement stmt = conn.createStatement();
                    try
                    {
                        index++;
                        stmt.executeOlapQuery(statement);
                    }
                    catch (TokenMgrError olapx)
                    {
                        ex = olapx;
                    }
                    catch (OlapException olapx)
                    {
                        ex = olapx;
                    }
                    catch (MondrianException olapx)
                    {
                        ex = olapx;
                    }
                    while (null != ex && null != ex.getCause() && ex.getCause() != ex)
                        ex = ex.getCause();

                    if (null != ex)
                    {
                        errors.reject(ERROR_MSG, "Statement " + index + ": " + ex.getMessage());
                    }

                }
*/
            }


            return !errors.hasErrors();
        }

        private File getQueryFile()
        {
            FileContentService service = ServiceRegistry.get().getService(FileContentService.class);
            File filesLoc = service.getFileRoot(getContainer(), FileContentService.ContentType.files);
            return new File(filesLoc, "warmCache.mdx");
        }

        private List<String> getStatements(String queries)
        {
            List<String> statements = new ArrayList<>();
            StringBuilder statement = new StringBuilder();
            String[] lines = StringUtils.split(queries, "\n");
            for (String line : lines)
            {
                line = line.trim();
                if (line.endsWith(";"))
                {
                    statement.append(line.substring(0, line.length() - 1));
                    statements.add(statement.toString());
                    statement = new StringBuilder();
                }
                else
                    statement.append(line).append("\n");
            }

            if (statement.length() > 0)
                statements.add(statement.toString());

            return statements;

        }
        @Override
        public URLHelper getSuccessURL(WarmCacheForm form)
        {
            ActionURL url = new ActionURL(this.getClass(), getContainer());
            url.addParameter("success", true);
            return url;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            root.addChild("Warm Cache");
            return root;
        }
    }


    public static class SourceCountForm implements CustomApiForm
    {
        private Map<String, Object> _props;

        @Override
        public void bindProperties(Map<String, Object> props)
        {
            _props = props;
        }

        public JSONObject getProps()
        {
            return (JSONObject) _props;
        }
    }

    @RequiresPermissionClass(ReadPermission.class)
    public class StoreFilterAction extends ApiAction<SourceCountForm>
    {
        @Override
        public ApiResponse execute(SourceCountForm form, BindException errors) throws Exception
        {
            JSONObject props = form.getProps();
            if (props.containsKey("filters"))
            {
                getViewContext().getSession().setAttribute("exportfilter", props.get("filters"));
                return new ApiSimpleResponse("success", true);
            }
            return new ApiSimpleResponse("success", false);
        }
    }

    public static class CustomQueryForm extends QueryForm
    {
        public CustomQueryForm()
        {
        }

        @Override
        public BindException bindParameters(PropertyValues params)
        {
            Object filters = getViewContext().getSession().getAttribute("exportfilter");
            if (null != filters)
            {
                JSONObject jFilters = (JSONObject) filters;
                PropertyValue[] values = params.getPropertyValues();
                ArrayList<PropertyValue> valList = new ArrayList<>(Arrays.asList(values));
                for (String key : jFilters.keySet())
                {
                    valList.add(new PropertyValue(key, jFilters.get(key)));
                }
                getViewContext().getSession().removeAttribute("exportfilter");
                PropertyValues bindParams = new MutablePropertyValues(valList);
                return super.bindParameters(bindParams);
            }
            return super.bindParameters(params);
        }
    }

    @RequiresPermissionClass(ReadPermission.class)
    public class ExportExcelAction extends SimpleViewAction<CustomQueryForm>
    {
        @Override
        public ModelAndView getView(CustomQueryForm form, BindException errors) throws Exception
        {
            QueryView view = QueryView.create(form, errors);
            getPageConfig().setTemplate(PageConfig.Template.None);
            HttpServletResponse response = getViewContext().getResponse();
            response.setHeader("X-Robots-Tag", "noindex");
            view.exportToExcel(response, ExcelWriter.ExcelDocumentType.xls);
            return null;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return null;
        }
    }

    @RequiresPermissionClass(ReadPermission.class)
    public class GetSourceCountsAction extends ApiAction<SourceCountForm>
    {
        @Override
        public ApiResponse execute(SourceCountForm form, BindException errors) throws Exception
        {
            JSONObject json = form.getProps();
            JSONArray members = json.getJSONArray("members");
            JSONArray sources = json.getJSONArray("sources");

            ApiResponseWriter writer = new ApiJsonWriter(getViewContext().getResponse());
            writer.startResponse();

            writer.startMap("counts");
            ResultSet rs = null;
            try
            {
                rs = QueryService.get().select(QueryService.get().getUserSchema(getUser(), getContainer(), "study"), getCountSql(sources, members));

                Map<String, Integer> values = new HashMap<>();
                while (rs.next())
                {
                    values.put(rs.getString("label"), rs.getInt("value"));
                }

                Integer value;
                for (int i=0; i < sources.length(); i++)
                {
                    if (values.containsKey(sources.getString(i)))
                        value = values.get(sources.getString(i));
                    else
                        value = 0;
                    writer.writeProperty(sources.getString(i), value);
                }
            }
            catch (SQLException x)
            {
                throw new RuntimeSQLException(x);
            }
            finally
            {
                ResultSetUtil.close(rs);
            }
            writer.endMap();
            writer.endResponse();

            return null;
        }

        private String getCountSql(@NotNull JSONArray sources, @NotNull JSONArray members)
        {
            String selectSql = "SELECT DataSet.Label, COUNT(DISTINCT ParticipantId) AS value FROM StudyData ";
            String innerSql = "";
            String sep = "";
            if (members.length() > 0)
            {
                innerSql += "WHERE ParticipantId IN (";
                for (int i = 0; i < members.length(); i++)
                {
                    innerSql += sep + toSqlString(members.getString(i));
                    sep = ", ";
                }
                innerSql += ") ";
                selectSql += innerSql;
            }

            if (members.length() > 0 && sources.length() > 0)
                innerSql = "AND ";
            else if (sources.length() > 0)
                innerSql = "WHERE ";

            if (sources.length() > 0)
            {
                innerSql += "DataSet.Label IN (";
                sep = "";
                for (int i = 0; i < sources.length(); i++)
                {
                    innerSql += sep + toSqlString(sources.getString(i));
                    sep = ", ";
                }
                innerSql += ") ";
                selectSql += innerSql;
            }

            selectSql += "GROUP BY DataSet.Label";

            return selectSql;
        }

        private String toSqlString(String unescapedSql)
        {
            return "'" + unescapedSql.replaceAll("'", "''") + "'";
        }
    }

}
