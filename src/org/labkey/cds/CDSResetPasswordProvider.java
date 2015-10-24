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
    private static final String NAME = "cds";
    @Override
    public ActionURL getAPIVerificationURL(Container c)
    {
        ActionURL url = new ActionURL(CDSController.AppAction.class, LookAndFeelProperties.getSettingsContainer(c));
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
        return null;
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
