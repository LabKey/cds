/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.BaseModule', {

	cls: 'module',
	
	extend : 'Ext.Component',

	// Override this to add custom logic to determine whether this module has enough content to
	// be shown. If hasContent returns false, it won't be added to its container view.
	hasContent : function() {
		return true;
	},

	initComponent : function() {

		if (!this.hasContent()) {
			this.hidden = true;
		}
		
		this.callParent();

        // plugin to handle loading mask for this section of the learn about page
        this.addPlugin({
            ptype: 'loadingmask',
            blockingMask: false,
            beginConfig: {
                component: this,
                events: ['showLoad']
            },
            endConfig: {
                component: this,
                events: ['hideLoad']
            }
        });
	}
});
