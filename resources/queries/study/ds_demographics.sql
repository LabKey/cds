SELECT
-- KEYS
import_demographics.prot AS study_name,
import_demographics.subject_id AS participantid,

-- VARCHAR
import_demographics.subject_species AS species,
import_demographics.subject_subspecies AS subspecies,
import_demographics.subject_sex_at_birth AS sexatbirth,
import_demographics.subject_race_nih AS race,
import_demographics.subject_hispanic AS ethnicity,
import_demographics.subject_country_enrollment AS country,
import_demographics.subject_circumcised_enrollment AS circumcisionstatusenrollment,

-- INTEGER
import_demographics.subject_age_enrollment_years AS age,
-- import_demographics.subject_bmi_enrollment AS bmi,

FROM cds.import_studysubject AS import_demographics