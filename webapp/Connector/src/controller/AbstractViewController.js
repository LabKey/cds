/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.AbstractViewController', {

    extend : 'Ext.app.Controller',

    init : function() {

        if (!this.views) {
            console.error('views not available to AbstractViewController. Make sure to NOT initialize as an Application Controller.');
        }

        this._registerViews();

        // ensure that the function is overridden by subclases
        if (!this.createView)
            console.error('If extending AbstractViewController then createView() must be implemented');
    },

    /**
     * @private
     * Called for each instance of the class to register all the known views for this type. The set of known views
     * is established by the 'views' param on an Ext.app.Controller.
     * See http://docs.sencha.com/ext-js/4-0/#!/api/Ext.app.Controller-cfg-views
     */
    _registerViews : function() {
        var vm = this.getViewManager();

        for (var v=0; v < this.views.length; v++) {
            vm.registerView(this.getView(this.views[v]).xtype, this);
        }
    },

    /**
     * Returns the View Manager for the Application. See Connector.controller.Connector.
     */
    getViewManager : function() {

        if (!this.viewManager)
            this.viewManager = this.application.getController('Connector');

        return this.viewManager;
    },

    /**
     * Returns the State Manager for the Application. Connector.controller.State.
     */
    getStateManager : function() {
        if (!this.stateManager)
            this.stateManager = this.application.getController('State');

        return this.stateManager;
    },

    /**
     * Experimental: Can result in deadlocks due to state being reloaded.
     * Might need to consider a way to just navigate
     * @param fragment
     * @param options
     */
    navigate : function(fragment, options) {
        if (!this.router) {
            this.router = this.application.getController('Router');
        }

        this.router.route(fragment, options);
    },

    /**
     * Called up to one time per xtype that is registered by a controller.
     * @param xtype
     * @param config
     * @param context
     */
    createView : function(xtype, config, context) {
        console.error('createView must implemented by subclasses of AbstractViewController:', this.$className);
    },

    /**
     * updateView will be called on a controller each time the view is requested EXCEPT when the view is created.
     * @param xtype
     * @param context
     */
    updateView : function(xtype, context) {
        console.error('updateView must implemented by subclasses of AbstractViewController:', this.$className);
    },

    /**
     * Allows a Controller to override the context that is provided
     * @param urlContext
     * @returns {*}
     */
    parseContext : function(urlContext) {
        return urlContext;
    }
});
