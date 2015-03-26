<%@ taglib prefix="labkey" uri="http://www.labkey.org/taglib" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<labkey:form method="POST">
    <span>Click the button below to delete all facts from the fact table</span><br>
    <%= button("Delete Facts").submit(true) %>
</labkey:form>