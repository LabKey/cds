/*
 * Copyright (c) 2014-2019 LabKey Corporation
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
import org.apache.logging.log4j.LogManager;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.module.DefaultModule;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.resource.Resource;
import org.labkey.api.security.AuthenticationManager;
import org.labkey.api.security.User;
import org.labkey.api.util.FileUtil;
import org.labkey.api.util.Path;
import org.labkey.api.util.StringUtilsLabKey;
import org.labkey.api.view.BaseWebPartFactory;
import org.labkey.api.view.JspView;
import org.labkey.api.view.Portal;
import org.labkey.api.view.ViewContext;
import org.labkey.api.view.WebPartFactory;
import org.labkey.api.view.WebPartView;
import org.labkey.api.webdav.WebdavResource;
import org.labkey.api.webdav.WebdavService;
import org.labkey.api.wiki.WikiRendererType;
import org.labkey.api.wiki.WikiService;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
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
    public static final String ASSAY_DOCUMENT_PATH = "AssayDocumentPath";
    public static final String CDS_IMPORT_PATH = "CDSImportPath";
    public static final String REPORT_1_ID = "MAbReportID1";
    public static final String REPORT_1_LABEL = "MAbReportLabel1";
    public static final String REPORT_2_ID = "MAbReportID2";
    public static final String REPORT_2_LABEL = "MAbReportLabel2";
    public static final String WHATYOUNEEDTOKNOW_WIKI_LABEL = "WhatYouNeedToKnowWiki";
    public static final String TOURS_WIKI_LABEL = "ToursWiki";
    private static final String TOURS_WIKI_DEFAULT = "tour-default-wiki";
    private static final String WHATYOUNEEDTOKNOW_WIKI_DEFAULT = "needtoknow-default-wiki";
    public static final String CDS_PUBLIC_PAGE_URL = "CDSPublicPageUrl";

    final ModuleProperty _showHiddenVariables;
    final ModuleProperty _blogPath;
    final ModuleProperty _staticPath;
    final ModuleProperty _startedVideoURL;
    final ModuleProperty _studyDocumentPath;
    final ModuleProperty _assayDocumentPath;
    final ModuleProperty _importFolderPath;

    final ModuleProperty _mabReport1ID;
    final ModuleProperty _mabReport1Label;
    final ModuleProperty _mabReport2ID;
    final ModuleProperty _mabReport2Label;

    //wiki properties for the front page
    final ModuleProperty _whatYouNeedToKnowWiki;
    final ModuleProperty _takeATourWiki;

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

        // TODO would be nice to have a addPropertyChangeListener()

        _startedVideoURL = new ModuleProperty(this, GETTING_STARTED_VIDEO_URL);
        _startedVideoURL.setDescription("The full URL of the intro video. This can include whatever parameters are needed for embedding.");
        _startedVideoURL.setCanSetPerContainer(false);
        addModuleProperty(_startedVideoURL);

        _studyDocumentPath = new ModuleProperty(this, STUDY_DOCUMENT_PATH);
        _studyDocumentPath.setDescription("Full webdav path to which study documents are located");
        _studyDocumentPath.setCanSetPerContainer(false);
        addModuleProperty(_studyDocumentPath);

        _assayDocumentPath = new ModuleProperty(this, ASSAY_DOCUMENT_PATH);
        _assayDocumentPath.setDescription("Full webdav path to which assay documents are located");
        _assayDocumentPath.setCanSetPerContainer(false);
        addModuleProperty(_assayDocumentPath);

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

        _whatYouNeedToKnowWiki = new ModuleProperty(this, WHATYOUNEEDTOKNOW_WIKI_LABEL);
        _whatYouNeedToKnowWiki.setDescription("Source wiki page for 'What You Need to Know' on the front page. The wiki needs to be created in the shared folder.");
        _whatYouNeedToKnowWiki.setCanSetPerContainer(false);
        _whatYouNeedToKnowWiki.setDefaultValue(WHATYOUNEEDTOKNOW_WIKI_DEFAULT);
        addModuleProperty(_whatYouNeedToKnowWiki);

        _takeATourWiki = new ModuleProperty(this, TOURS_WIKI_LABEL);
        _takeATourWiki.setDescription("Source wiki page for 'Tours' on the front page. The wiki needs to be created in the shared folder.");
        _takeATourWiki.setCanSetPerContainer(false);
        _takeATourWiki.setDefaultValue(TOURS_WIKI_DEFAULT);
        addModuleProperty(_takeATourWiki);

        // public page root
        ModuleProperty publicPageUrl = new ModuleProperty(this, CDS_PUBLIC_PAGE_URL);
        publicPageUrl.setDescription("The webdav URL to the main public page.");
        publicPageUrl.setCanSetPerContainer(false);
        addModuleProperty(publicPageUrl);
    }

    @Override
    public String getName()
    {
        return NAME;
    }

    @Override
    public @Nullable Double getSchemaVersion()
    {
        return 23.006;
    }

    @Override
    public boolean hasScripts()
    {
        return true;
    }

    @Override
    @NotNull
    protected Collection<WebPartFactory> createWebPartFactories()
    {
        return List.of(
            new BaseWebPartFactory("CDS Management")
            {
                @Override
                public WebPartView<?> getWebPartView(@NotNull ViewContext portalCtx, @NotNull Portal.WebPart webPart)
                {
                    JspView<Void> view = new JspView<>("/org/labkey/cds/view/begin.jsp");
                    view.setTitle("CDS Management");
                    return view;
                }
            }
        );
    }

    @Override
    protected void init()
    {
        addController("cds", CDSController.class);
        CDSUserSchema.register(this);
        AuthenticationManager.registerProvider(new CDSResetPasswordProvider());
    }


    @Override
    public void doStartup(ModuleContext moduleContext)
    {
        // add a container listener so we'll know when our container is deleted:
        ContainerManager.addContainerListener(new CDSContainerListener());
        ensureShortcuts(true);
        ensureHomePageWikis();
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
                LogManager.getLogger(CDSModule.class).warn("Could not create shortcut from '" + source + "' to '" + target + "'.");
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

    /**
     * Initialize default wiki content for the front page so we have at least some content for the tours
     * and need to know tiles
     */
    private void ensureHomePageWikis()
    {
        insertDefaultWikiIfNotPresent(TOURS_WIKI_LABEL, TOURS_WIKI_DEFAULT);
        insertDefaultWikiIfNotPresent(WHATYOUNEEDTOKNOW_WIKI_LABEL, WHATYOUNEEDTOKNOW_WIKI_DEFAULT);
    }

    private void insertDefaultWikiIfNotPresent(String wikiLabel, String defaultWikiValue)
    {
        Map<String, ModuleProperty> moduleProperties = getModuleProperties();
        List<String> existingWikis = WikiService.get().getNames(ContainerManager.getSharedContainer());
        if (moduleProperties.containsKey(wikiLabel))
        {
            if (defaultWikiValue.equals(moduleProperties.get(wikiLabel).getEffectiveValue(ContainerManager.getRoot())))
            {
                if (!existingWikis.contains(defaultWikiValue))
                {
                    try
                    {
                        Resource r = getModuleResource(Path.parse("cds-tours/wikis/" + defaultWikiValue));
                        if (r != null && r.exists() && r.isFile())
                        {
                            ByteArrayOutputStream baos = new ByteArrayOutputStream();
                            try (InputStream in = r.getInputStream())
                            {
                                if (in != null)
                                {
                                    FileUtil.copyData(in, baos);
                                }
                            }
                            String content = new String(baos.toByteArray(), StringUtilsLabKey.DEFAULT_CHARSET);
                            WikiService.get().insertWiki(User.getSearchUser(), ContainerManager.getSharedContainer(), defaultWikiValue, content, WikiRendererType.HTML, defaultWikiValue);
                        }
                    }
                    catch (IOException e)
                    {
                        throw new RuntimeException();
                    }
                }
            }
        }
    }
}
