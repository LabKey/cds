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

public class CDSImportTask extends ImportTask
{
    private static CDSImportCopyConfig[] dataspaceTables = new CDSImportCopyConfig[]
    {
        // bcr data, order matters due to FKs
        new CDSImportCopyConfig("sequence"),
        new CDSImportCopyConfig("alignment_run"),
        new CDSImportCopyConfig("allele_sequence"),
        new CDSImportCopyConfig("alignment"),
        new CDSImportCopyConfig("header_source"),
        new CDSImportCopyConfig("sequence_header"),
        new CDSImportCopyConfig("sequence_germline"),
        new CDSImportCopyConfig("preferred_allele"),
        new CDSImportCopyConfig("antibody_class"),
        new CDSImportCopyConfig("pab_sequence"),
        new CDSImportCopyConfig("pab_sequence_study"),

            // Core Tables
        new CDSImportCopyConfig("import_Study", "Study"),
        new CDSImportCopyConfig("import_StudyGroups", "StudyGroups"),
        new CDSImportCopyConfig("import_Product", "Product"),
        new CDSImportCopyConfig("import_Assay", "Assay"),
        new CDSImportCopyConfig("import_Lab", "Lab"),
        new CDSImportCopyConfig("import_StudySubject", "StudySubject"), // a.k.a Demographics, SubjectCharacteristics
        new CDSImportCopyConfig("import_Document", "Document"),
        new CDSImportCopyConfig("import_Publication", "Publication"),
        new CDSImportCopyConfig("donor_metadata"),
        new CDSImportCopyConfig("mab_metadata"),
        new CDSImportCopyConfig("import_MAbMixMetadata", "MAbMixMetadata"),

        // BCR data
        new CDSImportCopyConfig("donor_mab_sequence"),
        new CDSImportCopyConfig("antibody_structure"),

        // Dependent Tables
        new CDSImportCopyConfig("import_StudyPartGroupArm", "StudyPartGroupArm"),
        new CDSImportCopyConfig("import_StudyPartGroupArmProduct", "StudyPartGroupArmProduct"),
        new CDSImportCopyConfig("import_StudyPartGroupArmVisit", "StudyPartGroupArmVisit"),
        new CDSImportCopyConfig("import_StudyPartGroupArmVisitProduct", "StudyPartGroupArmVisitProduct"),
        new CDSImportCopyConfig("import_StudyPartGroupArmVisitTime", "StudyPartGroupArmVisitTime"),
        new CDSImportCopyConfig("import_ProductInsert", "ProductInsertClade"),
        new CDSImportCopyConfig("import_StudyRelationshipOrder", "StudyRelationshipOrder"),
        new CDSImportCopyConfig("import_StudyRelationship", "StudyRelationship"),
        new CDSImportCopyConfig("import_MAbMix", "MAbMix"),

        // Mapping Tables
        new CDSImportCopyConfig("import_StudyProduct", "StudyProduct"),
        new CDSImportCopyConfig("import_StudyAssay", "StudyAssay"),
        new CDSImportCopyConfig("import_StudyPartGroupArmSubject", "StudyPartGroupArmSubject"),
        new CDSImportCopyConfig("import_StudyDocument", "StudyDocument"),
        new CDSImportCopyConfig("import_AssayDocument", "AssayDocument"),
        new CDSImportCopyConfig("import_StudyPublication", "StudyPublication"),
        new CDSImportCopyConfig("import_PublicationDocument", "PublicationDocument"),
        new CDSImportCopyConfig("import_StudyReport", "StudyReport"),
        new CDSImportCopyConfig("import_StudyCuratedGroup", "StudyCuratedGroup"),
        new CDSImportCopyConfig("import_PublicationReport", "PublicationReport"),
        new CDSImportCopyConfig("import_PublicationCuratedGroup", "PublicationCuratedGroup"),
        new CDSImportCopyConfig("import_AssayReport", "AssayReport"),

        //AntigenMetadata
        new CDSImportCopyConfig("import_ICSAntigen", "AssayICSAntigen_Metadata"),
        new CDSImportCopyConfig("import_ELISpotAntigen", "AssayELSAntigen_Metadata"),
        new CDSImportCopyConfig("import_NAbAntigen", "AssayNABAntigen_Metadata"),
        new CDSImportCopyConfig("import_BAMAAntigen", "AssayBAMAAntigen_Metadata"),
        new CDSImportCopyConfig("import_antigenPanelMeta", "AntigenPanel_Metadata"),
        new CDSImportCopyConfig("import_antigenPanel", "AntigenPanel"),
        new CDSImportCopyConfig("import_virusPanel", "VirusPanel"),
        new CDSImportCopyConfig("import_assay_combined_antigen_metadata", "AssayCombinedAntigenMetadata"),

        // Datasets
        new CDSImportCopyConfig("import_ICS", "AssayICS"),
        new CDSImportCopyConfig("import_ELS_IFNg", "AssayELS_IFNg"),
        new CDSImportCopyConfig("import_NAB", "AssayNAB"),
        new CDSImportCopyConfig("import_BAMA", "AssayBAMA"),
        new CDSImportCopyConfig("import_NABMAb", "AssayNABMAb"),
        new CDSImportCopyConfig("import_PKMAb", "AssayPKMAb"),

        // Virus data
        new CDSImportCopyConfig("import_Virus_Metadata_All", "Virus_Metadata_All"),
        new CDSImportCopyConfig("import_Virus_Lab_Id", "Virus_Lab_Id"),
        new CDSImportCopyConfig("import_Virus_Synonym", "Virus_Synonym"),
    };

    @Override
    protected CDSImportCopyConfig[] getImportCopyConfig()
    {
        return dataspaceTables;
    }
}
