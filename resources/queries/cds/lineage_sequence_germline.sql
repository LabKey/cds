SELECT
    aseq.mab_id,
    sgrm.allele,
    sgrm.sequence_id,
    sgrm.percent_identity,
    sgrm.matches,
    sgrm.alignment_length,
    sgrm.score,
    sgrm.run_application,
    pref.status AS preferred_status,
    aseq.lineage
FROM sequence_germline AS sgrm
         JOIN antibody_sequence AS aseq ON sgrm.sequence_id = aseq.sequence_id
         LEFT JOIN preferred_allele AS pref ON pref.sequence_id = sgrm.sequence_id AND pref.allele = sgrm.allele