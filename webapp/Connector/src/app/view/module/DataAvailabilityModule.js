/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.DataAvailabilityModule', {
    xtype: 'app.module.dataavailability',

    extend: 'Ext.container.Container',

    cls: 'module learn-data-available-module',

    statics: {
        dataAddedSortFn: function(a, b) {
            var val1 = a.data_label ? a.data_label : a.data_id;
            var val2 = b.data_label ? b.data_label : b.data_id;
            return val1.localeCompare(val2);
        }
    },

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
                            '<td> Available </td>',
                            '<td>',
                                '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/grayCheck.png"/>',
                            '</td>',
                            '<td> Restricted Access </td>',
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
                            '<tpl if="has_access">',
                                '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/smallCheck.png"/>',
                            '<tpl else>',
                                '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/grayCheck.png"/>',
                            '</tpl>',
                        '<tpl else>',
                            '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/smallGreyX.png">',
                        '</tpl>')
            }, {
                xtype: 'templatecolumn',
                header: 'All',
                width: 250,
                sortable: false,
                menuDisabled: true,
                tpl: this.getDataAddedTemplate()
            }],
            store: this.getDataAddedStore(this.data),

            listeners : {
                'itemmouseenter' : function(view, record, item, index, evt) {
                    var dataLink = Ext.get(Ext.query("a", item)[0]) || Ext.get(Ext.query("span", item)[0]),
                            id = Ext.id();
                    if (record.data.data_status && dataLink) {
                        dataLink.on('mouseenter', this.showDataStatusTooltip, this, {
                            status: record.data.data_status,
                            id: id
                        });
                        dataLink.on('mouseleave', this.hideDataStatusTooltip, this, {
                            id: id
                        });
                        dataLink.on('click', this.hideDataStatusTooltip, this, {
                            id: id
                        });

                        //If moving the cursor reasonably quickly, then it's possible to cause the "mouseenter" event to
                        //fire before "itemmouseenter" fires.
                        var textRect = dataLink.dom.getBoundingClientRect();
                        var cursorX = evt.browserEvent.clientX;
                        var cursorY = evt.browserEvent.clientY;
                        if (textRect.top <= cursorY && cursorY <= textRect.bottom
                            && textRect.left <= cursorX && cursorX <= textRect.right) {
                            this.showDataStatusTooltip(evt, dataLink.dom, {
                                status: record.data.data_status,
                                id: id
                            });
                        }
                    }
                },

                'itemmouseleave' : function(view, record, item) {
                    var dataLink = Ext.get(Ext.query("a", item)[0])|| Ext.get(Ext.query("span", item)[0]);
                    if (dataLink) {
                        dataLink.un('mouseenter', this.showDataStatusTooltip, this);
                        dataLink.un('mouseleave', this.hideDataStatusTooltip, this);
                        dataLink.un('click', this.hideDataStatusTooltip, this);
                        this.fireEvent('hideTooltip');
                    }
                },

                scope: this
            },
            scope: this
        }];

        this.callParent();
    },

    getDataAddedTemplate : function() {
        var me = this;
        return new Ext4.XTemplate(
                '<tpl if="data_label">', //determines if we have a learn about page to back the assay
                '<a href="#learn/learn/',
                '{[this.getDataLink()]}',
                '/{[encodeURIComponent(values.data_link_id)]}">{data_label:htmlEncode}</a>',
                '<tpl else>',
                '<span>{data_id:htmlEncode}</span>',
                '</tpl>',
                {
                    getDataLink: function()
                    {
                        return encodeURIComponent(me.data.dataLink);
                    }
                })
    },

    getDataAddedStore : function(data) {
        return Ext.create('Ext.data.Store', {
            model: "DataAdded",
            data: data.model.getData()[this.data.dataField]
        });
    },

    showDataStatusTooltip : function(event, item, options) {
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

    hideDataStatusTooltip : function() {
        this.fireEvent('hideTooltip');
    }
});

Ext.define("DataAdded", {
    extend: "Ext.data.Model",
    fields: [
        {name: 'data_link_id'},
        {name: 'data_label'},
        {name: 'has_data'},
        {name: 'has_access'},
        {name: 'data_id'},
        {name: 'data_status', convert: function(value) {
            return value ? value : "Status not available";
        }}
    ]
});
