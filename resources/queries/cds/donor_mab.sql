SELECT DISTINCT dms.mab_id,
                dms.donor_id
FROM donor_mab_sequence AS dms
WHERE dms.donor_id IS NOT NULL