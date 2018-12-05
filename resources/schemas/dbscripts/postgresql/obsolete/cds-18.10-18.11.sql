/*
 * Copyright (c) 2018 LabKey Corporation
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
TRUNCATE
    cds.import_ics,
    cds.import_els_ifng,
    cds.import_bama,
    cds.import_studysitepersonnel,
    cds.import_studypartgrouparmsubject,
    cds.import_studysitefunction,
    cds.import_studyrelationship,
    cds.import_studypublication,
    cds.import_studyproduct,
    cds.import_studypersonnel,
    cds.import_studypartgrouparmvisitproduct,
    cds.import_studypartgrouparmproduct,
    cds.import_studydocument,
    cds.import_studyassay,
    cds.import_productinsert,
    cds.import_studypartgrouparmvisit,
    cds.import_studypartgrouparm,
    cds.import_studygroups,
    cds.import_nabantigen,
    cds.import_icsantigen,
    cds.import_elispotantigen,
    cds.import_bamaantigen,
    cds.import_studysubject,
    cds.import_product,
    cds.import_nab,
    cds.import_assay,
    cds.import_studyrelationshiporder,
    cds.import_site,
    cds.import_publication,
    cds.import_personnel,
    cds.import_document,
    cds.import_lab,
    cds.import_study
RESTART IDENTITY CASCADE;

-- Drop FKs
ALTER TABLE cds.import_ics DROP CONSTRAINT import_ics_assay_identifier_fkey;
ALTER TABLE cds.import_ics DROP CONSTRAINT import_ics_lab_code_fkey;
ALTER TABLE cds.import_ics DROP CONSTRAINT import_ics_prot_fkey;

ALTER TABLE cds.import_els_ifng DROP CONSTRAINT import_els_ifng_assay_identifier_fkey;
ALTER TABLE cds.import_els_ifng DROP CONSTRAINT import_els_ifng_lab_code_fkey;
ALTER TABLE cds.import_els_ifng DROP CONSTRAINT import_els_ifng_prot_fkey;

ALTER TABLE cds.import_bama DROP CONSTRAINT import_bama_assay_identifier_fkey;
ALTER TABLE cds.import_bama DROP CONSTRAINT import_bama_lab_code_fkey;
ALTER TABLE cds.import_bama DROP CONSTRAINT import_bama_prot_fkey;

ALTER TABLE cds.import_studysitepersonnel DROP CONSTRAINT import_studysitepersonnel_person_id_fkey;
ALTER TABLE cds.import_studysitepersonnel DROP CONSTRAINT import_studysitepersonnel_prot_fkey;
ALTER TABLE cds.import_studysitepersonnel DROP CONSTRAINT import_studysitepersonnel_site_id_fkey;

ALTER TABLE cds.import_studypartgrouparmsubject DROP CONSTRAINT fk_armsubject_studysubject;
ALTER TABLE cds.import_studypartgrouparmsubject DROP CONSTRAINT import_studypartgrouparmsubject_prot_fkey;

ALTER TABLE cds.import_studysitefunction DROP CONSTRAINT import_studysitefunction_prot_fkey;
ALTER TABLE cds.import_studysitefunction DROP CONSTRAINT import_studysitefunction_site_id_fkey;

ALTER TABLE cds.import_studyrelationship DROP CONSTRAINT fk_import_study_relationship_prot;

ALTER TABLE cds.import_studypersonnel DROP CONSTRAINT import_studypersonnel_person_id_fkey;
ALTER TABLE cds.import_studypersonnel DROP CONSTRAINT import_studypersonnel_prot_fkey;

ALTER TABLE cds.import_studypartgrouparmvisitproduct DROP CONSTRAINT import_studypartgrouparmvisitproduct_product_id_fkey;
ALTER TABLE cds.import_studypartgrouparmvisitproduct DROP CONSTRAINT import_studypartgrouparmvisitproduct_prot_fkey;

ALTER TABLE cds.import_studypartgrouparmproduct DROP CONSTRAINT import_studypartgrouparmproduct_product_id_fkey;
ALTER TABLE cds.import_studypartgrouparmproduct DROP CONSTRAINT import_studypartgrouparmproduct_prot_fkey;

ALTER TABLE cds.import_productinsert DROP CONSTRAINT import_productinsert_product_id_fkey;
ALTER TABLE cds.import_productinsert DROP CONSTRAINT uq_import_productinsert;

ALTER TABLE cds.import_product DROP CONSTRAINT import_product_product_name_key;

ALTER TABLE cds.import_studypartgrouparmvisit DROP CONSTRAINT import_studypartgrouparmvisit_prot_fkey;

ALTER TABLE cds.import_studypartgrouparm DROP CONSTRAINT import_studypartgrouparm_prot_fkey;

ALTER TABLE cds.import_nabantigen DROP CONSTRAINT import_nabantigen_assay_identifier_fkey;

ALTER TABLE cds.import_icsantigen DROP CONSTRAINT import_icsantigen_assay_identifier_fkey;

ALTER TABLE cds.import_elispotantigen DROP CONSTRAINT import_elispotantigen_assay_identifier_fkey;

ALTER TABLE cds.import_bamaantigen DROP CONSTRAINT import_bamaantigen_assay_identifier_fkey;

ALTER TABLE cds.import_studysubject DROP CONSTRAINT import_studysubject_prot_fkey;

ALTER TABLE cds.import_nab DROP CONSTRAINT import_nab_assay_identifier_fkey;
ALTER TABLE cds.import_nab DROP CONSTRAINT import_nab_lab_code_fkey;
ALTER TABLE cds.import_nab DROP CONSTRAINT import_nab_prot_fkey;

-- Drop PKs
ALTER TABLE cds.import_studysitepersonnel DROP CONSTRAINT pk_import_studysitepersonnel;
ALTER TABLE cds.import_studypartgrouparmsubject DROP CONSTRAINT pk_import_studypartgrouparmsubject;
ALTER TABLE cds.import_studysitefunction DROP CONSTRAINT pk_import_studysitefunction;
ALTER TABLE cds.import_studyrelationship DROP CONSTRAINT pk_import_studyrelationship;
ALTER TABLE cds.import_studypublication DROP CONSTRAINT pk_import_studypublication;
ALTER TABLE cds.import_studyproduct DROP CONSTRAINT pk_import_studyproduct;
ALTER TABLE cds.import_studypersonnel DROP CONSTRAINT pk_import_studypersonnel;
ALTER TABLE cds.import_studypartgrouparmvisitproduct DROP CONSTRAINT pk_import_studypartgrouparmvisitproduct;
ALTER TABLE cds.import_studypartgrouparmproduct DROP CONSTRAINT pk_import_studypartgrouparmproduct;
ALTER TABLE cds.import_studydocument DROP CONSTRAINT pk_import_studydocument;
ALTER TABLE cds.import_studyassay DROP CONSTRAINT pk_import_studyassay;
ALTER TABLE cds.import_studypartgrouparmvisit DROP CONSTRAINT pk_import_studypartgrouparmvisit;
ALTER TABLE cds.import_studypartgrouparm DROP CONSTRAINT pk_import_studyarm;
ALTER TABLE cds.import_nabantigen DROP CONSTRAINT pk_import_nabantigen;
ALTER TABLE cds.import_icsantigen DROP CONSTRAINT pk_import_icsantigen;
ALTER TABLE cds.import_elispotantigen DROP CONSTRAINT pk_import_elispotantigen;
ALTER TABLE cds.import_bamaantigen DROP CONSTRAINT pk_import_bamaantigen;
ALTER TABLE cds.import_studysubject DROP CONSTRAINT pk_import_studysubject;
ALTER TABLE cds.import_product DROP CONSTRAINT pk_import_product;
ALTER TABLE cds.import_assay DROP CONSTRAINT pk_import_assay;
ALTER TABLE cds.import_studyrelationshiporder DROP CONSTRAINT pk_import_studyrelationshiporder;
ALTER TABLE cds.import_site DROP CONSTRAINT pk_import_site;
ALTER TABLE cds.import_publication DROP CONSTRAINT pk_import_publication;
ALTER TABLE cds.import_personnel DROP CONSTRAINT pk_import_personnel;
ALTER TABLE cds.import_document DROP CONSTRAINT pk_import_document;
ALTER TABLE cds.import_lab DROP CONSTRAINT pk_import_lab;
ALTER TABLE cds.import_study DROP CONSTRAINT pk_import_study;


-- Add container columns
ALTER TABLE cds.import_ics ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_els_ifng ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_bama ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studysitepersonnel ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studypartgrouparmsubject ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studysitefunction ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studyrelationship ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studypublication ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studyproduct ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studypersonnel ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studypartgrouparmvisitproduct ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studypartgrouparmproduct ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studydocument ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studyassay ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_productinsert ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studypartgrouparmvisit ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studypartgrouparm ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studygroups ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_nabantigen ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_icsantigen ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_elispotantigen ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_bamaantigen ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studysubject ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_product ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_nab ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_assay ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studyrelationshiporder ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_site ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_publication ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_personnel ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_document ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_lab ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_study ADD COLUMN container ENTITYID NOT NULL;

-- Add PKs
ALTER TABLE cds.import_studysitepersonnel ADD PRIMARY KEY (container, prot, site_id, person_id);
ALTER TABLE cds.import_studypartgrouparmsubject ADD PRIMARY KEY (container, prot, subject_id, study_part, study_group, study_arm);
ALTER TABLE cds.import_studysitefunction ADD PRIMARY KEY (container, prot, site_id, site_type);
ALTER TABLE cds.import_studyrelationship ADD PRIMARY KEY (container, prot, rel_prot);
ALTER TABLE cds.import_studypublication ADD PRIMARY KEY (container, prot, publication_id);
ALTER TABLE cds.import_studyproduct ADD PRIMARY KEY (container, prot, product_id);
ALTER TABLE cds.import_studypersonnel ADD PRIMARY KEY (container, prot, person_id);
ALTER TABLE cds.import_studypartgrouparmvisitproduct ADD PRIMARY KEY (container, prot, study_part, study_group, study_arm, study_day, product_id);
ALTER TABLE cds.import_studypartgrouparmproduct ADD PRIMARY KEY (container, prot, study_part, study_group, study_arm, product_id);
ALTER TABLE cds.import_studydocument ADD PRIMARY KEY (container, prot, document_id);
ALTER TABLE cds.import_studyassay ADD PRIMARY KEY (container, prot, assay_identifier);
ALTER TABLE cds.import_studypartgrouparmvisit ADD PRIMARY KEY (container, prot, study_part, study_arm, study_group, study_day);
ALTER TABLE cds.import_studypartgrouparm ADD PRIMARY KEY (container, prot, study_part, study_group, study_arm);
ALTER TABLE cds.import_nabantigen ADD PRIMARY KEY (container, antigen_name, target_cell, antigen_type);
ALTER TABLE cds.import_icsantigen ADD PRIMARY KEY (container, antigen_name, antigen_type);
ALTER TABLE cds.import_elispotantigen ADD PRIMARY KEY (container, antigen_name, antigen_type);
ALTER TABLE cds.import_bamaantigen ADD PRIMARY KEY (container, antigen_name, antigen_type);
ALTER TABLE cds.import_studysubject ADD PRIMARY KEY (container, prot, subject_id);
ALTER TABLE cds.import_product ADD PRIMARY KEY (container, product_id);
ALTER TABLE cds.import_assay ADD PRIMARY KEY (container, assay_identifier);
ALTER TABLE cds.import_studyrelationshiporder ADD PRIMARY KEY (container, relationship);
ALTER TABLE cds.import_site ADD PRIMARY KEY (container, site_id);
ALTER TABLE cds.import_publication ADD PRIMARY KEY (container, publication_id);
ALTER TABLE cds.import_personnel ADD PRIMARY KEY (container, person_id);
ALTER TABLE cds.import_document ADD PRIMARY KEY (container, document_id);
ALTER TABLE cds.import_lab ADD PRIMARY KEY (container, lab_code);
ALTER TABLE cds.import_study ADD PRIMARY KEY (container, prot);

-- Add FKs
ALTER TABLE cds.import_ics ADD CONSTRAINT import_ics_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier);
ALTER TABLE cds.import_ics ADD CONSTRAINT import_ics_lab_code_fkey
    FOREIGN KEY (container, lab_code) REFERENCES cds.import_lab (container, lab_code);
ALTER TABLE cds.import_ics ADD CONSTRAINT import_ics_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_els_ifng ADD CONSTRAINT import_els_ifng_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier);
ALTER TABLE cds.import_els_ifng ADD CONSTRAINT import_els_ifng_lab_code_fkey
    FOREIGN KEY (container, lab_code) REFERENCES cds.import_lab (container, lab_code);
ALTER TABLE cds.import_els_ifng ADD CONSTRAINT import_els_ifng_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_bama ADD CONSTRAINT import_bama_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier);
ALTER TABLE cds.import_bama ADD CONSTRAINT import_bama_lab_code_fkey
    FOREIGN KEY (container, lab_code) REFERENCES cds.import_lab (container, lab_code);
ALTER TABLE cds.import_bama ADD CONSTRAINT import_bama_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_studysitepersonnel ADD CONSTRAINT import_studysitepersonnel_person_id_fkey
    FOREIGN KEY (container, person_id) REFERENCES cds.import_personnel (container, person_id);
ALTER TABLE cds.import_studysitepersonnel ADD CONSTRAINT import_studysitepersonnel_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);
ALTER TABLE cds.import_studysitepersonnel ADD CONSTRAINT import_studysitepersonnel_site_id_fkey
    FOREIGN KEY (container, site_id) REFERENCES cds.import_site (container, site_id);

ALTER TABLE cds.import_studypartgrouparmsubject ADD CONSTRAINT fk_armsubject_studysubject
    FOREIGN KEY (container, prot, subject_id) REFERENCES cds.import_studysubject (container, prot, subject_id);
ALTER TABLE cds.import_studypartgrouparmsubject ADD CONSTRAINT import_studypartgrouparmsubject_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_studysitefunction ADD CONSTRAINT import_studysitefunction_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);
ALTER TABLE cds.import_studysitefunction ADD CONSTRAINT import_studysitefunction_site_id_fkey
    FOREIGN KEY (container, site_id) REFERENCES cds.import_site (container, site_id);

ALTER TABLE cds.import_studyrelationship ADD CONSTRAINT fk_import_study_relationship_prot
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_studypersonnel ADD CONSTRAINT import_studypersonnel_person_id_fkey
    FOREIGN KEY (container, person_id) REFERENCES cds.import_personnel (container, person_id);
ALTER TABLE cds.import_studypersonnel ADD CONSTRAINT import_studypersonnel_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_studypartgrouparmvisitproduct ADD CONSTRAINT import_studypartgrouparmvisitproduct_product_id_fkey
    FOREIGN KEY (container, product_id) REFERENCES cds.import_product (container, product_id);
ALTER TABLE cds.import_studypartgrouparmvisitproduct ADD CONSTRAINT import_studypartgrouparmvisitproduct_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_studypartgrouparmproduct ADD CONSTRAINT import_studypartgrouparmproduct_product_id_fkey
    FOREIGN KEY (container, product_id) REFERENCES cds.import_product (container, product_id);
ALTER TABLE cds.import_studypartgrouparmproduct ADD CONSTRAINT import_studypartgrouparmproduct_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_productinsert ADD CONSTRAINT import_productinsert_product_id_fkey
    FOREIGN KEY (container, product_id) REFERENCES cds.import_product (container, product_id);
ALTER TABLE cds.import_productinsert ADD CONSTRAINT uq_import_productinsert
    UNIQUE (container, product_id, insert_id, clade_id);

ALTER TABLE cds.import_product ADD CONSTRAINT import_product_product_name_key
    UNIQUE (container, product_name);

ALTER TABLE cds.import_studypartgrouparmvisit ADD CONSTRAINT import_studypartgrouparmvisit_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_studypartgrouparm ADD CONSTRAINT import_studypartgrouparm_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_nabantigen ADD CONSTRAINT import_nabantigen_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier);

ALTER TABLE cds.import_icsantigen ADD CONSTRAINT import_icsantigen_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier);

ALTER TABLE cds.import_elispotantigen ADD CONSTRAINT import_elispotantigen_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier);

ALTER TABLE cds.import_bamaantigen ADD CONSTRAINT import_bamaantigen_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier);

ALTER TABLE cds.import_studysubject ADD CONSTRAINT import_studysubject_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_nab ADD CONSTRAINT import_nab_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier);
ALTER TABLE cds.import_nab ADD CONSTRAINT import_nab_lab_code_fkey
    FOREIGN KEY (container, lab_code) REFERENCES cds.import_lab (container, lab_code);
ALTER TABLE cds.import_nab ADD CONSTRAINT import_nab_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);



-- These tables have container that is project container
TRUNCATE
    cds.lab,
    cds.nabantigen,
    cds.icsantigen,
    cds.elispotantigen,
    cds.document,
    cds.bamaantigen,
    cds.publication,
    cds.properties,
    cds.product,
    cds.assay
RESTART IDENTITY CASCADE;

-- These tables have container that is subfolder (study) container
TRUNCATE
    cds.facts,
    cds.feedback,
    cds.gridbase,
    cds.sites,
    cds.study,
    cds.studyassay,
    cds.studydocument,
    cds.studygroup,
    cds.studygroupvisitmap,
    cds.studypartgrouparmproduct,
    cds.studyproductmap,
    cds.studypublication,
    cds.studyrelationship,
    cds.subjectproductmap,
    cds.treatmentarm,
    cds.treatmentarmsubjectmap,
    cds.visittagalignment,
    cds.visittagmap
RESTART IDENTITY CASCADE;

-- Drop FKs
ALTER TABLE cds.nabantigen DROP CONSTRAINT nabantigen_assay_identifier_fkey;
ALTER TABLE cds.icsantigen DROP CONSTRAINT icsantigen_assay_identifier_fkey;
ALTER TABLE cds.elispotantigen DROP CONSTRAINT elispotantigen_assay_identifier_fkey;
ALTER TABLE cds.bamaantigen DROP CONSTRAINT bamaantigen_assay_identifier_fkey;

ALTER TABLE cds.studypartgrouparmproduct DROP CONSTRAINT studypartgrouparmproduct_product_id_fkey;
ALTER TABLE cds.studypartgrouparmproduct DROP CONSTRAINT studypartgrouparmproduct_prot_fkey;
ALTER TABLE cds.studyrelationship DROP CONSTRAINT fk_study_relationship_prot;
ALTER TABLE cds.subjectproductmap DROP CONSTRAINT subjectproductmap_product_id_fkey;
ALTER TABLE cds.treatmentarmsubjectmap DROP CONSTRAINT treatmentarmsubjectmap_arm_id_fkey;
ALTER TABLE cds.visittagmap DROP CONSTRAINT visittagmap_arm_id_fkey;

-- Drop and Add PKs
ALTER TABLE cds.lab DROP CONSTRAINT pk_lab;
ALTER TABLE cds.lab ADD PRIMARY KEY (container, lab_code);

ALTER TABLE cds.nabantigen DROP CONSTRAINT pk_nabantigen;
ALTER TABLE cds.nabantigen ADD PRIMARY KEY (container, antigen_name, target_cell, antigen_type);

ALTER TABLE cds.icsantigen DROP CONSTRAINT pk_icsantigens;
ALTER TABLE cds.icsantigen ADD PRIMARY KEY (container, antigen_name, antigen_type);

ALTER TABLE cds.elispotantigen DROP CONSTRAINT pk_elispotantigen;
ALTER TABLE cds.elispotantigen ADD PRIMARY KEY (container, antigen_name, antigen_type);

ALTER TABLE cds.document DROP CONSTRAINT pk_document;
ALTER TABLE cds.document ADD PRIMARY KEY (container, document_id);

ALTER TABLE cds.bamaantigen DROP CONSTRAINT pk_bamaantigen;
ALTER TABLE cds.bamaantigen ADD PRIMARY KEY (container, antigen_name, antigen_type);

ALTER TABLE cds.publication DROP CONSTRAINT pk_publication;
ALTER TABLE cds.publication ADD PRIMARY KEY (container, id);

ALTER TABLE cds.product DROP CONSTRAINT pk_product;
ALTER TABLE cds.product DROP CONSTRAINT uq_product;
ALTER TABLE cds.product DROP CONSTRAINT product_product_name_key;
ALTER TABLE cds.product ADD PRIMARY KEY (container, product_id);
ALTER TABLE cds.product ADD CONSTRAINT product_product_name_key UNIQUE (container, product_name);

ALTER TABLE cds.assay DROP CONSTRAINT pk_assay;
ALTER TABLE cds.assay ADD PRIMARY KEY (container, assay_identifier);

ALTER TABLE cds.study DROP CONSTRAINT pk_study;
ALTER TABLE cds.study ADD PRIMARY KEY (container, study_name);

ALTER TABLE cds.studyassay DROP CONSTRAINT pk_studyassay;
ALTER TABLE cds.studyassay ADD PRIMARY KEY (container, prot, assay_identifier);

ALTER TABLE cds.studydocument DROP CONSTRAINT pk_studydocument;
ALTER TABLE cds.studydocument ADD PRIMARY KEY (container, prot, document_id);

ALTER TABLE cds.studypartgrouparmproduct DROP CONSTRAINT pk_studypartgrouparmproduct;
ALTER TABLE cds.studypartgrouparmproduct ADD PRIMARY KEY (container, prot, study_part, study_group, study_arm, product_id);

ALTER TABLE cds.studypublication DROP CONSTRAINT pk_studypublication;
ALTER TABLE cds.studypublication ADD PRIMARY KEY (container, prot, publication_id);

ALTER TABLE cds.studyrelationship DROP CONSTRAINT pk_studyrelationship;
ALTER TABLE cds.studyrelationship ADD PRIMARY KEY (container, prot, rel_prot);

ALTER TABLE cds.treatmentarm DROP CONSTRAINT pk_treatmentarm;
ALTER TABLE cds.treatmentarm ADD PRIMARY KEY (container, arm_id);

-- New fields to reference product properly
ALTER TABLE cds.studyproductmap ADD COLUMN projectContainer ENTITYID NOT NULL;
ALTER TABLE cds.studypartgrouparmproduct ADD COLUMN projectContainer ENTITYID NOT NULL;
ALTER TABLE cds.subjectproductmap ADD COLUMN projectContainer ENTITYID NOT NULL;

-- Add FKs
ALTER TABLE cds.nabantigen ADD CONSTRAINT nabantigen_assay_identifier_fkey FOREIGN KEY (container, assay_identifier) REFERENCES
    cds.assay (container, assay_identifier);

ALTER TABLE cds.icsantigen ADD CONSTRAINT icsantigen_assay_identifier_fkey FOREIGN KEY (container, assay_identifier) REFERENCES
    cds.assay (container, assay_identifier);

ALTER TABLE cds.elispotantigen ADD CONSTRAINT elispotantigen_assay_identifier_fkey FOREIGN KEY (container, assay_identifier) REFERENCES
    cds.assay (container, assay_identifier);

ALTER TABLE cds.bamaantigen ADD CONSTRAINT bamaantigen_assay_identifier_fkey FOREIGN KEY (container, assay_identifier) REFERENCES
    cds.assay (container, assay_identifier);

ALTER TABLE cds.studypartgrouparmproduct ADD CONSTRAINT studypartgrouparmproduct_product_id_fkey FOREIGN KEY (projectContainer, product_id) REFERENCES
    cds.product (container, product_id);
ALTER TABLE cds.studypartgrouparmproduct ADD CONSTRAINT studypartgrouparmproduct_prot_fkey FOREIGN KEY (container, prot) REFERENCES
    cds.study (container, study_name);

ALTER TABLE cds.studyproductmap ADD CONSTRAINT studyproductmap_product_id_fkey FOREIGN KEY (projectContainer, product_id) REFERENCES
    cds.product (container, product_id);

ALTER TABLE cds.studyrelationship ADD CONSTRAINT fk_study_relationship_prot FOREIGN KEY (container, prot) REFERENCES
    cds.study (container, study_name);

ALTER TABLE cds.subjectproductmap ADD CONSTRAINT subjectproductmap_product_id_fkey FOREIGN KEY (projectContainer, product_id) REFERENCES
    cds.product (container, product_id);

ALTER TABLE cds.treatmentarmsubjectmap ADD CONSTRAINT treatmentarmsubjectmap_arm_id_fkey FOREIGN KEY (container, arm_id) REFERENCES
    cds.treatmentarm (container, arm_id);

ALTER TABLE cds.visittagmap ADD CONSTRAINT visittagmap_arm_id_fkey FOREIGN KEY (container, arm_id) REFERENCES
    cds.treatmentarm (container, arm_id);
;
