/*
 * Copyright (c) 2017-2018 LabKey Corporation
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
public class CDSMetadataContainerFilter extends ContainerFilter.ContainerFilterWithPermission
{
    public CDSMetadataContainerFilter(Container c, User user)
    {
        super(c, user);
    }

    @Override
    public Collection<GUID> generateIds(Container currentContainer, Class<? extends Permission> perm, Set<Role> roles)
    {
        assert null == _container || _container.equals(currentContainer);

        HashSet<GUID> allowedContainerIds = new HashSet<>();
        Container project = currentContainer.getProject();
        if (null != project &&  project.hasPermission(_user, perm, roles))
        {
            Set<Container> containers = new HashSet<>(removeDuplicatedContainers(ContainerManager.getAllChildren(project)));
            allowedContainerIds.addAll(ContainerFilter.toIds(containers));
        }

        return allowedContainerIds;
    }
}
