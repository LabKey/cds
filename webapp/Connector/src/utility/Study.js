/*
 * Copyright (c) 2015-2021 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.utility.Study', {

    alternateClassName: ['StudyUtils'],

    singleton: true,

    initialize : function(callback, scope) {
        if (!this.studyDescription || !this.treatmentArmDescription) {
            LABKEY.Query.selectRows({
                schemaName: 'cds',
                queryName: 'study',
                success: function(response) {
                    this.studyData = response.rows;
                    this._onLoadComplete(callback, scope);
                },
                scope: this
            });

            LABKEY.Query.selectRows({
                schemaName: 'cds',
                queryName: 'treatmentarm',
                success: function(response) {
                    this.armData = response.rows;
                    this._onLoadComplete(callback, scope);
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

    _onLoadComplete : function(callback, scope) {
        if (Ext.isDefined(this.studyData) && Ext.isDefined(this.armData)) {

            this.studyDescription = {};
            Ext.each(this.studyData, function(row){
                this.studyDescription[row.label] = row.description;
            }, this);

            this.treatmentArmDescription = {};
            Ext.each(this.armData, function(row){
                this.treatmentArmDescription[row.coded_label] = row.description;
            }, this);

            if (Ext.isFunction(callback)) {
                callback.call(scope ? scope : this);
            }
        }
    },

    getStudyDescription : function(label) {
        if (!this.studyDescription)
            throw 'study utils has not been initialized, call initialize prior to using this method';

        return this.studyDescription[label];
    },

    getTreatmentArmDescription : function(label) {
        if (!this.treatmentArmDescription)
            throw 'study utils has not been initialized, call initialize prior to using this method';

        return this.treatmentArmDescription[label];
    }
});