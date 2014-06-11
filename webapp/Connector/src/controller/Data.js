/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Data', {

    extend : 'Connector.controller.AbstractViewController',

    views: ['Grid'],

    // Deprecated: will be removed
    updateQuery : function () {
        var view = this.getViewManager().getViewInstance('groupdatagrid');

        if (view) {
            var appFilters = this.getStateManager().getFilters();
            var gridFilters = [];
            Ext.iterate(this.idMap, function(id, urlParam) {
                for (var i=0; i < appFilters.length; i++) {
                    if (appFilters[i].id == id) {
                        var gf = appFilters[i].getValue('gridFilter');
                        if (Ext.isArray(gf)) {
                            Ext.each(gf, function(_gf) {
                                gridFilters.push(_gf);
                            });
                        }
                        else {
                            gridFilters.push(gf);
                        }
                    }
                }
            }, this);

            view.applyFilters(gridFilters);
            view.initializeGrid();
        }

        this.refreshRequired = false;
    },

    onFailure : function(response) {
        var resp = Ext.decode(response.responseText);
        Ext.Msg.show({
            title: response.status + ': ' + response.statusText,
            msg: resp.exception
        });
    },

    getColumnName : function(URLParameterName) {
        var param = URLParameterName.replace('query.', '');
        return param.split('~')[0];
    },

    runFilterAnimation : function(view, filterGroups, callback) {

        var box   = Ext.get(Ext.DomQuery.select('.filterpanel')[0]).getBox(); // filter panel on RHS
        var cbox  = view.filterWin.ppx;

        if (cbox) {
            // Create DOM Element replicate
            var dom = document.createElement('span');
            dom.innerHTML = 'Apply Filter';
            dom.setAttribute('class', 'barlabel selected');
            dom.setAttribute('style', 'width: ' + (200) + 'px; left: ' + cbox[0] + 'px; top: ' + cbox[1] + 'px;');

            // check if selection is visible
            var yoffset = 50;
            if (this.getStateManager().getSelections().length == 0)
                yoffset = 0;

            // Append to Body
            var xdom = Ext.get(dom);
            xdom.appendTo(Ext.getBody());

            var me = this;

            xdom.animate({
                to : {
                    x: box.x,
                    y: (box.y-yoffset),
                    opacity: 0.2
                },
                duration: 1000, // Issue: 15220
                listeners : {
                    afteranimate : function() {
                        Ext.removeNode(xdom.dom);
                        me.allowHover = true;
                    }
                }
            });
        }

        if (callback) {
            var task = new Ext.util.DelayedTask(callback, this, [filterGroups]);
            task.delay(500);
        }
    },

    afterFilterAnimation : function(filterGroups) {
        /** Migrated to Connector.model.Grid **/
    },

    onViewChange : function (controller, view)  {
        this.isActiveView = view == 'groupdatagrid';
        //Note: When this event fires, animation still seems to be in play and grid doesn't render properly
        //Deferring seems to fix it, but perhaps event should fire later.
        if (this.isActiveView && this.refreshRequired) {
            Ext.defer(this.updateQuery, 300, this);
        }
    },

    createView : function(xtype, context) {

        var v;

        if (xtype == 'groupdatagrid') {
            v = Ext.create('Connector.view.Grid', {
                model: Ext.create('Connector.model.Grid', {
                    olapProvider: this.getStateManager()
                })
            });

            this.getViewManager().on('afterchangeview', v.onViewChange, v);
        }

        return v;
    },

    updateView : function(xtype, context) { },

    getDefaultView : function() {
        return 'groupdatagrid';
    }
});
