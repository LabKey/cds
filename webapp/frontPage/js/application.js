/*
 * Copyright (c) 2015-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
'use strict';

require(['jquery', 'scroll', 'modal', 'util'], function( $, scroll, modal, util) {

  var application = {

    /**
     * initialize
     * Setup fullpage, magnific popups, scoll functionality,
     * and initialize each section.
     */
    initialize: function() {

      // scroll div default top padding
      let fullpageTopPadding = '4.635em';

      // front page initialization
      let fullInitialize = function(topPadding) {
        window.frontPage = window.frontPage || {};
        scroll.initialize({
          section_selector: '.section',
          fullpage_selector: '#fullpage',
          topPadding : topPadding
        });

        if (LABKEY.ActionURL.getParameter('create_account') != 'true') {
          $('.create-account-modal-trigger').each(function(){
            $(this).css('display', 'none');
          })
        }

        this.initializeModals();
        this.bindEvents();
      };

      LABKEY.Ajax.request({
        url: LABKEY.ActionURL.buildURL("cds", "getDismissableWarnings.api"),
        method: 'GET',
        scope : this,
        success: function(response){
          const o = LABKEY.Utils.decode(response.responseText);
          if (o.messages) {
            // increase the padding for the notification area
            fullpageTopPadding = '9.27em';

            const msgDiv = $('div.notification-messages');

            $.each(o.messages, function (idx, msg) {
              msgDiv.append($('<span>').text(msg).append($('<br>')));
            });
            $('#notification').show();
          }
          else {
            $('#notification').remove();
          }
          fullInitialize.call(this, fullpageTopPadding);
        },
        failure : function(response){
          fullInitialize.call(this, fullpageTopPadding);
        }
      });
    },

    /**
     * initializeModals
     * Initialize all magnificPopup modals
     */
    initializeModals: function() {
      modal.initialize({
        name: 'signin-modal',
        query_param_regex: /login=true|returnUrl=/i,
        show_for_page_nav: true       // render modal if there is a page route on the url
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

      modal.initialize({
        name: 'register-modal',
        query_param_regex: /register=true/i
      });

      modal.initialize({
        name: 'survey-modal',
        query_param_regex: /survey=true/i
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
