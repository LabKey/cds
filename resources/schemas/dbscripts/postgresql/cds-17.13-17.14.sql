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
-- titer_ID50, titer_ID80, nab_response_ID50, nab_response_ID80, slope --
ALTER TABLE cds.import_nab ADD COLUMN titer_ID50 NUMERIC(15,4);
ALTER TABLE cds.import_nab ADD COLUMN titer_ID80 NUMERIC(15,4);
ALTER TABLE cds.import_nab ADD COLUMN titer_response_ID50 BOOLEAN;
ALTER TABLE cds.import_nab ADD COLUMN titer_response_ID80 BOOLEAN;
ALTER TABLE cds.import_nab ADD COLUMN slope NUMERIC(15,4);

-- mfi_bkgd, auc --
ALTER TABLE cds.import_bama ADD COLUMN mfi_bkgd NUMERIC(15, 4);
ALTER TABLE cds.import_bama ADD COLUMN auc NUMERIC(15, 4);