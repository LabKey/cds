<%
/*
 * Copyright (c) 2013 LabKey Corporation
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
<%@ page import="org.labkey.api.view.template.PrintTemplate" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    PrintTemplate me   = (PrintTemplate) HttpView.currentView();
//    PageConfig bean    = me.getModelBean();
//    ActionURL url      = getActionURL();
    String contextPath = request.getContextPath();
    String serverHash   = PageFlowUtil.getServerSessionHash();
    Boolean devMode = AppProps.getInstance().isDevMode();
//    boolean tutorialAvailable = CDSManager.get().isTutorialAvailable(getContainer(), getUser());
%>
<!DOCTYPE html>
<html>
<head>
    <!-- Use Internet Explorer 9 Standards mode -->
    <meta http-equiv="x-ua-compatible" content="IE=9">
    <title>HIV Vaccine Connector</title>
    <link rel="icon" type="image/png" href="<%=text(contextPath)%>/cds/images/logo_02.png">
    <link type="text/css" href="<%=text(contextPath)%>/cds/resources/css/sandbox.css<%= text(devMode ? "" : ("?"+serverHash)) %>" rel="stylesheet">

    <!-- Scripts -->
    <script type="text/javascript" src="<%=text(contextPath)%>/app/jquery-1.10.2.min.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/app/dust-full-2.0.0.min.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/app/underscore-min.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/app/backbone-min.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/app/backbone.marionette.min.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/cds/js/jq_olap.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/cds/js/jq_cube.js"></script>
</head>
<body>
    <!-- SANDBOX -->
    <% me.include(me.getBody(), out); %>
    <!-- /SANDBOX -->
</body>
</html>