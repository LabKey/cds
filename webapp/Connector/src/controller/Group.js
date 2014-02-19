Ext.define('Connector.controller.Group', {
    extend: 'Connector.controller.AbstractViewController',

    views: ['GroupSave'],

    init : function() {

        this.control('filterpanel > container > #savegroup', {
            click : this.onGroupSave
        });

        this.control('#groupcreatesave', {
            click : this.doGroupSave
        });

        this.control('#groupupdatesave', {
            click : this.doGroupUpdate
        });

        this.control('#cancelgroupsave, #groupupdatecancel', {
            click : this.onGroupCancel
        });

        this.callParent();
    },

    createView : function(xtype, context) {

        var v; // the view instance to be created

        if (xtype == 'groupsave') {
            v = Ext.create('Connector.view.GroupSave', {
                hideSelectionWarning: this.getStateManager().getSelections().length == 0
            });

            this.getStateManager().on('selectionchange', v.onSelectionChange, v);
            this.application.on('groupsaved', this.onGroupSaved, this);
        }

        return v;
    },

    updateView : function(xtype, context) { },

    doGroupSave : function() {
        var view = this.getViewManager().getViewInstance('groupsave');

        if (view.isValid()) {
            var values = view.getValues();
            var state = this.getStateManager();

            var isLiveFilter = values['groupselect'] == 'live';

            state.moveSelectionToFilter();

            state.onMDXReady(function(mdx) {

                var me = this;

                var saveSuccess = function(response) {
                    var group = Ext.decode(response.responseText);
                    me.application.fireEvent('groupsaved', group, state.getFilters(true));
                    view.reset();
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


                LABKEY.app.controller.Filter.doGroupSave(mdx, saveSuccess, saveFailure, {
                    label: values['groupname'],
                    description: values['groupdescription'],
                    filters: state.getFlatFilters(),
                    isLive: isLiveFilter
                });
            }, this);
        }
    },

    doGroupUpdate : function() {
        var view = this.getViewManager().getViewInstance('groupsave');

        if (view.isValid()) {
            var values = view.getValues();
            var targetGroup = view.getSelectedGroup();

            if (targetGroup) {

                // Ensure that the filter set is up to date
                var state = this.getStateManager();
                state.moveSelectionToFilter();

                // Update the target group
                targetGroup.set('description', values['groupdescription']);
                targetGroup.set('isLive', values['groupselect'] == 'live');

                // Request filters directly from state
                var filters = state.getFilters(true);

                state.onMDXReady(function(mdx) {

                    var me = this;

                    //
                    // Retrieve the listing of participants matching the current filters
                    //
                    mdx.queryParticipantList({
                        useNamedFilters: ['statefilter'],
                        success: function(cs) {

                            var updateSuccess = function(group) {
                                me.application.fireEvent('groupsaved', group, state.getFilters(true));
                                view.reset();
                            };

                            var updateFailure = function() {
                                alert('Failed to update Group');
                            };

                            var ids = Ext4.Array.pluck(Ext4.Array.flatten(cs.axes[1].positions),'name');
                            var description = targetGroup.get('description');
                            var isLive = targetGroup.get('isLive');

                            LABKEY.ParticipantGroup.updateParticipantGroup({
                                rowId: targetGroup.get('id'),
                                participantIds: ids,
                                description: description,
                                filters: LABKEY.app.controller.Filter.filtersToJSON(filters, isLive),
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

    onGroupSave : function() {
        this.getViewManager().showView('groupsave');
    },

    onGroupSaved : function(grp, filters) {

        var name = grp.label ? grp.label : grp.category.label;
//
//        var group = Ext.create('Connector.model.FilterGroup', {
//            name : name,
//            filters : filters
//        });

        this.getStateManager().setFilters(filters);
        this.getViewManager().hideView('groupsave');

        var fsview = this.getViewManager().getViewInstance('filterstatus');
        if (fsview) {
            fsview.showMessage('Group \"' + Ext.String.ellipsis(name, 15, true) + '\" saved.', true);
        }
        else {
            console.warn('no filterstatus view available');
        }
    }
});