<%
/*
 * Copyright (c) 2014 LabKey Corporation
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
<%@ page import="org.labkey.api.settings.AppProps" %>
<%@ page import="org.labkey.api.util.PageFlowUtil" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.api.view.template.ClientDependency" %>
<%@ page import="org.labkey.api.view.template.PrintTemplate" %>
<%@ page import="java.util.LinkedHashSet" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    PrintTemplate me   = (PrintTemplate) HttpView.currentView();
    String contextPath = request.getContextPath();
    String serverHash   = PageFlowUtil.getServerSessionHash();
    Boolean devMode = AppProps.getInstance().isDevMode();

    String appPath = contextPath + "/Connector";
    String sdkPath = contextPath + "/ext-4.2.1";
    String srcPath = appPath + "/src";
    String productionPath = contextPath + "/production/Connector";
    String resourcePath = productionPath + "/resources";
%>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta charset="utf-8">
    <title>HIV Vaccine Connector</title>

    <link rel="icon" type="image/png" href="<%=text(appPath)%>/images/logo_02.png">
    <link type="text/css" href="<%=text(resourcePath)%>/Connector-all.css<%= text(devMode ? "" : ("?"+serverHash)) %>" rel="stylesheet">

    <!-- Context Path required for CSS -->
    <style type="text/css">
        .yaxisbutton {
            position: absolute;
        }

        .x-btn-rounded-inverted-accent-icon-small .info {
            background-image: url(<%=text(appPath)%>/images/info.png);
        }

        .x-btn-rounded-inverted-accent-icon-small-over .info {
            background-image: url(<%=text(appPath)%>/images/infoover.png);
        }

        /* Paging Toolbar */
        .x-tbar-page-next {
            background-image: url('<%=text(resourcePath)%>/images/grid/page-next.gif') !important;
        }

        .x-tbar-page-last {
            background-image: url('<%=text(resourcePath)%>/images/grid/page-last.gif') !important;
        }

        .x-tbar-page-prev {
            background-image: url('<%=text(resourcePath)%>/images/grid/page-prev.gif') !important;
        }

        .x-tbar-page-first {
            background-image: url('<%=text(resourcePath)%>/images/grid/page-first.gif') !important;
        }

        .x-tbar-loading {
            background-image: url('<%=text(resourcePath)%>/images/grid/refresh.gif') !important;
        }

        div.showload {
            background: url('<%=text(resourcePath)%>/images/grid/loading.gif') no-repeat 15px;
            background-size: 20px;
        }

        /* Ext.Grid */
        .closeitem {
            background: url(<%=text(appPath)%>/images/close.png);
            background-size: 8px 8px;
        }

        .sel-listing {
            padding: 5px 0 5px 30px;
        }

        .x-border-box textarea.x-form-field {
            padding: 4px 3px;
        }

        .x-panel-east-view {
            z-index: 10000;
        }

        button.imgbutton {
            padding: 0;
            border: none;
            background-color: transparent;
            cursor: pointer;

            background-image: url(<%=text(appPath)%>/images/dropdown.svg);
        }

        button.imgbuttonover {
            background-image: url(<%=text(appPath)%>/images/dropdown_hover.svg);
        }

        /* Connector.grid.Panel */
        .connector-grid .x-column-header-trigger {
            background-image: url(<%=text(appPath)%>/images/filter.svg);
            background-position: 0px 28px;
        }

        .connector-grid .x-column-header-trigger:hover {
            background-color: #E6E1E1 !important;
            background-image: url(<%=text(appPath)%>/images/filter_selected.svg);
            background-position: 0px 28px;
        }

        .connector-grid .filtered-column .x-column-header-trigger {
            background-image: url(<%=text(appPath)%>/images/filter_selected.svg);
            background-position: 0px 28px;
        }
    </style>

    <style type="text/css">
        @media (max-width: 1300px) {
            h1 {
                font-size: 24pt;
            }

            h2 {
                font-size: 20pt;
            }

            div.study-description .description-text {
                font-size: 11pt;
            }
        }

        @media (max-width: 1250px) {
            h1 {
                font-size: 22pt;
            }

            h2 {
                font-size: 18pt;
            }

            div.study-description .description-text {
                font-size: 11pt;
            }
        }

        @media (max-width: 1175px) {
            .noplotmsg h1 {
                font-size: 18pt;
            }
        }
    </style>
    <!-- Include base labkey.js -->
    <%=PageFlowUtil.getLabkeyJS(getViewContext(), new LinkedHashSet<ClientDependency>())%>

    <script type="text/javascript">
        Ext = {}; Ext4 = Ext;
    </script>

    <script src="https://maps.googleapis.com/maps/api/js?sensor=false"></script>

    <% if (devMode) { %>
    <script type="text/javascript" src="<%=text(sdkPath)%>/ext-all<%= text(devMode ? "-debug" : "") %>.js"></script>
    <script type="text/javascript" src="<%=text(sdkPath)%>/ext-patches.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/clientapi/dom/ExtAdapter.js"></script>

    <!-- Client API Dependencies -->
    <script type="text/javascript" src="<%=text(contextPath)%>/clientapi/core/Ajax.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/clientapi/core/Utils.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/clientapi/dom/Utils.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/clientapi/core/ActionURL.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/clientapi/core/Filter.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/clientapi/core/FieldKey.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/clientapi/core/Query.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/clientapi/core/Visualization.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/clientapi/core/ParticipantGroup.js"></script>

    <script type="text/javascript" src="<%=text(contextPath)%>/clientapi/ext4/Util.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/clientapi/ext4/data/Reader.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/clientapi/ext4/data/Proxy.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/clientapi/ext4/data/Store.js"></script>

    <!-- App API Dependencies -->
    <script type="text/javascript" src="<%=text(contextPath)%>/app/State.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/app/View.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/app/Route.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/app/Filter.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/app/Selection.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/app/AbstractViewController.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/app/OlapExplorer.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/app/MeasurePicker.js"></script>

    <!-- Study Dependencies -->
    <script type="text/javascript" src="<%=text(contextPath)%>/study/MeasurePicker.js"></script>

    <!-- Ext Widget Dependencies -->
    <script type="text/javascript" src="<%=text(contextPath)%>/extWidgets/Ext4DefaultFilterPanel.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/extWidgets/Ext4GridPanel.js"></script>

    <!-- Visualization Dependencies -->
    <script type="text/javascript" src="<%=text(contextPath)%>/vis/lib/d3-3.3.9.min.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/vis/lib/raphael-min-2.1.0.js"></script>

    <!-- LabKey Visualization Library -->
    <script type="text/javascript" src="<%=text(contextPath)%>/vis/lib/patches.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/vis/src/utils.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/vis/src/geom.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/vis/src/stat.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/vis/src/scale.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/vis/src/layer.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/vis/src/internal/RaphaelRenderer.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/vis/src/internal/D3Renderer.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/vis/src/plot.js"></script>

    <script type="text/javascript" src="<%=text(contextPath)%>/query/olap.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/Connector/cube.js"></script>

    <script type="text/javascript" src="<%=text(srcPath)%>/types/Filter.js"></script>

    <!-- Application Models -->
    <script type="text/javascript" src="<%=text(srcPath)%>/model/Citation.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/model/ColumnInfo.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/model/Detail.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/model/Dimension.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/model/Explorer.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/model/Filter.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/model/FilterGroup.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/model/Summary.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/model/Group.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/model/Grid.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/model/Variable.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/model/VisitTag.js"></script>

    <!-- Application source -->
    <script type="text/javascript" src="<%=text(srcPath)%>/button/Image.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/button/RoundedButton.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/window/Filter.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/window/SystemMessage.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/panel/AxisSelector.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/panel/Feedback.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/panel/FilterPanel.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/panel/Selection.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/panel/GroupList.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/grid/Panel.js"></script>

    <!-- Application plugins -->
    <script type="text/javascript" src="<%=text(srcPath)%>/plugin/Messaging.js"></script>

    <!-- Constant singletons -->
    <script type="text/javascript" src="<%=text(srcPath)%>/constant/Templates.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/constant/ModuleViewsLookup.js"></script>

    <!-- Factories -->
    <script type="text/javascript" src="<%=text(srcPath)%>/factory/Module.js"></script>

    <!-- Application Stores -->
    <script type="text/javascript" src="<%=text(srcPath)%>/store/Explorer.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/store/FilterStatus.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/store/Summary.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/store/VisitTag.js"></script>

    <!-- Application Views -->
    <script type="text/javascript" src="<%=text(srcPath)%>/view/Citation.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/Compare.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/Selection.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/DetailStatus.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/FilterSave.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/FilterStatus.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/GroupSave.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/GroupSummary.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/Header.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/Home.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/Learn.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/Main.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/Navigation.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/Data.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/Grid.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/Variable.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/Scatter.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/SingleAxisExplorer.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/Summary.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/Time.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/Viewport.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/search/Container.js"></script>

    <script type="text/javascript" src="<%=text(srcPath)%>/view/module/BaseModule.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/module/Text.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/view/module/Person.js"></script>

    <!-- Application Controllers -->
    <script type="text/javascript" src="<%=text(srcPath)%>/controller/AbstractViewController.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/controller/Home.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/controller/Chart.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/controller/Citation.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/controller/Connector.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/controller/Explorer.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/controller/FilterStatus.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/controller/Group.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/controller/Learn.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/controller/Main.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/controller/Navigation.js"></script>
    
    <script type="text/javascript" src="<%=text(srcPath)%>/controller/Data.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/controller/Router.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/controller/State.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/controller/Summary.js"></script>

    <script type="text/javascript" src="<%=text(srcPath)%>/utility/StoreCache.js"></script>

    <script type="text/javascript" src="<%=text(srcPath)%>/app/model/Assay.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/model/DataSet.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/model/Labs.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/model/Site.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/model/Study.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/model/StudyProducts.js"></script>

    <script type="text/javascript" src="<%=text(srcPath)%>/app/store/Assay.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/store/DataSet.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/store/Labs.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/store/Site.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/store/Study.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/store/StudyProducts.js"></script>

    <script type="text/javascript" src="<%=text(srcPath)%>/app/view/Assay.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/view/Labs.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/view/ModuleContainer.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/view/Site.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/view/Study.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/view/StudyProducts.js"></script>

    <script type="text/javascript" src="<%=text(srcPath)%>/app/view/module/StudyAssays.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/view/module/StudyHeader.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/view/module/StudyLabsAndClinicalData.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/view/module/StudyProducts.js"></script>
    <script type="text/javascript" src="<%=text(srcPath)%>/app/view/module/StudySites.js"></script>

    <script type="text/javascript" src="<%=text(srcPath)%>/Application.js"></script>

    <script type="text/javascript" src="<%=text(srcPath)%>/app.js"></script>

    <% } else {  %>
    <!-- PRODUCTION -->
    <script type="text/javascript" src="<%=text(appPath)%>/extapp.min.js"></script>
    <% } %>
</head>
<body>
<!-- BODY -->
<%  me.include(me.getBody(),out); %>
<!-- /BODY -->
</body>
</html>
