Ext.define('Connector.plugin.DocumentValidation', {
    extend: 'Ext.AbstractPlugin',

    alias: 'plugin.documentvalidation',

    init : function(component) {

        Ext.override(component, {
            validateDocLinks: this.validateDocLinks,
            checkIfAllRequestsFail: this.checkIfAllRequestsFail
        });
    },

    /**
     * Validates that a list of documents are present on the server.
     * @param docList Expects an array of objects with a filename and a isLinkValid property. Filename is a string path
     *  that tells where to look on the server. If isLinkValid is true, then a request will not be sent.
     * @param successCallback A function that is called each time the server finds a document. The document record is
     *  passed as a parameter.
     * @param noRequestsCallback A function that is called if no requests were sent.
     * @param allRequestsFailCallback A function that is called if all the requests that are sent fail. If not provided,
     *  will default to noRequestsCallback
     */
    validateDocLinks : function (docList, successCallback, noRequestsCallback, allRequestsFailCallback) {
        allRequestsFailCallback = allRequestsFailCallback || noRequestsCallback;
        var sendRequest = false;

        //Flags are set to true if request successfully finds file, false if no file is found, and left undefined until
        //the request returns.
        var flags = [];
        var flagItr = docList.length;
        while (flagItr) {
            flags.push(undefined);
            flagItr--;
        }

        for (var itr = 0; itr < docList.length; itr++) {
            const doc = docList[itr];
            const i = itr;
            if (!doc.isLinkValid) {
                sendRequest = true;
                LABKEY.Ajax.request({
                    method: 'HEAD',
                    url: doc.fileName,
                    success: LABKEY.Utils.getCallbackWrapper(function (json, response) {
                        if (200 === response.status) {
                            flags[i] = true;
                            successCallback.call(this, doc);
                        }
                        else {
                            flags[i] = false
                        }
                        this.checkIfAllRequestsFail(flags, allRequestsFailCallback);
                    }, this),
                    failure: LABKEY.Utils.getCallbackWrapper(function() {
                        flags[i] = false;
                        this.checkIfAllRequestsFail(flags, allRequestsFailCallback);
                    }, this),
                    scope: this
                });
            }
        }
        if (!sendRequest) {
            noRequestsCallback.call(this);
        }
    },

    checkIfAllRequestsFail : function(flags, callback) {
        var flag = flags.reduce(function(sum, next) {
            return (sum !== undefined && next !== undefined) ? sum || next : undefined;
        });
        if (flag === false) {
            callback.call(this);
        }
    }
});