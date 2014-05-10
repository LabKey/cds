/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/*
    This file is generated and updated by Sencha Cmd. You can edit this file as
    needed for your application, but these edits will have to be merged by
    Sencha Cmd when upgrading.
*/
Ext.override(Ext.button.Button, {
    ui: 'rounded-inverted-accent'
});

// This is a bug in setting the style so IE can render.
// See line #14789 in ext-all-sandbox-dev.js
// The IECheck function code is part of ExtJS and subject to the ExtJS license

var launchApp = function(cube) {
    Ext.onReady(function() {

        LABKEY.app.view.Selection.supportMemberClose = false;
        LABKEY.app.model.Filter.dynamicOperatorTypes = true;

        Ext.application({
            name: 'Connector',
            extend: 'Connector.Application',
            autoCreateViewport: true,
            olap: cube
        });
    });
};

var cube = LABKEY.query.olap.CubeManager.getCube({
    configId: 'CDS:/CDS',
    schemaName: 'CDS',
    name: 'DataspaceCube',
    deferLoad: true,
    applyContext: Connector.cube.Configuration.applyContext
});

// launch the app
launchApp(cube);

// call to getCube in olap.js to initialize cube
cube.load();