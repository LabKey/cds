-- Helper query for store\Study.js. Grabs all metadata for each product.
SELECT
spm.study_name,
p.*,
FROM cds.studyproductmap spm
JOIN cds.product p ON spm.product_id=p.product_id