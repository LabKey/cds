/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Navigation', {

    extend : 'Connector.controller.AbstractViewController',

    views : ['Navigation'],

    init : function() {

        // Since the Connector.panel.Header does not have its own controller this controller is provided.
        this.control('connectorheader > #logo', {
            afterrender : function(logo) {
                logo.getEl().on('click', function() {
                    this.getViewManager().changeView(this.application.defaultController);
                }, this);
            }
        });

        this.control('app-main > #eastview > #navfilter > navigation > dataview', {
            itemclick : function(v, rec) {
                var controller = rec.get('controller');
                if (controller) {
                    this.getViewManager().changeView(controller);
                }
            }
        });

        this.control('#primarynav', {
            afterrender : function(n) {
                this.primaryNav = n;
                this.markActiveSelection();
            }
        });

        this.getViewManager().on('afterchangeview', this.onViewChange, this);
    },

    createView : Ext.emptyFn,

    updateView : Ext.emptyFn,

    markActiveSelection : function() {
        if (this.primaryNav && this.active) {
            var navName = this.active;
            if (navName === 'explorer') {
                // explorer is the detailed view for summary but lack direct navigation
                navName = 'summary';
            }
            this.primaryNav.getNavigationView().selectByView(navName);
        }
    },

    onViewChange : function(controller) {
        this.active = controller.toLowerCase();
        this.markActiveSelection();
    }
});
