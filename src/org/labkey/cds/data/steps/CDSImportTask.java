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
import org.labkey.cds.data.CSVCopyConfig;
import org.labkey.cds.data.TSVCopyConfig;

public class CDSImportTask extends ImportTask
{
    private static CDSImportCopyConfig[] dataspaceTables = new CDSImportCopyConfig[]
    {
        // bcr data, order matters due to FKs
        new CSVCopyConfig("sequence"),
        new CSVCopyConfig("alignment_run"),
        new CSVCopyConfig("allele_sequence"),
        new CSVCopyConfig("alignment"),
        new CSVCopyConfig("header_source"),
        new CSVCopyConfig("sequence_header"),
        new CSVCopyConfig("sequence_germline"),
        new CSVCopyConfig("preferred_allele"),
        new CSVCopyConfig("antibody_class"),
        new CSVCopyConfig("pab_sequence"),
        new CSVCopyConfig("pab_sequence_study"),

            // Core Tables
        new TSVCopyConfig("Study"),
        new TSVCopyConfig("StudyGroups"),
        new TSVCopyConfig("Product"),
        new TSVCopyConfig("Assay"),
        new TSVCopyConfig("Lab"),
        new TSVCopyConfig("StudySubject"), // a.k.a Demographics, SubjectCharacteristics
        new TSVCopyConfig("Document"),
        new TSVCopyConfig("Publication"),
        new TSVCopyConfig("donor_metadata", false),
        new TSVCopyConfig("MAbMetadata", false),
        new TSVCopyConfig("MAbMixMetadata"),

        // BCR data
        new CSVCopyConfig("donor_mab_sequence"),
        new CSVCopyConfig("antibody_structure"),

        // Dependent Tables
        new TSVCopyConfig("StudyPartGroupArm"),
        new TSVCopyConfig("StudyPartGroupArmProduct"),
        new TSVCopyConfig("StudyPartGroupArmVisit"),
        new TSVCopyConfig("StudyPartGroupArmVisitProduct"),
        new TSVCopyConfig("StudyPartGroupArmVisitTime"),
        new TSVCopyConfig("ProductInsert", "ProductInsertClade", true),
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
        new TSVCopyConfig("ICSAntigen", "AssayICSAntigen_Metadata", true),
        new TSVCopyConfig("ELISpotAntigen", "AssayELSAntigen_Metadata", true),
        new TSVCopyConfig("NAbAntigen", "AssayNABAntigen_Metadata", true),
        new TSVCopyConfig("BAMAAntigen", "AssayBAMAAntigen_Metadata", true),
        new TSVCopyConfig("antigenPanelMeta", "AntigenPanel_Metadata", true),
        new TSVCopyConfig("antigenPanel", "AntigenPanel", true),
        new TSVCopyConfig("virusPanel", "VirusPanel", true),
        new TSVCopyConfig("assay_combined_antigen_metadata", "AssayCombinedAntigenMetadata", true),

        // Datasets
        new TSVCopyConfig("ICS", "AssayICS", true),
        new TSVCopyConfig("ELS_IFNg", "AssayELS_IFNg", true),
        new TSVCopyConfig("NAB", "AssayNAB", true),
        new TSVCopyConfig("BAMA", "AssayBAMA", true),
        new TSVCopyConfig("NABMAb", "AssayNABMAb", true),
        new TSVCopyConfig("PKMAb", "AssayPKMAb", true),

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
