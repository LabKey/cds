/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.SigninForm', {

    extend : 'Ext.Component',

    alias : 'widget.signinform',

    bubbleEvents: ['userSignedIn'],

	cls: 'signin-right auto-scroll-y',

    width: 450,

    tpl : new Ext.XTemplate(
	    '<tpl>',
	    	'<form>',
		    	'<input id="termsCheck" type="checkbox" {[this.agreeToTermsCheckedAttr(values)]} style="float: left;"/>',
		        '<div style="padding-left: 30px;" class="terms">',
		        	'<p>I agree to protect restricted data, credit others, and obtain official approval to publish.</p>',
		        	'<p>I have read, understood, and agree to the terms of use available below.</p>',
		        '</div>',
		        '<div class="controls" style="opacity: {[this.disabledOpacity(values)]};">',
		            '<div class="signin">',
		            	'<div>',
				            '<span>Email address:</span>',
				            '<input id="emailField" {[this.disabledAttr(values)]} value="{email}"/>',
			            '</div>',
			            '<div>',
				            '<span>Password:</span>',
				            '<input id="passwordField" {[this.disabledAttr(values)]} type="password"/>',
			            '</div>',
		            '</div>',
		        	'<input id="rememberMeCheck" {[this.rememberEmailCheckedAttr(values)]} {[this.disabledAttr(values)]} type="checkbox" style="float: left;"/>',
		            '<div style="padding-left: 30px; padding-bottom: 5px;">',
		            	'<div>Remember my email address</div>',
		            	'<a href="' + LABKEY.contextPath + '/login/home/resetPassword.view">Forgot your password?</a>',
		            '</div>',
		            '<tpl if="error">',
		            	'<p class="errormsg">',
		            		'{error}',
		            	'</p>',
		            '</tpl>',
		            '<input class="x-btn-rounded-inverted-accent-small {[this.disabledAttr(values) || \'enabled\']}" type="submit" {[this.disabledAttr(values)]} id="signin" value="sign in">',
		        '</div>',
		        '<p>',
		        	'To access and view data in this site you must agree to the Terms of Use for HIV Collaborative DataSpace, which are available for review by clicking the link below. Please read these terms carefully. By accessing this site you agree to be bound by these terms. These terms are subject to change. Any changes will be incorporated into the terms posted to this site from time to time. If you do not agree with these terms, please do not access the site. If you are not an authorized user of this site you are hereby notified that any access or use of the information herein is strictly prohibited.',
		        '</p>',
		        '<a href="#signin/terms">Terms of Use of the HIV Collaborative DataSpace</a>',
	    	'</form>',
	    '</tpl>', {
	    	disabledAttr : function(model) {
	    		if (!model.agreeToTerms) {
	    			return 'disabled';
	    		}
	    		return '';
	    	},
	    	disabledOpacity : function(model) {
	    		if (!model.agreeToTerms) {
	    			return 0.35;
	    		}
	    		return 1;
	    	},
	    	agreeToTermsCheckedAttr : function(model) {
	    		if (model.agreeToTerms) {
	    			return 'checked';
	    		}
	    		return '';
	    	},
	    	rememberEmailCheckedAttr : function(model) {
	    		if (model.rememberEmail) {
	    			return 'checked';
	    		}
	    		return '';
	    	}
	    }),

    constructor : function(config) {
        this.callParent(config);
        this.addEvents('userSignedIn');
    },

	initComponent : function() {
		this.data = this.context = {
			agreeToTerms : !!Ext.util.Cookies.get(this.COOKIE_AGREE_TO_TERMS),
			rememberEmail : Ext.util.Cookies.get(this.COOKIE_REMEMBER_EMAIL) != 'no',
			email : Ext.util.Cookies.get(this.COOKIE_EMAIL) || ''
		};

		this.callParent();
	},

	signin : function(evt) {
		evt.stopEvent();
        Ext.Ajax.request({
            url : LABKEY.ActionURL.buildURL("login", "loginAPI.api"),
            method: 'POST',
            jsonData: {
            	email: this.emailField.getValue(),
            	password: this.passwordField.getValue(),
            	remember: !!this.context.rememberEmail,
            	approvedTermsOfUse: !!this.context.agreeToTerms
            },
            success: LABKEY.Utils.getCallbackWrapper(function(response) {
            	if (response && response.user && response.user.isSignedIn) {
	            	LABKEY.user = response.user || LABKEY.user;
	            	this.fireEvent('userSignedIn');
	            } else {
	            	this.context.error = "Unexpected response from server";
	            	this.update(this.context);
	            	this.viewRendered();
	            }
            }, this),
            failure: LABKEY.Utils.getCallbackWrapper(function(response) {
            	this.context.error = response.exception;
	    		this.update(this.context);
            	this.viewRendered();
            }, this)
        });
	},

	storeEmail : function() {
		this.context.email = this.emailField.getValue();
		if (this.context.rememberEmail) {
			Ext.util.Cookies.set(this.COOKIE_EMAIL, this.context.email);
		}
	},

	COOKIE_REMEMBER_EMAIL : 'cds_form_remember_email',
	COOKIE_AGREE_TO_TERMS : 'cds_form_agree_to_terms',
	COOKIE_EMAIL : 'cds_form_email',

	viewRendered : function() {
    	var el = this.getEl();

    	this.termsCheckbox = el.getById("termsCheck");
    	this.rememberMeCheckbox = el.getById("rememberMeCheck");
    	this.emailField = el.getById("emailField");
    	this.passwordField = el.getById("passwordField");
    	this.signinButton = el.getById("signin");

    	this.signinButton.on('click', this.signin, this);
    	this.emailField.on('change', this.storeEmail, this);
    	this.emailField.on('keyup', this.storeEmail, this);

    	this.termsCheckbox.on('change', function() {
    		this.context.agreeToTerms = !this.context.agreeToTerms;
    		if (this.context.agreeToTerms) {
				Ext.util.Cookies.set(this.COOKIE_AGREE_TO_TERMS, 'yes');
			} else {
				Ext.util.Cookies.clear(this.COOKIE_AGREE_TO_TERMS);
			}
    		this.update(this.context);

    		this.viewRendered();
    	}, this);

    	this.rememberMeCheckbox.on('change', function() {
    		this.context.rememberEmail = !this.context.rememberEmail;
    		if (this.context.rememberEmail) {
    			Ext.util.Cookies.set(this.COOKIE_REMEMBER_EMAIL, 'yes');
	    		this.storeEmail();
    		} else {
    			Ext.util.Cookies.set(this.COOKIE_REMEMBER_EMAIL, 'no');
    			Ext.util.Cookies.clear(this.COOKIE_EMAIL);
    		}
    	}, this);
	},

	afterRender : function() {
		this.callParent();

		this.viewRendered();
	}
});


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
    		xtype: 'homeheader',
    	}, {
	    	xtype: 'about',
	    	cls: 'auto-scroll-y',
	    	flex: 1
	    }]
    }, {
    	xtype: 'signinform'
    }],

    afterRender : function() {
    	this.callParent();
    }
});
