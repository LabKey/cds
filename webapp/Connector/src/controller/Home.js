/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Home', {

    extend : 'Connector.controller.AbstractViewController',

    stores : [],

    views : ['Home', 'About'],

    models : ['RSSItem'],

    init : function() {

        this.control('homeheader', {
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
                title: "About the CAVD DataSpace",
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

    resolveStatistics : function(view)
    {
        var statDisplay = view.getComponent('statdisplay');
        if (statDisplay)
        {
            Statistics.resolve(function(stats)
            {
                statDisplay.update({
                    nstudy: stats.studies,
                    ndatapts: stats.datacount,
                    nsubjectstudy: stats.subjectlevelstudies
                });
            }, this);
        }
    },

    loadHelpFile : function(helpView, pageName) {
        var helpBackView = Ext.getCmp('helpback');
        var helpTitleView = Ext.getCmp('helptitle');
        var helpBodyView = Ext.getCmp('helpcenterbody');
        if (!pageName)
            var pageName = 'HelpHome';
        Ext.Ajax.request({
            url: LABKEY.ActionURL.buildURL('cds', 'HelpCenterHome.api'),
            method: 'GET',
            params: {
                name: pageName
            },
            success: function(response) {
                HelpRouter.clearHistory();
                var json = Ext.decode(response.responseText);
                helpBackView.setText('');
                helpTitleView.setText(json.title);
                helpBodyView.setTemplate(json.htmlBody);
                HelpRouter.addHelpHistory(json.name);
            },
            scope: this
        });
    }
});
