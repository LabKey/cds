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
<%@ page import="org.labkey.api.app.SinglePageAppUrls"%>
<%@ page import="org.labkey.api.data.Container"%>
<%@ page import="org.labkey.api.di.DataIntegrationUrls" %>
<%@ page import="org.labkey.api.query.QueryUrls" %>
<%@ page import="org.labkey.api.study.StudyService" %>
<%@ page import="org.labkey.api.util.PageFlowUtil" %>
<%@ page import="org.labkey.cds.CDSController" %>
<%@ page import="org.labkey.cds.CDSUserSchema" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%@ taglib prefix="labkey" uri="http://www.labkey.org/taglib" %>
<%
    Container c = getContainer();

    // Configure URL for editing the News Feed
    ActionURL newsFeedURL = new ActionURL();
    newsFeedURL.setContainer(c);
    newsFeedURL.addParameter("schemaName", "announcement");
    newsFeedURL.addParameter("query.queryName", "RSSFeeds");

    // 15438
    if (StudyService.get().getStudy(c) != null)
    {
%>
<style type="text/css">
    .cds-begin ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
</style>
<div class="cds-begin">
    <ul>
        <li><%=textLink("Application", CDSController.AppAction.class)%></li>
        <li><%=textLink("Manage Configuration", PageFlowUtil.urlProvider(SinglePageAppUrls.class).getManageAppURL(getContainer()))%></li>
        <li><%=textLink("Run ETLs", PageFlowUtil.urlProvider(DataIntegrationUrls.class).getBeginURL(c))%></li>
        <li><%=textLink("Browse Schema", PageFlowUtil.urlProvider(QueryUrls.class).urlSchemaBrowser(c, CDSUserSchema.SCHEMA_NAME))%></li>
        <li><%=textLink("Manage News Feed", PageFlowUtil.urlProvider(QueryUrls.class).urlExecuteQuery(newsFeedURL))%></li>
    </ul>
</div>
<%
    }
    else
    {
%>
Please upload a study to begin using the collaborative dataspace.
<%
    }
%>
