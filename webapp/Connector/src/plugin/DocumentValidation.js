Ext.define('Connector.plugin.DocumentValidation', {
    extend: 'Ext.AbstractPlugin',

    alias: 'plugin.documentvalidation',

    init : function(component) {

        Ext.override(component, {
            validateDocLinks: this.validateDocLinks
        });
    },

    /**
     * Validates that a list of documents are present on the server.
     * @param docList Expects an array of objects with a filename and a isLinkValid property. Filename is a string path
     *  that tells where to look on the server. If isLinkValid is true, then a request will not be sent.
     * @param successCallback A function that is called each time the server finds a document. The document record is
     *  passed as a parameter.
     * @param noRequestsCallback A function that is called if no requests were sent.
     */
    validateDocLinks : function (docList, successCallback, noRequestsCallback) {
        var sendRequest = false;
        for (var itr = 0; itr < docList.length; itr++) {
            const doc = docList[itr];
            if (!doc.isLinkValid) {
                sendRequest = true;
                LABKEY.Ajax.request({
                    method: 'HEAD',
                    url: doc.fileName,
                    success: LABKEY.Utils.getCallbackWrapper(function (json, response) {
                        if (200 === response.status) {
                            successCallback.call(this, doc);
                        }
                    }, this),
                    scope: this
                });
            }
        }
        if (!sendRequest) {
            noRequestsCallback.call(this);
        }
    }
});