/*
 * Copyright (c) 2014-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.Text', {

	xtype : 'module.text',

	extend : 'Connector.view.module.BaseModule',

	tpl : new Ext.XTemplate(
        '<tpl if="text || allowNullText">',
			Connector.constant.Templates.module.title,
			'<p>{[this.processedText(values.text)]}</p>',
		'</tpl>', {
			processedText: function(text) {
				return text && text.replace(/\n/g, '<br/>');
			}
		}),

	hasContent : function() {
		var data = this.data || this.initialConfig.data || {};
		return data.text || data.allowNullText;
	}
});

Ext.define('Connector.view.module.HTML', {

	xtype : 'module.html',

	extend : 'Connector.view.module.BaseModule',

	tpl : new Ext.XTemplate(
		'<tpl if="text || allowNullText">',
			Connector.constant.Templates.module.title,
			'<p>{text}</p>',
		'</tpl>'
	),

	hasContent : function() {
		var data = this.data || this.initialConfig.data || {};
		return data.text || data.allowNullText;
	}
});
