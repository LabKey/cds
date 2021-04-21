<%
/*
 * Copyright (c) 2014-2019 LabKey Corporation
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
%>
<%@ page import="org.apache.commons.lang3.StringUtils" %>
<%@ page import="org.labkey.api.analytics.AnalyticsService" %>
<%@ page import="org.labkey.api.data.ContainerManager" %>
<%@ page import="org.labkey.api.security.User" %>
<%@ page import="org.labkey.api.settings.AppProps" %>
<%@ page import="org.labkey.api.util.PageFlowUtil" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.api.view.template.PageConfig" %>
<%@ page import="org.labkey.cds.CDSController" %>
<%@ page import="org.labkey.cds.view.template.ConnectorTemplate" %>
<%@ page import="java.util.LinkedHashSet" %>
<%@ page import="java.util.LinkedList" %>
<%@ page import="java.util.List" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    ConnectorTemplate me = (ConnectorTemplate) HttpView.currentView();
    CDSController.AppModel model = (CDSController.AppModel) me.getConnectorModel();
    PageConfig pageConfigBean = me.getModelBean(); // TODO make sure we pass in the page config when we create this template.
    String devModeParam = getActionURL().getParameter("devMode");
    boolean devMode = AppProps.getInstance().isDevMode() || (devModeParam != null && devModeParam.equalsIgnoreCase("1"));

    String resourcePath = "/production/Connector/resources";
    User user = getUser();
%>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta charset="utf-8">
    <title>DataSpace</title>

    <link rel="icon" type="image/png" href="<%=getWebappURL("/Connector/images/headerlogo.png")%>">

    <!-- stylesheets -->
    <link type="text/css" href="<%=getWebappURL("/hopscotch/css/hopscotch.min.css")%>" rel="stylesheet">
    <link type="text/css" href="<%=getWebappURL("/cds/gen/Connector-all.css")%>" rel="stylesheet">

    <!-- Include base labkey.js -->
    <%=PageFlowUtil.getLabkeyJS(getViewContext(), pageConfigBean, new LinkedHashSet<>(), false)%>
    <script type="text/javascript">
        var Connector = {
            studyContext: {
                schemaName: 'study',
                subjectColumn: LABKEY.moduleContext.study.subject.columnName,
                gridBaseSchema: 'cds',
                gridBase: 'GridBase',
                protocolDayColumn: 'ProtocolDay',
                subjectLabel: 'Subject Id'
            },
            resourceContext: {
                <% // Not using getWebappURL() below because we don't want HTML encoding %>
                path: <%=q(request.getContextPath() + resourcePath)%>,
                imgPath: <%=q(request.getContextPath() + resourcePath + "/images")%>
            },
            user: {
                isAnalyticsUser: <%=model.isAnalyticsUser()%>,
                properties: <%=model.getUserProperties()%>
            }
        };

        Ext = {}; Ext4 = Ext;
    </script>
    <% if (pageConfigBean.getAllowTrackingScript())
    {
        String script = AnalyticsService.getTrackingScript();
        if (StringUtils.isNotEmpty(script))
        {
            if (user.hasSiteAdminPermission())
            {
    %>      <!-- see <%=h(new ActionURL("analytics", "begin", ContainerManager.getRoot()))%> -->
    <%
            }
    %>
    <%=unsafe(script)%>
    <%
            }
        }

    final String srcPath = "/Connector/src";

    List<String> includePaths = new LinkedList<>(List.of(
        "/internal/jQuery/jquery-3.5.1.min.js",
        "/hopscotch/js/hopscotch.min.js",

        "/ext-4.2.1/ext-all" + (devMode ? "-debug" : "") + ".js",
        "/ext-4.2.1/ext-patches.js",
        srcPath + "/ext-patches.js",

        // Client API Dependencies
        "/clientapi/labkey-api-js-core.min.js",
        "/clientapi/dom/Utils.js",
        "/clientapi/dom/Webpart.js",

        "/clientapi/ext4/Util.js",
        "/clientapi/ext4/data/Reader.js",
        "/clientapi/ext4/data/Proxy.js",
        "/clientapi/ext4/data/Store.js",

        // Internal Dependencies
        "/dataregion/filter/Base.js",
        "/dataregion/filter/Model.js",
        "/dataregion/filter/Faceted.js",

        // Ext Widget Dependencies
        "/extWidgets/Ext4DefaultFilterPanel.js",
        "/extWidgets/Ext4GridPanel.js",

        // Visualization Dependencies
        "/vis/lib/d3-3.5.17.min.js",
        "/vis/lib/hexbin.min.js",
        "/vis/lib/sqbin.min.js",
        "/vis/lib/crossfilter-1.3.11.js",

        // LabKey Visualization Library
        "/vis/lib/patches.js",
        "/vis/src/utils.js",
        "/vis/src/geom.js",
        "/vis/src/statistics.js",
        "/vis/src/scale.js",
        "/vis/src/layer.js",
        "/vis/src/internal/D3Renderer.js",
        "/vis/src/plot.js",
        "/vis/MeasureStore.js",

        "/query/olap.js"
    ));

    if (devMode) {
        includePaths.addAll(List.of(
            // CDS Module Dependencies
            "/Connector/cube.js",
            "/Connector/measure.js",

            // Connector Application
            srcPath + "/types/Filter.js",

            // Constant singletons
            srcPath + "/constant/ModuleViewsLookup.js",
            srcPath + "/constant/State.js",
            srcPath + "/constant/Templates.js",

            // Application Models
            srcPath + "/model/State.js",
            srcPath + "/model/ColumnInfo.js",
            srcPath + "/model/Detail.js",
            srcPath + "/model/Dimension.js",
            srcPath + "/model/Explorer.js",
            srcPath + "/model/Filter.js",
            srcPath + "/model/FilterGroup.js",
            srcPath + "/model/Measure.js",
            srcPath + "/model/Source.js",
            srcPath + "/model/InfoPane.js",
            srcPath + "/model/InfoPaneMember.js",
            srcPath + "/model/TimepointPane.js",
            srcPath + "/model/Summary.js",
            srcPath + "/model/Group.js",
            srcPath + "/model/Grid.js",
            srcPath + "/model/MabDetail.js",
            srcPath + "/model/MabGrid.js",
            srcPath + "/model/MabPane.js",
            srcPath + "/model/MabSummary.js",
            srcPath + "/model/RSSItem.js",
            srcPath + "/model/Variable.js",
            srcPath + "/model/VisitTag.js",
            srcPath + "/model/Antigen.js",
            srcPath + "/model/ChartData.js",
            srcPath + "/model/StudyAxisData.js",
            srcPath + "/model/StudyVisitTag.js",

            // Application source
            srcPath + "/button/Image.js",
            srcPath + "/button/RoundedButton.js",
            srcPath + "/component/ActionTitle.js",
            srcPath + "/component/AdvancedOption.js",
            srcPath + "/component/AbstractAntigenSelection.js",
            srcPath + "/component/AntigenSelection.js",
            srcPath + "/component/MabVirusSelection.js",
            srcPath + "/component/DropDown.js",
            srcPath + "/component/GridPager.js",
            srcPath + "/component/News.js",
            srcPath + "/component/Started.js",
            srcPath + "/window/AbstractFilter.js",
            srcPath + "/window/Filter.js",
            srcPath + "/window/Facet.js",
            srcPath + "/window/AbstractGroupedFacet.js",
            srcPath + "/window/MabGridFacet.js",
            srcPath + "/window/LearnFacet.js",
            srcPath + "/window/SystemMessage.js",
            srcPath + "/panel/FilterPanel.js",
            srcPath + "/panel/Selection.js",
            srcPath + "/panel/GroupList.js",
            srcPath + "/panel/Selector.js",
            srcPath + "/panel/HelpCenter.js",
            srcPath + "/panel/ToolsAndLinks.js",
            srcPath + "/grid/Panel.js",

            // Application plugins
            srcPath + "/plugin/Messaging.js",
            srcPath + "/plugin/DocumentValidation.js",
            srcPath + "/plugin/LoadingMask.js",

            // Factories
            srcPath + "/factory/Module.js",

            // Utilities
            srcPath + "/utility/Animation.js",
            srcPath + "/utility/Statistics.js",
            srcPath + "/utility/StoreCache.js",
            srcPath + "/utility/Chart.js",
            srcPath + "/utility/HelpRouter.js",
            srcPath + "/utility/Query.js",
            srcPath + "/utility/MabQuery.js",
            srcPath + "/utility/HashURL.js",
            srcPath + "/utility/FileExtension.js",
            srcPath + "/utility/PlotTooltip.js",
            srcPath + "/utility/InfoPaneUtil.js",

            // Application Stores
            srcPath + "/store/AssayDistinctValue.js",
            srcPath + "/store/Explorer.js",
            srcPath + "/store/FilterStatus.js",
            srcPath + "/store/MabStatus.js",
            srcPath + "/store/Summary.js",
            srcPath + "/store/VisitTag.js",
            srcPath + "/store/StudyVisitTag.js",

            // Application Views
            srcPath + "/view/Selection.js",
            srcPath + "/view/DetailStatus.js",
            srcPath + "/view/FilterStatus.js",
            srcPath + "/view/InfoPane.js",
            srcPath + "/view/GridPane.js",
            srcPath + "/view/PlotPane.js",
            srcPath + "/view/TimepointPane.js",
            srcPath + "/view/GroupSave.js",
            srcPath + "/view/GroupSummary.js",
            srcPath + "/view/MabGroupSummary.js",
            srcPath + "/view/Header.js",
            srcPath + "/view/Home.js",
            srcPath + "/view/HomeHeader.js",
            srcPath + "/view/HeaderDataView.js",
            srcPath + "/view/Learn.js",
            srcPath + "/view/MabPane.js",
            srcPath + "/view/Main.js",
            srcPath + "/view/Navigation.js",
            srcPath + "/view/Page.js",
            srcPath + "/view/PageHeader.js",
            srcPath + "/view/Grid.js",
            srcPath + "/view/MabReport.js",
            srcPath + "/view/MabGrid.js",
            srcPath + "/view/MabStatus.js",
            srcPath + "/view/Variable.js",
            srcPath + "/view/StudyAxis.js",
            srcPath + "/view/Chart.js",
            srcPath + "/view/SingleAxisExplorer.js",
            srcPath + "/view/Summary.js",
            srcPath + "/view/Viewport.js",

            srcPath + "/view/module/BaseModule.js",
            srcPath + "/view/module/ShowList.js",
            srcPath + "/view/module/Text.js",

            // Application Controllers
            srcPath + "/controller/AbstractViewController.js",
            srcPath + "/controller/AbstractGridController.js",
            srcPath + "/controller/Home.js",
            srcPath + "/controller/Chart.js",
            srcPath + "/controller/Connector.js",
            srcPath + "/controller/Query.js",
            srcPath + "/controller/HttpInterceptor.js",
            srcPath + "/controller/Messaging.js",
            srcPath + "/controller/Filter.js",
            srcPath + "/controller/Analytics.js",
            srcPath + "/controller/Explorer.js",
            srcPath + "/controller/FilterStatus.js",
            srcPath + "/controller/Group.js",
            srcPath + "/controller/Learn.js",
            srcPath + "/controller/Main.js",
            srcPath + "/controller/Navigation.js",

            srcPath + "/controller/Data.js",
            srcPath + "/controller/MabGrid.js",
            srcPath + "/controller/Router.js",
            srcPath + "/controller/State.js",
            srcPath + "/controller/Summary.js",

            srcPath + "/app/model/AssayAntigen.js",
            srcPath + "/app/model/Assay.js",
            srcPath + "/app/model/Labs.js",
            srcPath + "/app/model/Study.js",
            srcPath + "/app/model/StudyProducts.js",
            srcPath + "/app/model/VariableList.js",
            srcPath + "/app/model/Report.js",
            srcPath + "/app/model/MAb.js",
            srcPath + "/app/model/Publication.js",

            srcPath + "/app/store/PermissionedStudy.js",
            srcPath + "/app/store/AssayAntigen.js",
            srcPath + "/app/store/Assay.js",
            srcPath + "/app/store/Labs.js",
            srcPath + "/app/store/Study.js",
            srcPath + "/app/store/StudyProducts.js",
            srcPath + "/app/store/VariableList.js",
            srcPath + "/app/store/Report.js",
            srcPath + "/app/store/MAb.js",
            srcPath + "/app/store/Publication.js",

            srcPath + "/app/view/LearnGrid.js",
            srcPath + "/app/view/LearnSummary.js",
            srcPath + "/app/view/AssayAntigen.js",
            srcPath + "/app/view/Assay.js",
            srcPath + "/app/view/Labs.js",
            srcPath + "/app/view/ModuleContainer.js",
            srcPath + "/app/view/Study.js",
            srcPath + "/app/view/StudyProducts.js",
            srcPath + "/app/view/Report.js",
            srcPath + "/app/view/MAb.js",
            srcPath + "/app/view/Publication.js",
            srcPath + "/app/view/ReportModuleContainer.js",

            srcPath + "/app/view/module/DataAvailabilityModule.js",
            srcPath + "/app/view/module/NonIntegratedDataAvailability.js",
            srcPath + "/app/view/module/AssayAnalyteList.js",
            srcPath + "/app/view/module/AssayHeader.js",
            srcPath + "/app/view/module/ContactCDS.js",
            srcPath + "/app/view/module/StudyResources.js",
            srcPath + "/app/view/module/MabDetails.js",
            srcPath + "/app/view/module/PublicationDetails.js",
            srcPath + "/app/view/module/ProductHeader.js",
            srcPath + "/app/view/module/ProductOtherProducts.js",
            srcPath + "/app/view/module/StudyHeader.js",
            srcPath + "/app/view/module/TreatmentSchemaGroup.js",
            srcPath + "/app/view/module/AssaySchemaMethod.js",
            srcPath + "/app/view/module/StudyPublications.js",
            srcPath + "/app/view/module/StudyProducts.js",
            srcPath + "/app/view/module/StudyRelationships.js",
            srcPath + "/app/view/module/StudyReports.js",
            srcPath + "/app/view/module/StudySites.js",
            srcPath + "/app/view/module/StudyMabs.js",
            srcPath + "/app/view/module/VariableList.js",
            srcPath + "/app/view/module/InteractiveReports.js",
            srcPath + "/app/view/module/CuratedGroups.js",

            srcPath + "/Application.js",

            srcPath + "/app.js"
        ));
    }
    else
    {
        // PRODUCTION
        includePaths.add("/Connector/extapp.min.js");
    }

    // Output all the script tags
    for (String path : includePaths)
         out.print(getScriptTag(path));
%>
</head>
<body>
<div class="banner" style="visibility: hidden;">
    <div class="banner-msg">Your session will expire in <span class="timer"></span>. Click anywhere to continue.</div>
</div>
<!-- BODY -->
<%  me.include(me.getBody(),out); %>
<!-- /BODY -->
</body>
</html>
