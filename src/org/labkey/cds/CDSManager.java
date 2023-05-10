/*
 * Copyright (c) 2014-2019 LabKey Corporation
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

package org.labkey.cds;

import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.CoreSchema;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.exp.ObjectProperty;
import org.labkey.api.exp.OntologyManager;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.exp.property.DomainProperty;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.ValidEmail;
import org.labkey.api.util.ContainerUtil;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.NotFoundException;
import org.labkey.cds.data.CSVCopyConfig;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CDSManager
{
    private static final CDSManager _instance = new CDSManager();

    private static final String CDS_ACTIVE_USER = "cdsActiveUser";

    private CDSManager()
    {
        // prevent external construction with a private default constructor
    }


    public static CDSManager get()
    {
        return _instance;
    }


    public void deleteFacts(Container c)
    {
        new SqlExecutor(CDSSchema.getInstance().getSchema()).execute("DELETE FROM cds.Facts WHERE Container = ?", c);
    }


    /**
     * Return string containing table names of uncleaned tables in schema
     * @param c
     * @return Comma delimited string showing tables with orphaned rows
     */
    private String orphanedRows(Container c) throws SQLException
    {
        List<String> hasOrphans = new ArrayList<>();
        for (String tableName : CDSSchema.getInstance().getSchema().getTableNames())
        {
            TableInfo t = CDSSchema.getInstance().getSchema().getTable(tableName);
            if (null != t.getColumn("container"))
            {
                if (new TableSelector(t, SimpleFilter.createContainerFilter(c), null).exists())
                    hasOrphans.add(tableName);
            }

        }
        return hasOrphans.size() > 0 ? StringUtils.join(hasOrphans, ", ") : null;
    }


    public void cleanContainer(Container c)
    {

        try
        {
            deleteFacts(c);
            DbSchema dbSchema = CDSSchema.getInstance().getSchema();

            for (String s : new String[] {
                    "nabantigen",
                    "icsantigen",
                    "elispotantigen",
                    "bamaantigen",
                    "mAbGridBase",
                    "GridBase",
                    "Sites",
                    "Feedback",
                    "Properties",
                    "VisitTagAlignment",
                    "VisitTagMap",
                    "StudyGroupVisitMap",
                    "StudyGroup",
                    "studymab",
                    "mabgroup",
                    "SubjectProductMap",
                    "StudyPartGroupArmProduct",
                    "StudyPartGroupArmVisitTime",
                    "StudyProductMap",
                    "TreatmentArmSubjectMap",
                    "TreatmentArm",
                    "mAbMetaGridBase",
                    "MAbMix",
                    "Product",
                    "StudyAssay",
                    "StudyDocument",
                    "AssayDocument",
                    "PublicationDocument",
                    "Document",
                    "StudyPublication",
                    "Publication",
                    "StudyRelationship",
                    "MAbMetadata",
                    "MAbMixMetadata",
                    "Study",
                    "Assay",
                    "Lab",
                    "antigenPanelMeta",
                    "antigenPanel",
                    "virusPanel",
                    "studyReport",
                    "studyCuratedGroup",
                    "publicationReport",
                    "publicationCuratedGroup",
                    "assayReport",
                    "virus_lab_id",
                    "virus_synonym",
                    "virus_metadata_all",
                    "assay_combined_antigen_metadata",

                    "import_nabmab",
                    "import_ics",
                    "import_els_ifng",
                    "import_bama",
                    "import_pkmab",
                    "import_nabmab",
                    "import_studysitepersonnel",
                    "import_studypartgrouparmsubject",
                    "import_studysitefunction",
                    "import_studyrelationship",
                    "import_studypublication",
                    "import_studyproduct",
                    "import_studypersonnel",
                    "import_studypartgrouparmvisitproduct",
                    "import_studypartgrouparmproduct",
                    "import_studydocument",
                    "import_assaydocument",
                    "import_studyassay",
                    "import_productinsert",
                    "import_studypartgrouparmvisittime",
                    "import_studypartgrouparmvisit",
                    "import_studypartgrouparm",
                    "import_studygroups",
                    "import_nabantigen",
                    "import_icsantigen",
                    "import_elispotantigen",
                    "import_bamaantigen",
                    "import_studysubject",
                    "import_mabmix",
                    "import_product",
                    "import_nab",
                    "import_assay",
                    "import_studyrelationshiporder",
                    "import_site",
                    "import_publicationDocument",
                    "import_publication",
                    "import_personnel",
                    "import_document",
                    "import_mabmetadata",
                    "import_mabmixmetadata",
                    "import_lab",
                    "import_study",
                    "import_antigenPanelMeta",
                    "import_antigenPanel",
                    "import_virusPanel",
                    "import_studyReport",
                    "import_studyCuratedGroup",
                    "import_publicationReport",
                    "import_publicationCuratedGroup",
                    "import_assayReport",
                    "import_virus_lab_id",
                    "import_virus_synonym",
                    "import_virus_metadata_all",
                    "import_assay_combined_antigen_metadata",

                    "sequence_header",
                    "sequence_germline",
                    "antibody_sequence",
                    "alignment",
                    "sequence",
                    "run_log",
                    "allele_sequence",
                    "antibody_class",
                    "preferred_allele"
            })
            {
                TableInfo t = dbSchema.getTable(s);
                if (null != t)
                {
                    ContainerUtil.purgeTable(t, c, null);
                }
            }
            String orphans;
            assert (orphans = orphanedRows(c)) == null : "Orphaned rows in tables: " + orphans;
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
    }


    public CDSController.PropertiesForm getProperties(Container container)
    {
        SQLFragment sql = new SQLFragment("SELECT * FROM cds.Properties WHERE Container = ?", container);
        return new SqlSelector(CDSSchema.getInstance().getSchema(), sql).getObject(CDSController.PropertiesForm.class);
    }


    public void resetActiveUserProperties(User user, Container container)
    {
        PropertyManager.getNormalStore().deletePropertySet(user, container, CDS_ACTIVE_USER);
    }


    public Map<String, String> getActiveUserProperties(User user, Container container)
    {
        return PropertyManager.getNormalStore().getProperties(user, container, CDS_ACTIVE_USER);
    }


    public void setActiveUserProperties(User user, Container container, Map<String, String> properties)
    {
        PropertyManager.PropertyMap activeUserProperties = PropertyManager.getWritableProperties(user, container, CDS_ACTIVE_USER, true);
        activeUserProperties.putAll(properties);
        activeUserProperties.save();
    }

    public boolean isStudyDocumentAccessible(String studyName, String docId, User user, Container container)
    {
        TableSelector selector = getDocumentsForStudiesTableSelector(studyName, docId, user, container);
        return selector.getObject(Boolean.class);
    }

    @NotNull
    private TableSelector getDocumentsForStudiesTableSelector(String studyName, String docId, User user, Container container)
    {
        TableInfo tableInfo = getCDSQueryTableInfo("learn_documentsforstudies", user, container);
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromParts("prot"), studyName);
        filter.addCondition(FieldKey.fromParts("document_id"), docId);

        return new TableSelector(tableInfo, Collections.singleton("accessible"), filter, null);
    }

    public boolean isParamValueValid(String studyName, String docId, User user, Container container)
    {
        TableSelector selector = getDocumentsForStudiesTableSelector(studyName, docId, user, container);

        if (null == selector.getObject(Boolean.class))
        {
            return false;
        }
        return selector.getObject(Boolean.class);
    }

    public static TableInfo getCDSQueryTableInfo(String queryName, User user, Container container)
    {
        QueryService queryService = QueryService.get();
        QueryDefinition qd = queryService.getQueryDef(user, container, "cds", queryName);

        ArrayList<QueryException> qerrors = new ArrayList<>();
        return qd.getTable(qerrors, true);
    }

    public String getStudyDocumentPath(Container container)
    {
        ModuleProperty mp = ModuleLoader.getInstance().getModule(CDSModule.class).getModuleProperties().get(CDSModule.STUDY_DOCUMENT_PATH);
        return PageFlowUtil.decode(mp.getEffectiveValue(container));
    }

    public String getAssayDocumentPath(Container container)
    {
        ModuleProperty mp = ModuleLoader.getInstance().getModule(CDSModule.class).getModuleProperties().get(CDSModule.ASSAY_DOCUMENT_PATH);
        return PageFlowUtil.decode(mp.getEffectiveValue(container));
    }

    public String getCDSImportFolderPath(Container container)
    {
        ModuleProperty mp = ModuleLoader.getInstance().getModule(CDSModule.class).getModuleProperties().get(CDSModule.CDS_IMPORT_PATH);
        return PageFlowUtil.decode(mp.getEffectiveValue(container));
    }

    public TableInfo getSiteUserTableInfo(User user)
    {
        UserSchema coreSchema = QueryService.get().getUserSchema(user, getUserTableContainer(), "core");
        TableInfo tableInfo = coreSchema.getTable("SiteUsers");
        if (tableInfo == null)
            throw new NotFoundException("SiteUsers table not available. You don't have permission to the project.");
        return tableInfo;
    }

    private Container getUserTableContainer()
    {
        return ContainerManager.getSharedContainer();
    }

    public boolean isNeedSurvey(User user)
    {
        String needSurveyProp = "NeedSurvey";
        Domain domain = getSiteUserTableInfo(user).getDomain();
        if (domain == null)
            return false;

        Map<String, DomainProperty> propsMap = new HashMap<>();
        for (DomainProperty dp : domain.getProperties())
            propsMap.put(dp.getName(), dp);

        if (propsMap.containsKey(needSurveyProp))
        {
            Map<String, Object> properties = OntologyManager.getProperties(getUserTableContainer(), user.getEntityId());
            String propertyUri = propsMap.get(needSurveyProp).getPropertyURI();
            if(properties.containsKey(propertyUri))
            {
                return (boolean) properties.get(propertyUri);
            }
        }
        return false;
    }

    public void setNeedSurvey(User user, boolean needSurvey) throws ValidEmail.InvalidEmailException, SQLException, BatchValidationException, InvalidKeyException, QueryUpdateServiceException, ValidationException
    {
        Domain domain = getSiteUserTableInfo(user).getDomain();
        if (domain == null)
            return;

        Map<String, DomainProperty> propsMap = new HashMap<>();
        for (DomainProperty dp : domain.getProperties())
            propsMap.put(dp.getName(), dp);

        updateUserSingleInfo(user.getEntityId(), propsMap, "NeedSurvey", needSurvey);
    }

    public void updateSurvey(User user, String firstName, String lastName, String institution, String role, String network, String researchArea, String referrer) throws SQLException, QueryUpdateServiceException, BatchValidationException, InvalidKeyException, ValidationException
    {
        //TODO simplify code once "Issue 34721: UsersTable permission handling improvement" is fixed
        updateUserName(user, firstName, lastName);

        Domain domain = getSiteUserTableInfo(user).getDomain();
        if (domain == null)
            return;

        Map<String, DomainProperty> propsMap = new HashMap<>();
        for (DomainProperty dp : domain.getProperties())
            propsMap.put(dp.getName(), dp);

        updateUserInfo(propsMap, user.getEntityId(), institution, role, network, researchArea, referrer);
    }

    public void updateUserName(User user, String firstName, String lastName)
    {
        SQLFragment sql = new SQLFragment("UPDATE core.usersdata ");
        sql.append(" SET firstname = ? , lastname = ? WHERE userid = ?;");
        sql.add(firstName);
        sql.add(lastName);
        sql.add(user.getUserId());

        new SqlExecutor(QueryService.get().getUserSchema(user, getUserTableContainer(), "core").getDbSchema()).execute(sql);
    }

    public synchronized void updateUserInfo(Map<String, DomainProperty> propMap, String userEntityId, String institution, String role, String network, String researchArea, String referrer) throws ValidationException
    {
        if (userEntityId == null)
            return;

        DbScope scope = CoreSchema.getInstance().getSchema().getScope();

        try (DbScope.Transaction transaction = scope.ensureTransaction())
        {
            updateUserSingleInfo(userEntityId, propMap, "NeedSurvey", null);
            updateUserSingleInfo(userEntityId, propMap, "Institution", institution);
            updateUserSingleInfo(userEntityId, propMap, "Role", role);
            updateUserSingleInfo(userEntityId, propMap, "Network", network);
            updateUserSingleInfo(userEntityId, propMap, "ResearchArea", researchArea);
            updateUserSingleInfo(userEntityId, propMap, "Referrer", referrer);

            transaction.commit();
        }

        UserManager.clearUserList(); // invalidate user cache, otherwise user won't exit out of survey
    }

    public void updateUserSingleInfo(String userEntityId, Map<String, DomainProperty> propMap, String propName, Object updatedValue) throws ValidationException
    {
        if (propMap.containsKey(propName))
        {
            DomainProperty prop = propMap.get(propName);
            Container container = getUserTableContainer();
            OntologyManager.deleteProperty(userEntityId, prop.getPropertyURI(), container, container);
            if (updatedValue != null)
            {
                ObjectProperty oProp = new ObjectProperty(userEntityId, container, prop.getPropertyURI(), updatedValue, prop.getPropertyDescriptor().getPropertyType());
                oProp.setPropertyId(prop.getPropertyId());
                OntologyManager.insertProperties(container, userEntityId, oProp);
            }
        }
    }
}