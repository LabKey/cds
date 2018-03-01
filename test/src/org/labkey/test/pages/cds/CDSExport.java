/*
 * Copyright (c) 2017 LabKey Corporation
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
package org.labkey.test.pages.cds;

import org.labkey.api.util.Pair;

import java.util.Arrays;
import java.util.List;

public class CDSExport
{
    private static final String TOC_TITLE = "IMPORTANT INFORMATION ABOUT THIS DATA:";
    private static final List<String> TOC_1 = Arrays.asList("", "By exporting data from the CAVD DataSpace, you agree to be bound by the Terms of Use available on the CAVD DataSpace sign-in page at https://dataspace.cavd.org/cds/CAVD/app.view? .");
    private static final List<String> TOC_2 = Arrays.asList("", "Data included may have additional sharing restrictions; please refer to the Studies tab for details.");
    private static final List<String> TOC_3 = Arrays.asList("", "Please notify the DataSpace team of any presentations or publications resulting from this data and remember to cite the CAVD DataSpace, as well as the grant and study investigators. Thank you!");
    public static final List<List<String>> TOCS = Arrays.asList(Arrays.asList(TOC_TITLE), TOC_1, TOC_2, TOC_3);

    public static final int FILTER_START_ROW = 12;

    private List<String> filterTitles;

    private List<String> filterValues;

    private List<Pair<String, Integer>> dataTabCounts;

    private List<Pair<String, List<String>>> dataTabHeaders;

    private List<String> studies;
    private List<String> studyNetworks;

    private List<String> assays;
    private List<String> assayProvenances;

    private List<String> fieldLabels;

    public CDSExport(List<Pair<String, Integer>> dataTabCounts)
    {
        this.dataTabCounts = dataTabCounts;
    }

    public CDSExport setFilterTitles(List<String> filterTitles)
    {
        this.filterTitles = filterTitles;
        return this;
    }

    public CDSExport setFilterValues(List<String> filterValues)
    {
        this.filterValues = filterValues;
        return this;
    }

    public CDSExport setStudies(List<String> studies)
    {
        this.studies = studies;
        return this;
    }

    public CDSExport setStudyNetworks(List<String> studyNetworks)
    {
        this.studyNetworks = studyNetworks;
        return this;
    }

    public CDSExport setAssays(List<String> assays)
    {
        this.assays = assays;
        return this;
    }

    public CDSExport setAssayProvenances(List<String> assayProvenances)
    {
        this.assayProvenances = assayProvenances;
        return this;
    }

    public CDSExport setFieldLabels(List<String> fieldLabels)
    {
        this.fieldLabels = fieldLabels;
        return this;
    }

    public List<String> getFilterTitles()
    {
        return filterTitles;
    }

    public List<String> getFilterValues()
    {
        return filterValues;
    }

    public List<Pair<String, Integer>> getDataTabCounts()
    {
        return dataTabCounts;
    }

    public Integer getDataTabCount(String dataTabName)
    {
        for (Pair<String, Integer> pair : this.dataTabCounts)
        {
            if (pair.first.equals(dataTabName))
            {
                return pair.second;
            }
        }
        return null;
    }

    public List<String> getStudies()
    {
        return studies;
    }

    public List<String> getStudyNetworks()
    {
        return studyNetworks;
    }

    public List<String> getAssays()
    {
        return assays;
    }

    public List<String> getAssayProvenances()
    {
        return assayProvenances;
    }

    public List<String> getFieldLabels()
    {
        return fieldLabels;
    }

    public int getMetadataSheetIndex()
    {
        return this.getDataTabCounts().size();
    }

    public int getStudiesSheetIndex()
    {
        return this.getMetadataSheetIndex() + 1;
    }

    public int getAssaysSheetIndex()
    {
        return this.getMetadataSheetIndex() + 2;
    }

    public int getVariablesSheetIndex()
    {
        return this.getMetadataSheetIndex() + 3;
    }

    public List<Pair<String, List<String>>> getDataTabHeaders()
    {
        return dataTabHeaders;
    }

    public void setDataTabHeaders(List<Pair<String, List<String>>> dataTabHeaders)
    {
        this.dataTabHeaders = dataTabHeaders;
    }
}
