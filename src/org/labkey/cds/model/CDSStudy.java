package org.labkey.cds.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.labkey.api.data.Container;

public class CDSStudy
{
    private String _prot;
    private String _network;
    private Container _container;
    private String _studyLabel;
    private String _studyShortName;
    private String _studyTitle;
    private String _studyType;
    private String _studyDesign;

    public String getProt()
    {
        return _prot;
    }

    public void setProt(String prot)
    {
        _prot = prot;
    }

    public String getNetwork()
    {
        return _network;
    }

    public void setNetwork(String network)
    {
        _network = network;
    }

    @JsonIgnore
    public Container getContainer()
    {
        return _container;
    }

    public void setContainer(Container container)
    {
        _container = container;
    }

    public String getStudyLabel()
    {
        return _studyLabel;
    }

    public void setStudyLabel(String studyLabel)
    {
        _studyLabel = studyLabel;
    }

    public String getStudyShortName()
    {
        return _studyShortName;
    }

    public void setStudyShortName(String studyShortName)
    {
        _studyShortName = studyShortName;
    }

    public String getStudyTitle()
    {
        return _studyTitle;
    }

    public void setStudyTitle(String studyTitle)
    {
        _studyTitle = studyTitle;
    }

    public String getStudyType()
    {
        return _studyType;
    }

    public void setStudyType(String studyType)
    {
        _studyType = studyType;
    }

    public String getStudyDesign()
    {
        return _studyDesign;
    }

    public void setStudyDesign(String studyDesign)
    {
        _studyDesign = studyDesign;
    }
}
