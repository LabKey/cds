/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Summary', {

    extend : 'Connector.controller.AbstractViewController',

    stores : ['Summary'],

    views : ['Summary'],

    isService: true,

    init : function() {

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

        /* Refresh event gets fired often on views so a delay is put in to prevent unnecessary link registrations */
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
                store: this.getStore('Summary')
            });
        }

        var v = Ext.create(type, c);

        Connector.getState().on('filterchange', v.onFilterChange, v);
        this.getViewManager().on('afterchangeview', v.onViewChange, v);

        return v;
    },

    updateView : function(xtype, context) { },

    getViewTitle : function(xtype, context) {
        if (xtype === 'summary') {
            return 'Find';
        }
    },

    getDefaultView : function() {
        return 'summary';
    },

    onSummarySelect : function(view) {
        var defaultLvl = view.getSelectionModel().getSelection()[0].get('defaultLvl');

        // Display Explorer
        if (this.linkNavigate) {
            this.linkNavigate = false;
        }
        else {
            var context = defaultLvl.split('.');
            this.getViewManager().changeView('explorer', 'singleaxis', context);
        }
    }
});
