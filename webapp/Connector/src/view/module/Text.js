/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.Text', {

	xtype : 'module.text',

	extend : 'Ext.view.View',

	tpl : new Ext.XTemplate(
        '<tpl if="text || allowNullText">',
			Connector.constant.Templates.module.title,
			'<p>{text}</p>',
		'</tpl>')
});
