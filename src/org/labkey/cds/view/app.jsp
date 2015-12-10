<%
/*
 * Copyright (c) 2014-2015 LabKey Corporation
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
<!-- Required for Ext.history -->
<form id="history-form" class="x-hide-display">
    <input type="hidden" id="x-history-field" value="">
    <iframe id="x-history-frame" style="border: none;"></iframe>
</form>
<noscript>
    Sorry! Your browser does not support Javascript. Javascript is required for the HIV Data Connector.
</noscript>