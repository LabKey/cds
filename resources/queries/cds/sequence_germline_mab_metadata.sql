SELECT * 
FROM cds.sequence_germline sg
    INNER JOIN cds.donor_mab_sequence dseq ON sg.sequence_id = dseq.sequence_id
    INNER JOIN cds.mab_metadata mm ON dseq.mab_id = mm.mab_id