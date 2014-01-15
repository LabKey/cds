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
<!-- Required for Ext.history -->
<form id="history-form" class="x4-hide-display">
    <input type="hidden" id="x4-history-field" value="">
    <iframe id="x4-history-frame"></iframe>
</form>
<div id="tip-content" style="display: none;">
    <div id="chartdemography" class="featuretip">
        <div style="float: left;">
            <img src="<%=text(contextPath)%>/cds/images/compare.png" height="142px" width="156px" alt="Compare Demography"/>
        </div>
        <div>
            <p style="padding-top: 20px;">Future Feature</p>
            <p style="font-weight: normal; padding-top: 5px;">Compare groups of participants by demographic characteristics.</p>
        </div>
    </div>
    <div id="searchtip" class="featuretip" style="width: 200px;">
        <div>
            <p style="padding-top: 20px;">Future Feature</p>
            <p style="font-weight: normal; padding-top: 5px;">Capability to search the Data Connector across multiple studies with targeted results.</p>
        </div>
    </div>
</div>
<noscript>
    Sorry! Your browser does not support Javascript. Javascript is required for the HIV Data Connector.
</noscript>
