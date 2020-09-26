/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.plugin.DocumentValidation', {
    extend: 'Ext.AbstractPlugin',

    alias: 'plugin.documentvalidation',

    statics: {
        getStudyDocumentUrl: function(filename, studyName, docId)
        {
            return LABKEY.ActionURL.buildURL('cds', 'getStudyDocument', null, {
                study: studyName,
                documentId: docId,
                filename: filename
            });
        },
        getPublicationDocumentUrl: function(filename, docId)
        {
            return LABKEY.ActionURL.buildURL('cds', 'getStudyDocument', null, {
                documentId: docId,
                filename: filename,
                publicAccess: true
            });
        }
    },

    init : function(component) {

        Ext.override(component, {
            validateDocLinks: this.validateDocLinks,
            validateSchemaAccessLink: this.validateSchemaAccessLink
        });
    },

    /**
     * Validates that a list of documents are present on the server.
     * @param docList Expects an array of objects with a filename and a isLinkValid property. Filename is a string path
     *  that tells where to look on the server. If isLinkValid is true, then a request will not be sent.
     * @param callback A function that is called each time the server checks a document. The document record and the request result is
     *  passed as parameters.
     */
    validateDocLinks : function (docList, callback) {
        for (var itr = 0; itr < docList.length; itr++) {
            const doc = docList[itr];
            if (doc.isLinkValid === undefined && doc.hasPermission) {
                LABKEY.Ajax.request({
                    method: 'HEAD',
                    url: doc.filePath,
                    success: LABKEY.Utils.getCallbackWrapper(function (json, response) {
                        if (200 === response.status) {
                            callback.call(this, doc, true);
                        }
                        else {
                            callback.call(this, doc, false);
                        }
                    }, this),
                    failure: LABKEY.Utils.getCallbackWrapper(function() {
                        callback.call(this, doc, false);
                    }, this),
                    scope: this
                });
            }
            else {
                callback.call(this, doc, doc.isLinkValid === true && doc.hasPermission);
            }
        }
    },

    validateSchemaAccessLink : function(schema_link, callback) {
        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL("cds", "validateStudySchemaLink.api"),
            params: {

                // Support Ticket 40760: Treatment and assay schemas link not showing up on Learn/Study pages
                // Treatment and Assay schema files reside at '/_webdav/home/files/@files/static/',
                // however, this link is stored as '/_webdav/home/files/%40files/static/' in cds.study, where '@' is already encoded to %40;
                // and '%40' gets further encoded to '%2540' messing up the file path during validation, hence replacing "%40files" with "@files"
                // TODO: wonder if it would be better to do this during ETL?
                filename: schema_link.replace("%40files", "@files")
            },
            method: 'GET',
            scope: this,
            success: function (response) {
                var resp = Ext.decode(response.responseText);
                callback.call(this, schema_link, resp.isValidLink);
            },
            failure: function (error) {
                console.error("Failure on validating Schema Access link");
            }
        });
    }
});