/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.MabGrid', {

    extend : 'Connector.controller.AbstractGridController',

    views: ['MabGrid'],

    controllerName: 'mabgrid',

    viewXtype: 'mabdatagrid',

    viewClazz: 'Connector.view.MabGrid',

    modelClazz: 'Connector.model.MabGrid',

    viewTitle: 'MAb Grid'
});
