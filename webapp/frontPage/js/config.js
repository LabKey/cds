/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
'use strict';

require.config({
  'waitSeconds': 0,
  'paths': {
    // Third party libraries
    'jquery'      : '../components/jquery/dist/jquery.min',
    'slimScroll'  : '../components/jquery-slimscroll/jquery.slimscroll.min',
    'fullPage'    : '../components/fullpage.js/jquery.fullPage.min',
    'magnific'    : '../components/magnific-popup/dist/jquery.magnific-popup.min',

    // Application
    'application' : './application',

    // Modal logic
    'modal'       : './modal',

    // Fullpage.js scroll / section logic
    'scroll'      : './scroll',
    'section'     : './section',

    // Utilities
    'util'   : './util'

  },
  'shim': {
    'slimScroll': {
      deps: ['jquery']
    },
    'fullPage': {
      deps: ['jquery']
    },
    'magnific': {
      deps: ['jquery']
    }
  }
});

require(['application']);
