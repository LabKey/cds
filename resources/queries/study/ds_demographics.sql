SELECT
  -- KEYS
  dd.prot AS study_name,
  dd.subject_id AS participantid,

  -- VARCHAR
  dd.subject_species AS species,
  dd.subject_subspecies AS subspecies,
  dd.subject_sex_at_birth AS sexatbirth,
  dd.subject_race_nih AS race,
  dd.subject_hispanic AS ethnicity,
  dd.subject_country_enrollment AS country,
  dd.subject_circumcised_enrollment AS circumcisionstatusenrollment,

  -- INTEGER
  CAST(ROUND(10 * Floor(dd.subject_age_enrollment_years / 10.0)) AS INTEGER) AS agegroup,
  dd.subject_age_enrollment_years AS age
  -- import_demographics.subject_bmi_enrollment AS bmi,
FROM cds.import_studysubject AS dd