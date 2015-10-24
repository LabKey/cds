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
    },
    cookies: {
      setCookie: function(name,value,days) {
        if (days) {
          var date = new Date();
          date.setTime(date.getTime()+(days*24*60*60*1000));
          var expires = "; expires="+date.toGMTString();
        }
        else var expires = "";
        document.cookie = name+"="+value+expires+"; path=/";
      },
      readCookie: function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
      },
      COOKIE_REMEMBER_EMAIL: 'cds_form_remember_email',
      COOKIE_AGREE_TO_TERMS: 'cds_form_agree_to_terms',
      COOKIE_EMAIL: 'cds_form_email'
    }

  };
});
