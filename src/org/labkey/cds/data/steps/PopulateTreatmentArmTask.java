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
package org.labkey.cds.data.steps;

import org.apache.log4j.Logger;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.ContainerFilterable;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.ValidationException;
import org.labkey.api.util.DateUtil;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class PopulateTreatmentArmTask extends AbstractPopulateTask
{
    @Override
    protected void populate(Logger logger) throws PipelineJobException
    {
        BatchValidationException errors = new BatchValidationException();

        logger.info("Starting populate treatment arms.");
        long start = System.currentTimeMillis();
        for (Container container : project.getChildren())
        {
            QuerySchema cdsSchema = DefaultSchema.get(user, container).getSchema("cds");

            if (cdsSchema == null)
                throw new PipelineJobException("Unable to find cds schema for folder " + container.getPath());

            TableInfo treatmentArmSource = cdsSchema.getTable("ds_treatmentarm");
            TableInfo treatmentArmTarget = cdsSchema.getTable("treatmentarm");

            QueryUpdateService TreatmentArmTargetService = treatmentArmTarget.getUpdateService();

            if (TreatmentArmTargetService == null)
                throw new PipelineJobException("Unable to find update service for cds.treatmentarm in " + container.getPath());

            // Delete Treatment Arms
            try
            {
                TreatmentArmTargetService.truncateRows(user, container, null, null);
            }
            catch (Exception e)
            {
                logger.error(e.getMessage(), e);
            }

            if (errors.hasErrors())
            {
                for (ValidationException error : errors.getRowErrors())
                {
                    logger.error(error.getMessage());
                }
                return;
            }

            // Insert Treatment Arms
            SQLFragment treatmentArmSql = new SQLFragment("SELECT * FROM ").append(treatmentArmSource).append(" WHERE prot = ?");
            treatmentArmSql.add(container.getName());

            Map<String, Object>[] treatmentArmRows = new SqlSelector(treatmentArmSource.getSchema(), treatmentArmSql).getMapArray();
            if (treatmentArmRows.length > 0)
            {
                try
                {
                    treatmentArmTarget.getUpdateService().insertRows(user, container, Arrays.asList(treatmentArmRows), errors, null, null);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(), e);
                }
            }

            if (errors.hasErrors())
            {
                for (ValidationException error : errors.getRowErrors())
                {
                    logger.error(error.getMessage());
                }
                return;
            }

            // Insert Treatment Arm Subject Mappings
            SQLFragment treatmentArmsMapSql = new SQLFragment("SELECT TA.arm_id, ITS.subject_id AS participantId, ITS.prot\n");
            treatmentArmsMapSql.append("FROM (SELECT * FROM cds.import_studypartgrouparmsubject WHERE container = ? AND prot = ?) AS ITS\n")
                    .add(project)
                    .add(container.getName())
                    .append("INNER JOIN (SELECT * FROM cds.treatmentarm WHERE container = ?) AS TA\n")
                    .add(container)
                    .append("ON (TA.arm_part = ITS.study_part AND TA.arm_group = ITS.study_group AND TA.arm_name = ITS.study_arm)\n");

            TableInfo treatmentArmsMapTarget = cdsSchema.getTable("treatmentarmsubjectmap");

            QueryUpdateService treatmentArmsMapTargetService = treatmentArmsMapTarget.getUpdateService();

            if (treatmentArmsMapTargetService == null)
                throw new PipelineJobException("Unable to find update service for cds.treatmentarmsubjectmap in " + container.getPath());

            Map<String, Object>[] treatmentArmsMapRows = new SqlSelector(cdsSchema.getDbSchema(), treatmentArmsMapSql).getMapArray();
            if (treatmentArmsMapRows.length > 0)
            {
                try
                {
                    treatmentArmsMapTargetService.insertRows(user, container, Arrays.asList(treatmentArmsMapRows), errors, null, null);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(), e);
                }
            }

            if (errors.hasErrors())
            {
                for (ValidationException error : errors.getRowErrors())
                {
                    logger.error(error.getMessage());
                }
                return;
            }
        }
        long finish = System.currentTimeMillis();

        logger.info("Populate treatment arms took " + DateUtil.formatDuration(finish - start) + ".");

        //
        // Populate Visit Tags (Project level only)
        //
        start = System.currentTimeMillis();
        QuerySchema studySchema = DefaultSchema.get(user, project).getSchema("study");

        if (studySchema == null)
            throw new PipelineJobException("Unable to find study schema for project " + project.getPath());

        QuerySchema projectCdsSchema = DefaultSchema.get(user, project).getSchema("cds");

        if (projectCdsSchema == null)
            throw new PipelineJobException("Unable to find cds schema for project " + project.getPath());

        TableInfo visitTagSourceTable = projectCdsSchema.getTable("ds_visittag");
        TableInfo visitTagTargetTable = studySchema.getTable("visittag");
        QueryUpdateService visitTagTargetService = visitTagTargetTable.getUpdateService();

        if (visitTagTargetService == null)
            throw new PipelineJobException("Unable to find update service for study.visittag in project " + project.getPath());

        SQLFragment visitTagSql = new SQLFragment("SELECT * FROM ").append(visitTagSourceTable);

        Map<String, Object>[] visitTagRows = new SqlSelector(visitTagSourceTable.getSchema(), visitTagSql).getMapArray();
        if (visitTagRows.length > 0)
        {
            try
            {
                visitTagTargetService.insertRows(user, project, Arrays.asList(visitTagRows), errors, null, null);
            }
            catch (Exception e)
            {
                logger.error(e.getMessage(), e);
            }
        }

        if (errors.hasErrors())
        {
            for (ValidationException error : errors.getRowErrors())
            {
                logger.error(error.getMessage());
            }
            return;
        }

        //
        // Populate Visit Tag Map
        //
        for (Container container : project.getChildren())
        {
            QuerySchema cdsSchema = DefaultSchema.get(user, container).getSchema("cds");

            if (cdsSchema == null)
                throw new PipelineJobException("Unable to find cds schema for folder " + container.getPath());

            TableInfo visitTagMapTarget = cdsSchema.getTable("visittagmap");
            QueryUpdateService visitTagMapTargetService = visitTagMapTarget.getUpdateService();

            if (visitTagMapTargetService == null)
                throw new PipelineJobException("Unable to find update service for cds.visittagmap in folder " + container.getPath());

            // Get all rows from this query and then set visit_tag and single_use before inserting
            // Some rows in import_studypartgrouparmvisit map to multiple rows in the target
            SQLFragment visitTagMapSql = new SQLFragment("SELECT DISTINCT visit.rowid AS visit_row_id,\n");
            visitTagMapSql.append("studygroup.row_id AS study_group_id,\n")
                    .append("arm_visit.study_arm,\n")
                    .append("arm_visit.prot || '-' || arm_visit.study_part || '-' || arm_visit.study_group || '-' || arm_visit.study_arm AS arm_id,\n")
                    .append("arm_visit.prot,\n")
                    .append("arm_visit.study_arm_visit_label AS visit_tag_label,\n")
                    .append("arm_visit.isvaccvis AS is_vaccination,\n")
                    .append("arm_visit.ischallvis AS is_challenge,\n")
                    .append("arm_visit.study_arm_visit_detail_label AS detail_label,\n")
                    .append("arm_visit.study_arm_visit_type,\n")
                    .append("arm_visit.enrollment,\n")
                    .append("arm_visit.lastvacc,\n")
                    .append("arm_visit.firstvacc\n")
                    .append("FROM (SELECT * FROM cds.import_studypartgrouparmvisit WHERE container = ? AND prot = ?) AS arm_visit\n")
                    .add(project)
                    .add(container.getName())
                    .append("INNER JOIN (SELECT * FROM cds.studygroup WHERE container = ?) AS studygroup\n")
                    .add(container)
                    .append("ON (studygroup.group_name = arm_visit.study_group)\n")
                    .append("INNER JOIN (SELECT * FROM study.visit WHERE container = ?) AS visit\n")
                    .add(container)
                    .append("ON (visit.sequencenummin = CAST(arm_visit.study_day AS DOUBLE PRECISION))");

            List<Map<String, Object>> visitTagMapRows = new ArrayList<>();
            new SqlSelector(cdsSchema.getDbSchema(), visitTagMapSql).getMapCollection().forEach(row -> {
                String study_arm_visit_type = (String)row.get("study_arm_visit_type");
                if (null != study_arm_visit_type && !"Placeholder".equalsIgnoreCase(study_arm_visit_type))
                {
                    Map<String, Object> newRow = new CaseInsensitiveHashMap<>(row);
                    newRow.put("visit_tag", study_arm_visit_type);
                    newRow.put("single_use", false);
                    visitTagMapRows.add(newRow);
                }
                if ((Boolean)row.get("enrollment"))
                {
                    Map<String, Object> newRow = new CaseInsensitiveHashMap<>(row);
                    newRow.put("visit_tag", "Enrollment");
                    newRow.put("single_use", true);
                    visitTagMapRows.add(newRow);
                }
                if ((Boolean)row.get("lastvacc"))
                {
                    Map<String, Object> newRow = new CaseInsensitiveHashMap<>(row);
                    newRow.put("visit_tag", "Last Vaccination");
                    newRow.put("single_use", true);
                    visitTagMapRows.add(newRow);
                }
                if ((Boolean)row.get("firstvacc"))
                {
                    Map<String, Object> newRow = new CaseInsensitiveHashMap<>(row);
                    newRow.put("visit_tag", "First Vaccination");
                    newRow.put("single_use", true);
                    visitTagMapRows.add(newRow);
                }
            });
            if (visitTagMapRows.size() > 0)
            {
                try
                {
                    visitTagMapTargetService.insertRows(user, container, visitTagMapRows, errors, null, null);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(), e);
                }
            }

            if (errors.hasErrors())
            {
                for (ValidationException error : errors.getRowErrors())
                {
                    logger.error(error.getMessage());
                }
                return;
            }

            // Insert Visit Tag Alignment
            TableInfo visitTagAlignTarget = cdsSchema.getTable("visittagalignment");
            QueryUpdateService visitTagAlignTargetService = visitTagAlignTarget.getUpdateService();
            if (visitTagAlignTargetService == null)
                throw new PipelineJobException("Unable to find update service for cds.visittagalignment in " + container.getPath());

            TableInfo visitTagAlignSource = cdsSchema.getTable("ds_visittagalignment");
            ((ContainerFilterable) visitTagAlignSource).setContainerFilter(new ContainerFilter.CurrentAndSubfolders(user));
            SQLFragment visitTagAlignSql = new SQLFragment("SELECT * FROM ").append(visitTagAlignSource);

            Map<String, Object>[] visitTagAlignRows = new SqlSelector(visitTagAlignSource.getSchema(), visitTagAlignSql).getMapArray();
            if (visitTagAlignRows.length > 0)
            {
                try
                {
                    visitTagAlignTargetService.insertRows(user, container, Arrays.asList(visitTagAlignRows), errors, null, null);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(), e);
                }
            }

            if (errors.hasErrors())
            {
                for (ValidationException error : errors.getRowErrors())
                {
                    logger.error(error.getMessage());
                }
                return;
            }
        }
        finish = System.currentTimeMillis();

        logger.info("Populate visit tags took " + DateUtil.formatDuration(finish - start) + ".");

        start = System.currentTimeMillis();
        for (Container container : project.getChildren())
        {
            QuerySchema cdsSchema = DefaultSchema.get(user, container).getSchema("cds");

            if (cdsSchema == null)
                throw new PipelineJobException("Unable to find cds schema for folder " + container.getPath());

            TableInfo subjectProductSource = cdsSchema.getTable("ds_subjectproduct");
            TableInfo subjectProductTarget = cdsSchema.getTable("SubjectProductMap");

            QueryUpdateService subjectProductTargetService = subjectProductTarget.getUpdateService();

            if (subjectProductTargetService == null)
                throw new PipelineJobException("Unable to find update service for cds.SubjectProductMap in " + container.getPath());

            // Insert Subject Product Mapping
            String columnsStr = "product_id, participantid, insert_name, clade_name, prot, projectContainer";
            SQLFragment subjectProductSql = new SQLFragment("SELECT " + columnsStr + "  FROM ").append(subjectProductSource).append(" WHERE prot = ?");
            subjectProductSql.add(container.getName());

            Map<String, Object>[] insertRows = new SqlSelector(subjectProductSource.getSchema(), subjectProductSql).getMapArray();
            if (insertRows.length > 0)
            {
                try
                {
                    subjectProductTargetService.insertRows(user, container, Arrays.asList(insertRows), errors, null, null);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(), e);
                }
            }

            if (errors.hasErrors())
            {
                for (ValidationException error : errors.getRowErrors())
                {
                    logger.error(error.getMessage());
                }
                return;
            }
        }
        finish = System.currentTimeMillis();

        logger.info("Populate SubjectProductMap took " + DateUtil.formatDuration(finish - start) + ".");

        start = System.currentTimeMillis();
        for (Container container : project.getChildren())
        {
            QuerySchema cdsSchema = DefaultSchema.get(user, container).getSchema("cds");

            if (cdsSchema == null)
                throw new PipelineJobException("Unable to find cds schema for folder " + container.getPath());

            TableInfo studyPartGroupSource = cdsSchema.getTable("ds_studypartgrouparmproduct");
            TableInfo studyPartGroupTarget = cdsSchema.getTable("StudyPartGroupArmProduct");

            QueryUpdateService studyPartGroupTargetService = studyPartGroupTarget.getUpdateService();

            if (studyPartGroupTargetService == null)
                throw new PipelineJobException("Unable to find update service for cds.StudyPartGroupArmProduct in " + container.getPath());

            // Insert Subject Product Mapping
            String columnsStr = "prot, study_part, study_group, study_arm, product_id, projectContainer";
            SQLFragment studyPartSql = new SQLFragment("SELECT " + columnsStr + " FROM ").append(studyPartGroupSource).append(" WHERE prot = ?");
            studyPartSql.add(container.getName());

            Map<String, Object>[] insertRows = new SqlSelector(studyPartGroupSource.getSchema(), studyPartSql).getMapArray();
            if (insertRows.length > 0)
            {
                try
                {
                    studyPartGroupTargetService.insertRows(user, container, Arrays.asList(insertRows), errors, null, null);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(), e);
                }
            }

            if (errors.hasErrors())
            {
                for (ValidationException error : errors.getRowErrors())
                {
                    logger.error(error.getMessage());
                }
                return;
            }
        }
        finish = System.currentTimeMillis();

        logger.info("Populate StudyPartGroupArmProduct took " + DateUtil.formatDuration(finish - start) + ".");
    }
}
