package org.labkey.test.pages.cds;

import java.util.Arrays;
import java.util.List;

public class CDSExcel
{
    private static final String TOC_TITLE = "IMPORTANT INFORMATION ABOUT THIS DATA:";
    private static final List<String> TOC_1 = Arrays.asList("", "By exporting data from the CAVD DataSpace, you agree to be bound by the Terms of Use available on the CAVD DataSpace sign-in page at https://dataspace.cavd.org/cds/CAVD/app.view? .");
    private static final List<String> TOC_2 = Arrays.asList("", "Data included may have additional sharing restrictions; please refer to the Studies tab for details.");
    private static final List<String> TOC_3 = Arrays.asList("", "Please notify the DataSpace team of any presentations or publications resulting from this data and remember to cite the CAVD DataSpace, as well as the grant and study investigators. Thank you!");
    public static final List<List<String>> TOCS = Arrays.asList(Arrays.asList(TOC_TITLE), TOC_1, TOC_2, TOC_3);

    public static final int FILTER_START_ROW = 12;

    private List<String> filterTitles;

    private List<String> filterValues;

    private int dataRowCount;

    private List<String> studies;
    private List<String> studyNetworks;

    private List<String> assays;
    private List<String> assayProvenances;

    private List<String> fieldLabels;

    public CDSExcel(int dataRowCount)
    {
        this.dataRowCount = dataRowCount;
    }

    public CDSExcel setFilterTitles(List<String> filterTitles)
    {
        this.filterTitles = filterTitles;
        return this;
    }

    public CDSExcel setFilterValues(List<String> filterValues)
    {
        this.filterValues = filterValues;
        return this;
    }

    public CDSExcel setStudies(List<String> studies)
    {
        this.studies = studies;
        return this;
    }

    public CDSExcel setStudyNetworks(List<String> studyNetworks)
    {
        this.studyNetworks = studyNetworks;
        return this;
    }

    public CDSExcel setAssays(List<String> assays)
    {
        this.assays = assays;
        return this;
    }

    public CDSExcel setAssayProvenances(List<String> assayProvenances)
    {
        this.assayProvenances = assayProvenances;
        return this;
    }

    public CDSExcel setFieldLabels(List<String> fieldLabels)
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

    public int getDataRowCount()
    {
        return dataRowCount;
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

}
