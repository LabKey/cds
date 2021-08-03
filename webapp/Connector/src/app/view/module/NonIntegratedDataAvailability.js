/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.NonIntegratedDataAvailability', {

    extend: 'Ext.container.Container',

    cls: 'module learn-data-available-module',

    plugins : ['documentvalidation'],

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent : function() {

        var data = this.getData();

        if (data.length > 0) {
            var docIsValidAction = function(doc, status) {
                doc.isLinkValid = doc.isLinkValid ? doc.isLinkValid : status;
                var gridObj = this.items.items[1];
                var gridView = gridObj.getView();
                gridView.update(data);
                gridObj.getStore().loadData(data, false);
            };
            this.on("afterrender", function() {
                this.validateDocLinks(data, docIsValidAction);
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
                tpl:  this.getColTemplate()
            }],
            listeners : {
                'itemmouseenter' : function(view, record, item, index, evt) {
                    var dataLink = Ext.get(Ext.get(Ext.query("span", item)[0] || Ext.query("a", item)[0])),
                            id = Ext.id();

                    var toolTipMsg_available = "Non-integrated data added to Dataspace";
                    var toolTipMsg_restricted = "Non-integrated data access is restricted";
                    var toolTipMsg_notAdded = "Non-integrated data has not been added at this time";

                    if (record.data.dataStatus && dataLink) {
                        dataLink.on('mouseenter', this.showDataStatusTooltip, this, {
                            status: !!record.data.isLinkValid ? (record.data.hasPermission ? toolTipMsg_available : toolTipMsg_restricted) : toolTipMsg_notAdded,
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
                                status: !!record.data.isLinkValid ? (record.data.hasPermission ? toolTipMsg_available : toolTipMsg_restricted) : toolTipMsg_notAdded,
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

    getData : function() {
        console.warn('need to override getData')
    },

    getTitleData: function(data) {
        console.warn('need to override getTitleData');
    },

    getStore : function(data) {
        console.warn('need to override getStore')
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
        console.warn('need to override getColTemplate');
    }
});

Ext.define('Connector.view.module.StudyNonIntegratedData', {

    xtype: 'app.module.studynonintegrateddata',

    extend: 'Connector.view.module.NonIntegratedDataAvailability',

    cls: 'module learn-data-available-module',

    initComponent : function() {
        this.callParent();
    },

    getData : function() {
        return this.initialConfig.data.model.data.non_integrated_assay_data;
    },

    getTitleData: function(data) {
        if (data.non_integrated_assay_data.length > 0) {
            data.hasDetails = true;
        }
        else {
            data.hasDetails = false;
        }
        return data;
    },

    getColTemplate : function() {
        return new Ext4.XTemplate(
            '<tpl>',
                '<table>',
                    '<tr>',
                        '<td>',
                            '<tpl if="isLinkValid">',
                                '<tpl if="hasPermission">',
                                    '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/ni-added.svg"/>',
                                '<tpl else>',
                                    '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/ni-restricted.svg"/>',
                                '</tpl>',
                            '<tpl else>',
                                '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/ni-notAdded.svg">',
                            '</tpl>',
                        '</td>',
                        '<td class="non-integrated-data">',
                            '<tpl if="isLinkValid">',
                                '<tpl if="hasPermission">',
                                    '<tpl if="hasAssayLearn">',
                                        '<a href="#learn/learn/Assay',
                                        '/{assayIdentifier}">',
                                        '{label:htmlEncode}',
                                        '</a>',
                                    '<tpl else>',
                                        '<span>{label:htmlEncode}</span>',
                                    '</tpl>',
                                    '&nbsp;{suffix}&nbsp;',
                                    '<a href="{filePath}" target="_blank"><img alt="{assayIdentifier}" src="' + LABKEY.contextPath + '/Connector/images/download-icon.svg' + '" height="13" width="13" align="right"/></a>',
                                '<tpl else>',
                                    '<tpl if="hasAssayLearn">',
                                        '<a href="#learn/learn/Assay',
                                        '/{assayIdentifier}">',
                                        '{label:htmlEncode}',
                                        '</a>',
                                    '<tpl else>',
                                        '<span>{label:htmlEncode}</span>',
                                    '</tpl>',
                                '</tpl>',
                            '<tpl else>',
                                '<tpl if="hasAssayLearn">',
                                    '<a href="#learn/learn/Assay',
                                    '/{assayIdentifier}">',
                                    '{label:htmlEncode}',
                                    '</a>',
                                '<tpl else>',
                                    '<span>{label:htmlEncode}</span>',
                                '</tpl>',
                            '</tpl>',
                        '</td>',
                    '</tr>',
                '</table>',
            '</tpl>')
    },

    getStore : function(data) {

        Ext.each(data, function(assay, index){
            assay.assayIdentifierId = assay.assayIdentifier.replace(/\W/g, '').toLowerCase() + "-" + index;//replace non-alphanumeric characters with an empty string
        });

        var storeConfig =  {
            fields: ['assayIdentifier', 'dataStatus', 'hasData', 'fileName', 'filePath', 'hasAssayLearn', 'hasPermission', 'isLinkValid', 'label', 'suffix', 'assayIdentifierId'],
            data: data,
            storeId: 'NonIntegratedDataStore'
        };

        return Ext.create('Ext.data.Store', storeConfig);
    }
});

Ext.define('Connector.view.module.PublicationNonIntegratedData', {

    xtype: 'app.module.publicationnonintegrateddata',

    extend: 'Connector.view.module.NonIntegratedDataAvailability',

    cls: 'module learn-data-available-module',

    initComponent : function() {

        this.callParent();
    },

    getData : function() {
        return this.data.model.data.publication_data;
    },

    getTitleData: function(data) {
        if (data.publication_data.length > 0) {
            data.hasDetails = true;
        }
        else {
            data.hasDetails = false;
        }
        return data;
    },

    getStore : function(data) {
        var config =  {
            fields: ['publication_id', 'document_id', 'label', 'fileName', 'filePath', 'docType', 'isLinkValid', 'suffix'],
            data: data,
            storeId: 'PublicationNonIntegratedDataStore'
        };

        return Ext.create('Ext.data.Store', config);
    },

    getColTemplate : function() {
        return new Ext4.XTemplate(
            '<tpl>',
                '<table>',
                    '<tr>',
                        '<td class="non-integrated-data">',
                            '<tpl if="isLinkValid">',
                                '<span>{label:htmlEncode}</span>',
                                '&nbsp;{suffix}&nbsp;',
                                '<a href="{filePath}" target="_blank"><img alt="{label}" src="' + LABKEY.contextPath + '/Connector/images/download-icon.svg' + '" height="13" width="13" align="right"/></a>',
                            '</tpl>',
                        '</td>',
                    '</tr>',
                '</table>',
            '</tpl>');
    }
});