/*
 * Copyright (c) 2017 LabKey Corporation
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
package org.labkey.test.pages.cds;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.cds.CDSHelper;

public class LearnDetailsPage
{
    protected BaseWebDriverTest _test;

    public LearnDetailsPage(BaseWebDriverTest test)
    {
        _test = test;
    }

    public DetailLearnGrid getGridTab(String tab)
    {
        _test.click(Locators.tabHeaders.withText(tab));
        _test.sleep(CDSHelper.CDS_WAIT);
        return new DetailLearnGrid(_test);
    }

    public static class Locators
    {
        public static Locator.XPathLocator tabHeaders = new Locator.XPathLocator("//div").withClass("learnabouttab").child("h1");
    }

    public class DetailLearnGrid extends LearnGrid
    {
        public DetailLearnGrid(BaseWebDriverTest test)
        {
            super(test);
        }

        @Override
        @LogMethod
        public int getRowCount()
        {
            return Locators.unifiedRow.findElements(_test.getDriver()).size();
        }
    }

}
