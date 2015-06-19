SELECT
(prot || '-' || study_part || '-' || study_group || '-' || study_arm) AS arm_id,
containers.EntityId AS container,
study_part AS arm_part,
study_group AS arm_group,
study_arm AS arm_name,
study_randomization AS randomization,
study_arm_description AS description,
CASE WHEN (study_part IS NULL OR study_part = 'NA')
THEN (study_group || ', ' || study_arm || ', ' || study_randomization)
ELSE (study_part || ', ' || study_group || ', ' || study_arm || ', ' || study_randomization)
END AS coded_label,
-- study_arm_description_coded_label AS coded_label,
study_arm_last_exp_vacc_day AS last_day,
prot
FROM
cds.import_studypartgrouparm AS arm
JOIN core.containers AS containers ON (containers.name = arm.prot)