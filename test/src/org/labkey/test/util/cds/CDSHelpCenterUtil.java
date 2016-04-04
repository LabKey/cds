/*
 * Copyright (c) 2015-2016 LabKey Corporation
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

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.PortalHelper;
import org.labkey.test.util.WikiHelper;

/**
 * Created by xingyang on 11/5/15.
 */
public class CDSHelpCenterUtil
{
    public static final String HELP_EMPTY_CONTENT ="";

    public static final String CATEGORY_1_NAME  = "group_1";
    public static final String CATEGORY_1_TITLE = "About the CDS and the data";
    public static final String HELP_1_1_NAME    = "help_1_1";
    public static final String HELP_1_1_TITLE   = "What is the CDS?";
    public static final String HELP_1_1_CONTENT = "<p>The CDS is a collaboration between SCHARP, LabKey, and Artefact. " +
            "The Bill &amp; Melinda Gates Foundation , has funded the program to date. The CDS is currently available to CAVD members.</p>";
    public static final String HELP_1_2_CONTENT_SUB = "Full Terms of Use agreement";
    public static final String HELP_1_2_NAME    = "help_1_2";
    public static final String HELP_1_2_TITLE   = "How should I use CDS?";
    public static final String HELP_1_2_CONTENT = "<p class=\"p1\"><span class=\"s1\"><strong>Full Terms of Use agreement</strong></span></p>\n" +
            "<p class=\"p2\"><span class=\"s1\">ЁЂЃЄЅІЇЈЉЊЋЌЍЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюяTo access and view data in this site you much agree to the Terms of User for CAVD DataSpace below. Please read these terms carefully. By accessing this site you agree to be bound by these terms. These terms are subject to change. Any changes will be incorporated into the terms posted to this site from time to time. If you do not agree with these terms, please do not access the site. If you are not an authorized user of this site you are hereby notified that any access or use of the information herein is strictly prohibited.</span></p>\n" +
            "<p class=\"p3\"><span class=\"s1\"><strong>GENERAL INFORMATION</strong></span></p>\n" +
            "<p class=\"p2\"><span class=\"s1\">The CAVD DataSpace (\"Site\") is made available to members and trusted entities of the Collaboration for AIDS Vaccine Discovery (CAVD) by the Statistical Center for HIV/AIDS Research &amp; Prevention (\"SCHARP\") at the Fred Hutchinson Cancer Research Center (\"FHCRC\"). The CAVD DataSpace is a pilot project in support of SCHARP\\'s Vaccine Immunology Statistical Center (VISC) award funded by the Bill &amp; Melinda Gates Foundation. The purpose of the project is to help accelerate shared progress in the search for an effective HIV vaccine by making the community more aware of work being done and enabling exploration beyond primary publications.</span></p>\n" +
            "<p class=\"p3\"><span class=\"s1\"><strong>LIMITATIONS ON THE USE OF THE SITE</strong></span></p>\n" +
            "<p class=\"p2\"><span class=\"s1\">You agree to comply with all terms and conditions.</span></p>\n" +
            "<p class=\"p4\">&nbsp;</p>\n" +
            "<p class=\"p2\"><span class=\"s1\">\uD841\uDF0E\uD841\uDF31\uD841\uDF79\uD843\uDC53\uD843\uDC78\uD843\uDC96\uD843\uDCCFYou agree (i) to make only lawful use of the Site in compliance with all applicable federal, state and local laws and regulations, (ii) not to permit unauthorized users to have access to or to view information or data on the Site and to establish and maintain appropriate administrative, technical, and physical safeguards to protect against such unauthorized use or access (iii) not to violate anyone else\\'s rights, including copyright, trademark, trade secret, right of privacy, right of publicity or other rights, (iv) not to upload, post, transmit, distribute or otherwise publish on or to the Site any materials that contain a software virus or other harmful component.</span></p>\n" +
            "<p class=\"p3\"><span class=\"s1\"><strong>LIMITATIONS ON THE USE OF DATA AND INFORMATION FROM THE SITE</strong></span></p>\n" +
            "<p class=\"p2\"><span class=\"s1\">Without the prior written consent of FHCRC, you:</span></p>\n" +
            "<ul class=\"ul1\">\n" +
            "<li class=\"li2\"><span class=\"s1\">(i) will not use information or data from the Site for any purpose other than the design, testing and evaluation of the Site,</span></li>\n" +
            "<li class=\"li2\"><span class=\"s1\">(ii) will not transfer any information or data from the Site to any other individual or institution;</span></li>\n" +
            "<li class=\"li2\"><span class=\"s1\">(iii) will not publish or present any of data or information obtained from the Site or the results of any use of such data and information; or</span></li>\n" +
            "<li class=\"li2\"><span class=\"s1\">(iv) will not file for intellectual property protection for any invention made as a result from or from your use of the data from the Site.</span></li>\n" +
            "</ul>\n" +
            "<p class=\"p2\"><span class=\"s1\">No individual identifiers of vaccine trial subjects will be provided to you through the Site. You agree not to use any information or data from the Site, either alone or in conjunction with any other information to establish the individual identities of any of the vaccine trial subjects from whom the data on the Site was obtained. Unless otherwise approved in writing by the FHCRC, upon the completion of your use of data contained on this Site for the design, testing and/or evaluation of the Site or at the end of the project, whichever is first, you agree to discontinue use of and destroy any and all data or information obtained from the Site. You will provide prompt written notice of such destruction to FHCRC.</span></p>\n" +
            "<p class=\"p3\"><span class=\"s1\"><strong>Modifications to the Site and Terms of Use</strong></span></p>\n" +
            "<p class=\"p2\"><span class=\"s1\">FHCRC may at any time modify, replace, refuse access to, suspend or discontinue the Site, partially or entirely, or change and modify all or part of the services for you or for all users in its sole discretion and without notice.</span></p>\n" +
            "<p class=\"p4\">&nbsp;</p>\n" +
            "<p class=\"p2\"><span class=\"s1\">FHCRC reserves the right to modify the Terms of Use at any time without notice, but the most current version of the Terms of Use will always be available to you by clicking on the link at the bottom of the Site. If you find the Terms of Use unacceptable at any time, you may discontinue your use of the Site, but the Terms of Use shall survive such discontinuation with respect to activity occurring prior to such discontinuation. By continuing to use the Site after the date of any change of the Terms of Use, including accessing the Site, you agree to be bound by the provisions contained in the most recent version of the Terms of Use.</span></p>\n" +
            "<p class=\"p3\"><span class=\"s1\"><strong>DISCLAIMERS</strong></span></p>\n" +
            "<p class=\"p2\"><span class=\"s1\">THE SITE AND ALL INFORMATION AND DATA FROM THE SITE ARE PROVIDED \"AS IS\" AND \"AS AVAILABLE\". FHCRC DOES NOT WARRANT THE ACCURACY, ADEQUACY OR COMPLETENESS OF THIS INFORMATION AND DATA, AND, TO THE EXTENT PERMITTED BY LAW, FHCRC EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, IMPLIED, EXPRESSED OR STATUTORY INCLUDING THE WARRANTIES OF NON-INFRINGEMENT OF THIRD PARTY RIGHTS, TITLE, MERCHANTABILITY OR QUALITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY OF INFORMATION, INFORMATION ACCESS, FREEDOM FROM COMPUTER VIRUS OR OTHER HARMFUL ELEMENTS. THE DISCLAIMERS AND EXCLUSIONS IN THIS SECTION ALSO APPLY TO ANY OF FHCRC\\'S SUPPLIERS AND SUBCONTRACTORS, AS THIRD PARTY BENEFICIARIES.</span></p>\n" +
            "<p class=\"p3\"><span class=\"s1\"><strong>LIMITED LIABILITY AND REMEDY</strong></span></p>\n" +
            "<p class=\"p2\"><span class=\"s1\">YOUR USE OF THE SITE AND DATA AND INFORMATION FROM THE SITE IS AT YOUR OWN RISK. FHCRC WILL NOT BE LIABLE FOR ANY DAMAGES RELATED TO YOUR USE OF OR INABILITY TO USE THE SITE, INCLUDING WITHOUT LIMITATION, DIRECT, INDIRECT, SPECIAL, COMPENSATORY OR CONSEQUENTIAL DAMAGES, LOST PROFITS OR LOSS OF OR DAMAGE TO PROPERTY, EVEN IF FHCRC HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. THE LIMITATIONS IN THIS SECTION ALSO APPLY TO ANY OF FHCRC\\'S SUPPLIERS AND SUBCONTRACTORS, AS THIRD PARTY BENEFICIARIES AND YOU ACKNOWLEDGE AND AGREE THAT YOU HAVE NO REMEDY AGAINST SUCH SUPPLIERS OR SUBCONTRACTORS FOR ANY COSTS OR DAMAGES YOU INCUR ARISING OUT OF, OR RELATING TO YOUR USE OF THE SITE AND DATA AND INFORMATION FROM THE SITE.</span></p>\n" +
            "<p class=\"p3\"><span class=\"s1\"><strong>INDEMNITY</strong></span></p>\n" +
            "<p class=\"p2\"><span class=\"s1\">You agree to indemnify, defend and hold FHCRC and its officers, directors, owners, agents, employees, affiliates, licensees, licensors suppliers and subcontractors harmless from and against all claims, losses, liability, cost, and expenses (including attorneys\\' fees) arising from your violation of these Terms of Use or misuse of this Site, or any service, product, information or data provided through this Site. Your obligations under this Section will survive your termination of access to or use of this Site, or nonuse of any service, information or data.</span></p>\n" +
            "<p class=\"p3\"><span class=\"s1\"><strong>APPLICABLE LAW</strong></span></p>\n" +
            "<p class=\"p2\"><span class=\"s1\">These Terms of Use will be construed according to Washington law, without regard to provisions governing conflicts of laws. Any dispute arising under or relating to these Terms of Use, the content, the use of the Site, or any services obtained using this Site, will be resolved exclusively by the state and federal courts of the State of Washington. Your use of the Site constitutes your consent to the jurisdiction and venue of such courts with respect to any such dispute.</span></p>";
    public static final String HELP_1_3_NAME    = "help_1_3";
    public static final String HELP_1_3_TITLE   = "Where does the CDS data come from?";
    public static final String HELP_1_3_CONTENT = HELP_EMPTY_CONTENT;
    public static final String HELP_1_4_NAME    = "help_1_4";
    public static final String HELP_1_4_TITLE   = "What are the different kind of subjects";
    public static final String HELP_1_4_CONTENT = HELP_EMPTY_CONTENT;
    public static final String HELP_1_5_NAME    = "help_1_5";
    public static final String HELP_1_5_TITLE   = "What is a gutter plot";
    public static final String HELP_1_5_CONTENT = HELP_EMPTY_CONTENT;

