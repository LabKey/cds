/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.DataAvailabilityModule', {
    xtype: 'app.module.dataavailability',

    extend: 'Ext.container.Container',

    cls: 'module learn-data-available-module',

    initComponent : function() {
        this.layout = {
            type: 'vbox',
            align: 'stretch'
        };

        this.items = [{
            html: (new Ext.XTemplate('<tpl>',
                    '<p>',
                        Connector.constant.Templates.module.title,
                    '</p>',
                    '<table class="data-availability-header">',
                        '<tr>',
                            '<td>',
                                '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/smallCheck.png"/>',
                            '</td>',
                            '<td> Data added to Dataspace </td>',
                            '<td>',
                                '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/smallGreyX.png"/>',
                            '</td>',
                        '<td> Data not added </td>',
                        '</tr>',
                    '</table>',
                    '</tpl>'
            )).apply(this.data)
        },{
            xtype: 'grid',
            cls: 'learnmodulegrid',
            viewConfig: {
                stripeRows: false,
                trackOver: false
            },
            enableColumnHide: false,
            enableColumnResize: false,
            hideHeaders: true,
            rowLines: false,

            columns: [{
                xtype: 'templatecolumn',
                header: 'All',
                width: 30,
                sortable: false,
                menuDisabled: true,
                tpl: new Ext4.XTemplate(
                        '<tpl if="has_data">',
                            '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/smallCheck.png"/>',
                        '<tpl else>',
                            '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/smallGreyX.png">',
                        '</tpl>')
            }, {
                xtype: 'templatecolumn',
                header: 'All',
                width: 100,
                sortable: false,
                menuDisabled: true,
                tpl: this.getDataAddedTemplate()
            }],
            store: this.getDataAddedStore(this.data),

            listeners : {
                'itemmouseenter' : function(view, record, item, index, evt) {
                    var assayLink = Ext.get(Ext.query("a", item)[0]) || Ext.get(Ext.query("span", item)[0]),
                            id = Ext.id();
                    if (record.data.assay_status && assayLink) {
                        assayLink.on('mouseenter', this.showAssayStatusTooltip, this, {
                            status: record.data.assay_status,
                            id: id
                        });
                        assayLink.on('mouseleave', this.hideAssayStatusTooltip, this, {
                            id: id
                        });
                        assayLink.on('click', this.hideAssayStatusTooltip, this, {
                            id: id
                        });

                        //If moving the cursor reasonably quickly, then it's possible to cause the "mouseenter" event to
                        //fire before "itemmouseenter" fires.
                        var textRect = assayLink.dom.getBoundingClientRect();
                        var cursorX = evt.browserEvent.clientX;
                        var cursorY = evt.browserEvent.clientY;
                        if (textRect.top <= cursorY && cursorY <= textRect.bottom
                            && textRect.left <= cursorX && cursorX <= textRect.right) {
                            this.showAssayStatusTooltip(evt, assayLink.dom, {
                                status: record.data.assay_status,
                                id: id
                            });
                        }
                    }
                },

                'itemmouseleave' : function(view, record, item) {
                    var assayLink = Ext.get(Ext.query("a", item)[0])|| Ext.get(Ext.query("span", item)[0]);
                    if (assayLink) {
                        assayLink.un('mouseenter', this.showAssayStatusTooltip, this);
                        assayLink.un('mouseleave', this.hideAssayStatusTooltip, this);
                        assayLink.un('click', this.hideAssayStatusTooltip, this);
                        this.fireEvent('hideTooltip');
                    }
                },

                scope: this
            },
            scope: this
        }];

        this.callParent();
    },

    showAssayStatusTooltip : function(event, item, options) {
        var calloutMgr = hopscotch.getCalloutManager(),
                _id = options.id,
                displayTooltip = setTimeout(function() {
                    calloutMgr.createCallout(Ext.apply({
                        id: _id,
                        xOffset: 10,
                        yOffset: -20,
                        showCloseButton: false,
                        target: item,
                        placement: 'right',
                        content: options.status,
                        width: 190
                    }, {}));
                }, 200);

        this.on('hideTooltip', function() {
            clearTimeout(displayTooltip);
            calloutMgr.removeCallout(_id);
        }, this);
    },

    hideAssayStatusTooltip : function() {
        this.fireEvent('hideTooltip');
    }
});
