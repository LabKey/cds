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
package org.labkey.test.util.cds;

import org.apache.commons.lang3.SystemUtils;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.junit.Assert;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.WebTestHelper;
import org.labkey.test.components.cds.CdsGrid;
import org.labkey.test.components.html.BootstrapMenu;
import org.labkey.test.pages.cds.DataGrid;
import org.labkey.test.pages.cds.GroupDetailsPage;
import org.labkey.test.pages.cds.LearnGrid;
import org.labkey.test.pages.cds.LearnGrid.LearnTab;
import org.labkey.test.util.ApiPermissionsHelper;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LabKeyExpectedConditions;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.LoggedParam;
import org.labkey.test.util.PermissionsHelper;
import org.labkey.test.util.RReportHelper;
import org.labkey.test.util.TestLogger;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Action;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.io.File;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.regex.Pattern;

import static org.labkey.test.util.TestLogger.log;

public class CDSHelper
{
    public static final String QED_1 = "QED 1";
    public static final String QED_2 = "QED 2";
    public static final String QED_3 = "QED 3";
    public static final String QED_4 = "QED 4";
    public static final String RED_1 = "RED 1";
    public static final String RED_2 = "RED 2";
    public static final String RED_3 = "RED 3";
    public static final String RED_4 = "RED 4";
    public static final String RED_5 = "RED 5";
    public static final String RED_6 = "RED 6";
    public static final String RED_7 = "RED 7";
    public static final String RED_8 = "RED 8";
    public static final String RED_9 = "RED 9";
    public static final String YOYO_55 = "YOYO 55";
    public static final String ZAP_100 = "ZAP 100";
    public static final String ZAP_101 = "ZAP 101";
    public static final String ZAP_102 = "ZAP 102";
    public static final String ZAP_103 = "ZAP 103";
    public static final String ZAP_104 = "ZAP 104";
    public static final String ZAP_105 = "ZAP 105";
    public static final String ZAP_106 = "ZAP 106";
    public static final String ZAP_107 = "ZAP 107";
    public static final String ZAP_108 = "ZAP 108";
    public static final String ZAP_109 = "ZAP 109";
    public static final String ZAP_110 = "ZAP 110";
    public static final String ZAP_111 = "ZAP 111";
    public static final String ZAP_112 = "ZAP 112";
    public static final String ZAP_113 = "ZAP 113";
    public static final String ZAP_114 = "ZAP 114";
    public static final String ZAP_115 = "ZAP 115";
    public static final String ZAP_116 = "ZAP 116";
    public static final String ZAP_117 = "ZAP 117";
    public static final String ZAP_118 = "ZAP 118";
    public static final String ZAP_119 = "ZAP 119";
    public static final String ZAP_120 = "ZAP 120";
    public static final String ZAP_121 = "ZAP 121";
    public static final String ZAP_122 = "ZAP 122";
    public static final String ZAP_123 = "ZAP 123";
    public static final String ZAP_124 = "ZAP 124";
    public static final String ZAP_125 = "ZAP 125";
    public static final String ZAP_126 = "ZAP 126";
    public static final String ZAP_127 = "ZAP 127";
    public static final String ZAP_128 = "ZAP 128";
    public static final String ZAP_129 = "ZAP 129";
    public static final String ZAP_130 = "ZAP 130";
    public static final String ZAP_131 = "ZAP 131";
    public static final String ZAP_132 = "ZAP 132";
    public static final String ZAP_133 = "ZAP 133";
    public static final String ZAP_134 = "ZAP 134";
    public static final String ZAP_135 = "ZAP 135";
    public static final String ZAP_136 = "ZAP 136";
    public static final String ZAP_137 = "ZAP 137";
    public static final String ZAP_138 = "ZAP 138";
    public static final String ZAP_139 = "ZAP 139";
    public static final String ZAP_140 = "ZAP 140";


    public static final String[] STUDIES = {QED_1, QED_2, QED_3, QED_4, RED_1, RED_2, RED_3, RED_4, RED_5, RED_6,
            RED_7, RED_8, RED_9, YOYO_55, ZAP_100, ZAP_101, ZAP_102, ZAP_103, ZAP_104, ZAP_105, ZAP_106, ZAP_107,
            ZAP_108, ZAP_109, ZAP_110, ZAP_111, ZAP_112, ZAP_113, ZAP_114, ZAP_115, ZAP_116, ZAP_117, ZAP_118,
            ZAP_119, ZAP_120, ZAP_121, ZAP_122, ZAP_123, ZAP_124, ZAP_125, ZAP_126, ZAP_127, ZAP_128, ZAP_129,
            ZAP_130, ZAP_131, ZAP_132, ZAP_133, ZAP_134, ZAP_135, ZAP_136, ZAP_137, ZAP_138, ZAP_139, ZAP_140};

    public static final String[] PROT_NAMES = {ZAP_117, ZAP_102, ZAP_136, ZAP_110, ZAP_134, QED_2, ZAP_135, ZAP_139}; //incomplete list, only first and last under each assay in find subjects view.

    public static final String PROT_Q1 = "q1";
    public static final String PROT_Q2 = "q2";
    public static final String PROT_Q3 = "q3";
    public static final String PROT_Q4 = "q4";
    public static final String PROT_R1 = "r1";
    public static final String PROT_R2 = "r2";
    public static final String PROT_R3 = "r3";
    public static final String PROT_R4 =  "r4";
    public static final String PROT_R5 = "r5";
    public static final String PROT_R6 = "r6";
    public static final String PROT_R7 = "r7";
    public static final String PROT_R8 = "r8";
    public static final String PROT_R9 = "r9";
    public static final String PROT_Y55 = "y55";
    public static final String PROT_Z100 = "z100";
    public static final String PROT_Z101 = "z101";
    public static final String PROT_Z102 = "z102";
    public static final String PROT_Z103 = "z103";
    public static final String PROT_Z104 = "z104";
    public static final String PROT_Z105 = "z105";
    public static final String PROT_Z106 = "z106";
    public static final String PROT_Z107 = "z107";
    public static final String PROT_Z108 = "z108";
    public static final String PROT_Z109 = "z109";
    public static final String PROT_Z110 = "z110";
    public static final String PROT_Z111 = "z111";
    public static final String PROT_Z112 = "z112";
    public static final String PROT_Z113 = "z113";
    public static final String PROT_Z114 = "z114";
    public static final String PROT_Z115 = "z115";
    public static final String PROT_Z116 = "z116";
    public static final String PROT_Z117 = "z117";
    public static final String PROT_Z118 = "z118";
    public static final String PROT_Z119 = "z119";
    public static final String PROT_Z120 = "z120";
    public static final String PROT_Z121 = "z121";
    public static final String PROT_Z122 = "z122";
    public static final String PROT_Z123 = "z123";
    public static final String PROT_Z124 = "z124";
    public static final String PROT_Z125 = "z125";
    public static final String PROT_Z126 = "z126";
    public static final String PROT_Z127 = "z127";
    public static final String PROT_Z128 = "z128";
    public static final String PROT_Z129 = "z129";
    public static final String PROT_Z130 = "z130";
    public static final String PROT_Z131 = "z131";
    public static final String PROT_Z132 = "z132";
    public static final String PROT_Z133 = "z133";
    public static final String PROT_Z134 = "z134";
    public static final String PROT_Z135 = "z135";
    public static final String PROT_Z136 = "z136";
    public static final String PROT_Z137 = "z137";
    public static final String PROT_Z138 = "z138";
    public static final String PROT_Z139 = "z139";
    public static final String PROT_Z140 = "z140";

    public static final String ANTIGEN_HIV_1C = "HIV-1 C.9999.B2 [gp120.D7.avi]";

    public static final String ANTIGEN_HIV_1D = "HIV-1 D.99986.B12 [gx120.D7.avi]";
    public static final String[] PROTS = {PROT_Q1, PROT_Q2, PROT_Q3, PROT_Q4, PROT_R1, PROT_R2, PROT_R3, PROT_R4, PROT_R5,
            PROT_R6, PROT_R7, PROT_R8, PROT_R9, PROT_Y55, PROT_Z100, PROT_Z101, PROT_Z102, PROT_Z103, PROT_Z104,
            PROT_Z105, PROT_Z106, PROT_Z107, PROT_Z108, PROT_Z109, PROT_Z110, PROT_Z111, PROT_Z112, PROT_Z113,
            PROT_Z114, PROT_Z115, PROT_Z116, PROT_Z117, PROT_Z118, PROT_Z119, PROT_Z120, PROT_Z121, PROT_Z122,
            PROT_Z123, PROT_Z124, PROT_Z125, PROT_Z126, PROT_Z127, PROT_Z128, PROT_Z129, PROT_Z130, PROT_Z131,
            PROT_Z132, PROT_Z133, PROT_Z134, PROT_Z135, PROT_Z136, PROT_Z137, PROT_Z138, PROT_Z139, PROT_Z140};

