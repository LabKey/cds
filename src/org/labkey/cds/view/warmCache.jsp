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
<%@ page import="org.labkey.api.data.Container" %>
<%@ page import="org.labkey.api.data.ContainerManager" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.cds.CDSController" %>
<%@ page import="org.springframework.validation.Errors" %>
<%@ page import="org.springframework.validation.ObjectError" %>
<%@ page import="java.util.List" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    Container c = getContainer();
    CDSController.WarmCacheForm form = (CDSController.WarmCacheForm) HttpView.currentModel();
    Errors errors = getErrors("form");
    if (null != errors)
    {
        for (ObjectError e : (List<ObjectError>) errors.getAllErrors())
        {
            String message = getMessage(e);
                %><span class="labkey-error"><%=h(message)%></span><br><%
        }
    }

    if ("true".equals(request.getParameter("success")))
    {
        %><b>Queries Succeeded</b><br><%
    }
%>

<br>Enter multiple MDX statements. Each statement must end with semicolon and a newline<br>
The <a href="<%=new ActionURL("admin", "queries", ContainerManager.getRoot())%>" target="_blank">Query Admin Page</a> now contains
MDX Query times (search for -- MDX).<br> You may also look at the labkey-query-stats.tsv file in the tomcat logs directory for
the query times for the last run of the server.<br>

<form method="post" action="<%=new ActionURL(CDSController.WarmCacheAction.class, c)%>">
    <textarea rows="30" cols="80" name="query">
        <%=h(form.getQuery())%>
    </textarea>
    <input type="hidden" name="success" value="false"><br>
    <input type="submit">
</form>

