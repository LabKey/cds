/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.Application', {
    name: 'Connector',

    extend: 'Ext.app.Application',

    requires: [
        'Connector.app.model.Assay',
        'Connector.app.model.Labs',
        'Connector.app.model.Site',
        'Connector.app.model.Study',
        'Connector.app.model.StudyProducts',

        'Connector.app.store.Assay',
        'Connector.app.store.Labs',
        'Connector.app.store.Site',
        'Connector.app.store.Study',
        'Connector.app.store.StudyProducts',

        'Connector.app.view.Assay',
        'Connector.app.view.Labs',
        'Connector.app.view.Site',
        'Connector.app.view.Study',
        'Connector.app.view.StudyProducts'
    ],

    controllers: [
        'Connector', // View Manager must be registered first to properly initialize
        'State',
        'Group',
        'Main',
        'Router',
        'Citation',
        'Chart',
        'Explorer',
        'FilterStatus',
        'Home',
        'Learn',
        'Navigation',
        'Data',
        'Summary'
    ],

    defaultController: 'Home',

    views: [],

    stores: []
});
