/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

// PARAMS
// var data = {
//     label : "Blah",
//     buttons : {
//         back: true,
//         group: [{
//             groupLabel: "Select",
//             buttonLabel: 'text',
//             handler: function() {
//                 // ...
//             }
//         }]
//     },
//     tabs : ["Overview", "Variables, Antigens, Analytes"],
//     lockPixels : 100
// }

// This is a shared header class for an individual item detail. This will be the header for a single
// Study, a single Assay or a single Lab etc.
Ext.define('Connector.view.PageHeader', {

    extend: 'Ext.container.Container',

    height: 160,

    requires: ['Connector.button.Image'],

//    alias: 'widget.learnitemheaderview',

    layout: {
        type : 'vbox',
        align: 'stretch'
    },

    cls: 'pageheader learnheader header-container',

    defaults: {
        ui: 'custom'
    },

    //selectorId: 'dimselect',
    selectTab : function(tabIndex) {
        Ext.each(this.tabButtons, function(button, i) {
            if (i == tabIndex) {
                button.addCls('selected');
            } else {
                button.removeCls('selected');
            }
        });
        this.doLayout();
    },

    onTabClick : function(callback) {
        this.tabClickCallback = callback;
    },

    initComponent : function() {

        var data = this.data;
        this.lockPixels = data.lockPixels;
        var buttonConfig = data.buttons;

        if (buttonConfig) {
            var buttons = [];

            if (buttonConfig.back) {
                buttons.push({
                    xtype: 'button',
                    html: '<svg width="12" height="10" fill="#9b0d96">'+
                        '<path d="M0 6 L5 10 L5 2 Z" />'+
                    '</svg>back',
                    cls: '',
                    itemId: 'back',
                    style: 'margin: 4px 2px 0 23px;'
                });
            }
            
            if (buttonConfig.up) {
                buttons.push({
                    xtype: 'button',
                    html: '<svg width="12" height="10" fill="#9b0d96">'+
                        '<path d="M0 6 L5 10 L5 2 Z" />'+
                    '</svg>'+buttonConfig.up,
                    cls: '',
                    itemId: 'up',
                    style: 'margin: 4px 2px 0 23px;'
                });
            }
            
            if (buttonConfig.group && buttonConfig.group.length) {
                if (buttonConfig.back || buttonConfig.up) {
                    buttons.push({
                        xtype: 'tbspacer',
                        width: 50
                    })
                }
//                console.log("BUTTON CONFIG",buttonConfig);
                var doBind = data.scope && !buttonConfig.handlersBound;
                buttonConfig.handlersBound = true;
                var haveVisibleButtons = false;
                Ext.each(buttonConfig.group, function(button) {
                    if (!button.hidden) {
                        haveVisibleButtons = true;
                    }
                });

                Ext.each(buttonConfig.group, function(button) {
                    if (button.groupLabel && haveVisibleButtons) {
                        buttons.push({
                            xtype: 'label',
                            text: button.groupLabel
                        })
                    }
                    if (doBind && button.handler) {
                        button.handler = Ext.bind(button.handler, data.scope, data.handlerParams, true);
                    }
                    buttons.push({
                        xtype: 'button',
                        text: button.buttonLabel,
                        itemId: button.itemId,
                        handler: button.handler,
                        hidden: button.hidden || false,
                        // TODO: Move to button class?
                        style: 'margin: 4px 2px 0 23px;',
                        scope: data.scope
                    })
                });
            }
        }

        this.items = [];

        if (!Ext.isEmpty(data.label)) {
            this.items.push({
                xtype: 'actiontitle',
                html: data.label
            });
        }

        if (!Ext.isEmpty(data.title)) {
            this.items.push({
                xtype: 'box',
                autoEl: {
                    tag: 'h1',
                    html: data.title
                }
            });
        }

        this.items.push({
            xtype: 'box',
            flex: 1
        });

        if (buttons) {
            this.items.push({
                xtype: 'toolbar',
                height: 38,
                ui: 'footer',
                items: buttons
            })
        }

        if (data.tabs && data.tabs.length) {
            var tabItems = [{ xtype: 'box', flex: 1 }];
            var self = this;
            Ext.each(data.tabs, function(tab, i) {
                tabItems.push({
                    xtype: 'box',
                    cls: 'tabbutton',
                    html: tab + '<svg class="arrow" width="16" height="8" fill="#ffffff"><path stroke="#ccc" d="M0 8 L8 0 L16 8"></path></svg>',
                    listeners: {
                        click: function() {
                            self.tabClickCallback && self.tabClickCallback(i);
                        },
                        element: 'el'
                    }
                })
            });
            tabItems.push({ xtype: 'box', flex: 1 });

            this.items.push({
                xtype: 'container',
                layout: {
                    type : 'hbox',
                    align: 'stretch'
                },
                height: 32,
                items: tabItems
            });
        } else {
            this.items.push({
                xtype: 'box',
                height: 32
            });          
        }

        this.callParent();

        this.tabButtons = this.query("[cls~=tabbutton]");
    }
});
