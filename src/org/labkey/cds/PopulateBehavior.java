/*
 * Copyright (c) 2014 LabKey Corporation
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


import java.util.List;

/**
 * Used as the model bean to control whether the populateCube action updates the participant groups or not
 * when it is complete
 */
public class PopulateBehavior
{
    private final List<FactLoader> factLoaders;
    private final boolean isUpdateParticipantGroups;

    public PopulateBehavior(List<FactLoader> factLoaders, boolean isUpdateParticipantGroups)
    {
        this.factLoaders = factLoaders;
        this.isUpdateParticipantGroups = isUpdateParticipantGroups;
    }

    public List<FactLoader> getFactLoaders()
    {
        return this.factLoaders;
    }

    public boolean isUpdateParticipantGroups()
    {
        return this.isUpdateParticipantGroups;
    }
}
