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

package org.labkey.cds;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.view.BaseWebPartFactory;
import org.labkey.api.view.JspView;
import org.labkey.api.view.Portal;
import org.labkey.api.view.ViewContext;
import org.labkey.api.view.WebPartFactory;
import org.labkey.api.view.WebPartView;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class CDSModule extends DefaultModule
{
    public static String NAME = "CDS";

    public String getName()
    {
        return NAME;
    }

    public double getVersion()
    {
        return 15.281;
    }

    public boolean hasScripts()
    {
        return true;
    }

    @NotNull
    protected Collection<WebPartFactory> createWebPartFactories()
    {
        return new ArrayList<>(Collections.singletonList(
                new BaseWebPartFactory("CDS Management")
                {
                    @Override
                    public WebPartView getWebPartView(@NotNull ViewContext portalCtx, @NotNull Portal.WebPart webPart)
                    {
                        JspView view = new JspView("/org/labkey/cds/view/begin.jsp");
                        view.setTitle("CDS Management");
                        return view;
                    }
                }
        ));
    }

    protected void init()
    {
        addController("cds", CDSController.class);
        CDSUserSchema.register(this);
    }


    public void doStartup(ModuleContext moduleContext)
    {
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new CDSContainerListener());
    }


    @NotNull
    @Override
    public Collection<String> getSummary(Container c)
    {
        return Collections.emptyList();
    }

    @NotNull
    @Override
    public Set<String> getSchemaNames()
    {
        return Collections.singleton("cds");
    }
}
