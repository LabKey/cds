/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Home', {

    extend : 'Connector.controller.AbstractViewController',

    views : ['Home'],

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
    }
});
