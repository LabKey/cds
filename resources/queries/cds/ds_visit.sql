SELECT
DISTINCT study_day,
'Day ' || study_day AS label,
CAST(study_day AS DOUBLE) AS protocolday,
CAST(study_day AS DOUBLE) AS sequencenummin,
CAST(study_day AS DOUBLE) AS sequencenummax,
-- TRUE AS showbydefault,
-- 0 AS displayorder,
-- 0 AS chronologicalorder,
'normal' AS sequencenumhandling,
prot
FROM cds.import_studypartgrouparmvisit;