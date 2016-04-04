/*
 * Copyright (c) 2015-2016 LabKey Corporation
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

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.security.AuthenticationProvider.ResetPasswordProvider;
import org.labkey.api.settings.LookAndFeelProperties;
import org.labkey.api.view.ActionURL;

import javax.servlet.http.HttpServletRequest;

/**
 * Created by xingyang on 10/19/15.
 */
public class CDSResetPasswordProvider implements ResetPasswordProvider
{
    private static final String NAME        = "cds";
    private static final String DESCRIPTION = "CDS Reset Password Provider";
    @Override
    public ActionURL getAPIVerificationURL(Container c, boolean isAddUser)
    {
        ActionURL url = new ActionURL(CDSController.AppAction.class, LookAndFeelProperties.getSettingsContainer(c));
        if (isAddUser)
            url.addParameter("create_account", true);
        else
            url.addParameter("create_password", true);

        return url;
    }

    @Nullable
    @Override
    public ActionURL getConfigurationLink()
    {
        return null;
    }

    @Override
    public String getName()
    {
        return NAME;
    }

    @Override
    public String getDescription()
    {
        return DESCRIPTION;
    }

    @Override
    public void logout(HttpServletRequest request)
    {

    }

    @Override
    public void activate()
    {

    }

    @Override
    public void deactivate()
    {

    }

    @Override
    public boolean isPermanent()
    {
        return false;
    }

}
