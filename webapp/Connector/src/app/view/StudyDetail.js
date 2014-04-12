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

    extend : 'Ext.Component',

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
                if (start && end) {
                    s += ": ";
                }
            }
            if (start && end) {
                s += Connector.app.view.Study.dateRenderer(start) + " - " + Connector.app.view.Study.dateRenderer(end);
            }
            return s;
        }
    })
});

Ext.define('Connector.app.view.StudyDetail', {

    extend : 'Ext.container.Container',

    style : {
    	padding: '15px'
    },

    layout : {
    	type: 'vbox',
    	align: 'stretch',
    	pack: 'start'
    },

    initComponent : function() {
console.log('MODULES',this.modules);
        this.items = Connector.factory.Module.defineViews(this.modules[0], this.model);

console.log('RAW thing', this.items.length, this.model.raw, this.model.get('Phase'), this.items);

        this.callParent();
    }
});
