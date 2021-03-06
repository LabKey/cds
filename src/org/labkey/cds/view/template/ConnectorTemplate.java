/*
 * Copyright (c) 2014-2018 LabKey Corporation
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

import org.labkey.api.view.JspView;
import org.labkey.api.view.template.PageConfig;
import org.springframework.web.servlet.ModelAndView;

/**
 * Created by Nick Arnold on 1/15/14.
 */
public class ConnectorTemplate extends JspView<PageConfig>
{
    private Object model;

    public ConnectorTemplate(ModelAndView body, PageConfig page, Object model)
    {
        super("/org/labkey/cds/view/template/ConnectorTemplate.jsp", page);
        this.model = model;
        page.setShowHeader(false);
        setFrame(FrameType.NONE);
        setBody(body);
    }

    public Object getConnectorModel()
    {
        return model;
    }
}
