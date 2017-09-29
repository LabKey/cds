package org.labkey.test.tests.cds;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.pages.cds.XAxisVariableSelector;
import org.labkey.test.pages.cds.YAxisVariableSelector;
import org.labkey.test.util.cds.CDSHelper;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 90)
public class CDSHiddenVarsTest extends CDSReadOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);

    @Test
    public void testVariablesAreHidden()
    {
        cds.initModuleProperties(false);

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

        cds.initModuleProperties(true); //TODO test dependency here, if this test fail and module property not set back to true, subsequent test that deal with variables would likely also fail
    }

}