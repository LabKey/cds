/*
 * Copyright (c) 2014-2017 LabKey Corporation
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
import org.labkey.api.webdav.WebdavResource;
import org.labkey.api.webdav.WebdavService;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Set;

public class CDSModule extends DefaultModule
{
    public static String NAME = "CDS";

    public static final String SHOW_HIDDEN_VARIABLES = "ShowHiddenVariables";
    public static final String BLOG_PATH = "BlogPath";
    public static final String STATIC_PATH = "StaticPath";
    public static final String CMS = "CMS";
    public static final String GETTING_STARTED_VIDEO_URL = "GettingStartedVideoURL";
    public static final String STUDY_DOCUMENT_PATH = "StudyDocumentPath";
    public static final String CDS_IMPORT_PATH = "CDSImportPath";
    public static final String REPORT_1_ID = "MAbReportID1";
    public static final String REPORT_1_LABEL = "MAbReportLabel1";
    public static final String REPORT_2_ID = "MAbReportID2";
    public static final String REPORT_2_LABEL = "MAbReportLabel2";

    final ModuleProperty _showHiddenVariables;
    final ModuleProperty _blogPath;
    final ModuleProperty _staticPath;
    final ModuleProperty _cmsURL;
    final ModuleProperty _startedVideoURL;
    final ModuleProperty _studyDocumentPath;
    final ModuleProperty _importFolderPath;

    final ModuleProperty _mabReport1ID;
    final ModuleProperty _mabReport1Label;
    final ModuleProperty _mabReport2ID;
    final ModuleProperty _mabReport2Label;

    public CDSModule()
    {
        _showHiddenVariables = new ModuleProperty(this, SHOW_HIDDEN_VARIABLES);
        _showHiddenVariables.setDescription("If 'true', show all variables (including hidden) in the variable selector in devMode.");
        _showHiddenVariables.setCanSetPerContainer(true);
        addModuleProperty(_showHiddenVariables);

        _blogPath = new ModuleProperty(this, BLOG_PATH);
        _blogPath.setDescription("Full webdav path to which the short-cut '/blog/' will point");
        _blogPath.setCanSetPerContainer(false);
        addModuleProperty(_blogPath);

        _staticPath = new ModuleProperty(this, STATIC_PATH);
        _staticPath.setDescription("Full webdav path to which the short-cut '/static/' will point");
        _staticPath.setCanSetPerContainer(false);
        addModuleProperty(_staticPath);

        _cmsURL = new ModuleProperty(this, CMS);
        _cmsURL.setDescription("Full URL to CMS web server");
        _cmsURL.setCanSetPerContainer(true);
        addModuleProperty(_cmsURL);

        // TODO would be nice to have a addPropertyChangeListener()

        _startedVideoURL = new ModuleProperty(this, GETTING_STARTED_VIDEO_URL);
        _startedVideoURL.setDescription("The full URL of the intro video. This can include whatever parameters are needed for embedding.");
        _startedVideoURL.setCanSetPerContainer(false);
        addModuleProperty(_startedVideoURL);

        _studyDocumentPath = new ModuleProperty(this, STUDY_DOCUMENT_PATH);
        _studyDocumentPath.setDescription("Full webdav path to which study documents are located");
        _studyDocumentPath.setCanSetPerContainer(false);
        addModuleProperty(_studyDocumentPath);

        _importFolderPath = new ModuleProperty(this, CDS_IMPORT_PATH);
        _importFolderPath.setDescription("File path that cds import files are located");
        _importFolderPath.setCanSetPerContainer(false);
        addModuleProperty(_importFolderPath);

        _mabReport1ID = new ModuleProperty(this, REPORT_1_ID);
        _mabReport1ID.setDescription("Report Id for the 1st MAb R report, should start with 'db:'");
        _mabReport1ID.setCanSetPerContainer(false);
        addModuleProperty(_mabReport1ID);

        _mabReport1Label = new ModuleProperty(this, REPORT_1_LABEL);
        _mabReport1Label.setDescription("Button display label for the 1st MAb R report on MAb grid");
        _mabReport1Label.setCanSetPerContainer(false);
        addModuleProperty(_mabReport1Label);

        _mabReport2ID = new ModuleProperty(this, REPORT_2_ID);
        _mabReport2ID.setDescription("Report Id for the 2nd MAb R report, should start with 'db:'");
        _mabReport2ID.setCanSetPerContainer(false);
        addModuleProperty(_mabReport2ID);

        _mabReport2Label = new ModuleProperty(this, REPORT_2_LABEL);
        _mabReport2Label.setDescription("Button display label for the 1st MAb R report on MAb grid");
        _mabReport2Label.setCanSetPerContainer(false);
        addModuleProperty(_mabReport2Label);
    }

    public String getName()
    {
        return NAME;
    }

    public double getVersion()
    {
        return 18.13;
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
        AuthenticationManager.registerProvider(new CDSResetPasswordProvider());
    }


    public void doStartup(ModuleContext moduleContext)
    {
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new CDSContainerListener());
        ensureShortcuts(true);
    }


    // this is a silly hack, but since I don't have addPropertyChangeLister()...
    // keep previous value so I can see if I need to change the setting
    String lastStaticPath = "";
    String lastBlogPath = "";

    public synchronized void ensureShortcuts(boolean force)
    {
        lastStaticPath = ensureShortcut(_staticPath, lastStaticPath, "/static/", force);
        lastBlogPath = ensureShortcut(_blogPath, lastBlogPath, "/blog/", force);
    }

    private String ensureShortcut(ModuleProperty prop, String prevTarget, String source, boolean force)
    {
        String target = getPropertyValue(prop,null);
        Path targetPath = StringUtils.isEmpty(target) ? null : Path.parse(target);
        Path sourcePath = Path.parse(source);

        // CLEAR
        if (null == targetPath || 0==targetPath.size())
        {
            if (force || !StringUtils.equals(target,prevTarget))
            {
                try
                {
                    WebdavService.get().removeLink(sourcePath);
                }
                catch (IllegalArgumentException x)
                {
                }
            }
        }
        // SET
        else
        {
            try
            {
                WebdavResource r = WebdavService.get().getRootResolver().lookup(sourcePath);
                if (force || null == r || !targetPath.equals(r.getPath()))
                    WebdavService.get().addLink(sourcePath, targetPath, "index.html");
            }
            catch (IllegalArgumentException x)
            {
                Logger.getLogger(CDSModule.class).warn("Could not create shortcut from '" + source + "' to '" + target + "'.");
            }
        }
        return target;
    }


    String getPropertyValue(ModuleProperty mp, @Nullable Container c)
    {
        if (!mp.isCanSetPerContainer() || null==c)
            c = ContainerManager.getRoot();
        return mp.getEffectiveValue(c);
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
