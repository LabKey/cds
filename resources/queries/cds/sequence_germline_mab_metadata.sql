SELECT * 
FROM cds.sequence_germline sg
    INNER JOIN cds.antibody_sequence aseq ON sg.sequence_id = aseq.sequence_id
    INNER JOIN cds.MAbMetadata mm ON aseq.mab_id = mm.mab_id