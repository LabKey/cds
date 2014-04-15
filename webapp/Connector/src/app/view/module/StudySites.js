/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.module.StudySites', {

	xtype : 'app.module.studysites',

	extend : 'Connector.view.module.BaseModule',

	tpl : new Ext.XTemplate(
        '<tpl>',
			Connector.constant.Templates.module.title,
			'<tpl if="model.get(\'Sites\')">',
				'<div class="learn-map-container"></div>',
			'</tpl>',
			'<tpl if="model.get(\'SitesSummary\')">',
				'<p>{[values.model.get("SitesSummary")]}</p>',
			'</tpl>',
		'</tpl>'),

	afterRender : function() {
		// This setTimeout is required - without it google maps renders
		// correctly the first time and then incorrectly on subsequent instances.
		setTimeout(function() {

			var div = this.getEl().query('.learn-map-container');
			div = div[0];
			if (!div) {
				return;
			}

			var mapOptions = {
	          center: new google.maps.LatLng(0, 0),
	          zoom: 2
	        };
	        var map = new google.maps.Map(div,
	            mapOptions);

	        var sites = this.initialConfig.data.model.get('Sites');
	        if (sites) {
	        	var bounds = new google.maps.LatLngBounds();
	        	Ext.each(sites, function(site) {
	        		var latLng = new google.maps.LatLng(site.Latitude, site.Longitude);
	        		bounds.extend(latLng);
		        	var marker = new google.maps.Marker({
					    position: latLng,
					    map: map,
					    title: site.Type
					});
	        	});
	        	map.fitBounds(bounds);
	        }

    	}.bind(this), 1);

		//google.maps.event.addDomListener(window, 'load', initialize);
	}
});
