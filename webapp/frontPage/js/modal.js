/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
'use strict';

define(['jquery', 'magnific', 'util'], function($, magnific, util) {
  /**
   * modal
   * @param {options} {
   * name: 'video-modal'
   *    Corresponds to .video-modal-popup, and .video-modal-trigger.
   *    Any class with .video-modal-trigger class will trigger magnificPopup to
   *    open with content from a container with the class .video-modal-popup.
   *
   * query_param_regex: /video=true/i
   *    Any regular expression matched against the current url. If it matches
   *    the according modal will automatically pop up.
   *
   * src: [video url]
   *    Ability to load modal with url src (videos, images, etc). See magnificPopup
   *    documentation for details.
   *
   * modal: 'inline'
   *    Ability to specify what type of modal content we are displaying. See
   *    magnificPopup documentation for details.
   *  }
   * Create object to handle creation / event binding around magnificPopup library/
   */
  var modal = function(options) {
    var self = this;
    self.options = options || {};

    /**
     * initialize
     * Initialize magnificPopup with given options and check to see
     * if query params dictate loading with modal activated.
     */
    self.initialize = function() {
      $(document).ready( function() {

        // Needed to move within here because IE 8 / 9
        // ceased to function otherwise :/
        self.$content = $('.' + self.options.name + '-popup');
        self.$trigger = $('.' + self.options.name + '-trigger');
        self.$modal = null;
        self.magnific_options = {
          items: {
            src: self.options.src || self.$content.html(),
            type: self.options.type || 'inline',
            modal: self.options.modal || true
          },
          callbacks: {
            open: function() {
              $.fn.fullpage.setMouseWheelScrolling(false);
              $.fn.fullpage.setAllowScrolling(false);
              $.fn.fullpage.setKeyboardScrolling(false);
              self.$modal = $(this.currItem.inlineElement);
              self.registerActions();
              if (window.frontPage && window.frontPage.updateVideoSize) {
                window.frontPage.updateVideoSize();
              }
            },
            close: function() {
              $.fn.fullpage.setMouseWheelScrolling(true);
              $.fn.fullpage.setAllowScrolling(true);
              $.fn.fullpage.setKeyboardScrolling(true);
            }
          }
        };

        self.$trigger.magnificPopup(self.magnific_options);
        self.queryParamTriggerModal();
      });

      return self;
    };

    /**
     * registerActions
     * When modal is opened setup click handlers for various actions
     */
    self.registerActions = function() {
      self.expandTOS();
      self.confirm();
      self.dismiss();
      self.toggle();
      self.initLoginInfo();
      self.bindEnterKey();
      self.initAccountSurvey();
    };

    self.initLoginInfo = function() {
      var $sign_in_container = self.$modal.find('[data-form=sign-in]');
      if( $sign_in_container.length > 0 ) {
        var emailAndTerms = {
          remember: util.cookies.readCookie(util.cookies.COOKIE_REMEMBER_EMAIL) === 'yes',
          agreeToTerms: util.cookies.readCookie(util.cookies.COOKIE_AGREE_TO_TERMS) === 'yes',
          email: util.cookies.readCookie(util.cookies.COOKIE_EMAIL) || ''
        };
        var $sign_in_email = $sign_in_container.find('input[type=email]');
        var $sign_in_rememberMe = $sign_in_container.find('input[id=remember-me-checkbox]');
        var $sign_in_tosl = $sign_in_container.find('input[id=tos-checkbox]');
        if (emailAndTerms.remember) {
          // remove fake password and email elements so that they can be autofilled by browser
          // since we cannot store password in cookie, have to rely on browser autofill.
          var emailFake = document.getElementById("fakeusernameremembered");
          emailFake.parentNode.removeChild(emailFake);
          var passwordFake = document.getElementById("fakepasswordremembered");
          passwordFake.parentNode.removeChild(passwordFake);

          $sign_in_email.val(emailAndTerms.email);
          $sign_in_rememberMe.prop('checked', true);
          $sign_in_tosl.prop('checked', emailAndTerms.agreeToTerms ? true : false);
        }
        else {
          $sign_in_email.val('');
          $sign_in_rememberMe.prop('checked', false);
          $sign_in_tosl.prop('checked', false);
        }

        if (window.location.href.indexOf("sessiontimedout=true") > -1) {
          $('.signin-modal .notifications p').html('Your session has timed out. Please login to continue.');
        }

      }
    };

    self.bindEnterKey = function()
    {
      var $sign_in_container = self.$modal.find('[data-form=sign-in]');
      if ($sign_in_container.length > 0) {
        $("#signinform input").keypress(function (e) {
          if (e.keyCode == 13) {
            e.preventDefault();
            $('#signin').click();
          }
        });
      }

      var $sign_in_help_container = self.$modal.find('[data-form=sign-in-help]');
      if ($sign_in_help_container.length > 0) {
        $("#emailhelp").keypress(function (e) {
          if (e.keyCode == 13) {
            e.preventDefault();
            $('#signinhelpsubmit').click();
          }
        });
      }

      var $createpasswordcontainer = self.$modal.find('[id=createnewpasswordform]');
      if ($createpasswordcontainer.length > 0) {
        $("#createnewpasswordform input").keypress(function (e) {
          if (e.keyCode == 13) {
            e.preventDefault();
            $('#createnewpasswordsubmit').click();
          }
        });
      }

      var $createaccountcontainer = self.$modal.find('[id=createaccountform]');
      if ($createaccountcontainer.length > 0) {
        $("#createaccountform input").keypress(function (e) {
          if (e.keyCode == 13) {
            e.preventDefault();
            $('#createaccountsubmit').click();
          }
        });
      }
    };

    /**
     * toggle
     * Handle click event of button that navigate between forms
     */
    self.toggle = function() {
      // Toggle between sign-in form and sign-in-help form
        /**
         * sign in form = [data-form=sign-in]
         * sign in help form = [data-form=sign-in-help]
         * Transition to hidden modal form from sign in form
         * to sign in help form.
         * Otherwise close magnific popup.
         * Move email value from one sign in form to sign in help form
         */
      self.action('help', function($click) {
        var $sign_in_container = self.$modal.find('[data-form=sign-in]');

        // If there is a sign-in form toggle between sign-in and sign-in help forms
        if( $sign_in_container.length > 0 ) {
          var email_selector = 'input[type=email]';
          var $sign_in_help_container = self.$modal.find('[data-form=sign-in-help]');
          var $sign_in_email = $sign_in_container.find(email_selector);
          var $sign_in_help_email = $sign_in_help_container.find(email_selector);
          // Toggle visibility of forms - sign-in form vs sign-in help form
          $sign_in_container.toggleClass('hidden');
          $sign_in_help_container.toggleClass('hidden');

          // Copy email address from sign-in form to sign-in-help form
          $sign_in_help_email.val( $sign_in_email.val() );
        }  else {
          // otherwise we are deeplinking - just close the form
          $.magnificPopup.close();
        }
      });

      self.action('help-register', self.toggleRegistrationHelp);
    };

    /**
     * dismiss
     * Handle click event of dismiss button
     * click selector = [data-click=dismiss]
     * action selector = [data-action=dismiss]
     */
    self.dismiss = function() {
      self.action('dismiss', function($click) {
        $.magnificPopup.close();
      });
    };

    /**
     * confirm
     * Handle click event of confirm button
     * click selector = [data-click=confirm]
     * action selector = [data-action=confirm]
     */
    self.confirm = function() {
      self.action('confirm', function($click) {
        var email = document.getElementById('email');
        var password = document.getElementById('password');
        var tos = document.getElementById('tos-checkbox');

        if (!email.checkValidity() || !password.checkValidity() || !tos.checkValidity()) {
          $('#submit_hidden').click(); //click a hidden submit to do form validation
          return false;
        }

        var $sign_in_container = self.$modal.find('[data-form=sign-in]');
        var $sign_in_email = $sign_in_container.find('input[id=email]');
        var $sign_in_pw = $sign_in_container.find('input[id=password]');
        var rememberMe = document.getElementById('remember-me-checkbox').checked;
        var termsOfUse = tos.checked;


        if (rememberMe) {
          util.cookies.setCookie(util.cookies.COOKIE_REMEMBER_EMAIL, 'yes');
          util.cookies.setCookie(util.cookies.COOKIE_AGREE_TO_TERMS, termsOfUse ? 'yes' : 'no');
          util.cookies.setCookie(util.cookies.COOKIE_EMAIL, $sign_in_email.val());
        }
        else {
          util.cookies.setCookie(util.cookies.COOKIE_REMEMBER_EMAIL, 'no');
          util.cookies.setCookie(util.cookies.COOKIE_AGREE_TO_TERMS, 'no');
          util.cookies.setCookie(util.cookies.COOKIE_EMAIL, '');
        }

        $.ajax({
          url: LABKEY.ActionURL.buildURL("login", "loginAPI.api"),
          method: 'POST',
          data: {
            email: $sign_in_email.val(),
            password: $sign_in_pw.val(),
            remember: rememberMe,
            approvedTermsOfUse: termsOfUse
          }
        }).success(function() {
          if (LABKEY.ActionURL.getParameter('returnUrl')) {
            window.location = LABKEY.ActionURL.getParameter('returnUrl');
            return;
          }
          var newLocation = window.location.href.replace('?login=true', '').replace('&login=true', '').replace('login=true', '');
          newLocation = newLocation.replace('&sessiontimedout=true', '').replace('sessiontimedout=true', '');
          var oldLocation = window.location.href;
          if (newLocation === oldLocation) {
            window.location.reload();
          }
          else {
            window.location = newLocation;
          }

        }).error(function(e) {
          var errorMsg = "Sign-in Failed. ";
            if (e && e.responseJSON && e.responseJSON.errors && e.responseJSON.errors.length > 0) {
                errorMsg = errorMsg + e.responseJSON.errors[0].message;
            }
          $('.signin-modal .notifications p').html(errorMsg);
        });
      });

      self.action('register', function($click) {
        var email = document.getElementById('emailRegister');
        var emailConfirm = document.getElementById('emailRegisterConfirm');
        var verification = document.getElementById('kaptchaText');
        if (!email.checkValidity() || !emailConfirm.checkValidity() || !verification.checkValidity()) {
          $('#submit_hidden_register').click(); //click a hidden submit to do form validation
          return false;
        }
        if (email.value !== emailConfirm.value) {
          alert("The 2 emails entered don't match.");
          return;
        }
        $.ajax({
          url: LABKEY.ActionURL.buildURL("login", "registerUser.api"),
          method: 'POST',
          data: {
            email: email.value,
            emailConfirmation: emailConfirm.value,
            provider: 'cds',
            'X-LABKEY-CSRF': LABKEY.CSRF,
            kaptchaText: document.getElementById('kaptchaText').value
          }
        }).success(function() {
          $('.register-account-modal #registeraccountform').html('Thank you for signing up! A verification email has been sent to ' + email.value +
          '.  Please check your inbox to confirm your email address and complete your account setup. <br><br><br>');
        }).error(function(e) {
          var errorMsg = 'Unable to register account. ';
          window.toggleRegistrationHelp = self.toggleRegistrationHelp;
          if (e && e.responseJSON) {
            if (e.responseJSON.errors && e.responseJSON.errors.length > 0) {
                var additionalMsg = e.responseJSON.errors[0].message;
                // replace link that would take user to LabKey reset url
                if (additionalMsg.indexOf('already associated with an account') > 0)
                    additionalMsg = 'The email address you have entered is already associated with an account.  If you have forgotten your password, you can ' +
                        '<a class="register-links-error" onclick="return toggleRegistrationHelp();">reset your password</a>' +
                        '.  Otherwise, please contact your administrator.';
                errorMsg = errorMsg + additionalMsg;
            }
            else if (e.responseJSON.exception) {
                errorMsg = errorMsg + e.responseJSON.exception;
            }
          }
          $('.register-account-modal .modal .notifications p').html(errorMsg);
        });
      });

      self.action('confirmhelp', function($click) {
        self.submitPasswordHelp('emailhelp', 'signin-modal', 'submit_hidden_help');
      });

      self.action('confirmregisterhelp', function($click) {
        self.submitPasswordHelp('emailhelpregister', 'register-account-modal', 'submit_hidden_registerhelp');
      });

      self.action('confirmchangepassword', function($click) {
        var pw1 = document.getElementById('password1');
        var pw2 = document.getElementById('password2');

        if (!pw1.checkValidity() || !pw2.checkValidity()) {
          $('#submit_hidden_pw').click(); //click a hidden submit to do form validation
          return false;
        }

        var emailVal = LABKEY.ActionURL.getParameter('email');
        var verificationVal = LABKEY.ActionURL.getParameter('verification');
        $.ajax({
          url: LABKEY.ActionURL.buildURL("login", "setPasswordAPI.api"),
          method: 'POST',
          data: {
            password: pw1.value,
            password2: pw2.value,
            email: emailVal,
            verification: verificationVal,
            'X-LABKEY-CSRF': LABKEY.CSRF
          }
        }).success(function() {
          $('.create-new-password-modal .links input').prop("disabled",true);
          $('.create-new-password-modal .notifications p').html('Reset password successful.');

          setTimeout(function(){
            window.location = LABKEY.ActionURL.buildURL("cds", "app.view?login=true");
          },3000);

        }).error(function() {
          $('.create-new-password-modal .notifications p').html('Change password failed.');
        });

      });

      self.action('confirmcreateaccount', function($click) {
        var pw1 = document.getElementById('password3');
        var pw2 = document.getElementById('password4');
        var tos = document.getElementById('tos-create-account');

        if (!pw1.checkValidity() || !pw2.checkValidity() || !tos.checkValidity()) {
          $('#submit_hidden_account').click(); //click a hidden submit to do form validation
          return false;
        }

        var emailVal = LABKEY.ActionURL.getParameter('email');
        var verificationVal = LABKEY.ActionURL.getParameter('verification');
        $.ajax({
          url: LABKEY.ActionURL.buildURL("login", "setPasswordAPI.api"),
          method: 'POST',
          data: {
            password: pw1.value,
            password2: pw2.value,
            email: emailVal,
            verification: verificationVal,
            'X-LABKEY-CSRF': LABKEY.CSRF
          }
        }).success(function() {
          $('.create-account-modal .links input').prop("disabled",true);
          $('.create-account-modal .notifications p').html('Thanks for creating your account. This page will refresh momentarily...');
          setTimeout(function(){
            window.location = LABKEY.ActionURL.buildURL("cds", "app.view?login=true");
          },3000);

        }).error(function(e) {
          var errorMsg = 'Create account failed. ';
          if (e && e.responseJSON && e.responseJSON.errors && e.responseJSON.errors.length > 0) {
            errorMsg = errorMsg + e.responseJSON.errors[0].message;
          }
          $('.create-account-modal .notifications p').html(errorMsg);
        });

      });

      self.action('confirmsurvey', function($click) {
        var firstname = document.getElementById('accountfirstname');
        var lastname = document.getElementById('accountlastname');
        var institution = document.getElementById('accountinstitution');
        var role = document.getElementById('accountrole');

        if (!firstname.checkValidity() || !lastname.checkValidity() || !institution.checkValidity() || !role.checkValidity()) {
          $('#submit_hidden_account_survey').click(); //click a hidden submit to do form validation
          return false;
        }
        if (!LABKEY.user.isSignedIn)
        {
            $('.account-survey-modal .notifications p').html("Your session has timed out. Please sign in to continue.");
            $('#accountsurveysubmit').attr("disabled", "disabled");
            return;
        }

        var networks = [];
        $(".survey-form input:checkbox[name=network]:checked").each(function(){
            networks.push($(this).val());
        });

        var otherNetwork = document.getElementById('accountothernetwork');
        if (otherNetwork && otherNetwork.value)
          networks.push('Other: ' + otherNetwork.value);

        var researchArea = document.getElementById('accountarea');

          $.ajax({
          url: LABKEY.ActionURL.buildURL("cds", "updateCDSUserInfo.api"),
          method: 'POST',
          data: {
            firstName: firstname.value,
            lastName: lastname.value,
            institution: institution.value,
            role: role.value,
            network: networks.join(", "),
            researchArea: researchArea.value,
            'X-LABKEY-CSRF': LABKEY.CSRF
          }
        }).success(function() {
          $('.account-survey-modal .links input').prop("disabled",true);
          $('.account-survey-modal .notifications p').html('Thanks for the additional information. You will be redirected to the DataSpace application now.');
          setTimeout(function(){
              window.location = LABKEY.ActionURL.buildURL("cds", "app.view");
          },3000);

        }).error(function(e) {
          var errorMsg = 'Unable to update member details. ';
          if (e && e.responseJSON && e.responseJSON.errors && e.responseJSON.errors.length > 0) {
            errorMsg = errorMsg + e.responseJSON.errors[0].message;
          }
          $('.account-survey-modal .notifications p').html(errorMsg);
        });

      });
    };

    self.initAccountSurvey = function() {
        var $survey_container = self.$modal.find('[data-form=account-survey]');
        if ($survey_container.length > 0) {
            var $account_email = $survey_container.find('label[id=verifiedaccountemail]');
            var email = LABKEY.user.email;

            // Set email address
            $account_email.text(email);
            if (!LABKEY.user.isSignedIn)
            {
                $('.account-survey-modal .notifications p').html("Your session has timed out. Please sign in to continue.");
                $('#accountsurveysubmit').prop("disabled", true);
            }
        }
    };

    self.toggleRegistrationHelp = function() {
      self.toggleContainer('register', 'register-help');
    };

    self.toggleContainer = function(mainContainer, secondContainer) {
      var $register_container = self.$modal.find('[data-form=' + mainContainer + ']');

      if( $register_container.length > 0 ) {
        var $register_help_container = self.$modal.find('[data-form=' + secondContainer + ']');
        $register_container.toggleClass('hidden');
        $register_help_container.toggleClass('hidden');
      }  else {
        // otherwise we are deeplinking - just close the form
        $.magnificPopup.close();
      }
    };

    self.submitPasswordHelp = function(emailId, modalCss, hiddensubmitid) {
        var email = document.getElementById(emailId);
        if (!email.checkValidity()) {
            $('#' + hiddensubmitid).click(); //click a hidden submit to do form validation
            return false;
        }

        $.ajax({
          url: LABKEY.ActionURL.buildURL("login", "resetPasswordAPI.api"),
          method: 'POST',
          data: {
            email: email.value,
            provider: 'cds',
            'X-LABKEY-CSRF': LABKEY.CSRF
          }
        }).success(function() {

          $('.' + modalCss  +' .notifications p').html('Reset successful. Please check your email.');
        }).error(function() {
          $('.' + modalCss + ' .notifications p').html('Reset password failed.');
        });
      };
    /**
     * expandTOS
     * Handle click event of Terms of service
     * click selector = [data-click=terms-of-service]
     * action selector = [data-action=terms-of-service]
     */
    self.expandTOS = function() {
      self.action('terms-of-service', function($click, $terms_of_service) {
        $terms_of_service.toggleClass('open');
      });
      self.action('tos-create-account', function($click, $terms_of_service) {
        $terms_of_service.toggleClass('open');
      });
    };

    /**
     * action
     * Utility function to bind a click selector to an action
     * selector.
     */
    self.action = function(action_name, callback) {
      var click_selector = '[data-click=' + action_name +']';
      var action_selector = '[data-action=' + action_name +']';

      $(click_selector).on('click', function(e) {
        e.preventDefault();
        callback($(this), $(action_selector));
      });
    };

    /**
     * queryParamTriggerModal
     * Setup regex to search for query params to show a magnific popup
     * on page load. Can pass query param regex in options object.
     */
    self.queryParamTriggerModal = function() {
      var queryParamRegex = self.options.query_param_regex;
      var showPopup = location.search.match(queryParamRegex);

      var loginRegex = /login=true|returnUrl=/i;
      if (queryParamRegex.source.toString() !== loginRegex.source.toString()) {
        // if login popup is already open, skip opening other matches
        var isLogin = location.search.match(loginRegex);
        if (isLogin) {
          return;
        }
      }

      if( showPopup && showPopup.length > 0 ) {
        $.magnificPopup.open(self.magnific_options);
      }
    };

  };

  return {
    initialize: function(options) {
      return new modal(options).initialize();
    }
  };
});
