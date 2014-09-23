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
        resources.add(ClientDependency.fromFilePath("Ext4"));
        resources.add(ClientDependency.fromFilePath("query/olap.js"));
        resources.add(ClientDependency.fromFilePath("Connector/cube.js"));
        return resources;
    }
%>
<%
    PopulateBehavior behavior = (PopulateBehavior) this.getModelBean();
    List<FactLoader> loaders = behavior.getFactLoaders();
    boolean isUpdateGroups = behavior.isUpdateParticipantGroups();
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
<% if (isUpdateGroups) {%>
    <div id="updateParticipants"></div>
<% } %>
    <br>
<%=textLink("CDS Management", CDSController.BeginAction.class)%><br>
<script type="text/javascript">

    Ext4.onReady(function() {

        //
        // Update Property Statistics
        // Note: This could probably be done on the server, however the olap API is more stable
        // on the client-side at this time
        //
        function doOnReady(mdx) {
            var data = {
                primaryCount: 0,
                dataCount: 0
            };

            var check = function() {
                if (data.primaryCount > 0 && data.dataCount > 0) {
                    Ext4.Ajax.request({
                        url: LABKEY.ActionURL.buildURL('cds', 'properties'),
                        method: 'POST',
                        jsonData: {
                            primaryCount: data.primaryCount,
                            dataCount: data.dataCount
                        },
                        callback : function() {
                            Ext4.getBody().unmask();
                        }
                    });
                }
            };

            //
            // Retrieve Primary Count
            //
            mdx.query({
                onRows: [{ level: '[Study].[Name]' }],
                success : function(cellset) { data.primaryCount = cellset.cells.length; check(); }
            });

            //
            // Retrieve Data Count
            //
            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'StudyData',
                requiredVersion: 9.1,
                maxRows: 1,
                success: function(_data) { data.dataCount = _data.rowCount; check(); }
            });
        }

        Ext4.getBody().mask('Updating Statistics');
        Connector.cube.Loader.getCube(function(cube) {
            cube.onReady(doOnReady);
        }, this, true);
    });

    <% if (isUpdateGroups) { %>
    var init = function() {

        var getParticipantUrl = function(participantId)
        {
            var encodedPid = Ext4.util.Format.htmlEncode(participantId);
            var url = LABKEY.ActionURL.buildURL("study", 'participant.view', null, {participantId: encodedPid});
            return "<a href='" + url + "' target='_blank'>" + encodedPid + "</a>";
        };

        var html = [];
        html.push("<h2>Participant Groups</h2>");

        var onGroupUpdate = function(group)
        {
            html.push("<h3>" + Ext4.util.Format.htmlEncode(group.label) + " ");
            var participantIds = group.participantIds;
            if (participantIds.length > 0)
            {
                for (var j = 0; j < participantIds.length; j++)
                {
                    html.push((j == 0) ? "now has participants: " : ", ");
                    html.push(getParticipantUrl(participantIds[j]));
                }
                html.push(".");
            }
            else
            {
                html.push("now has no participants.")
            }

            html.push("</h3>");
            document.getElementById('updateParticipants').innerHTML = html.join("");
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
                    html.push("<h3>No Participant Groups with Live Filters were defined.</h3>");
                    Ext4.get('updateParticipants').update(html.join(""));
                }
                else
                {
                    Connector.cube.Loader.getCube(function(cube) {
                        cube.onReady(function(mdx) {
                            // must configure the same as the application
                            LABKEY.app.model.Filter.dynamicOperatorTypes = true;
                            var subjectName = 'Subject';

                            for (var i = 0; i < groups.length; i++) {
                                LABKEY.app.model.Filter.doParticipantUpdate(mdx, onGroupUpdate, null, groups[i], subjectName);
                            }
                        });
                    }, this, true);
                }
            }
        });
    };

    Ext4.getBody().mask('Updating Groups');

    // Give 'Ext' time to finish any calls
    Ext4.defer(function() {
        Ext = Ext4;
        LABKEY.requiresScript('app/Filter.js', true, function() { Ext4.onReady(init); });
    }, 2500);
    <%
        }
    %>
</script>