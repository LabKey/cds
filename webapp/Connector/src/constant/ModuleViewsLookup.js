/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.constant.ModuleViewsLookup', {
	singleton: true,

	// Lookup table from module view types to view names
	text: 'module.text',
	person: 'module.person',
	productheader: 'app.module.productheader',
	productstudies: 'app.module.productstudies',
	studyheader: 'app.module.studyheader',
	studysites: 'app.module.studysites',
	studyassays: 'app.module.studyassays',
	studyproducts: 'app.module.studyproducts',
	studylabsandclinicaldata: 'app.module.studylabsandclinicaldata'
});
