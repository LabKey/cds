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
			'<tpl if="model.get(\'SiteLocations\')">',
				'<div class="learn-map-container"></div>',
			'</tpl>',
			'<tpl if="model.get(\'SitesSummary\')">',
				'<p>{[values.model.get("SitesSummary")]}</p>',
			'</tpl>',
		'</tpl>'),

	mapStyles : [
	{
	    "featureType": "administrative",
	    "elementType": "geometry.fill",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "landscape.natural.landcover",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "poi.attraction",
	    "elementType": "labels.text.fill",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "poi.business",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "poi.park",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "poi.place_of_worship",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "poi.school",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "poi.sports_complex",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "road.local",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "road.arterial",
	    "stylers": [{
	        "visibility": "simplified"
	    }]
	}, {
	    "featureType": "road.highway",
	    "stylers": [{
	        "visibility": "simplified"
	    }]
	}, {
	    "featureType": "transit.line",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "transit.station.airport",
	    "stylers": [{
	        "visibility": "simplified"
	    }]
	}, {
	    "featureType": "water",
	    "stylers": [{
	        "visibility": "simplified"
	    }]
	}, {
	    "featureType": "landscape.natural.terrain",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "landscape.man_made",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "water",
	    "stylers": [{
	        "visibility": "simplified"
	    }, {
	        "lightness": -56
	    }, {
	        "saturation": -43
	    }, {
	        "hue": "#00ffff"
	    }]
	}, {
	    "featureType": "road.highway",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}],

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
	          zoom: 1,
	          styles: this.mapStyles,
	          scrollwheel: false
	        };
	        var map = new google.maps.Map(div,
	            mapOptions);

	        var sites = this.initialConfig.data.model.get('SiteLocations');
	        if (sites) {
//	        	var bounds = new google.maps.LatLngBounds();
	        	sites = sites.split(';');
	        	Ext.each(sites, function(site) {
	        		var latLng = site.split(',');
	        		if (latLng.length == 2) {
		        		latLng = new google.maps.LatLng(latLng[0], latLng[1]);
//		        		bounds.extend(latLng);
			        	var marker = new google.maps.Marker({
						    position: latLng,
						    map: map,
						    title: site.Type,
						    icon: LABKEY.contextPath + '/Connector/images//mapmarker.png'
						});
			        }
	        	});
//	        	map.fitBounds(bounds);
	        }

    	}.bind(this), 1);

		//google.maps.event.addDomListener(window, 'load', initialize);
	}
});
