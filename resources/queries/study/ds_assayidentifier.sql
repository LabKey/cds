/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

UNION

SELECT
  DISTINCT ds.assay_identifier as assay_identifier,
           'NABMAb' as dataset_name
from study.NABMAb as ds