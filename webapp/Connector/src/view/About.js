/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.About', {

    extend : 'Ext.Component',

    alias : 'widget.about',

    ui: 'custom',

    tpl: new Ext.XTemplate(
    	'<tpl>',
	    	'<div class="signin-content">',
	            '<p>',
	            	'The Global HIV Vaccine Enterprise called for a dramatic change in the culture and practice ',
	            	'of sharing research data, and UNAIDS demanded, "faster, smarter, better" programs. ',
	            	'Solutions will come from collective efforts and strong community interaction.',
	            '</p>',
	            '<p>',
	            	'The HIV Vaccine Data Connector is the place to find potential relationships between data ',
	            	'sets that were previously difficult to compare due to access restrictions and problems of ',
	            	'data alignment.',
	            '</p>',
	            '<p>',
	            	'The Data Connector currently includes data from the Collaboration for AIDS Vaccine Discovery (est. 2006), ',
	            	'HIV Vaccine Trials Network (est. 2000), and the AIDS Vaccine Evaluation Group (est. 1988).',
	            '</p>',
	            '<div class="logoContainer">',
	            	'<img class="logo1" src="' + LABKEY.contextPath + '/Connector/images/logo_cavd.jpg">',
	            	'<img class="logo2" src="' + LABKEY.contextPath + '/Connector/images/logo_hvtn.jpg">',
	            	'<img class="logo3" src="' + LABKEY.contextPath + '/Connector/images/logo_aveg.jpg">',
	            '</div>',
	            '<p>',
	            	'The Data Connector is a collaboration between ',
	            	'<a href="http://www.scharp.org/">SCHARP</a>, ',
	            	'<a href="https://labkey.org/">Labkey</a>, ',
	            	'<a href="http://www.ibm.com/">IBM</a>, and ',
	            	'<a href="http://www.artefactgroup.com/">Artefact</a>. ',
	            	'<a href="http://www.gatesfoundation.org/">The Bill & Melinda Gates Foundation</a> ',
	            	'funded the program as part of its global health division.',
	            '</p>',
	        '</div>',
	    '</tpl>'),

	data : {},
	
    initComponent : function() {
    	this.callParent();
    }
});
