SELECT
    aseq.mab_id,
    seqs.sequence_id,
    shed.header,
    hsrc.source,
    seqs.sequence_nt,
    aseq.lineage
FROM sequence seqs
         JOIN antibody_sequence AS aseq ON aseq.sequence_id = seqs.sequence_id
         JOIN sequence_header AS shed ON shed.sequence_id = seqs.sequence_id
         JOIN header_source AS hsrc ON hsrc.source_id = shed.source_id