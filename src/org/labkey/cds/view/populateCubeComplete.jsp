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
<%@ page import="org.labkey.api.data.Container" %>
<%@ page import="org.labkey.api.study.StudyUrls" %>
<%@ page import="org.labkey.api.util.PageFlowUtil" %>
<%@ page import="org.labkey.cds.CDSController" %>
<%@ page import="org.labkey.cds.FactLoader" %>
<%@ page import="java.util.List" %>
<%@ page import="org.labkey.cds.PopulateBehavior" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    PopulateBehavior behavior = (PopulateBehavior) this.getModelBean();
    List<FactLoader> loaders = behavior.getFactLoaders();
    boolean isUpdateGroups = behavior.isUpdateParticipantGroups();
    StudyUrls studyUrls = PageFlowUtil.urlProvider(StudyUrls.class);
    Container c = getContainer();
%>
<% if (isUpdateGroups) { %>
    <%--TODO: clean up these includes--%>
    <script type="text/javascript" src="<%=getWebappURL("query/olap.js")%>"></script>
    <script type="text/javascript" src="<%=getWebappURL("app/View.js")%>"></script>
    <script type="text/javascript" src="<%=getWebappURL("app/Filter.js")%>"></script>
    <script type="text/javascript">
        var init = function() {
            var cube = LABKEY.query.olap.CubeManager.getCube({
                configId: 'CDS:/CDS',
                schemaName: 'CDS',
                name: 'ParticipantCube'
            });

            var getParticipantUrl = function(participantId)
            {
                var encodedPid = Ext4.util.Format.htmlEncode(participantId);
                var url = LABKEY.ActionURL.buildURL("study", 'participant.view', null, {participantId: encodedPid});
                return "<a href='" + url + "' target='_blank'>" + encodedPid + "</a>";
            };

            var htmlParticipantGroups = [];
            htmlParticipantGroups.push("<h2>Participant Groups</h2>");

            var onGroupUpdate = function(group)
            {
                htmlParticipantGroups.push("<h3>" + Ext4.util.Format.htmlEncode(group.label) + " ");
                var participantIds = group.participantIds;
                if (participantIds.length > 0)
                {
                    for (var j = 0; j < participantIds.length; j++)
                    {
                        htmlParticipantGroups.push((j == 0) ? "now has participants: " : ", ");
                        htmlParticipantGroups.push(getParticipantUrl(participantIds[j]));
                    }
                    htmlParticipantGroups.push(".");
                }
                else
                {
                    htmlParticipantGroups.push("now has no participants.")
                }

                htmlParticipantGroups.push("</h3>");
                document.getElementById('updateParticipants').innerHTML = htmlParticipantGroups.join("");
            };

            document.getElementById('updateParticipants').innerHTML = "<h3>Updating Participant Groups...</h3>";
            Ext4.Ajax.request({
                url : LABKEY.ActionURL.buildURL('participant-group', 'getParticipantGroupsWithLiveFilters'),
                method: 'POST',
                success: function(response)
                {
                    var obj = Ext4.decode(response.responseText);
                    var groups = obj.participantGroups;
                    if (groups.length == 0)
                    {
                        htmlParticipantGroups.push("<h3>No Participant Groups with Live Filters were defined.</h3>");
                        document.getElementById('updateParticipants').innerHTML = htmlParticipantGroups.join("");
                    }
                    else
                    {
                        cube.onReady(function(mdx)
                        {
                            //var filterStatus = Ext.create('Connector.controller.FilterStatus');
                            for (var i = 0; i < groups.length; i++)
                                //filterStatus.doGroupUpdate(mdx, groups[i], onGroupUpdate);
                                LABKEY.app.controller.Filter.doGroupUpdate(mdx, groups[i], onGroupUpdate);
                        }, this);
                    }
                }
            });
        };

        Ext4.onReady(init);
    </script>
    <h2>Fact Table</h2>
<% } %>
<% for(FactLoader loader : loaders) { %>
    <h3><a href="<%=studyUrls.getDatasetURL(c, loader.getSourceDataset().getDataSetId())%>"><%=h(loader.getSourceDataset().getName())%></a></h3>
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
<% if (isUpdateGroups) {%>
    <div id="updateParticipants"></div>
<% } %>
    <br>
<%=textLink("CDS Management", CDSController.BeginAction.class)%><br>