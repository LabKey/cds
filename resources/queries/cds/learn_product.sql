/*
 * Copyright (c) 2019 LabKey Corporation
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
-- Helper query for store\Study.js. Grabs all metadata for each product.
SELECT
       prod.*,
       mab.mab_mix_name_std
FROM cds.product prod
LEFT JOIN cds.MAbMixMetadata mab ON prod.mab_mix_id = mab.mab_mix_id AND prod.container = mab.container