/*
    This file is generated and updated by Sencha Cmd. You can edit this file as
    needed for your application, but these edits will have to be merged by
    Sencha Cmd when upgrading.
*/

// This is a bug in setting the style so IE can render.
// See line #14789 in ext-all-sandbox-dev.js
// The IECheck function code is part of ExtJS and subject to the ExtJS license

var launchApp = function(cube) {
    Ext.onReady(function() {

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
    name: 'ParticipantCube',
    deferLoad: true,
    applyContext: Connector.cube.Configuration.applyContext
});

// launch the app
launchApp(cube);

// call to getCube in olap.js to initialize cube
cube.load();