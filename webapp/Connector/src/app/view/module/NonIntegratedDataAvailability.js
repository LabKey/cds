/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.NonIntegratedDataAvailability', {

    xtype : 'app.module.nonintegrateddataavailability',

    extend: 'Ext.container.Container',

    cls: 'module learn-data-available-module',

    plugins : ['documentvalidation'],

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent : function() {

        var data = this.initialConfig.data.model.data;

        if (data.non_integrated_assay_data.length > 0) {
            var docIsValidAction = function(doc, status) {
                doc.isLinkValid = status;
                var gridObj = this.items.items[1];
                var gridView = gridObj.getView();
                gridView.update(data.non_integrated_assay_data);
                gridObj.getStore().loadData(data.non_integrated_assay_data, false);
            };
            this.on("afterrender", function() {
                this.validateDocLinks(data.non_integrated_assay_data, docIsValidAction);
            }, this);
        }

        this.items = [{
            html: (new Ext.XTemplate('<tpl if="hasDetails">',
                    '<h3>',
                        this.initialConfig.data.title,
                    '</h3>',
                    '<p>',
                        this.initialConfig.data.instructions,
                    '</p>',
                    '</br>',
                    '</tpl>'
            )).apply(this.getTitleData(this.initialConfig.data.model.data))

        },Ext.apply({
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
            store: this.getStore(data),
            columns: [{
                xtype: 'templatecolumn',
                header: 'All',
                width: '90%',
                sortable: false,
                menuDisabled: true,
                tpl:  this.getColTemplate(),
            }],
            listeners : {
                'itemmouseenter' : function(view, record, item, index, evt) {
                    var dataLink = Ext.get(Ext.query("a", item)[0]) || Ext.get(Ext.query("span", item)[0]),
                            id = Ext.id();
                    if (record.data.dataStatus && dataLink) {
                        dataLink.on('mouseenter', this.showDataStatusTooltip, this, {
                            status: record.data.dataStatus,
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
                                status: record.data.dataStatus,
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
        }, {})
        ];

        this.callParent();
    },

    hasContent : function() {
        var reports = this.initialConfig.data.model.data.non_integrated_assay_data;
        if (reports) {
            return reports.length > 0;
        }
        return false;
    },
    getTitleData: function(data) {
        if (data.non_integrated_assay_data.length > 0 && data.non_integrated_assay_data_has_permission) {
            data.hasDetails = true;
        }
        else {
            data.hasDetails = false;
        }
        return data;
    },

    getStore : function(niAssayData) {

        Ext.each(niAssayData.non_integrated_assay_data, function(assay, index){
            assay.assayIdentfierId = assay.assayIdentifier.replace(/\W/g, '').toLowerCase() + "-" + index;//replace non-alphanumeric characters with an empty string
        });

        var storeConfig =  {
            fields: ['assayIdentifier', 'dataStatus', 'fileName', 'filePath', 'hasAssayLearn', 'hasPermission', 'isLinkValid', 'label', 'suffix', 'assayIdentfierId'],
            data: niAssayData.non_integrated_assay_data,
            storeId: 'NonIntegratedDataStore'
        };

        return Ext.create('Ext.data.Store', storeConfig);
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
                        width: 220
                    }, {}));
                }, 200);

        this.on('hideTooltip', function() {
            clearTimeout(displayTooltip);
            calloutMgr.removeCallout(_id);
        }, this);
    },

    hideDataStatusTooltip : function() {
        this.fireEvent('hideTooltip');
    },
    getColTemplate : function() {
        var me = this;
        return new Ext4.XTemplate(
           '<tpl>',
                // '<table><tr><td>',

                // case when there is both a link to the assay learn page and data to download
                '<tpl if="isLinkValid && hasAssayLearn">',
                '<ul class="non-integrated-data-ul">',
                    '<li class="non-integrated-data-li">',
                        '<a href="#learn/learn/Assay',
                        '/{assayIdentifier}">',
                        '{label:htmlEncode}',
                        '</a>',
                        '&nbsp;{suffix}&nbsp;',
                        '<a href="{filePath}" target="_blank"><img alt="{assayIdentifier}" src="' + LABKEY.contextPath + '/Connector/images/download-icon.svg' + '" height="13" width="13" align="left"/></a>',
                    '</li>',
                '</ul>',


                // case when there is data to download and no assay learn page
                '<tpl elseif="isLinkValid && !hasAssayLearn">',
                '<ul class="non-integrated-data-ul">',
                    '<li class="non-integrated-data-li">',
                        '{label:htmlEncode}',
                        '&nbsp;{suffix}&nbsp;',
                        '<a href="{filePath}" target="_blank"><img alt="{assayIdentifier}" src="' + LABKEY.contextPath + '/Connector/images/download-icon.svg' + '" height="13" width="13" align="left"/></a></p>',
                    '</li>',
                '</ul>',

                // case when there is assay learn page and no data to download
                '<tpl elseif="hasPermission && hasAssayLearn">',
                    '<ul class="non-integrated-data-ul">',
                        '<li class="non-integrated-data-li">',
                            '<a href="#learn/learn/Assay',
                            '/{assayIdentifier}">',
                            '{label:htmlEncode}',
                        '</li>',
                    '</ul>',

                // case when there is no assay learn page and no data to download
                '<tpl elseif="hasPermission">',
                '<ul class="non-integrated-data-ul">',
                    '<li class="non-integrated-data-li">',
                        '{label:htmlEncode}',
                    '</li>',
                '</tpl>',
           '</tpl>')
    },
});