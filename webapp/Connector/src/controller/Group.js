/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Group', {
    extend: 'Connector.controller.AbstractViewController',

    views: ['GroupSave', 'GroupSummary'],

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

                this.getViewManager().changeView('group', 'groupsummary', [grp.get('id')]);
            },
            render: function(view) {
                this.registerSelectGroup(view);
            }
        });

        this.control('filterstatus > container > #savegroup, #editgroupdetails', {
            click : this.onGroupSave
        });

        this.control('#groupcreatesave', {
            click : this.doGroupSave
        });

        this.control('#groupeditsave', {
            click : this.doGroupEdit
        });

        this.control('#groupupdatesave', {
            click : this.doGroupUpdateFromSavePanel
        });

        this.control('#groupcancel', {
            click : this.onGroupCancel
        });

        this.control('#groupplotview', {
            click : this.onGroupPlotView
        })

        this.control('groupsummary', {
            requestgroupdelete: this.doGroupDeleteFromSummary
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

        if (xtype == 'groupsave') {

            var state = Connector.getState();

            v = Ext.create('Connector.view.GroupSave', {
                hideSelectionWarning: state.hasSelections()
            });

            state.on('selectionchange', v.onSelectionChange, v);

            this.application.on('groupsaved', this.onGroupSaved, this);
            this.application.on('groupedit', this.onGroupEdit, this);
        }
        else if (xtype == 'groupsummary') {

            v = Ext.create('Connector.view.GroupSummary', {
                store: Connector.model.Group.getGroupStore(),
                groupId: context.groupId
            });
        }

        return v;
    },

    getViewTitle : function(xtype, context) {
        if (xtype === 'groupsummary') {
            var v = this.getViewManager().getViewInstance('groupsummary');
            var title = 'Groups';
            if (v.getGroup()) {
                title = v.getGroup().label + " - " + title;
            }
            return title;
        }
    },

    updateView : function(xtype, context) {
        if (xtype == 'groupsummary') {
            var v = this.getViewManager().getViewInstance('groupsummary');
            v.updateView(context.groupId);
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

    doGroupSave : function()
    {
        var view = this.getViewManager().getViewInstance('groupsave');

        if (view.isValid())
        {
            var values = view.getValues(),
                state = Connector.getState();

            state.moveSelectionToFilter();

            state.onMDXReady(function(mdx) {

                var saveSuccess = function(response) {
                    var group = Ext.decode(response.responseText);
                    Connector.getApplication().fireEvent('groupsaved', group, state.getFilters(true));
                    view.reset();
                    Connector.model.Group.getGroupStore().load();
                };

                var saveFailure = function(response) {
                    var json = Ext.decode(response.responseText);

                    if (json.exception) {
                        if (json.exception.indexOf('There is already a group named') > -1 ||
                                json.exception.indexOf('duplicate key value violates') > -1) {
                            // custom error response for invalid name
                            view.showError('The name you have chosen is already in use; please choose a different name.');
                        }
                        else
                            view.showError(json.exception);
                    }
                    else {
                        Ext.Msg.alert('Failed to Save', response.responseText);
                    }
                };


                LABKEY.app.model.Filter.doGroupSave({
                    mdx : mdx,
                    success : saveSuccess,
                    failure : saveFailure,
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

    doGroupEdit : function()
    {
        var view = this.getViewManager().getViewInstance('groupsave');

        if (view.isValid()) {
            var values = view.getValues();

            if (!Ext.isDefined(values['groupid'])) {
                Ext.Msg.alert('A group id must be provided!');
            }
            else {
                var me = this;
                var editSuccess = function (response)
                {
                    var group = Ext.decode(response.responseText);
                    me.application.fireEvent('groupedit', group);
                    view.reset();
                    Connector.model.Group.getGroupStore().load();
                    me.getViewManager().changeView('home');
                };

                var editFailure = function (response)
                {
                    var errors = Ext.decode(response.responseText).errors;
                    var errorMsgs = [];
                    Ext.each(errors, function(error) {
                        errorMsgs.push(error.message);
                    });
                    Ext.Msg.alert('Failed to edit Group', errorMsgs);
                };

                var groupData = {};
                groupData.rowId = parseInt(values['groupid']);
                groupData.label = values['groupname'];
                groupData.description = values['groupdescription'];
                groupData.categoryLabel = values['groupname'];
                groupData.categoryId = values['groupcategoryid'];
                groupData.participantIds = Ext.decode(values['groupparticipantids']);
                groupData.categoryType = 'list';
                if (typeof values['groupshared'] != "undefined")
                {
                    groupData.categoryOwnerId = -1;  // shared owner ID, see ParticipantCategory.java -> OWNER_SHARED
                }
                else
                {
                    groupData.categoryOwnerId = LABKEY.user.id;
                }
                groupData.filters = values['groupfilters'];

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
                        useNamedFilters: [LABKEY.app.constant.STATE_FILTER],
                        success: function(cs) {

                            var updateSuccess = function(response) {
                                var group = Ext.decode(response.responseText);
                                me.application.fireEvent('groupsaved', group, state.getFilters(true));
                                view.reset();
                                Connector.model.Group.getGroupStore().load();
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
                            groupData.filters = LABKEY.app.model.Filter.toJSON(state.getFilters(), true);

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

    onGroupCancel : function() {
        this.getViewManager().hideView('groupsave');
    },

    onGroupPlotView : function() {
        this.getViewManager().changeView('chart');
    },

    onGroupSave : function(cmp)
    {
        this.getViewManager().showView('groupsave');
        var groupSaveView = this.getViewManager().getViewInstance('groupsave');

        if (cmp && cmp.group)
        {
            groupSaveView.editGroup(cmp.group);
        }
        else if (groupSaveView.getMode() === Connector.view.GroupSave.modes.EDIT)
        {
            groupSaveView.changeMode(Connector.view.GroupSave.modes.CREATE);
        }
    },

    _groupEditSave : function(name, filters, applyFilters)
    {
        if (applyFilters === true)
        {
            Connector.getState().setFilters(filters);
        }
        this.getViewManager().hideView('groupsave');

        var fsview = this.getViewManager().getViewInstance('filterstatus');
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

    onGroupEdit : function(response)
    {
        this._groupEditSave(response.group.label);
    },

    doGroupDelete : function(config) {
        Ext.Ajax.request({
            url : LABKEY.ActionURL.buildURL('participant-group', 'deleteParticipantGroup.api', config.containerPath),
            method: 'POST',
            jsonData: {rowId: config.id},
            success: config.success,
            failure: config.failure,
            scope: config.scope
        });
    },

    doGroupDeleteFromSummary : function(id) {
        this.doGroupDelete({
            id: id,
            scope: this,
            success: function() {
                Connector.model.Group.getGroupStore().load();
                this.getViewManager().changeView('home');
            },
            failure: function(response) {
                var json = Ext.decode(response.responseText);
                Ext.Msg.alert('ERROR', json.exception ? json.exception : 'Delete group failed.');
            }
        });
    }
});