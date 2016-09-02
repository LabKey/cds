/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyAssays', {
    xtype: 'app.module.studyassays',

    extend: 'Ext.container.Container',

    cls: 'module learn-data-available-module',

    initComponent : function() {
        this.layout = {
            type: 'vbox',
            align: 'stretch'
        };

        Ext.define("AssayAdded", {
            extend: "Ext.data.Model",
            fields: [
                {name: 'assay_identifier'},
                {name: 'assay_short_name'},
                {name: 'has_data'},
                {name: 'study_assay_id'},
                {name: 'assay_status'}
            ]
        });

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

            selModel: Ext.create("Ext.selection.RowModel",{
                toggleOnClick: false
            }),

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
                tpl: new Ext4.XTemplate(
                        '<tpl if="assay_short_name">', //determines if we have a learn about page to back the assay
                            '<a href="#learn/learn/Assay/{[encodeURIComponent(values.assay_identifier)]}">{assay_short_name:htmlEncode}</a>',
                        '<tpl else>',
                            '{study_assay_id:htmlEncode}',
                        '</tpl>')
            }],
            store: {
                model: "AssayAdded",
                data: this.data.model.getData()['assays']
            },

            listeners : {
                'itemmouseenter' : function(view, record, item) {
                    var assayLink = Ext.get(Ext.query("a", item)[0]),
                            id = Ext.id();
                    if (record.data.assay_status && assayLink) {
                        assayLink.on('mouseenter', this.showAssayStatusTooltip, this, {
                            name: record.data.assay_identifier, //for debuggin
                            status: record.data.assay_status,
                            id: id
                        });
                        assayLink.on('mouseleave', this.hideAssayStatusTooltip, this, {
                            name: record.data.assay_identifier, //for debuggin
                            id: id
                        });
                        assayLink.on('click', this.hideAssayStatusTooltip, this, {
                            name: record.data.assay_identifier, //for debuggin
                            id: id
                        })
                    }
                },

                'itemmouseleave' : function(view, record, item) {
                    var assayLink = Ext.get(Ext.query("a", item)[0]);
                    if (assayLink) {
                        assayLink.un('mouseenter', this.showAssayStatusTooltip, this);
                        assayLink.un('mouseleave', this.hideAssayStatusTooltip, this);
                        assayLink.un('click', this.hideAssayStatusTooltip, this);
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

        this.on('hide' + _id, function() {
            clearTimeout(displayTooltip);
            calloutMgr.removeCallout(_id);
        }, this);
    },

    hideAssayStatusTooltip : function(event, item, options) {
        this.fireEvent('hide' + options.id);
    }
});
