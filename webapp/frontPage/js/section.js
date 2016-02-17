/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
'use strict';

define(['jquery', 'util'], function($, util) {

  /**
   * section
   * @param {options} {
   *    index: 1,               // index associated with data-index attr on $('.section')
   *    gif: '/img/explore.gif' // path to gif for section
   *  }
   * Create object to handle section lifecycle events ( setup, load, teardown ) as well
   * as on demand loading of gifs, etc.
   */
  var section = function(options) {
    var self = this;
    var dataPoints = undefined;
    self.options = options || {};
    self.index = self.options.index;
    self.gif = self.options.gif;
    // If set to true we disable mobile gifs by replacing them
    // with a static image of the finished gif.
    self.disable_mobile_gifs = false;

    /**
     * initialize
     * Initialize object properties and any other initialization that needs
     * to take place.
     */
    self.initialize = function() {
      self.$element = $('[data-index=' + self.index + ']');
      self.$gif_container = self.$element.find('.gif-container');
      self.$section_down_anchors = self.$element.find('.move-section-down');
      self.$section_up_anchors = self.$element.find('.move-section-up');

      self.$section_down_anchors.on('click', function(e) {
        e.preventDefault();
        $.fn.fullpage.moveSectionDown();
      });

      self.$section_up_anchors.on('click', function(e) {
        e.preventDefault();
        $.fn.fullpage.moveSectionUp();
      });

      return self;
    };

    /**
     * setup
     * Once fullpage.js section is about to animate into view setup anything
     * we need to in order for that section to be displayed.
     */
    self.setup = function() {
      if (self.index == 2) {
        self.loadStatistics();
      }
      self.createGIF();
      self.toggleNavigationSignIn();
    };

    /**
     * loadStatistics
     * Get JSON from data-statistics-url inject response
     * into appropriate datapoint elements.
     * Executed here to ensure DOM elements are present.
     */
    self.loadStatistics = function() {
      if (!dataPoints) {
        var statisticsUrl = LABKEY.ActionURL.buildURL('cds', 'properties.api');

        $.getJSON(statisticsUrl, undefined, function (data) {
          dataPoints = {
            products: data.products,
            studies: data.studies,
            subjects: data.subjects,
            assays: data.assays,
            created: data.created
          };

          self.loadStatistics();
        });
      }
      else {
        $('.products.datapoint h1').html(dataPoints.products);
        $('.studies.datapoint h1').html(dataPoints.studies);
        $('.subjects.datapoint h1').html(dataPoints.subjects);
        $('.assays.datapoint h1').html(dataPoints.assays);
        $('.statistics .timestamp p.days').html(
                util.date.dayDiffNow(new Date(dataPoints.created))
        );
      }
    };

    /**
     * loaded
     * Once fullpage.js section is fully animated and loaded execute
     * any logic we need to.
     */
    self.loaded = function() {};

    /**
     * teardown
     * Once fullpage.js section is scrolled off screen we can tear down
     * or release any content that isn't needed anymore.
     */
    self.teardown = function() {
      self.destroyGIF();
    };

    /**
     * createGIF
     * Adds gif img to container - allows for control over start / stop of gifs
     */
    self.createGIF = function() {

      // Create gif or static mobile image
      if( self.$gif_container && self.gif ) {
        if( self.disable_mobile_gifs && util.agent.isMobile() ) {
            self.$gif_container.find('.mobile-img').css('opacity', '1');
        } else {
          var gif_url = self.gif + '?' + new Date().getTime();
          self.$gif_container.append('<img class="gif" src=' + gif_url + '></img>');
        }
      }
    };

    /**
     * destroyGIF
     * Removes background-image gif img from container - sets
     * timeout to remove after fullpage.js transition
     */
    self.destroyGIF = function() {

      if( self.$gif_container && self.gif ) {

          // Destroy gif or static mobile image
          if( self.disable_mobile_gifs && util.agent.isMobile() ) {
            var $img = self.$gif_container.find('.mobile-img');
            $img.animate({ opacity: 0 }, 300);
          } else {
            var $gif = self.$gif_container.find('.gif');
            $gif.animate({ opacity: 0 }, 300, function() {
              $gif.remove();
            });
          }
      }
    };

    /**
     * toggleNavigationSignIn
     * On every section other than the first - fade in
     * navigation links - fade out on first section.
     */
    self.toggleNavigationSignIn = function() {
      $('#navigation .link.sign-in').animate({
        opacity: self.index === 1 ? 0 : 1
      }, 300);
    };
  };

  // return public api for object
  return {
    initialize: function(options) {
      return new section(options).initialize();
    }
  };
});
