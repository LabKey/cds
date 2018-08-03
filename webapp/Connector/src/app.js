/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.override(Ext.button.Button, {
    ui: 'rounded-inverted-accent'
});

Ext.override(Ext.window.Window, {
    shadow: false
});

Connector.view.Selection.supportMemberClose = false;
Connector.model.Filter.dynamicOperatorTypes = true;

Ext.application({
    name: 'Connector',
    extend: 'Connector.Application',
    autoCreateViewport: true
});

// Use the connector loader
Connector.cube.Loader.getCube(function(cube) {

    Ext.onReady(function() {
        Ext.app.Application.instance.setDataSource(cube);
    });

    // call to getCube in olap.js to initialize cube
    if (LABKEY.user.isSignedIn) {
        cube.load();
    }
});
