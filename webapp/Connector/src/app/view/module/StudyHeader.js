/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
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