    public static final String CATEGORY_2_NAME  = "group_2";
    public static final String CATEGORY_2_TITLE = "Having Problems?";
    public static final String HELP_2_1_NAME    = "help_2_1";
    public static final String HELP_2_1_TITLE   = "My plot is not showing any dots";
    public static final String HELP_2_1_CONTENT = HELP_EMPTY_CONTENT;
    public static final String HELP_2_2_NAME    = "help_2_2";
    public static final String HELP_2_2_TITLE   = "My plot is taking to long to load";
    public static final String HELP_2_2_CONTENT = HELP_EMPTY_CONTENT;
    public static final String HELP_2_3_NAME    = "help_2_3";
    public static final String HELP_2_3_TITLE   = "Plot counts don't add up";
    public static final String HELP_2_3_CONTENT = HELP_EMPTY_CONTENT;
    public static final String HELP_2_4_NAME    = "help_2_4";
    public static final String HELP_2_4_TITLE   = "Cannot save filter";
    public static final String HELP_2_4_CONTENT = HELP_EMPTY_CONTENT;

    public static final String CATEGORY_3_NAME  = "group_3";
    public static final String CATEGORY_3_TITLE = "How to";
    public static final String HELP_3_1_NAME    = "help_3_1";
    public static final String HELP_3_1_TITLE   = "How can I get my data imported into the CDS?";
    public static final String HELP_3_1_CONTENT = HELP_EMPTY_CONTENT;
    public static final String HELP_3_2_NAME    = "help_3_2";
    public static final String HELP_3_2_TITLE   = "How to read Box Plot";
    public static final String HELP_3_2_CONTENT = HELP_EMPTY_CONTENT;
    public static final String HELP_3_3_NAME    = "help_3_3";
    public static final String HELP_3_3_TITLE   = "How do I only show time points from peak data sets?";
    public static final String HELP_3_3_CONTENT = HELP_EMPTY_CONTENT;
    public static final String HELP_3_4_NAME    = "help_3_4";
    public static final String HELP_3_4_TITLE   = "How to use color and filter in the legend.";
    public static final String HELP_3_4_CONTENT = HELP_EMPTY_CONTENT;
    public static final String HELP_3_5_NAME    = "help_3_5";
    public static final String HELP_3_5_TITLE   = "How to read Binned Plot";
    public static final String HELP_3_5_CONTENT = HELP_EMPTY_CONTENT;
    public static final String HELP_3_6_NAME    = "help_3_6";
    public static final String HELP_3_6_TITLE   = "How to select by subject";
    public static final String HELP_3_6_CONTENT = HELP_EMPTY_CONTENT;

