/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Connector', {
    extend: 'LABKEY.app.controller.View',

    /**
     * A set of 'shortcuts' that are lazily initialized that allow for this class to quickly access known sub-components.
     * An example is a ref of 'center' will provide a method on this class of 'getCenter()' which will hand back the matching
     * selection from the Component Query.
     * Component Query:  http://docs.sencha.com/ext-js/4-0/#!/api/Ext.ComponentQuery
     */
    refs : [{
        selector : 'app-main > panel[region=center]',
        ref : 'center'
    },{
        selector : 'app-main > panel[region=north]',
        ref : 'north'
    },{
        selector : 'app-main > panel[region=west]',
        ref : 'west'
    },{
        selector : 'app-main > panel[region=east]',
        ref : 'east'
    }],

    init : function() {

        /**
         * This map keys of known 'xtype's of views that will be managed by the application. The map values are
         * the associated functions for either showing or hiding that view 'type'. If these are not provided then a
         * default show/hide method is provided.
         */
        this.actions.hide['filtersave'] = {fn: this.hideFilterSaveView, scope: this};
        this.actions.show['filtersave'] = {fn: this.showFilterSaveView, scope: this};

        this.actions.hide['groupsave'] = {fn: this.hideGroupSaveView, scope: this};
        this.actions.show['groupsave'] = {fn: this.showGroupSaveView, scope: this};

        this.callParent();
    },

    /**
     * @private
     * Ensures the east region is shown and the active tab is set.
     * @param xtype
     */
    _showEastView : function(xtype, context) {
        if (!this.viewMap[xtype]) {
            this.viewMap[xtype] = this.createView(xtype, context);
        }

        var p = this.viewMap[xtype];
        this.getEast().add(p);
        this.getEast().setActiveTab(p);
    },

    showNotFound : function(controller, view, viewContext, title) {
        if (!this.viewMap['notfound']) {
            this.viewMap['notfound'] = Ext.create('Connector.view.NotFound', {});
            this.getCenter().add(this.viewMap['notfound']); // adds to tab map
        }
        this.showView('notfound');
    },

    showFilterSaveView : function(xtype, cb) {
        this._showEastView(xtype);
    },

    hideFilterSaveView : function(xtype, cb) {
        this.getEast().setActiveTab(0);
    },

    showGroupSaveView : function(xtype, cb) {
        this._showEastView(xtype);
    },

    hideGroupSaveView : function(xtype, cb) {
        this.getEast().setActiveTab(0);
    }
});

Ext.define('Connector.view.NotFound', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.notfound',

    ui: 'custom',

    style: 'padding: 20px; background-color: transparent;',

    html: '<h1 style="font-size: 200%;">404: View Not Found</h1><div style="font-size: 200%;">These aren\'t the subjects you\'re looking for.</div>'
});