package org.labkey.cds;

import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.Role;
import org.labkey.api.util.GUID;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

/**
 * Created by xingyang on 4/28/17.
 * Metadata table check user permission at project folder, rather than study folders
 */
public class CDSMetadataContainerFilter extends ContainerFilter.ContainerFilterWithUser
{
    public CDSMetadataContainerFilter(User user)
    {
        super(user);
    }

    @Override
    public Collection<GUID> getIds(Container currentContainer, Class<? extends Permission> perm, Set<Role> roles)
    {
        HashSet<GUID> allowedContainerIds = new HashSet<>();
        Container project = currentContainer.getProject();
        if (null != project &&  project.hasPermission(_user, perm, roles))
        {
            Set<Container> containers = new HashSet<>(removeWorkbooks(ContainerManager.getAllChildren(project)));
            allowedContainerIds.addAll(ContainerFilter.toIds(containers));
        }

        return allowedContainerIds;
    }
}