    public static final String CATEGORY_4_NAME  = "group_4";
    public static final String CATEGORY_4_TITLE = "Videos";
    public static final String HELP_4_1_NAME    = "help_4_1";
    public static final String HELP_4_1_TITLE   = "CDS Introduction";
    public static final String HELP_4_1_CONTENT = "<iframe src=\"https://player.vimeo.com/video/142939542?color=ff9933&title=0&byline=0&portrait=0\" width=\"500\" height=\"281\" frameborder=\"0\" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";

    public static final String HELP_CENTER_TITLE = "Help Center";
    public static final String HELP_BUTTON_TEXT = "Help";
    public static final String SEE_ALL = "See all";
    public static final Locator.XPathLocator HELP_POPUP_XPATH = Locator.tag("div").withAttribute("id", "helppopup");
    public static final Locator.XPathLocator HELP_BACK_XPATH = Locator.tag("label").withAttribute("id", "helpback");
    public static final Locator.XPathLocator HELP_SEARCH_INPUT = Locator.tag("input").withAttribute("id", "helpsearchinput-inputEl");
    public static final String HELP_SEE_ALL_CSS = "p a.see-all";
    public static final String HELP_SEARCH_RESULT_CSS = "p.searchresult";
    public static final String OUTSIDE_POPUP_LOGO_CSS = "div.logo";



