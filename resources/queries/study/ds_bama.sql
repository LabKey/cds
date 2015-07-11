SELECT
subject_id AS participantid,
CAST(study_day AS DOUBLE) AS sequencenum,
study_day AS visit_day,
prot,

-- DIMENSIONS
assay_identifier,
exp_assayid,
specimen_type,
antigen,
antibody_isotype,
summary_level,
protein,
protein_panel,
clade,
vaccine_matched,
detection_ligand,
instrument_code,
lab_code,
bama_lab_source_key,
dilution,

-- MEASURES
bama_response AS response_call,
mfi_delta,
mfi_delta_baseline,
mfi_raw,
mfi_raw_baseline,
mfi_blank,
mfi_blank_baseline,

FROM cds.import_bama;