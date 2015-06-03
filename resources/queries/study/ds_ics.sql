SELECT
subject_id AS participantid,
CAST(study_day AS DOUBLE) AS sequencenum,
study_day AS visit_day,
prot || '|' || subject_id || '|' || study_day || '|' || specimen_type || '|' || assay_identifier || '|' || cell_type || '|' || antigen_panel || '|' || functional_marker_name || '|' || ics_lab_source_key AS third_key,
prot,

-- DIMENSIONS
specimen_type,
assay_identifier,
cell_type,
antigen_panel,
functional_marker_name,

-- LOOKUPS
ics_lab_source_key AS lab,

-- MEASURES
ics_magnitude AS magnitude,
ics_magnitude_raw AS magnitude_raw,
ics_magnitude_background AS magnitude_background

FROM cds.import_ics;