    private final BaseWebDriverTest _test;
    private final PortalHelper _portalHelper;

    public CDSHelpCenterUtil(BaseWebDriverTest test)
    {
        _test = test;
        _portalHelper = new PortalHelper(_test);
    }

    public void setUpWikis()
    {
        _test.goToProjectHome();
        _portalHelper.addWebPart("Wiki Table of Contents");

        createWikiPage(CATEGORY_1_NAME, CATEGORY_1_TITLE, HELP_EMPTY_CONTENT, null, null);
        createWikiPage(HELP_1_1_NAME, HELP_1_1_TITLE, HELP_1_1_CONTENT, CATEGORY_1_NAME, CATEGORY_1_TITLE);
        createWikiPage(HELP_1_2_NAME, HELP_1_2_TITLE, HELP_1_2_CONTENT, CATEGORY_1_NAME, CATEGORY_1_TITLE);
        createWikiPage(HELP_1_3_NAME, HELP_1_3_TITLE, HELP_1_3_CONTENT, CATEGORY_1_NAME, CATEGORY_1_TITLE);
        createWikiPage(HELP_1_4_NAME, HELP_1_4_TITLE, HELP_1_4_CONTENT, CATEGORY_1_NAME, CATEGORY_1_TITLE);
        createWikiPage(HELP_1_5_NAME, HELP_1_5_TITLE, HELP_1_5_CONTENT, CATEGORY_1_NAME, CATEGORY_1_TITLE);

        createWikiPage(CATEGORY_2_NAME, CATEGORY_2_TITLE, HELP_EMPTY_CONTENT, null, null);
        createWikiPage(HELP_2_1_NAME, HELP_2_1_TITLE, HELP_2_1_CONTENT, CATEGORY_2_NAME, CATEGORY_2_TITLE);
        createWikiPage(HELP_2_2_NAME, HELP_2_2_TITLE, HELP_2_2_CONTENT, CATEGORY_2_NAME, CATEGORY_2_TITLE);
        createWikiPage(HELP_2_3_NAME, HELP_2_3_TITLE, HELP_2_3_CONTENT, CATEGORY_2_NAME, CATEGORY_2_TITLE);
        createWikiPage(HELP_2_4_NAME, HELP_2_4_TITLE, HELP_2_4_CONTENT, CATEGORY_2_NAME, CATEGORY_2_TITLE);

        createWikiPage(CATEGORY_3_NAME, CATEGORY_3_TITLE, HELP_EMPTY_CONTENT, null, null);
        createWikiPage(HELP_3_1_NAME, HELP_3_1_TITLE, HELP_3_1_CONTENT, CATEGORY_3_NAME, CATEGORY_3_TITLE);
        createWikiPage(HELP_3_2_NAME, HELP_3_2_TITLE, HELP_3_2_CONTENT, CATEGORY_3_NAME, CATEGORY_3_TITLE);
        createWikiPage(HELP_3_3_NAME, HELP_3_3_TITLE, HELP_3_3_CONTENT, CATEGORY_3_NAME, CATEGORY_3_TITLE);
        createWikiPage(HELP_3_4_NAME, HELP_3_4_TITLE, HELP_3_4_CONTENT, CATEGORY_3_NAME, CATEGORY_3_TITLE);
        createWikiPage(HELP_3_5_NAME, HELP_3_5_TITLE, HELP_3_5_CONTENT, CATEGORY_3_NAME, CATEGORY_3_TITLE);
        createWikiPage(HELP_3_6_NAME, HELP_3_6_TITLE, HELP_3_6_CONTENT, CATEGORY_3_NAME, CATEGORY_3_TITLE);

        createWikiPage(CATEGORY_4_NAME, CATEGORY_4_TITLE, HELP_EMPTY_CONTENT, null, null);
        createWikiPage(HELP_4_1_NAME, HELP_4_1_TITLE, HELP_4_1_CONTENT, CATEGORY_4_NAME, CATEGORY_4_TITLE);

        _test.goToProjectHome();
        _portalHelper.removeWebPart("Pages");
    }

