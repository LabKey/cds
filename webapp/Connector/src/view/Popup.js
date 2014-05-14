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

    //renderTo: Ext.getBody(),

	//items: [],

    // Arrow definitions by popup position
    arrows : {
        top : '<div class="popup-arrow down shadow"></div>',
        bottom : '<div class="popup-arrow up shadow"></div>',
        left : '<div class="popup-arrow right shadow"></div>',
        right : '<div class="popup-arrow left shadow"></div>'
    },

    // added : function() {
    //     console.log("POP: after render, W/H", this.contentComponent.getHeight(), this.contentComponent.getWidth());
    //     this.relayout();
    // },

    relayout : function() {
        var w = this.initialWidth;
        var h = this.initialHeight;
        try {
            w = this.width || this.contentComponent.getWidth();
            h = this.height || this.contentComponent.getHeight();
        } catch (ex) {}

        console.log("Layout",w,h);
    },

    initComponent : function() {

        console.log("POP: init component");
        var contentWidth = this.initialWidth;
        var contentHeight = this.initialHeight;
        var affordanceSize = 15;
        var container = {
            itemId: 'container',
            xtype: 'container',
            style: {
                backgroundColor: '#fff',
                padding: "10px"
                //marginLeft: '20px'
            },
            cls: 'shadow'
        }

        var affordance = {
            xtype: 'box',
            style: {
                backgroundColor: 'transparent'
            }
        }

        this.renderTo = this.container || Ext.getBody();

        var haveX = Ext.isDefined(this.x);
        var haveY = Ext.isDefined(this.y);
        var anchorX = this.x || 0;
        var anchorY = this.y || 0;
        var pos = this.position;
        var box = { top: anchorY, left: anchorX, width: 0, height: 0 }
        //debugger;
        if ((!haveX || !haveY) && this.anchor) {
            // Calculate anchor position
            var body = Ext.getBody();
            box = this.anchor.getBox();
            if (!haveX) {
                anchorX = box.left + (box.width >> 1);
            }
            if (!haveY) {
                anchorY = box.top + (box.height >> 1);
            }
        }

        if (!pos) {
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
            pos = "right";
        }

        var x = 0;
        var y = 0;
        var spacing = 10;
        this.layout = {
            align: 'stretch'
        }

        affordance.html = this.arrows[pos];

        var first = affordance;

        switch (pos) {
        case "top":
            container.width = contentWidth;
            container.height = contentHeight + affordanceSize;
            x = anchorX - (contentWidth >> 1);
            y = box.top - spacing - container.height;
            this.layout.type = 'vbox';
            affordance.height = affordanceSize;
            first = container;
            break;
        case "bottom":
            container.width = contentWidth;
            container.height = contentHeight + affordanceSize;
            x = anchorX - (contentWidth >> 1);
            y = box.top + box.height + spacing;
            this.layout.type = 'vbox';
            affordance.height = affordanceSize;
            break;
        case "left":
            container.width = contentWidth + affordanceSize;
            container.height = contentHeight;
            x = box.left - spacing - container.width;
            y = anchorY - (container.height >> 1);
            this.layout.type = 'hbox';
            affordance.width = affordanceSize;
            first = container;
            break;
        case "right":
            container.width = contentWidth + affordanceSize;
            container.height = contentHeight;
            x = box.left + box.width + spacing;
            y = anchorY - (container.height >> 1);
            this.layout.type = 'hbox';
            affordance.width = affordanceSize;
            break;
        }

        first.style.zIndex = 1;

        this.items = [affordance, container];

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

        var container = this.getComponent('container');
        this.contentComponent = container.add(this.content);
        this.on('afterrender', this.relayout, this);
        this.relayout();
        //console.log("ContentComponent",this.contentComponent);
//        var center = this.getComponent('centerRegion');
    }

});
