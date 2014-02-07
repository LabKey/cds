Ext.define('Connector.controller.FilterStatus', {

    extend: 'Connector.controller.AbstractViewController',

    requires: ['Ext.panel.Panel'],

    stores: ['FilterStatus'],

    views: ['DetailStatus', 'FilterSave', 'FilterStatus', 'GroupSave'],

    init : function() {

        this.control('app-main > #eastview > #navfilter', {
            afterrender : function(navfilter) {
                navfilter.add(this.createFilterStatus(), this.createFilterDetail());
            }
        });

        this.control('selectionstatus > dataview', {
            itemclick : this.onSelectionClick
        });

        this.control('selectionview', {
            operatorchange : function(config) {
                this.getStateManager().setFilterOperator(config.filterId, config.value);
            }
        });

        this.control('selectionpanel > selectionview', {
            removefilter : function(filterId, hName, uname) {
                this.getStateManager().removeSelection(filterId, hName, uname);
            }
        });

        this.control('filterpanel > selectionview', {
            removefilter : function(filterId, hName, uname) {
                this.getStateManager().removeFilter(filterId, hName, uname);
            }
        });

        this.control('filterpanel > container > #savegroup', {
            click : this.onGroupSave
        });

        this.control('groupsave > form > toolbar > #dogroupsave', {
            click : this.doGroupSave
        });

        this.control('filtersave > form > toolbar > #cancelsave', {
            click : this.onFilterCancel
        });

        this.control('groupsave > form > toolbar > #cancelgroupsave', {
            click : this.onGroupCancel
        });

        this.control('filterpanel > container > #clear', {
            click : this.onFilterClear
        });

        this.control('filterpanel > toolbar > #sClear', {
            click : this.onSelectionClear
        });

        this.control('#overlap', {
            click : this.runSelectToFilterAnimation
        });

        this.callParent();
    },

    getStateStore : function() {
        var store = this.getStore('FilterStatus');
        var state = this.getStateManager();
        store.state = state;
        return store;
    },

    createFilterDetail : function() {
        var store = this.getStateStore();
        store.load();

        var view = Ext.create('Connector.view.DetailStatus', {
            store : store
        });

        var state = this.getStateManager();
        state.on('filtercount', view.onFilterChange, view);
        state.on('filterchange', view.onFilterChange, view);
        state.on('selectionchange', view.onFilterChange, view);

        return view;
    },

    createFilterStatus : function() {
        var store = this.getStateStore();
        var state = this.getStateManager();
        store.load();

        var view = Ext.create('Connector.view.FilterStatus', {
            store: store,
            selections: state.getSelections(),
            filters: state.getFilters()
        });

        state.on('filtercount', view.onFilterChange, view);
        state.on('filterchange', view.onFilterChange, view);
        state.on('selectionchange', view.onSelectionChange, view);

        return view;
    },

    runSelectToFilterAnimation : function(b) {
        var p = b.up('panel');
        var me = this;
        p.dockedItems.items[0].getEl().fadeOut();
        Ext.get(Ext.query('.header', p.getEl().id)[0]).fadeOut({
            listeners : {
                afteranimate : function(){
                    p.getEl().slideOut('t', {
                        duration  : 250,
                        listeners : {
                            afteranimate : function() {
                                p.dockedItems.items[0].getEl().fadeIn();
                                me.getStateManager().moveSelectionToFilter();
                            },
                            scope : p
                        }
                    });
                },
                scope: p
            }
        });
    },

    createView : function(xtype, context) {

        var v; // the view instance to be created

        if (xtype == 'filterstatus') {
            v = this.createFilterStatus();
        }

        if (xtype == 'filtersave') {
            v = Ext.create('Connector.view.FilterSave', {
                flex : 1
            });
        }

        if (xtype == 'groupsave') {
            v = Ext.create('Connector.view.GroupSave', {
                state : this.getStateManager(),
                flex  : 1
            });

            this.getStateManager().on('selectionchange', v.onSelectionChange, v);
            v.on('groupsaved', this.onGroupSaved, this);
        }

        return v;
    },

    updateView : function(xtype, context) { },

    onFilterCancel : function() {
        this.getViewManager().hideView('filtersave');
    },

    onFilterClear : function() {
        if (this.getStateManager().hasFilters()) {
            this.getStateManager().clearFilters();
        }
    },

    onFilterSave : function() {
        this.getViewManager().showView('filtersave');
    },

    onGroupCancel : function() {
        this.getViewManager().hideView('groupsave');
    },

    onGroupSave : function() {
        this.getViewManager().showView('groupsave');
    },

    doGroupSave : function() {
        var view = this.getViewManager().getViewInstance('groupsave');

        var form = view.getForm();

        view.hideError();

        if (form && form.getForm().isValid()) {

            var values = form.getValues(),
                    state = this.getStateManager();

            if (values.groupselect) {
                state.moveSelectionToFilter();
            }

            var isLiveFilter = values.livefilter ? true : false;

            state.onMDXReady(function(mdx){

                var saveSuccess = function(response) {
                    var group = Ext.decode(response.responseText);
                    view.requestGroupSave(group, state.getFilters(true));
                    view.clearForm();
                };

                var saveFailure = function(response) {
                    var json = Ext.decode(response.responseText);
                    if (json.exception)
                    {
                        if (json.exception.indexOf('There is already a group named') > -1 ||
                                json.exception.indexOf('duplicate key value violates') > -1)
                        {
                            // custom error response for invalid name
                            view.showError('The name you have chosen is already in use; please choose a different name.');
                        }
                        else
                            view.showError(json.exception);
                    }
                    else
                    {
                        Ext.Msg.alert('Failed to Save', response.responseText);
                    }
                };

                LABKEY.app.controller.Filter.doGroupSave(mdx, saveSuccess, saveFailure, {
                    label : values.groupname,
                    description : values.groupdescription,
                    filters : Ext4.Array.pluck(state.getFilters(true), 'data'),
                    isLive : isLiveFilter
                });

            }, this);
        }
    },

    onGroupSaved : function(grp, filters) {

        var group = Ext.create('Connector.model.FilterGroup', {
            name : grp.category.label,
            filters : filters
        });

        this.getStateManager().setFilters([group]);
        this.getViewManager().hideView('groupsave');
    },

    onSelectionClick : function() {
        this.getStateManager().clearSelections();
    },

    onSelectionClear : function() {
        this.getStateManager().clearSelections();
    }
});
