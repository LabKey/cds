'use strict';

require(['jquery', 'scroll', 'modal', 'util'], function( $, scroll, modal, util) {

  var application = {

    /**
     * initialize
     * Setup fullpage, magnific popups, scoll functionality,
     * and initialize each section.
     */
    initialize: function() {
      window.frontPage = window.frontPage || {};
      scroll.initialize({
        section_selector: '.section',
        fullpage_selector: '#fullpage'
      });

      if (LABKEY.ActionURL.getParameter('create_account') != 'true') {
        $('.create-account-modal-trigger').each(function(){
          $(this).css('display', 'none');
        })
      }

      this.initializeModals();
      this.bindEvents();
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

      modal.initialize({
        name: 'email-modal',
        query_param_regex: /email_signup=true/i
      });
    },

    /**
     * Binds global events related to the home page.
     * 
     * @return {undefined}
     */
    bindEvents: function () {
      $('body').find('[data-js-id="frontPageHomeIcon"], [data-js-id="frontPageNavTitle"]')
        .on('click', function (e) {
          $.fn.fullpage.moveTo(1);
        });


      // resize the video modal to match the screen size more closely.
      (function () {
        var ratio = 500 / 281; // updated later if iframe is available.
        
        window.frontPage.updateVideoSize = function () {
          var windowWidth = $(window).width(),
            windowHeight = $(window).height(),
            videoWidth = windowWidth * 0.8,
            videoHeight = videoWidth / ratio;

          // readjust if necessary
          if (videoHeight > windowHeight) {
            videoHeight = windowHeight * 0.8;
            videoWidth = videoHeight * ratio;
          }

          if ($('[data-js-id="video-modal"').is(':visible')) {
            $('[data-js-id="video-modal"')
              .css('width', videoWidth)
              .find('iframe')
              .attr('width', videoWidth)
              .attr('height', videoHeight);
          }
        };

        $(document).ready(function () {
          var $introVideoModal = $('[data-js-id="video-modal"]'),
            defaultWidth = parseInt($introVideoModal.find('iframe').attr('width')),
            defaultHeight = parseInt($introVideoModal.find('iframe').attr('height'));
          
          ratio = defaultWidth / defaultHeight; // update parent-scoped ratio with iframe data.

          $(window).on('resize', function () {
            window.frontPage.updateVideoSize();
          });  
        });
      
      }());
      
    }
  };

  $(document).ready( application.initialize() );

});
