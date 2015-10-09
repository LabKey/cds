'use strict';

define(['jquery'], function($) {

    //LABKEY.moduleContext.cds.COOKIE_REMEMBER_EMAIL = 'cds_form_remember_email';
    //LABKEY.moduleContext.cds.COOKIE_AGREE_TO_TERMS = 'cds_form_agree_to_terms';
    //LABKEY.moduleContext.cds.COOKIE_EMAIL = 'cds_form_email';

    var signin = function(options) {
        var self = this;

        /**
         * initialize
         * Initialize object properties and any other initialization that needs
         * to take place.
         */
        self.initialize = function() {
            var state = self.getEmailAndTerms();

            $('#email').val(state.remember ? state.email : '');
            $('#remember-me-checkbox').prop('checked', state.remember);
            $('#tos-checkbox').prop('checked', state.remember ? state.agreeToTerms : false);

            $('.signin-modal input.confirm').click(function() {
                console.log('wprl asdasd');
            });

            return self;
        };

        self.getEmailAndTerms = function() {
            return {
                remember: true, //Ext.util.Cookies.get(LABKEY.moduleContext.cds.COOKIE_REMEMBER_EMAIL) === 'yes',
                agreeToTerms: false, //Ext.util.Cookies.get(LABKEY.moduleContext.cds.COOKIE_AGREE_TO_TERMS) === 'yes',
                email: 'nicka@labkey.com' //Ext.util.Cookies.get(LABKEY.moduleContext.cds.COOKIE_EMAIL) || ''
            }
        };

        self.doSubmit = function() {
            console.log('we working!');
        };
    };

    // return public api for object
    return {
        initialize: function(options) {
            return new signin(options).initialize();
        }
    };
    //LABKEY.moduleContext.cds.signin = function() {
    //    var loginFields = ['email', 'password', 'tos-checkbox'],
    //            inputs = {},
    //            allFieldsPresent = true;
    //
    //    for (var idx in loginFields) {
    //        var field = loginFields[idx],
    //                el = document.getElementById(field),
    //                input = el.type === 'checkbox' ? el.checked : el.value;
    //
    //        inputs[field] = input;
    //
    //        if (!input) {
    //            allFieldsPresent = false;
    //        }
    //    }
    //
    //    saveEmailAndTerms(inputs, document.getElementById('remember-me-checkbox').checked);
    //
    //    if (allFieldsPresent) {
    //        LABKEY.Ajax.request({
    //            url: LABKEY.ActionURL.buildURL("login", "loginAPI.api"),
    //            method: 'POST',
    //            jsonData: {
    //                email: inputs['email'],
    //                password: inputs['password'],
    //                remember: inputs['remember-me-checkbox'],
    //                approvedTermsOfUse: inputs['tos-checkbox']
    //            },
    //            success: LABKEY.Utils.getCallbackWrapper(function (response) {
    //                if (response && response.user && response.user.isSignedIn) {
    //                    LABKEY.user = response.user || LABKEY.user;
    //                    window.location = LABKEY.ActionURL.buildURL("cds", "app.view");
    //                }
    //                else {
    //                    $('.signin-modal .notifications p').html('Login Failed');
    //                }
    //            }),
    //            failure: LABKEY.Utils.getCallbackWrapper(function () {
    //                $('.signin-modal .notifications p').html('Login Failed');
    //            })
    //        });
    //    }
    //    else {
    //        $('.signin-modal .notifications p').html('Required fields are missing.');
    //    }
    //};
    //
    //LABKEY.moduleContext.cds.getEmailAndTerms = function() {
    //    return {
    //        remember: Ext.util.Cookies.get(LABKEY.moduleContext.cds.COOKIE_REMEMBER_EMAIL) === 'yes',
    //        agreeToTerms: Ext.util.Cookies.get(LABKEY.moduleContext.cds.COOKIE_AGREE_TO_TERMS) === 'yes',
    //        email: Ext.util.Cookies.get(LABKEY.moduleContext.cds.COOKIE_EMAIL) || ''
    //    }
    //};
    //
    //function saveEmailAndTerms(inputs, remember) {
    //    if (remember) {
    //        Ext.util.Cookies.set(LABKEY.moduleContext.cds.COOKIE_REMEMBER_EMAIL, 'yes');
    //        Ext.util.Cookies.set(LABKEY.moduleContext.cds.COOKIE_EMAIL, inputs['email']);
    //        Ext.util.Cookies.set(LABKEY.moduleContext.cds.COOKIE_AGREE_TO_TERMS, inputs['tos-checkbox'] ? 'yes' : 'no');
    //    }
    //    else {
    //        Ext.util.Cookies.set(LABKEY.moduleContext.cds.COOKIE_REMEMBER_EMAIL, 'no');
    //        Ext.util.Cookies.set(LABKEY.moduleContext.cds.COOKIE_EMAIL, '');
    //        Ext.util.Cookies.set(LABKEY.moduleContext.cds.COOKIE_AGREE_TO_TERMS, 'no');
    //    }
    //}

});