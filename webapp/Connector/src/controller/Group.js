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

        this.control('filterpanel > container > #savegroup', {
            click : this.onGroupSave
        });

        this.control('#groupcreatesave', {
            click : this.doGroupSave
        });

        this.control('#groupupdatesave', {
            click : this.doGroupUpdateFromSavePanel
        });

        this.control('#cancelgroupsave, #groupupdatecancel', {
            click : this.onGroupCancel
        });

        this.control('groupsummary', {
            loadgroupfilters: this.loadGroupFilters,
            requestfilterundo: this.undoFilter,
            requestgroupupdate: this.doGroupUpdateFromSummary,
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

    doGroupSave : function() {
        var view = this.getViewManager().getViewInstance('groupsave');

        if (view.isValid()) {
            var values = view.getValues();
            var state = Connector.getState();

            var isLiveFilter = values['groupselect'] == 'live';

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
                        isLive: isLiveFilter
                    }
                });
            }, this);
        }
    },

    doGroupUpdateFromSavePanel : function() {
        var view = this.getViewManager().getViewInstance('groupsave');

        if (view.isValid()) {
            var values = view.getValues();
            var targetGroup = view.getSelectedGroup();

            if (targetGroup) {

                // Ensure that the filter set is up to date
                var state = Connector.getState();
                state.moveSelectionToFilter();

                // Update the target group
                targetGroup.set('description', values['groupdescription']);
                targetGroup.set('isLive', values['groupselect'] == 'live');

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
                                alert('Failed to update Group');
                            };

                            var ids = Ext.Array.pluck(Ext.Array.flatten(cs.axes[1].positions),'name');
                            var description = targetGroup.get('description');
                            var isLive = targetGroup.get('isLive');

                            me.doGroupUpdate({
                                id: targetGroup.get('id'),
                                ids: ids,
                                description: description,
                                filters: LABKEY.app.model.Filter.toJSON(state.getFilters(), isLive),
                                success: updateSuccess,
                                failure: updateFailure
                            });
                        }
                    });
                }, this);
            }
        }
    },

    doGroupUpdateFromSummary : function(group) {
        var state = Connector.getState();
        var me = this;
        state.onMDXReady(function(mdx) {
            //
            // Retrieve the listing of participants matching group filters
            //
            var filterModels = LABKEY.app.model.Filter.fromJSON(group.filters);
            var olapFilters = LABKEY.app.model.Filter.getOlapFilters(mdx, filterModels, state.subjectName);
            mdx.setNamedFilter('groupfilter', olapFilters);
            mdx.queryParticipantList({
                useNamedFilters: ['groupfilter'],
                success: function(cs) {
                    var updateSuccess = function(group) {
                        mdx.clearNamedFilter('groupfilter');
                        Connector.model.Group.getGroupStore().load();
                    };

                    var updateFailure = function() {
                        alert('Failed to update Group');
                    };

                    var ids = Ext.Array.pluck(Ext.Array.flatten(cs.axes[1].positions),'name');
                    me.doGroupUpdate({
                        id: group.id,
                        ids: ids,
                        description: group.description,
                        filters: group.filters,
                        success: updateSuccess,
                        failure: updateFailure
                    });
                }
            });
        });
    },

    doGroupUpdate : function(config) {
        LABKEY.ParticipantGroup.updateParticipantGroup({
            rowId: config.id,
            participantIds: config.ids,
            description: config.description,
            filters: config.filters,
            success: config.success,
            failure: config.failure
        });
    },

    onGroupCancel : function() {
        this.getViewManager().hideView('groupsave');
    },

    onGroupSave : function() {
        this.getViewManager().showView('groupsave');
    },

    onGroupSaved : function(grp, filters) {

        var name = grp.label ? grp.label : grp.category.label;

        Connector.getState().setFilters(filters);
        this.getViewManager().hideView('groupsave');

        var fsview = this.getViewManager().getViewInstance('filterstatus');
        if (fsview) {
            fsview.showMessage('Group \"' + Ext.String.ellipsis(name, 15, true) + '\" saved.', true);
        }
        else {
            console.warn('no filterstatus view available');
        }
    },

    doGroupDelete : function(config) {
        Ext.Ajax.request({
            url : LABKEY.ActionURL.buildURL("participant-group", "deleteParticipantGroup", config.containerPath),
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