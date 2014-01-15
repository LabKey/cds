Ext.define('Connector.controller.Router', {

    extend : 'Ext.app.Controller',

    delimiter : '#',

    routes: [],

    init : function(app) {
        /* Could dynamically link controllers if necessary */

        /* This control is responsible for loading the application */
        this.control(
            'app-main', {
                afterrender: this.onAppReady
            }
        );

        var me = this;
        var popState = false;

        var pathChangeTask = new Ext.util.DelayedTask(function() {
            me.route(me.getHashValue(location.hash), popState);
            popState = false;
        });

        var pathChange = function() { pathChangeTask.delay(50); };

        Ext.EventManager.on(window, 'hashchange', pathChange);

        if (Ext.supports.History) {
            Ext.EventManager.on(window, 'popstate', function() {
                popState = true;
                pathChange();
            });
        }
    },

    onAppReady : function() {

        var hash = this.getHashValue(location.hash);

        if (hash.length > 0) {
            this.route(hash);
        }
        else {
            this.application.getController('State').loadState(null, null, null, true);
        }
    },

    route : function(fragments, popState) {
        var _fragments = fragments;
        if (Ext.isString(_fragments)) {
            _fragments = _fragments.split('/');
        }

        if (Ext.isArray(_fragments)) {
            var viewContext = _fragments;

            if (viewContext.length > 0) {
                var view = viewContext[0];
                var _vc = null;
                if (viewContext.length > 1) {
                    _vc = viewContext;
                }
                this.application.getController('State').loadState(view, _vc, null, true, popState);
            }
            else {
                alert('Router failed to find resolve view context from route.');
            }
        }
        else {
            alert('Router failed to route due to invalid route supplied.');
        }
    },

    /**
     * Returns a string representation of what is found after the last instance of {this.delimiter}
     * @param str
     * @returns {*}
     */
    getHashValue : function(str) {
        var h = str.split(this.delimiter);
        if (h.length == 1) {
            h = [''];
        }
        return h[h.length-1];
    }
});
