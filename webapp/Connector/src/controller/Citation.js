Ext.define('Connector.controller.Citation', {

    extend : 'Connector.controller.AbstractViewController',

    views  : ['Citation'],

    models : ['Citation'],

    init : function() {

        this.control('#gridsources', {
            click : function(btn) {
                this.getViewManager().changeView('citation', 'citation/data citations', true);
            }
        });

        // source from grid
        this.control('datagrid', {
            sourcerequest : this.sourceRequest
        });

        this.control('plot', {
            sourcerequest : this.sourceRequest
        });

        // sources/references from citations
        this.control('citation', {
            citationrequest : function() {
                var rawdata = this.getViewManager().getViewInstance('datagrid');
                if (rawdata) {
                    this.sourceRequest(rawdata.measures, rawdata.queryMetadata);
                }
            },
            referencerequest : function(rec) {
                var refs = rec.get('references');

                var references = [];
                for (var r=0; r < refs.length; r++) {
                    references.push(refs[r].URI);
                }

                if (references.length > 0) {
                    var citationView = this.getViewManager().getViewInstance('citation');
                    this.requestCitation(references, function(response) {
                        this.handleRequest(response, 'References', rec)
                    }, citationView);
                }
            },
            sourcerequest : function(rec) {
                var refs = rec.get('dataSources');

                var references = [];
                for (var r=0; r < refs.length; r++) {
                    references.push(refs[r].URI);
                }

                if (references.length > 0) {
                    var citationView = this.getViewManager().getViewInstance('citation');
                    this.requestCitation(references, function(response) {
                        this.handleRequest(response, 'Data Sources', rec);
                    }, citationView);
                }
            },
            closedetail : function() {
                this.getStateManager().clearAppState();
                window.history.back();
            },
            destroycitation : function(view) {
                this.getViewManager().unregister(view);
                view.destroy();
            }
        });

        this.callParent();
    },

    createView : function(xtype, config) {

        if (xtype == 'citation') {
            return Ext.create('Connector.view.Citation', {});
        }
    },

    updateView : function(xtype, context) { },

    requestCitation : function(sourceURIs, cb, scope) {

        // Do request
        Ext.Ajax.request({
            url     : LABKEY.ActionURL.buildURL('cds', 'getCitations.api', null, { root : sourceURIs }),
            method  : 'GET',
            success : function(response) {
                if (cb) {
                    cb.call(this, Ext.decode(response.responseText));
                }
            },
            scope : scope || this
        });

    },

    requestSources : function(sql, schema, cb, scope) {

        // Do Request
        LABKEY.Query.executeSql({
            sql : sql,
            schemaName : schema,
            success : function(response) {
                var URIs = [];
                for (var s=0; s < response.rows.length; s++) {
                    URIs.push(response.rows[s].Source);
                }
                cb.call(this, URIs);
            },
            scope : scope || this
        });
    },

    sourceRequest : function(measures, metadata) {

        var clauses = [];

        // build source URIs
        for (var i=0; i < measures.length; i++) {

            if (measures[i].isSourceURI) {

                var sourceColName = measures[i].alias;
                var clause = "SELECT DISTINCT \"" + sourceColName + "\" AS Source FROM " + metadata.schemaName + ".\"" + metadata.queryName + "\"";
                clauses.push(clause);
            }
        }

        // process URIs
        var citationView = this.getViewManager().getViewInstance('citation');

        if (citationView) {
            if (clauses.length > 0) {

                var sql = clauses.join(" UNION ");
                this.requestSources(sql, 'study', function(URIs) {

                    this.requestCitation(URIs, function(response) {
                        this.handleRequest(response, 'Citations', 'of Current Data Grid');
                    }, citationView);

                }, this);
            }
            else {
                citationView.handleRequest({citations:[]});
            }
        }
    }

});
