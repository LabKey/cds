/*
 * Copyright (c) 2014-2017 LabKey Corporation
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
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.json.JSONObject;
import org.labkey.api.action.Action;
import org.labkey.api.action.ActionType;
import org.labkey.api.action.ApiAction;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.FormViewAction;
import org.labkey.api.action.Marshal;
import org.labkey.api.action.Marshaller;
import org.labkey.api.action.SimpleApiJsonForm;
import org.labkey.api.action.SimpleErrorView;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.CoreSchema;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.ExcelWriter;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TSVMapWriter;
import org.labkey.api.files.FileContentService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.QueryForm;
import org.labkey.api.reader.Readers;
import org.labkey.api.rss.RSSFeed;
import org.labkey.api.rss.RSSService;
import org.labkey.api.security.CSRF;
import org.labkey.api.security.Group;
import org.labkey.api.security.IgnoresTermsOfUse;
import org.labkey.api.security.RequiresNoPermission;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.RequiresSiteAdmin;
import org.labkey.api.security.RoleAssignment;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.services.ServiceRegistry;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.CSRFUtil;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.util.Path;
import org.labkey.api.util.URLHelper;
import org.labkey.api.view.HtmlView;
import org.labkey.api.view.HttpView;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.NotFoundException;
import org.labkey.api.view.VBox;
import org.labkey.api.view.template.PageConfig;
import org.labkey.api.webdav.WebdavResource;
import org.labkey.api.webdav.WebdavService;
import org.labkey.api.writer.PrintWriters;
import org.labkey.cds.view.template.ConnectorTemplate;
import org.labkey.cds.view.template.FrontPageTemplate;
import org.springframework.beans.PropertyValues;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.Controller;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


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

    @Override
    protected void beforeAction(Controller action)
    {
        Module cds = ModuleLoader.getInstance().getModule("cds");
        ((CDSModule)cds).ensureShortcuts(false);
    }

    @RequiresPermission(ReadPermission.class)
    public class BeginAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            if (getContainer().isRoot())
                throw new NotFoundException();
            return new JspView("/org/labkey/cds/view/begin.jsp");
        }

        public NavTree appendNavTrail(NavTree root)
        {
            return root.addChild("Dataspace Management");
        }
    }

    @RequiresPermission(ReadPermission.class)
    public class NewsAction extends SimpleViewAction
    {
        @Override
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            List<RSSFeed> feeds = RSSService.get().getFeeds(getContainer(), getUser());

            getViewContext().getResponse().setContentType("text/xml");
            RSSService.get().aggregateFeeds(feeds, getUser(), getViewContext().getResponse().getWriter());

            return null;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return null;
        }
    }

    public class AppModel
    {
        private boolean isAnalyticsUser = false;
        private JSONObject userProperties;

        public boolean isAnalyticsUser()
        {
            return isAnalyticsUser;
        }

        public void setIsAnalyticsUser(boolean isAnalyticsUser)
        {
            this.isAnalyticsUser = isAnalyticsUser;
        }

        public JSONObject getUserProperties()
        {
            return userProperties;
        }

        public void setUserProperties(JSONObject userProperties)
        {
            this.userProperties = userProperties;
        }
    }

    private static final String ANALYTICS_USER_GROUP = "Active CAVD Member";

    @RequiresNoPermission
    @IgnoresTermsOfUse
    public class AppAction extends SimpleViewAction
    {
        @Override
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            Container c = getContainer();
            StudyService sss = StudyService.get();
            boolean hasStudy = null != sss && null != sss.getStudy(c);
            if (!c.isProject() || !hasStudy)
            {
                throw new NotFoundException();
            }

            HttpView template;
            if (getUser().isGuest())
            {
                template = new FrontPageTemplate(defaultPageConfig());
            }
            else
            {
                AppModel model = new AppModel();

                // Support analytics for white-list users (i.e. if they are in the ANALYTICS_USER_GROUP)
                if (!getUser().isImpersonated()) // 27915
                {
                    List<Group> groups = SecurityManager.getGroups(getContainer(), getUser());
                    for (Group group : groups)
                    {
                        if (SecurityManager.getDisambiguatedGroupName(group).equalsIgnoreCase(ANALYTICS_USER_GROUP))
                        {
                            model.setIsAnalyticsUser(true);
                            break;
                        }
                    }
                }

                model.setUserProperties(new JSONObject(CDSManager.get().getActiveUserProperties(getUser(), getContainer())));

                template = new ConnectorTemplate(new JspView("/org/labkey/cds/view/app.jsp"), defaultPageConfig(), model);
            }
            getPageConfig().setTemplate(PageConfig.Template.None);
            return template;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return root;
        }
    }


    public static class PropertiesForm
    {
        private int _rowId = -1;
        private Container _container;
        private Date _created;
        private Date _modified;

        private int _studies = 0;
        private int _subjects = 0;
        private int _assays = 0;
        private int _products = 0;
        private int _datacount = 0;
        private int _subjectlevelstudies = 0;

        public int getRowId()
        {
            return _rowId;
        }

        public void setRowId(int rowId)
        {
            _rowId = rowId;
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

        public Date getCreated()
        {
            return _created;
        }

        public void setCreated(Date created)
        {
            _created = created;
        }

        public Date getModified()
        {
            return _modified;
        }

        public void setModified(Date modified)
        {
            _modified = modified;
        }

        public int getProducts()
        {
            return _products;
        }

        public void setProducts(int products)
        {
            _products = products;
        }

        public int getAssays()
        {
            return _assays;
        }

        public void setAssays(int assays)
        {
            _assays = assays;
        }

        public int getSubjects()
        {
            return _subjects;
        }

        public void setSubjects(int subjects)
        {
            _subjects = subjects;
        }

        public int getStudies()
        {
            return _studies;
        }

        public void setStudies(int studies)
        {
            _studies = studies;
        }

        public int getDatacount()
        {
            return _datacount;
        }

        public void setDatacount(int datacount)
        {
            _datacount = datacount;
        }

        public int getSubjectlevelstudies()
        {
            return _subjectlevelstudies;
        }

        public void setSubjectlevelstudies(int count)
        {
            _subjectlevelstudies = count;
        }
    }


    @RequiresNoPermission
    @Marshal(Marshaller.Jackson)
    public class PropertiesAction extends ApiAction<PropertiesForm>
    {
        @Override
        public Object execute(PropertiesForm form, BindException errors) throws Exception
        {
            PropertiesForm model = CDSManager.get().getProperties(getContainer());

            //
            // If properties have not been set the result could be null, just hand back a
            // default form to the client
            //
            if (model == null)
            {
                model = new PropertiesForm();
            }

            //
            // Generate the response by querying for this containers result
            //
            return model;
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


    /***** experimenting with derby/mondrian ******/

    @RequiresPermission(ReadPermission.class)
    @Action(ActionType.Export.class)
    public class ExportRowsXLSXAction extends SimpleViewAction<ExportForm>
    {
        @Override
        public ModelAndView getView(ExportForm form, BindException errors) throws Exception
        {
            CDSExportQueryView view = new CDSExportQueryView(form, errors);
            view.writeExcelToResponse(getViewContext().getResponse());
            return null;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return null;
        }
    }

    @RequiresPermission(ReadPermission.class)
    @Action(ActionType.Export.class)
    public class exportCSVAction extends SimpleViewAction<ExportForm>
    {
        @Override
        public ModelAndView getView(ExportForm form, BindException errors) throws Exception
        {
            CDSExportQueryView view = new CDSExportQueryView(form, errors);
            view.writeCSVToResponse(getViewContext().getResponse());
            return null;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return null;
        }
    }

    @RequiresPermission(AdminPermission.class)
    @Action(ActionType.Export.class)
    public class PermissionsReportExportAction extends SimpleViewAction<QueryForm>
    {
        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return null;
        }

        @Override
        public ModelAndView getView(QueryForm queryForm, BindException errors) throws Exception
        {
            List<Map<String, Object>> groupPermissionData = new ArrayList<>();
            Map<Integer, String> groupIdToName = new HashMap<>();

            for (Group g : SecurityManager.getGroups(getContainer(), true))
            {
                groupIdToName.put(g.getUserId(), g.getName());
            }

            for (Container c : getContainer().getChildren()) {
                if (c.isInheritedAcl())
                {
                    Map<String, Object> groupPermissionRow = new HashMap<>();
                    groupPermissionRow.put("prot", c.getName());
                    groupPermissionRow.put("group", "*");
                    groupPermissionRow.put("role", "*");
                    groupPermissionData.add(groupPermissionRow);
                }
                else
                {
                    for (RoleAssignment ra : c.getPolicy().getAssignments())
                    {
                        Map<String, Object> groupPermissionRow = new HashMap<>();
                        groupPermissionRow.put("prot", c.getName());
                        groupPermissionRow.put("group", groupIdToName.get(ra.getUserId()));
                        groupPermissionRow.put("role", ra.getRole().getName());
                        groupPermissionData.add(groupPermissionRow);
                    }
                }

            }

            TSVMapWriter writer = new TSVMapWriter(groupPermissionData);
            writer.setFilenamePrefix("StudyGroups");
            writer.write(getViewContext().getResponse());

            return null;
        }
    }

    public static class CDSExportQueryForm extends QueryForm
    {
        public CDSExportQueryForm()
        {
            super();
        }

        public CDSExportQueryForm(String schemaName, String queryName, PropertyValues values)
        {
            super(schemaName, queryName);
            this._initParameters = values;
        }

        public PropertyValues getInitParams()
        {
            return this._initParameters;
        }
    }

    public static class ExportForm extends CDSExportQueryForm
    {
        private String[] _filterStrings;
        private Set<String> _studies = new HashSet<>();
        private Set<String> _assays = new HashSet<>();
        private String[] _columnNamesOrdered;
        private String[] _variables;
        private String[] _studyassays;
        private Map<String, String> _columnAliases = new CaseInsensitiveHashMap<>();

        private String[] _dataTabNames;
        private String[] _schemaNames;
        private String[] _queryNames;

        private Map<String, CDSExportQueryForm> _tabQueryForms = new HashMap<>();

        protected BindException doBindParameters(PropertyValues in)
        {
            BindException errors = super.doBindParameters(in);

            String[] columnNames = getValues("columnNames", in);
            String[] columnAliases = getValues("columnAliases", in);
            _dataTabNames = getValues("dataTabNames", in);
            _schemaNames = getValues("schemaNames", in);
            _queryNames = getValues("queryNames", in);

            _filterStrings = getValues("filterStrings", in);
            _studyassays = getValues("studyassays", in);
            _variables = getValues("variables", in);
            String[] studies = getValues("studies", in);
            if (studies != null && studies.length > 0)
                _studies.addAll(Arrays.asList(studies));

            if (_studyassays != null && _studyassays.length > 0)
            {
                for (String studyAssay : _studyassays)
                {
                    String[] parts = studyAssay.split(Pattern.quote(CDSExportQueryView.FILTER_DELIMITER));
                    if (parts.length < 2)
                        continue;
                    _assays.add(parts[1]);
                }
            }

            if (_dataTabNames.length == _schemaNames.length && _schemaNames.length == _queryNames.length)
            {
                for (int i = 0; i < _dataTabNames.length; i++)
                {
                    CDSExportQueryForm queryForm = new CDSExportQueryForm(_schemaNames[i], _queryNames[i], this.getInitParams());
                    queryForm.setViewContext(getViewContext());
                    queryForm.getSchema(); // initialize _schema

                    _tabQueryForms.put(_dataTabNames[i], queryForm);
                }
            }

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

        public String[] getFilterStrings()
        {
            return _filterStrings;
        }

        public String[] getStudyAssays()
        {
            return _studyassays;
        }

        public Set<String> getStudies()
        {
            return _studies;
        }

        public Set<String> getAssays()
        {
            return _assays;
        }

        public String[] getVariables()
        {
            return _variables;
        }

        public String[] getDataTabNames()
        {
            return _dataTabNames;
        }

        public void setDataTabNames(String[] dataTabNames)
        {
            this._dataTabNames = dataTabNames;
        }

        public String[] getSchemaNames()
        {
            return _schemaNames;
        }

        public void setSchemaNames(String[] schemaNames)
        {
            this._schemaNames = schemaNames;
        }

        public String[] getQueryNames()
        {
            return _queryNames;
        }

        public void setQueryNames(String[] queryNames)
        {
            this._queryNames = queryNames;
        }

        public Map<String, CDSExportQueryForm> getTabQueryForms()
        {
            return _tabQueryForms;
        }

        public void setTabQueryForms(Map<String, CDSExportQueryForm> tabQueryForms)
        {
            _tabQueryForms = tabQueryForms;
        }

    }

    @RequiresSiteAdmin
    @CSRF
    public static class MailMergeAction extends SimpleViewAction<Object>
    {
        @Override
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            if ("GET".equals(getViewContext().getRequest().getMethod()))
            {
                String csrf = "<input type=\"hidden\" name=\"" + CSRFUtil.csrfName + "\" value=\"" + CSRFUtil.getExpectedToken(getViewContext()) + "\">";
                return new HtmlView("<form method=POST><input type=submit value=submit>" + csrf + "</form>");
            }
            else if ("POST".equals(getViewContext().getRequest().getMethod()))
            {
                String sql = "SELECT L.email, U.lastlogin, L.verification, U.displayname, U.firstname, U.lastname FROM core.logins L INNER JOIN core.principals P ON L.email = P.name INNER JOIN core.usersdata U ON P.userid = U.userid";
                try (ResultSet rs = new SqlSelector(CoreSchema.getInstance().getScope(), sql).getResultSet())
                {
                    List<DisplayColumn> list = new ArrayList<>();
                    for (String s : Arrays.asList("email", "displayname", "firstname", "lastname", "lastlogin", "verification"))
                        list.add(new DataColumn(new ColumnInfo(s, JdbcType.valueOf(rs.getMetaData().getColumnType(rs.findColumn(s))))));
                    try (Results r = new ResultsImpl(rs))
                    {
                        ExcelWriter xl = new ExcelWriter(r, list);
                        xl.setFilenamePrefix("mailmerge");
                        xl.setAutoSize(true);
                        xl.write(getViewContext().getResponse());
                    }
                }
            }
            return null;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return null;
        }
    }

    public static class CmsPage
    {
        public String url;
        public String target;
    }

    @RequiresPermission(AdminPermission.class) @CSRF
    public static class CmsCopyAction extends FormViewAction<Object>
    {
        HttpView _success = null;

        @Override
        public void validateCommand(Object target, Errors errors)
        {
            CDSModule cds = (CDSModule) ModuleLoader.getInstance().getModule("cds");
            String url = cds.getPropertyValue(cds._cmsURL, getContainer());

            if (StringUtils.isEmpty(url))
                errors.reject(ERROR_MSG, "cms url is not configured");

            Container blogContainer = getTarget();
            if (null == blogContainer)
                errors.reject(ERROR_MSG, "Create subfolder named 'files'");
        }

        @Override
        public URLHelper getSuccessURL(Object o)
        {
            return null;
        }

        Container getTarget()
        {
            return getContainer();
        }

        @Override
        public ModelAndView getView(Object o, boolean reshow, BindException errors) throws Exception
        {
            CDSModule cds = (CDSModule) ModuleLoader.getInstance().getModule("cds");
            CmsPage cms = new CmsPage();
            cms.url =  cds.getPropertyValue(cds._cmsURL, getContainer());
            Container target = getTarget();
            if (null != target)
                cms.target = "/_webdav" + target.getPath() + "/@files/blog/";
            return new JspView<>(CDSController.class, "view/cms.jsp", cms, errors);
        }

        @Override
        public boolean handlePost(Object o, BindException errors) throws Exception
        {
            CDSModule cds = (CDSModule) ModuleLoader.getInstance().getModule("cds");
            String url = cds.getPropertyValue(cds._cmsURL, getContainer());
            if (!StringUtils.endsWith(url,"/"))
                url = url + "/";

            Container blogContainer = getTarget();
            FileContentService svc = ServiceRegistry.get().getService(FileContentService.class);
            File root = svc.getFileRoot(blogContainer);
            File fullPath = new File(root,"@files/blog");
            fullPath.mkdirs();

            StringWriter swOuputLog = new StringWriter();

            if (!StringUtils.equals("0",getViewContext().getRequest().getParameter("wget")))
            {
                // get pipeline root
                String wget = "wget";
                if (new File("/usr/bin/wget").exists())
                    wget = "/usr/bin/wget";
                else if (new File("/opt/local/bin/wget").exists())
                    wget = "/opt/local/bin/wget";
                ProcessBuilder pb = new ProcessBuilder(
                        wget,
                        "--directory-prefix=" + fullPath.getPath(),
                        "--mirror",
                        "--page-requisites",
                        "--convert-links",
                        "--adjust-extension",
                        "--no-host-directories",
                        url,
                        url + "rss/feed.rss");
                pb.redirectErrorStream(true);
                Process p = pb.start();
                IOUtils.copy(new InputStreamReader(p.getInputStream(), "UTF-8"), swOuputLog);
                p.waitFor();
                swOuputLog.flush();
            }

            // fix up rss/feed.rss
            File rssFile = new File(fullPath,"rss/feed.rss");
            if (rssFile.isFile())
            {
                String rss = null;
                try (Reader r = Readers.getReader(rssFile))
                {
                    StringWriter sw = new StringWriter();
                    IOUtils.copy(r, sw);
                    String path = Path.parse(getViewContext().getContextPath()).append("blog").toString("/","/");
                    String href = url + "([^\\s\"<]*)";
                    Matcher m = Pattern.compile(href).matcher(sw.toString());
                    // fancy m.replaceAll()
                    StringBuffer sb = new StringBuffer();
                    String repl = path + "$1";
                    while (m.find())
                    {
                        m.appendReplacement(sb, repl);
                        String part = m.group(1);
                        if (part.lastIndexOf(".") <= part.lastIndexOf("/"))
                            sb.append(".html");
                    }
                    m.appendTail(sb);
                    rss = sb.toString();
                    r.close();
                    try (Writer w = PrintWriters.getPrintWriter(rssFile))
                    {
                        IOUtils.copy(new StringReader(rss),w);
                    }
                }
            }

            ModelAndView form = getView(null, false, errors);
            HtmlView output = new HtmlView("<pre>"+PageFlowUtil.filter(swOuputLog.toString())+"</pre>");
            _success = new VBox(form,output);
            return true;
        }

        @Override
        public ModelAndView getSuccessView(Object o) throws Exception
        {
            return _success;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return null;
        }
    }


    @RequiresPermission(ReadPermission.class)
    public class UserPropertyAction extends ApiAction<SimpleApiJsonForm>
    {
        @Override
        public Object execute(SimpleApiJsonForm form, BindException errors) throws Exception
        {
            ApiSimpleResponse response = new ApiSimpleResponse();

            if (isDelete())
            {
                CDSManager.get().resetActiveUserProperties(getUser(), getContainer());
            }
            else if (isPost())
            {
                Object properties = form.getJsonObject().get("properties");

                if (properties instanceof JSONObject)
                {
                    Map<String, String> mapProps = new HashMap<>();

                    ((JSONObject) properties).entrySet()
                            .stream()
                            .forEach(jsonProperty -> mapProps.put(jsonProperty.getKey(), jsonProperty.getValue().toString()));

                    if (!mapProps.isEmpty())
                    {
                        CDSManager.get().setActiveUserProperties(getUser(), getContainer(), mapProps);
                    }
                }
                else
                {
                    errors.reject(ERROR_REQUIRED, "'properties' must be provided when setting a user property.");
                }
            }

            response.put("properties", CDSManager.get().getActiveUserProperties(getUser(), getContainer()));
            response.put("success", !errors.hasErrors());
            return response;
        }
    }

    @RequiresPermission(ReadPermission.class)
    public static class GetStudyDocumentAction extends SimpleViewAction<StudyDocumentForm>
    {
        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return null;
        }

        @Override
        public void validate(StudyDocumentForm form, BindException errors)
        {
            if (null == form.getStudy())
                errors.reject(ERROR_MSG, "study parameter required");
            if (null == form.getDocumentId())
                errors.reject(ERROR_MSG, "documentId parameter required");
            if (null == form.getFilename())
                errors.reject(ERROR_MSG, "filename parameter required");
        }

        @Override
        public ModelAndView getView(StudyDocumentForm form, BindException errors) throws Exception
        {
            HttpServletResponse response = getViewContext().getResponse();
            String filename = form.getFilename();
            String basePath = CDSManager.get().getStudyDocumentPath(getContainer());

            if (StringUtils.isBlank(basePath))
            {
                errors.reject(ERROR_MSG, "Study document location not specified.");
            }
            if (!errors.hasErrors() && CDSManager.get().isStudyDocumentAccessible(form.getStudy(), form.getDocumentId(), getUser(), getContainer()) && !StringUtils.isBlank(filename))
            {
                WebdavService service = ServiceRegistry.get().getService(WebdavService.class);
                WebdavResource resource = service.lookup(Path.parse(basePath + filename));
                if (resource != null)
                {
                    File requestedFile = resource.getFile();
                    if (requestedFile == null || !requestedFile.canRead())
                    {
                        errors.reject(ERROR_MSG, "Requested file not found or unreadable");
                    }
                    else
                    {
                        PageFlowUtil.streamFile(response, requestedFile, false);
                        return null;
                    }
                }
                else
                {
                    errors.reject(ERROR_MSG, "Requested file not found or unreadable");
                }
            }
            else
            {
                errors.reject(ERROR_MSG, "User don't have permission to access restricted study documents");
            }
            // file was not able to be shown so show error message(s)
            ModelAndView result = new SimpleErrorView(errors, false);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return result;
        }
    }

    public static class StudyDocumentForm
    {
        private String study;
        private String documentId;
        private String filename;

        public String getStudy()
        {
            return study;
        }

        public void setStudy(String study)
        {
            this.study = study;
        }

        public String getDocumentId()
        {
            return documentId;
        }

        public void setDocumentId(String documentId)
        {
            this.documentId = documentId;
        }

        public String getFilename()
        {
            return filename;
        }

        public void setFilename(String name)
        {
            this.filename = name;
        }
    }


}
