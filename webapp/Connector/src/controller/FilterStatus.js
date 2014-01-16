Ext.define('Connector.controller.FilterStatus', {

    extend: 'Connector.controller.AbstractViewController',

    requires: ['Ext.panel.Panel'],

    stores: ['FilterStatus'],

    views: ['FilterSave', 'FilterStatus', 'GroupSave'],

    init : function() {

        this.control('selectionstatus > dataview', {
            itemclick : this.onSelectionClick
        });

        this.control('hierarchyfilter', {
            operatorchange : function(config) {
                this.getStateManager().setFilterOperator(config.filterId, config.value);
            },
            removefilter : function(filterId, hName, uname, selectionMode) {
                if (selectionMode) {
                    this.getStateManager().removeSelection(filterId, hName, uname);
                }
                else {
                    this.getStateManager().removeFilter(filterId, hName, uname);
                }
            }
        });

        this.control('filterpanel > toolbar > #savegroup', {
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

        this.control('filterpanel > toolbar > #clear', {
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
            var s = this.getStore('FilterStatus');
            var state = this.getStateManager();
            s.state = state;
            s.load();

            v = Ext.create('Connector.view.FilterStatus', {
                ui : 'custom',
                store : s,
                selections : state.getSelections(),
                filters : state.getFilters()
            });

            state.on('filtercount',     v.onFilterChange, v);
            state.on('filterchange',    v.onFilterChange, v);
            state.on('selectionchange', v.onSelectionChange, v);

            // TODO: Should find a way to remove this wrapper panel and return an array of views to be injected
            // TODO: Use the navigation controller to declare Navigation UI
            var p = Ext.create('Ext.panel.Panel', {
                ui: 'custom',
                items: [{
                    xtype: 'navigation',
                    ui: 'navigation',
                    itemId: 'primarynav',
                    viewConfig: {
                        height: 170,
                        arrow: 'left',
                        mapping: [{
                            label: 'Home',
                            disabled: true
//                            value: 'singleaxis'
                        },{
                            label: 'Learn about studies, assays',
                            value: 'learn'
                        },{
                            label: 'Find subjects',
                            value: 'summary'
                        },{
                            label: 'Plot data',
                            value: 'plot'
                        },{
                            label: 'View data grid',
                            value: 'datagrid'
                        }]
                    }
                }, v]
            });

            this.getViewManager().register(v);

            return [p, false];
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
        if (this.getStateManager().hasFilters())
        {
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

    filtersToJSON : function(filters, isLive) {
        return Ext4.encode({
            isLive : isLive,
            filters : Ext4.Array.pluck(filters, 'data')
        });
    },

    filtersFromJSON : function(jsonFilter) {
        var filterWrapper = Ext4.decode(jsonFilter);
        return filterWrapper.filters;
    },

    doGroupSave : function() {
        var view = this.getViewManager().getViewInstance('groupsave');

        var form = view.getForm();

        view.hideError();

        if (form && form.getForm().isValid()) {

            var values = form.getValues(),
                    state = this.getStateManager(),
                    me = this;

            if (values.groupselect) {
                state.moveSelectionToFilter();
            }

            var isLiveFilter = values.livefilter ? true : false;

            state.onMDXReady(function(mdx){

                mdx.queryParticipantList({
                    useNamedFilters : ['statefilter'],
                    success : function(cs) {

                        var grpData = {
                            label : values.groupname,
                            participantIds : Ext.Array.pluck(Ext.Array.flatten(cs.axes[1].positions),'name'),
                            description : values.groupdescription,
                            shared : false,
                            type : 'list',
                            filters : me.filtersToJSON(state.getFilters(true), isLiveFilter)
                        };

                        Ext.Ajax.request({
                            url : LABKEY.ActionURL.buildURL('participant-group', 'createParticipantCategory'),
                            method: 'POST',
                            success: function(response) {
                                var group = Ext.decode(response.responseText);
                                view.requestGroupSave(group, state.getFilters(true));
                                view.clearForm();
                            },
                            failure : function(response) {
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
                            },
                            jsonData: grpData,
                            headers : {'Content-Type' : 'application/json'},
                            scope   : me
                        });
                    }
                });

            }, this);
        }
    },

    /**
     * Convert the persisted 'CDS' filter into the appropriate set of Olap filters.
     * @param data - the persisted filter for this group as saved by doGroupSave
     */
    getOlapFilters : function(data) {
        var olapFilters = [];
        var cdsFilter = Ext4.create('Connector.model.Filter');
        for (var i = 0; i < data.length; i++) {
            cdsFilter.data = data[i];
            olapFilters.push(cdsFilter.getOlapFilter());
        }
        return olapFilters;
    },

    /**
     * This function is called outside of the App from an admin jsp.
     * @param mdx - from external cube
     * @param grpData - config data that has been received from the server.  This is analagous to the grpData used
     * to save the group
     */
    doGroupUpdate : function(mdx, grpData, onGroupUpdated) {
        mdx.queryParticipantList({
            filter : this.getOlapFilters(this.filtersFromJSON(grpData.filters)),
            group : grpData,
            success : function (cs, mdx, config) {
                var group = config.group;
                var ids = Ext4.Array.pluck(Ext4.Array.flatten(cs.axes[1].positions),'name');
                LABKEY.ParticipantGroup.updateParticipantGroup({
                    rowId : group.rowId,
                    participantIds : ids,
                    success : function(group, response) {
                        if (onGroupUpdated)
                            onGroupUpdated.call(this, group);
                    }
                });
            }
        });
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
