/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Summary', {

    extend : 'Connector.controller.AbstractViewController',

    stores : ['Summary'],

    views : ['Summary'],

    init : function() {

        this.control('#dimensionmenu', {
            afterrender : function(m) {
                var updateDims = function(store) {
                    for (var r=0; r < store.getCount(); r++) {
                        var rec = store.getAt(r);
                        m.add({
                            text: rec.data.label,
                            rec: rec
                        });
                    }
                    m.show();
                };

                var s = this.getSummaryStore();
                if (s.getCount()) {
                    updateDims(s);
                }
                else {
                    s.on('load', updateDims, this, {single: true});
                    s.load();
                }
            }
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
            },
            itemclick: this.onSummarySelect
        });

        this.callParent();
    },

    createView : function(xtype, config, context) {

        var type = '';
        var c = config || {};

        if (xtype == 'summary') {

            type = 'Connector.view.Summary';
            Ext.applyIf(c, {
                store : this.getSummaryStore()
            });
        }

        var v = Ext.create(type, c);

        this.getStateManager().on('filterchange', v.onFilterChange, v);
        this.getViewManager().on('afterchangeview', v.onViewChange, v);

        return v;
    },

    updateView : function(xtype, context) { },

    getDefaultView : function() {
        return 'summary';
    },

    getSummaryStore : function() {
        if (!this.summaryStore) {
            this.summaryStore = this.getStore('Summary');
            this.summaryStore.state = this.getStateManager();
        }

        return this.summaryStore;
    },

    onSummarySelect : function(view) {
        var hierarchy = view.getSelectionModel().getSelection()[0].get('hierarchy');

        // Display Explorer
        if (this.linkNavigate) {
            this.linkNavigate = false;
        }
        else {
            var context = hierarchy.split('.');
            this.getViewManager().changeView('explorer', 'singleaxis', context);
        }
    }
});
