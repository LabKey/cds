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

        this.control('#cancelgroupsave', {
            click : this.onGroupCancel
        });

        this.callParent();
    },

    createView : function(xtype, context) {

        var v; // the view instance to be created

        if (xtype == 'groupsave') {
            v = Ext.create('Connector.view.GroupSave', {
                state : this.getStateManager()
            });

            this.application.on('groupsaved', this.onGroupSaved, this);
        }

        return v;
    },

    updateView : function(xtype, context) { },

    doGroupSave : function() {
        var view = this.getViewManager().getViewInstance('groupsave');

        var form = view.getCreateGroup().getComponent('creategroupform');

        if (form && form.isValid()) {
            var values = form.getValues();
            var state = this.getStateManager();

            var isLiveFilter = values['livefilter'] == 'live';

            state.moveSelectionToFilter();

            state.onMDXReady(function(mdx) {

                var me = this;

                var saveSuccess = function(response) {
                    var group = Ext.decode(response.responseText);
                    me.application.fireEvent('groupsaved', group, state.getFilters(true));
                    view.clearForm();
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

    onGroupCancel : function() {
        this.getViewManager().hideView('groupsave');
    },

    onGroupSave : function() {
        this.getViewManager().showView('groupsave');
    },

    onGroupSaved : function(grp, filters) {

        var group = Ext.create('Connector.model.FilterGroup', {
            name : grp.category.label,
            filters : filters
        });

        this.getStateManager().setFilters([group]);
        this.getViewManager().hideView('groupsave');
    },
});