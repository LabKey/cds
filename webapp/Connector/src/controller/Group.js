/*
 * Copyright (c) 2014-2015 LabKey Corporation
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
            itemclick: function(v, grp) {
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

        this.control('groupsummary', {
            loadgroupfilters: this.loadGroupFilters,
            requestfilterundo: this.undoFilter,
            requestgroupdelete: this.doGroupDeleteFromSummary,
            requestback: this.doBack
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

            this.getViewManager().on('afterchangeview', function(controller, view) {
                if (view != 'groupsummary') {
                    v.hideMessage();
                }
            }, v);
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

    undoFilter : function() {
        Connector.getState().requestFilterUndo();
    },

    loadGroupFilters : function() {
        var v = this.getViewManager().getViewInstance('groupsummary'),
            store = Connector.model.Group.getGroupStore(),
            recIdx = store.find('id', v.groupId, false, true, true),
            rec = store.getAt(recIdx),
            filters = rec.get('filters');

        if (Ext.isString(filters)) {
            var strFilterArray = LABKEY.app.model.Filter.fromJSON(filters);
            filters = [];
            for (var f=0; f < strFilterArray.length; f++) {
                filters.push(Ext.create('Connector.model.Filter', strFilterArray[f]));
            }
        }
        else {
            filters = filters.filters;
        }

        Connector.getState().setFilters(filters);

        this.getApplication().fireEvent('grouploaded', Ext.clone(rec.data), filters);
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
                        isLive: true // all groups are live
                    }
                });
            }, this);
        }
    },

    doGroupEdit : function()
    {
        var view = this.getViewManager().getViewInstance('groupsave');

        if (view.isValid())
        {
            var values = view.getValues();

            if (!Ext.isDefined(values['groupid']))
            {
                Ext.Msg.alert('A group id must be provided!');
            }
            else
            {
                var me = this;

                var editSuccess = function(group)
                {
                    me.application.fireEvent('groupedit', group);
                    view.reset();
                    Connector.model.Group.getGroupStore().load();
                };

                var editFailure = function()
                {
                    Ext.Msg.alert('Failed to edit Group');
                };

                LABKEY.ParticipantGroup.updateParticipantGroup({
                    rowId: parseInt(values['groupid']),
                    label: values['groupname'],
                    description: values['groupdescription'],
                    success: editSuccess,
                    failure: editFailure
                });
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

                state.onMDXReady(function(mdx) {

                    var me = this;

                    //
                    // Retrieve the listing of participants matching the current filters
                    //
                    mdx.queryParticipantList({
                        useNamedFilters: [LABKEY.app.constant.STATE_FILTER],
                        success: function(cs) {

                            var updateSuccess = function(group) {
                                me.application.fireEvent('groupsaved', group, state.getFilters(true));
                                view.reset();
                                Connector.model.Group.getGroupStore().load();
                            };

                            var updateFailure = function() {
                                Ext.Msg.alert('Failed to update Group');
                            };

                            LABKEY.ParticipantGroup.updateParticipantGroup({
                                rowId: targetGroup.get('id'),
                                participantIds: Ext.Array.pluck(Ext.Array.flatten(cs.axes[1].positions),'name'),
                                description: targetGroup.get('description'),
                                filters: LABKEY.app.model.Filter.toJSON(state.getFilters(), true),
                                success: updateSuccess,
                                failure: updateFailure
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

    _groupEditSave : function(grp, filters, applyFilters)
    {
        var name = grp.label ? grp.label : grp.category.label;

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

    onGroupSaved : function(grp, filters)
    {
        this._groupEditSave(grp, filters, true);
    },

    onGroupEdit : function(grp)
    {
        this._groupEditSave(grp);
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
    },

    doBack : function() {
        window.history.back();
    }
});