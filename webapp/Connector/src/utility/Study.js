/*
 * Copyright (c) 2015-2021 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.utility.Study', {

    alternateClassName: ['StudyUtils'],

    singleton: true,

    getStudyDescription : function(label, callback, scope) {
        if (!this.studyDescription) {
            this.studyDescription = {};

            // lazily populate the map
            LABKEY.Query.selectRows({
                schemaName: 'cds',
                queryName: 'learn_studiesforassays',
                success: function(response) {
                    Ext.each(response.rows, function(row){
                        this.studyDescription[row.label] = row.description;
                    }, this);

                    if (Ext.isFunction(callback)) {
                        callback.call(scope ? scope : this, this.studyDescription[label]);
                    }
                },
                scope: this
            });
        }
        else {
            if (Ext.isFunction(callback)) {
                callback.call(scope ? scope : this, this.studyDescription[label]);
            }
        }
    }
});