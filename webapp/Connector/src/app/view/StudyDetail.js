/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/************************************************************************************************

/*
 * Module views - these can be moved to separate files
 */
Ext.define('Connector.view.module.StudyHeader', {

    xtype : 'module.studyheader',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
        '<tpl><p>',
            '{[this.phaseString(values.model)]}',
        '</p></tpl>',
    {
        phaseString : function(model) {
            var phase = model.get('Phase');
            var start = model.get('StartDate');
            var end = model.get('EndDate');
            var s = '';
            if (phase) {
                s = "Phase " + phase;
                if (start || end) {
                    s += ": ";
                }
            }
            if (start && end) {
                s += Connector.app.view.Study.dateRenderer(start) + " - " + Connector.app.view.Study.dateRenderer(end);
            } else if (start || end) {
                s += Connector.app.view.Study.dateRenderer(start || end)
            }
            return s;
        }
    })
});

Ext.define('Connector.app.view.StudyDetail', {

    extend : 'Ext.container.Container',

    layout : {
    	type: 'hbox',
        pack: 'start',
        align: 'stretch'
    },

    items: [{
        flex: 1,
        xtype: 'container',
        itemId : 'column1',
        cls: 'modulecontainer',
        layout : {
            type : 'vbox',
            align: 'stretch'
        }
    }, {
        flex: 1,
        xtype: 'container',
        itemId : 'column2',
        cls: 'modulecontainer',
        layout : {
            type : 'vbox',
            align: 'stretch'
        }
    }],

    initComponent : function() {

        this.callParent();

        var left = this.getComponent('column1');
        var right = this.getComponent('column2');

        left.add(Connector.factory.Module.defineViews(this.modules[0], this.model));
        right.add(Connector.factory.Module.defineViews(this.modules[1], this.model));
    }
});
