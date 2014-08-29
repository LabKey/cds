/*
 This file is generated and updated by Sencha Cmd. You can edit this file as
 needed for your application, but these edits will have to be merged by
 Sencha Cmd when upgrading.
 */
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
    deferLoad: true,
    defaultCube: {
        configId: 'CDS:/CDS',
        schemaName: 'CDS',
        name: 'DataspaceCube'
    },
    defaultContext: {
        defaults: Connector.cube.Configuration.defaults,
        values: Connector.cube.Configuration.context
    }
});

// launch the app
launchApp(cube);

// call to getCube in olap.js to initialize cube
if (LABKEY.user.isSignedIn) {
    cube.load();
}
