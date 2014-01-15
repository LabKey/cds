/*
 * Copyright (c) 2013 LabKey Corporation
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
package org.labkey.cds.view.template;

import org.labkey.api.data.Container;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.ViewContext;
import org.labkey.api.view.template.PageConfig;
import org.labkey.api.view.template.PrintTemplate;
import org.springframework.web.servlet.ModelAndView;

/**
 * User: Nick Arnold
 * Date: 10/10/13
 */
public class SandboxTemplate extends PrintTemplate
{
    public SandboxTemplate(ViewContext context, Container c, ModelAndView body, PageConfig page, NavTree[] navTrail)
    {
        this("/org/labkey/cds/view/template/SandboxTemplate.jsp", context, c, body, page, navTrail);
    }

    protected SandboxTemplate(String template, ViewContext context, Container c, ModelAndView body, PageConfig page, NavTree[] navTrail)
    {
        super(template, page);
        setFrame(FrameType.NONE);
        setBody(body);
    }
}