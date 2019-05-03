package org.labkey.cds.query;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.BaseColumnInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.ContainerForeignKey;
import org.labkey.api.data.DatabaseTableType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.DefaultQueryUpdateService;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.FilteredTable;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.UserIdForeignKey;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.study.permissions.SharedParticipantGroupPermission;
import org.labkey.cds.CDSSchema;
import org.labkey.cds.CDSUserSchema;

import java.sql.SQLException;
import java.util.Map;

public class MabGroupTable extends FilteredTable<CDSUserSchema>
{
    public static final String NAME = "MabGroup";

    public MabGroupTable(@NotNull TableInfo table, @NotNull CDSUserSchema userSchema, ContainerFilter cf)
    {
        super(table, userSchema, cf);

        BaseColumnInfo rowId = addWrapColumn(_rootTable.getColumn("RowId"));
        rowId.setHidden(true);

        addWrapColumn(_rootTable.getColumn("Label"));
        addWrapColumn(_rootTable.getColumn("Description"));
        addWrapColumn(_rootTable.getColumn("Filters"));
        addWrapColumn(_rootTable.getColumn("Type"));
        addWrapColumn(_rootTable.getColumn("Shared"));
        addWrapColumn(_rootTable.getColumn("Created"));
        addWrapColumn(_rootTable.getColumn("Modified"));

        UserIdForeignKey.initColumn(addWrapColumn(getRealTable().getColumn(FieldKey.fromParts("CreatedBy"))));
        UserIdForeignKey.initColumn(addWrapColumn(getRealTable().getColumn(FieldKey.fromParts("ModifiedBy"))));

        ContainerForeignKey.initColumn(addWrapColumn(getRealTable().getColumn(FieldKey.fromParts("Container"))), userSchema);
    }

    @Override
    public DatabaseTableType getTableType()
    {
        return DatabaseTableType.TABLE;
    }

    @Override
    protected void applyContainerFilter(ContainerFilter filter)
    {
        FieldKey containerFieldKey = FieldKey.fromParts("Container");
        clearConditions(containerFieldKey);
        SQLFragment sql = new SQLFragment("(Shared = true OR CreatedBy = ");
        sql.append(getUserSchema().getUser().getUserId());
        sql.append(") AND ");
        sql.append(filter.getSQLFragment(getSchema(), new SQLFragment("Container"), getContainer()));
        addCondition(sql, containerFieldKey);
    }

    @Override
    public boolean hasPermission(@NotNull UserPrincipal user, @NotNull Class<? extends Permission> perm)
    {
        return _userSchema.getContainer().hasPermission(user, ReadPermission.class);
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return new MabGroupUpdateService(this);
    }

    public class MabGroupUpdateService extends DefaultQueryUpdateService
    {
        public MabGroupUpdateService(TableInfo queryTable)
        {
            super(queryTable, CDSSchema.getInstance().getSchema().getTable("mabgroup"));
        }

        @Override
        protected Map<String, Object> insertRow(User user, Container container, Map<String, Object> row) throws DuplicateKeyException, ValidationException, QueryUpdateServiceException, SQLException
        {
            validateUpdatePermission(user, container, row, false);
            validateShared(user, container, row);
            validateDuplicateLabel(user, container, row, true);
            return super.insertRow(user, container, row);
        }

        @Override
        protected Map<String, Object> updateRow(User user, Container container, Map<String, Object> row, @NotNull Map<String, Object> oldRow, boolean allowOwner, boolean retainCreation) throws InvalidKeyException, ValidationException, QueryUpdateServiceException, SQLException
        {
            validateUpdatePermission(user, container, row, false);
            validateShared(user, container, row);
            validateDuplicateLabel(user, container, row, false);
            return super.updateRow(user, container, row, oldRow, allowOwner, retainCreation);
        }

        @Override
        protected Map<String, Object> deleteRow(User user, Container container, Map<String, Object> oldRowMap) throws QueryUpdateServiceException, SQLException, InvalidKeyException
        {
            try
            {
                validateUpdatePermission(user, container, oldRowMap, true);
            }
            catch (ValidationException e)
            {
                throw new InvalidKeyException(e.getMessage());
            }
            return super.deleteRow(user, container, oldRowMap);
        }

        private void validateUpdatePermission(User user, Container container, Map<String, Object> row, boolean isDelete) throws ValidationException
        {
            if (!container.hasPermission(user, ReadPermission.class))
                throw new ValidationException("User does not have permission to mab group table");

            if (row.get("RowId") != null)
            {
                SimpleFilter filter = SimpleFilter.createContainerFilter(container);
                filter.addCondition(FieldKey.fromString("RowId"), row.get("RowId"));

                Map<String, Object>[] rows = new TableSelector(CDSSchema.getInstance().getTableInfoMabGroup(), filter, null).getMapArray();

                if (rows.length > 0)
                {
                    String action = isDelete ? "delete" : "update";
                    Map<String, Object> existingRow = rows[0];
                    Integer createdBy = (Integer) existingRow.get("CreatedBy");
                    if (createdBy != null && createdBy > 0 && user.getUserId() != createdBy)
                    {
                        boolean shared = (boolean) existingRow.get("Shared");
                        if (!shared)
                            throw new ValidationException("User does not have permission to " + action + " a private mab group created by a different user");
                        else
                        {
                            if (!container.hasPermission(user, SharedParticipantGroupPermission.class))
                                throw new ValidationException("User does not have permission to " + action + " a shared mab group created by a different user");
                            if (row.get("Shared") == null || row.get("Shared") == Boolean.FALSE)
                                throw new ValidationException("You must be the owner to unshare this mab group");
                        }
                    }
                }
            }
        }

        protected void validateDuplicateLabel(User user, Container container, Map<String, Object> row, boolean isNew) throws ValidationException
        {
            SimpleFilter filter = SimpleFilter.createContainerFilter(container);
            filter.addCondition(FieldKey.fromString("Label"), row.get("Label"));
            if (!isNew)
                filter.addCondition(FieldKey.fromString("RowId"), row.get("RowId"), CompareType.NEQ);

            Map<String, Object>[] rows = new TableSelector(CDSSchema.getInstance().getTableInfoMabGroup(), filter, null).getMapArray();

            for (Map<String, Object> existingRow : rows)
            {
                if (Boolean.TRUE.equals(existingRow.get("Shared")) || (int) existingRow.get("CreatedBy") == user.getUserId())
                    throw new ValidationException("There is already a mab group named '" + row.get("Label") + "'. Please choose a unique name.");
            }
        }

        protected void validateShared(User user, Container container, Map<String, Object> row) throws ValidationException
        {
            Boolean shared = (Boolean) row.get("Shared");
            if (shared != null && shared == Boolean.TRUE && !container.hasPermission(user, SharedParticipantGroupPermission.class))
                throw new ValidationException("User does not have permission to share a mab group");
        }

        // all readers can insert, update, delete
        @Override
        protected void setSpecialColumns(Container container, Map<String,Object> row, User user, Class<? extends Permission> clazz)
        {
            if (null != container)
            {
                //Issue 15301: allow workbooks records to be deleted/updated from the parent container
                if (row.get("container") != null)
                {
                    Container rowContainer = UserSchema.translateRowSuppliedContainer(row.get("container"), container, user, getQueryTable(), ReadPermission.class);
                    if (rowContainer != null && container.allowRowMutationForContainer(rowContainer))
                    {
                        row.put("container", rowContainer.getId()); //normalize to container ID
                        return;  //accept the row-provided value
                    }
                }
                row.put("container", container.getId());
            }
        }
    }
}
