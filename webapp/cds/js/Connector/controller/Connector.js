/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This is the primary view controller (a.k.a. Application View Controller). It is responsible for registering views
 * that are used in the application and managing what views are shown based on the active view.
 * When a controller creates a view it should register that view instance with this Controller
 */
Ext4.define('Connector.controller.Connector', {

    extend : 'Ext.app.Controller',

    /**
     * A set of 'shortcuts' that are lazily initialized that allow for this class to quickly access known sub-components.
     * An example is a ref of 'center' will provide a method on this class of 'getCenter()' which will hand back the matching
     * selection from the Component Query.
     * Component Query:  http://docs.sencha.com/ext-js/4-0/#!/api/Ext.ComponentQuery
     */
    refs : [{
        selector : 'viewport > panel[region=center]',
        ref : 'center'
    },{
        selector : 'viewport > panel[region=north]',
        ref : 'north'
    },{
        selector : 'viewport > panel[region=west]',
        ref : 'west'
    },{
        selector : 'viewport > panel[region=east]',
        ref : 'east'
    }],

    init   : function()
    {
        /**
         * This is a map of all the views for the Connector Application.
         * It's purpose is to be able to register views and then use them throughout the application lifetime
         * NOTE: This is different from Ext.app.Controller.getView() because it returns an instance of a view
         */
        this.viewMap = {};
        this.tabMap = {};
        this.controllerMap = {};

        if (LABKEY.ActionURL) {
            var params = LABKEY.ActionURL.getParameters();
            //
            // Manage transitions
            //
            if (Ext4.isDefined(params['transition'])) {
                this.allowAnimations = false;
            }
            else {
                this.allowAnimations = true;
            }
        }

        this.stateController = this.application.getController('State');

        /**
         * This map keys of known 'xtype's of views that will be managed by the application. The map values are
         * the associated functions for either showing or hiding that view 'type'. If these are not provided then a
         * default show/hide method is provided.
         */
        this.actions = {
            hide : {
                'filtersave' : {fn: this.hideFilterSaveView, scope: this},
                'groupsave'  : {fn: this.hideGroupSaveView, scope: this},
                'singleaxis' : {fn: this.hideExplorerView, scope: this},
                'summary': {fn: this.hideSummaryView, scope: this}
            },
            show : {
                'filtersave' : {fn: this.showFilterSaveView, scope: this},
                'groupsave'  : {fn: this.showGroupSaveView, scope: this}
            }
        };

        // Listen for when views are added to the center view and register that components xtype
        this.control('viewport > #primarytabpanel',
                {
                    // See http://docs.sencha.com/ext-js/4-0/#!/api/Ext.tab.Panel-method-add
                    add : function (tp, comp) {
                        this._addTab(comp.xtype);
                    }
                }
        );

        // Since the Connector.panel.Header does not have its own controller this controller is provided.
//        this.requestCollapse = false;
        this.control('connectorheader',
                {
                    // See http://docs.sencha.com/ext-js/4-0/#!/api/Ext.tab.Panel-event-afterrender
                    afterrender : function(c) {
                        this.hdr = c;
//                        if (this.requestCollapse)
//                            this.hdr.collapse(true);
                    },
                    // See Connector.panel.Header event 'headerclick'.
                    headerclick : function() {
                        this.changeView('summary');
                    }
                }
        );

        this.control('panel > #videobtn',
                {
                    afterrender : this.initTutorial
                }
        );
    },

    /**
     * This is used to register a view xtype to a controller instance. When an action needs to be performed on a view
     * the associated contoller will be called. Normally, this is called by a Controller registering a view type.
     * @param viewtype
     * @param controllerInstance
     */
    registerView : function(viewtype, controllerInstance) {
        this.controllerMap[viewtype] = controllerInstance;
    },

    registerShowAction : function(xtype, showAction, scope) {
        if (this.allowAnimations) {
            this.actions.show[xtype] = {
                fn: showAction,
                scope: scope
            }
        }
    },

    registerHideAction : function(xtype, hideAction, scope) {
        if (this.allowAnimations) {
            this.actions.hide[xtype] = {
                fn: hideAction,
                scope: scope
            }
        }
    },

    /**
     * This function registers a view instance. This should be called by each controller once a view is created.
     * Only one view instance allowed per xtype.
     * @param viewInstance
     */
    register : function(viewInstance) {
        this.viewMap[viewInstance.getXType()] = viewInstance;
    },

    /**
     * Returns true if the provided xtype has been registered with this Controller.
     * @param xtype
     */
    isRegistered : function(xtype) {
        return this.controllerMap[xtype];
    },

    /**
     * Allows a view instance to be unregistered from the controller. This can be used during clean-up of a view.
     * @param viewInstance
     */
    unregister : function(viewInstance) {
        this.viewMap[viewInstance.getXType()] = undefined;
    },

    /**
     * Creates a view instance from the provided xtype. This will call the provided registered Controller for the xtype
     * to get the view instance. See Connector.controller.AbstractViewController.createView.
     * @param xtype
     * @param context
     */
    createView : function(xtype, context) {
        if (this.controllerMap[xtype]) {
            var instance = this.controllerMap[xtype].createView(xtype, context);

            if (!Ext4.isDefined(instance) || instance === false) {
                return this.showNotFound();
            }

            if (Ext4.isArray(instance)) {
                if (!instance[1])
                    return instance[0];
            }
            this.CREATE_VIEW = true;
            this.register(instance);
            return instance;
        }
        console.error('Failed to create view of type \'' + xtype + '\' because it has not been registered.');
    },

    /**
     * Will return the instance of a view if that view has already been instantiated.
     * @param xtype The xtype of the view instance
     */
    getViewInstance : function(xtype) {
        if (this.viewMap[xtype])
            return this.viewMap[xtype];
        return null;
    },

    /**
     * The default method for showing a view in the center region.
     * @param xtype
     */
    showView : function(xtype) {

        if (!this.viewMap[xtype]) {
            this.viewMap[xtype] = this.createView(xtype);
        }

        var actions = this.resolveViewTransitions(null, xtype);

        if (actions.show) {
            actions.show.fn.call(actions.show.scope, xtype);
        }
        else {
            console.error('failed to resolve show method.');
        }
    },

    /**
     * The default method for hiding a view in the center region.
     * @param view
     */
    hideView : function(view) {
        var actions = this.resolveViewTransitions(view);

        if (actions.hide)
            actions.hide.fn.call(actions.hide.scope, view, function(){});
        else
            console.error('failed to resolve hide method.');

    },

    /**
     * Default method for fading in a registered view instance.
     * @param xtype
     */
    fadeInView : function(xtype) {
        this.viewMap[xtype].show();
//        if (this.viewMap[xtype].rendered) {
//            this.viewMap[xtype].getEl().fadeIn();
//            this.viewMap[xtype].show();
//        }
//        else {
//            this.viewMap[xtype].show();
//        }
    },

    /**
     * Default method for fading out a registered view instance.
     * @param xtype
     * @param callback
     */
    fadeOutView : function(xtype, callback) {
        callback.call(this);
//        this.viewMap[xtype].getEl().fadeOut({
//            listeners : {
//                afteranimate : function() {
//                    callback.call(this);
//                },
//                scope : this
//            },
//            scope : this
//        });
    },

    showNotFound : function() {
        if (!this.viewMap['notfound']) {
            this.viewMap['notfound'] = Ext4.create('Connector.view.NotFound', {});
            this.getCenter().add(this.viewMap['notfound']); // adds to tab map
        }
        this.showView('notfound');
    },

    /**
     * Call when a view needs to be shown. This will resolve all transitions and call the set show/hide methods
     * for that view type.
     * @param {String} newViewXtype Xtype of the view to be shown
     * @param {Array} newViewContext url-based context (optional)
     * @param {String} viewTitle Title to display for page in browser (optional)
     * @param {Boolean} skipState Control over whether this view change is a recorded state event. Defaults to False.
     * @param {Boolean} skipHide Control over whether the 'activeView' should be hidden. Defaults to False.
     */
    changeView : function(newViewXtype, newViewContext, viewTitle, skipState, skipHide) {
        this.inTransition = true;

        var _context = [];
        if (newViewContext) {
            if (Ext4.isString(newViewContext))
                newViewContext = newViewContext.split('/');
            _context = Ext4.Array.clone(newViewContext);
            _context.shift(); // drop the active view
        }

        var c = this.controllerMap[newViewXtype], context;

        if (c) {
            context = c.parseContext(_context);
        }
        else {
            this.showNotFound();
            this.inTransition = false;

            return;
        }

        var actions = this.resolveViewTransitions(this.activeView, newViewXtype);

        if (!skipHide && actions.hide) {
            actions.show.fn.call(actions.show.scope, newViewXtype, context);
        }
        else if (actions.show) {
            actions.show.fn.call(actions.show.scope, newViewXtype, context);
        }

        if (!this.CREATE_VIEW) {
            this.controllerMap[newViewXtype].updateView(newViewXtype, context);
        }
        this.CREATE_VIEW = false;

        this.stateController.updateView(newViewXtype, newViewContext, viewTitle, skipState);

        this.activeView = newViewXtype;

        this.inTransition = false;

        this.fireEvent('afterchangeview', this.activeView, context);
    },

    /**
     * Resovles the transition functions that will be called to show the newViewXtype and hide the oldViewXtype.
     * @param {String} oldViewXtype
     * @param {String} newViewXtype
     */
    resolveViewTransitions : function(oldViewXtype, newViewXtype) {

        var actions = {
            show : undefined,
            hide : undefined
        };

        if (oldViewXtype) {
            actions.hide = this.actions.hide[oldViewXtype];
        }

        if (newViewXtype) {
            actions.show = this.actions.show[newViewXtype];
            if (!actions.show) {
                actions.show = {fn: this._showView, scope: this};
            }
        }

        return actions;
    },

    /**
     * @private
     * Adds a tab to the tab mapping for the center region.
     * @param xtype
     */
    _addTab : function(xtype) {
        this.tabMap[xtype] = this.getCenter().items.length;
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

        this.getEast().add(this.viewMap[xtype]);
        this.getEast().setActiveTab(this.viewMap[xtype]);
    },

    /**
     * @private
     * Default show view method used to set the active view for the center region.
     * @param xtype
     */
    _showView : function(xtype, context) {

        var center = this.getCenter();

        if (!this.viewMap[xtype] || !this.tabMap[xtype]) {
            this.viewMap[xtype] = this.createView(xtype, context);
            center.add(this.viewMap[xtype]);
        }

        var pre = center.getActiveTab();
        var post = this.tabMap[xtype];

        if (this.allowAnimations && pre) {
            var me = this;
            pre.getEl().fadeOut({callback: function() {
                center.setActiveTab(post);
                me.fadeInView(xtype);

                //
                // Prepare the first view to be shown again
                //
                Ext4.defer(function() { pre.getEl().fadeIn(); }, 200, pre);
            }});
        }
        else {
            center.setActiveTab(post);
            this.fadeInView(xtype);
        }
        this.showStatusView('filterstatus');
    },

    /*******************************************************************************************/
    /**---- THE FOLLOWING ARE SPECIFIC TO HOW EACH KNOWN VIEW TYPE IS TO SHOWN AND HIDDEN ----**/
    /*******************************************************************************************/

    hideExplorerView : function(xtype, cb) {
        this.fadeOutView(xtype, cb);
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
    },

    showStatusView : function(xtype, context) {

        if (!this.viewMap[xtype]) {
            this.viewMap[xtype] = this.createView(xtype, context);
            this.getEast().add(this.viewMap[xtype]);
        }
    },

    hideSummaryView : function(xtype, cb) {
        this.fadeOutView(xtype, cb);
    },

    initTutorial : function(box) {
        if (!tutorialAvailable) {
            return;
        }
        var img = Ext.DomQuery.select('img.hoverimg', box.getEl().id);
        if (img && img.length > 0) {
            img = img[0];
            var me = this;
            LABKEY.Query.selectRows({
                schemaName : 'lists',
                queryName  : 'resource',
                success : function(data) {
                    me.sources = data.rows;
                    Ext4.get(img).on('click', me.launchTutorial, me);
                },
                failure : function() { /* No-op */ console.warn('failed to find resource list.'); }
            });
        }
        else {
            console.warn('no tutorial image link available.');
        }
    },

    launchTutorial : function() {
        if (this.sources && this.sources.length > 0) {

            var children = [];
            for (var i=0; i < this.sources.length; i++) {
                if (this.sources[i].group == 'tutorial') {
                    children.push({
                        tag : 'source',
                        src : this.sources[i].source,
                        type: this.sources[i].type
                    });
                }
            }

            if (children.length > 0) {
                if (Ext4.getCmp('tutorial-win')) {
                    Ext4.getCmp('tutorial-win').show();
                    return;
                }
                var videoWindow = Ext4.create('Ext.window.Window', {
                    id    : 'tutorial-win',
                    modal : true,
                    width : 810,
                    height: 610,
                    frame : false,
                    border : false,
                    header : false,
                    resizable : false,
                    draggable: false,
                    shadow : false,
                    closable : false,
                    cls    : 'tutorial',
                    items : [{
                        xtype : 'box',
                        autoEl: {
                            tag : 'video',
                            width : 800,
                            height: 600,
                            controls : 'controls',
                            children : children
                        }
                    }],
                    closeBtn : null,
                    listeners : {
                        show : function(w) {
                            if (!videoWindow.closeBtn) {
                                var el = document.createElement('img');
                                el.setAttribute('src', LABKEY.contextPath + '/cds/images/closebtn.png');
                                el.setAttribute('class', 'tutorialclose');
                                el.setAttribute('alt', 'Close Icon');
                                el = Ext4.get(el);

                                var box = w.getBox();
                                var x = box.x + box.width - 16;
                                var y = box.y - 16;
                                el.setXY([x,y]);
                                el.appendTo(Ext4.getBody());

                                el.on('click', function(){ this.hide(); this.closeBtn.hide(); }, videoWindow);
                                videoWindow.closeBtn = el;
                            }
                            else {
                                videoWindow.closeBtn.show();
                            }
                        }
                    }
                });

                videoWindow.show();
            }
            else {
                console.warn('No matching group \'tutorial\' resources available.');
            }
        }
        else {
            console.warn('no tutorial sources available.');
        }
    }
});

Ext4.define('Connector.view.NotFound', {

    extend: 'Ext.Panel',

    alias: 'widget.notfound',

    ui: 'custom',

    style: 'padding: 20px; background-color: transparent;',

    html: '<h1 style="font-size: 200%;">404: View Not Found</h1><div style="font-size: 200%;">These aren\'t the subjects you\'re looking for. Move along.</div>'
});