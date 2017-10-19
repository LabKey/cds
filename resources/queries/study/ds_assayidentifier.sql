SELECT
  DISTINCT ds.assay_identifier as assay_identifier,
  'BAMA' as dataset_name
from study.BAMA as ds

UNION

SELECT
  DISTINCT ds.assay_identifier as assay_identifier,
  'ELISPOT' as dataset_name
from study.ELISPOT as ds

UNION

SELECT
  DISTINCT ds.assay_identifier as assay_identifier,
  'ICS' as dataset_name
from study.ICS as ds

UNION

SELECT
  DISTINCT ds.assay_identifier as assay_identifier,
  'NAb' as dataset_name
from study.NAb as ds