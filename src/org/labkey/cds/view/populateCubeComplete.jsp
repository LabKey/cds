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
<%@ page import="org.labkey.api.study.StudyUrls" %>
<%@ page import="org.labkey.api.util.PageFlowUtil" %>
<%@ page import="org.labkey.cds.CDSController" %>
<%@ page import="org.labkey.cds.FactLoader" %>
<%@ page import="java.util.List" %>
<%@ page import="org.labkey.cds.PopulateBehavior" %>
<%@ page import="org.labkey.api.view.template.ClientDependency" %>
<%@ page import="java.util.LinkedHashSet" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%!
    public LinkedHashSet<ClientDependency> getClientDependencies()
    {
        LinkedHashSet<ClientDependency> resources = new LinkedHashSet<>();
        resources.add(ClientDependency.fromPath("Ext4"));
        return resources;
    }
%>
<%
    PopulateBehavior behavior = (PopulateBehavior) this.getModelBean();
    List<FactLoader> loaders = behavior.getFactLoaders();
    StudyUrls studyUrls = PageFlowUtil.urlProvider(StudyUrls.class);
    Container c = getContainer();
%>
<h2>Fact Table</h2>
<% for(FactLoader loader : loaders) { %>
    <h3><a href="<%=studyUrls.getDatasetURL(c, loader.getSourceDataset().getDatasetId())%>"><%=h(loader.getSourceDataset().getName())%></a></h3>
    <%
        for (FactLoader.ColumnMapper colMapper : loader.getMappings())
        {
            int rowsInserted = colMapper.getRowsInserted();
            if (rowsInserted > 0) {%>
                <%=rowsInserted%> rows added to
                    <%=colMapper.getSelectName()%> from <%=(null == colMapper.getSourceColumn()) ? ("'" + colMapper.getConstValue() + "'") : colMapper.getSourceColumn().getName()%><br>
    <%      }
        }  %>
    <b><%=loader.getRowsInserted()%> rows added to fact table.</b>
    <br>
    <!--
    SQL Used to populate table
    <%=h(loader.getPopulateSql().toString(), true)%> -->
<% } %>
<br>
<%=textLink("CDS Management", CDSController.BeginAction.class)%><br>
<script type="text/javascript">
    Ext4.onReady(function() {
        Ext4.Msg.show({
            title: 'Fact Table Update Complete',
            msg: 'Redirecting to application to complete updates...',
            buttons: {}
        });

        Ext4.defer(function() {
            window.location = LABKEY.ActionURL.buildURL('cds', 'app', null, { 'dataUpdate': true });
        }, 2000);
    });
</script>