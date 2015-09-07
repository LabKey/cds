/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Page', {

    extend: 'Ext.container.Container',

	height: "100%",

    statics: {
        pageState: {}
    },

    cls: 'auto-scroll-y',
    
	//plugins: ['headerlock'],

	selectedView: 0,

	headerHeight: 160,

    initialSelectedTab: 0,

    initComponent : function() {
        // Initialize page state
        if (this.pageID) {
            // If a pageID is provided the state will be cached and shared with future instances
            this.state = Connector.view.Page.pageState[this.pageID] || {};
            Connector.view.Page.pageState[this.pageID] = this.state;
        }
        else {
            this.state = {};
        }

        if (!Ext.isDefined(this.state.selectedTab)) {
            this.state.selectedTab = this.initialSelectedTab;
        }

        this.items = [{
            xtype: 'container',
            itemId: 'northRegion',
            height: this.header.height + 'px',
            cls: 'pageheadercontainer'
        },{
            xtype: 'container',
            itemId: 'centerRegion'
        }];

        this.callParent();

        this.selectTab(this.initialSelectedTab);

        if (!Ext.isEmpty(this.contentViews)) {
            this.getComponent('centerRegion').add(this.contentViews);
        }

        this.getHeader().add(this.header);
    },

    getHeader : function() {
        return this.getComponent('northRegion');
    },

    selectTab : function(tab) {
        this.state.selectedTab = tab;
        Ext.each(this.contentViews, function(view, i) {
            view.setVisible(i == tab);
        }, this);
        this.header.selectTab(tab);
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
    	var cmp = Ext.get(event.target),
            scrollTop = cmp.getScrollTop(),
            allowedScroll = this.cmp.header.height - (this.cmp.header.lockPixels || 0),
            top = 0;
        top -= Math.min(scrollTop, allowedScroll);
		this.cmp.getHeader().getEl().setStyle({
            top: top + 'px',
            position: 'absolute'
        });
    }
});
