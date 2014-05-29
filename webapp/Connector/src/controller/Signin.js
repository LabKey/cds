/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Signin', {

    extend: 'Connector.controller.AbstractViewController',

    views: ['Signin'],

    createView : function(xtype, context) {
        var c = { ctx: context };

        if (true) {
            type = 'Connector.view.Signin';

            Ext.applyIf(c, {
                ui: 'custom',
                state: this.getStateManager()
            });

            var v = Ext.create(type, c);

            v.on('userSignedIn', function() {
                // Start loading
                this.application.olap.load();
                this.application.fireEvent('userChanged');
                window.location.href = window.location.href;
            }, this);

            return v;
        }
    },

    updateView : function(xtype, context) { },

    getDefaultView : function() {
        return 'signin';
    },

    showAction : function(xtype, context) {
    	//
	},

    init : function() {
        this.callParent();
    }
});
