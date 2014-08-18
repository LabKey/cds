/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Popup', {

    extend: 'Ext.panel.Panel',

    cls: 'popup',

    initialWidth: 200,
    initialHeight: 200,

    frame: false,
    border: false,
    bodyBorder: false,

    bodyStyle: {
        backgroundColor: 'transparent'
    },

    // Arrow definitions by popup position
    arrows : {
        top : '<div class="popup-arrow down shadow"></div>',
        bottom : '<div class="popup-arrow up shadow"></div>',
        left : '<div class="popup-arrow right shadow"></div>',
        right : '<div class="popup-arrow left shadow"></div>'
    },

    relayout : function() {
        var w = this.initialWidth;
        var h = this.initialHeight;
        try {
            w = this.width || this.contentComponent.getWidth();
            h = this.height || this.contentComponent.getHeight();
        } catch (ex) {}

        var containerComponent = this.containerComponent;
        var affordanceComponent = this.affordanceComponent;

        var affordanceSize = 15;

        var haveX = Ext.isDefined(this.popupX);
        var haveY = Ext.isDefined(this.popupY);
        var anchorX = this.popupX || 0;
        var anchorY = this.popupY || 0;
        var pos = this.position;
        var box = { top: anchorY, left: anchorX, width: 0, height: 0 }
        if ((!haveX || !haveY) && this.anchor) {
            // Calculate anchor position
            box = this.anchor.getBox();
            if (!haveX) {
                anchorX = box.left + (box.width >> 1);
            }
            if (!haveY) {
                anchorY = box.top + (box.height >> 1);
            }
        }

        if (!pos) {
            var body = Ext.getBody();
            var viewSize = body.getViewSize();
            var viewHalfWidth = viewSize.width >> 1;
            var viewHalfHeight = viewSize.height >> 1;

            var candidates = [{
                pos: "top",
                space: anchorY
            }, {
                pos: "bottom",
                space: viewSize.height - anchorY
            }, {
                pos: "left",
                space: anchorX
            }, {
                pos: "right",
                space: viewSize.width - anchorX
            }];
            Ext.Array.sort(candidates, function(a,b) {
                return b.space - a.space;
            });

            pos = candidates[0].pos;


            // TEMP: Switching positions requires an update to the layout type which doesn't appear to be supported in ext.js
            pos = this.pos;
        }

        var x = 0;
        var y = 0;
        var spacing = 10;
        var layout = {
            align: 'stretch'
        }

        affordanceComponent.update(this.arrows[pos]);

        var order = [affordanceComponent, containerComponent];
        var otherOrder = [containerComponent, affordanceComponent];

        switch (pos) {
        case "top":
            containerComponent.setSize(w, h + affordanceSize);
            x = anchorX - (w >> 1);
            y = box.top - spacing - h - affordanceSize;
            layout = new Ext.layout.VBoxLayout(layout);
            affordanceComponent.setSize(w, affordanceSize);
            affordanceComponent.setLocalXY([0, h])
            containerComponent.setLocalXY([0, 0])
            order = otherOrder;
            break;
        case "bottom":
            containerComponent.setSize(w, h + affordanceSize);
            x = anchorX - (w >> 1);
            y = box.top + box.height + spacing;
            layout = new Ext.layout.VBoxLayout(layout);
            affordanceComponent.setSize(w, affordanceSize);
            affordanceComponent.setLocalXY([0, 0])
            containerComponent.setLocalXY([0, affordanceSize])
            break;
        case "left":
            containerComponent.setSize(w + affordanceSize, h);
            x = box.left - spacing - container.width;
            y = anchorY - (h >> 1);
            layout = new Ext.layout.HBoxLayout(layout);
            affordance.width = affordanceSize;
            affordanceComponent.setSize(affordanceSize, h);
            affordanceComponent.setLocalXY([w, 0])
            containerComponent.setLocalXY([0, 0])
            order = otherOrder;
            break;
        case "right":
            containerComponent.setSize(w + affordanceSize, h);
            x = box.left + box.width + spacing;
            y = anchorY - (h >> 1);
            layout = new Ext.layout.HBoxLayout(layout);
            affordanceComponent.setSize(affordanceSize, h);
            affordanceComponent.setLocalXY([0, 0])
            containerComponent.setLocalXY([affordanceSize, 0])
            break;
        }

        var el = order[0].getEl();
        el && el.setStyle('z-index', 1);
        el = order[1].getEl();
        el && el.setStyle('z-index', 0);

        //this.items = [affordance, container];

        if (this.container) {
            var xy = this.container.getXY();
            x -= xy[0];
            y -= xy[1];
        }

        this.style = {
            position: 'absolute',
            backgroundColor: 'transparent',
            top: 100,
            left: 100,
            zIndex: 80
        }

        this.style.left = x + "px";
        this.style.top = y + "px";
        this.setPosition(x, y);
    },

    initComponent : function() {

        var contentWidth = this.initialWidth;
        var contentHeight = this.initialHeight;

        var affordanceSize = 15;
        var container = {
            itemId: 'container',
            xtype: 'container',
            //layout: 'auto',
            //autoHeight: true,
            //manageHeight: false,
            style: {
//                position: 'absolute',
                backgroundColor: '#fff',
                padding: "10px",
//                height: 'auto'
            },
            cls: 'shadow'
        }

        var affordance = {
            itemId: 'affordance',
            xtype: 'box',
            style: {
                position: 'absolute',
                backgroundColor: 'transparent'
            }
        }

        var me = this;

        var close = {
            itemId: 'close',
            xtype: 'box',
            html: 'x',
            listeners: {
                click: function() {
                    //me.fireEvent('closepopup', me);
                    me.destroy();
                },
                element: 'el',
                scope: this
            },
            //floating: true,
            style: {
                position: 'absolute',
                margin: '10px',
                paddingLeft: '4px',
                width: '18px',
                height: '18px',
                right: '0px',
                top: '0px',
                border: '1px solid #9B0D96',
                borderRadius: '9px',
                cursor: 'pointer',
                color: '#9B0D96',
                fontWeight: 'bold'
            }
        }

        this.renderTo = this.container || Ext.getBody();

        var haveX = Ext.isDefined(this.popupX);
        var haveY = Ext.isDefined(this.popupY);
        var anchorX = this.popupX || 0;
        var anchorY = this.popupY || 0;
        var pos = this.position;
        var box = { top: anchorY, left: anchorX, width: 0, height: 0 }
        //debugger;
        if ((!haveX || !haveY) && this.anchor) {
            // Calculate anchor position
            box = this.anchor.getBox();
            if (!haveX) {
                anchorX = box.left + (box.width >> 1);
            }
            if (!haveY) {
                anchorY = box.top + (box.height >> 1);
            }
        }

        if (!pos) {
            var body = Ext.getBody();
            var viewSize = body.getViewSize();
            var viewHalfWidth = viewSize.width >> 1;
            var viewHalfHeight = viewSize.height >> 1;

            var candidates = [{
                pos: "top",
                space: anchorY
            }, {
                pos: "bottom",
                space: viewSize.height - anchorY
            }, {
                pos: "left",
                space: anchorX
            }, {
                pos: "right",
                space: viewSize.width - anchorX
            }];
            Ext.Array.sort(candidates, function(a,b) {
                return b.space - a.space;
            });

            pos = candidates[0].pos;

            // DEBUG
            //pos = "right";
        }

        this.pos = pos;

        var x = 0;
        var y = 0;
        var spacing = 10;
        this.layout = {
            type: 'hbox',
            align: 'stretch'
        }

        affordance.html = this.arrows[pos];

        var first = affordance;
POP=this;
        if (this.width) {
            container.width = this.width;
        }
        if (this.height) {
            container.height = this.height;
        }
        switch (pos) {
        case "top":
            // container.width = contentWidth;
            // container.height = contentHeight + affordanceSize;
            x = anchorX - (contentWidth >> 1);
            y = box.top - spacing - container.height;
            this.layout.type = 'vbox';
            affordance.height = affordanceSize;
            first = container;
            break;
        case "bottom":
            // container.width = contentWidth;
            // container.height = contentHeight + affordanceSize;
            x = anchorX - (contentWidth >> 1);
            y = box.top + box.height + spacing;
            this.layout.type = 'vbox';
            affordance.height = affordanceSize;
            break;
        case "left":
            // container.width = contentWidth + affordanceSize;
            // container.height = contentHeight;
            x = box.left - spacing - container.width;
            y = anchorY - (container.height >> 1);
            this.layout.type = 'hbox';
            affordance.width = affordanceSize;
            first = container;
            break;
        case "right":
            // container.width = contentWidth + affordanceSize;
            // container.height = contentHeight;
            x = box.left + box.width + spacing;
            y = anchorY - (container.height >> 1);
            this.layout.type = 'hbox';
            affordance.width = affordanceSize;
            break;
        }

//        first.style.zIndex = 1;

        this.items = [close, affordance, container];

        if (this.container) {
            var xy = this.container.getXY();
            x -= xy[0];
            y -= xy[1];
        }

        this.style = {
            position: 'absolute',
            backgroundColor: 'transparent',
            top: 100,
            left: 100,
            zIndex: 80
        }

        this.style.left = x + "px";
        this.style.top = y + "px";

        //this.content;

        this.callParent();

        this.containerComponent = this.getComponent('container');
        this.affordanceComponent = this.getComponent('affordance');
        this.closeComponent = this.getComponent('close');
        this.contentComponent = this.containerComponent.add(this.content);
        this.containerComponent.add(this.closeComponent);
        this.mon(this, 'afterrender', this.relayout, this);
        var self = this;
        Ext.EventManager.onWindowResize(this.relayout,this);
        this.mon(this, 'destroy', function() {
            Ext.EventManager.removeResizeListener(this.relayout, this);
        });
        //this.relayout();
    }

});
