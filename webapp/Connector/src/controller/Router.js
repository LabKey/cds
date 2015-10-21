/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Router', {
    extend: 'LABKEY.app.controller.Route',

    init : function() {
        /* This control is responsible for loading the application */
        this.control(
            'app-main', {
                afterrender: this.onAppReady
            }
        );

        this.control('app-main > #eastview', {
            afterrender: function(view) {
                this.eastview = view;
            },
            scope: this
        });

        this.control('#logout', {
            afterrender: function(view) {
                this.logoutlink = view;
            },
            scope: this
        });

        this.application.on('userChanged', this.userChanged, this);

        /* Flag that is true when an unauthorized request has been handled */
        var MSG_KEY = 'SIGNIN';
        this.BAD_AUTH = false;
        var me = this;

        /* If the user recieves an unauthorized, return them to login screen */
        this.application.on('httpunauthorized', function(status, text) {
            me.BAD_AUTH = true;
            Ext.Ajax.abortAll();
            LABKEY.user.isSignedIn = false;
            Connector.getService('Messaging').pushMessage(MSG_KEY, 'Your session has timed out. Please login to continue.');
            window.location.reload();
            return false;
        });

        /* If requests have been aborted due to BAD_AUTH then ignore them */
        this.application.on('httpaborted', function(status, text) {
            return !me.BAD_AUTH;
        });

        this.callParent();

        /* Ensure that we clear out the messaging each time the app loads to avoid showing stale messages */
        this._msgs = Connector.getService('Messaging').popMessages(MSG_KEY);
    },

    onAppReady : function() {
        this.callParent();
        this.userChanged();
    },

    userChanged : function() {
        this.eastview.setVisible(LABKEY.user.isSignedIn);
    }
});