    public void deleteWikis()
    {
        _test.goToProjectHome();
        _portalHelper.addWebPart("Wiki Table of Contents");

        deleteWiki(HELP_4_1_TITLE);
        deleteWiki(CATEGORY_4_TITLE);

        deleteWiki(HELP_3_6_TITLE);
        deleteWiki(HELP_3_5_TITLE);
        deleteWiki(HELP_3_4_TITLE);
        deleteWiki(HELP_3_3_TITLE);
        deleteWiki(HELP_3_2_TITLE);
        deleteWiki(HELP_3_1_TITLE);
        deleteWiki(CATEGORY_3_TITLE);

        deleteWiki(HELP_2_4_TITLE);
        deleteWiki(HELP_2_3_TITLE);
        deleteWiki(HELP_2_2_TITLE);
        deleteWiki(HELP_2_1_TITLE);
        deleteWiki(CATEGORY_2_TITLE);

        deleteWiki(HELP_1_5_TITLE);
        deleteWiki(HELP_1_4_TITLE);
        deleteWiki(HELP_1_3_TITLE);
        deleteWiki(HELP_1_2_TITLE);
        deleteWiki(HELP_1_1_TITLE);
        deleteWiki(CATEGORY_1_TITLE);

        _test.goToProjectHome();
        _portalHelper.removeWebPart("Pages");
    }

    public void deleteWiki(String wikiTitle)
    {
        if (_test.isElementPresent(Locator.linkWithText("expand all")))
            _test.click(Locator.linkWithText("expand all"));
        if (_test.isElementPresent(Locator.linkWithText(wikiTitle)))
        {
            _test.clickAndWait(Locator.linkWithText(wikiTitle));
            _test.clickAndWait(Locator.linkWithText("Edit"));
            _test.clickAndWait(Locator.linkWithText("Delete Page"));
            _test.clickAndWait(Locator.linkWithText("Delete"));
        }
    }

    public void createWikiPage(String name, String title, String body, String parentName, String parentTitle)
    {
        WikiHelper wikiHelper = new WikiHelper(_test);
        wikiHelper.createNewWikiPage("HTML");

        _test.setFormElement(Locator.name("name"), name);
        _test.setFormElement(Locator.name("title"), title);
        if (parentName != null && parentTitle != null)
            _test.selectOptionByText(Locator.name("parent"), parentTitle + " (" + parentName + ")");
        wikiHelper.setWikiBody(body);
        wikiHelper.saveWikiPage();
    }
}
