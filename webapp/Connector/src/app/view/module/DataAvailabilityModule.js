/*
 * Copyright (c) 2016-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.DataAvailabilityModule', {
    xtype: 'app.module.dataavailability',

    extend: 'Ext.container.Container',

    cls: 'module learn-data-available-module',

    showAll: false,

    showAllGroupFlags: [], //to set showAll flag for each grouping/sub-sections

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

        if (this.data.hasGrouping) {
            this.data['groupSubHeaderInstr'] = this.getGroupSubHeaderInstr(this.data);
            this.setShowAllGroupFlags(this.data, this.showAllGroupFlags);
            this.data['groupShowAll'] = this.showAllGroupFlags;
        }
        this.data['showAll'] = this.showAll;
        this.update(this.data);

        this.toggleListTask = new Ext.util.DelayedTask(this.toggleList, this);
        var assay_iden = this.data.model.data.assay_identifier;

        this.items = [{
            html: (new Ext.XTemplate('<tpl if="hasDetails">',
                    '<div id="integrated-data-title"><p>',
                        Connector.constant.Templates.module.title,
                    '</p></div>',
                    '<p>',
                    this.getInstructions(assay_iden && assay_iden.toLowerCase() === 'nab mab' ? this.data.nabMabInstructions : this.data.instructions),
                    '</p>',
                    '</br>',
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
                    tpl: this.getDataAddedTemplate()
            }],
            store: this.getDataAddedStore(this.data),

            listeners : {
                'itemmouseenter' : function(view, record, item, index, evt) {
                    var dataLink = Ext.get(Ext.query("a:not(.instruction)", item)[0]) || Ext.get(Ext.query("span", item)[0]),
                            id = Ext.id();

                    var toolTipMsg_available = "Integrated data added to Dataspace";
                    var toolTipMsg_restricted = "Integrated data access is restricted";
                    var toolTipMsg_notAdded = "Integrated data has not been added at this time";

                    if (record.data.data_status && dataLink) {
                        dataLink.on('mouseenter', this.showDataStatusTooltip, this, {
                            status: record.data.has_data ? (record.data.has_access ? toolTipMsg_available : toolTipMsg_restricted) : toolTipMsg_notAdded,
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
                                status: record.data.has_data ? (record.data.has_access ? toolTipMsg_available : toolTipMsg_restricted) : toolTipMsg_notAdded,
                                id: id
                            });
                        }
                    }

                    if (this.data.hasGrouping) {

                        var groups = this.data.model.data[this.data.dataField].map(function(grp) {return grp.data_group;}).filter(function (value, index, self) {
                            return value === undefined || value === null ? false : self.indexOf(value) === index;
                        });

                        Ext.each(groups, function (grp, index) {
                            var showAllLinkGroup = Ext.get('integrated-data-showAll-' + (index + 1));
                            if (showAllLinkGroup) {
                                showAllLinkGroup.on('click', function (event) {
                                    this.toggleListTask.delay(100, null, this, [event, grp]);
                                }, this);
                            }
                        }, this);
                    }
                    else {
                        var showAllLink = Ext.get('integrated-data-showAll');
                        if (showAllLink) {
                            showAllLink.on('click', function(){
                                this.toggleListTask.delay(100);
                            }, this);
                        }
                    }
                },

                'itemmouseleave' : function(view, record, item) {
                    var dataLink = Ext.get(Ext.query("a:not(.instruction)", item)[0]) || Ext.get(Ext.query("span", item)[0]);
                    if (dataLink) {
                        dataLink.un('mouseenter', this.showDataStatusTooltip, this);
                        dataLink.un('mouseleave', this.hideDataStatusTooltip, this);
                        dataLink.un('click', this.hideDataStatusTooltip, this);
                        this.fireEvent('hideTooltip');
                    }

                    if (this.data.hasGrouping) {
                        var groups = this.data.model.data[this.data.dataField].map(function (grp) {
                            return grp.data_group;
                        }).filter(function (value, index, self) {
                            return value === undefined || value === null ? false : self.indexOf(value) === index;
                        });
                        Ext.each(groups, function (grp, index) {
                            var showAllLinkGroup = Ext.get('integrated-data-showAll-' + (index + 1));
                            if (showAllLinkGroup) {
                                showAllLinkGroup.un('click', function (grp) {
                                    this.toggleListTask.delay(100, null, this, [event, grp]);
                                }, this);
                            }

                        }, this);
                    }
                    else {
                        var showAllLink = Ext.get('integrated-data-showAll');
                        if (showAllLink) {
                            showAllLink.un('click', function(){
                                this.toggleListTask.delay(100);
                            }, this);
                        }
                    }
                },

                scope: this
            },
            scope: this
        }, this.getGroupingFeature())];

        this.callParent();
    },

    getInstructions: function (instructions) {


        var instrWithHyperlink = instructions;

        // Commenting out below code for now, adding hyperlinks to subheader text has introduced a regression with tooltips.
        // See Dataspace tickets:  41685 & 42000. Will have to re-implement hyperlink addition as part of ticket 42000
        if (instructions) {
            if (instrWithHyperlink.indexOf("Monoclonal antibodies") >= 0) {
                var splitInstr = instrWithHyperlink.split("Monoclonal antibodies");
                instrWithHyperlink = splitInstr[0] + "<a class=\"instruction\" href=\"#mabgrid\">Monoclonal antibodies</a>" + splitInstr[1];
            }
            if (instrWithHyperlink.indexOf("Plot") >= 0) {
                var splitPlot = instrWithHyperlink.split("Plot");
                instrWithHyperlink = splitPlot[0] + "<a class=\"instruction\" href=\"#chart\">Plot</a>" + splitPlot[1];
            }
            if (instrWithHyperlink.indexOf("Grid") >= 0) {
                var splitGrid = instrWithHyperlink.split("Grid");
                instrWithHyperlink = splitGrid[0] + "<a class=\"instruction\" href=\"#data\">Grid</a>" + splitGrid[1];
            }
        }

        return instrWithHyperlink;
    },

    toggleList: function(event, grpName) {
        var data = this.data;
        var dataView = this.items.items[1].getView();
        var groupedDataRecords = this.getDataAddedStore(data).data.items;
        var groupedDataStore = dataView.panel.store;

        if (data.hasGrouping) {

            var idx = this.showAllGroupFlags.findIndex(function (value) {
                return value.groupName === grpName;
            });

            this.showAllGroupFlags[idx].showAll = !this.showAllGroupFlags[idx].showAll;

            if (this.showAllGroupFlags[idx].showAll) {
                Ext.each(groupedDataRecords, function (record, idx) {
                    if (record.data.data_index >= 10 && record.data.data_group === grpName) {
                        var rec = groupedDataStore.getAt(idx);
                        rec.set('data_show', true);

                    }
                });
            }
            else if (!this.showAllGroupFlags[idx].showAll) {
                Ext.each(groupedDataRecords, function (record, idx) {
                    if (record.data.data_index >= 10 && record.data.data_group === grpName) {
                        var rec = groupedDataStore.getAt(idx);
                        rec.set('data_show', false);
                    }
                });
            }
            Ext.get('integrated-data-showAll-'+(idx+1)).el.dom.scrollIntoView();
        }
        else {
            this.showAll = !this.showAll;
            data['showAll'] = this.showAll;
            this.update(data);

            if (this.showAll) {
                Ext.each(groupedDataRecords, function (record, idx) {
                    if (record.data.data_index >= 10) {
                        var rec = groupedDataStore.getAt(idx);
                        rec.set('data_show', true);
                    }
                });
            }
            else if (!this.showAll) {
                Ext.each(groupedDataRecords, function (record, idx) {
                    if (record.data.data_index >= 10) {
                        var rec = groupedDataStore.getAt(idx);
                        rec.set('data_show', false);
                    }
                });
            }
            Ext.get('integrated-data-title').el.dom.scrollIntoView();
        }
        dataView.panel.view.refresh();
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
                                        return me.getInstructions(me.data.groupSubHeaderInstr[key]);
                                    }
                                })
                    }
                ]
            }
        }
        return {};
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
                    '<tpl if="data_index === 10 && data_show === false">',
                        '</br>',
                        '<tpl if="this.hasGrouping()">',
                            '<tpl for="this.getGroups()">',
                                '<tpl if="parent.data_group === values">',
                                    '<table id="{[this.getGroupId(xindex)]}"><tr>',
                                        '<td>and {[this.getGroupedListSize(values)]} more </td>',
                                        '<td class="show-hide-toggle-integrateddata" style="padding-bottom:0px">(show all)</td>',
                                    '</tr></table>',
                                '</tpl>',
                            '</tpl>',
                        '<tpl else>',
                            '<table id="integrated-data-showAll"><tr>',
                                '<td>and {[this.getRemainingListSize()]} more </td>',
                                '<td class="show-hide-toggle-integrateddata" style="padding-bottom:0px">(show all)</td>',
                            '</tr></table>',
                        '</tpl>',
                        '</br>',
                    '<tpl elseif="data_index === 10 && data_show === true">',
                        '</br>',
                        '<tpl if="this.hasGrouping()">',
                            '<tpl for="this.getGroups()">',
                                '<tpl if="parent.data_group === values">',
                                    '<table id="{[this.getGroupId(xindex)]}"><tr>',
                                        '<td>and {[this.getGroupedListSize(values)]} more </td>',
                                        '<td class="show-hide-toggle-integrateddata"style="padding-bottom:0px">(show less)</td>',
                                    '</tr></table>',
                                '</tpl>',
                            '</tpl>',
                        '<tpl else>',
                            '<table id="integrated-data-showAll"><tr>',
                                '<td>and {[this.getRemainingListSize()]} more </td>',
                                '<td class="show-hide-toggle-integrateddata"style="padding-bottom:0px">(show less)</td>',
                            '</tr></table>',
                        '</tpl>',
                        '</br>',
                    '</tpl>',
                    '<table>',
                        '<tpl if="data_index &gt; 9 && data_show === true">',
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
                '</tpl>',
                {
                    getDataLink: function() {

                        return encodeURIComponent(me.data.dataLink);
                    },
                    getRemainingListSize: function() {
                            return me.data.model.data[me.data.dataField].length - 10;
                    },
                    getGroupedListSize: function(group) {
                        var data = me.data.model.data[me.data.dataField];
                        var groupedList = data.map(function(grp) { return grp.data_group === group;}).filter(function(value, index, self) { return value === true});
                        return groupedList.length - 10;
                    },
                    hasGrouping: function () {
                        return me.data.hasGrouping;
                    },
                    getGroupId: function (idx) {
                        return "integrated-data-showAll-" + idx;
                    },
                    getGroups: function() {
                        return me.data.model.data[me.data.dataField].map(function(grp) {return grp.data_group}).filter(function (value, index, self) {
                            return value === undefined || value === null ? false : self.indexOf(value) === index;
                        });
                    },
                    getId: function () {
                        return Ext.id();
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

    setShowAllGroupFlags: function(data, groupFlags) {
        var groups = data.model.data[data.dataField].map(function (grp) {
            return grp.data_group
        }).filter(function (value, index, self) {
            return value === undefined || value === null ? false : self.indexOf(value) === index;
        });

        Ext.each(groups, function(grp){

            var grpShowAllFlagObj = {
              groupName: grp,
              showAll: false
            };
            groupFlags.push(grpShowAllFlagObj)
        });
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
        {name: 'data_index'},
        {name: 'data_show'}
    ]
});
