/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Router', {

    extend: 'Ext.app.Controller',

    delimiter : '#',

    routes: [],

    init : function() {
        /* This control is responsible for loading the application */
        this.control(
            'app-main', {
                afterrender: this.onAppReady
            }
        );

        this.control('app-main > #eastview', {
            afterrender: function(view) {
                this.eastview = view;
            },
            scope: this
        });

        this.control('#logout', {
            afterrender: function(view) {
                this.logoutlink = view;
            },
            scope: this
        });

        this.application.on('userChanged', this.userChanged, this);

        /* Flag that is true when an unauthorized request has been handled */
        var MSG_KEY = 'SIGNIN';
        this.BAD_AUTH = false;
        var me = this;

        /* If the user recieves an unauthorized, return them to login screen */
        this.application.on('httpunauthorized', function(status, text) {
            me.BAD_AUTH = true;
            Ext.Ajax.abortAll();
            LABKEY.user.isSignedIn = false;
            var newLocation = me.addURLParameter(window.location.href, 'login', 'true');
            newLocation = me.addURLParameter(newLocation, 'sessiontimedout', 'true');
            window.location = newLocation;
            return false;
        });

        /* If requests have been aborted due to BAD_AUTH then ignore them */
        this.application.on('httpaborted', function(status, text) {
            return !me.BAD_AUTH;
        });

        if (LABKEY.user.isSignedIn) {
            this.attachTimeoutListeners();
        }

        var popState = false,
            previousUrlHash = location.hash,
            oldUrl = previousUrlHash;

        var pathChangeTask = new Ext.util.DelayedTask(function() {
            me.route(me.getHashValue(location.hash), popState, me.getHashValue(oldUrl));
            popState = false;
        });

        Ext.EventManager.on(window, 'hashchange', function(e) {
            oldUrl = previousUrlHash;
            pathChangeTask.delay(50);
            previousUrlHash = location.hash;
        });

        if (Ext.supports.History) {
            Ext.EventManager.on(window, 'popstate', function() {
                popState = true;
                pathChangeTask.delay(50);
            });
        }
    },

    onAppReady : function() {
        this.route(this.getHashValue(location.hash), false);
        this.userChanged();
    },

    userChanged : function() {
        this.eastview.setVisible(LABKEY.user.isSignedIn);
    },

    addURLParameter : function(url, parameterName, parameterValue, atStart/*Add param before others*/) {
        var replaceDuplicates = true, urlhash;
        if(url.indexOf('#') > 0){
            var cl = url.indexOf('#');
            urlhash = url.substring(url.indexOf('#'),url.length);
        } else {
            urlhash = '';
            cl = url.length;
        }
        var sourceUrl = url.substring(0,cl);

        var urlParts = sourceUrl.split("?");
        var newQueryString = "";

        if (urlParts.length > 1)
        {
            var parameters = urlParts[1].split("&");
            for (var i=0; (i < parameters.length); i++)
            {
                var parameterParts = parameters[i].split("=");
                if (!(replaceDuplicates && parameterParts[0] == parameterName))
                {
                    if (newQueryString == "")
                        newQueryString = "?";
                    else
                        newQueryString += "&";
                    newQueryString += parameterParts[0] + "=" + (parameterParts[1]?parameterParts[1]:'');
                }
            }
        }
        if (newQueryString == "")
            newQueryString = "?";

        if(atStart){
            newQueryString = '?'+ parameterName + "=" + parameterValue + (newQueryString.length>1?'&'+newQueryString.substring(1):'');
        } else {
            if (newQueryString !== "" && newQueryString != '?')
                newQueryString += "&";
            newQueryString += parameterName + "=" + (parameterValue?parameterValue:'');
        }
        return urlParts[0] + newQueryString + urlhash;
    },

    // copied from Argos Signin.js
    attachTimeoutListeners : function() {

        // for tests to specify timeout
        var timeout = LABKEY.ActionURL.getParameter('session_t');
        if (timeout) {
            timeout = parseInt(timeout);
        }

        // How long (in ms) the user has before inactivity logs them out.
        var TIMEOUT = timeout ||  60 * 60 * 1000, // 60 minutes
        // How much time (in ms) to give the user advanced warning.
                TIMEOUT_WARN = timeout || 2 * 60 * 1000, // 2 minutes

                TIME_REMAINING = TIMEOUT_WARN,

        // The animation time for the banner (in ms)
                BANNER_ANIMATE = 200,

                BANNER_EL, BANNER_TIMER_EL;

        var formatMilliseconds = function(milliseconds) {
            var temp = Math.floor(milliseconds / 1000);
            var minutes = Math.floor((temp %= 3600) / 60);
            if (minutes) {
                return minutes + ' minute' + ((minutes > 1) ? 's' : '');
            }
            var seconds = temp % 60;
            if (seconds) {
                return seconds + ' second' + ((seconds > 1) ? 's' : '');
            }
            return 'less than a second';
        };

        var getBanner = function() {
            return BANNER_EL;
        };

        var showBanner = function() {
            updateTick();
            tickTask.start();
            // stop session keep live task once countdown banner is displayed
            keepSessionLiveTask.stop();
            getBanner().slideIn('t', {duration: BANNER_ANIMATE });
        };

        var hideBanner = function() {
            tickTask.stop();
            TIME_REMAINING = TIMEOUT_WARN;
            var banner = getBanner();
            if (banner.isVisible()) {
                banner.hide();
                keepSessionLive(); // kick off keeplive immediately
                keepSessionLiveTask.start(); // restart keeplive task
            }
        };

        var updateTick = function() {
            BANNER_TIMER_EL.update(formatMilliseconds(TIME_REMAINING));
            TIME_REMAINING = TIME_REMAINING - 1000;
        };

        var tickTask = new Ext.util.TaskRunner().newTask({
            run: updateTick,
            interval: 1000
        });

        var showBannerTask = new Ext.util.DelayedTask(showBanner);

        var sessionTask = new Ext.util.DelayedTask(function() {
            hideBanner();
            this.logout();
        }, this);

        var anyClick = function() {
            sessionTask.delay(TIMEOUT);
            showBannerTask.delay(TIMEOUT - TIMEOUT_WARN);
            hideBanner();
        };

        var keepSessionLive = function() {
            // contact server to keep session live
            Ext.Ajax.request({
                url: LABKEY.ActionURL.buildURL('cds', 'properties.api'),
                method: 'GET',
                success: function(response) {
                    // do nothing
                },
                scope: this
            });
        };

        // run keepSessionLive every 10 minutes to prevent Tomcat session timeout prior to CDS client timeout
        var keepSessionLiveTask = new Ext.util.TaskRunner().newTask({
            run: keepSessionLive,
            interval: 10*60*1000
        });

        Connector.getState().onReady(function() {

            // initialize elements
            BANNER_EL = Ext.get(Ext.DomQuery.select('.banner')[0]);
            BANNER_TIMER_EL = Ext.get(Ext.DomQuery.select('.timer'), BANNER_EL.id);

            Ext.getBody().on('click', anyClick);

            // kickoff the timers
            anyClick();

            // start session keep live task
            keepSessionLiveTask.start();
        });
    },

    logout : function() {
        var me = this;
        Ext.Ajax.request({
            url : LABKEY.ActionURL.buildURL("login", "logoutAPI.api"),
            method: 'POST',
            success: LABKEY.Utils.getCallbackWrapper(function(response) {
                if (response.success) {
                    LABKEY.user.isSignedIn = false;
                    var newLocation = me.addURLParameter(window.location.href, 'login', 'true');
                    newLocation = me.addURLParameter(newLocation, 'sessiontimedout', 'true');
                    window.location = newLocation;
                }
            }, this),
            failure: LABKEY.Utils.getCallbackWrapper(function(response) {
                // Do it manually instead then.
                window.location = LABKEY.ActionURL.buildURL('login', 'logout');
            }, this)
        });
    },

    route : function(fragments, popState, oldFragments) {
        var newFragments = this.getHashFragments(fragments);
        if (newFragments.controller !== undefined) {
            this.application.fireEvent('route', newFragments, this.getHashFragments(oldFragments, true));
        }
        else {
            alert('Router failed to find resolve view context from route.');
        }
    },

    getHashFragments : function(hash, noWarning) {
        if (!Ext.isString(hash)) {
            if (!noWarning) {
                console.warn('invalid route fragment supplied.');
            }
            hash = '';
        }

        var fragmentSplits = hash.split('?');
        var splitFragments = fragmentSplits[0].split('/');
        var urlContext = [], parsedFragment = {
            controller: undefined,
            view: undefined,
            viewContext: undefined,
            params: undefined
        };

        Ext.each(splitFragments, function(frag) {
            urlContext.push(decodeURIComponent(frag));
        });

        if (urlContext.length > 0) {
            parsedFragment.controller = urlContext[0];
            if (urlContext.length > 1) {
                urlContext.shift(); // drop the controller
                parsedFragment.view = urlContext[0];
                if (urlContext.length > 1) {
                    urlContext.shift(); // drop the view
                    parsedFragment.viewContext = urlContext;
                }
            }
            if (fragmentSplits.length > 1) {
                parsedFragment.params = this.getHashParameters(fragmentSplits[1]);
            }
        }
        return parsedFragment;
    },

    getHashParameters : function(fragment) {
        var params = {};
        var query = fragment;
        var vars = query.split("&");

        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof params[pair[0]] === "undefined") {
                params[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            }
            else if (typeof params[pair[0]] === "string") {
                var arr = [ params[pair[0]], decodeURIComponent(pair[1]) ];
                params[pair[0]] = arr;
                // If third or later entry with this name
            }
            else {
                params[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }

        return params;
    },

    /**
     * Returns a string representation of what is found after the last instance of {this.delimiter}
     * @param str
     * @returns {*}
     */
    getHashValue : function(str) {
        var h = str.split(this.delimiter);
        if (h.length === 1) {
            h = [''];
        }
        return h[h.length-1];
    }
});
