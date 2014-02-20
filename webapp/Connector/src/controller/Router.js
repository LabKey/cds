/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Router', {
    extend: 'LABKEY.app.controller.Route',

    init : function() {
        /* This control is responsible for loading the application */
        this.control(
                'app-main', {
                    afterrender: this.onAppReady
                }
        );

        this.callParent();
    }
});
