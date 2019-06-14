/*
 * Copyright (c) 2018-2019 LabKey Corporation
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
CREATE TABLE cds.mabgroup (
  RowId SERIAL,
  Container ENTITYID NOT NULL,
  Label VARCHAR(250) NOT NULL,
  Description TEXT,
  Type VARCHAR(250),
  Filters TEXT,
  Shared BOOLEAN DEFAULT FALSE,

  Created TIMESTAMP NOT NULL,
  CreatedBy USERID NOT NULL,
  Modified TIMESTAMP NOT NULL,
  ModifiedBy USERID NOT NULL,

  CONSTRAINT pk_mabgroup PRIMARY KEY (container, rowId)
);