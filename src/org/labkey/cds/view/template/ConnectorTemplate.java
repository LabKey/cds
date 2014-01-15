package org.labkey.cds.view.template;

import org.labkey.api.data.Container;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.ViewContext;
import org.labkey.api.view.template.PageConfig;
import org.labkey.api.view.template.PrintTemplate;
import org.springframework.web.servlet.ModelAndView;

/**
 * Created by Nick Arnold on 1/15/14.
 */
public class ConnectorTemplate extends PrintTemplate
{
    public ConnectorTemplate(ViewContext context, Container c, ModelAndView body, PageConfig page, NavTree[] navTrail)
    {
        this("/org/labkey/cds/view/template/ConnectorTemplate.jsp", context, c, body, page, navTrail);
    }

    protected ConnectorTemplate(String template, ViewContext context, Container c, ModelAndView body, PageConfig page, NavTree[] navTrail)
    {
        super(template, page);
        setFrame(FrameType.NONE);
        setBody(body);
    }
}
