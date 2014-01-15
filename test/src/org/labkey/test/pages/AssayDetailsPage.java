/*
 * Copyright (c) 2013 LabKey Corporation
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
package org.labkey.test.pages;

import org.labkey.test.tests.CDSTest;
import org.labkey.test.Locator;
import org.labkey.test.util.LogMethod;

import static org.junit.Assert.*;

/**
 * User: tchadick
 * Date: 10/25/13
 */
public class AssayDetailsPage
{
    private final CDSTest _test;

    private final String _name;
    private final String _contributorImg;
    private final String _pocImg;
    private final String _leadContributor;
    private final String _pointOfContact;
    private final String _details;
    private final String _assayAbstract;
    private final String _relatedPubs;

    private AssayDetailsPage(CDSTest test, String name, String contributorImg, String pocImg, String leadContributor, String pointOfContact, String details, String assayAbstract, String relatedPubs)
    {
        _test = test;

        _name = name;
        _contributorImg = contributorImg;
        _pocImg = pocImg;
        _leadContributor = leadContributor;
        _pointOfContact = pointOfContact;
        _details = details;
        _assayAbstract = assayAbstract;
        _relatedPubs = relatedPubs;
    }

    public String getAssayName()
    {
        return _name;
    }

    public String toString()
    {
        return _name;
    }

    @LogMethod
    public void assertAssayInfoPage()
    {
        _test.waitForElement(Locator.css("div.assaytitle").withText(_name));
        if(_contributorImg.equals(_pocImg))
        {
            Locator.XPathLocator imgLoc = Locator.xpath("//img[@src='/labkey/cds/images/pictures/"+ _pocImg +"']");
            _test.waitForElement(imgLoc);
            _test.assertElementPresent(imgLoc, 2);
        }
        else
        {
            Locator.XPathLocator imgLead = Locator.xpath("//img[@src='/labkey/cds/images/pictures/"+ _pocImg +"']");
            Locator.XPathLocator imgContact= Locator.xpath("//img[@src='/labkey/cds/images/pictures/"+ _contributorImg +"']");

            _test.waitForElement(imgLead);
            _test.waitForElement(imgContact);

            _test.assertElementPresent(imgLead, 1);
            _test.assertElementPresent(imgContact, 1);
        }
        assertEquals("Incorrect Lead Contributor", _leadContributor.replace("\n", ""), _test.getText(Locator.css(".assayInfoLeadContributor")).replace("\n", ""));
        assertEquals("Incorrect Assay Point of Contact", _pointOfContact.replace("\n", ""), _test.getText(Locator.css(".assayInfoPointOfContact")).replace("\n", ""));
        assertEquals("Incorrect Assay Details", _details.toUpperCase().replace("\n", ""), _test.getText(Locator.css(".assayInfoDetails")).replace("\n", ""));
        //assertEquals("Incorrect Description", ("Description" + _pointOfContact).replace("\n", ""), _test.getText(Locator.css(".assayInfoDescription")).replace("\n", ""));
        assertEquals("Incorrect Assay Abstract", _assayAbstract.replace("\n", ""), _test.getText(Locator.css(".assayInfoAbstract")).replace("\n", ""));
        assertEquals("Incorrect Related Publications", _relatedPubs.replace("\n", ""), _test.getText(Locator.css(".assayInfoRelatedPublications")).replace("\n", ""));
    }

    public static AssayDetailsPage labResults(CDSTest test)
    {
        return new AssayDetailsPage(test, "Lab Results", "default.png", "default.png", "", "", "", "", "");
    }

    public static AssayDetailsPage adccFerrari(CDSTest test)
    {
        return new AssayDetailsPage(test, "ADCC-Ferrari", "team_Mark_Igra.jpg", "team_Alan_Vezina.jpg",
                                "Mark Igra\n" +
                                "marki@labkey.com\n" +
                                "Partner",
                                "Alan Vezina\n" +
                                "alanv@labkey.com\n" +
                                "Developer",
                                "Methodology: ICS\n" +
                                "Target Area: Adaptive: humoral and B-cell",
                                "This is an ADCC assay.",
                                "Immune escape from HIV-specific antibody-dependent cellular cytotoxicity (ADCC) pressure.");
    }

    public static AssayDetailsPage luminexSampleLabKey(CDSTest test)
    {
        return new AssayDetailsPage(test, "Luminex-Sample-LabKey", "team_Nick_Arnold.jpg", "team_Nick_Arnold.jpg",
                                "Nick Arnold\n" +
                                "nicka@labkey.com\n" +
                                "Developer",
                                "Nick Arnold\n" +
                                "nicka@labkey.com\n" +
                                "Developer",
                                "Methodology: Luminex\n" +
                                "Target Area: Adaptive: humoral and B-cell",
                                "We measured something using a Luminex assay",
                                "Inhibition of HIV-1 replication in human lymphoid tissues ex vivo by measles virus.");
    }

    public static AssayDetailsPage mrnaAssay(CDSTest test)
    {
        return new AssayDetailsPage(test, "mRNA assay", "team_Mark_Igra.jpg", "team_Nick_Arnold.jpg",
                                "Mark Igra\n" +
                                "marki@labkey.com\n" +
                                "Partner",
                                "Nick Arnold\n" +
                                "nicka@labkey.com\n" +
                                "Developer",
                                "Methodology: ICS\n" +
                                "Target Area: Innate",
                                "This one tested gene expression.",
                                "Development of an in vitro mRNA degradation assay utilizing extracts from HIV-1- and SIV-infected cells.");
    }

    public static AssayDetailsPage nabSampleLabKey(CDSTest test)
    {
        return new AssayDetailsPage(test, "NAb-Sample-LabKey", "team_Karl_Lum.jpg", "team_Kristin_Fitzsimmons.jpg",
                                "Karl Lum\n" +
                                "klum@labkey.com\n" +
                                "Developer",
                                "Kristin Fitzsimmons\n" +
                                "kristinf@labkey.com\n" +
                                "ScrumMaster",
                                "Methodology: NAb\n" +
                                "Target Area: Adaptive: humoral and B-cell",
                                "This tested antibodies.",
                                "Vaccinology: precisely tuned antibodies nab HIV.");
    }
}
