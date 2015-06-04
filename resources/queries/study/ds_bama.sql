SELECT
subject_id AS participantid,
CAST(study_day AS DOUBLE) AS sequencenum,
study_day AS visit_day,
prot || '|' || subject_id || '|' || study_day || '|' || assay_identifier || '|' || specimen_type || '|' || antigen || '|' || analyte || '|' || bama_magnitude_report_method || '|' || bama_lab_source_key AS third_key,
prot,

-- DIMENSIONS
assay_identifier,
specimen_type,
antigen,
analyte,
bama_magnitude_report_method AS magnitude_report_method,

-- MEASURES
bama_response AS response_call,
bama_magnitude AS magnitude

FROM cds.import_bama;