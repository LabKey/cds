SELECT
-- KEYS
import_study.prot AS study_name,
containers.EntityId AS container,

-- VARCHAR
import_study.network,
import_study.study_label AS label,
import_study.study_short_name AS short_name,
import_study.study_title AS title,
import_study.study_type AS type,
import_study.study_status AS status,
import_study.study_stage AS stage,
import_study.study_population AS population,
import_study.study_species AS species,

-- DATE
import_study.study_first_enr_date AS first_enr_date,
import_study.study_fu_complete_date AS followup_complete_date,
import_study.study_start_date AS start_date,
import_study.study_public_date AS public_date,

-- TEXT
import_study.study_rationale AS rationale,
import_study.study_description AS description,
import_study.study_hypothesis AS hypothesis,
import_study.study_objectives AS objectives,
import_study.study_methods AS methods,
import_study.study_findings AS findings,
import_study.study_discussion AS discussion,
import_study.study_context AS context

FROM cds.import_study AS import_study
JOIN core.containers AS containers ON (containers.name = import_study.prot)