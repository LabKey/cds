<%@ taglib prefix="labkey" uri="http://www.labkey.org/taglib" %>
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
<%@ page import="org.labkey.api.data.Container"%>
<%@ page import="org.labkey.api.query.QueryAction"%>
<%@ page import="org.labkey.api.study.StudyService" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.cds.CDSController" %>
<%@ page import="org.labkey.cds.CDSUserSchema" %>
<%@ page import="org.labkey.api.util.PageFlowUtil" %>
<%@ page import="org.labkey.api.app.SinglePageAppUrls" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%!
    ActionURL tableURL(CDSUserSchema userSchema, String tableName)
    {
        return userSchema.urlFor(QueryAction.executeQuery, userSchema.getQueryDefForTable(tableName));
    }
%>
<%
    Container c = getContainer();
    CDSUserSchema userSchema = new CDSUserSchema(getUser(), c);

    // 15438
    if (StudyService.get().getStudy(c) != null)
    {
%>
<a href="<%=tableURL(userSchema, "antigens")%>">Antigens</a><br>
<a href="<%=tableURL(userSchema, "assays")%>">Assays</a><br>
<a href="<%=tableURL(userSchema, "assaypublications")%>">AssayPublications</a><br>
<a href="<%=tableURL(userSchema, "citableauthors")%>">Authors</a><br>
<a href="<%=tableURL(userSchema, "citable")%>">Citable</a><br>
<a href="<%=tableURL(userSchema, "citations")%>">Citations</a><br>
<a href="<%=tableURL(userSchema, "labs")%>">Labs</a><br>
<a href="<%=tableURL(userSchema, "people")%>">People</a><br>
<a href="<%=tableURL(userSchema, "sites")%>">Sites</a><br>
<a href="<%=tableURL(userSchema, "studies")%>">Studies</a><br>
<a href="<%=tableURL(userSchema, "vaccinecomponents")%>">VaccineComponents</a><br>
<a href="<%=tableURL(userSchema, "vaccines")%>">Vaccines</a><br>
<a href="<%=tableURL(userSchema, "facts")%>">Fact Table</a><br>
<%=textLink("Populate Fact Table", CDSController.PopulateCubeAction.class)%>
<%=textLink("Clear Fact Table", CDSController.ClearFactTableAction.class)%>
<%=textLink("Update Participant Groups", CDSController.UpdateParticipantGroupsAction.class)%>
<br>
<%=textLink("Application", CDSController.AppAction.class)%>
<%=textLink("Manage Configuration", PageFlowUtil.urlProvider(SinglePageAppUrls.class).getManageAppURL(getContainer()))%>
<%=textLink("Load Archive", CDSController.ImportArchiveAction.class)%>
<%
    }
    else
    {
%>
Please upload a study to begin using the collaborative dataspace.
<%
    }
%>
