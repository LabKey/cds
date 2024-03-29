/*
 * Copyright (c) 2017-2019 LabKey Corporation
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
package org.labkey.test.tests.cds;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.pages.cds.XAxisVariableSelector;
import org.labkey.test.pages.cds.YAxisVariableSelector;
import org.labkey.test.util.cds.CDSHelper;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 10)
public class CDSHiddenVarsTest extends CDSReadOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);

    @Test
    public void testVariablesAreHidden()
    {
        goToProjectHome();
        cds.enterApplication();

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        assertTextNotPresent(CDSHelper.NAB_HIDDEN_VARS);
        yaxis.cancelSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.NAB);
        assertTextNotPresent(CDSHelper.NAB_HIDDEN_VARS);
        xaxis.cancelSelection();
    }

    @Override
    protected boolean shouldShowHiddenVariables()
    {
        return false;
    }
}
