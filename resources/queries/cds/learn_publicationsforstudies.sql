/*
 * Copyright (c) 2017-2019 LabKey Corporation
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
-- Helper query for store\Study.js. Grabs all metadata for each publication.
SELECT
  sp.prot,
  sp.publication_order,
  s.label AS "study_label",
  s.short_name AS "study_short_name",
  s.description,
  pub.*,
  COUNT(pd.document_id) AS available_data_count
FROM cds.ds_studypublication sp
LEFT JOIN publication pub
ON pub.id=sp.publication_id
LEFT JOIN cds.metadata.study s ON sp.prot=s.study_name
LEFT JOIN cds.publicationDocument pd ON sp.publication_id = pd.publication_id
GROUP BY sp.prot, sp.publication_order, s.label, s.short_name, s.description,
         pub.id, pub.container, pub.title, pub.author_all, pub.journal_short,
         pub.date, pub.volume, pub.issue, pub.location, pub.pmid, pub.link,
         pub.author_first, pub.publication_label, pub.publication_abstract
