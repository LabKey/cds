/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Data', {

    extend : 'Connector.controller.AbstractGridController',

    views: ['Grid'],

    controllerName: 'data',

    viewXtype: 'groupdatagrid',

    viewClazz: 'Connector.view.Grid',

    modelClazz: 'Connector.model.Grid',

    viewTitle: 'Data Grid'
});
