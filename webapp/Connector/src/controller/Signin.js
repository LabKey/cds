/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Signin', {

    extend: 'Connector.controller.AbstractViewController',

    views: ['Signin', 'TermsOfUse'],

    init : function() {

        this.control('homeheader', {
            boxready: this.resolveStatistics
        });

        this.control('connectorheader', {
            userSignedOut : function() {
                LABKEY.user.isSignedIn = false;
                window.location.reload();
            }
        });

        /* Flag that is true when an unauthorized request has been handled */
        this.BAD_AUTH = false;
        var me = this;

        /* If the user recieves an unauthoriazed, return them to login screen */
        this.application.on('httpunauthorized', function(status, text) {
            me.BAD_AUTH = true;
            Ext.Ajax.abortAll();
            LABKEY.user.isSignedIn = false;
            Connector.getService('Messaging').pushMessage('Your session has timed out. Please login to continue.');
            window.location.reload();
            return false;
        });

        /* If requests have been aborted due to BAD_AUTH then ignore them */
        this.application.on('httpaborted', function(status, text) {
            return !me.BAD_AUTH;
        });

        this.callParent();
    },

    createView : function(xtype, context) {
        var c = { ctx: context };
        var type;
        var v;

        switch (xtype) {
        case 'signin':
            type = 'Connector.view.Signin';

            Ext.applyIf(c, {
                ui: 'custom',
                state: this.getStateManager()
            });

            v = Ext.create(type, c);

            v.on('userSignedIn', function() {
                // Start loading
                this.application.olap.load();
                window.location.reload();
            }, this);
            break;
        case 'terms':
            var header = Ext.create('Connector.view.PageHeader', {
                data: {
                    label : "<h1>Full Terms of Use Agreement: HIV Collaborative DataSpace</h1>",
                    buttons : {
                        back: true
                    },
                    scope : this
                }
            });

            v = Ext.create('Connector.view.Page', {
                contentViews: [Ext.create('Connector.view.TermsOfUse', {})],
                header: header,
                pageID: 'terms'
            });

            break;
        }

        return v;
    },

    updateView : function(xtype, context) { },

    getDefaultView : function() {
        return 'signin';
    },

    showAction : function(xtype, context) {
    	//
	},

    resolveStatistics : function(view) {
        var statDisplay = view.getComponent('statdisplay');
        if (statDisplay) {

            Statistics.resolve(function(stats) {
                statDisplay.update({
                    nstudy: stats.primaryCount,
                    ndatapts: stats.dataCount
                });
            }, this);
        }
    }
});
