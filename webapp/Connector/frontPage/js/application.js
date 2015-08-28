'use strict';

require(['jquery', 'scroll', 'modal', 'util'], function( $, scroll, modal, util) {

  var application = {
    labkey_host: 'http://localhost:8080/labkey/cds',
    statistics_endpoint: '/CDSTest%20Project/properties.api',

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
      this.loadStatistics();
    },

    /**
     * initializeModals
     * Initialize all magnificPopup modals
     */
    initializeModals: function() {
      modal.initialize({
        name: 'signin-modal',
        query_param_regex: /login=true/i,
      });

      modal.initialize({
        name: 'forgot-password-modal',
        query_param_regex: /reset_password=true/i,
      });

      modal.initialize({
        name: 'video-modal',
        query_param_regex: /video=true/i,
      });

      modal.initialize({
        name: 'create-new-password-modal',
        query_param_regex: /create_password=true/i,
      });

      modal.initialize({
        name: 'create-account-modal',
        query_param_regex: /create_account=true/i,
      });
    },

    /**
     * loadStatistics
     * Get JSON from data-statistics-url inject response
     * into appropriate datapoint elements.
     */
    loadStatistics: function () {
      var statisticsUrl = this.labkey_host + this.statistics_endpoint;

      $.getJSON(statisticsUrl, function(data) {
        $('.products.datapoint h1').html(data.products);
        $('.studies.datapoint h1').html(data.studies);
        $('.subjects.datapoint h1').html(data.subjects);
        $('.assays.datapoint h1').html(data.assays);
        $('.statistics .timestamp p.days').html(
          util.date.dayDiffNow(new Date(data.created))
        );
      });
    }
  };

  $(document).ready( application.initialize() );

});
