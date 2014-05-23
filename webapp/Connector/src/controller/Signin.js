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

        if (true) {//(xtype == 'learn') {
            type = 'Connector.view.Signin';

            Ext.applyIf(c, {
                ui: 'custom',
                state: this.getStateManager()
            });

            var v = Ext.create(type, c);

            v.on('afterrender', function(v) {}, this);

            return v;
        }
    },

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
