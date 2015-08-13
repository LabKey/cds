SELECT
  IA.assay_identifier,
  assay_type,
  assay_label,
  assay_short_name,
  assay_category,
  assay_detection_platform,
  assay_body_system_type,
  assay_body_system_target,
  assay_general_specimen_type,
  assay_description,
  assay_method_description,
  assay_endpoint_description,
  assay_endpoint_statistical_analysis,
 FROM cds.import_assay as IA
 INNER JOIN (SELECT DISTINCT
  assay_identifier,
  assay_type
  FROM cds.ds_subjectassay) AS SA ON IA.assay_identifier=SA.assay_identifier;