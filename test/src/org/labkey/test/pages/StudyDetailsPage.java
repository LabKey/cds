/*
 * Copyright (c) 2014 LabKey Corporation
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

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.tests.CDSTest;
import org.labkey.test.util.LogMethod;

import static org.junit.Assert.*;

public class StudyDetailsPage
{
    private final CDSTest _test;

    private final String _name;
    private final String _description;
    private final String _PI1;
    private final String _PI2;
    private final String _contact;
    private final String _type;
    private final String _network;

    private StudyDetailsPage(CDSTest test, String study, String description, String PI1, String PI2, String contact, String type, String network)
    {
        _test = test;

        _name = study;
        _description = description;
        _PI1 = PI1;
        _PI2 = PI2;
        _contact = contact;
        _type = type;
        _network = network;
    }

    public String getStudyName()
    {
        return _name;
    }

    public String toString()
    {
        return _name;
    }

    @LogMethod
    public void assertStudyInfoPage()
    {
        _test.waitForElement(Locator.css("div.studytitle").withText(_name));
        _test.waitForElement(Locators.studyProperty("Name").withText(_name), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT, false);
        assertEquals("Incorrect study name", _name, _test.getText(Locators.studyProperty("Name")));
        assertEquals("Incorrect study description", _description, _test.getText(Locators.studyProperty("Description")));
        assertEquals("Incorrect study PI-1", _PI1, _test.getText(Locators.studyProperty("PI-1")));
        assertEquals("Incorrect study PI-2", _PI2, _test.getText(Locators.studyProperty("PI-2")));
        assertEquals("Incorrect study contact", _contact, _test.getText(Locators.studyProperty("Contact")));
        assertEquals("Incorrect study type", _type, _test.getText(Locators.studyProperty("Type")));
        assertEquals("Incorrect study network", _network, _test.getText(Locators.studyProperty("Network")));
    }

    public static StudyDetailsPage demoStudy(CDSTest test)
    {
        return new StudyDetailsPage(test, "DemoSubset", "", "Igra M", "", "Fitzsimmons K", "Trial", "LabKey");
    }

    public static StudyDetailsPage notActuallyCHAVI001(CDSTest test)
    {
        return new StudyDetailsPage(test, "Not Actually CHAVI 001", "", "Bellew M", "", "Arnold N", "Observational", "CHAVI");
    }

    public static StudyDetailsPage notRV144(CDSTest test)
    {
        return new StudyDetailsPage(test, "NotRV144", "", "Piehler B", "", "Lum K", "Trial", "USMHRP");
    }

    private static class Locators
    {
        public static Locator.XPathLocator studyProperty(String property)
        {
            return Locator.tag("div").withClass("study-single-body")
                    .append("//tr").withDescendant(Locator.tag("div").withClass("boldlabel").withText(property))
                    .append(Locator.tag("div").withClass("nounheader"));
        }
    }
}
