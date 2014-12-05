/*
 * Copyright (c) 2014 LabKey Corporation
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

        this.callParent();
    },

    onAppReady : function() {
        this.callParent();
        this.userChanged();
    },

    userChanged : function() {
        var body = Ext.getBody();

        this.eastview.setVisible(LABKEY.user.isSignedIn);
        this.logoutlink.setVisible(LABKEY.user.isSignedIn);
    }
});
