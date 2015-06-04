SELECT
subject_id AS participantid,
CAST(study_day AS DOUBLE) AS sequencenum,
study_day AS visit_day,
prot || '|' || subject_id || '|' || study_day || '|' || specimen_type || '|' || assay_identifier || '|' || antigen || '|' || cell_type || '|' || functional_marker_name || '|' || els_ifng_lab_source_key AS third_key,
prot,

-- DIMENSIONS
specimen_type,
assay_identifier,
antigen,
cell_type,
functional_marker_name,

-- LOOKUPS
els_ifng_lab_source_key AS lab,

-- MEASURES
els_ifng_magnitude AS magnitude,
els_ifng_magnitude_raw AS magnitude_raw,
els_ifng_magnitude_background AS magnitude_background,
els_ifng_response AS response_call

FROM cds.import_ELS_IFNg;