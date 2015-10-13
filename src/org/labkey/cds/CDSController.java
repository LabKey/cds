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
import org.json.JSONObject;
import org.labkey.api.action.Action;
import org.labkey.api.action.ActionType;
import org.labkey.api.action.ApiAction;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.BaseViewAction;
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
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleHtmlView;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.QueryForm;
import org.labkey.api.query.QueryView;
import org.labkey.api.rss.RSSFeed;
import org.labkey.api.rss.RSSService;
import org.labkey.api.security.*;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.util.Path;
import org.labkey.api.view.HtmlView;
import org.labkey.api.view.HttpView;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.template.PageConfig;
import org.labkey.cds.view.template.ConnectorTemplate;
import org.labkey.cds.view.template.FrontPageTemplate;
import org.springframework.beans.PropertyValue;
import org.springframework.beans.PropertyValues;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.util.ArrayList;
import java.util.Date;
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

    @RequiresPermission(ReadPermission.class)
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

    @RequiresPermission(ReadPermission.class)
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

    public class AppModel
    {
        private boolean isAnalyticsUser = false;

        public boolean isAnalyticsUser()
        {
            return isAnalyticsUser;
        }

        public void setIsAnalyticsUser(boolean isAnalyticsUser)
        {
            this.isAnalyticsUser = isAnalyticsUser;
        }
    }

    private static final String ANALYTICS_USER_GROUP = "Beta Users";

    @RequiresNoPermission
    @IgnoresTermsOfUse
    public class AppAction extends SimpleViewAction
    {
        @Override
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            HttpView template;
            if (getUser().isGuest())
            {
                template = new FrontPageTemplate(defaultPageConfig());
            }
            else
            {
                AppModel model = new AppModel();

                // Support analytics for white-list users (i.e. if they are in the ANALYTICS_USER_GROUP)
                List<Group> groups = SecurityManager.getGroups(getContainer(), getUser());
                for (Group group : groups)
                {
                    if (SecurityManager.getDisambiguatedGroupName(group).equalsIgnoreCase(ANALYTICS_USER_GROUP))
                    {
                        model.setIsAnalyticsUser(true);
                        break;
                    }
                }

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

    @RequiresNoPermission
    @IgnoresTermsOfUse
    public class FrontPageAction extends SimpleViewAction
    {
        @Override
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            HttpView template = new FrontPageTemplate(defaultPageConfig());
            getPageConfig().setTemplate(PageConfig.Template.None);
            return template;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return null;
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


    @RequiresLogin
    @RequiresPermission(ReadPermission.class)
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


    @RequiresLogin
    @RequiresPermission(ReadPermission.class)
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

    @RequiresPermission(ReadPermission.class)
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
        private Map<String, String> _columnAliases = new HashMap<>();

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
}
