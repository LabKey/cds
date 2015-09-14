/*
 * Copyright (c) 2014-2015 LabKey Corporation
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
package org.labkey.test.util;

import com.google.common.base.Function;
import org.apache.commons.lang3.SystemUtils;
import org.jetbrains.annotations.Nullable;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebTestHelper;
import org.labkey.test.pages.DataGridVariableSelector;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.text.NumberFormat;
import java.util.List;

public class CDSHelper
{
    public static final String[] STUDIES = {"CAVD 256", "CAVD 264", "CAVD 317", "AVEG 007C", "HVTN 039", "HVTN 040",
            "HVTN 041", "HVTN 042", "HVTN 044", "HVTN 045", "HVTN 048", "HVTN 049", "HVTN 049x", "HVTN 052",
            "HVTN 054", "HVTN 055", "HVTN 056", "HVTN 057", "HVTN 059", "HVTN 060", "HVTN 063", "HVTN 064",
            "HVTN 065", "HVTN 067", "HVTN 068", "HVTN 069", "HVTN 070", "HVTN 071", "HVTN 072", "HVTN 073",
            "HVTN 076", "HVTN 077", "HVTN 078", "HVTN 080", "HVTN 082", "HVTN 083", "HVTN 084", "HVTN 085", "HVTN 086",
            "HVTN 087", "HVTN 088", "HVTN 090", "HVTN 091", "HVTN 092", "HVTN 094", "HVTN 096", "HVTN 097",
            "HVTN 100", "HVTN 104", "HVTN 106", "HVTN 203", "HVTN 204", "HVTN 205", "HVTN 503", "HVTN 504", "HVTN 505", "HVTN 908"}; // TODO Test data dependent.

    public static final String[] PROT_NAMES = {"HVTN 078", "HVTN 044", "HVTN 503", "HVTN 060", "HVTN 204", "HVTN 041", "HVTN 205", "HVTN 049", "HVTN 049", "HVTN 505"}; //incomplete list, only first and last under each assay in find subjects view.

    public static final String[] PRODUCTS = {"3BNC117", "acyclovir", "AIDSVAX B/B", "AIDSVAX B/E", "ALVAC-HIV (vCP1452)",
            "ALVAC-HIV (vCP1521)", "ALVAC-HIV (vCP2438)", "AS01B", "AS02A", "AVX101", "AVX201", "BufferGel", "Buprenorphine/naloxone",
            "C1 peptide", "DEC-205-p24", "DNA-C", "DNA-HIV-PT123", "Engerix B", "EP HIV-1090", "EP-1043", "EP-1233",
            "gag B DNA/PLG/env B DNA/PLG", "GM-CSF", "gp120w61d", "gp140 CN54", "gp140 Sub C", "gp160", "HIV CTL MEP",
            "HIV MAG pDNA", "HIV-1 gag DNA", "IL-12 DNA", "IL-12 DNA-4532", "IL-15-1696", "LIPO-5", "MF59", "MRK Ad5 HIV-1 gag",
            "MRKAd5 HIV-1 gag/pol/nef", "MVA-mBN32", "MVA/HIV62", "NefTat", "Nevirapine", "Nick101", "Nick202", "Nick303",
            "Nick404", "Nick505", "Nick606", "Nick707", "Nick808", "NYVAC-HIV-B", "NYVAC-HIV-C", "NYVAC-HIV-PT1 and NYVAC-HIV-PT4",
            "NYVAC-KC", "Oral Tenofovir", "PCMVR", "PennVax-GP", "PennVaxB", "pGA2/JS7 DNA", "pIL15EAMN", "Poly ICLC",
            "polyvinylpyrrolidone (PVP).", "PRO2000/5", "RC529-SE", "rFPV-HIV", "rMVAHIV", "SAAVI DNA-C2", "SAAVI MVA-C",
            "SPL7013 (VivaGel)", "Subtype C gp120", "Subtype C gp120/MF59", "Tenofovir Gel", "Tetavax", "tgAXH68",
            "tgAXH95", "TLR7", "TLR9", "Truvada", "VRC-ADJDNA004-IL2-VP", "VRC-HIVADV014-00-VP", "VRC-HIVADV027-00-VP",
            "VRC-HIVADV038-00-VP", "VRC-HIVADV052-00-VP", "VRC-HIVADV053-00-VP", "VRC-HIVADV054-00-VP", "VRC-HIVDNA-016-00-VP",
            "VRC-HIVDNA009-00-VP", "VRC-HIVDNA044-00-VP", "VRC01", "VSV HIV envC^2", "VSV HIV gag"};  // TODO Test data dependent.

    public static final String[] LABS = {"GT", "FH", "DM"};
    public static final String[] I_TYPES = {"Cellular", "Humoral"};
    public static final String[] H_TYPES = {"HIV Immunogenicity"};
    public static final String[] ASSAYS = {"BAMA Biotin LX", "ICS", "IFNg ELS", "NAB A3R5", "NAB TZM-bl"};
    public static final String[] ASSAYS_FULL_TITLES = {"BAMA (HIV Binding Antibody)",
            "ICS (Intracellular Cytokine Staining)",
            "IFNg ELISpot (IFNg ELISpot)", "NAB (HIV Neutralizing Antibody)"};
    public static final String[] LEARN_ABOUT_BAMA_ANALYTE_DATA = {"Assay Analytes", "Antigen name", "A1.con.env03 140", "C.1086C_V1_V2 Tags", "Specimen type", "Serum"};
    public static final String[] LEARN_ABOUT_BAMA_VARIABLES_DATA = {"Antigen clade", "The clade (gene subtype) to which", "Subject Id", "Subject identifier"};
    public static final String[] LEARN_ABOUT_BAMA_ANTIGEN_DATA = {"A1.con.env03 140 CF", "p24"};
    public static final String[] LEARN_ABOUT_ICS_ANTIGEN_TAB_DATA = {"Any v503 Vaccine Matched Antigen", "POL: POL 1, POL 2", "NEF: NEF 1, NEF 2", "GAG: GAG 1, GAG 2", "Combined: NA"};
//    public static final String[] LEARN_ABOUT_ICS_ANTIGEN_TAB_DATA = {"POL: POL 1, POL 2", "NEF: NEF 1, NEF 2", "GAG: GAG 1, GAG 2", "Combined: NA"};
    public static final String EMPTY_ASSAY = "HIV-1 RT-PCR";
    public static final String TEST_FEED = WebTestHelper.getBaseURL() + "/Connector/test/testfeed.xml";
    public final static int CDS_WAIT = 2000;
    public final static int CDS_WAIT_ANIMATION = 500;
    public final static int CDS_WAIT_TOOLTIP = 1500;

    public final static String RACE_ASIAN = "Asian";
    public final static String RACE_BLACK = "Black";
    public final static String RACE_HAWAIIAN = "Hawaiian/Pacific Isl";
    public final static String RACE_MULTIRACIAL = "Multiracial";
    public final static String RACE_NATIVE = "Native American";
    public final static String RACE_NATIVE_ALAS = "Native American/Alas";
    public final static String RACE_OTHER = "Other";
    public final static String RACE_WHITE = "White";

    public static final String[] RACE_VALUES = {"Asian", "Asian/Pacific Island", "Black", "Hawaiian/Pacific Isl", "Multiracial", "Native American", "Native American/Alas", "Native Hawaiian/Paci", "Other", "Unknown", "White"};

    // These are used for ids on the panel selectors and on titles in the Grid.
    public static final String TITLE_NAB = "NAb";
    public static final String TITLE_BAMA = "BAMA";
    public static final String TITLE_ELISPOT = "ELISPOT";
    public static final String TITLE_ICS = "ICS";

    // These are used to build ids of elements on the tree panels.
    public static final String PANEL_PREFIX = "study";
    public static final String COLUMN_ID_NEUTRAL_TIER = "neutralization tier";
    public static final String COLUMN_ID_ANTIGEN_CLADE = "clade";
    public static final String COLUMN_ID_VIRUS_NAME = "virus";

    public static final String ANTIGEN_A1_NAME = "A1.con.env03 140 CF";
    public static final String ANTIGEN_A244_NAME = "A244 gp 120 gDneg/293F/mon";
    public static final String ANTIGEN_AE244_NAME = "AE.A244 V1V2 Tags/293F";
    public static final String ANTIGEN_BCON_NAME = "B.con.env03 140 CF";
    public static final String ANTIGEN_C1086_NAME = "C.1086C_V1_V2 Tags";
    public static final String ANTIGEN_CCON_NAME = "C.con.env03 140 CF";
    public static final String ANTIGEN_CONS_NAME = "Con S gp140 CFI";
    public static final String ANTIGEN_GP70_NAME = "gp70_B.CaseA_V1_V2";
    public static final String ANTIGEN_P24_NAME = "p24";
    public static final String[] ANTIGENS_NAME = {ANTIGEN_A1_NAME, ANTIGEN_A244_NAME, ANTIGEN_AE244_NAME, ANTIGEN_BCON_NAME,
            ANTIGEN_C1086_NAME, ANTIGEN_CCON_NAME, ANTIGEN_CONS_NAME, ANTIGEN_GP70_NAME, ANTIGEN_P24_NAME};

    public static final String ANTIGEN_CLADE_A = "A";
    public static final String ANTIGEN_CLADE_B = "B";
    public static final String ANTIGEN_CLADE_C = "C";
    public static final String ANTIGEN_CLADE_CRF01 = "CRF01_AE";
    public static final String ANTIGEN_CLADE_NOT_RECORDED = "Not Currently Recorded in Data";
    public static final String[] ANTIGEN_CLADES = {ANTIGEN_CLADE_A, ANTIGEN_CLADE_B, ANTIGEN_CLADE_C, ANTIGEN_CLADE_CRF01, ANTIGEN_CLADE_NOT_RECORDED};

    public static final String NEUTRAL_TIER_1 = "1";
    public static final String NEUTRAL_TIER_2 = "2";
    public static final String NEUTRAL_TIER_NA = "Not Available";
    public static final String[] NEUTRAL_TIERS = {NEUTRAL_TIER_1, NEUTRAL_TIER_2, NEUTRAL_TIER_NA};

    public static final String VIRUS_Q23 = "Q23.17";
    public static final String VIRUS_BX08 = "BX08.16";
    public static final String VIRUS_MN3 = "MN.3";
    public static final String VIRUS_SF162 = "SF162.LS";
    public static final String VIRUS_SS1196 = "SS1196.1";
    public static final String VIRUS_REJO = "REJO4541.67";
    public static final String VIRUS_RHPA = "RHPA4259.7";
    public static final String VIRUS_SC422 = "SC422661.8";
    public static final String VIRUS_TRO = "TRO.11";
    public static final String VIRUS_WITO4 = "WITO4160.33";
    public static final String VIRUS_92RW = "92RW020.2";
    public static final String VIRUS_TV1 = "TV1.21";
    public static final String VIRUS_NP03 = "NP03.13";
    public static final String VIRUS_TH023 = "TH023.6";
    public static final String VIRUS_9020 = "9020.A13.LucR.T2A.ecto";
    public static final String VIRUS_96ZM = "96ZM651.2";
    public static final String VIRUS_97ZA = "97ZA012.29";
    public static final String VIRUS_BAL26 = "BaL.26";
    public static final String VIRUS_C1080 = "C1080.c03.LucR.T2A.ecto";
    public static final String VIRUS_C3347 = "C3347.c11.LucR.T2A.ecto";
    public static final String VIRUS_CAAN = "CAAN5342.A2";
    public static final String VIRUS_CH58 = "CH58.LucR.T2A.ecto";
    public static final String VIRUS_CH77 = "CH77.LucR.T2A.ecto";
    public static final String VIRUS_CM244 = "CM244.c01-ETH2220LucR.T2A.4";
    public static final String VIRUS_CE1086 = "Ce1086_B2.LucR.T2A.ecto";
    public static final String VIRUS_CE1176 = "Ce1176_A3.LucR.T2A.ecto";
    public static final String VIRUS_CE2010 = "Ce2010_F5.LucR.T2A.ecto";
    public static final String VIRUS_DU151 = "Du151.2.LucR.T2A.ecto";
    public static final String VIRUS_DU422 = "Du422.1.LucR.T2A.ecto";
    public static final String VIRUS_MW965 = "MW965.26";
    public static final String VIRUS_R2184 = "R2184.c04.LucR.T2A.ecto";
    public static final String VIRUS_REJOLUC = "REJO.LucR.T2A.ecto";
    public static final String VIRUS_RHPALUC = "RHPA.LucR.T2A.ecto";
    public static final String VIRUS_SC22 = "SC22.3C2.LucR.T2A.ecto";
    public static final String VIRUS_SIVNL = "SIVmac239.ps-NL.LucR.T2A.ecto";
    public static final String VIRUS_SIVLUC = "SIVmac239.ps.LucR.T2A.ecto";
    public static final String VIRUS_SVA = "SVA-MLV";
    public static final String VIRUS_TV1LUC = "TV1.21.LucR.T2A.ecto";
    public static final String VIRUS_W61D = "W61D(TCLA).71";
    public static final String VIRUS_WITO = "WITO.LucR.T2A.ecto";
    public static final String[] VIRUSES = {VIRUS_Q23, VIRUS_BX08, VIRUS_MN3, VIRUS_SF162, VIRUS_SS1196, VIRUS_REJO, VIRUS_RHPA,
            VIRUS_SC422, VIRUS_TRO, VIRUS_WITO4, VIRUS_92RW, VIRUS_TV1 , VIRUS_NP03, VIRUS_TH023, VIRUS_9020, VIRUS_96ZM,
            VIRUS_97ZA, VIRUS_BAL26, VIRUS_C1080, VIRUS_C3347, VIRUS_CAAN, VIRUS_CH58, VIRUS_CH77, VIRUS_CM244, VIRUS_CE1086,
            VIRUS_CE1176, VIRUS_CE2010, VIRUS_DU151, VIRUS_DU422, VIRUS_MW965, VIRUS_R2184, VIRUS_REJOLUC, VIRUS_RHPALUC,
            VIRUS_SC22, VIRUS_SIVNL, VIRUS_SIVLUC, VIRUS_SVA, VIRUS_TV1LUC, VIRUS_W61D, VIRUS_WITO};

    public static final String PROTEIN_PANEL_GAGB = "GAG Consensus B";
    public static final String PROTEIN_PANEL_PTEA = "Any HIV PTEA";
    public static final String PROTEIN_PANEL_PTEC = "Any HIV PTEC";
    public static final String PROTEIN_PANEL_PTEG = "Any HIV PTEg";
    public static final String PROTEIN_PANEL_V503 = "Any v503 Vaccine Matched Antigen";
    public static final String[] PROTEIN_PANELS = {PROTEIN_PANEL_GAGB, PROTEIN_PANEL_PTEA, PROTEIN_PANEL_PTEC, PROTEIN_PANEL_PTEG, PROTEIN_PANEL_V503};

    public static final String PROTEIN_ENV = "ENV";
    public static final String PROTEIN_GAG = "GAG";
    public static final String PROTEIN_NEF = "NEF";
    public static final String PROTEIN_POL = "POL";
    public static final String[] PROTEINS = {PROTEIN_ENV, PROTEIN_GAG, PROTEIN_NEF, PROTEIN_POL};

    public static final String PEPTIDE_POOL_ENV1PTEC = "ENV-1-PTEC";
    public static final String PEPTIDE_POOL_ENV2PTEC = "ENV-2-PTEC";
    public static final String PEPTIDE_POOL_ENV3PTEC = "ENV-3-PTEC";
    public static final String PEPTIDE_POOL_GAG1PTEC = "GAG-1-PTEC";
    public static final String PEPTIDE_POOL_GAG2PTEC = "GAG-2-PTEC";
    public static final String PEPTIDE_POOL_NEFPTEC = "NEF-PTEC";
    public static final String PEPTIDE_POOL_POL1PTEC = "POL-1-PTEC";
    public static final String PEPTIDE_POOL_POL2PTEC = "POL-2-PTEC";
    public static final String PEPTIDE_POOL_POL3PTEC = "POL-3-PTEC";
    public static final String PEPTIDE_POOL_ENV1PTEG = "ENV-1-PTEG";
    public static final String PEPTIDE_POOL_ENV2PTEG = "ENV-2-PTEG";
    public static final String PEPTIDE_POOL_ENV3PTEG = "ENV-3-PTEG";
    public static final String PEPTIDE_POOL_GAG1PTEG = "GAG-1-PTEG";
    public static final String PEPTIDE_POOL_GAG2PTEG = "GAG-2-PTEG";
    public static final String PEPTIDE_POOL_NEFPTEG = "NEF-PTEG";
    public static final String PEPTIDE_POOL_POL1PTEG = "POL-1-PTEG";
    public static final String PEPTIDE_POOL_POL2PTEG = "POL-2-PTEG";
    public static final String PEPTIDE_POOL_POL3PTEG = "POL-3-PTEG";
    public static final String PEPTIDE_POOL_GAGCONB1 = "GagConB 1";
    public static final String PEPTIDE_POOL_GAGCONB2 = "GagConB 2";
    public static final String[] PEPTIDE_POOLS = {PEPTIDE_POOL_ENV1PTEC, PEPTIDE_POOL_ENV2PTEC, PEPTIDE_POOL_ENV3PTEC,
            PEPTIDE_POOL_GAG1PTEC, PEPTIDE_POOL_GAG2PTEC, PEPTIDE_POOL_NEFPTEC, PEPTIDE_POOL_POL1PTEC,
            PEPTIDE_POOL_POL2PTEC, PEPTIDE_POOL_POL3PTEC, PEPTIDE_POOL_ENV1PTEG, PEPTIDE_POOL_ENV2PTEG,
            PEPTIDE_POOL_ENV3PTEG, PEPTIDE_POOL_GAG1PTEG, PEPTIDE_POOL_GAG2PTEG, PEPTIDE_POOL_NEFPTEG,
            PEPTIDE_POOL_POL1PTEG, PEPTIDE_POOL_POL2PTEG, PEPTIDE_POOL_POL3PTEG, PEPTIDE_POOL_GAGCONB1,
            PEPTIDE_POOL_GAGCONB2};

    // These are used in the detail selection of a variable.
    public static final String TARGET_CELL_TZM = "TZM-bl";
    public static final String TARGET_CELL_A3R5 = "A3R5";
    public static final String[] TARGET_CELLS = {TARGET_CELL_TZM, TARGET_CELL_TZM};

    public static final String CELL_TYPE_CD4 = "CD4+";
    public static final String CELL_TYPE_CD8 = "CD8+";
    public static final String[] CELL_TYPES = {CELL_TYPE_CD4, CELL_TYPE_CD8};

    public static final String DATA_SUMMARY_PROTEIN = "Protein";
    public static final String DATA_SUMMARY_PROTEIN_PANEL = "Protein Panel";

    // The following (BAMA, DEMO, ELISPOT, ICS, NAB) are values used in the variable selector.
    public static final String BAMA = "BAMA (Binding Ab multiplex assay)";
    public static final String BAMA_ANTIGEN_CLADE = "Antigen clade";
    public static final String BAMA_ANTIGEN_NAME = "Antigen name";
    public static final String BAMA_ANTIGEN_TYPE = "Antigen type";
    public static final String BAMA_ASSAY = "Assay Identifier";
    public static final String BAMA_DETECTION = "Detection System";
    public static final String BAMA_DILUTION = "Dilution";
    public static final String BAMA_EXP_ASSAYD = "Experimental Assay Design Code";
    public static final String BAMA_INSTRUMENT_CODE = "Instrument Code";
    public static final String BAMA_ISOTYPE = "Isotype";
    public static final String BAMA_LAB = "Lab ID";
    public static final String BAMA_MAGNITUDE_BLANK = "Magnitude (mfi) - Blank";
    public static final String BAMA_MAGNITUDE_BASELINE = "Magnitude (mfi) - Blank Baseline";
    public static final String BAMA_MAGNITUDE_DELTA = "Magnitude (mfi) - Delta";
    public static final String BAMA_MAGNITUDE_RAW = "Magnitude (mfi) - Raw";
    public static final String BAMA_MAGNITUDE_DELTA_BASELINE = "Magnitude (mfi) - Delta Baseline";
    public static final String BAMA_MAGNITUDE_RAW_BASELINE = "Magnitude (mfi) - Raw Baseline";
    public static final String BAMA_PROTEIN = "Protein";
    public static final String BAMA_PROTEIN_PANEL = "Protein Panel";
    public static final String BAMA_RESPONSE_CALL = "Response Call (1/0) Calculated per Response Code";
    public static final String BAMA_SPECIMEN = "Specimen type";
    public static final String BAMA_VACCINE = "Vaccine matched indicator";

    public static final String DEMOGRAPHICS = "Subject characteristics";
    public static final String DEMO_AGEGROUP = "Age Group at Enrollment";
    public static final String DEMO_AGE = "Age at Enrollment";
    public static final String DEMO_BMI = "BMI at Enrollment";
    public static final String DEMO_CIRCUMCISED = "Circumcised at Enrollment";
    public static final String DEMO_COUNTRY = "Country at Enrollment";
    public static final String DEMO_HISPANIC = "Hispanic";
    public static final String DEMO_RACE = "Race";
    public static final String DEMO_SEX = "Sexatbirth";
    public static final String DEMO_SPECIES = "Species";
    public static final String DEMO_SUBSPECIES = "Subspecies";

    public static final String ELISPOT = "ELISPOT (Enzyme-Linked ImmunoSpot)";
    public static final String ELISPOT_ANTIGEN = "Antigen Panel";
    public static final String ELISPOT_ANTIGEN_TYPE = "Antigen Type";
    public static final String ELISPOT_ASSAY = "Assay Identifier";
    public static final String ELISPOT_CELL_NAME = "Cell Name";
    public static final String ELISPOT_CELL_TYPE = "Cell Type";
    public static final String ELISPOT_CLADE = "Clade";
    public static final String ELISPOT_DATA_PROV = "Data provenance";
    public static final String ELISPOT_LAB_SRC_KEY = "Els Ifng Lab Source Key";
    public static final String ELISPOT_EXP_ASSAY = "Experimental Assay Design Code";
    public static final String ELISPOT_MARKER_NAME = "Functional marker name";
    public static final String ELISPOT_MARKER_TYPE = "Functional marker type";
    public static final String ELISPOT_LAB = "Lab ID";
    public static final String ELISPOT_MAGNITUDE_BACKGROUND = "Magnitude (% cells) - Background";
    public static final String ELISPOT_MAGNITUDE_BACKGROUND_SUB = "Magnitude (% cells) - Background subtracted";
    public static final String ELISPOT_MAGNITUDE_RAW = "Magnitude (% cells) - Raw";
    public static final String ELISPOT_PEPTIDE_POOL = "Peptide Pool";
    public static final String ELISPOT_PROTEIN =  "Protein";
    public static final String ELISPOT_PROTEIN_PANEL =  "Protein Panel";
    public static final String ELISPOT_RESPONSE =  "Response call";
    public static final String ELISPOT_SPECIMEN =  "Specimen type";
    public static final String ELISPOT_VACCINE =  "Vaccine matched indicator";

    public static final String ICS = "ICS (Intracellular Cytokine Staining)";
    public static final String ICS_ANTIGEN = "Antigen";
    public static final String ICS_ANTIGEN_TYPE = "Antigen Type";
    public static final String ICS_ANTIGEN_VAC_MATCH = "Antigen Vaccine Match Indicator";
    public static final String ICS_ASSAY = "Assay identifier";
    public static final String ICS_CELL_NAME = "Cell name";
    public static final String ICS_CELL_TYPE = "Cell type";
    public static final String ICS_CLADE = "Clade";
    public static final String ICS_DATA = "Data provenance";
    public static final String ICS_EXP_ASSAY = "Experimental Assay Design Code";
    public static final String ICS_MARKER_NAME = "Functional marker name";
    public static final String ICS_MARKER_TYPE = "Functional marker type";
    public static final String ICS_LAB_SRC_KEY = "Ics Lab Source Key";
    public static final String ICS_LAB = "Lab ID";
    public static final String ICS_MAGNITUDE_BACKGROUND = "Magnitude (% cells) - Background";
    public static final String ICS_MAGNITUDE_BACKGROUND_SUB = "Magnitude (% cells) - Background subtracted";
    public static final String ICS_MAGNITUDE_BACKGROUND_RAW = "Magnitude (% cells) - Raw";
    public static final String ICS_PEPTIDE_POOL = "Peptide pool";
    public static final String ICS_PROTEIN = "Protein";
    public static final String ICS_PROTEIN_CLADE = "Protein Clade";
    public static final String ICS_PROTEIN_PANEL = "Protein Panel";
    public static final String ICS_RESPONSE = "Response call";
    public static final String ICS_SPECIMEN = "Specimen type";
    public static final String ICS_VACCINE = "Vaccine matched";

    public static final String NAB = "NAb (Neutralizing antibody)";
    public static final String NAB_ANTIGEN = "Antigen";
    public static final String NAB_ANTIGEN_CLADE = "Antigen clade";
    public static final String NAB_ANTIGEN_TYPE = "Antigen type";
    public static final String NAB_ASSAY = "Assay identifier";
    public static final String NAB_CLADE = "Clade";
    public static final String NAB_DATA = "Data provenance";
    public static final String NAB_EXP_ASSAY = "Experimental Assay Design Code";
    public static final String NAB_INIT_DILUTION = "Initial dilution";
    public static final String NAB_ISOLATE = "Isolate";
    public static final String NAB_LAB = "Lab ID";
    public static final String NAB_LAB_SRC_KEY = "Nab Lab Source Key";
    public static final String NAB_NEUTRAL = "Neutralization tier";
    public static final String NAB_RESPONSE = "Response call";
    public static final String NAB_SPECIMEN = "Specimen type";
    public static final String NAB_TARGET_CELL = "Target cell";
    public static final String NAB_TIER = "Tier";
    public static final String NAB_TITERIC50 = "Titer IC50";
    public static final String NAB_TITERIC80 = "Titer IC80";
    public static final String NAB_VIRUS_NAME = "Virus name";
    public static final String NAB_VIRUS_TYPE = "Virus type";

    public static final String TIME_POINTS = "Time points";
    public static final String TIME_POINTS_DAYS = "Study days";
    public static final String TIME_POINTS_WEEKS = "Study weeks";
    public static final String TIME_POINTS_MONTHS = "Study months";

    // These are values used in the data grid.
    public static final String GRID_TITLE_BAMA = TITLE_BAMA;
    public static final String GRID_TITLE_DEMO = "Subject characteristics";
    public static final String GRID_TITLE_ELISPOT = TITLE_ELISPOT;
    public static final String GRID_TITLE_ICS = TITLE_ICS;
    public static final String GRID_TITLE_NAB = "Neutralizing antibody";
    public static final String GRID_TITLE_PLOT = "Plot Data Results";
    public static final String GRID_COL_SUBJECT_ID = "Subject Id";
    public static final String GRID_COL_STUDY = "Study";
    public static final String GRID_COL_VISIT = "Visit";
    public static final String GRID_COL_TREATMENT_SUMMARY = "Treatment Summary";
    public static final String GRID_COL_STUDY_DAY = "Study Day";
    public static final String GRID_COL_CUR_COL = "Current columns";
    public static final String GRID_COL_ALL_VARS = "All variables from this session";

    // Time points alignments
    public static final String TIME_POINTS_ALIGN_DAY0 = "Aligned by Day 0";
    public static final String TIME_POINTS_ALIGN_ENROLL = "Enrollment";
    public static final String TIME_POINTS_ALIGN_LAST_VAC = "Last Vaccination";

    // This function is used to build id for elements found on the tree panel.
    public String buildIdentifier(String firstId, String... elements)
    {
        String finalId;

        // Need to special case the "all" checkbox case.
        if(elements[0].toLowerCase().contains("all"))
        {
            finalId = firstId.replaceAll(" " , "_") + "-";
        }
        else
        {
            // In this case the firstId is an assay name.
            finalId = PANEL_PREFIX + "_" + firstId + "_";
        }

        for(String temp : elements)
        {
            temp = temp.replaceAll(" " , "_");
            finalId += temp + "-";
        }
        if (finalId.length() > 0)
        {
            finalId = finalId.substring(0, finalId.length() - 1);
        }

        return finalId;
    }

    public String buildCountIdentifier(String... elements)
    {
        String finalId = "";

        for(String temp : elements)
        {
            temp = temp.replaceAll(" " , "_");
            finalId += temp + "-";
        }
        if (finalId.length() > 0)
        {
            finalId = finalId.substring(0, finalId.length() - 1);
        }

        return finalId + "-count";
    }

    // Because the test data changes frequently it can be useful to skip any steps that validate counts.
    public static final boolean validateCounts = true;

    private final BaseWebDriverTest _test;

    public CDSHelper(BaseWebDriverTest test)
    {
        _test = test;
    }

    @LogMethod(quiet = true)
    public void enterApplication()
    {
        _test.goToProjectHome();
        _test.clickAndWait(Locator.linkWithText("Application"));
        _test.addUrlParameter("_showPlotData=true");

        _test.assertElementNotPresent(Locator.linkWithText("Home"));
        _test.waitForElement(Locator.tagContainingText("h1", "Welcome to the CAVD DataSpace"));
        _test.assertElementNotPresent(Locator.linkWithText("Admin"));
        _test.waitForElement(Locator.tagWithClass("body", "appready"));
        Ext4Helper.setCssPrefix("x-");
    }

    @LogMethod(quiet = true)
    public void pickSort(@LoggedParam final String sortBy)
    {
        _test.click(Locator.id("sae-hierarchy-dropdown"));

        applyAndWaitForBars(aVoid -> {
            _test.waitAndClick(Locator.xpath("//li[text()='" + sortBy + "' and contains(@class, 'x-boundlist-item')]"));
            return null;
        });

        _test.waitForFormElementToEqual(Locator.input("sae-hierarchy"), sortBy);
    }

    public void pickDimension(final String dimension)
    {
        applyAndWaitForBars(aVoid -> {
            _test.click(Locators.dimensionHeaderLocator(dimension));
            return null;
        });

        _test.waitForElement(Locators.activeDimensionHeaderLocator(dimension));
    }

    public void saveLiveGroup(String name, @Nullable String description)
    {
        saveGroup(name, description, "live");
    }

    public void saveSnapshotGroup(String name, @Nullable String description)
    {
        saveGroup(name, description, "snapshot");
    }

    private void saveGroup(String name, @Nullable String description, String type)
    {
        _test.click(Locators.cdsButtonLocator("save", "filtersave"));
        _test.waitForText("Live: Update group with new data");
        _test.waitForText("replace an existing group");
        _test.setFormElement(Locator.name("groupname"), name);
        if (null != description)
            _test.setFormElement(Locator.name("groupdescription"), description);

        if ("snapshot".equals(type))
        {
            _test.click(Ext4Helper.Locators.radiobutton(_test, "Snapshot: Keep this group static"));
        }

        applyAndMaybeWaitForBars(aVoid -> {
            _test.click(Locators.cdsButtonLocator("save", "groupcreatesave"));
            return null;
        });
    }

    public void saveOverGroup(String name)
    {
        _test.click(Locators.cdsButtonLocator("save", "filtersave"));
        _test.waitForText("Live: Update group with new data");
        _test.click(CDSHelper.Locators.cdsButtonLocator("replace an existing group"));
        _test.waitAndClick(Locator.tagWithClass("div", "save-label").withText(name));
        _test.click(Locators.cdsButtonLocator("save", "groupupdatesave"));
    }

    public void selectBars(String... bars)
    {
        selectBars(false, bars);
    }

    public void shiftSelectBars(String... bars)
    {
        selectBars(true, bars);
    }

    public void selectBars(boolean isShift, String... bars)
    {
        if (bars == null || bars.length == 0)
            throw new IllegalArgumentException("Please specify bars to select.");

        Keys multiSelectKey;
        if (isShift)
            multiSelectKey = Keys.SHIFT;
        else if (SystemUtils.IS_OS_MAC)
            multiSelectKey = Keys.COMMAND;
        else
            multiSelectKey = Keys.CONTROL;

        clickBar(bars[0]);

        if (bars.length > 1)
        {
            Actions builder = new Actions(_test.getDriver());
            builder.keyDown(multiSelectKey).build().perform();

            for (int i = 1; i < bars.length; i++)
            {
                clickBar(bars[i]);
            }

            builder.keyUp(multiSelectKey).build().perform();
        }
    }

    private void clickBar(String barLabel)
    {
        WebElement detailStatusPanel = Locator.css("ul.detailstatus").waitForElement(_test.getDriver(), CDS_WAIT); // becomes stale after filter is applied
        _test.shortWait().until(ExpectedConditions.elementToBeClickable(Locators.barLabel.withText(barLabel).toBy()));
        _test.clickAt(_test.getElement(Locators.barLabel.withText(barLabel)), 1, 1, 0); // Click left end of bar; other elements might obscure click on Chrome
        _test.waitForElement(Locators.filterMemberLocator(barLabel), CDS_WAIT);
        _test.shortWait().until(ExpectedConditions.stalenessOf(detailStatusPanel));
        waitForFilterAnimation();
    }

    private void waitForFilterAnimation()
    {
        Locator floatingFilterLoc = Locator.css(".barlabel.selected");
        _test.waitForElementToDisappear(floatingFilterLoc);
    }

    public void applySelection(String barLabel)
    {
        applySelection(barLabel, barLabel);
    }

    private void applySelection(String barLabel, String filteredLabel)
    {
        selectBars(barLabel);
        _test.waitForElement(Locators.filterMemberLocator(filteredLabel), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
    }

    public void goToAppHome()
    {
        _test.click(Locator.xpath("//div[contains(@class, 'connectorheader')]//div[contains(@class, 'logo')]"));
        _test.waitForElement(Locator.tagContainingText("h1", "Welcome to the CAVD DataSpace"));
    }

    public void goToSummary()
    {
        NavigationLink.SUMMARY.makeNavigationSelection(_test);
    }

    public void clearFilter(int index)
    {
        Locator.XPathLocator filterPane = CDSHelper.Locators.filterPane(index);
        Locator.XPathLocator clearButtonLocator = filterPane.append(Locator.tagWithClass("span", "closeitem"));

        // activate the hover close
        _test.mouseOver(filterPane);
        _test.waitForElement(clearButtonLocator.notHidden());

        final WebElement clearButton = _test.waitForElement(clearButtonLocator);

        applyAndMaybeWaitForBars(aVoid -> {
            clearButton.click();
            return null;
        });

        _test.waitForText("Filter removed.");
    }

    public void clearFilters()
    {
        final WebElement clearButton = _test.waitForElement(Locators.cdsButtonLocator("clear", "filterclear"));

        applyAndMaybeWaitForBars(aVoid -> {
            clearButton.click();
            return null;
        });
        _test.waitForElement(Locator.xpath("//div[@class='emptytext' and text()='All subjects']"));
    }

    public void ensureNoFilter()
    {
        // clear filters
        if (_test.isElementPresent(CDSHelper.Locators.cdsButtonLocator("clear", "filterclear").notHidden()))
        {
            clearFilters();
        }
    }

    public void undoClearFilter()
    {
        _test.waitForElement(Locator.xpath("//div[@class='emptytext' and text()='All subjects']"));

        applyAndMaybeWaitForBars(aVoid -> {
            _test.click(Locator.linkWithText("Undo"));
            return null;
        });

        _test.waitForElement(Locators.cdsButtonLocator("clear", "filterclear"));
    }

    public void useSelectionAsSubjectFilter()
    {
        _test.click(Locators.cdsButtonLocator("Filter"));
        waitForClearSelection(); // wait for animation
    }

    public void clearSelection()
    {
        Locator.XPathLocator selectionPane = CDSHelper.Locators.selectionPane();
        Locator.XPathLocator clearButtonLocator = selectionPane.append(Locator.tagWithClass("span", "closeitem"));

        // activate the hover close
        _test.mouseOver(selectionPane);
        _test.waitForElement(clearButtonLocator.notHidden());

        final WebElement clearButton = _test.waitForElement(clearButtonLocator);

        applyAndMaybeWaitForBars(aVoid -> {
            clearButton.click();
            return null;
        });

        waitForClearSelection();
    }

    public void ensureNoSelection()
    {
        // clear selections
        if (_test.isElementPresent(CDSHelper.Locators.cdsButtonLocator("clear", "selectionclear").notHidden()))
        {
            clearSelection();
        }
    }

    private void waitForClearSelection()
    {
        _test.shortWait().until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("div.selectionpanel")));
    }

    public void clickBy(final String byNoun)
    {
        final WebElement link = _test.waitForElement(Locators.getByLocator(byNoun));

        applyAndWaitForBars(aVoid -> {
            link.click();
            _test.waitForElement(Locators.activeDimensionHeaderLocator(byNoun));
            return null;
        });

    }

    public void hideEmpty()
    {
        applyAndWaitForBars(aVoid -> {
            _test.click(Locators.cdsButtonLocator("Hide empty"));
            return null;
        });

        _test.waitForElementToDisappear(Locator.tagWithClass("div", "barchart").append(Locator.tagWithClass("span", "count").withText("0")));
        _test.waitForElement(CDSHelper.Locators.cdsButtonLocator("Show empty"));
    }

    public void showEmpty()
    {
        applyAndWaitForBars(aVoid -> {
            _test.click(Locators.cdsButtonLocator("Show empty"));
            return null;
        });

        _test.waitForElement(CDSHelper.Locators.cdsButtonLocator("Hide empty"));
    }

    public void viewInfo(String barLabel)
    {
        Locator.XPathLocator barLocator = Locator.tag("div").withClass("small").withDescendant(Locator.tag("span").withClass("barlabel").withText(barLabel));
        _test.scrollIntoView(barLocator); // screen might be too small
        _test.mouseOver(barLocator);
        _test.fireEvent(barLocator.append("//button"), BaseWebDriverTest.SeleniumEvent.click); // TODO: FirefoxDriver doesn't tigger :hover styles. Click with Javascript.
        _test.waitForElement(Locators.cdsButtonLocator("Close"));
        _test.waitForElement(Locator.css(".savetitle").withText(barLabel), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
    }

    public void viewLearnAboutPage(String learnAxis)
    {
        NavigationLink.LEARN.makeNavigationSelection(_test);

        Locator.XPathLocator headerContainer = Locator.tag("div").withClass("dim-selector");
        Locator.XPathLocator header = Locator.tag("h1").withClass("lhdv");
        Locator.XPathLocator activeHeader = header.withClass("active");

        if (!_test.isElementPresent(headerContainer.append(activeHeader.withText(learnAxis))))
        {
            _test.click(headerContainer.append(header.withText(learnAxis)));
            WebElement activeLearnAboutHeader = Locator.tag("h1").withClass("lhdv").withClass("active").withText(learnAxis).waitForElement(_test.getDriver(), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
            _test.shortWait().until(ExpectedConditions.visibilityOf(activeLearnAboutHeader));
        }
    }

    public void closeInfoPage()
    {
        _test.click(Locators.cdsButtonLocator("Close"));
        _test.waitForElementToDisappear(Locator.button("Close"), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
    }

    public void deleteGroupFromSummaryPage(String name)
    {
        Locator.XPathLocator groupListing = Locator.tagWithClass("div", "grouplabel").containing(name);
        _test.shortWait().until(ExpectedConditions.elementToBeClickable(groupListing.toBy()));
        _test.click(groupListing);
        _test.waitForElement(Locators.cdsButtonLocator("delete"));
        _test.click(Locators.cdsButtonLocator("delete"));
        _test.waitForText("Are you sure you want to delete");
        _test.click(Locator.linkContainingText("Delete"));
        _test.waitForText("Welcome to the CAVD DataSpace");
        _test.waitForElementToDisappear(groupListing);
    }

    public void toggleExplorerBar(String largeBarText)
    {
        _test.sleep(CDSHelper.CDS_WAIT_ANIMATION);
        _test.click(Locator.xpath("//div[@class='bar large']//span[contains(@class, 'barlabel') and text()='" + largeBarText + "']//..//..//div[contains(@class, 'saecollapse')]//p"));
        _test.sleep(CDSHelper.CDS_WAIT_ANIMATION);
    }

    public void openStatusInfoPane(String label)
    {
        _test.assertElementPresent(Locator.tagWithClass("ul", "detailstatus"));
        _test.waitAndClick(Locator.tagWithClass("span", "statme").withText(label));

        _test.waitForElement(Locator.tagWithClass("div", "infopane"));
    }

    public void openFilterInfoPane(Locator.XPathLocator filterMember)
    {
        _test.click(Locator.tagWithClass("div", "filter-item").withDescendant(filterMember));

        // 'update' button represents the update of a filter
        _test.waitForElement(Locators.cdsButtonLocator("Update", "filterinfoaction"));
    }

    public void changeInfoPaneSort(String fromSort, String toSort)
    {
        Locator.XPathLocator infoPane = Locator.tagWithClass("div", "infopane");
        Locator.XPathLocator sorter = infoPane.withDescendant(Locator.tagWithClass("div", "sorter"));

        _test.waitForElement(infoPane);
        _test.waitForElement(sorter.withDescendant(Locator.tagContainingText("span", fromSort)));

        _test.click(Locators.infoPaneSortButtonLocator());

        Locator.XPathLocator sortItemLabel = Locator.tagWithClass("span", "x-menu-item-text").withText(toSort);
        Locator.XPathLocator sortItem = Locator.tagWithClass("div", "infosortmenu").append(Locator.tagWithClass("div", "x-menu-item").withDescendant(sortItemLabel));
        _test.waitAndClick(sortItem.notHidden());
        _test.waitForElement(sorter.withDescendant(Locator.tagContainingText("span", toSort)));
    }

    public void selectInfoPaneItem(String label, boolean onlyThisItem)
    {
        Locator.XPathLocator memberLabel = Locator.tagWithClass("div", "x-grid-cell-inner").containing(label);

        if (onlyThisItem)
        {
            // click the label
            _test.click(memberLabel);
        }
        else
        {
            Locator.XPathLocator row = Locator.tagWithClass("tr", "x-grid-data-row");
            Locator.XPathLocator check = Locator.tagWithClass("td", "x-grid-cell-row-checker");

            // click the checkbox
            _test.click(row.withDescendant(memberLabel).child(check));
        }
    }

    /**
     * Call this with the info pane display open.
     * @param setAND - Exclusive flag that will select either 'AND' or 'OR' depending on the value.
     */
    public void selectInfoPaneOperator(boolean setAND)
    {
        String radioLabel = (setAND ? "(AND)" : "(OR)");
        _test.click(Locator.tagWithClass("label", "x-form-cb-label").containing(radioLabel));
    }

    public boolean isCheckboxChecked(String xpath)
    {
        WebElement tableParent;
        Locator checkBox;

        checkBox = Locator.xpath(xpath + "/./ancestor-or-self::table[contains(@class, 'checkbox2')]");

        tableParent = _test.getDriver().findElement(checkBox.toBy());

        String classAttribute = tableParent.getAttribute("class");

        if(classAttribute.contains("x-form-cb-checked"))
        {
            return true;
        }
        else
        {
            return false;
        }

    }

    private void applyAndMaybeWaitForBars(Function<Void, Void> function)
    {
        if (_test.isElementPresent(Locator.id("single-axis-explorer")))
        {
            applyAndWaitForBars(function);
        }
        else
        {
            function.apply(null);
        }
    }

    private void applyAndWaitForBars(Function<Void, Void> function)
    {
        List<WebElement> bars = Locator.css("div.bar").findElements(_test.getDriver());

        function.apply(null);

        if (bars.size() > 0)
            _test.shortWait().until(ExpectedConditions.stalenessOf(bars.get(0)));

        _test.waitForElement(Locator.tagWithClass("div", "saeempty"), 500, false);

        if (!_test.isElementPresent(Locator.tagWithClass("div", "saeempty")))
            waitForBarAnimation();
    }

    private void waitForBarAnimation()
    {
        Locator animatingBar = Locator.tagWithClass("div", "bar").withPredicate(
                Locator.tagWithClass("span", "count").withoutText("0")).append(
                Locator.tagWithClass("span", "index"));
        _test.shortWait().until(LabKeyExpectedConditions.animationIsDone(animatingBar));
    }

    public enum NavigationLink
    {
        HOME("Home", Locator.tagContainingText("h1", "Welcome to the")),
        LEARN("Learn about studies, assays, ...", Locator.tagWithClass("div", "titlepanel").withText("Learn about...")),
        SUMMARY("Find subjects", Locator.tag("h1").containing("Find subjects of interest.")),
        PLOT("Plot data", Locator.tagWithClass("a", "yaxisbtn")),
        GRID("View data grid", DataGridVariableSelector.titleLocator);

        private String _linkText;
        private Locator.XPathLocator _expectedElement;

        private NavigationLink(String linkText, Locator.XPathLocator expectedElement)
        {
            _linkText = linkText;
            _expectedElement = expectedElement.notHidden();
        }

        public String getLinkText()
        {
            return _linkText;
        }

        public Locator.XPathLocator getLinkLocator()
        {
            return Locator.tagWithClass("div", "navigation-view").append(Locator.tagWithClass("div", "nav-label").withText(_linkText));
        }

        public Locator.XPathLocator getExpectedElement()
        {
            return _expectedElement;
        }

        public void makeNavigationSelection(BaseWebDriverTest _test)
        {
            _test.click(getLinkLocator());
            _test.waitForElement(getExpectedElement());
        }
    }

    public static class Locators
    {
        public static Locator.XPathLocator barLabel = Locator.tagWithClass("span", "barlabel");

        public static Locator.XPathLocator getByLocator(String byNoun)
        {
            return Locator.xpath("//div[contains(@class, 'bycolumn')]//span[contains(@class, 'label') and contains(text(), '" + byNoun + "')]");
        }

        public static Locator.XPathLocator cdsButtonLocator(String text)
        {
            return Locator.xpath("//a[not(contains(@style, 'display: none'))]").withPredicate(Locator.xpath("//span[contains(@class, 'x-btn-inner') and text()='" + text + "']"));
        }

        public static Locator.XPathLocator cdsButtonLocator(String text, String cssClass)
        {
            return Locator.xpath("//a[contains(@class, '" + cssClass + "')]").withPredicate(Locator.xpath("//span[contains(@class, 'x-btn-inner') and text()='" + text + "']"));
        }

        public static Locator.XPathLocator cdsSelectorButtonLocator(String selector, String text)
        {
            return Locator.xpath("//div[contains(@class, '" + selector + "')]//a[not(contains(@style, 'display: none'))]").withPredicate(Locator.xpath("//span[contains(@class, 'x-btn-inner') and text()='" + text + "']"));
        }

        public static Locator.XPathLocator cdsButtonLocatorContainingText(String text)
        {
            return Locator.xpath("//a").withPredicate(Locator.xpath("//span[contains(@class, 'x-btn-inner') and contains(text(),'" + text + "')]"));
        }

        public static Locator.XPathLocator cdsDropDownButtonLocator(String cssClass)
        {
            return Locator.xpath("//button[contains(@class, 'imgbutton') and contains(@class, '" + cssClass + "')]");
        }

        public static Locator.XPathLocator filterMemberLocator()
        {
            return Locator.tagWithClass("div", "memberloc");
        }

        public static Locator.XPathLocator filterMemberLocator(String filterText)
        {
            return filterMemberLocator().containing(filterText);
        }

        public static Locator.XPathLocator getFilterStatusLocator(int count, String singular, String plural)
        {
            return getFilterStatusLocator(count, singular, plural, false);
        }

        public static Locator.XPathLocator getFilterStatusLocator(int count, String singular, String plural, boolean highlight)
        {
            String strCount = NumberFormat.getIntegerInstance().format(count); //Need to format to allow for number greater than 999 (search looks for a number with a ',' in it).
            String path = "//li//span[text()='" + (count != 1 ? plural : singular) + "']";
            path = path + ((validateCounts) ?  "/../span[contains(@class, '" + (highlight ? "hl-" : "") + "status-count') and text()='" + strCount + "']" : "");
            return Locator.xpath(path);
        }

        public static Locator.XPathLocator getSelectionStatusLocator(int count, String match)
        {
            String strCount = NumberFormat.getIntegerInstance().format(count);
            String path = "//li//span[contains(text(), '" + match + "')]";
            path = path + ((validateCounts) ? "/../span[contains(@class, 'status-subcount') and text()='" + strCount + "']" : "");
            return Locator.xpath(path);
        }

        public static Locator.XPathLocator infoPaneSortButtonLocator()
        {
            return Locator.tagWithClass("button", "ipdropdown");
        }

        public static Locator.XPathLocator dimensionHeaderLocator(String dimension)
        {
            return Locator.tagWithClass("div", "dim-selector").append(Locator.tagWithClass("h1", "lhdv").withText(dimension));
        }

        public static Locator.XPathLocator activeDimensionHeaderLocator(String dimension)
        {
            return Locator.tagWithClass("div", "dim-selector").append(Locator.tagWithClass("h1", "active").withText(dimension));
        }

        public static Locator.XPathLocator selectionPane()
        {
            return Locator.tagWithClass("div", "selectionpanel");
        }

        public static Locator.XPathLocator filterPane(int index)
        {
            return Locator.tagWithClass("div", "filterpanel").append(Locator.tagWithClass("div", "activefilter")).index(index);
        }
    }

    // Used to identify data in the time axis.
    public static class TimeAxisData
    {
        public String studyName;
        public int vaccinationCount;
        public int nonvaccinationCount;
        public int challengeCount;
        public int preenrollmentCount;

        public TimeAxisData(String studyName, int vacCount, int nonvacCount, int chalCount, int preCount)
        {
            this.studyName = studyName;
            vaccinationCount = vacCount;
            nonvaccinationCount = nonvacCount;
            challengeCount = chalCount;
            preenrollmentCount = preCount;
        }
    }

}
