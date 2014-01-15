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
<%@ page import="org.labkey.api.data.Container"%>
<%@ page import="org.labkey.api.study.DataSet"%>
<%@ page import="org.labkey.api.study.Study" %>
<%@ page import="org.labkey.api.study.StudyService" %>
<%@ page import="org.labkey.api.study.StudyUrls" %>
<%@ page import="org.labkey.api.util.PageFlowUtil" %>
<%@ page import="org.labkey.api.view.ViewContext" %>
<%@ page import="org.labkey.cds.FactLoader" %>
<%@ page import="java.util.List" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    ViewContext context = getViewContext();
    Container c = getContainer();
    Study study = StudyService.get().getStudy(c);

    List<? extends DataSet> datasets = study.getDataSets();
    List<String> selectedDatasets = context.getList("dataset");
    boolean selected = null != selectedDatasets && selectedDatasets.size() > 0;
    StudyUrls studyUrls = PageFlowUtil.urlProvider(StudyUrls.class);

%>
This action deletes all rows from the fact table and populates it with data from the datasets in the study.<br><br>

For each selected dataset below the cube in this folder will be populated using the columns illustrated. <br>
Columns for mapping are found if they look up to the relevant columns in the cds schema or if their names match some predefined names.
The columns used for mapping are shown below each table.<br>
<b>Note</b> If the dataset contains lookups that are not in the cds dimension tables (e.g. Assays), rows will be added to the cds table automatically to preserve foreign keys. Details in those rows will need
to be filled in by another mechanism.<br>
<%=this.formatErrorsForPath("form")%>
<form method="post">

<% for(DataSet ds : datasets) {
    if (ds.isDemographicData())
        continue; //We don't populate fact table with demographic data. Assume all ptids already listed somehow
%>

    <h3><input type='checkbox' name='dataset'<%=checked(!selected || selectedDatasets.contains(ds.getName()))%> value='<%=h(ds.getName())%>'>
        <a href="<%=studyUrls.getDatasetURL(c, ds.getDataSetId())%>"><%=h(ds.getName())%></a></h3>
    <%
    FactLoader mapper = new FactLoader(ds, getUser(), c);
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
<input type=submit>
</form>

