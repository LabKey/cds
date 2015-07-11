SELECT
subject_id AS participantid,
CAST(study_day AS DOUBLE) AS sequencenum,
study_day AS visit_day,
prot,

-- DIMENSIONS
summary_level,
specimen_type,
assay_identifier,
antigen,
cell_type,
cell_name,
clade,
protein,
protein_panel,
vaccine_matched,
functional_marker_name,
functional_marker_type,

-- LOOKUPS
els_ifng_lab_source_key,
lab_code,
exp_assayid,

-- MEASURES
els_ifng_response AS response_call,
mean_sfc,
mean_sfc_neg,
mean_sfc_raw,

FROM cds.import_ELS_IFNg;