'use strict';

require(['jquery', 'scroll', 'modal', 'util'], function( $, scroll, modal, util) {

  var application = {

    /**
     * initialize
     * Setup fullpage, magnific popups, scoll functionality,
     * and initialize each section.
     */
    initialize: function() {

      scroll.initialize({
        section_selector: '.section',
        fullpage_selector: '#fullpage'
      });

      this.initializeModals();
    },

    /**
     * initializeModals
     * Initialize all magnificPopup modals
     */
    initializeModals: function() {
      modal.initialize({
        name: 'signin-modal',
        query_param_regex: /login=true|returnUrl=/i
      });

      modal.initialize({
        name: 'forgot-password-modal',
        query_param_regex: /reset_password=true/i
      });

      modal.initialize({
        name: 'video-modal',
        query_param_regex: /video=true/i
      });

      modal.initialize({
        name: 'create-new-password-modal',
        query_param_regex: /create_password=true/i
      });

      modal.initialize({
        name: 'create-account-modal',
        query_param_regex: /create_account=true/i
      });
    }
  };

  $(document).ready( application.initialize() );

});
