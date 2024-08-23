SELECT *
FROM cds.alignment a
    INNER JOIN cds.donor_mab_sequence dseq ON a.sequence_id = dseq.sequence_id
    INNER JOIN cds.mab_metadata mm ON dseq.mab_id = mm.mab_id