SELECT *
FROM alignment ali
         JOIN donor_mab_sequence AS dms ON dms.sequence_id = ali.sequence_id