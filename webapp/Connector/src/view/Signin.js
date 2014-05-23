/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Signin', {

    extend : 'Ext.container.Container',

    alias  : 'widget.signin',

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    ui: 'custom',

    items: [{
    	xtype: 'container',
    	cls: 'signin-left',
    	layout: {
    		type: 'vbox',
    		align: 'stretch'
    	}, 
    	flex: 1,
    	items: [{
    		xtype: 'homeheader'
    	}, {
	    	xtype: 'about',
	    	flex: 1
	    }]
    }, {
    	xtype: 'component',
    	cls: 'signin-right',
	    html : new Ext.XTemplate(
	        '<tpl>',
	        	'<input type="checkbox" style="float: left;"/>',
	            '<div style="padding-left: 30px;" class="terms">',
	            	'<p>I agree to protect restricted data, credit others, and obtain official approval to publish.</p>',
	            	'<p>I have read, understood, and agree to the terms of use available below.</p>',
	            '</div>',
	            '<div class="controls" style="opacity: 0.35;">',
		            '<div class="signin">',
		            	'<div>',
				            '<span>Email address:</span>',
				            '<input disabled/>',
			            '</div>',
			            '<div>',
				            '<span>Password:</span>',
				            '<input disabled type="password"/>',
			            '</div>',
		            '</div>',
		        	'<input disabled type="checkbox" style="float: left;"/>',
		            '<div style="padding-left: 30px;">',
		            	'<div>Remember my email address</div>',
		            	'<a href="">Forgot your password?</a>',
		            '</div>',
	            '</div>',
	            '<p>',
	            	'To access and view data in this site you must agree to the Terms of Use for HIV Vaccine Data Connector, which are available for review by clicking the link below. Please read these terms carefully. By accessing this site you agree to be bound by these terms. These terms are subject to change. Any changes will be incorporated into the terms posted to this site from time to time. If you do not agree with these terms, please do not access the site. If you are not an authorized user of this site you are hereby notified that any access or use of the information herein is strictly prohibited.',
	            '</p>',
	            '<a href="">Terms of Use of the HIV Vaccine Data Connector</a>',
	        '</tpl>').apply(),
	    width: 450
    }],

    initComponent : function() {
    	this.callParent();


    }
});
