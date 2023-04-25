SELECT *
FROM cds.alignment a
    INNER JOIN cds.antibody_sequence aseq ON a.sequence_id = aseq.sequence_id
    INNER JOIN cds.MAbMetadata mm ON aseq.mab_id = mm.mab_id