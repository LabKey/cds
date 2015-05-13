<%@ taglib prefix="labkey" uri="http://www.labkey.org/taglib" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<labkey:errors/>
<labkey:form method="POST">
    <input name="path" type="text" placeholder="<Full pipeline directory path>">
    <%= button("Start Archive Import").submit(true) %>
</labkey:form>