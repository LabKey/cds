SELECT 
DISTINCT ss.prot
FROM cds.import_studysubject AS ss
JOIN cds.import_study ON (import_study.prot = ss.prot);