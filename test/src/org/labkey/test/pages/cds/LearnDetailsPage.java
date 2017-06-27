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
