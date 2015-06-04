SELECT
subject_id AS participantid,
CAST(study_day AS DOUBLE) AS sequencenum,
study_day AS visit_day,
prot || '|' || subject_id || '|' || study_day || '|' || assay_identifier || '|' || specimen_type || '|' || antigen_isolate_name || '|' || nab_lab_source_key AS third_key,
prot,

-- DIMENSIONS
assay_identifier,
specimen_type,
antigen_isolate_name,
antigen_isolate_clade,
antigen_neutralization_tier,

-- LOOKUPS
nab_lab_source_key AS lab,

-- MEASURES
nab_magnitude AS magnitude,
nab_response AS response_call

FROM cds.import_nab;