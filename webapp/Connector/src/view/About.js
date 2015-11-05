/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.About', {

    extend : 'Ext.Component',

    alias : 'widget.about',

    ui: 'custom',

    data: {},

    tpl: new Ext.XTemplate(
    	'<tpl>',
	    	'<div class="signin-content">',
	            '<p>',
	            	'The Global HIV Vaccine Enterprise called for a dramatic change in the culture and practice ',
	            	'of sharing research data, and UNAIDS demanded, "faster, smarter, better" programs. ',
	            	'Solutions will come from collective efforts and strong community interaction.',
	            '</p>',
	            '<p>',
	            	'The CAVD DataSpace is the place to find potential relationships between data ',
	            	'sets that were previously difficult to compare due to access restrictions and problems of ',
	            	'data alignment.',
	            '</p>',
	            '<div class="logoContainer">',
	            	'<img src="' + LABKEY.contextPath + '/Connector/images/about_lead.png">',
	            '</div>',
	            '<p>',
	            	'The Data Connector is a collaboration between ',
	            	'<a target="_blank" href="http://www.scharp.org/">SCHARP</a>, ',
	            	'<a target="_blank" href="https://labkey.org/">LabKey</a>, and ',
	            	'<a target="_blank" href="http://www.artefactgroup.com/">Artefact</a>. ',
	            	'<a target="_blank" href="http://www.gatesfoundation.org/">The Bill & Melinda Gates Foundation</a>, ',
	            	'has funded the program to date. The DataSpace is currently available to CAVD members.',
	            '</p>',
	        '</div>',
	    '</tpl>'
    )
});
