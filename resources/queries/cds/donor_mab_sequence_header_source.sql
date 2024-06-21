SELECT seq.sequence_id,
       dms.mab_id,
       dms.donor_id,
       mab.mab_name_std,
       don.donor_code,
       sqh.header,
       src.source,
       seq.sequence_aa,
       seq.sequence_nt
FROM sequence seq
         JOIN donor_mab_sequence AS dms ON dms.sequence_id = seq.sequence_id
         JOIN sequence_header AS sqh ON sqh.sequence_id = seq.sequence_id
         JOIN header_source AS src ON src.source_id = sqh.source_id
         LEFT JOIN mabMetadata AS mab ON mab.mab_id = dms.mab_id
         LEFT JOIN donor_metadata AS don ON don.donor_id = dms.donor_id