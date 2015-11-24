<%@ page import="org.labkey.cds.CDSController" %>
<%@ page import="org.labkey.api.view.HttpView" %>
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