/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.State', {
    extend: 'LABKEY.app.controller.State',

    defaultTitle: 'HIV Vaccine Collaborative Dataspace',

    subjectName: 'Subject',

    appVersion: '0.5',

    init : function() {
        this.callParent();

        Connector.STATE = this;
        this.onMDXReady(function(mdx) {
            Connector.model.Filter.loadSubjectContainer(mdx);
        });
    },

    getTitle : function(viewname) {
        return 'Connector: ' + viewname;
    },

    requestFilterUndo : function() {
        var index = this.getPreviousState();
        if (index > -1) {
            this.loadFilters(index);
        }
        else {
            console.warn('FAILED TO UNDO. NOT ABLE TO FIND STATE');
        }
    },

    getFilterModelName : function() {
        return 'Connector.model.Filter';
    }
});