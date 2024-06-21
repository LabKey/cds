SELECT dms.mab_id,
       dms.donor_id,
       sgl.sequence_id,
       sgl.allele,
       sgl.percent_identity,
       sgl.matches,
       sgl.alignment_length,
       sgl.score,
       sgl.container,
       sgl.run_application
FROM sequence_germline AS sgl
         JOIN donor_mab_sequence AS dms ON dms.sequence_id = sgl.sequence_id