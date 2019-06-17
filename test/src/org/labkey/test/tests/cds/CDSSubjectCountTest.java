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

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.categories.Git;
import org.labkey.test.pages.cds.CDSPlot;
import org.labkey.test.pages.cds.InfoPane;
import org.labkey.test.pages.cds.XAxisVariableSelector;
import org.labkey.test.pages.cds.YAxisVariableSelector;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.NoSuchElementException;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

@Category({Git.class})
public class CDSSubjectCountTest extends CDSReadOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);
    private final CDSPlot cdsPlot = new CDSPlot(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);
    private final String PGROUP1 = "visgroup 1";
    private final String PGROUP2 = "visgroup 2";
    private final String PGROUP3 = "visgroup 3";
    private final String PGROUP3_COPY = "copy of visgroup 3";
    private final String XPATH_SUBJECT_COUNT = "//div[contains(@class, 'status-row')]//span[contains(@class, 'hl-status-label')][contains(text(), 'Subject')]/./following-sibling::span[contains(@class, ' hl-status-count ')][not(contains(@class, 'hideit'))]";

    protected static final String MOUSEOVER_FILL = "#41C49F";
    protected static final String MOUSEOVER_STROKE = "#00EAFF";
    protected static final String BRUSHED_FILL = "#14C9CC";
    protected static final String BRUSHED_STROKE = "#00393A";
    protected static final String NORMAL_COLOR = "#000000";

    @Before
    public void preTest()
    {
        cds.enterApplication();
        cds.ensureNoFilter();
        cds.ensureNoSelection();
        getDriver().manage().window().setSize(CDSHelper.idealWindowSize);
    }

    @BeforeClass
    public static void initTest() throws Exception
    {
        //TODO add back (and improve already exists test) when verifySavedGroupPlot is implemented.
//        CDSVisualizationTest cvt = (CDSVisualizationTest)getCurrentTest();
//        cvt.createParticipantGroups();
    }

    @AfterClass
    public static void afterClassCleanUp()
    {
        //TODO add back (and improve already exists test) when verifySavedGroupPlot is implemented.
//        CDSVisualizationTest cvt = (CDSVisualizationTest)getCurrentTest();
//        cvt.deleteParticipantGroups();
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Arrays.asList("CDS");
    }

    @Override
    public BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    @Test
    public void verifySubjectCounts()
    {

        Map<String, String> sourcesSubjectCounts = new HashMap<>();
        CDSHelper cds = new CDSHelper(this);
        Map<String, String> antigenCounts = new HashMap<>();
        Map<String, String> peptidePoolCounts = new HashMap<>();
        Map<String, String> proteinCounts = new HashMap<>();
        Map<String, String> proteinPanelCounts = new HashMap<>();
        Map<String, String> virusCounts = new HashMap<>();

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        // Populate expected counts for antigens.
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_A1_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_A244_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_AE244_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_BCON_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_C1086_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_CCON_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_CONS_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_GP70_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_P24_NAME), "75");

        // Populate expected counts for peptide pools.
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_ENV, CDSHelper.PEPTIDE_POOL_ENV1PTEC), "156");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_ENV, CDSHelper.PEPTIDE_POOL_ENV2PTEC), "156");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_ENV, CDSHelper.PEPTIDE_POOL_ENV3PTEC), "154");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_GAG, CDSHelper.PEPTIDE_POOL_GAG1PTEC), "168");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_GAG, CDSHelper.PEPTIDE_POOL_GAG2PTEC), "167");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_NEF, CDSHelper.PEPTIDE_POOL_NEFPTEC), "156");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_POL, CDSHelper.PEPTIDE_POOL_POL1PTEC), "168");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_POL, CDSHelper.PEPTIDE_POOL_POL2PTEC), "163");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_POL, CDSHelper.PEPTIDE_POOL_POL3PTEC), "159");

        // Populate expected counts for proteins.
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEA, CDSHelper.PROTEIN_ENV), "178");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_ENV), "1203");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_GAG), "1060");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_NEF), "739");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_POL), "1061");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_GAG), "219");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_NEF), "219");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_POL), "219");

        // Populate expected counts for protein panels.
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEA), "178");
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG), "1239");
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503), "219");

        // Populate expected counts for viruses.
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_A, CDSHelper.VIRUS_Q23), "8");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_BX08), "73");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_MN3), "727");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SF162), "667");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SS1196), "60");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_REJO), "60");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SC422), "60");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_TRO), "60");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_A, CDSHelper.VIRUS_92RW), "50");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_NP03), "381");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_TH023), "261");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_9020), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_96ZM), "88");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_97ZA), "50");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_BAL26), "634");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_C1080), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_C3347), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_CAAN), "60");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_CH58), "4");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_CH77), "4");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_CM244), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_CE1086), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_CE1176), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_CE2010), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU151), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU422), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_MW965), "681");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_R2184), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_REJOLUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_RHPALUC), "4");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SC22), "4");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SIVLUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SIVNL), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SVA), "67");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_TV1LUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_W61D), "120");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_WITO), "0");

        sourcesSubjectCounts.put(CDSHelper.STUDY_TREATMENT_VARS, "8,277");
        sourcesSubjectCounts.put(CDSHelper.SUBJECT_CHARS, "8,277");
        sourcesSubjectCounts.put(CDSHelper.TIME_POINTS, "8,277");
        sourcesSubjectCounts.put(CDSHelper.BAMA, "75");
        sourcesSubjectCounts.put(CDSHelper.ELISPOT, "477");
        sourcesSubjectCounts.put(CDSHelper.ICS, "1,604");
        sourcesSubjectCounts.put(CDSHelper.NAB, "839");

        cdsPlot.subjectCountsHelper(sourcesSubjectCounts, antigenCounts, peptidePoolCounts, proteinCounts, proteinPanelCounts, virusCounts);

    }

    @Test
    public void verifySubjectCountsWithFilters()
    {

        Map<String, String> sourcesSubjectCounts = new HashMap<>();
        Map<String, String> antigenCounts = new HashMap<>();
        Map<String, String> peptidePoolCounts = new HashMap<>();
        Map<String, String> proteinCounts = new HashMap<>();
        Map<String, String> proteinPanelCounts = new HashMap<>();
        Map<String, String> virusCounts = new HashMap<>();

        CDSHelper cds = new CDSHelper(this);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        log("Validating subject count with a filter of BAMA assay.");

        cds.goToSummary();
        cds.clickBy("Assays");
        cds.selectBars(CDSHelper.ASSAYS[0]); // Select BAMA

        // Populate expected counts for some of the antigens.
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_A1_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_A244_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_BCON_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_C1086_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_P24_NAME), "75");

        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_ENV, CDSHelper.PEPTIDE_POOL_ENV1PTEC), "0");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_GAG, CDSHelper.PEPTIDE_POOL_GAG1PTEC), "0");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_NEF, CDSHelper.PEPTIDE_POOL_NEFPTEC), "0");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_POL, CDSHelper.PEPTIDE_POOL_POL1PTEC), "0");

        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEA), "0");
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG), "74");
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503), "0");

        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEA, CDSHelper.PROTEIN_ENV), "0");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_ENV), "74");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_GAG), "74");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_NEF), "74");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_POL), "74");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_GAG), "0");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_NEF), "0");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_POL), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_A, CDSHelper.VIRUS_Q23), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_BX08), "72");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_MN3), "75");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SF162), "75");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SS1196), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_TRO), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_NP03), "42");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_TH023), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_9020), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_BAL26), "72");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU151), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU422), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_MW965), "72");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_R2184), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_REJOLUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_RHPALUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SC22), "0");

        sourcesSubjectCounts.put(CDSHelper.STUDY_TREATMENT_VARS, "75");
        sourcesSubjectCounts.put(CDSHelper.SUBJECT_CHARS, "75");
        sourcesSubjectCounts.put(CDSHelper.TIME_POINTS, "75");
        sourcesSubjectCounts.put(CDSHelper.BAMA, "75");
        sourcesSubjectCounts.put(CDSHelper.ELISPOT, "0");
        sourcesSubjectCounts.put(CDSHelper.ICS, "75");
        sourcesSubjectCounts.put(CDSHelper.NAB, "75");

        cdsPlot.subjectCountsHelper(sourcesSubjectCounts, antigenCounts, peptidePoolCounts, proteinCounts, proteinPanelCounts, virusCounts);

        cds.clearFilters();

        log("Validating subject count with a filter of race-asian.");
        CDSHelper.NavigationLink.SUMMARY.makeNavigationSelection(this);
        cds.addRaceFilter(CDSHelper.RACE_ASIAN);
        _asserts.assertFilterStatusCounts(815, 49, 1, 5, 165);

        sourcesSubjectCounts.clear();
        antigenCounts.clear();
        peptidePoolCounts.clear();
        proteinCounts.clear();
        proteinPanelCounts.clear();
        virusCounts.clear();

        // Populate expected counts for some of the antigens.
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_A1_NAME), "5");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_A244_NAME), "5");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_BCON_NAME), "5");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_C1086_NAME), "5");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_P24_NAME), "5");

        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_ENV, CDSHelper.PEPTIDE_POOL_ENV1PTEC), "20");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_GAG, CDSHelper.PEPTIDE_POOL_GAG1PTEC), "23");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_NEF, CDSHelper.PEPTIDE_POOL_NEFPTEC), "22");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_POL, CDSHelper.PEPTIDE_POOL_POL1PTEC), "23");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_ENV, CDSHelper.PEPTIDE_POOL_ENV2PTEG), "6");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_NEF, CDSHelper.PEPTIDE_POOL_NEFPTEG), "6");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_GAGB, CDSHelper.PROTEIN_GAG, CDSHelper.PEPTIDE_POOL_GAGCONB1), "25");

        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEA), "12");
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG), "116");
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503), "26");

        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEA, CDSHelper.PROTEIN_ENV), "12");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_ENV), "112");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_GAG), "103");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_NEF), "71");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_POL), "104");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_GAG), "26");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_NEF), "26");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_POL), "26");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_A, CDSHelper.VIRUS_Q23), "1");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_BX08), "5");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_MN3), "62");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SF162), "59");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SS1196), "3");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_TRO), "3");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_NP03), "35");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_TH023), "21");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_9020), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_BAL26), "54");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU151), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU422), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_MW965), "64");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_R2184), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_REJOLUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_RHPALUC), "1");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SC22), "1");

        sourcesSubjectCounts.put(CDSHelper.STUDY_TREATMENT_VARS, "815");
        sourcesSubjectCounts.put(CDSHelper.SUBJECT_CHARS, "815");
        sourcesSubjectCounts.put(CDSHelper.TIME_POINTS, "815");
        sourcesSubjectCounts.put(CDSHelper.BAMA, "5");
        sourcesSubjectCounts.put(CDSHelper.ELISPOT, "55");
        sourcesSubjectCounts.put(CDSHelper.ICS, "159");
        sourcesSubjectCounts.put(CDSHelper.NAB, "76");

        cdsPlot.subjectCountsHelper(sourcesSubjectCounts, antigenCounts, peptidePoolCounts, proteinCounts, proteinPanelCounts, virusCounts);

        cds.clearFilters();

    }

    @Test
    public void verifySubjectCountsWithFiltersAdvancedOptions()
    {

        Map<String, String> proteinCounts = new HashMap<>();
        Map<String, String> proteinPanelCounts = new HashMap<>();
        Map<String, String> virusCounts = new HashMap<>();

        CDSHelper cds = new CDSHelper(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        log("Validating counts with filters of NAB TZM-bl and then cell types of CD4+, CD8+ and both.");

        cds.goToSummary();
        cds.clickBy("Assays");
        cds.selectBars(CDSHelper.ASSAYS[4]); // Select NAb TZM-bl

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEA), "0");
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG), "133");
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503), "0");

        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEA, CDSHelper.PROTEIN_ENV), "0");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_ENV), "133");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_GAG), "133");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_NEF), "88");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_POL), "133");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_GAG), "0");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_NEF), "0");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_POL), "0");

        log("Validating the x-axis selector.");
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        xaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN_PANEL);
        xaxis.validateProteinPanelSubjectCount(proteinPanelCounts, false);
        xaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        xaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN);
        xaxis.validateProteinSubjectCount(proteinCounts, false);
        xaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        proteinPanelCounts.replace(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG), "137");

        proteinCounts.replace(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_ENV), "137");
        proteinCounts.replace(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_GAG), "137");
        proteinCounts.replace(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_NEF), "92");
        proteinCounts.replace(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_POL), "137");

        xaxis.setCellType(CDSHelper.CELL_TYPE_CD8);
        xaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN_PANEL);
        xaxis.validateProteinPanelSubjectCount(proteinPanelCounts, false);
        xaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        xaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN);
        xaxis.validateProteinSubjectCount(proteinCounts, false);
        xaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        xaxis.setCellType(CDSHelper.CELL_TYPE_CD4, CDSHelper.CELL_TYPE_CD8);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        xaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN_PANEL);
        xaxis.validateProteinPanelSubjectCount(proteinPanelCounts, false);
        xaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        xaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN);
        xaxis.validateProteinSubjectCount(proteinCounts, false);
        xaxis.backToSource();

        xaxis.cancelSelection();

        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        // Counts for the y-axis are the same as x-axis. So no need to repopulate the counts.

        log("Validating the y-axis selector.");

        proteinPanelCounts.replace(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG), "133");

        proteinCounts.replace(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_ENV), "133");
        proteinCounts.replace(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_GAG), "133");
        proteinCounts.replace(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_NEF), "88");
        proteinCounts.replace(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_POL), "133");

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        yaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN_PANEL);
        yaxis.validateProteinPanelSubjectCount(proteinPanelCounts, false);
        yaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        yaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN);
        yaxis.validateProteinSubjectCount(proteinCounts, false);
        yaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        proteinPanelCounts.replace(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG), "137");

        proteinCounts.replace(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_ENV), "137");
        proteinCounts.replace(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_GAG), "137");
        proteinCounts.replace(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_NEF), "92");
        proteinCounts.replace(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_POL), "137");

        yaxis.setCellType(CDSHelper.CELL_TYPE_CD8);
        yaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN_PANEL);
        yaxis.validateProteinPanelSubjectCount(proteinPanelCounts, false);
        yaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        yaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN);
        yaxis.validateProteinSubjectCount(proteinCounts, false);
        yaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        yaxis.setCellType(CDSHelper.CELL_TYPE_CD4, CDSHelper.CELL_TYPE_CD8);
        yaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN_PANEL);
        yaxis.validateProteinPanelSubjectCount(proteinPanelCounts, false);
        yaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        yaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN);
        yaxis.validateProteinSubjectCount(proteinCounts, false);
        yaxis.backToSource();

        yaxis.cancelSelection();

        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        cds.clearFilters();


        log("Validating counts with filters of Race=white and target cell of A3R5 and TZM-bl.");
        CDSHelper.NavigationLink.SUMMARY.makeNavigationSelection(this);
        cds.addRaceFilter(CDSHelper.RACE_WHITE);
        _asserts.assertFilterStatusCounts(777, 48, 1, 3, 152);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        virusCounts.clear();
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_A, CDSHelper.VIRUS_Q23), "2");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_BX08), "8");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_MN3), "62");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SF162), "58");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SS1196), "5");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_TRO), "5");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_NP03), "28");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_TH023), "18");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_9020), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_BAL26), "55");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU151), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU422), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_MW965), "53");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_R2184), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_REJOLUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SVA), "5");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_W61D), "9");

        log("Validating the x-axis selector.");
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.NAB);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        xaxis.pickVariable(CDSHelper.NAB_TITERID50);
        xaxis.setTargetCell(CDSHelper.TARGET_CELL_TZM);
        xaxis.validateVirusSubjectCount(virusCounts, false);
        xaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        // Counts change when moving to A3R5.

        virusCounts.clear();
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_A, CDSHelper.VIRUS_Q23), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_BX08), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_MN3), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SF162), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SS1196), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_TRO), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_NP03), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_TH023), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_9020), "9");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_BAL26), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_CH77), "21");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU151), "12");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU422), "9");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_R2184), "3");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_REJOLUC), "4");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_RHPALUC), "21");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SC22), "21");

        xaxis.setTargetCell(CDSHelper.TARGET_CELL_A3R5);
        xaxis.validateVirusSubjectCount(virusCounts, false);
        xaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        xaxis.cancelSelection();

        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        // Validating for the y-axis re-populate the counts like we did before.

        virusCounts.clear();
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_A, CDSHelper.VIRUS_Q23), "2");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_BX08), "8");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_MN3), "62");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SF162), "58");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SS1196), "5");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_TRO), "5");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_NP03), "28");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_TH023), "18");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_9020), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_BAL26), "55");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU151), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU422), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_MW965), "53");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_R2184), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_REJOLUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SVA), "5");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_W61D), "9");

        log("Validating the y-axis selector.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        yaxis.setTargetCell(CDSHelper.TARGET_CELL_TZM);
        yaxis.validateVirusSubjectCount(virusCounts, false);
        yaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        virusCounts.clear();
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_A, CDSHelper.VIRUS_Q23), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_BX08), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_MN3), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SF162), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SS1196), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_TRO), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_NP03), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_TH023), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_9020), "9");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_BAL26), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_CH77), "21");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU151), "12");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU422), "9");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_R2184), "3");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_REJOLUC), "4");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_RHPALUC), "21");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SC22), "21");

        yaxis.setTargetCell(CDSHelper.TARGET_CELL_A3R5);
        yaxis.validateVirusSubjectCount(virusCounts, false);
        yaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        yaxis.cancelSelection();

        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        cds.clearFilters();

    }

    @Test
    public void verifyInfoPaneCounts()
    {
        CDSHelper cds = new CDSHelper(this);
        InfoPane ip = new InfoPane(this);
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        String text;

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        log("Set the y-axis and validate counts are as expected.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.confirmSelection();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        ip.waitForSpinners();

        assertEquals("Subjects count not as expected.", 1458, ip.getSubjectCount());
        assertEquals("Species count not as expected.", 2, ip.getSpeciesCount());
        assertEquals("Studies count not as expected.", 14, ip.getStudiesCount());
        assertEquals("Product count not as expected.", 3, ip.getProductCount());
        assertEquals("Treatments count not as expected.", 91, ip.getTreatmentsCount());
        assertEquals("Time Points count not as expected.", 55, ip.getTimePointsCount());
        assertEquals("Antigens In Y count not as expected.", 3, ip.getAntigensInYCount());

        log("Validate a list (species) from the info pane.");
        ip.clickSpeciesCount();
        text = ip.getSpeciesList();
        assertTrue("Species list does not contain " + CDSHelper.SPECIES_HUMAN, text.contains(CDSHelper.SPECIES_HUMAN));
        assertTrue("Species list does not contain " + CDSHelper.SPECIES_VULCAN, text.contains(CDSHelper.SPECIES_VULCAN));
        ip.clickCancel();

        log("Set the x-axis and validate counts change as expected.");
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD8);
        xaxis.confirmSelection();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        ip.waitForSpinners();

        assertEquals("Subjects count not as expected.", 1453, ip.getSubjectCount());
        assertEquals("Species count not as expected.", 2, ip.getSpeciesCount());
        assertEquals("Studies count not as expected.", 14, ip.getStudiesCount());
        assertEquals("Product count not as expected.", 3, ip.getProductCount());
        assertEquals("Treatments count not as expected.", 91, ip.getTreatmentsCount());
        assertEquals("Time Points count not as expected.", 55, ip.getTimePointsCount());
        assertEquals("Antigens In X count not as expected.", 3, ip.getAntigensInXCount());
        assertEquals("Antigens In Y count not as expected.", 3, ip.getAntigensInYCount());

        log("Verify that Antigens in X and Antigens in Y bring up the variable selector.");
        try{
            log("Checking for x-axis variable selector.");
            ip.clickAntigensInXCount();
            sleep(CDSHelper.CDS_WAIT_ANIMATION);
            xaxis.cancelSelection();
            sleep(CDSHelper.CDS_WAIT_ANIMATION);
            log("Checking for y-axis variable selector.");
            ip.clickAntigensInYCount();
            sleep(CDSHelper.CDS_WAIT_ANIMATION);
            yaxis.cancelSelection();
            sleep(CDSHelper.CDS_WAIT_ANIMATION);
        }
        catch(NoSuchElementException ex)
        {
            fail("Variable selector was not shown as expected.");
        }

        log("Checking for the time points selector.");
        ip.clickTimePointsCount();
        waitForText("Time points in the plot");
        sleep(CDSHelper.CDS_WAIT);
        text = ip.getTimePointsList();
        assertTrue("Time Point list does not contain 'Has data in active filters'.", text.contains("Has data in active filters"));
        assertTrue("Time Point list does not contain 'Day '.", text.contains("Day 0 - (7 studies)"));
        log("Use the info pane to apply a filter to the plot.");
        ip.setFilter("Day 14 - (1 study)");

        assertEquals("Subjects count not as expected.", 49, ip.getSubjectCount());
        assertEquals("Species count not as expected.", 1, ip.getSpeciesCount());
        assertEquals("Studies count not as expected.", 1, ip.getStudiesCount());
        assertEquals("Product count not as expected.", 1, ip.getProductCount());
        assertEquals("Treatments count not as expected.", 4, ip.getTreatmentsCount());
        assertEquals("Time Points count not as expected.", 1, ip.getTimePointsCount());
        assertEquals("Antigens In X count not as expected.", 1, ip.getAntigensInXCount());
        assertEquals("Antigens In Y count not as expected.", 1, ip.getAntigensInYCount());
        log("Clearing the filter.");
        cds.clearFilter(1);

        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Use the info pane to apply a filter to the plot.");
        ip.clickStudiesCount();
        ip.setFilter("RED 4");

        assertEquals("Subjects count not as expected.", 79, ip.getSubjectCount());
        assertEquals("Species count not as expected.", 1, ip.getSpeciesCount());
        assertEquals("Studies count not as expected.", 1, ip.getStudiesCount());
        assertEquals("Product count not as expected.", 1, ip.getProductCount());
        assertEquals("Treatments count not as expected.", 3, ip.getTreatmentsCount());
        assertEquals("Time Points count not as expected.", 2, ip.getTimePointsCount());
        assertEquals("Antigens In X count not as expected.", 1, ip.getAntigensInXCount());
        assertEquals("Antigens In Y count not as expected.", 1, ip.getAntigensInYCount());

        log("Clearing the filter.");
        cds.clearFilter(1);

        sleep(CDSHelper.CDS_WAIT_ANIMATION);

    }

}
