/*
 * Copyright (c) 2015-2018 LabKey Corporation
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
  assay_endpoint_statistical_analysis
 FROM cds.import_assay as IA
 INNER JOIN (
              SELECT DISTINCT
                assay_identifier,
                assay_type
              FROM cds.ds_subjectassay

              UNION
              SELECT DISTINCT
                assay_identifier,
                'NABMAb'
              FROM cds.ds_nabmab

            ) AS SA ON IA.assay_identifier=SA.assay_identifier;