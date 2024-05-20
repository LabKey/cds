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

        this.control('#groupcreatesave-cmp', {
            click : this.doGroupSave
        });

        this.control('#mabgroupcreatesave-cmp', {
            click : this.doMabGroupSave
        });

        this.control('#groupsave-cmp #save-as-new-grp-menu-item', {
            click : this.doGroupSave
        });

        this.control('#groupsave-mab-cmp #save-as-new-grp-menu-item', {
            click : this.doMabGroupSave
        });

        this.control('#groupsave-mab-cmp #update-grp-menu-item', {
            click : this.doMabGroupEdit
        });

        this.control('#groupsave-cmp #update-grp-menu-item', {
            click : this.doGroupEdit
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

        if (xtype === 'groupsummary') {

            v = Ext.create('Connector.view.GroupSummary', {
                store : this.getGroupStore(),
                groupId: context.groupId
            });
        }
        else if (xtype === 'mabgroupsummary') {

            v = Ext.create('Connector.view.MabGroupSummary', {
                store: this.getGroupStore(),
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
        var view = this.getMabGroupSave();
        this._doMabGroupEdit(view, false);
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

    doMabGroupEdit: function() {
        var view = this.getMabGroupSave();
        this._doMabGroupEdit(view, true);
    },

    _doMabGroupEdit: function(view, isEditMode)
    {
        if (view.isValid()) {
            var values = view.getValues(), state = Connector.getState();

            var group;
            var groupname = values['groupname'];
            group = {
                Label: groupname,
                Description: values['groupdescription'],
                Filters: this.toJsonMabFilters(state.getMabFilters()),
                Type: 'mab',
                Shared: typeof values['groupshared'] != "undefined"
            };

            if (isEditMode) {
                var originalGroupName = this.getSavedGroupName(true).items.items[0].data.savedGroupName;
                var savedGroup = this._getSavedGroup(originalGroupName);

                group.RowId = savedGroup.rowid;
                group.Container = LABKEY.container.id
            }

            var saveSuccess = function() {
                Connector.getApplication().fireEvent('mabgroupsaved', groupname);
                this.hideGroupSavePanel(true);
                this.hideSaveAsGroupBtn(true);
                this.displayEditBtn(true);

                this.getGroupStore().on('dataloaded', function(){
                    this.updateFilterLabel(groupname, true);
                }, this, {single : true});

                this.refreshGroupStore();
            };

            var editSuccess = function() {
                Connector.getApplication().fireEvent('mabgroupedited', groupname);
                this.hideGroupSavePanel(true);
                this.hideSaveAsGroupBtn(true);
                this.displayEditBtn(true);

                this.getGroupStore().on('dataloaded', function(){
                    this.updateFilterLabel(groupname, true);
                }, this, {single : true});

                this.refreshGroupStore();
            };

            var queryConfig = {
                schemaName: 'cds',
                queryName: 'mabgroup',
                rows: [group],
                scope: this,
                success : isEditMode ? editSuccess : saveSuccess,
                failure: this.saveFailureMab
            };

            if (isEditMode)
                LABKEY.Query.updateRows(queryConfig);
            else
                LABKEY.Query.insertRows(queryConfig);
        }
    },

    getGroupStore : function() {
        return StoreCache.getStore('Connector.app.store.Group')
    },

    saveFailureMab : function(response, options) {
        this.saveFailure(response, options,true);
    },

    saveFailure : function(response, options, isMab, isAlert) {

        this.getSavedGroupName().hide();
        this.getEditGroupBtn().hide();

        var json = response.responseText ? Ext.decode(response.responseText) : response;

        if (json.exception) {
            var view = isMab ? this.getMabGroupSave() : this.getGroupSave();
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

    saveFailureAlert: function(response, options) {
        this.saveFailure(response, options, true, true);
    },

    hideGroupSavePanel : function(isMab) {
        var grpSaveCmp = isMab ? this.getMabGroupSave() : this.getGroupSave();
        grpSaveCmp.hideError();
        grpSaveCmp.hide();
    },

    hideSaveAsGroupBtn : function(isMab) {
        if (isMab)
            Ext.ComponentQuery.query('button#mabsavegroup-cmp')[0].hide();
        else
            Ext.getCmp('filter-save-as-group-btn-id').hide();
    },

    displayEditBtn : function(isMab) {
        this.getEditGroupBtn(isMab).show();
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
                    me.refreshGroupStore();
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
    updateFilterLabel: function(label, isMab) {
        var groupLabel = this.getSavedGroupName(isMab);
        if (groupLabel && groupLabel.items) {
            // find the record to update the group name
            let rec = this.getGroupStore().findRecord('label', label);
            if (rec) {
                let id = isMab ? rec.get('rowid') : rec.get('id');
                groupLabel.items.get(0).update({savedGroupName: rec.get('label'), groupId: id});
                groupLabel.show();
            }
        }
    },

    doGroupEdit: function()
    {
        var view = this.getGroupSave();
        this.doSubjectGroupEdit(view);
    },

    _getSavedGroup : function(groupName) {
        let grpStore = this.getGroupStore();
        let groupItems = grpStore.query('label', groupName).items;
        let group = undefined;

        if (groupItems.length === 0) {
            Ext.Msg.alert(groupName + ' not found to edit.');
        }
        else {
            group = groupItems[0].data;
        }
        return group;
    },

    doSubjectGroupEdit : function(view)
    {
        if (view.isValid()) {
            //get the original group that is being edited
            var originalGroupName = this.getSavedGroupName().items.items[0].data.savedGroupName;
            var group = this._getSavedGroup(originalGroupName);
            var newValues = view.getActiveForm().getValues();

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
                    me.refreshGroupStore();
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

    onMabGroupCancel : function() {
        this.getMabGroupSave().hide();
        Ext.ComponentQuery.query('button#mabsavegroup-cmp')[0].show();
    },

    getGroupSave : function() {
        // use the xtype and itemId in the selector
        return Ext.ComponentQuery.query('groupsave#groupsave-cmp')[0];
    },

    getMabGroupSave : function() {
        return Ext.ComponentQuery.query('groupsave#groupsave-mab-cmp')[0];
    },

    getSavedGroupName : function(isMab) {
        if (isMab)
            return Ext.ComponentQuery.query('container#savedmabgroupname-cmp')[0];
        else
            return Ext.ComponentQuery.query('container#savedgroupname-cmp')[0];
    },

    getEditGroupBtn : function(isMab) {
        if (isMab)
            return Ext.ComponentQuery.query('container#editmabgroupbtn-cmp')[0];
        else
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
        var currentPage = window.location.href.split("#");
        var mabGroup;
        if (currentPage.length > 1 && currentPage[1].indexOf("mabgroupsummary") > -1) {
            var groupSummary = currentPage[1].split("/");
            if (groupSummary.length === 3) {
                mabGroup = groupSummary[groupSummary.length - 1];
            }
        }

        this.getViewManager().changeView('mabgrid', 'mabdatagrid', [mabGroup]);
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

    onDeleteSuccess: function(isMab) {
        this.refreshGroupStore();
        this.clearFilter();
        this.hideGroupSaveBtns(isMab);

        this.getViewManager().changeView('home');
    },

    refreshGroupStore : function() {
        if (!this.loadDataTask) {
            this.loadDataTask = new Ext.util.DelayedTask(function() {
                this.getGroupStore().refreshData();
            });
        }
        this.loadDataTask.delay(300, undefined, this);
    },

    hideGroupSaveBtns : function(isMab) {
        this.getSavedGroupName(isMab).hide();
        this.hideSaveAsGroupBtn(isMab);
        this.hideGroupSavePanel(isMab);
        this.resetFilterStatusBackGroundColor();
        this.hideEditGroupBtn(isMab);
    },

    resetFilterStatusBackGroundColor() {
        document.getElementById('filterstatus-items-id').style.backgroundColor = '#fff';
    },

    hideEditGroupBtn(isMab) {
        this.getEditGroupBtn(isMab).hide();
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
            success: function(){this.onDeleteSuccess(true);},
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
            success: function() {this.onDeleteSuccess(false);},
            failure: function(response) {
                var json = Ext.decode(response.responseText);
                Ext.Msg.alert('ERROR', json.exception ? json.exception : 'Delete group failed.');
            }
        });
    }
});