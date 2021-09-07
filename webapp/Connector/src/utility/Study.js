/*
 * Copyright (c) 2015-2021 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.utility.Study', {

    alternateClassName: ['StudyUtils'],

    singleton: true,

    initialize : function(callback, scope) {
        if (!this.studyDescription) {
            LABKEY.Query.selectRows({
                schemaName: 'cds',
                queryName: 'study',
                success: function(response) {
                    this.studyDescription = {};
                    Ext.each(response.rows, function(row){
                        this.studyDescription[row.label] = row.description;
                    }, this);

                    if (Ext.isFunction(callback)) {
                        callback.call(scope ? scope : this);
                    }
                },
                scope: this
            });
        }
        else {
            if (Ext.isFunction(callback)) {
                callback.call(scope ? scope : this);
            }
        }
    },

    getStudyDescription : function(label) {
        if (!this.studyDescription)
            throw 'study utils has not been initialized, call initialize prior to using this method';

        return this.studyDescription[label];
    }
});