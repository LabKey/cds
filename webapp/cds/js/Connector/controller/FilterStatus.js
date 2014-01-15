/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.controller.FilterStatus', {

    extend : 'Connector.controller.AbstractViewController',

    stores : ['FilterStatus'],

    views  : ['FilterSave', 'FilterStatus', 'GroupSave'],

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
        Ext4.get(Ext4.query('.header', p.getEl().id)[0]).fadeOut({
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

            v = Ext4.create('Connector.view.FilterStatus', {
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
            var p = Ext4.create('Ext.Panel', {
                ui: 'custom',
                items : [{
                    xtype  : 'navigation',
                    ui     : 'navigation',
                    itemId : 'primarynav',
                    viewConfig : {
                        height : 170,
                        arrow : 'left',
                        mapping : [{
                            label : 'Home',
                            disabled: true
//                            value : 'singleaxis'
                        },{
                            label : 'Learn about studies, assays',
                            value : 'learn'
                        },{
                            label : 'Find subjects',
                            value : 'summary'
                        },{
                            label : 'Plot data',
                            value : 'plot'
                        },{
                            label : 'View data grid',
                            value : 'datagrid'
                        }]
                    }
                }, v]
            });

            this.getViewManager().register(v);

            return [p, false];
        }

        if (xtype == 'filtersave') {
            v = Ext4.create('Connector.view.FilterSave', {
                flex : 1
            });
        }

        if (xtype == 'groupsave') {
            v = Ext4.create('Connector.view.GroupSave', {
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

            state.onMDXReady(function(mdx){

                mdx.queryParticipantList({
                    useNamedFilters : ['statefilter'],
                    success : function(cs) {

                        var grpData = {
                            label : values.groupname,
                            participantIds : Ext4.Array.pluck(Ext4.Array.flatten(cs.axes[1].positions),'name'),
                            description : values.groupdescription,
                            shared : false,
                            type : 'list',
                            filters : Ext4.encode(Ext4.Array.pluck(state.getFilters(true), 'data')) // only send the data
                        };

                        Ext4.Ajax.request({
                            url : LABKEY.ActionURL.buildURL('participant-group', 'createParticipantCategory'),
                            method: 'POST',
                            success: function(response) {
                                var group = Ext4.decode(response.responseText);
                                view.requestGroupSave(group, state.getFilters(true));
                                view.clearForm();
                            },
                            failure : function(response) {
                                var json = Ext4.decode(response.responseText);
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
                                    Ext4.Msg.alert('Failed to Save', response.responseText);
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

    onGroupSaved : function(grp, filters) {

        var group = Ext4.create('Connector.model.FilterGroup', {
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
