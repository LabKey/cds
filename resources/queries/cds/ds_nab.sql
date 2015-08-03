SELECT
subject_id AS participantid,
CAST(study_day AS DOUBLE) AS sequencenum,
study_day AS visit_day,
prot,
assay_identifier,

-- DIMENSIONS
summary_level,
specimen_type,
antigen,
antigen_type,
neutralization_tier,
clade,
neutralization_tier || '|' || clade || '|' || virus AS tier_clade_virus,
vaccine_matched,
target_cell,
initial_dilution,
virus,
virus_type,
virus_insert_name,

-- LOOKUPS
nab_lab_source_key,
exp_assayid,
lab_code,

-- MEASURES
nab_response AS response_call,
titer_ic50,
titer_ic80,

FROM cds.import_nab;