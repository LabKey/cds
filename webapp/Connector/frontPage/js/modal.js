'use strict';

define(['jquery', 'magnific'], function($, magnific) {
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
              self.$modal = $(this.currItem.inlineElement);
              self.registerActions();
            },
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
      self.help();
    };

    /**
     * help
     * Handle click event of help button
     * sign in form = [data-form=sign-in]
     * sign in help form = [data-form=sign-in-help]
     * Transition to hidden modal form from sign in form
     * to sign in help form.
     * Otherwise close magnific popup.
     * Move email value from one sign in form to sign in help form
     */
    self.help = function() {
      // Toggle between sign-in form and sign-in-help form
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
        var $sign_in_container = self.$modal.find('[data-form=sign-in]');
        var $sign_in_email = $sign_in_container.find('input[type=email]');
        var $sign_in_pw = $sign_in_container.find('input[type=password]');

        // TODO: This is just a test impl, needs to be made real
        $.ajax({
          url: 'http://localhost:8080/labkey/login/CDSTest%20Project/loginAPI.api',
          method: 'POST',
          data: {
            email: $sign_in_email.val(),
            password: $sign_in_pw.val()
          }
        }).success(function() {
          window.location = 'http://localhost:8080/labkey/cds/CDSTest%20Project/app.view';
        }).failure(function() {
          $('.signin-modal .notifications p').html('Login Failed');
        });
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
    }

    /**
     * queryParamTriggerModal
     * Setup regex to search for query params to show a magnific popup
     * on page load. Can pass query param regex in options object.
     */
    self.queryParamTriggerModal = function() {
      var queryParamRegex = self.options.query_param_regex;
      var showPopup = location.search.match(queryParamRegex);

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
