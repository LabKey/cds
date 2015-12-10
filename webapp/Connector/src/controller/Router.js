/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Router', {
    extend: 'LABKEY.app.controller.Route',

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

        this.callParent();
    },

    onAppReady : function() {
        this.callParent();
        this.userChanged();
    },

    userChanged : function() {
        this.eastview.setVisible(LABKEY.user.isSignedIn);
    },

    addURLParameter : function(url, parameterName, parameterValue, atStart/*Add param before others*/){
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
    }
});
