<%
/*
 * Copyright (c) 2015-2016 LabKey Corporation
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
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.cds.CDSController" %>
<%@ taglib prefix="labkey" uri="http://www.labkey.org/taglib" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    CDSController.CmsPage cms = (CDSController.CmsPage)HttpView.currentModel();
%>
<labkey:errors></labkey:errors>
<labkey:form method="POST">
    <table>
        <tr><td class="labkey-form-label">source</td><td><%=h(cms.url)%></td></tr>
        <tr><td class="labkey-form-label">target</td><td><%=h(cms.target)%></td></tr>
    </table>
    <input type="submit" value="copy web pages">
</labkey:form>