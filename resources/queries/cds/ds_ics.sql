SELECT
subject_id AS participantid,
CAST(study_day AS DOUBLE) AS sequencenum,
study_day AS visit_day,
prot,
assay_identifier,

-- DIMENSIONS
summary_level,
specimen_type,
cell_type,
cell_name,
antigen,
antigen_type,
protein_panel,
protein,
peptide_pool,
protein_panel || '|' || protein AS protein_panel_protein,
protein_panel || '|' || protein || '|' || peptide_pool AS protein_panel_protein_peptide_pool,
functional_marker_name,
functional_marker_type,
clade,
vaccine_matched,

-- LOOKUPS
ics_lab_source_key,
exp_assayid,
lab_code,

-- MEASURES
ics_response AS response_call,
pctpos,
pctpos_adj,
pctpos_neg,

FROM cds.import_ics;