    public static final String[] PRODUCTS = {"2F5", "3BNC117", "Acetaminophen, Dextromethorphan Hydrobromide, Doxylamine Succinate",
            "ACETAMINOPHEN, DEXTROMETHORPHAN HYDROBROMIDE, PHENYLEPHRINE HYDROCHLORIDE",
            "Acetaminophen, Diphenhydramine Hydrochloride, and Phenylephrine Hydrochloride",
            "Acetaminophen, Doxylamine Succinate, Phenylephrine HCl", "Adenosinum cyclophosphoricum", "ALCOHOL",
            "alendronate sodium and cholecalciferol", "Allium sativum", "Alnus rubra", "Amantadine Hydrochloride",
            "amoxicillin and clavulanate potassium", "Arnica Aurum 20/30", "Aspirin",
            "AVOBENZONE, HOMOSALATE, OCTINOXATE, OCTISALATE, OXYBENZONE",
            "Avobenzone, Homosalate, Octisalate, Oxybenzone", "Benzalkonium Chloride", "Benzalkonium Di-Chloride",
            "Benzoyl Peroxide", "benztropine mesylate", "Brevibacterium stationis", "Calcium carbonate", "CARBAMAZEPINE",
            "Carbamazepine", "celtis occidentalis pollen", "Chloroxylenol",
            "Chlorpheniramine/Dextromethorphan/Phenylephrine", "Citric Acid and Sodium Citrate",
            "Colocynthis Lycopodium Clavatum Natrum Sulphuricum", "Corn Removers", "Diclofenac Sodium", "Digoxin",
            "doxycycline hyclate", "Dronabinol", "ENALAPRILAT", "Escitalopram", "Famotidine", "Fluconazole",
            "Fosinopril Sodium and Hydrochlorothiazide", "Gabapentin", "GENTAMICIN", "Honeysuckle,",
            "HYDROCODONE BITARTRATE AND ACETAMINOPHEN", "HYDROMORPHONE HYDROCHLORIDE", "HYDROXYZINE PAMOATE",
            "Ibuprofen", "Ibuprofen crbonate", "Ibuprofen dinitrate", "isosorbide dinitrate", "Ketorolac Tromethamine",
            "Loratadine", "Loratadine, Pseudoephedrine Sulfate", "Lovastatin", "Magesium Citrate", "Meclizine", "MENTHOL",
            "METFORMIN HYDROCHLORIDE", "METHYL SALICYLATE", "Miconazole", "Mirtazapine", "Naproxen Sodium",
            "Nicotine Polacrilex", "Oak,", "OCTINOXATE TITANIUM", "OCTINOXATE, TITANIUM DIOXIDE",
            "OCTINOXATE, ZINC OXIDE, ENZACAMENE, TITANIUM DIOXIDE, AMILOXATE, AVOBENZONE",
            "Octinoxate, Zinc Oxide, Octisalate, Oxybenzone", "Olanzapine", "Oxygen", "OXYGEN, NITROGEN, CARBON DIOXIDE",
            "Oxymorphone hydrochloride", "pantoprazole sodium", "Peach", "Penicillin V Potassium", "Petasites Veronica",
            "PGT121", "PGT151", "Pseudoephedrine Hydrochloride", "quetiapine fumarate", "risperidone", "Risperidone",
            "Sagebrush, Mugwort Artemisia vulgaris", "Salicylic Acid", "Sennosides", "Standardized Timothy Grass Pollen",
            "Titanium Dioxide", "TITANIUM DIOXIDE, ZINC OXIDE", "TITANIUM OXIDE", "tramadol hydrochloride",
            "TRICLOSAN", "TRICLOSAN CARBONATE", "trifluoperazine hydrochloride", "verapamil hydrochloride"};

    public static final String[] LABS = {"DL", "WA", "PC", "JN"};
    public static final String[] I_TYPES = {"Cellular", "Humoral"};
    public static final String[] H_TYPES = {"HIV Immunogenicity"};
    public static final String[] SUBJECT_ASSAYS = {"BAMA Biotin LX", "ICS", "IFNg ELS", "NAB A3R5", "NAB TZM-bl"};
    public static final String[] ASSAYS = {"BAMA Biotin LX", "ICS", "IFNg ELS", "NAB A3R5", "NAB TZM-bl", "NAB MAB"};
    public static final String[] ASSAYS_FULL_TITLES = {"BAMA (HIV Binding Antibody)",
            "ICS (Intracellular Cytokine Staining)",
            "IFNg ELISpot (IFNg ELISpot)",
            "NAB (HIV Neutralizing Antibody)",
            "NABMAB (Neutralization Antibody - Monoclonal Antibodies)"};
    public static final String[] LEARN_ABOUT_BAMA_METHODOLOGY = {"Luminex Mutiplex Assay"};
    public static final String[] LEARN_ABOUT_BAMA_VARIABLES_DATA = {"Antigen clade", "The clade (gene subtype) to which", "Protein Panel", "The name of the panel of proteins"};

    public static final String[] LEARN_ABOUT_BAMA_ANTIGEN_COLUMNS = {"Antigen", "Category", "Species", "Clade", "Donor ID",
            "Mutations", "Region", "Scaffold", "Modifiers", "Tags", "Panels", "Host cell", "Purification methods", "Special reagents",
            "Manufacturer", "Plot label", "DataSpace antigen ID", "Control"};

    public static final String[] LEARN_ABOUT_BAMA_ANTIGEN_DATA = {"A1.con.env03 140 CF", "p24"};
    public static final String[] LEARN_ABOUT_ICS_ANTIGEN_TAB_DATA = {"Any v503 Vaccine Matched Antigen", "POL: POL 1", "NEF: NEF 1", "GAG: GAG 1", "Combined: NA"};
//    public static final String[] LEARN_ABOUT_ICS_ANTIGEN_TAB_DATA = {"POL: POL 1, POL 2", "NEF: NEF 1, NEF 2", "GAG: GAG 1, GAG 2", "Combined: NA"};

    public static final String[] LEARN_ABOUT_QED2_INFO_FIELDS = {"Network", "Grant Affiliation", "Study Type", "Stage", "Study start", "First enrollment", "Follow up complete"};
    public static final String[] LEARN_ABOUT_ZAP117_INFO_FIELDS = {"Network", "Grant Affiliation", "Strategy", "Study Type", "Species", "Stage", "First enrollment"};
    public static final String[] LEARN_ABOUT_CONTACT_FIELDS = {"First point of contact", "Grant Principal Investigator", "Grant Project Manager", "Study Investigator"};
    public static final String[] LEARN_ABOUT_DESCRIPTION_FIELDS = {"Objectives", "Rationale", "Groups", "Methods", "Findings", "Conclusions", "Publications"};
    public static final String[] LEARN_ABOUT_PKMAB_ASSAY_DIM_FIELDS = {"Lab ID", "MAb or mixture", "Source assay", "Specimen type"};

    public static final String EMPTY_ASSAY = "HIV-1 RT-PCR";
    public static final String TEST_FEED = WebTestHelper.getBaseURL() + "/Connector/test/testfeed.json";
    public final static int CDS_WAIT = 2000;
    public final static int CDS_WAIT_LEARN = 4000;
    public final static int CDS_WAIT_ANIMATION = 500;
    public final static int CDS_WAIT_TOOLTIP = 5000;

    public final static String RACE_ASIAN = "Asian";
    public final static String RACE_ASIANPACIFIC = "Asian/Pacific Island";
    public final static String RACE_BLACK = "Black";
    public final static String RACE_HAWAIIAN = "Hawaiian/Pacific Isl";
    public final static String RACE_MULTIRACIAL = "Multiracial";
    public final static String RACE_NATIVE = "Native American";
    public final static String RACE_NATIVE_ALAS = "Native American/Alas";
    public final static String RACE_NATIVE_HAWAIIAN = "Native Hawaiian/Paci";
    public final static String RACE_OTHER = "Other";
    public final static String RACE_UNKNOWN = "Unknown";
    public final static String RACE_WHITE = "White";

    public static final String[] RACE_VALUES = {RACE_ASIAN, RACE_ASIANPACIFIC, RACE_BLACK, RACE_HAWAIIAN, RACE_MULTIRACIAL, RACE_NATIVE, RACE_NATIVE_ALAS, RACE_NATIVE_HAWAIIAN, RACE_OTHER, RACE_UNKNOWN, RACE_WHITE};

    public final static String SPECIES_HUMAN = "Human";
    public final static String SPECIES_VULCAN = "Vulcan";

    public static final String[] SPECIES_VALUES = {SPECIES_HUMAN, SPECIES_VULCAN};

