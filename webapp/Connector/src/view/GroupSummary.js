/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.GroupSummary', {

    extend : 'Ext.panel.Panel',

    alias : 'widget.groupsummary',

    requires: ['Connector.model.Group'],

    group: undefined,

    groupId: undefined,

    constructor : function(config)
    {
        this.callParent([config]);

        this.addEvents('requestgroupdelete');
    },

    initComponent : function()
    {
        if (!this.groupId)
        {
            throw 'groupId must be specified';
        }

        this.items = [];

        this.callParent();

        if (this.store.getCount() > 0)
        {
            this.loadGroup();
        }
        else
        {
            this.store.on('load', this.loadGroup, this);
        }
    },

    _getActiveGroup : function()
    {
        var group;
        var idx = this.store.find('id', this.groupId, false, true, true);
        if (idx > -1)
        {
            group = this.store.getAt(idx);
        }
        return group;
    },

    loadGroup : function()
    {
        this.group = this._getActiveGroup();
        if (this.group)
        {
            this.removeAll();
            this.add([this.generateHeader(this.group), this.generateBody(this.group)]);
            this.doLayout();
        }
        else
        {
            Connector.getApplication().getController('Connector').showNotFound();
        }
    },

    generateHeader : function(group)
    {
        return Ext.create('Connector.view.PageHeader', {
            title: group.get('label'),
            upText: 'Group',
            upLink: {
                controller: 'home'
            },
            tabs: [{
                label: 'Details'
            }],
            buttons: [{
                xtype: 'button',
                text: 'Edit details',
                ui: 'linked',
                itemId: 'editgroupdetails',
                group: group
            },{
                xtype: 'button',
                text: 'Delete',
                ui: 'linked',
                handler: this.onDelete,
                scope: this
            }]
        });
    },

    onDelete : function()
    {
        if (this.group)
        {
            Ext.Msg.show({
                title: 'Delete Group',
                msg: 'Are you sure you want to delete "' + Ext.htmlEncode(this.group.get('label')) + '"?',
                // buttons are in a fixed order that cannot be changed without subclassing Ext.window.Messagebox
                // [ok yes no cancel] is the predefined order. We want the button order cancel -> delete. That's why
                // even though we want a cancel button, we are using the Ext.Msg.OK constant.
                buttons: Ext.Msg.OK+Ext.Msg.YES,
                buttonText: {
                    ok: 'Cancel',
                    yes: 'Delete'
                },
                fn: function(id) {
                    if (id === 'yes') {
                        this.fireEvent('requestgroupdelete', this.group.get('id'));
                    }
                },
                scope: this
            });
        }
    },

    generateBody : function(group)
    {
        return Ext.create('Connector.view.GroupSummaryBody', {
            group: group
        });
    },

    updateView : function(id)
    {
        if (id !== undefined && id !== null) {
            this.groupId = id;
        }

        this.loadGroup();
    },

    getGroup : function()
    {
        if (this.group)
        {
            return Ext.clone(this.group.data);
        }
    }
});

