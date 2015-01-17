/*
 * Copyright (c) 2014-2015 LabKey Corporation
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
        var c = { ctx: context }, v;

        switch (xtype) {
            case 'signin':

                v = Ext.create('Connector.view.Signin', c);

                v.on('userSignedIn', function() { window.location.reload(); });

                break;
            case 'terms':
                var header = Ext.create('Connector.view.PageHeader', {
                    data: {
                        title: "Full Terms of Use Agreement: HIV Collaborative DataSpace",
                        buttons: {
                            back: true
                        },
                        scope: this
                    }
                });

                v = Ext.create('Connector.view.Page', {
                    contentViews: [ Ext.create('Connector.view.TermsOfUse', {}) ],
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
