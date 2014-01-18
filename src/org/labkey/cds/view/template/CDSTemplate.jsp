<%
/*
 * Copyright (c) 2012-2013 LabKey Corporation
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
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.api.view.template.ClientDependency" %>
<%@ page import="org.labkey.api.view.template.PageConfig" %>
<%@ page import="org.labkey.api.view.template.PrintTemplate" %>
<%@ page import="org.labkey.cds.CDSManager" %>
<%@ page import="java.util.LinkedHashSet" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    PrintTemplate me   = (PrintTemplate) HttpView.currentView();
    PageConfig bean    = me.getModelBean();
    ActionURL url      = getActionURL();
    String contextPath = request.getContextPath();
    String serverHash   = PageFlowUtil.getServerSessionHash();
    String grayImagePath = "cds/lib/ext-4.0.7/resources/themes/images/gray";
    Boolean devMode = AppProps.getInstance().isDevMode();
    boolean tutorialAvailable = CDSManager.get().isTutorialAvailable(getContainer(), getUser());
%>
<!DOCTYPE html>
<html>
<head>
    <!-- Use Internet Explorer 9 Standards mode -->
    <meta http-equiv="x-ua-compatible" content="IE=9">
    <title>HIV Vaccine Connector</title>
    <%= bean.getMetaTags(url) %>
    <link rel="icon" type="image/png" href="<%=contextPath%>/cds/images/logo_02.png">
    <link type="text/css" href="<%=contextPath%>/cds/resources/css/connector.css<%= devMode ? "" : ("?"+serverHash)%>" rel="stylesheet">

    <!-- Context Path required for CSS -->
    <style type="text/css">
        .x4-btn-rounded-inverted-accent-icon-small .info {
            background-image: url(<%=contextPath%>/cds/images/info.png);
        }

        div.status-row:hover .x4-btn-icon,
        .x4-btn-rounded-inverted-accent-icon-small:hover .x4-btn-icon {
            background-image: url(<%=contextPath%>/cds/images/infoover.png);
        }

        .x4-form-trigger {
            background-image : url(<%=contextPath%>/cds/images/combotrigger.gif);
        }

        .x4-column-header-trigger {
            background-image: url(<%=contextPath%>/cds/images/gridtrigger.gif) !important;
        }

        /* Paging Toolbar */
        .x4-tbar-page-next {
            background-image: url('<%=contextPath%>/<%=grayImagePath%>/grid/page-next.gif') !important;
        }

        .x4-tbar-page-last {
            background-image: url('<%=contextPath%>/<%=grayImagePath%>/grid/page-last.gif') !important;
        }

        .x4-tbar-page-prev {
            background-image: url('<%=contextPath%>/<%=grayImagePath%>/grid/page-prev.gif') !important;
        }

        .x4-tbar-page-first {
            background-image: url('<%=contextPath%>/<%=grayImagePath%>/grid/page-first.gif') !important;
        }

        .x4-tbar-loading {
            background-image: url('<%=contextPath%>/<%=grayImagePath%>/grid/refresh.gif') !important;
        }

        div.showload {
            background: url('<%=contextPath%>/<%=grayImagePath%>/grid/loading.gif') no-repeat 15px;
            background-size: 20px;
        }
    </style>

    <%=PageFlowUtil.getLabkeyJS(getViewContext(), new LinkedHashSet<ClientDependency>())%>
    <script type="text/javascript" src="<%=contextPath%>/cds/lib/ext-4.0.7/ext-all-sandbox<%= devMode ? "-dev" : ""%>.js"></script>
    <script type="text/javascript" src="<%=contextPath%>/cds/lib/ext-4.0.7/ext-patches.js"></script>
    <script type="text/javascript" src="<%=contextPath%>/clientapi/core/ExtAdapter.js"></script>

    <!-- This is due to the client API depending on Ext 3 -->
    <script type="text/javascript">
        LABKEY.contextPath = <%=PageFlowUtil.jsString(contextPath)%>;
        tutorialAvailable = <%=tutorialAvailable%>;
    </script>

    <script type="text/javascript" src="<%=contextPath%>/clientapi/core/Ajax.js"></script>
    <script type="text/javascript" src="<%=contextPath%>/clientapi/core/Utils.js"></script>
    <script type="text/javascript" src="<%=contextPath%>/clientapi/core/ActionURL.js"></script>
    <script type="text/javascript" src="<%=contextPath%>/clientapi/core/Filter.js"></script>
    <script type="text/javascript" src="<%=contextPath%>/clientapi/core/Query.js"></script>
    <script type="text/javascript" src="<%=contextPath%>/clientapi/core/Visualization.js"></script>
    <script type="text/javascript" src="<%=contextPath%>/study/MeasurePicker.js"></script>
    <script type="text/javascript" src="<%=contextPath%>/extWidgets/Ext4DefaultFilterPanel.js"></script>
    <script type="text/javascript" src="<%=contextPath%>/extWidgets/Ext4GridPanel.js"></script>

    <!-- Visualization Dependencies -->
    <script type="text/javascript" src="<%=contextPath%>/vis/lib/d3-3.3.9.min.js"></script>
    <script type="text/javascript" src="<%=contextPath%>/vis/lib/raphael-min-2.1.0.js"></script>
    <script type="text/javascript" src="<%=contextPath%>/vis/SVGConverter.js"></script>

    <!-- mvc specific -->
    <% if (devMode)
    {
    %>
        <!-- LabKey Visualization Library -->
        <script type="text/javascript" src="<%=contextPath%>/vis/lib/patches.js"></script>
        <script type="text/javascript" src="<%=contextPath%>/vis/src/utils.js"></script>
        <script type="text/javascript" src="<%=contextPath%>/vis/src/geom.js"></script>
        <script type="text/javascript" src="<%=contextPath%>/vis/src/stat.js"></script>
        <script type="text/javascript" src="<%=contextPath%>/vis/src/scale.js"></script>
        <script type="text/javascript" src="<%=contextPath%>/vis/src/layer.js"></script>
        <script type="text/javascript" src="<%=contextPath%>/vis/src/internal/RaphaelRenderer.js"></script>
        <script type="text/javascript" src="<%=contextPath%>/vis/src/internal/D3Renderer.js"></script>
        <script type="text/javascript" src="<%=contextPath%>/vis/src/plot.js"></script>

        <script type="text/javascript" src="<%=contextPath%>/query/olap.js"></script>
        <script type="text/javascript" src="<%=contextPath%>/cds/cube.js"></script>
        <script type="text/javascript" src="<%=contextPath%>/cds/js/app.js"></script>
    <%
    }

    else
    {
    %>
        <script type="text/javascript" src="<%=contextPath%>/query/olap.js"></script>

        <!-- LabKey Visualization Library -->
        <script type="text/javascript" src="<%=contextPath%>/vis/vis.min.js?<%=serverHash%>"></script>

        <script type="text/javascript" src="<%=contextPath%>/cds/connector.min.js?<%=serverHash%>"></script>
    <%
    }
    %>
</head>
<body>
    <!-- BODY -->
    <%  me.include(me.getBody(),out); %>
    <!-- /BODY -->
</body>
</html>
