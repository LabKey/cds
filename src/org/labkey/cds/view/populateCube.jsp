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
<%@ page import="org.labkey.api.study.DataSet"%>
<%@ page import="org.labkey.api.study.Study" %>
<%@ page import="org.labkey.api.study.StudyService" %>
<%@ page import="org.labkey.api.study.StudyUrls" %>
<%@ page import="org.labkey.api.util.PageFlowUtil" %>
<%@ page import="org.labkey.api.view.ViewContext" %>
<%@ page import="org.labkey.cds.FactLoader" %>
<%@ page import="java.util.List" %>
<%@ page import="org.labkey.cds.PopulateBehavior" %>
<%@ page import="org.labkey.api.query.UserSchema" %>
<%@ page import="org.labkey.api.query.QueryService" %>
<%@ page import="org.labkey.api.view.template.ClientDependency" %>
<%@ page import="java.util.LinkedHashSet" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%!
    public LinkedHashSet<ClientDependency> getClientDependencies()
    {
        LinkedHashSet<ClientDependency> resources = new LinkedHashSet<>();
        resources.add(ClientDependency.fromFilePath("Ext4"));
        return resources;
    }
%>
<%
    ViewContext context = getViewContext();
    Container c = getContainer();
    Study study = StudyService.get().getStudy(c);
    PopulateBehavior behavior = (PopulateBehavior) this.getModelBean();
    List<? extends DataSet> datasets = study.getDataSets();
    List<String> selectedDatasets = context.getList("dataset");
    boolean selected = null != selectedDatasets && selectedDatasets.size() > 0;
    StudyUrls studyUrls = PageFlowUtil.urlProvider(StudyUrls.class);
    UserSchema studySchema = QueryService.get().getUserSchema(getUser(), c, "study");

%>
This action deletes all rows from the fact table and populates it with data from the datasets in the study.
<% if (behavior.isUpdateParticipantGroups()) { %>
  After the fact table has been populated successfully, participant groups saved with a Live Filter will be updated to reflect their latest participant information.
<% } %>
<br><br>
For each selected dataset below the cube in this folder will be populated using the columns illustrated. <br>
Columns for mapping are found if they look up to the relevant columns in the cds schema or if their names match some predefined names.
The columns used for mapping are shown below each table.<br>
<b>Note</b> If the dataset contains lookups that are not in the cds dimension tables (e.g. Assays), rows will be added to the cds table automatically to preserve foreign keys. Details in those rows will need
to be filled in by another mechanism.<br>
<%=this.formatErrorsForPath("form")%>
<form method="post" id="populatecubeform">

<% for(DataSet ds : datasets) {
    if (ds.isDemographicData())
        continue; //We don't populate fact table with demographic data. Assume all ptids already listed somehow
%>

    <h3><input type='checkbox' name='dataset'<%=checked(!selected || selectedDatasets.contains(ds.getName()))%> value='<%=h(ds.getName())%>'>
        <a href="<%=studyUrls.getDatasetURL(c, ds.getDataSetId())%>"><%=h(ds.getName())%></a></h3>
    <%
    FactLoader mapper = new FactLoader(studySchema, ds, getUser(), c);
        for (FactLoader.ColumnMapper colMapper : mapper.getMappings())
        {
            if (colMapper.getSelectName().equalsIgnoreCase("container"))
                continue;

            String mapping;
            if (colMapper.getSourceColumn() != null)
                mapping = colMapper.getSourceColumn().getName();
            else if (colMapper.getConstValue() != null)
                mapping = "'" + colMapper.getConstValue() + "'";
            else
                mapping = "NULL";
    %>
            <%=h(colMapper.getSelectName())%> : <%=mapping%><br>
    <%  }  %>
    <br>
    <!--
    SQL Used to populate table
    <%=h(mapper.getPopulateSql().toString(), true)%> -->
<%} %>
    <div id="validatemessages" style="display: none;"></div>
    <input type="submit" onclick="validatePopulate(); return false;">
</form>
<script type="text/javascript">

    var validatePopulate = function() {

        var SUBJECT_COLUMN = LABKEY.moduleContext.study.subject.columnName;

        var VACCINE_INNER =
                'SELECT' +
                        ' treatmentId, productId, Product.rowId, label, type' +
                        ' FROM TreatmentProductMap' +
                        ' JOIN Product' +
                        ' ON TreatmentProductMap.productId = Product.rowId';

        var VACCINE_OUTER =
                'SELECT' +
                        ' ParticipantTreatments.treatmentId, T.label, T.type' +
                        ' FROM ParticipantTreatments' +
                        ' JOIN ( ' + VACCINE_INNER + ' ) AS T' +
                        ' ON T.treatmentId = ParticipantTreatments.treatmentId';

        var checks = [{
            schema: 'cds',
            sql: 'SELECT clade, id, countryoforigin, tier, specimensource FROM antigens',
            area: 'Antigen Dimension'
        },{
            schema: 'study',
            sql: 'SELECT target, name, label, methodology FROM StudyDesignAssays',
            area: 'Assay Dimension'
        },{
            schema: 'study',
            sql: 'SELECT ' + SUBJECT_COLUMN + ', ' + SUBJECT_COLUMN + '.ParticipantId AS Inner' + SUBJECT_COLUMN +', Folder, race, country, sex, ethnicity, gender FROM Demographics',
            area: 'Subject Dimension'
        },{
            schema: 'study',
            sql: VACCINE_INNER,
            area: 'Vaccine Dimension Inner Query'
        },{
            schema: 'study',
            sql: VACCINE_OUTER,
            area: 'Vaccine Dimension Outer Query'
        },{
            schema: 'study',
            sql: 'SELECT Name FROM StudyDesignLabs',
            area: 'Lab Dimension'
        },{
            schema: 'study',
            sql: 'SELECT container, label FROM StudyProperties',
            area: 'Study Dimension'
        },{
            schema: 'cds',
            sql: 'SELECT participantid, antigen, assay, lab, study FROM Facts',
            area: 'Facts Table'
        }];

        var messageEl = Ext4.get('validatemessages');
        messageEl.update('');

        var doQuery = function(index) {
            var target = checks[index];
            LABKEY.Query.executeSql({
                schemaName: target.schema,
                sql: target.sql,
                maxRows: 0,
                success: function() {
                    if (index+1 < checks.length) {
                        doQuery(index+1);
                    }
                    else {
                        var formEl = document.getElementById('populatecubeform');
                        if (formEl) {
                            formEl.submit();
                        }
                    }
                },
                failure: function(response) {
                    messageEl.setStyle('display', 'block');

                    var msg = '<p style="color: red;">CUBE SCHEMA VALIDATION</p>';
                    msg += '<p style="color: red;">These generally mean that columns are missing from a table or a table is missing.<br/>These tables/columns are required by the Cube definition.</p>';
                    msg += '<p style="color: red;">' + target.area + ': ' + response.exception + '</p>';

                    messageEl.update(msg);
                }
            });
        };

        if (checks.length > 0) {
            doQuery(0);
        }
    };

</script>

