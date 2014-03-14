/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.AbstractViewController', {

    extend : 'LABKEY.app.controller.AbstractViewController',

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
    }
});
