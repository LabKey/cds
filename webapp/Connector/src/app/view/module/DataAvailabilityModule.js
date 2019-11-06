/*
 * Copyright (c) 2016-2019 LabKey Corporation
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

    showAll: false,

    initComponent : function() {
        this.layout = {
            type: 'vbox',
            align: 'stretch'
        };

        if (this.data.hasGrouping) {
            this.data['groupSubHeaderInstr'] = this.getGroupSubHeaderInstr(this.data);
        }
        this.data['showAll'] = this.showAll;
        this.update(this.data);

        this.toggleListTask = new Ext.util.DelayedTask(this.toggleList, this);

        this.items = [{
            html: (new Ext.XTemplate('<tpl if="hasDetails">',
                    '<p>',
                        Connector.constant.Templates.module.title,
                    '</p>',
                    '<p>',
                        this.data.instructions,
                    '</p>',
                    '</br>',
                    '<table class="data-availability-header' + (this.data.hasGrouping ? ' data-availability-header-with-group' : '') + '">',
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
            )).apply(this.getTitleData(this.data))
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

            columns: [{
                    xtype: 'templatecolumn',
                    header: 'All',
                    width: '90%',
                    sortable: false,
                    menuDisabled: true,
                    tpl: this.getDataAddedTemplate(),
                    tplShowAll: this.getShowAllTemplate(),
                    showAll: false,
                    defaultRenderer: function(value, meta, record) {
                        var data = Ext.apply({}, record.data, record.getAssociatedData());
                        var tplInUse = this.tpl;
                        if (this.showAll) {
                            tplInUse = this.tplShowAll;
                        }
                        return tplInUse.apply(data);
                    },
                    setShowAll(isShowAll) {
                        this.showAll = isShowAll;
                    }
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

                    var showAllLink = Ext.get('integrated-data-showAll');
                    if (showAllLink) {
                        showAllLink.on('click', function(){
                            this.toggleListTask.delay(100);
                        }, this);
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

                    var showAllLink = Ext.get('integrated-data-showAll');
                    if (showAllLink) {
                        showAllLink.un('click', function(){
                            this.toggleListTask.delay(100);
                        }, this);
                    }
                },

                scope: this
            },
            scope: this
        }, this.getGroupingFeature())];

        this.callParent();
    },

    toggleList: function() {
        var data = this.data;
        this.showAll = !this.showAll;
        data['showAll'] = this.showAll;
        this.update(data);

        var dataView = this.items.items[1].getView();
        dataView.panel.columns[0].setShowAll(this.showAll);
        if (this.showAll) {
            var dataRecords = this.getDataAddedStore(data).data.items;
            Ext.each(dataRecords, function(record) {
                if (record.data.data_index >= 10) {
                    dataView.panel.columns[0].defaultRenderer(null, null, record);
                    dataView.panel.view.refresh();
                }
            });
        }
        else if (!this.showAll) {
            dataView.panel.view.refresh();
        }
    },

    getGroupingFeature: function() {
        if (this.data.hasGrouping) {
            var me = this;
            return {
                requires: ['Ext.grid.feature.Grouping'],
                features: [
                    {
                        ftype: 'grouping',
                        collapsible: false,
                        groupHeaderTpl: new Ext.XTemplate('{name:htmlEncode}',
                                '<tpl if="this.getInstructions(values.name)">',
                                    '<table>',
                                        '<tr>',
                                        '<td style="white-space:normal">',
                                        '{[this.getInstructions(values.name)]}',
                                        '</td>',
                                        '</tr>',
                                    '</table>',
                                '</tpl>',
                                {
                                    getInstructions: function(key)
                                    {
                                        return me.data.groupSubHeaderInstr[key];
                                    }
                                })
                    }
                ]
            }
        }
        return {};
    },

    getShowAllTemplate : function() {
        var me = this;
        return new Ext4.XTemplate(
            '<tpl>',
                '<tpl if="data_index === 10">',
                    'and {[this.getRemainingListSize()]} more ',
                    '<span id="integrated-data-showAll" class="show-hide-toggle-integrateddata">(show less)</span>',
                    '</br></br>',
                '</tpl>',
                '<table>',
                    '<tr>',
                        '<td>',
                            '<tpl if="has_data">',
                                '<tpl if="has_access">',
                                    '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/smallCheck.png"/>',
                                '<tpl else>',
                                    '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/grayCheck.png"/>',
                                '</tpl>',
                            '<tpl else>',
                                '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/smallGreyX.png">',
                            '</tpl>',
                        '</td>',
                        '<td>',
                            '<tpl if="data_label">', //determines if we have a learn about page to back the assay
                                '<a href="#learn/learn/',
                                '{[this.getDataLink()]}',
                                '/{[encodeURIComponent(values.data_link_id)]}">{data_label:htmlEncode}</a>',
                            '<tpl else>',
                                '<span>{data_id:htmlEncode}</span>',
                            '</tpl>',
                        '</td>',
                        '<td class="data-availability-alt-label">',
                            '<tpl if="alt_label">', //determines if we have a learn about page to back the assay
                                '<span>Labeled as {alt_label:htmlEncode}</span>',
                            '</tpl>',
                        '</td>',
                    '</tr>',
                '</table>',
             '</tpl>',
                {
                    getDataLink: function () {

                        return encodeURIComponent(me.data.dataLink);
                    },
                    getRemainingListSize: function() {
                        return me.data.model.data[me.data.dataField].length - 10;
                    }
                }
        )
    },

    getDataAddedTemplate : function() {
        var me = this;
        return new Ext4.XTemplate(
                '<tpl>',
                    '<table>',
                        '<tpl if="data_index &lt; 10">',
                            '<tr>',
                                '<td>',
                                    '<tpl if="has_data">',
                                        '<tpl if="has_access">',
                                            '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/smallCheck.png"/>',
                                        '<tpl else>',
                                            '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/grayCheck.png"/>',
                                        '</tpl>',
                                    '<tpl else>',
                                        '<img class="detail-has-data-small" src="' + Connector.resourceContext.path + '/images/learn/smallGreyX.png">',
                                    '</tpl>',
                                '</td>',
                                '<td>',
                                    '<tpl if="data_label">', //determines if we have a learn about page to back the assay
                                        '<a href="#learn/learn/',
                                        '{[this.getDataLink()]}',
                                        '/{[encodeURIComponent(values.data_link_id)]}">{data_label:htmlEncode}</a>',
                                    '<tpl else>',
                                        '<span>{data_id:htmlEncode}</span>',
                                    '</tpl>',
                                '</td>',
                                '<td class="data-availability-alt-label">',
                                    '<tpl if="alt_label">', //determines if we have a learn about page to back the assay
                                        '<span>Labeled as {alt_label:htmlEncode}</span>',
                                    '</tpl>',
                                '</td>',
                            '</tr>',
                        '</tpl>',
                    '</table>',

                    '<tpl if="data_index === 9">',
                        'and {[this.getRemainingListSize()]} more ',
                        '<span id="integrated-data-showAll" class="show-hide-toggle-integrateddata">(show all)</span>',
                        '</br></br>',
                    '</tpl>',
                '</tpl>',
                {
                    getDataLink: function() {

                        return encodeURIComponent(me.data.dataLink);
                    },
                    getRemainingListSize: function() {
                            return me.data.model.data[me.data.dataField].length - 10;
                    }
                })
    },

    getTitleData: function(data) {
        var details = data.model.getData()[this.data.dataField];
        if (!details || details.length == 0)
            data.hasDetails = false;
        else
            data.hasDetails = true;
        return data;
    },

    getGroupSubHeaderInstr: function(data) {

        var dataModel = data.model.getData()[this.data.dataField];

        var groupInstr = {};
        Ext4.Array.forEach(dataModel, function(dataRow){
                groupInstr[dataRow.data_group] = dataRow.data_group_instr;
        }, this);

        return groupInstr;
    },

    getDataAddedStore : function(data) {
        var storeConfig =  {
                model: "DataAdded",
                data: data.model.getData()[this.data.dataField]
        };
        if (this.data.hasGrouping) {
            storeConfig.groupField = 'data_group';
            storeConfig.groupDir = this.data.groupDir ? this.data.groupDir : 'DESC';
        }
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
    }
});

Ext.define("DataAdded", {
    extend: "Ext.data.Model",
    fields: [
        {name: 'data_link_id'},
        {name: 'data_label'},
        {name: 'alt_label'},
        {name: 'has_data'},
        {name: 'has_access'},
        {name: 'data_id'},
        {name: 'data_status', convert: function(value) {
            return value ? value : "Status not available";
        }},
        {name: 'data_group'},
        {name: 'data_group_instr'},
        {name: 'data_index'}
    ]
});
