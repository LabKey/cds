-- Query for studies with either product or assay data associated with it, used by the learn group store
-- to get the list of studies for the group summary pages

SELECT DISTINCT g.study_name,
                g.study_label,
                g.description,
                g.has_data
FROM (SELECT s.study_name,
             s.label AS study_label,
             s.description,
             CASE
                 WHEN (afs.has_data IS NULL AND pfs.has_data IS NULL) THEN false
                 WHEN (afs.has_data IS NULL) THEN pfs.has_data
                 WHEN (pfs.has_data IS NULL) THEN afs.has_data
                 ELSE (afs.has_data OR pfs.has_data)
                 END AS has_data

      FROM cds.study s
               LEFT JOIN cds.learn_productsforstudies pfs
                         ON s.study_name = pfs.study_name
               LEFT JOIN cds.learn_assaysforstudies afs ON s.study_name = afs.prot) g

GROUP BY g.study_name, g.study_label, g.description, g.has_data
