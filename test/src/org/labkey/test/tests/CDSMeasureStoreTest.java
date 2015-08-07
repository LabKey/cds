package org.labkey.test.tests;

import org.apache.http.HttpStatus;
import org.jetbrains.annotations.Nullable;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.WebTestHelper;
import org.labkey.test.categories.CDS;
import org.labkey.test.pages.DemoMeasureStorePage;
import org.labkey.test.util.CDSHelper;
import org.labkey.test.util.CDSInitializer;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PostgresOnlyTest;
import org.labkey.test.util.ReadOnlyTest;
import org.labkey.test.util.UIContainerHelper;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Created by cnathe on 8/3/2015.
 */

@Category({CDS.class})
public class CDSMeasureStoreTest extends BaseWebDriverTest implements PostgresOnlyTest, ReadOnlyTest
{

    @Nullable
    @Override
    protected String getProjectName()
    {
        return CDSHelper.CDS_PROJECT_NAME;
    }

    @Override
    protected BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Arrays.asList("CDS");
    }

    public void doSetup() throws Exception
    {
        CDSMeasureStoreTest initTest = (CDSMeasureStoreTest)getCurrentTest();
        CDSInitializer _initializer = new CDSInitializer(initTest, initTest.getProjectName());
        _initializer.setupDataspace();
    }

    @Override @LogMethod
    public boolean needsSetup()
    {
        boolean callDoCleanUp = false;

        try
        {
            if(HttpStatus.SC_NOT_FOUND == WebTestHelper.getHttpGetResponse(WebTestHelper.buildURL("project", getProjectName(), "begin")))
            {
                callDoCleanUp = false;
                doSetup();
            }

        }
        catch (IOException fail)
        {
            callDoCleanUp =  true;
        }
        catch(java.lang.Exception ex)
        {
            callDoCleanUp = true;
        }

        // Returning true will cause BaseWebDriver to call it's cleanup method.
        return callDoCleanUp;
    }


    @Test
    public void testDemoMeasureStore()
    {
        beginAt("/cds/" + CDSHelper.CDS_PROJECT_NAME + "/demoMeasureStore.view");

        verifyPlot(new Plot(
            "No X-Axis Measure",
            3713,
            new String[]{"0","0.5","1","1.5","2","2.5","3","3.5","4","4.5","5"},
            new String[]{""}
        ));

        verifyPlot(new Plot(
            "Categorical X-Axis Measure from Demographic",
            3713,
            new String[]{"0","0.5","1","1.5","2","2.5","3","3.5","4","4.5","5"},
            new String[]{"White", "Black", "Multiracial", "Asian", "Other", "Native American/Alas", "Native Hawaiian/Paci"}
        ));

        verifyPlot(new Plot(
            "Numeric X-Axis Measure from Demographic",
            10542,
            new String[]{"0","0.5","1","1.5","2","2.5","3","3.5","4","4.5","5"},
            new String[]{"20", "25", "30", "35", "40", "45", "50", "55", "60"}
        ));

        verifyPlot(new Plot(
            "Categorical X-Axis Measure from Same Assay",
            3713,
            new String[]{"0","0.5","1","1.5","2","2.5","3","3.5","4","4.5","5"},
            new String[]{"Any HIV PTEg", "Any HIV PTEA", "Any v503 Vaccine Matched Antigen"}
        ));

        verifyPlot(new Plot(
            "Numeric X-Axis Measure from Same Assay",
            3713,
            new String[]{"0","0.5","1","1.5","2","2.5","3","3.5","4","4.5","5"},
            new String[]{"0", "0.002", "0.004", "0.006", "0.008", "0.01"}
        ));

        verifyPlot(new Plot(
            "Same X-Axis Measure with Different Filter",
            3978,
            new String[]{"0","0.5","1","1.5","2","2.5","3","3.5","4","4.5","5"},
            new String[]{"0", "2", "4", "6", "8", "10", "12", "14"}
        ));

        verifyPlot(new Plot(
            "Numeric X-Axis Measure from Different Assay (1)",
            3861,
            new String[]{"0","0.5","1","1.5","2","2.5","3","3.5","4","4.5"},
            new String[]{"50", "100", "150", "200", "250", "300"}
        ));

        verifyPlot(new Plot(
            "Numeric X-Axis Measure from Different Assay (2)",
            4255,
            new String[]{"0", "1000", "2000", "3000", "4000", "5000", "6000", "7000", "8000", "9000", "10000", "11000"},
            new String[]{"0", "2", "4", "6", "8", "10", "12", "14"}
        ));

        verifyPlot(new Plot(
            "Numeric X-Axis Measure from Different Assay (3)",
            1453,
            new String[]{"200", "400", "600", "800", "1000", "1200", "1400"},
            new String[]{"2000", "4000", "6000", "8000", "10000", "12000", "14000", "16000", "18000"}
        ));

        verifyPlot(new Plot(
            "Time Point X-Axis Meaure (Unaligned)",
            4396,
            new String[]{"200", "400", "600", "800", "1000", "1200", "1400", "1600", "1800"},
            new String[]{"0", "5", "10", "15", "20", "25", "30", "35", "40", "45"}
        ));

        verifyPlot(new Plot(
            "Time Point X-Axis Meaure (Aligned)",
            3920,
            new String[]{"200", "400", "600", "800", "1000", "1200", "1400", "1600", "1800"},
            new String[]{"-10", "-8", "-6", "-4", "-2", "0"}
        ));
    }

    private void verifyPlot(Plot plot)
    {
        DemoMeasureStorePage page = new DemoMeasureStorePage(this);
        page.selectPlotByTitle(plot.getTitle());

        // verify number of points
        assertEquals(plot.getNumPoints(), page.getNumPlotPoints());

        // verify y-axis tick labels
        if (plot.getYAxisTicks() != null)
            assertArrayEquals(plot.getYAxisTicks(), page.getPlotAxisTicks("y"));

        // verify x-axis tick labels
        if (plot.getXAxisTicks() != null)
            assertArrayEquals(plot.getXAxisTicks(), page.getPlotAxisTicks("x"));
    }

    class Plot
    {
        private String _title;
        private int _numPoints;
        private String[] _yAxisTicks;
        private String[] _xAxisTicks;

        public Plot(String title, int numPoints, String[] yAxisTicks, String[] xAxisTicks)
        {
            _title = title;
            _numPoints = numPoints;
            _yAxisTicks = yAxisTicks;
            _xAxisTicks = xAxisTicks;
        }

        public String getTitle()
        {
            return _title;
        }

        public int getNumPoints()
        {
            return _numPoints;
        }

        public String[] getYAxisTicks()
        {
            return _yAxisTicks;
        }

        public String[] getXAxisTicks()
        {
            return _xAxisTicks;
        }
    }
}
