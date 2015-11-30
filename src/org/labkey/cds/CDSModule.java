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

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.security.AuthenticationManager;
import org.labkey.api.util.Path;
import org.labkey.api.view.BaseWebPartFactory;
import org.labkey.api.view.JspView;
import org.labkey.api.view.Portal;
import org.labkey.api.view.ViewContext;
import org.labkey.api.view.WebPartFactory;
import org.labkey.api.view.WebPartView;
import org.labkey.api.webdav.WebdavService;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class CDSModule extends DefaultModule
{
    public static String NAME = "CDS";

    final ModuleProperty _showHiddenVariables;
    final ModuleProperty _blogPath;
    final ModuleProperty _staticPath;
    final ModuleProperty _cmsURL;
    final ModuleProperty _startedVideoURL;


    public CDSModule()
    {
        _showHiddenVariables = new ModuleProperty(this, "ShowHiddenVariables");
        _showHiddenVariables.setDescription("If 'true', show all variables (including hidden) in the variable selector in devMode.");
        _showHiddenVariables.setCanSetPerContainer(true);
        addModuleProperty(_showHiddenVariables);

        _blogPath = new ModuleProperty(this, "BlogPath");
        _blogPath.setDescription("Full webdav path to which the short-cut '/blog/' will point");
        _blogPath.setCanSetPerContainer(false);
        addModuleProperty(_blogPath);

        _staticPath = new ModuleProperty(this, "StaticPath");
        _staticPath.setDescription("Full webdav path to which the short-cut '/static/' will point");
        _staticPath.setCanSetPerContainer(false);
        addModuleProperty(_staticPath);

        _cmsURL = new ModuleProperty(this, "CMS");
        _cmsURL.setDescription("Full URL to CMS web server");
        _cmsURL.setCanSetPerContainer(true);
        addModuleProperty(_cmsURL);

        // TODO would be nice to have a addPropertyChangeListener()

        _startedVideoURL = new ModuleProperty(this, "GettingStartedVideoURL");
        _startedVideoURL.setDescription("The full URL of the intro video. This can include whatever parameters are needed for embedding.");
        _startedVideoURL.setCanSetPerContainer(false);
        addModuleProperty(_startedVideoURL);
    }

    public String getName()
    {
        return NAME;
    }

    public double getVersion()
    {
        return 15.302;
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
        AuthenticationManager.registerProvider(new CDSResetPasswordProvider(), AuthenticationManager.Priority.Low);
    }


    public void doStartup(ModuleContext moduleContext)
    {
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new CDSContainerListener());
        ensureShortcuts();
    }

    // this is a silly hack, but since I don't have addPropertyChangeLister()...
    // keep previous value so I can see if I need to change the setting
    String lastStaticPath = "";
    String lastBlogPath = "";

    public synchronized void ensureShortcuts()
    {
        String staticPath = getPropertyValue(_staticPath,null);
        if (!StringUtils.equals(lastStaticPath,staticPath))
        {
            updateShortcut("/static/", staticPath);
            lastStaticPath = staticPath;
        }

        String blogPath = getPropertyValue(_blogPath,null);
        if (!StringUtils.equals(lastBlogPath,blogPath))
        {
            updateShortcut("/blog/", blogPath);
            lastBlogPath = blogPath;
        }
    }

    private void updateShortcut(String from, String to)
    {
        try
        {
            WebdavService.get().removeLink(Path.parse(from));
        }
        catch (IllegalArgumentException x)
        {
        }
        try
        {
            if (StringUtils.isNotEmpty(to) && 0 < Path.parse(to).size())
                WebdavService.get().addLink(Path.parse(from), Path.parse(to), "index.html");
        }
        catch (IllegalArgumentException x)
        {
            Logger.getLogger(CDSModule.class).warn("Could not create shortcut from '" + from + "' to '" + to + "'.");
        }
    }


    String getPropertyValue(ModuleProperty mp, @Nullable Container c)
    {
        if (!mp.isCanSetPerContainer() || null==c)
            c = ContainerManager.getRoot();
        return PropertyManager.getProperty(PropertyManager.SHARED_USER,c,mp.getCategory(),mp.getName());
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
