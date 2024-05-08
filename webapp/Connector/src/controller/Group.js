/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Group', {
    extend: 'Connector.controller.AbstractViewController',

    views: ['GroupSave', 'GroupSummary', 'MabGroupSummary'],

    constructor: function(config) {
        Ext.applyIf(config, {
            selected: []
        });
        this.callParent([config]);
    },

    init : function() {

        this.control('grouplistview', {
            itemclick: function(v, grp, item) {
                Animation.floatTo(item,
                        'div.grouplabel',
                        ['.selectionpanel', '.filterpanel', '.filterstatus .emptytext'],
                        'div', 'grouprow');

                // itemclick event automatically uses the store's index to get the 'grp' value,
                // however, on the Home page we are only displaying 5 groups at a time, first under 'My Saved Groups' and then under 'Curated groups' section,
                // and if more than 5 groups are present under 'My Saved Groups', then this index will be incorrect for the Groups listed under 'Curated groups'
                // since both the sections share one store. For this reason, we will get the label from the clicked item and find the corresponding
                // record based on the label as done below.

                // Access the label from the clicked item with selector 'grouprow'
                var label = item.firstChild.getAttribute('data-label');

                // Find the corresponding record based on the label
                var clickedRecord = v.getStore().findRecord('label', label);

                if (clickedRecord.get('type') === 'mab') {
                    this.getViewManager().changeView('group', 'mabgroupsummary', [clickedRecord.get('rowid')]);
                }
                else {
                    this.getViewManager().changeView('group', 'groupsummary', [clickedRecord.get('id')]);
                }
            },
            render: function(view) {
                this.registerSelectGroup(view);
            }
        });

        this.control('mabstatus > container > #savemabgroup, #editgroupdetails', {
            click : this.onMabGroupSave
        });

        this.control('#groupcreatesave-cmp', {
            click : this.doGroupSave
        });

        this.control('#mabgroupcreatesave', {
            click : this.doMabGroupSave
        });

        this.control('#save-as-new-grp-menu-item', {
            click : this.doGroupSave
        });

        this.control('#update-grp-menu-item', {
            click : this.doGroupEdit
        });

        this.control('#groupeditsave', {
            click : this.doEdit
        });

        this.control('#groupupdatesave', {
            click : this.doGroupUpdateFromSavePanel
        });

        this.control('#groupcancel', {
            click : this.onGroupCancel
        });

        this.control('#mabgroupcancel', {
            click : this.onMabGroupCancel
        });

        this.control('#groupplotview', {
            click : this.onGroupPlotView
        });

        this.control('#groupmabview', {
            click : this.onGroupMabView
        });

        this.control('groupsummary', {
            requestgroupdelete: this.doGroupDeleteFromSummary
        });

        this.control('mabgroupsummary', {
            requestmabgroupdelete: this.doMabGroupDeleteFromSummary
        });

        this.control('home', {
            requestgroupdelete: this.doGroupDeleteFromSummary
        });

        this.callParent();
    },

    parseContext : function(urlContext) {
        urlContext = this.callParent(arguments);
        var ctx = {groupId: null};
        if (urlContext && urlContext.length > 0) {
            ctx.groupId = urlContext[0];
        }

        return ctx;
    },

    createView : function(xtype, context) {
        var v; // the view instance to be created

        if (xtype === 'groupsave') {

            // this end point may no longer exist
            console.log('createView -> groupSummary');
            var state = Connector.getState();

            v = Ext.create('Connector.view.GroupSave', {
                hideSelectionWarning: state.hasSelections(),
                isMabGroup: context ? context.isMabGroup : false
            });

            state.on('selectionchange', v.onSelectionChange, v);

            this.application.on('groupsaved', this.onGroupSaved, this);
            this.application.on('groupedit', this.onGroupEdit, this);
            this.application.on('mabgroupsaved', this.onMabGroupSaved, this);
            this.application.on('mabgroupedited', this.onMabGroupEdited, this);
        }
        else if (xtype === 'groupsummary') {

            v = Ext.create('Connector.view.GroupSummary', {
                store : StoreCache.getStore('Connector.app.store.Group'),
                groupId: context.groupId
            });
        }
        else if (xtype === 'mabgroupsummary') {

            v = Ext.create('Connector.view.MabGroupSummary', {
                store: StoreCache.getStore('Connector.app.store.Group'),
                groupId: context.groupId
            });
        }

        return v;
    },

    getViewTitle : function(xtype, context) {

        var v;
        var title;
        if (xtype === 'mabgroupsummary') {
            v = this.getViewManager().getViewInstance('mabgroupsummary');
            title = 'MAb Groups';
        }
        else {
            v = this.getViewManager().getViewInstance('groupsummary');
            title = 'Groups';
        }

        if (v.getGroup()) {
            title = v.getGroup().label + " - " + title;
        }
        return title;
    },

    updateView : function(xtype, context) {
        if (xtype === 'groupsummary') {
            var v = this.getViewManager().getViewInstance('groupsummary');
            v.updateView(context.groupId);
        }
        else if (xtype === 'mabgroupsummary') {
            var m = this.getViewManager().getViewInstance('mabgroupsummary');
            m.updateView(context.groupId);
        }
    },

    getDefaultView : function() {
        return 'groupsummary';
    },

    registerSelectGroup : function(view) {
        if (!this.selected[view.id]) {
            this.selected[view.id] = view;
            view.on('selectionchange', this.onSelectGroup, this);
        }
    },

    onSelectGroup : function(selModel) {
        Ext.iterate(this.selected, function(id, select) {
            if (id != selModel.view.id) {
                var model = select.getSelectionModel();
                model.suspendEvents();
                model.deselectAll();
                model.resumeEvents();
            }
        });
    },

    doMabGroupSave: function () {
        var view = this.getViewManager().getViewInstance('groupsave');
        this.doMabGroupEdit(view, false);
    },

    doGroupSave : function()
    {
        var view = this.getGroupSave();
        this.doSubjectGroupSave(view);
    },

    toJsonMabFilters : function(filters)
    {
        var jsonFilters = [];
        Ext.each(filters, function(filter){
            jsonFilters.push(filter.jsonify())
        });

        return Ext.encode({
            isLive : true,
            filters : jsonFilters
        });
    },

    doEdit: function() {
        var view = this.getViewManager().getViewInstance('groupsave');
        this.doMabGroupEdit(view, true);
    },

    doMabGroupEdit: function(view, isEditMode, isReplace)
    {
        if (view.isValid()) {
            var values = view.getValues(), state = Connector.getState();
            var replaceFromGroup = view.getSelectedGroup();

            if (isEditMode && !Ext.isDefined(values['groupid'])) {
                Ext.Msg.alert('A group id must be provided!');
            }
            else {
                var group, groupname, me = this;
                if (isReplace)
                {
                    replaceFromGroup.set('description', values['mabgroupdescription']);
                    replaceFromGroup.set('shared', typeof values['mabgroupshared'] != "undefined");  // convert to boolean

                    groupname = replaceFromGroup.get('label');
                    group = {
                        RowId : replaceFromGroup.get('rowid'),
                        Container : LABKEY.container.id,
                        Label: groupname,
                        Description: replaceFromGroup.get('description'),
                        Filters: this.toJsonMabFilters(state.getMabFilters()),
                        Type: 'mab',
                        Shared: replaceFromGroup.get('shared')
                    };
                }
                else
                {
                    groupname = values['mabgroupname'];
                    group = {
                        Label: groupname,
                        Description: values['mabgroupdescription'],
                        Filters: this.toJsonMabFilters(state.getMabFilters()),
                        Type: 'mab',
                        Shared: typeof values['mabgroupshared'] != "undefined"
                    };

                    if (isEditMode) {
                        group.RowId = parseInt(values['groupid']);
                        group.Container = LABKEY.container.id
                    }
                }

                var saveSuccess = function() {
                    Connector.getApplication().fireEvent('mabgroupsaved', groupname);
                    view.reset();
                    this.getGroupStore().refreshData();
                };

                var editSuccess = function() {
                    Connector.getApplication().fireEvent('mabgroupedited', groupname);
                    view.reset();
                    this.getGroupStore().refreshData();
                    me.getViewManager().changeView('home');
                };

                var queryConfig = {
                    schemaName: 'cds',
                    queryName: 'mabgroup',
                    rows: [group],
                    scope: this,
                    success : isEditMode ? editSuccess : saveSuccess,
                    failure: this.saveFailure
                };

                if (isEditMode || isReplace)
                    LABKEY.Query.updateRows(queryConfig);
                else
                    LABKEY.Query.insertRows(queryConfig);
            }
        }
    },

    getGroupStore : function() {
        return StoreCache.getStore('Connector.app.store.Group')
    },

    saveFailure : function(response, isAlert) {

        this.getSavedGroupName().hide();
        this.getEditGroupBtn().hide();

        var json = response.responseText ? Ext.decode(response.responseText) : response;

        if (json.exception) {
            var view = this.getGroupSave();
            if (json.exception.indexOf('There is already a category named') > -1 || json.exception.indexOf('There is already a group named') > -1 ||
                    json.exception.indexOf('duplicate key value violates') > -1) {
                // custom error response for invalid name
                if (isAlert === true)
                    Ext.Msg.alert('ERROR', json.exception);
                else
                    view.showError('A group with this name already exists. Please choose a different name.');
            }
            else
            {
                if (isAlert === true)
                    Ext.Msg.alert('ERROR', json.exception);
                else
                    view.showError(json.exception);
            }
        }
        else {
            Ext.Msg.alert('Failed to Save', response.responseText);
        }
    },

    saveFailureAlert: function(response) {
        this.saveFailure(response, true);
    },

    hideGroupSavePanel : function() {
        var grpSaveCmp = this.getGroupSave();
        grpSaveCmp.hideError();
        grpSaveCmp.hide();
    },

    hideSaveAsGroupBtn : function() {
        Ext.getCmp('filter-save-as-group-btn-id').hide();
    },

    displayEditBtn : function() {
        this.getEditGroupBtn().show();
    },

    doSubjectGroupSave: function(view)
    {
        if (view)
        {
            var values = view.getValues(),
                    state = Connector.getState();

            var me = this;

            state.moveSelectionToFilter();

            state.onMDXReady(function(mdx) {

                var saveSuccess = function(response) {

                    var group = Ext.decode(response.responseText);

                    me.hideGroupSavePanel();
                    me.hideSaveAsGroupBtn();
                    me.displayEditBtn();

                    Connector.getApplication().fireEvent('groupsaved', group, state.getFilters(true));
                    // add a single listener to update the filter label after the store has reloaded
                    me.getGroupStore().on('dataloaded', function(){
                        this.updateFilterLabel(group.category.label);
                    }, me, {single : true});
                    me.getGroupStore().refreshData();
                };

                Connector.model.Filter.doGroupSave({
                    mdx : mdx,
                    success : saveSuccess,
                    failure : this.saveFailure,
                    scope: this,
                    group : {
                        label: values['groupname'],
                        description: values['groupdescription'],
                        filters: state.getFilters(),
                        isLive: true, // all groups are live
                        isOwnerShared: typeof values['groupshared'] != "undefined"
                    }
                });
            }, this);
        }
    },

    // update the filter label after insert or update
    updateFilterLabel: function(label) {
        var groupLabel = this.getSavedGroupName();
        if (groupLabel && groupLabel.items) {
            // find the record to update the group name
            let rec = this.getGroupStore().findRecord('label', label);
            if (rec){
                groupLabel.items.get(0).update({savedGroupName: rec.get('label'), groupId: rec.get('id')});
                groupLabel.show();
            }
        }
    },

    doGroupEdit: function()
    {
        var view = this.getGroupSave();
        this.doSubjectGroupEdit(view);
    },

    doSubjectGroupEdit : function(view)
    {
        if (view.isValid()) {

            var newValues = view.getActiveForm().getValues();
            var grpStore = StoreCache.getStore('Connector.app.store.Group');

            //get the original group that is being edited
            var originalGroupName = this.getSavedGroupName().items.items[0].data.savedGroupName;
            var groupItems = grpStore.query('label', originalGroupName).items;
            var group = undefined;

            if (groupItems.length === 0) {
                Ext.Msg.alert(values['groupname'] + ' not found to edit.');
            }
            else {
                group = groupItems[0].data;
            }

            if (group) {
                var me = this;
                var editSuccess = function (response)
                {
                    var grpResp = Ext.decode(response.responseText);
                    var grp = grpResp.group;

                    me.hideGroupSavePanel();
                    me.hideSaveAsGroupBtn();
                    me.displayEditBtn();

                    //display group label
                    var groupLabel = me.getSavedGroupName();
                    groupLabel.items.get(0).update({savedGroupName: grp.label});
                    groupLabel.show();

                    Connector.getApplication().fireEvent('groupsaved', grp, state.getFilters(true));
                    // add a single listener to update the filter label after the store has reloaded
                    me.getGroupStore().on('dataloaded', function(){
                        this.updateFilterLabel(grp.label);
                    }, me, {single : true});
                    me.getGroupStore().refreshData();
                };

                var editFailure = function (response)
                {
                    var errors = Ext.decode(response.responseText).errors;
                    var errorMsgs = [];
                    Ext.each(errors, function(error) {
                        errorMsgs.push(error.message);
                    });
                    Ext.Msg.alert('ERROR', errorMsgs);
                };

                var groupData = {};
                var state = Connector.getState();
                groupData.rowId = group.id;
                groupData.label = newValues['groupname'];
                groupData.description = newValues['groupdescription'];
                groupData.categoryLabel = newValues['groupname'];
                groupData.categoryId = group.categoryId;
                groupData.participantIds = Connector.getFilterService().getParticipantIds();
                groupData.categoryType = 'list';
                if (newValues['groupshared'] !== undefined) //if 'Shared group' is checked, the value is 'on'
                {
                    groupData.categoryOwnerId = -1;  // shared owner ID, see ParticipantCategory.java -> OWNER_SHARED
                }
                else
                {
                    groupData.categoryOwnerId = LABKEY.user.id;
                }
                groupData.filters =  Connector.model.Filter.toJSON(state.getFilters(), true);

                LABKEY.Ajax.request({
                    url: LABKEY.ActionURL.buildURL("participant-group", "saveParticipantGroup.api", null),
                    method: 'POST',
                    success: editSuccess,
                    failure: editFailure,
                    jsonData: groupData,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }, this);
            }
        }
    },

    doGroupUpdateFromSavePanel : function()
    {
        var view = this.getViewManager().getViewInstance('groupsave');

        if (view.isValid())
        {
            var values = view.getValues(),
                targetGroup = view.getSelectedGroup();

            if (targetGroup)
            {
                if (targetGroup.get('type') === 'mab')
                {
                    this.doMabGroupEdit(view, false, true);
                    return;
                }

                // Ensure that the filter set is up to date
                var state = Connector.getState();
                state.moveSelectionToFilter();

                // Update the target group
                targetGroup.set('description', values['groupdescription']);
                targetGroup.set('shared', typeof values['groupshared'] != "undefined");  // convert to boolean

                state.onMDXReady(function(mdx) {

                    var me = this;

                    //
                    // Retrieve the listing of participants matching the current filters
                    //
                    mdx.queryParticipantList({
                        useNamedFilters: [Connector.constant.State.STATE_FILTER],
                        success: function(cs) {

                            var updateSuccess = function(response) {
                                var group = Ext.decode(response.responseText);
                                me.application.fireEvent('groupsaved', group, state.getFilters(true));
                                view.reset();
                                me.getGroupStore().refreshData();
                            };

                            var updateFailure = function(response) {
                                var errors = Ext.decode(response.responseText).errors;
                                var errorMsgs = [];
                                Ext.each(errors, function(error) {
                                    errorMsgs.push(error.message);
                                });
                                Ext.Msg.alert('Failed to update Group', errorMsgs);
                            };

                            var groupData = {};
                            groupData.rowId = targetGroup.get('id');
                            groupData.participantIds = Ext.Array.pluck(Ext.Array.flatten(cs.axes[1].positions), 'name');
                            groupData.label = targetGroup.get('label');
                            groupData.description = targetGroup.get('description');
                            groupData.categoryLabel = targetGroup.get('label');
                            groupData.categoryId = targetGroup.get('categoryId');
                            groupData.categoryType = 'list';
                            if (targetGroup.get('shared') === true)
                            {
                                groupData.categoryOwnerId = -1;  // shared owner ID, see ParticipantCategory.java -> OWNER_SHARED
                            }
                            else
                            {
                                groupData.categoryOwnerId = LABKEY.user.id;
                            }
                            groupData.filters = Connector.model.Filter.toJSON(state.getFilters(), true);

                            LABKEY.Ajax.request({
                                url: LABKEY.ActionURL.buildURL("participant-group", "saveParticipantGroup.api", null),
                                method: 'POST',
                                success: updateSuccess,
                                failure: updateFailure,
                                jsonData: groupData,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            });
                        }
                    });
                }, this);
            }
        }
    },

    onMabGroupCancel : function() {
        this.getViewManager().hideView('groupsave');
    },

    getGroupSave : function() {
        // use the xtype and itemId in the selector
        var groupSave = Ext.ComponentQuery.query('groupsave#groupsave-cmp');
        return Ext.ComponentQuery.query('groupsave#groupsave-cmp')[0];
    },

    getSavedGroupName : function() {
        return Ext.ComponentQuery.query('container#savedgroupname-cmp')[0];
    },

    getEditGroupBtn : function() {
        return Ext.ComponentQuery.query('container#editgroupbtn-cmp')[0];
    },

    getNewGroupCancelAndSaveGroupBtns : function() {
        return Ext.ComponentQuery.query('toolbar#new-group-cancel-save-btns-cmp')[0];
    },

    onGroupCancel : function() {
        this.getGroupSave().hide();
        Ext.getCmp('filter-save-as-group-btn-id').show();
    },

    onGroupPlotView : function() {
        this.getViewManager().changeView('chart');
    },

    onGroupMabView: function() {
        this.getViewManager().changeView('mabgrid');
    },

    onMabGroupSave : function(cmp, event)
    {
        this.onGroupSave(cmp, event, true);
    },

    /**
     * Needs to be refactored out and the old views removed once mab groups use the new UI
     */
    onGroupSave : function(cmp, event, isMab)
    {
        var isMabGroup = isMab || (cmp && cmp.group && cmp.group.get('type') === 'mab');
        this.getViewManager().showView('groupsave', { isMabGroup: isMabGroup });
        var groupSaveView = this.getViewManager().getViewInstance('groupsave');

        if (cmp && cmp.group)
        {
            groupSaveView.editGroup(cmp.group, true);
        }
        else if (groupSaveView.getMode() === Connector.view.GroupSave.modes.EDIT)
        {
            groupSaveView.changeMode(Connector.view.GroupSave.modes.CREATE);
        }
    },

    _groupEditSave : function(name, filters, applyFilters, isMab)
    {
        if (applyFilters === true)
        {
            Connector.getState().setFilters(filters);
        }
        this.getViewManager().hideView('groupsave');

        var fsview = isMab ? this.getViewManager().getViewInstance('mabstatus') : this.getViewManager().getViewInstance('filterstatus');
        if (isMab && fsview.ownerCt && fsview.ownerCt.isHidden()) // not on mab grid page
            fsview = this.getViewManager().getViewInstance('filterstatus');

        if (fsview)
        {
            fsview.showMessage('Group \"' + Ext.String.ellipsis(name, 15, true) + '\" saved.', true);
        }
    },

    onGroupSaved : function(response, filters)
    {
        // shouldn't use category label, it doesn't get updated in the database properly after renames, but we will use it if group label is missing
        var groupLabel = response.group ? response.group.label : response.category.label;
        this._groupEditSave(groupLabel, filters, true);
    },

    onMabGroupSaved : function(groupLabel)
    {
        this._groupEditSave(groupLabel, null, false, true);
    },

    onGroupEdit : function(response)
    {
        this._groupEditSave(response.group.label);
    },

    onMabGroupEdited: function(groupLabel)
    {
        this._groupEditSave(groupLabel, null, false, true);
    },

    doSubjectGroupDelete : function(config) {
        Ext.Ajax.request({
            url : LABKEY.ActionURL.buildURL('participant-group', 'deleteParticipantGroup.api', config.containerPath),
            method: 'POST',
            jsonData: {rowId: config.id},
            success: config.success,
            failure: config.failure,
            scope: config.scope
        });
    },

    onDeleteSuccess: function() {
        if (!this.loadDataTask) {
            this.loadDataTask = new Ext.util.DelayedTask(function(store) {
                store.refreshData();
            });
        }
        this.loadDataTask.delay(300, undefined, this, [this.getGroupStore()]);

        var editGroupView = this.getViewManager().getViewInstance('groupsave');
        if (editGroupView)
            editGroupView.refresh();

        this.clearFilter();
        this.hideGroupSaveBtns();

        this.getViewManager().changeView('home');
    },

    hideGroupSaveBtns : function() {
        this.hideGroupLabel();
        this.hideSaveAsGroupBtn();
        this.hideGroupSavePanel();
        this.resetFilterStatusBackGroundColor();
        this.hideEditGroupBtn();
    },

    hideGroupLabel() {
        this.getSavedGroupName().hide();
    },

    resetFilterStatusBackGroundColor() {
        document.getElementById('filterstatus-items-id').style.backgroundColor = '#fff';
    },

    hideEditGroupBtn() {
        this.getEditGroupBtn().hide();
    },

    hideCancelAndSaveGroupBtns() {
        this.getNewGroupCancelAndSaveGroupBtns().hide();
    },

    clearFilter : function() {
        var state = Connector.getState(),
                hasFilters = state.hasFilters();

        if (state.hasSelections()) {
            // if we have both selections and filters, roll-up into one state update
            state.clearSelections(hasFilters /* skipState */);
        }
        if (hasFilters) {
            state.clearFilters();

            // only show undo if clear filters
            var view = this.getViewManager().getViewInstance('filterstatus');
            if (view) {
                view.showUndoMessage();
            }
        }
    },

    doMabGroupDeleteFromSummary : function(id) {
        var group = {
            RowId : id,
            Container : LABKEY.container.id
        };
        LABKEY.Query.deleteRows({
            schemaName: 'cds',
            queryName: 'mabgroup',
            rows: [group],
            scope: this,
            success: this.onDeleteSuccess,
            failure: this.saveFailureAlert
        });
    },

    doGroupDeleteFromSummary : function(id, isMab) {
        if (isMab) {
            this.doMabGroupDeleteFromSummary(id);
            return;
        }
        this.doSubjectGroupDelete({
            id: id,
            scope: this,
            success: this.onDeleteSuccess,
            failure: function(response) {
                var json = Ext.decode(response.responseText);
                Ext.Msg.alert('ERROR', json.exception ? json.exception : 'Delete group failed.');
            }
        });
    }
});