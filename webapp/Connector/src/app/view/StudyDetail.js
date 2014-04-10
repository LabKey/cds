/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.StudyDetail', {

    extend : 'Ext.container.Container',

    style : {
    	padding: '15px'
    },

    layout : {
    	type: 'vbox',
    	align: 'stretch',
    	pack: 'start'
    },

    initComponent : function() {

        this.items = Connector.factory.Module.defineViews(this.modules, this.model);

        this.callParent();
    }
});
