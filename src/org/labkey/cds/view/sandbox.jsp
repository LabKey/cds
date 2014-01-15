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
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    String contextPath = request.getContextPath();
%>
<!-- View Templates -->
<script id="cdslayout" type="text/template">
    <div id="header">Header</div>
    <div class="cds-body">
        <div id="main"></div>
        <div id="navigation"></div>
    </div>
</script>
<script id="headerview" type="text/template">
    <div class="logo">
        <h2>hiv vaccine data <span>connector</span></h2>
        <img src="<%=text(contextPath)%>/cds/images/logo_03.png" style="padding-top: 11px; width: 32px;">
    </div>
</script>
<script id="mainview" type="text/template">MAIN</script>
<script id="navigationview" type="text/template">NAVIGATION</script>
<script id="summaryview" type="text/template">SUMMARY</script>

<!-- Start the App -->
<script type="text/javascript">CDS.start();</script>