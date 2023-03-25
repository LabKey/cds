/*
 * Copyright (c) 2015-2019 LabKey Corporation
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
package org.labkey.cds.data.steps;

import org.labkey.cds.data.CDSImportCopyConfig;
import org.labkey.cds.data.TSVCopyConfig;

public class CDSImportTask extends ImportTask
{
    private static CDSImportCopyConfig[] dataspaceTables = new CDSImportCopyConfig[]
    {
        // Core Tables
        new TSVCopyConfig("Study"),
        new TSVCopyConfig("StudyGroups"),
        new TSVCopyConfig("Product"),
        new TSVCopyConfig("Assay"),
        new TSVCopyConfig("Lab"),
        new TSVCopyConfig("StudySubject"), // a.k.a Demographics, SubjectCharacteristics
        new TSVCopyConfig("Document"),
        new TSVCopyConfig("Publication"),
        new TSVCopyConfig("MAbMetadata"),
        new TSVCopyConfig("MAbMixMetadata"),

        // Dependent Tables
        new TSVCopyConfig("StudyPartGroupArm"),
        new TSVCopyConfig("StudyPartGroupArmProduct"),
        new TSVCopyConfig("StudyPartGroupArmVisit"),
        new TSVCopyConfig("StudyPartGroupArmVisitProduct"),
        new TSVCopyConfig("StudyPartGroupArmVisitTime"),
        new TSVCopyConfig("ProductInsert", "ProductInsertClade"),
        new TSVCopyConfig("StudyRelationshipOrder"),
        new TSVCopyConfig("StudyRelationship"),
        new TSVCopyConfig("MAbMix"),

        // Mapping Tables
        new TSVCopyConfig("StudyProduct"),
        new TSVCopyConfig("StudyAssay"),
        new TSVCopyConfig("StudyPartGroupArmSubject"),
        new TSVCopyConfig("StudyDocument"),
        new TSVCopyConfig("AssayDocument"),
        new TSVCopyConfig("StudyPublication"),
        new TSVCopyConfig("PublicationDocument"),
        new TSVCopyConfig("StudyReport"),
        new TSVCopyConfig("StudyCuratedGroup"),
        new TSVCopyConfig("PublicationReport"),
        new TSVCopyConfig("PublicationCuratedGroup"),
        new TSVCopyConfig("AssayReport"),

        //AntigenMetadata
        new TSVCopyConfig("ICSAntigen", "AssayICSAntigen_Metadata"),
        new TSVCopyConfig("ELISpotAntigen", "AssayELSAntigen_Metadata"),
        new TSVCopyConfig("NAbAntigen", "AssayNABAntigen_Metadata"),
        new TSVCopyConfig("BAMAAntigen", "AssayBAMAAntigen_Metadata"),
        new TSVCopyConfig("antigenPanelMeta", "AntigenPanel_Metadata"),
        new TSVCopyConfig("antigenPanel", "AntigenPanel"),
        new TSVCopyConfig("virusPanel", "VirusPanel"),
        new TSVCopyConfig("assay_combined_antigen_metadata", "AssayCombinedAntigenMetadata"),

        // Datasets
        new TSVCopyConfig("ICS", "AssayICS"),
        new TSVCopyConfig("ELS_IFNg", "AssayELS_IFNg"),
        new TSVCopyConfig("NAB", "AssayNAB"),
        new TSVCopyConfig("BAMA", "AssayBAMA"),
        new TSVCopyConfig("NABMAb", "AssayNABMAb"),
        new TSVCopyConfig("PKMAb", "AssayPKMAb"),

        // Virus data
        new TSVCopyConfig("Virus_Metadata_All"),
        new TSVCopyConfig("Virus_Lab_Id"),
        new TSVCopyConfig("Virus_Synonym"),
    };

    @Override
    protected CDSImportCopyConfig[] getImportCopyConfig()
    {
        return dataspaceTables;
    }
}
