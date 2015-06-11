SELECT
DISTINCT(study_group || ' - ' || study_randomization) AS label,
0 AS subjectcount, -- TODO: Calculate the subject count
prot
FROM
cds.import_studypartgrouparm;