    // These are used for ids on the panel selectors and on titles in the Grid.
    public static final String TITLE_NAB = "NAb";
    public static final String TITLE_BAMA = "BAMA";
    public static final String TITLE_ELISPOT = "ELISPOT";
    public static final String TITLE_ICS = "ICS";
    public static final String TITLE_NABMAB = "NABMAB";
    public static final String TITLE_PKMAB = "PKMAb";

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
    public static final String[] BAMA_ANTIGENS_NAME = {ANTIGEN_A1_NAME, ANTIGEN_A244_NAME, ANTIGEN_AE244_NAME, ANTIGEN_BCON_NAME,
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
    public static final String CELL_TYPE_ALL = "All";
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
    public static final String BAMA_MAGNITUDE_DELTA_BASELINE = "Magnitude (mfi) - Background";
    public static final String BAMA_MAGNITUDE_RAW_BASELINE = "Magnitude (mfi) - Raw Baseline";
    public static final String BAMA_PROTEIN = "Protein";
    public static final String BAMA_PROTEIN_PANEL = "Protein Panel";
    public static final String BAMA_RESPONSE_CALL = "Response call";
    public static final String BAMA_SPECIMEN = "Specimen type";
    public static final String BAMA_VACCINE = "Antigen vaccine match indicator";

    public static final String SUBJECT_CHARS = "Subject characteristics";
    public static final String STUDY_TREATMENT_VARS = "Study and treatment variables";
    public static final String DEMO_AGEGROUP = "Age Group at Enrollment";
    public static final String DEMO_AGE = "Age at Enrollment";
    public static final String DEMO_BMI = "BMI at Enrollment";
    public static final String DEMO_CIRCUMCISED = "Circumcised at Enrollment";
    public static final String DEMO_COUNTRY = "Country at Enrollment";
    public static final String DEMO_HISPANIC = "Hispanic";
    public static final String DEMO_RACE = "Race";
    public static final String DEMO_SEX = "Sex at birth";
    public static final String DEMO_SPECIES = "Species";
    public static final String DEMO_SUBSPECIES = "Subspecies";
    public static final String DEMO_STUDY_NAME = "Study Name";
    public static final String DEMO_BMI_GROUP = "BMI Category";
    public static final String DEMO_GENDER_IDENTITY = "Gender identity";
    public static final String DEMO_STUDY = "Study";
    public static final String DEMO_STUDY_COHORT = "Study cohort";
    public static final String DEMO_TREAT_SUMM = "Treatment Summary";
    public static final String DEMO_DATE_SUBJ_ENR = "Date First Subject Enrolled";
    public static final String DEMO_DATE_FUP_COMP = "Date Follow-up Complete";
    public static final String DEMO_DATE_PUB = "Date Study Made Public";
    public static final String DEMO_DATE_START = "Date of Study Start";
    public static final String DEMO_NETWORK = "Network";
    public static final String DEMO_STRATEGY = "Strategy";
    public static final String DEMO_PI = "PI";
    public static final String DEMO_PROD_CLASS = "Product Class Combination";
    public static final String DEMO_PROD_COMB = "Product Combination";
    public static final String DEMO_STUDY_TYPE = "Study Type";
    public static final String DEMO_TREAT_ARM = "Treatment Arm";
    public static final String DEMO_TREAT_CODED = "Treatment Arm Coded Label";
    public static final String DEMO_VACC_PLAC = "Vaccine or Placebo";
    public static final String DEMO_SUBJECT_ID = "Subject Id";

    public static final String ELISPOT = "ELISPOT (Enzyme-Linked ImmunoSpot)";
    public static final String ELISPOT_ANTIGEN = "Antigen name";
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
    public static final String ELISPOT_MAGNITUDE_BACKGROUND = "Magnitude (SFC) - Background";
    public static final String ELISPOT_MAGNITUDE_BACKGROUND_SUB = "Magnitude (SFC) - Background subtracted";
    public static final String ELISPOT_MAGNITUDE_RAW = "Magnitude (SFC) - Raw";
    public static final String ELISPOT_PEPTIDE_POOL = "Peptide Pool";
    public static final String ELISPOT_PROTEIN =  "Protein";
    public static final String ELISPOT_PROTEIN_PANEL =  "Protein Panel";
    public static final String ELISPOT_RESPONSE =  "Response call";
    public static final String ELISPOT_SPECIMEN =  "Specimen type";
    public static final String ELISPOT_VACCINE =  "Antigen vaccine match indicator";

    public static final String ICS = "ICS (Intracellular Cytokine Staining)";
    public static final String ICS_ANTIGEN = "Antigen name";
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
    public static final String ICS_MAGNITUDE_RAW = "Magnitude (% cells) - Raw";
    public static final String ICS_MAGNITUDE_BACKGROUND_SUB = "Magnitude (% cells) - Background subtracted";
    public static final String ICS_MAGNITUDE_BACKGROUND = "Magnitude (% cells) - Background";
    public static final String ICS_PEPTIDE_POOL = "Peptide pool";
    public static final String ICS_ANY_POL = "Any POL";
    public static final String ICS_PROTEIN = "Protein";
    public static final String ICS_PROTEIN_CLADE = "Protein Clade";
    public static final String ICS_PROTEIN_PANEL = "Protein Panel";
    public static final String ICS_RESPONSE = "Response call";
    public static final String ICS_SPECIMEN = "Specimen type";
    public static final String ICS_VACCINE = "Vaccine matched";

    public static final String NAB = "NAb (Neutralizing antibody)";
    public static final String NAB_ANTIGEN = "Antigen name";
    public static final String NAB_ANTIGEN_CLADE = "Virus clade";
    public static final String NAB_ANTIGEN_TYPE = "Antigen type";
    public static final String NAB_ASSAY = "Assay identifier";
    public static final String NAB_CLADE = "Virus Clade";
    public static final String NAB_DATA = "Data provenance";
    public static final String NAB_EXP_ASSAY = "Experimental Assay Design Code";
    public static final String NAB_INIT_DILUTION = "Initial dilution";
    public static final String NAB_ISOLATE = "Isolate";
    public static final String NAB_LAB = "Lab ID";
    public static final String NAB_LAB_SRC_KEY = "Nab Lab Source Key";
    public static final String NAB_NEUTRAL = "Neutralization tier";
    public static final String NAB_RESPONSE_CALL_ID50 = "Response call ID50";
    public static final String NAB_SPECIMEN = "Specimen type";
    public static final String NAB_TARGET_CELL = "Target cell";
    public static final String NAB_TIER = "Tier";
    public static final String NAB_TITERID50 = "Titer ID50";
    public static final String NAB_TITERID80 = "Titer ID80";
    public static final String NAB_TITERIC80 = "Titer IC80";
    public static final String NAB_VIRUS_NAME = "Virus name";
    public static final String NAB_VIRUS_TYPE = "Virus type";
    public static final String NAB_VIRUS_FULL_NAME = "Virus full name";
    public static final String NAB_VIRUS_SPECIES = "Virus species";
    public static final String NAB_VIRUS_HOST_CELL = "Virus host cell";
    public static final String NAB_VIRUS_BACKBONE = "Virus backbone";

    public static final String PKMAB = "PKMAb (PK MAb)";
    public static final String PKMAB_CONCENTRATION = "MAb concentration";
    public static final String PKMAB_STD_NAME = "MAb or mixture standardized name";
    public static final String PKMAB_LAB_ID = "Lab ID";
    public static final String PKMAB_MAB_LABEL = "MAb or mixture label";
    public static final String PKMAB_SOURCE_ASSAY = "Source assay";
    public static final String PKMAB_SPECIMEN_TYPE = "Specimen type";
    public static final String PKMAB_MAB_ID = "MAb or mixture id";
    public static final String PKMAB_VISIT_CODE = "Visit code";
    public static final String PKMAB_VISIT_DESC = "Visit description";

    //Response Call is also hidden, but checking if its present would conflict with Response call ID50, which is valid.
    public static final String[] NAB_HIDDEN_VARS = {"Titer IC50", "Titer IC80", "Virus Insert Name"};

    public static final String TIME_POINTS = "Time points";
    public static final String TIME_POINTS_DAYS = "Study days";
    public static final String TIME_POINTS_WEEKS = "Study weeks";
    public static final String TIME_POINTS_MONTHS = "Study months";
    public static final String TIME_POINTS_HOURS = "Study hours (PK MAb only)";
    public static final String TIME_POINTS_DAYS_FIRST_VACC = "Study days relative to first vaccination";
    public static final String TIME_POINTS_WEEKS_FIRST_VACC = "Study weeks relative to first vaccination";
    public static final String TIME_POINTS_MONTHS_FIRST_VACC = "Study months relative to first vaccination";
    public static final String TIME_POINTS_DAYS_LAST_VACC = "Study days relative to last vaccination";
    public static final String TIME_POINTS_WEEKS_LAST_VACC = "Study weeks relative to last vaccination";
    public static final String TIME_POINTS_MONTHS_LAST_VACC = "Study months relative to last vaccination";

    // These are values used in the data grid.
    public static final String GRID_TITLE_BAMA = TITLE_BAMA;
    public static final String GRID_TITLE_DEMO = "Subject characteristics";
    public static final String GRID_TITLE_ELISPOT = TITLE_ELISPOT;
    public static final String GRID_TITLE_ICS = TITLE_ICS;
    public static final String GRID_TITLE_NAB = "NAb";
    public static final String GRID_TITLE_PLOT = "Plot Data Results";
    public static final String GRID_COL_SUBJECT_ID = "Subject Id";
    public static final String GRID_COL_STUDY = "Study";
    public static final String GRID_TITLE_STUDY_TREATMENT = "Study and treatment";
    public static final String GRID_COL_VISIT = "Visit";
    public static final String GRID_COL_TREATMENT_SUMMARY = "Treatment Summary";
    public static final String GRID_COL_STUDY_DAY = "Study days";
    public static final String GRID_COL_CUR_COL = "Current columns";
    public static final String GRID_COL_ALL_VARS = "All variables from this session";

    // Time point axis types
    public static final String PLOT_TYPE_SCATTER = "Scatter plot";
    public static final String PLOT_TYPE_BOX = "Box plot";
    public static final String PLOT_TYPE_LINE = "Line plot";
    public static final String PLOT_TYPE_BOX_AND_LINE = "Box & line plot";

    // Time points alignments
    public static final String TIME_POINTS_ALIGN_DAY0 = "Aligned by Day 0";
    public static final String TIME_POINTS_ALIGN_ENROLL = "Enrollment";
    public static final String TIME_POINTS_ALIGN_FIRST_VAC = "First Vaccination";
    public static final String TIME_POINTS_ALIGN_LAST_VAC = "Last Vaccination";

    public static final String HOME_PAGE_HEADER = "CAVD DataSpace";

    public static final String PLOT_POINT_HIGHLIGHT_COLOR = "#41C49F";

    // Dimensions used to set the browser window.
    public static Dimension idealWindowSize = new Dimension(1280, 1040);
    public static Dimension defaultWindowSize = new Dimension(1280, 1024);

    // Admin only import tables
    public static  String[] IMPORT_TABLES_WITH_ADMIN_ACCESS = {"import_ics", "import_nab", "import_els_ifng", "import_bama",
            "import_studypartgrouparmsubject", "import_studypartgrouparmproduct", "import_studypartgrouparmvisit", "import_studypartgrouparmvisitproduct",
            "import_studypartgrouparm", "import_studysubject"};

    // Site user groups. Needed to run import etls (associated with studies in StudyGroups.txt).
    public static final String GROUP_CDS_ADMIN = "CDS Admin Group";
    public static final String GROUP_CDS_TEST = "CDS Test Group";
    public static final String GROUP_DATA_IMPORT = "Data Import";
    public static final String GROUP_FHCRC_APPROVED = "FHCRC Approved";

    public static final String HAS_DATA_ICON = "smallCheck.png";
    public static final String HAS_NO_DATA_ICON = "smallGreyX.png";

    public static final String NAB_MAB_DILUTION_REPORT = "NAb dilution report";
    public static final String NAB_MAB_IC50_REPORT = "NAb ic50 plot";

    public static final String WHAT_YOU_NEED_TO_KNOW_WIKI = "CDS_WhatYouNeedToKnowWiki";
    public static final String TOURS_WIKI = "CDS_ToursWiki";

    public static final Map<String, String> siteGroupRoles;
    static
    {
        siteGroupRoles = new HashMap<>();
        siteGroupRoles.put(GROUP_CDS_ADMIN, "Folder Administrator");
        siteGroupRoles.put(GROUP_CDS_TEST, "Reader");
        siteGroupRoles.put(GROUP_DATA_IMPORT, "Editor");
        siteGroupRoles.put(GROUP_FHCRC_APPROVED, "Editor");
    }

    public static final Map<String, List<String>> siteGroupStudies;
    static
    {
        siteGroupStudies = new HashMap<>();

        List<String> tempList = Arrays.asList(PROT_Z136, PROT_Z138, PROT_Z139);
        siteGroupStudies.put(GROUP_CDS_ADMIN, tempList);

        tempList = Arrays.asList(PROT_Z129, PROT_Z130, PROT_Z131, PROT_Z132, PROT_Z133, PROT_Z134);
        siteGroupStudies.put(GROUP_CDS_TEST, tempList);

        tempList = Arrays.asList(PROT_Q3);
        siteGroupStudies.put(GROUP_DATA_IMPORT, tempList);

        tempList = Arrays.asList(PROT_Q1, PROT_Q2, PROT_Q3, PROT_Q4, PROT_R1, PROT_R2, PROT_R3, PROT_R4, PROT_R5, PROT_R6, PROT_R7,
                PROT_R8, PROT_R9, PROT_Y55, PROT_Z100, PROT_Z101, PROT_Z102, PROT_Z103, PROT_Z104, PROT_Z105, PROT_Z106,
                PROT_Z107, PROT_Z108, PROT_Z109, PROT_Z110, PROT_Z111, PROT_Z112, PROT_Z113, PROT_Z114, PROT_Z115,
                PROT_Z116, PROT_Z117, PROT_Z118, PROT_Z119, PROT_Z122, PROT_Z123, PROT_Z124,
                PROT_Z125, PROT_Z126, PROT_Z127, PROT_Z128, PROT_Z135, PROT_Z137, PROT_Z140);
        siteGroupStudies.put(GROUP_FHCRC_APPROVED, tempList);

    }

    // Static locator for the logo image (used as a target to move the mouse to).
    public static final String LOGO_IMG_XPATH = "//img[contains(@src, 'logo.png')]";

    // This function is used to build id for elements found on the tree panel.
    public String buildIdentifier(String firstId, String... elements)
    {
        String finalId;

        // Need to special case the "all" checkbox case.
        if (elements[0].toLowerCase().contains("all"))
        {
            finalId = firstId.replaceAll(" " , "_") + "-";
        }
        else
        {
            // In this case the firstId is an assay name.
            finalId = PANEL_PREFIX + "_" + firstId + "_";
        }

        for (String temp : elements)
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

        for (String temp : elements)
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
        beginAtApplication(_test.getPrimaryTestProject());
    }

    public void beginAtApplication(String projectName)
    {
        _test.beginAt(WebTestHelper.buildURL("cds", projectName, "app", Map.of("logQuery", "1", "_showPlotData", "true", "_disableAutoMsg", "true")));
        afterInApplication();
    }

    private void afterInApplication()
    {
        _test.assertElementNotPresent(Locator.linkWithText("Home"));
        _test.waitForElement(Locator.tagContainingText("h1", HOME_PAGE_HEADER));
        _test.assertElementNotPresent(Locator.linkWithText("Admin"));
        _test.waitForElement(Locator.tagWithClass("body", "appready"));
        _test.shortWait().until(LabKeyExpectedConditions.animationIsDone(Locator.tagWithClass("a", "logout").withText("Logout")));
        Ext4Helper.setCssPrefix("x-");
        NavigationLink.getActive(_test).waitForReady(_test);
    }

    public void dismissTooltip()
    {
        _test.shortWait().withMessage("Failed to dismiss tooltip").until(wd -> {
            _test.mouseOver(Locator.xpath(CDSHelper.LOGO_IMG_XPATH));
            WebElement bubble = Locator.css(".hopscotch-bubble").findWhenNeeded(_test.getDriver());
            return !bubble.isDisplayed() || bubble.getLocation().getY() <= 0; // Hidden, non-existent, or in the corner will suffice
        });
    }

    @LogMethod(quiet = true)
    public void pickSort(@LoggedParam final String sortBy)
    {
        _test.click(Locator.id("sae-hierarchy-dropdown"));

        applyAndWaitForBars(aVoid -> {
            _test.waitAndClick(Locator.xpath("//li[text()='" + sortBy + "' and contains(@class, 'x-boundlist-item')]"));
            return null;
        });

        _test.refresh(); // TODO this is a temporary hack. There are some strange behaviors with the mask that only show up in automation.
        BaseWebDriverTest.sleep(500);
        _test._ext4Helper.waitForMaskToDisappear();
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


    //Helper function for data availability tests
    public Locator.XPathLocator getDataRowXPath(String rowText)
    {
        return Locator.tagWithAttribute("tr", "role", "row").containing(rowText);
    }

    public Locator.XPathLocator hasDataDetailIconXPath(String rowText)
    {
        return getDataRowXPath(rowText).append("//td//img[contains(@src, '"  + HAS_DATA_ICON +  "')]");
    }

    public Locator.XPathLocator noDataDetailIconXPath(String rowText)
    {
        return getDataRowXPath(rowText).append("//td//img[contains(@src, '"  + HAS_NO_DATA_ICON +  "')]");
    }

    public void setUpPermGroup(String perm_group, Map<String, String> studyPermissions)
    {
        setUpPermGroup(perm_group, studyPermissions, "Reader");
    }

    public void setUpPermGroup(String perm_group, Map<String, String> studyPermissions, String projectPerm)
    {
        ApiPermissionsHelper apiPermissionsHelper = new ApiPermissionsHelper(_test);
        apiPermissionsHelper.createProjectGroup(perm_group, _test.getPrimaryTestProject());
        apiPermissionsHelper.addMemberToRole(perm_group, projectPerm, PermissionsHelper.MemberType.group, _test.getPrimaryTestProject());

        for (String study : studyPermissions.keySet())
        {
            String permission = studyPermissions.get(study);
            apiPermissionsHelper.addMemberToRole(perm_group, permission, PermissionsHelper.MemberType.group, _test.getPrimaryTestProject() + "/" + study);
        }
        _test.goToProjectHome();
    }

    public void setUpUserPerm(String userEmail, String projectPerm, Map<String, String> studyPermissions)
    {
        _test._userHelper.deleteUser(userEmail);
        _test._userHelper.createUser(userEmail, false, true);
        ApiPermissionsHelper apiPermissionsHelper = new ApiPermissionsHelper(_test);
        apiPermissionsHelper.addMemberToRole(userEmail, projectPerm, PermissionsHelper.MemberType.user, _test.getPrimaryTestProject());

        for (String study : studyPermissions.keySet())
        {
            String permission = studyPermissions.get(study);
            apiPermissionsHelper.addMemberToRole(userEmail, permission, PermissionsHelper.MemberType.user, _test.getPrimaryTestProject() + "/" + study);
        }
        _test.goToProjectHome();
    }


    public void saveGroup(String name, @Nullable String description)
    {
        saveGroup(name, description, false);
    }

    public boolean saveGroup(String name, @Nullable String description, boolean shared)
    {
        return saveGroup(name, description, shared, false);
    }

    public boolean saveGroup(String name, @Nullable String description, boolean shared, boolean skipWaitForBar)
    {
        _test.click(Ext4Helper.Locators.ext4Button("Save as a group"));
        if (_test.isElementPresent(Locators.cdsButtonLocator("create a new group")))
        {
            _test.click(Locators.cdsButtonLocator("create a new group"));
        }

        _test.waitForElement(Locator.name("groupname").notHidden());
        Locator shareGroupCheckbox = Locator.xpath("//table[contains(@class, 'group-shared-checkbox')]/descendant::input[contains(@type, 'button')]").notHidden();
        if (shared)
        {
            if (_test.isElementPresent(shareGroupCheckbox))
            {
                _test.click(shareGroupCheckbox);
            }
            else
            {
                //Expected failure. The user attempts to save, but does not have sufficient permissions.
                _test.click(Locators.cdsButtonLocator("Cancel", "groupcancelcreate").notHidden());
                return false;
            }
        }

        _test.setFormElement(Locator.name("groupname").notHidden(), name);
        if (null != description)
            _test.setFormElement(Locator.name("groupdescription").notHidden(), description);

        String saveBtnLocatorName;
        saveBtnLocatorName = "Save group";

        _test.sleep(1000);
        if (skipWaitForBar)
        {
            _test.click(Locators.cdsButtonLocator(saveBtnLocatorName, "groupcreatesave").notHidden());
        }
        else
        {
            applyAndMaybeWaitForBars(aVoid -> {
                _test.click(Locators.cdsButtonLocator(saveBtnLocatorName, "groupcreatesave").notHidden());
                return null;
            });
        }

        // verify group save messaging
        //ISSUE 19997
        _test.waitForElement(Locator.tagWithClass("div", "savedgroup-label-container").notHidden());
        _test.log("Saving '" + name + "' group was success!");

        return true;
    }

    public GroupDetailsPage goToGroup(String groupName)
    {
        Locator groupLabelLocator = Locator.xpath("//div[contains(@class, 'grouprow')]/div[contains(@class,'grouplabel')]").withText(groupName);

        goToAppHome();
        _test.waitForElementToBeVisible(groupLabelLocator);
        _test.click(groupLabelLocator);
        return new GroupDetailsPage(_test.getDriver());
    }

    public void logOutFromApplication()
    {
        _test.click(Locator.linkWithText("Logout"));
        _test.waitForElement(Locator.linkWithText("Register Here"));

    }

    public boolean updateSharedGroupDetails(String groupName, @Nullable String newName, @Nullable String newDescription,
                                         @Nullable Boolean newSharedStatus)
    {
        goToGroup(groupName);
        _test.waitForElementToBeVisible(CDSHelper.Locators.cdsButtonLocator("Edit details"));
        _test.click(CDSHelper.Locators.cdsButtonLocator("Edit details"));
        _test.waitForText("Shared group:");

        if (newName != null)
        {
            _test.setFormElement(Locator.name("groupname"), newName);
        }
        if (newDescription != null)
        {
            Locator desLoc = Locator.xpath("//*[contains(@id, 'editgroupdescription-inputEl')]");
            _test.setFormElement(desLoc, "");
            _test.setFormElement(desLoc, newDescription);
        }
        if (newSharedStatus != null)
        {
            Locator.XPathLocator sharedCheckboxLoc = Locator.xpath("//input[contains(@id,'editgroupshared')]");
            if (newSharedStatus)
            {
                _test._ext4Helper.checkCheckbox(sharedCheckboxLoc);
            }
            else
            {
                _test._ext4Helper.uncheckCheckbox(sharedCheckboxLoc);
            }
        }
        _test.sleep(1000);
        _test.click(Locators.cdsButtonLocator("Save").withClass("groupeditsave"));

        if (newSharedStatus != null && !newSharedStatus)
        {
            _test.waitForText("ERROR");
            _test.click(Locators.cdsButtonLocator("OK"));
            _test.click(Locators.cdsButtonLocator("Cancel").withClass("groupcanceledit"));
            goToAppHome();
            return false;
        }
        else
        {
            _test.waitForText(HOME_PAGE_HEADER);
            return true;
        }
    }

    public void createUserWithPermissions(String userName, String projectName, String permissions)
    {
        _test.createUserWithPermissions(userName, projectName, permissions);
    }

    @LogMethod
    public void ensureGroupsDeleted(List<String> groups)
    {
        List<String> deletable = new ArrayList<>();
        LearnGrid learnGrid = viewLearnAboutPage(LearnTab.GROUPS);
        for (String group : groups)
        {
            if(LearnGrid.Locators.rowDescriptionLink.withText(group).existsIn(learnGrid))
            {
                deletable.add(group);
            }
        }
        TestLogger.log("Deleting groups: " + deletable);
        deletable.forEach(this::deleteGroupFromSummaryPage);
    }

    @LogMethod
    public void deleteAllGroups()
    {
        LearnGrid learnGrid = viewLearnAboutPage(LearnTab.GROUPS);
        int groupCount = learnGrid.getRowCount();
        for (int i = 0; i < groupCount; i++)
        {
            String group = LearnGrid.Locators.rowDescriptionLink.findElement(learnGrid.getGrid()).getText();
            deleteGroupFromSummaryPage(group);
            learnGrid = new LearnGrid(LearnTab.GROUPS, _test);
        }
        Assert.assertEquals("All groups should be deleted", 0, learnGrid.getRowCount());
    }

    @LogMethod
    public void selectBars(@LoggedParam String... bars)
    {
        selectBars(false, bars);
    }

    @LogMethod
    public void shiftSelectBars(@LoggedParam String start, @LoggedParam String end)
    {
        selectBars(true, start, end);
    }

    private void selectBars(boolean shiftSelect, String... bars)
    {
        if (bars == null || bars.length == 0)
            throw new IllegalArgumentException("Please specify bars to select.");

        Keys multiSelectKey = getMultiSelectKey(shiftSelect);

        selectBar(bars[0], null);

        if (bars.length > 1)
        {
            for (int i = 1; i < bars.length; i++)
            {
                selectBar(bars[i], multiSelectKey);
            }
        }
    }

    @NotNull
    public static Keys getMultiSelectKey()
    {
        return getMultiSelectKey(false);
    }

    @NotNull
    public static Keys getMultiSelectKey(boolean shiftSelect)
    {
        Keys multiSelectKey;
        if (shiftSelect)
            multiSelectKey = Keys.SHIFT;
        else if (SystemUtils.IS_OS_WINDOWS)
            multiSelectKey = Keys.CONTROL;
        else
            multiSelectKey = Keys.COMMAND; // For some reason, CMD-click works on Linux, but CTRL-click behaves like a right-click
        return multiSelectKey;
    }

    private void selectBar(String barLabel, Keys multiSelectKey)
    {
        _test.log("Going to select a bar with text '" + barLabel + "'.");

        // Get a reference to the detail panel. After the bar is selected this reference will become stale. (and checked lated in the function).
        WebElement detailStatusPanel = Locator.css("ul.detailstatus").waitForElement(_test.getDriver(), CDS_WAIT);

        WebElement barLabelElement = _test.waitForElementToBeVisible(Locators.barLabel.withText(barLabel).parent());

        _test.scrollIntoView(barLabelElement);

        Actions builder = new Actions(_test.getDriver());
        if (multiSelectKey != null)
            builder.keyDown(multiSelectKey);

        builder.moveToElement(barLabelElement).click();

        if (multiSelectKey != null)
            builder.keyUp(multiSelectKey);
        builder.build().perform();

        // Wait for the filter with the same text as the bar to show up.
        _test.waitForElement(Locators.filterMemberLocator(barLabel), CDS_WAIT);

        // Wait for the details count to refresh (element will go stale).
        _test.shortWait().until(ExpectedConditions.stalenessOf(detailStatusPanel));
        // The entire barchart also goes stale
        _test.shortWait().until(ExpectedConditions.stalenessOf(barLabelElement));

        // And if there is any pending annimation wait for it.
        waitForFilterAnimation();
    }

    public void clickPointInPlot(String cssPathToSvg, int pointIndex)
    {
        clickElementInPlot(cssPathToSvg, pointIndex, "a.point", "path[fill='" + PLOT_POINT_HIGHLIGHT_COLOR + "']");
    }

    public void clickHeatPointInPlot(String cssPathToSvg, int pointIndex)
    {
        clickElementInPlot(cssPathToSvg, pointIndex, "a.vis-bin-square", "path[style='fill: " + PLOT_POINT_HIGHLIGHT_COLOR + "']");
    }

    private void clickElementInPlot(String cssPathToSvg, int pointIndex, String elementTag, String fillStyle)
    {
        String cssPathToPoint = cssPathToSvg + " " + elementTag + ":nth-of-type(" + pointIndex + ")";

        try
        {
            _test.click(Locator.css(cssPathToPoint));
        }
        catch(org.openqa.selenium.WebDriverException wde)
        {
            _test.log("First attempt at clicking the point failed, going to try an alternate way to click.");
            // Move the mouse over the point, or where the mouse thinks the point is.
            _test.mouseOver(Locator.css(cssPathToPoint));

            // Now click the point that is the highlight color.
            _test.click(Locator.css(cssPathToSvg + " " + elementTag + " " + fillStyle));
        }

    }

    private void clickElementInPlot(String cssPathToSvg, int pointIndex, String elementTag)
    {
        String cssPathToPoint = cssPathToSvg + " " + elementTag + ":nth-of-type(" + pointIndex + ")";

        _test.mouseOver(Locator.css(cssPathToPoint));
        BaseWebDriverTest.sleep(750);
        Actions builder = new Actions(_test.getDriver());
        builder.click().perform();
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
        _test.waitForElement(Locator.tagContainingText("h1", HOME_PAGE_HEADER));
        NavigationLink.HOME.waitForReady(_test);
        _test.sleep(1000);
    }

    public void goToSummary()
    {
        NavigationLink.SUMMARY.makeNavigationSelection(_test);
        BaseWebDriverTest.sleep(1000);
        _test._ext4Helper.waitForMaskToDisappear(60000);
        BaseWebDriverTest.sleep(500);
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

        BaseWebDriverTest.sleep(100);
        _test._ext4Helper.waitForMaskToDisappear();
        _test.waitForText("Filter removed.");
    }

    public List<WebElement> getActiveFilters()
    {
        return Locator.tagWithClass("div", "filterpanel").append(Locator.tagWithClass("div", "activefilter")).findElements(_test.getDriver());
    }

    public void clearFilters()
    {
        clearFilters(false);
    }

    public void clearFilters(boolean skipWaitForBar)
    {
        final WebElement clearButton = _test.waitForElement(Locators.cdsButtonLocator("clear", "filter-clear-btn").notHidden());

        if (skipWaitForBar)
        {
            clearButton.click();
        }
        else
        {
            applyAndMaybeWaitForBars(aVoid -> {
                clearButton.click();
                return null;
            });
        }

        DataGrid.Locators.sysmsg.containing("Filter removed.").waitForElement(_test.getDriver(), CDS_WAIT);
        _test._ext4Helper.waitForMaskToDisappear();
        _test.waitForElement(Locator.xpath("//div[@class='emptytext' and text()='All subjects']"));
    }

    public void ensureNoFilter()
    {
        // clear filters
        if (_test.isElementPresent(CDSHelper.Locators.cdsButtonLocator("clear", "filter-clear-btn").notHidden()))
        {
            clearFilters();
        }
    }

    public void useSelectionAsSubjectFilter()
    {
        _test.click(Locators.cdsButtonLocator("Filter"));
        waitForClearSelection(); // wait for animation
        BaseWebDriverTest.sleep(500);
        _test._ext4Helper.waitForMaskToDisappear();
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
        _test.shortWait().until(ExpectedConditions.invisibilityOfElementLocated(Locator.css("div.selectionpanel")));
    }

    public void clickBy(final String byNoun)
    {
        final WebElement link = _test.waitForElement(Locators.getByLocator(byNoun));

        applyAndWaitForBars(aVoid -> {
            link.click();
            _test.waitForElement(Locators.activeDimensionHeaderLocator(byNoun));
            return null;
        });
        BaseWebDriverTest.sleep(500);
        _test._ext4Helper.waitForMaskToDisappear();
    }

    public void hideEmpty()
    {
        applyAndWaitForBars(aVoid -> {
            _test.click(Locators.cdsButtonLocator("Hide empty"));
            return null;
        });

        BaseWebDriverTest.sleep(500);
        _test._ext4Helper.waitForMaskToDisappear();
        _test.waitForElementToDisappear(Locator.tagWithClass("div", "barchart").append(Locator.tagWithClass("span", "count").withText("0")));
        _test.waitForElement(CDSHelper.Locators.cdsButtonLocator("Show empty"));
    }

    public void showEmpty()
    {
        applyAndWaitForBars(aVoid -> {
            _test.click(Locators.cdsButtonLocator("Show empty"));
            return null;
        });

        BaseWebDriverTest.sleep(500);
        _test._ext4Helper.waitForMaskToDisappear();
        _test.waitForElement(CDSHelper.Locators.cdsButtonLocator("Hide empty"));
    }

    @LogMethod (quiet = true)
    public void viewInfo(@LoggedParam String barLabel)
    {
        Locator.XPathLocator barLocator = Locator.tag("div").withClass("small").withDescendant(Locator.tag("span").withClass("barlabel").withText(barLabel));
        _test.scrollIntoView(barLocator); // screen might be too small
        _test.mouseOver(barLocator);
        _test.fireEvent(barLocator.append("//button"), BaseWebDriverTest.SeleniumEvent.click); // TODO: FirefoxDriver doesn't tigger :hover styles. Click with Javascript.
        _test.waitForElement(Locators.cdsButtonLocator("Close"));
        _test.waitForElement(Locator.css(".savetitle").withText(barLabel), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
    }

    public LearnGrid viewLearnAboutPage(LearnTab learnTab)
    {
        return viewLearnAboutPage(learnTab, true);
    }

    @LogMethod
    public LearnGrid viewLearnAboutPage(@LoggedParam LearnTab learnTab, boolean forceClickLearnFirst)
    {
        if (forceClickLearnFirst || !LearnGrid.Locators.panel.isDisplayed(_test.getDriver()))
        {
            NavigationLink.LEARN.makeNavigationSelection(_test);
        }

        LearnGrid.waitForCurrentLearnGrid(_test);
        _test._ext4Helper.waitForMaskToDisappear();

        WebElement axisTab = _test.shortWait().until(ExpectedConditions.visibilityOfElementLocated(
                Locator.tag("div").withClass("learn-dim-selector")
                        .append(Locator.tag("h1").withClass("lhdv").withText(learnTab.getTabLabel()))));

        if (!axisTab.getAttribute("class").contains("active") &&
                !Locator.tagWithAttribute("input", "placeholder", "Search " + learnTab.getTabLabel().toLowerCase()).existsIn(_test.getDriver()))
        {
            TestLogger.log("Select learn axis: " + learnTab.getTabLabel());
            axisTab.click();
            WebDriverWrapper.waitFor(() -> axisTab.getAttribute("class").contains("active"), "Failed to select learn axis: " + learnTab.getTabLabel(), 5_000);
            _test.shortWait().until(ExpectedConditions
                    .attributeToBe(Locator.css(".learn-search-input input"),
                            "placeholder", "Search " + learnTab.getTabLabel().toLowerCase()));
            _test._ext4Helper.waitForMaskToDisappear();
        }

        return new LearnGrid(learnTab, _test);
    }

    @LogMethod (quiet = true)
    public void closeInfoPage()
    {
        _test.click(Locators.cdsButtonLocator("Close"));
        _test.waitForElementToDisappear(Locator.button("Close"), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
    }

    @LogMethod (quiet = true)
    public void deleteGroupFromSummaryPage(@LoggedParam String name)
    {
        viewLearnAboutPage(LearnTab.GROUPS)
                .clickDetails(name);
        new GroupDetailsPage(_test.getDriver())
                .deleteGroup();

        _test.refresh();
        afterInApplication();
        LearnGrid learnGrid = viewLearnAboutPage(LearnTab.GROUPS);
        LearnGrid.Locators.rowDescriptionLink.withText(name).waitForElementToDisappear(learnGrid.getGrid(), CDS_WAIT);
    }

    public void toggleExplorerBar(String largeBarText)
    {
        WebElement toggler = Locator.xpath("//div[@class='bar large']//span[contains(@class, 'barlabel') and text()='" + largeBarText + "']//..//..//div[contains(@class, 'saecollapse')]//p").findElement(_test.getDriver());
        final boolean initiallyCollapsed = toggler.getText().equals("+");
        toggler.click();
        _test.shortWait().until(ExpectedConditions.stalenessOf(toggler));
        Locator.XPathLocator childLoc = Locator.tagWithClass("div", "bar small")
                .withChild(Locator.tagWithAttributeContaining("span", "uniquename", "].[%s].[".formatted(largeBarText)));
        if (initiallyCollapsed)
        {
            _test.shortWait().ignoring(StaleElementReferenceException.class).until(ExpectedConditions.visibilityOfAllElementsLocatedBy(
                    childLoc));
        }
        else
        {
            _test.shortWait().until(ExpectedConditions.invisibilityOfAllElements(
                    childLoc.findElements(_test.getDriver())));
        }
    }

    public WebElement openStatusInfoPane(String label)
    {
        _test.assertElementPresent(Locator.tagWithClass("ul", "detailstatus"));
        _test.waitAndClick(Locator.tagWithClass("span", "statme").withText(label));

        return _test.waitForElement(Locator.tagWithClass("div", "infopane"));
    }

    public void openFilterInfoPane(Locator.XPathLocator filterMember)
    {
        _test.click(Locator.tagWithClass("div", "filter-item").withDescendant(filterMember));

        // 'update' button represents the update of a filter
        _test.waitForElement(Locators.cdsButtonLocator("Update", "filterinfoaction"));
    }

    private Locator.XPathLocator  openInfoPaneSort(String sort)
    {
        Locator.XPathLocator infoPane = Locator.tagWithClass("div", "infopane");
        Locator.XPathLocator sorter = infoPane.withDescendant(Locator.tagWithClass("div", "sorter"));

        _test.waitForElement(infoPane);
        _test.waitForElement(sorter.withDescendant(Locator.tagContainingText("span", sort)));

        _test.click(Locators.infoPaneSortButtonLocator());

        return sorter;
    }

    public int getInfoPaneSortOptions(String currSort)
    {
        openInfoPaneSort(currSort);

        return Locator.findElements(_test.getDriver(), Locator.tagWithClass("div", "infosortmenu").append(Locator.tagWithClass("div", "x-menu-item"))).size();
    }

    public void changeInfoPaneSort(String fromSort, String toSort)
    {
        Locator.XPathLocator sorter = openInfoPaneSort(fromSort);

        Locator.XPathLocator sortItemLabel = Locator.tagWithClass("span", "x-menu-item-text").withText(toSort);
        Locator.XPathLocator sortItem = Locator.tagWithClass("div", "infosortmenu").append(Locator.tagWithClass("div", "x-menu-item").withDescendant(sortItemLabel));
        _test.waitAndClick(sortItem.notHidden());
        _test.waitForElement(sorter.withDescendant(Locator.tagContainingText("span", toSort)));
    }

    public void selectInfoPaneItem(String label, boolean onlyThisItem)
    {
        WebElement infopanegrid = _test.shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.byClass("infopanegrid")));
        Locator.XPathLocator memberLabel = Locator.tagWithClass("div", "x-grid-cell-inner").containing(label);

        if (onlyThisItem)
        {
            // click the label
            memberLabel.waitForElement(infopanegrid, 2_000).click();
        }
        else
        {
            Locator.XPathLocator row = Locator.tagWithClass("tr", "x-grid-data-row");
            Locator.XPathLocator check = Locator.tagWithClass("td", "x-grid-cell-row-checker");

            // click the checkbox
            row.withDescendant(memberLabel).child(check).waitForElement(infopanegrid, 2_000).click();
        }
    }

    public void hoverOverInfoPaneItem(String label)
    {
        // Mouse over the label
        Locator.XPathLocator memberLabel = Locator.tagWithClass("div", "x-grid-cell-inner").containing(label);
        _test.mouseOver(memberLabel);
    }

    public void clickLearnAboutInfoPaneItem(String label)
    {
        hoverOverInfoPaneItem(label);
        _test.click(Locator.xpath("//div[contains(@class, 'x-grid-cell-inner')]//div[contains(text(), '" + label + "')]//a[contains(@class, 'expando')]"));
        _test.waitForElement(Locators.studyname.withText(label));
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

    public void addRaceFilter(String barLabel)
    {
//        CDSHelper.NavigationLink.SUMMARY.makeNavigationSelection(this);
        clickBy("Subject characteristics");
        pickSort("Race");
        applySelection(barLabel);
        useSelectionAsSubjectFilter();
    }

    public boolean isCheckboxChecked(String xpath)
    {
        WebElement tableParent;
        Locator checkBox;

        checkBox = Locator.xpath(xpath + "/./ancestor-or-self::table[contains(@class, 'checkbox2')]");

        tableParent = _test.getDriver().findElement(checkBox);

        String classAttribute = tableParent.getAttribute("class");

        return classAttribute.contains("x-form-cb-checked");

    }

    public void assertPlotTickText(Pattern p)
    {
        assertPlotTickText(1, p);
    }

    public void assertPlotTickText(int svgIndex, Pattern p)
    {
        // Firefox removes the \n when returning the text, so going to go to lowest common denominator (Firefox).
        String shownText = getPlotTickText(svgIndex);
        Assert.assertTrue("SVG did not look as expected. Patter expected: " + p.pattern() + " Actual string: " + shownText, p.matcher(shownText).matches());
    }

    public void assertPlotTickText(String expectedTickText)
    {
        assertPlotTickText(1, expectedTickText);
    }

    @LogMethod(quiet = true)
    public void assertPlotTickText(int svgIndex, String expectedTickText)
    {
        // Firefox removes the \n when returning the text, so going to go to lowest common denominator (Firefox).
        String modifiedExpected = expectedTickText.replace("\n", "").toLowerCase();
        String shownText = getPlotTickText(svgIndex);
        Assert.assertTrue("SVG did not look as expected. Expected: " + modifiedExpected + " Actual: " + shownText, shownText.equals(modifiedExpected));
    }

    private String getPlotTickText(int svgIndex)
    {
        _test.waitForElement(Locator.css("svg:nth-of-type(" + svgIndex + ") > g.axis g.tick-text"));
        String shownText = _test.getText(Locator.css("svg:nth-of-type(" + svgIndex + ") > g.axis g.tick-text").index(0));
        shownText = shownText + _test.getText(Locator.css("svg:nth-of-type(" + svgIndex + ") > g.axis g.tick-text").index(1));
        shownText = shownText.replace("\n", "").toLowerCase();
        return shownText;
    }

    public ArrayList<String> getLogValueXAxis(int svgIndex)
    {

        return getAxisLogValue(Locator.css("svg:nth-of-type(" + svgIndex + ") > g:nth-child(3) > g.tick-text"));
    }

    public ArrayList<String> getLogValueYAxis(int svgIndex)
    {
        return getAxisLogValue(Locator.css("svg:nth-of-type(" + svgIndex + ") > g:nth-child(4) > g.tick-text"));
    }

    private ArrayList<String> getAxisLogValue(Locator l1)
    {
        ArrayList<String> tickText = new ArrayList<>();
        String temp;
        int elementCount;

        elementCount = _test.getElementCount(((Locator.CssLocator) l1).append(" text"));

        for (int i = 0; i < elementCount; i++)
        {
            temp = _test.getText(((Locator.CssLocator) l1).append(" text").index(i));
            temp = temp.trim();
            if (temp.length() > 0)
                tickText.add(temp);
        }

        return tickText;
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

    public void clickHelper(WebElement element, Runnable function)
    {
        final int RETRY_LIMIT = 5;
        boolean worked = false;
        int count = 0;
        _test.shortWait().until(ExpectedConditions.visibilityOf(element));
        _test.log("Using the CDS click helper.");

        while(!worked)
        {
            count++;

            _test.log("CDS clickHelper attempt " + count + " to click the element.");

            _test.mouseOver(element);
            element.click();

            try
            {
                function.run();
                worked = true;
            }
            catch(AssertionError | NoSuchElementException ex)
            {
                if (count > RETRY_LIMIT)
                    throw ex;

                BaseWebDriverTest.sleep(500);
                worked = false;
            }
        }

    }

    public enum NavigationLink
    {
        HOME("Home", Locator.id("homecontrollerview")),
        LEARN("Learn about", LearnGrid.Locators.panel) {
            @Override
            public void makeNavigationSelection(WebDriverWrapper wdw)
            {
                Locator searchInputLoc = LearnGrid.Locators.searchBox;
                Optional<WebElement> searchInput = searchInputLoc.findOptionalElement(wdw.getDriver());
                boolean emptySearch = searchInput.map(el -> el.getAttribute("value").isEmpty()).orElse(true);

                LearnTab activeAxis = LearnTab.getActive(wdw);

                boolean gridExists = LearnGrid.Locators.panel.append(Locator.byClass(activeAxis.getGridClass())).existsIn(wdw.getDriver());

                // If a search is present when you click "learn about", the search will be cleared and the grid will refresh
                if (!emptySearch && gridExists)
                {
                    new CdsGrid(activeAxis.getGridClass(), LearnGrid.Locators.panel.findElement(wdw.getDriver()), wdw)
                            .doAndWaitForRowUpdate(() -> {
                                super.makeNavigationSelection(wdw);
                                waitForTab(activeAxis, wdw);
                            });
                }
                else
                {
                    super.makeNavigationSelection(wdw);
                    waitForTab(activeAxis, wdw);
                    wdw.shortWait().until(ExpectedConditions.visibilityOfElementLocated(searchInputLoc));
                    if (!emptySearch)
                    {
                        // Grid will refresh twice if there is a search value but grid isn't hidden on page.
                        // No great way to detect two loads so we just pause.
                        WebDriverWrapper.sleep(CDS_WAIT);
                    }
                    new LearnGrid(activeAxis, wdw).getGrid().waitForGrid();
                }
            }

            private void waitForTab(LearnTab learnTab, WebDriverWrapper wdw)
            {
                wdw.shortWait().until(ExpectedConditions.visibilityOfElementLocated(
                        Locator.tag("div").withClass("learn-dim-selector")
                                .append(Locator.tag("h1").withClasses("lhdv", "active").withText(learnTab.getTabLabel()))));
            }
        },
        SUMMARY("Find subjects", Locator.byClass("summaryview")),
        PLOT("Plot data", Locator.byClass("chartview")),
        GRID("View data grid", Locator.byClass("connector-grid").withoutClass("mab-connector-grid")),
        MABGRID("Monoclonal antibodies", Locator.tagWithClass("div", "mab-connector-grid"));

        private final String _linkText;
        private final Consumer<WebDriverWrapper> _waitForReady;

        NavigationLink(String linkText, Consumer<WebDriverWrapper> waitForReady)
        {
            _linkText = linkText;
            _waitForReady = waitForReady;
        }

        NavigationLink(String linkText, Locator expectedElement)
        {
            this(linkText, wdw -> wdw.shortWait().until(ExpectedConditions.visibilityOfElementLocated(expectedElement)));
        }

        public String getLinkText()
        {
            return _linkText;
        }

        public Locator.XPathLocator getLinkLocator()
        {
            return Locator.tagWithClass("div", "navigation-view").append(Locator.tagWithClass("div", "nav-label").withText(_linkText));
        }

        public void makeNavigationSelection(CdsGrid grid)
        {
            grid.doAndWaitForRowUpdate(() -> makeNavigationSelection(grid.getWrapper()));
        }

        public void makeNavigationSelection(WebDriverWrapper wdw)
        {
            log("Navigate to CDS: " + getLinkText());
            wdw.waitAndClick(getLinkLocator());
            _waitForReady.accept(wdw);
            wdw._ext4Helper.waitForMaskToDisappear(30000);
        }

        public void waitForReady(WebDriverWrapper wdw)
        {
            _waitForReady.accept(wdw);
        }

        public static NavigationLink getActive(WebDriverWrapper wdw)
        {
            String activeLinkText = wdw.shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.byClass("nav-label-selected"))).getText();
            return Arrays.stream(values())
                    .filter(nl -> nl.getLinkText().equals(activeLinkText)).findFirst()
                    .orElseThrow(() -> new IllegalStateException("Unknown navigation link: " + activeLinkText));
        }
    }

    public static class Locators
    {
        public static Locator.XPathLocator barLabel = Locator.tagWithClass("span", "barlabel");
        public static Locator.XPathLocator INFO_PANE_HAS_DATA = Locator.tagWithClass("div", "x-grid-group-title").withText("Has data in active filters");
        public static Locator.XPathLocator INFO_PANE_NO_DATA = Locator.tagWithClass("div", "x-grid-group-title").withText("No data in active filters");
        public static String REPORTS_LINKS_XPATH = "//h3[text()='Reports']/following-sibling::table[@class='learn-study-info']";

        public static Locator.XPathLocator studyname = Locator.tagWithClass("div", "studyname");

        public static Locator.XPathLocator getByLocator(String byNoun)
        {
            return Locator.xpath("//div[contains(@class, 'bycolumn')]//span[contains(@class, 'label') and contains(text(), '" + byNoun + "')]");
        }

        public static Locator.XPathLocator getSharedGroupLoc(String groupName)
        {
            return getGroupLoc(true, groupName);
        }

        public static Locator.XPathLocator getPrivateGroupLoc(String groupName)
        {
            return getGroupLoc(false, groupName);
        }

        public static Locator.XPathLocator getGroupLoc(boolean isShared, String groupName)
        {
            return Locator.xpath("//*[contains(@class, 'section-title')][contains(text(), '" +
                    (isShared ? "Curated groups and plots" : "My saved groups and plots") + "')]" +
                    "/following::div[contains(@class, 'grouprow')]/div[contains(text(), '" +
                    groupName + "')]");
        }

        public static Locator.XPathLocator cdsButtonLocator(String text)
        {
            return cdsButtonLocator(text, "x-btn");
        }

        public static Locator.XPathLocator cdsButtonLocator(String text, String cssClass)
        {
            return Locator.xpath("//a[contains(@class, '" + cssClass + "')]").withPredicate(Locator.xpath("//span[contains(@class, 'x-btn-inner') and text()='" + text + "']")).notHidden();
        }

        public static Locator.XPathLocator cdsSelectorButtonLocator(String selector, String text)
        {
            return Locator.xpath("//div[contains(@class, '" + selector + "')]//a[not(contains(@style, 'display: none'))]").withPredicate(Locator.xpath("//span[contains(@class, 'x-btn-inner') and text()='" + text + "']")).notHidden();
        }

        public static Locator.XPathLocator cdsButtonLocatorContainingText(String text)
        {
            return Locator.xpath("//a").withPredicate(Locator.xpath("//span[contains(@class, 'x-btn-inner') and contains(text(),'" + text + "')]")).notHidden();
        }

        public static Locator.XPathLocator cdsDropDownButtonLocator(String cssClass)
        {
            return Locator.xpath("//button[contains(@class, 'imgbutton') and contains(@class, '" + cssClass + "')]").notHidden();
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

        public static Locator.XPathLocator subjectInfoPaneHeader()
        {
            return Locator.tagWithClass("div", "filterstatus");
        }

        public static Locator.XPathLocator dimensionHeaderLocator(String dimension)
        {
            return Locator.tagWithClass("div", "dim-selector").append(Locator.tagWithClass("h1", "lhdv").withText(dimension));
        }

        public static Locator.XPathLocator activeDimensionHeaderLocator(String dimension)
        {
            return Locator.tagWithClass("div", "dim-selector").append(Locator.tagWithClass("h1", "active").withText(dimension));
        }

        public static Locator.XPathLocator pageHeaderBack()
        {
            return Locator.tagWithClass("div", "iarrow");
        }

        public static Locator.XPathLocator selectionPane()
        {
            return Locator.tagWithClass("div", "selectionpanel");
        }

        public static Locator.XPathLocator filterPane(int index)
        {
            return Locator.tagWithClass("div", "filterpanel").append(Locator.tagWithClass("div", "activefilter")).index(index);
        }

        public static Locator.XPathLocator studyReportLink(String studyName)
        {
            return Locator.xpath(CDSHelper.Locators.REPORTS_LINKS_XPATH + "//a[contains(text(), '" + studyName + "')]");
        }

        public static Locator.XPathLocator divByInnerText(String text)
        {
            return Locator.xpath("//div[.='" + text + "']");
        }
    }

    // Used to identify data in the time axis.
    public static class TimeAxisData
    {
        public String studyName;
        public int vaccinationCount;
        public int vaccinationCountNoData;
        public int nonvaccinationCount;
        public int nonvaccinationCountNoData;
        public int challengeCount;
        public int challengeCountNoData;

        public TimeAxisData(String studyName, int vacCount, int vacCountNoData, int nonvacCount, int nonvacCountNoData, int chalCount, int chalCountNoData)
        {
            this.studyName = studyName;
            vaccinationCount = vacCount;
            vaccinationCountNoData = vacCountNoData;
            nonvaccinationCount = nonvacCount;
            nonvaccinationCountNoData = nonvacCountNoData;
            challengeCount = chalCount;
            challengeCountNoData = chalCountNoData;
        }
    }

    public enum PlotPoints
    {

        POINT("a.point", PLOT_POINT_HIGHLIGHT_COLOR),
        BIN("a.vis-bin-square", PLOT_POINT_HIGHLIGHT_COLOR),
        GLYPH("a.point", PLOT_POINT_HIGHLIGHT_COLOR),
        GLYPH_ASTERISKS("a.point path[d='M3-1.1L2.6-1.9L0.5-0.8v-1.8h-1v1.8l-2.1-1.1L-3-1.1L-0.9,0L-3,1.1l0.4,0.7l2.1-1.1v1.9h1V0.7l2.1,1.1L3,1.1 L0.9,0L3-1.1z']", PLOT_POINT_HIGHLIGHT_COLOR);
        // That long ugly value is the asterisks glyph. It's one of the better ones for hit testing.
        // It is not currently used, but it might be in the future, and I didn't want to have to try and find it again.

        private final Locator.CssLocator locator;
        private final String _highlightColor;

        PlotPoints(String cssSelector, String highlightColor)
        {
            locator = Locator.css(cssSelector);
            _highlightColor = highlightColor;
        }

        public Locator.CssLocator getLocator()
        {
            return locator;
        }

        public String getHighlightColor()
        {
            return _highlightColor;
        }

    }

    public void dragAndDropFromElement(Locator el, int xOffset, int yOffset)
    {
        WebElement wel = el.findElement(_test.getDriver());
        dragAndDropFromElement(wel, xOffset, yOffset);
    }

    public void dragAndDropFromElement(WebElement wel, int xOffset, int yOffset)
    {
        WebElement plotScroll = Locator.byClass("plot-scroll").findElementOrNull(_test.getDriver());
        if (plotScroll != null)
            scrollPanelTo(plotScroll, wel.getLocation().getX(), 0);

        Actions builder = new Actions(_test.getDriver());
        Action action = builder.moveToElement(wel).clickAndHold().moveByOffset(xOffset + 1, yOffset + 1).release().build();
        action.perform();
    }

    public void scrollPanelTo(WebElement scrollableArea, Integer x, Integer y)
    {
        _test.executeScript("arguments[0].scrollTo(arguments[1], arguments[2]);", scrollableArea, x, y);
    }

    public void validateDocLink(WebElement documentLink, String expectedFileName)
    {
        // Since this will be a downloaded document, make sure the name is "cleaned up".
        expectedFileName = expectedFileName.replace("%20", " ").toLowerCase();

        _test.log("Now click on the document link.");
        File[] docFile = _test.clickAndWaitForDownload(documentLink, 1);
        Assert.assertTrue("Downloaded document not of the expected name. Expected: '" + expectedFileName + "' Found: '" + docFile[0].getName().toLowerCase() + "'.", docFile[0].getName().toLowerCase().contains(expectedFileName));

    }

    public void validatePDFLink(WebElement documentLink, String pdfFileName)
    {
        final String PLUGIN_XPATH = "//embed[@name='plugin']";

        _test.log("Now click on the pdf link.");
        if(_test.getBrowserType() == WebDriverWrapper.BrowserType.CHROME)
        {

            documentLink.click();
            BaseWebDriverTest.sleep(10000);
            _test.switchToWindow(1);

            // Since this is a pdf file, it will be validated in the url, so replace any " " with %20.
            pdfFileName = pdfFileName.replace(" ", "%20").toLowerCase();

            _test.log("Validate that the pdf document was loaded into the browser.");
            _test.assertElementPresent("Doesn't look like the embed elment is present.", Locator.xpath(PLUGIN_XPATH), 1);
            Assert.assertTrue("The embedded element is not a pdf plugin", _test.getAttribute(Locator.xpath(PLUGIN_XPATH), "type").toLowerCase().contains("pdf"));
            Assert.assertTrue("The source for the plugin is not the expected document. Expected: '" + pdfFileName + "'. Found: '" + _test.getAttribute(Locator.xpath(PLUGIN_XPATH), "src").toLowerCase() + "'.", _test.getAttribute(Locator.xpath(PLUGIN_XPATH), "src").toLowerCase().contains(pdfFileName));

            _test.log("Close this window.");
            _test.getDriver().close();

            _test.log("Go back to the main window.");
            _test.switchToMainWindow();
        }
        else if(_test.getBrowserType() == WebDriverWrapper.BrowserType.FIREFOX)
        {
            File[] downloadedFiles = _test.clickAndWaitForDownload(documentLink, 1);
            Assert.assertEquals("The pdf file downloaded does not have the expected name.", pdfFileName.toLowerCase(), downloadedFiles[0].getName().toLowerCase());
        }

    }

    // Return the visible grant document link, null otherwise.
    public WebElement getVisibleGrantDocumentLink()
    {
        final String DOCUMENT_LINK_XPATH = "//td[@class='item-label'][text()='Grant Affiliation:']/following-sibling::td//a";
        WebElement documentLinkElement = null;

        for (WebElement we : Locator.xpath(DOCUMENT_LINK_XPATH).findElements(_test.getDriver()))
        {
            if (we.isDisplayed())
            {
                documentLinkElement = we;
                break;
            }
        }

        return documentLinkElement;
    }

    public List<WebElement> getVisibleStudyProtocolLinks()
    {
        final String DOCUMENT_LINK_XPATH = "//td[@class='item-label'][text()='Documents:']/following-sibling::td//a";
        List<WebElement> documentLinkElements = null;

        for (WebElement we : Locator.xpath(DOCUMENT_LINK_XPATH).findElements(_test.getDriver()))
        {
            if (we.isDisplayed())
            {
                if (documentLinkElements == null)
                    documentLinkElements = new ArrayList<>();
                documentLinkElements.add(we);
            }
        }

        return documentLinkElements;
    }

    public int createReport(RReportHelper rReportHelper, String queryUrl, @Nullable String reportScript, String reportName, boolean shareReport)
    {
        return createReport(rReportHelper, queryUrl, reportScript, reportName, shareReport, false);
    }

    public int createReport(RReportHelper rReportHelper, String queryUrl, @Nullable String reportScript, String reportName, boolean shareReport, boolean skipViewData)
    {
        int reportId;
        String reportUrl;

        _test.beginAt(queryUrl);
        if (!skipViewData)
        {
            _test.waitForElement(Locator.linkWithText("view data"));
            _test.click(Locator.linkWithText("view data"));
        }

        // Check to see if the report already exists. If it does, then just ignore this test.
        DataRegionTable table = DataRegionTable.DataRegion(_test.getDriver()).find();
        BootstrapMenu menu = table.getReportMenu();
        menu.openMenuTo("Create Chart");
        if (menu.findVisibleMenuItems()
                .stream()
                .anyMatch(webElement -> webElement.getText().equals(reportName)))
        {
            _test.log("Report already exists: " + reportName);
        }
        else
        {
            table.goToReport("Create R Report");

            if (null != reportScript)
                _test.setCodeEditorValue("script-report-editor", reportScript);

            if (shareReport)
                rReportHelper.selectOption(RReportHelper.ReportOption.shareReport);

            _test.waitForElement(Locator.tagWithText("span", "Save"));
            rReportHelper.saveReport(reportName);

            _test.waitForText(reportName);
            _test.log("Report created: " + reportName);

            _test.beginAt(queryUrl);
            if (!skipViewData)
            {
                _test.waitForElement(Locator.linkWithText("view data"));
                _test.click(Locator.linkWithText("view data"));
            }
        }
        _test.log("Get the reportId from the URL");
        table.goToReport(reportName);

        _test.waitForText(reportName);

        reportUrl = _test.getDriver().getCurrentUrl();

        reportId = getReportNumberFromUrl(reportUrl);

        _test.log("Report ID: " + reportId);

        return reportId;
    }

    public int getReportNumberFromUrl(String url)
    {
        // The last part of the url looks like .reportId=db%3A# where # is the report id.
        // The call to substring(3) skips over the %3A in the url.
        final String REPORT_TAG = ".reportId=db";
        int index;
        String subString;

        index = url.indexOf(REPORT_TAG);
        subString = url.substring(index + REPORT_TAG.length()).substring(3);

       if(subString.length() > 3)
          return Integer.parseInt(subString.substring(subString.indexOf("%")+1, subString.indexOf("%")+2));
       else
        return Integer.parseInt(subString);
    }
}
