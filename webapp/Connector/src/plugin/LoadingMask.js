/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.define('Connector.plugin.LoadingMask', {
    extend: 'LABKEY.app.plugin.LoadingMask',

    alias: 'plugin.loadingmask',

    productionGifPath: Connector.resourceContext.imgPath + '/mask/'
});