package org.labkey.cds.view.template;

import org.labkey.api.data.Container;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.ViewContext;
import org.labkey.api.view.WebPartView;
import org.labkey.api.view.template.PageConfig;
import org.labkey.api.view.template.PrintTemplate;
import org.springframework.web.servlet.ModelAndView;

/**
 * Created by Joe on 8/28/2015.
 */
public class FrontPageTemplate extends PrintTemplate
{
    public FrontPageTemplate(PageConfig page)
    {
        super("/org/labkey/cds/view/template/FrontPage.jsp", page);
        setFrame(WebPartView.FrameType.NONE);
    }
}
