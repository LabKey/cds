/*
 * Copyright (c) 2012-2013 LabKey Corporation
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
DELETE FROM cds.Facts             WHERE container  NOT IN (SELECT entityid FROM core.Containers);
DELETE FROM cds.Antigens          WHERE container  NOT IN (SELECT entityid FROM core.Containers);
DELETE FROM cds.CitableAuthors    WHERE container  NOT IN (SELECT entityid FROM core.Containers);
DELETE FROM cds.Citations         WHERE container  NOT IN (SELECT entityid FROM core.Containers);
DELETE FROM cds.Citable           WHERE container  NOT IN (SELECT entityid FROM core.Containers);
DELETE FROM cds.AssayPublications WHERE container  NOT IN (SELECT entityid FROM core.Containers);
DELETE FROM cds.Assays            WHERE container  NOT IN (SELECT entityid FROM core.Containers);
DELETE FROM cds.Labs              WHERE container  NOT IN (SELECT entityid FROM core.Containers);
DELETE FROM cds.Studies           WHERE container  NOT IN (SELECT entityid FROM core.Containers);
DELETE FROM cds.People            WHERE container  NOT IN (SELECT entityid FROM core.Containers);
