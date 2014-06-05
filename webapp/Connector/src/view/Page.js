/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Page', {

    extend: 'Ext.container.Container',

	height: "100%",

    statics: {
        pageState: {}
    },

	items: [{
		xtype: 'container',
		itemId: 'northRegion',
		height: 10,

		cls: 'pageheadercontainer'
	}, {
		xtype: 'container',
		itemId: 'centerRegion'
	}],

	plugins: ['headerlock'],

	selectedView : 0,

	headerHeight : 161,

	getHeader : function() {
		return this.getComponent('northRegion');
	},

    selectTab : function(tab) {
        this.state.selectedTab = tab;
        Ext.each(this.contentViews, function(view, i) {
            view.setVisible(i == tab);
        }, this);
        this.header.selectTab(tab);
    },

    initComponent : function() {

        var data = this.data;

        this.selectTab = Ext.bind(this.selectTab, this);

        // if (this.scrollContent) {
        //     this.items[1].layout = {
        //         type: 'hbox',
        //         align: 'stretch'
        //     }
        // }

        // Initialize page state
        this.state = {};

        if (this.pageID) {
            // If a pageID is provided the state will be cached and shared with future
            // instances
            this.state = Connector.view.Page.pageState[this.pageID] || {};
            Connector.view.Page.pageState[this.pageID] = this.state;
        }

        if (!Ext.isDefined(this.state.selectedTab)) {
            this.state.selectedTab = this.initialSelectedTab || 0;
        }

		this.items[0].height = this.header.height;

        this.callParent();

        var center = this.getComponent('centerRegion');
        var north = this.getHeader();

        this.header.onTabClick(this.selectTab);

        this.selectTab(this.state.selectedTab);

        Ext.each(this.contentViews, function(view, i) {
            center.add(view);
        }, this);

        north.add(this.header);
    }

});

Ext.define('Connector.plugin.HeaderLock', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.headerlock',

    init : function(cmp) {

        this.cmp = cmp;

        cmp.on('afterrender', function() {
            // initialize constants
            this.elements = {
                view: cmp.up().getEl()
            };

            // initialize listeners
            var EM = Ext.EventManager;
            EM.on(this.elements.view, 'scroll', this.onScroll, this);

        }, this);
    },

    destroy : function() {
        // unregister
        var EM = Ext.EventManager;
        if (this.elements) {
            EM.un(this.elements.view, 'scroll', this.onScroll, this);
        }
    },

    update : function() {
    },

    onScroll : function(event) {
    	var cmp = Ext.get(event.target);
    	var scrollTop = cmp.getScrollTop();
    	var allowedScroll = this.cmp.header.height - (this.cmp.header.lockPixels || 0);
    	var scroll = 0;
    	if (scrollTop > allowedScroll) {
    		scroll = scrollTop - allowedScroll;
    	}
		this.cmp.getHeader().el.setStyle('top', scroll + "px");
    }
});
