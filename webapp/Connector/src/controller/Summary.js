Ext.define('Connector.controller.Summary', {

    extend : 'Connector.controller.AbstractViewController',

    stores : ['Summary'],

    views : ['GroupPreview', 'Summary'],

    init : function() {

        this.selected = {};

        this.control('summary', {
            afterrender: function(v) { v.refresh(); }
        });

        this.control('summarydataview', {
            itemclick: this.onSummarySelect
        });

        this.control('#dimensionmenu', {
            afterrender : function(m) {
                var s = this.getSummaryStore();
                if (s.getCount())
                {
                    for (var r=0; r < s.getCount(); r++) {
                        var rec = s.getAt(r);
                        m.add({
                            text : rec.data.label,
                            rec  : rec
                        });
                    }
                    m.show();
                }
                else
                {
                    s.on('load', function(s) {
                        for (var r=0; r < s.getCount(); r++) {
                            var rec = s.getAt(r);
                            m.add({
                                text : rec.data.label,
                                rec  : rec
                            });
                        }
                        m.show();
                    }, this, {single: true});
                    s.load();
                }
            }
        });

        /* Controls for Group Selections */
        this.control('grouplistview', {
            render    : function(view) {
                this.registerSelectGroup(view);
            },
            itemclick : this.onGroupSelect
        });

        this.control('groupsave', {
            groupsaved : function(grp, filter) {
                var grouplists = Ext.ComponentQuery.query('grouplistview');
                if (grouplists) {
                    for (var g=0; g < grouplists.length; g++) {
                        grouplists[g].store.load();
                    }
                }
            }
        });

        this.control('grouppreview', {
            groupchange : this.onGroupChange
        });

        /* Refresh event gets fired often on views so a delay is put in to prevent unncessary link registrations */
        this.summaryLinkTask = new Ext.util.DelayedTask(function(view) {
            var links = Ext.DomQuery.select('a', view.getEl().id);
            for (var i=0; i < links.length; i++) {
                Ext.get(links[i]).on('click', function(target, el) {
                    var nav = Ext.get(el.id).getAttribute('nav');
                    if (Ext.isString(nav) && nav.length > 0) {
                        this.navigate(nav);
                    }
                    this.linkNavigate = true;
                }, this);
            }
        }, this);

        this.control('summarydataview', {
            refresh: function(view) {
                this.summaryLinkTask.delay(100, null, null, [view]);
            }
        });

        this.callParent();
    },

    createView : function(xtype, config, context) {

        var type = '';
        var c = config || {};

        if (xtype == 'summary') {

            type = 'Connector.view.Summary';
            Ext.applyIf(c, {
                store : this.getSummaryStore(),
                ui    : 'custom'
            });
        }

        var v = Ext.create(type, c);

//        v.on('beforeshow', this.beforeSummaryShow, this);
        v.store.on('mdxerror', v.showMessage, v);
        v.store.on('beforeload', function(s) {
            this.displayLoad();
        }, v);
        v.store.on('load', function(s) {
            this.removeLoad();
        }, v);

        this.getStateManager().on('filterchange', v.onFilterChange, v);
        return v;
    },

    updateView : function(xtype, context) {},

    getSummaryStore : function() {
        if (!this.summaryStore) {
            this.summaryStore = this.getStore('Summary');
            this.summaryStore.state = this.getStateManager();
        }

        return this.summaryStore;
    },

    registerSelectGroup : function(v) {
        if (!this.selected[v.id]) {
            this.selected[v.id] = v;
            v.on('selectionchange', this.onSelectGroup, this);
        }
    },

    onGroupChange : function(preview, grp) {
        if (Ext.isArray(grp.data.filters)) {
            this.getStateManager().addGroup(grp);
            var view = this.getViewManager().getViewInstance('summary').getSummaryDataView();
            if (view) {
                view.getStore().setFilterSet(['groupselection']);
                view.getStore().load();
            }
        }
    },

    onGroupSelect : function(view, rec) {
        this.populateActiveFilter(rec);
    },

    populateActiveFilter : function(rec) {
        var summaryView = this.getViewManager().getViewInstance('summary');
        if (summaryView) {
            var r;
            if (!rec) {
                r = Ext.create('LABKEY.study.GroupCohort', {
                    label   : 'Current Active Filters',
                    filters : this.getStateManager().getFilters(),
                    type    : 'activefilters',
                    description : 'This is the set of filters that are currently applied.'
                });
            }
            else {
                r = rec;
            }

            summaryView.showPreview(r);
            if (this._feedback) {
                this._feedback.hide();
            }
        }
    },

    hideActiveFilter : function() {
        var summaryView = this.getViewManager().getViewInstance('summary');
        if (summaryView && summaryView.groupPreview) {
            summaryView.groupPreview.hide();
            if (this._feedback) {
                this._feedback.show();
            }
        }
    },

    onSelectGroup : function(selModel) {
        var view = selModel.view, vid; // ugh: documentation states that 'selectionchange' on Ext.view.View hands back View instance. It does not.
        for (vid in this.selected) {
            if (vid != view.id && this.selected.hasOwnProperty(vid)) {
                var model = this.selected[vid].getSelectionModel();

                model.suspendEvents();
                model.deselectAll();
                model.resumeEvents();
            }
        }
    },

    onSummarySelect : function(view) {
        var state = this.getStateManager(),
                hierarchy = view.getSelectionModel().getSelection()[0].data.hierarchy,
                group;

        // Display Explorer
        if (this.linkNavigate) {
            this.linkNavigate = false;
        }
        else {
            this.getViewManager().changeView('singleaxis', 'singleaxis/' + hierarchy.replace(/\./g, '/'));
        }

        // Copy the group filter to the state filter
        if (state.getPrivateSelection('groupselection'))
        {
            var filters = state.getPrivateSelection('groupselection');

            if (filters.length > 0 && filters[0].groupLabel != 'Current Active Filters') {
                var grp = Ext.create('Connector.model.FilterGroup', {
                    name : filters[0].data.groupLabel,
                    filters : filters
                });

                group = [grp];
                state.removePrivateSelection('groupselection');
            }
        }

        if (group) {
            state.setFilters(group);
        }
    }
});