Ext.define('Connector.view.GroupSummaryBody', {
    extend : 'Ext.container.Container',

    margin: '25 25 0 25',

    layout: {
        type: 'hbox'
    },

    group: undefined,

    constructor : function(config)
    {
        this.callParent([config]);

        this.addEvents('loadgroupfilters', 'requestfilterundo');
    },

    initComponent: function()
    {
        this.items = [{
            xtype: 'container',
            flex: 1,
            items: [
                this.getLimitedAccessMsg(),
                this.getUndoMsg(),
                this.getApplyMsg(),
            {
                xtype: 'box',
                html: '<div class="module"><h3>Description</h3></div>'
            },{
                xtype: 'displayfield',
                itemId: 'descDisplay',
                margin: '0 0 20 0',
                htmlEncode: true,
                value: this._getDescription(this.group)
            }]
        }];

        var rightColumn = Ext.create('Ext.container.Container', {
            flex: 1,
            items: []
        });

        var plotFilter;
        if (this.group && this.group.get('containsPlot') === true)
        {
            Ext.each(this.getGroupFilters(this.group), function (filter) {
                if (filter.isPlot() && !filter.isGrid()) {
                    plotFilter = filter;
                    return false;
                }
            });
        }
        if (plotFilter)
        {
            rightColumn.add({
                xtype: 'box',
                html: '<div class="module"><h3>In the plot</h3></div>'
            });
            rightColumn.add(Connector.view.PlotPane.plotFilterContent(plotFilter));
            rightColumn.add({
                xtype: 'button',
                text: 'View in Plot',
                itemId: 'groupplotview',
                style: 'margin-top: 20px'

            })
        }
        else
        {
            rightColumn.add({
                xtype: 'box',
                html: '<div class="module"><h3>No plot saved for this group.</h3></div>'
            });
        }

        this.items.push(rightColumn);

        this.callParent();

        Connector.getState().onReady(function()
        {
            this.validateFilters();
        }, this);
    },

    getLimitedAccessMsg : function()
    {
        if (!this._limitedAccess)
        {
            this._limitedAccess = Ext.create('Ext.Component', {
                margin: '0 20 20 0',
                renderTpl: new Ext.XTemplate('<b>Note:&nbsp;</b>'
                        + 'You may not have access to view all participants in this group. '
                        + 'Please contact your administracotrs to learn more.'),
                hidden: true
            });
        }

        return this._limitedAccess;
    },

    checkUserAccess: function()
    {
        /**
         *  Show warning message if user does not have access to all studies with DATA ADDED (lacking permission to an empty study shouldn’t trigger warning).
         *  This approach may result in false positive warning as the group may not include the study that the user is restricted from.
         *  Currently there is no way to query for the set of studies included in a filter group bypassing permission check.
         *  May investigate in the future on how to reliably report on what the user doesn't have access to.
         */
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'UserStudyAccess',
            success: function(studyAccessData){
                var studyAccessList = studyAccessData.rows;
                Ext.each(studyAccessList, function (studyAccess) {
                    if (!studyAccess.accessible)
                    {
                        this.getLimitedAccessMsg().show();
                        return false;
                    }
                }, this)
            },
            scope: this
        });
    },

    getUndoMsg : function()
    {
        if (!this._undo)
        {
            this._undo = Ext.create('Ext.Component', {
                margin: '0 0 20 0',
                renderTpl: new Ext.XTemplate(
                    'Group loaded. Your filters have been replaced. <a href="#" onclick="return false;" class="undogroup nav">Undo</a>'
                ),
                renderData: {},
                renderSelectors: {
                    undoLink: 'a.undogroup'
                },
                listeners: {
                    afterrender: {
                        fn: function(cmp)
                        {
                            cmp.undoLink.on('click', function()
                            {
                                Connector.getState().requestFilterUndo();
                                this.getUndoMsg().hide();
                                this.getApplyMsg().show();
                                return false;
                            }, this);
                        },
                        scope: this,
                        single: true
                    }
                }
            });
        }

        return this._undo;
    },

    getApplyMsg : function()
    {
        if (!this._apply)
        {
            this._apply = Ext.create('Ext.Component', {
                hidden: true,
                margin: '0 0 20 0',
                renderTpl: new Ext.XTemplate(
                    'This group has filters which can be applied as active filters. <a href="#" onclick="return false;" class="applygroup nav">Apply</a>'
                ),
                renderData: {},
                renderSelectors: {
                    applyLink: 'a.applygroup'
                },
                listeners: {
                    afterrender: {
                        fn: function(cmp)
                        {
                            cmp.applyLink.on('click', function()
                            {
                                this.validateFilters();
                                this.getApplyMsg().hide();
                                this.getUndoMsg().show();
                            }, this);
                        },
                        scope: this,
                        single: true
                    }
                }
            });
        }

        return this._apply;
    },

    updateView: function(group)
    {
        this.group = group;
        this.getComponent('descDisplay').setValue(this._getDescription(this.group));
        this.doLayout();
    },

    _getDescription : function(group)
    {
        var desc = '';

        if (group) {
            desc = group.get('description');
            if (Ext.isEmpty(desc)) {
                desc = 'No description given.';
            }
        }

        return desc;
    },

    validateFilters : function()
    {
        if (this.group)
        {
            var filters = this.getGroupFilters(this.group);

            if (filters.length > 0) {
                this.checkUserAccess();
                Connector.getState().onMDXReady(function(mdx) {
                    var invalidMembers = [];
                    var validatedFilters = filters.filter(function(f) {
                        var validMembers = f.getMembers().filter(function(m) {
                            var isInvalidMember = !Ext.isDefined(m.uniqueName) ||
                                    !Ext.isDefined(mdx.getMember(m.uniqueName));

                            if (isInvalidMember) {
                                Ext.Array.push(invalidMembers, m.uniqueName);
                                return false;
                            }
                            return true;
                        });
                        f.set({members: validMembers});
                        return validMembers.length !== 0;
                    });

                    if (invalidMembers.length > 0) {
                        var msg = 'This saved group includes criteria no longer available in the data: ' +
                                '<ul><li>' +
                                invalidMembers.join('</li><li>') +
                                '</li></ul>';
                        msg = msg + '<p ">Do you want to apply the filters without these criteria?</p>';
                        Ext.Msg.show({
                            title: 'Error',
                            msg: msg,
                            // buttons are in a fixed order that cannot be changed without subclassing Ext.window.Messagebox
                            // [ok yes no cancel] is the predefined order. We want the button order cancel -> delete. That's why
                            // even though we want a cancel button, we are using the Ext.Msg.OK constant.
                            buttons: Ext.Msg.OK+Ext.Msg.YES,
                            minWidth: 400,
                            cls: 'group-filter-error-popup',
                            buttonText: {
                                ok: 'No',
                                yes: 'Yes'
                            },
                            fn: function(id) {
                                if (id === 'yes') {
                                    this.applyFilters(validatedFilters);
                                }
                            },
                            scope: this
                        });
                    }
                    else {
                        this.applyFilters(validatedFilters);
                    }
                }, this);
            }
        }
    },

    applyFilters : function(validatedFilters) {
        Connector.getState().setFilters(validatedFilters);

        Connector.getApplication().fireEvent('grouploaded', Ext.clone(this.group.data), validatedFilters);
    },

    getGroupFilters : function(group)
    {
        var groupFilters = group.get('filters'),
            filters = [];

        if (Ext.isString(groupFilters))
        {
            Ext.each(LABKEY.app.model.Filter.fromJSON(groupFilters), function(filter)
            {
                filters.push(Ext.create('Connector.model.Filter', filter));
            });
        }
        else
        {
            filters = groupFilters;
        }

        return filters;
    }
});
