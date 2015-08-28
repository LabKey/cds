'use strict';

define([], function() {
  /**
   * util
   * Namespaced utilities / convience functions.
   * This can become a junk drawer if not maintained properly. Leverage namespaces
   * to keep things logically separated.
   */
  return {
    agent: {
      /**
       * isMobile
       * Returns boolean based on sniffing useragent string
       * Note: not very reliable - only use if needed. 
       */
      isMobile: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile/i);
      }
    },
    date: {

      /**
       * dayDiffNow
       * Returns the number of days since the date.
       */
      dayDiffNow: function(date) {
        return Math.floor((new Date(Date.now()) - date) / (1000*60*60*24));
      }
    }
  };
});
