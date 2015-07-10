/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Home', {

    extend : 'Connector.controller.AbstractViewController',

    stores : [],

    views : ['Home', 'About'],

    models : ['RSSItem'],

    init : function() {

        this.control('home > homeheader', {
            boxready: this.resolveStatistics
        });

        this.control('#back', {
            click : function() {
                history.back();
            }
        });

        this.callParent();
    },

    createView : function(xtype, config, context) {
        var v;

        if (xtype == 'home') {
            v = Ext.create('Connector.view.Home', {});
        }
        else if (xtype == 'about') {
            var header = Ext.create('Connector.view.PageHeader', {
                title: "About the HIV Collaborative DataSpace",
                upText: 'Home',
                upLink: {
                    controller: 'home'
                },
                scope : this
            });

            v = Ext.create('Connector.view.Page', {
                header: header,
                contentViews: [ Ext.create('Connector.view.About', {}) ],
                pageID: 'homeAbout'
            });
        }

        return v;
    },

    updateView : function(xtype, context) {},

    getDefaultView : function() {
        return 'home';
    },

    resolveStatistics : function(view) {
        var statDisplay = view.getComponent('statdisplay');
        if (statDisplay) {

            Statistics.resolve(function(stats) {
                statDisplay.update({
                    nstudy: stats.primaryCount,
                    ndatapts: stats.dataCount
                });
            }, this);
        }
    }
});
