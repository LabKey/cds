/*
 * Copyright (c) 2016-2019 LabKey Corporation
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
import org.junit.rules.Timeout;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.pages.cds.DemoMeasureStorePage;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 20)
public class CDSMeasureStoreTest extends CDSReadOnlyTest
{
    public static final String[] ICS_ELISPOT_DIMENSIONS = {"study_ICS_summary_level", "cds_GridBase_SequenceNum", "study_ICS_pctpos",
            "study_ICS_specimen_type", "study_ICS_cell_type", "cds_GridBase_SubjectId", "cds_GridBase_ParticipantSequenceNum",
            "study_ELISPOT_protein", "study_ELISPOT_summary_level", "cds_GridBase_VisitRowId", "study_ELISPOT_specimen_type",
            "study_ELISPOT_lab_code", "study_ICS_protein", "study_ICS_lab_code", "study_ELISPOT_protein_panel",
            "study_ELISPOT_mean_sfc", "study_ICS_protein_panel", "cds_GridBase_Dataset", "study_ELISPOT_functional_marker_name",};

    @Override
    public Timeout testTimeout()
    {
        return new Timeout(60, TimeUnit.MINUTES);
    }

    @Test
    public void testDemoMeasureStore()
    {
        beginAt("/cds/" + getProjectName() + "/demoMeasureStore.view");

        verifyPlot(new Plot(
            "No X-Axis Measure",
            3627,
            new String[]{"0","0.5","1","1.5","2","2.5","3","3.5","4","4.5","5"},
            new String[]{""}
        ));

        verifyPlot(new Plot(
            "Categorical X-Axis Measure from Demographic",
            3627,
            new String[]{"0","0.5","1","1.5","2","2.5","3","3.5","4","4.5","5"},
            new String[]{"Asian", "Asian/Pacific Island", "Black", "Hawaiian/Pacific Isl", "Multiracial",
                    "Native American", "Native American/Alas. Other", "Native Hawaiian/Paci", "Unknown", "White"}
        ));

        verifyPlot(new Plot(
            "Numeric X-Axis Measure from Demographic",
            3627,
            new String[]{"0","0.5","1","1.5","2","2.5","3","3.5","4","4.5","5"},
            new String[]{"20", "25", "30", "35", "40", "45", "50", "55", "60"}
        ));

        verifyPlot(new Plot(
            "Categorical X-Axis Measure from Same Assay",
            3627,
            new String[]{"0","0.5","1","1.5","2","2.5","3","3.5","4","4.5","5"},
            new String[]{"Any HIV PTEA", "Any HIV PTEg", "Any v503 Vaccine Matched Antigen"}
        ));

        verifyPlot(new Plot(
            "Numeric X-Axis Measure from Same Assay",
            3627,
            new String[]{"0","0.5","1","1.5","2","2.5","3","3.5","4","4.5","5"},
            new String[]{"0", "0.002", "0.004", "0.006", "0.008", "0.01"}
        ));

        verifyPlot(new Plot(
            "Same X-Axis Measure with Different Filter",
            3894,
            new String[]{"0","0.5","1","1.5","2","2.5","3","3.5","4","4.5","5"},
            new String[]{"0", "2", "4", "6", "8", "10", "12", "14"}
        ));

        verifyPlot(new Plot(
            "Same X-Axis Measure with Different Filter (axisName)",
            3894,
            new String[]{"0","0.5","1","1.5","2","2.5","3","3.5","4","4.5","5"},
            new String[]{"0", "2", "4", "6", "8", "10", "12", "14"}
        ));

        verifyPlot(new Plot(
            "Numeric X-Axis Measure from Different Assay (1)",
            4531,
            new String[]{"0","0.5","1","1.5","2","2.5","3","3.5","4","4.5"},
            new String[]{"50", "100", "150", "200", "250", "300", "350"}
        ));

        verifyPlot(new Plot(
            "Numeric X-Axis Measure from Different Assay (2)",
            4174,
            new String[]{"0", "200", "400", "600", "800", "1000", "1200", "1400", "1600", "1800", "2000", "2200"},
            new String[]{"0", "2", "4", "6", "8", "10", "12", "14"}
        ));

        verifyPlot(new Plot(
            "Numeric X-Axis Measure from Different Assay (3)",
            1393,
            new String[]{"50", "100", "150", "200", "250", "300", "350"},
            new String[]{"500", "1000", "1500", "2000"}
        ));

        verifyPlot(new Plot(
            "Time Point X-Axis Measure (Unaligned)",
            3796,
            new String[]{"100", "200", "300", "400", "500", "600", "700"},
            new String[]{"0", "5", "10", "15", "20", "25", "30", "35", "40", "45"}
        ));

        verifyPlot(new Plot(
            "Time Point X-Axis Measure (Aligned)",
            3320,
            new String[]{"100", "200", "300", "400", "500", "600", "700"},
            new String[]{"-10", "-8", "-6", "-4", "-2", "0"}
        ));

        click(Locator.linkWithText("Select All Dimensions"));
        waitForElement(Locator.css("th").withText("Dimension"));
        List<String> fields = Arrays.asList(ICS_ELISPOT_DIMENSIONS);
        fields.stream().forEach((field) ->  {
            assertTextPresent(field);
        });
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
