/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.LearnSummary', {
    extend : 'Connector.app.view.LearnGrid',

    columnLocking : false,

    statics: {
        dateRenderer : Ext.util.Format.dateRenderer("M jS, Y"),
        monthDiff : function(d1, d2) {
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth() + 1;
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        },
        studyCountText : function(studies) {
            var totalCount = studies.length, accessibleCount = 0;
            var description = "";
            Ext.each(studies, function(study){
                if (study.has_access)
                    accessibleCount++;
            });
            if (accessibleCount == totalCount)
                description += totalCount;
            else
                description += (accessibleCount + '/' + totalCount);
            description += (totalCount == 1 ? ' Study' : ' Studies');
            description += " Accessible";
            return description;
        }
    },

    hideToolTip : function(hoverComponent) {
        hoverComponent.un('mouseenter', this.showDataAvailabilityTooltip, this);
        hoverComponent.un('mouseleave', this.hideDataAvailabilityTooltip, this);
        hoverComponent.un('click', this.hideDataAvailabilityTooltip, this);
        this.hideDataAvailabilityTooltip();
    },

    showToolTip : function(hoverComponent, record, id, evt) {
        hoverComponent.on('mouseenter', this.showDataAvailabilityTooltip, this, {
            itemsWithDataAvailable: record.data.data_availability ? record.getData()[record.dataAvailabilityField] : [],
            itemsWithNIDataAvailable: record.data.ni_data_availability ? record.getData()[record.ni_dataAvailabilityField] : [],
            itemsWithPubDataAvailable: record.data.publications,
            id: id
        });
        hoverComponent.on('mouseleave', this.hideDataAvailabilityTooltip, this);
        hoverComponent.on('click', this.hideDataAvailabilityTooltip, this);

        //If moving the cursor reasonably quickly, then it's possible to cause the "mouseenter" event to
        //fire before "itemmouseenter" fires.
        var textRect = hoverComponent.dom.getBoundingClientRect();
        var cursorX = evt.browserEvent.clientX;
        var cursorY = evt.browserEvent.clientY;
        if (textRect.top <= cursorY && cursorY <= textRect.bottom
                && textRect.left <= cursorX && cursorX <= textRect.right) {
            this.showDataAvailabilityTooltip(evt, hoverComponent.dom, {
                itemsWithDataAvailable: record.data.data_availability ? record.getData()[record.dataAvailabilityField] : [],
                itemsWithNIDataAvailable: record.data.ni_data_availability ? record.getData()[record.ni_dataAvailabilityField] : [],
                itemsWithPubDataAvailable: record.data.publications,
                id: id
            });
        }
    },

    initComponent : function() {
        this.addEvents("learnGridResizeHeight");

        var emptyText = new Ext.XTemplate(
                '<div class="detail-empty-text">No available {itemPluralName} meet your selection criteria.</div>' +
                '<div class="detail-empty-subtext">Search returns exact match on text. Try adjusting your search.</div>' +
                '<tpl if="emptySearchSubtext"><div class="detail-empty-subtext">{emptySearchSubtext}</div></tpl>'
        ).apply({itemPluralName: this.itemPluralName, emptySearchSubtext: this.emptySearchSubtext});

        var listeners = {
            itemmouseenter : function(view, record, item, index, evt) {
                if (record.data.data_availability || record.data.ni_data_availability || record.data.pub_available_data_count > 0) {
                    var checkmark = Ext.get(Ext.query(".detail-has-data", item)[0]);
                    var dataAvailabilityText = Ext.get(Ext.query(".detail-gray-text", item)[0]);
                    var id = Ext.id() + "-" + index;
                    if (checkmark) {
                        this.showToolTip(checkmark, record, id, evt);
                    }
                    if (dataAvailabilityText) {
                        this.showToolTip(dataAvailabilityText, record, id, evt);
                    }
                }
            },

            itemmouseleave : function(view, record, item) {
                if (record.data.data_availability) {
                    var checkmark = Ext.get(Ext.query(".detail-has-data", item)[0]);
                    var dataAvailabilityText = Ext.get(Ext.query(".detail-gray-text", item)[0]);

                    if (checkmark) {
                        this.hideToolTip(checkmark);
                    }
                    if (dataAvailabilityText) {
                        this.hideToolTip(dataAvailabilityText);
                    }
                }
            },

            scope: this
        };

        if (this.columnLocking) {
            this.lockedViewConfig.emptyText = emptyText;
            this.normalGridConfig.listeners = listeners;
        }
        else {
            this.emptyText = emptyText;
            Ext.Object.each(listeners, function(key, value){
                this.listeners[key] = value;
            }, this);
        }

        this.callParent(arguments);

        // display a loading mask initially, stores must fire the dataloaded event to hide the mask
        if (this.showLoadingMask && !this.getStore().dataLoaded) {
            var me = this;
            var mask = setTimeout(function() {
                me.addPlugin({
                    ptype: 'loadingmask',
                    configs: [{
                        element: me,
                        loadingDelay: 0,
                        beginEvent: 'showload',
                        endEvent: 'hideload'
                    }]
                })
                me.fireEvent('showload', me);
            }, 250);

            this.getStore().on('dataloaded', function(){
                clearTimeout(mask);
                this.fireEvent('hideload', this);
            }, this);
        }
    },

    setTitleColumnWidth : function () {
        var col = this.columns[0];
        col.setWidth(Math.max(this.getWidth() / 2, col.minWidth));
    },

    showDataAvailabilityTooltip : function(event, item, options) {
        // the maximum count of data items to show per grouping
        var maxItems = 10;
        this.itemCount = 0;
        var titleLines = 0;

        var config = this.dataAvailabilityTooltipConfig();
        var labelField = config.labelField || 'data_label';

        var niTitle = "Non-integrated Assays";
        var niLabelField = "label";

        var pubTitle = "Publications";
        var pubLabelField = "label";

        var dataAvailableListHTML = "<ul>";
        var records = options.itemsWithDataAvailable, accessible = [], nonAccessible = [];
        var ni_records = options.itemsWithNIDataAvailable, ni_accessible = [], ni_nonAccessible = [];
        var pub_records = options.itemsWithPubDataAvailable, availablePubData = [];
        Ext.each(records, function(record){
            if (record.has_access)
                accessible.push(record);
            else
                nonAccessible.push(record);

        });

        Ext.each(ni_records, function(ni_record){
            if (ni_record.isLinkValid && ni_record.hasPermission)
                ni_accessible.push(ni_record);
            else
                ni_nonAccessible.push(ni_record);
        });

        Ext.each(pub_records, function(pub_record){
            if (pub_record.available_data_count > 0) {
                availablePubData.push(pub_record);
            }
        });

        if (config.title === "Publications") {
            if (accessible.length > 0) {
                titleLines++;
                dataAvailableListHTML += '<p>' + "Publication Data Available" + '</p>';
            }
        }
        else {
            if (accessible.length > 0) {
                titleLines++;
                dataAvailableListHTML += '<p class="data-availability-tooltip-header">' + config.title + " with Data Accessible" + '</p>';
                dataAvailableListHTML += this.addDataAvailabilityItems(accessible, labelField, maxItems);
            }
            if (nonAccessible.length > 0) {
                if (accessible.length > 0)
                    dataAvailableListHTML += '<br>';
                titleLines++;
                dataAvailableListHTML += '<p class="data-availability-tooltip-header">' + config.title + " without Data Accessible" + '</p>';
                dataAvailableListHTML += this.addDataAvailabilityItems(nonAccessible, labelField, maxItems);
            }

            if (accessible.length > 0 || nonAccessible.length > 0) {
                dataAvailableListHTML += "<br>";
            }

            if (ni_accessible.length > 0) {
                titleLines++;
                dataAvailableListHTML += '<p class="data-availability-tooltip-header">' + niTitle + " with Data Accessible" + '</p>';
                dataAvailableListHTML += this.addDataAvailabilityItems(ni_accessible, niLabelField, maxItems);
            }
            if (ni_nonAccessible.length > 0) {
                if (accessible.length > 0)
                    dataAvailableListHTML += '<br>';
                titleLines++;
                dataAvailableListHTML += '<p class="data-availability-tooltip-header">' + niTitle + " without Data Accessible" + '</p>';
                dataAvailableListHTML += this.addDataAvailabilityItems(ni_nonAccessible, niLabelField, maxItems);
            }

            if (availablePubData.length > 0 && (ni_accessible.length > 0 || ni_nonAccessible.length > 0)) {
                dataAvailableListHTML += "<br>";
            }

            if (availablePubData.length > 0) {
                titleLines++;
                dataAvailableListHTML += '<p class="data-availability-tooltip-header">' + pubTitle + " with Data Accessible" + '</p>';
                dataAvailableListHTML += this.addDataAvailabilityItems(availablePubData, pubLabelField, maxItems);
            }
        }

        var itemWrapped = Ext.get(item);
        var calloutHeight = 2 //borders
                            + 30 //content padding
                            + (30 * titleLines) //title line height and padding
                            + (17 * this.itemCount); //line height for content <li> elements
        var offsets = PlotTooltipUtils.computeTooltipOffsets(item, calloutHeight);

        var calloutMgr = hopscotch.getCalloutManager(),
                _id = options.id + (options.itemsWithPubDataAvailable ? ("-pub-" + options.itemsWithPubDataAvailable.length) : ''),
                displayTooltip = setTimeout(function() {
                    calloutMgr.createCallout(Ext.apply({
                        id: _id,
                        xOffset: itemWrapped.el.dom.className === "detail-gray-text" ? -35 : 20,
                        yOffset: offsets.yOffset,
                        arrowOffset: offsets.arrowOffset,
                        showCloseButton: false,
                        target: item,
                        placement: 'right',
                        content: dataAvailableListHTML,
                        width: 300
                    }, {}));
                }, 200);

        this.on('hideTooltip', function() {
            clearTimeout(displayTooltip);
            calloutMgr.removeCallout(_id);
        }, this);
    },

    addDataAvailabilityItems : function(items, labelField, maxItems) {
        var html = "";
        html += "<ul>";
        Ext.each(items, function(record, idx, data){
            html += "<li>" + record[labelField] + "</li>\n";
            this.itemCount++;
            if (idx+1 >= maxItems && data.length > maxItems) {
                html += '<li>and ' + (data.length - maxItems) + ' more...</li>';
                this.itemCount++;
                return false;
            }
        }, this);
        html += "</ul>";

        return html;
    },

    hideDataAvailabilityTooltip : function() {
        this.fireEvent('hideTooltip');
    }
});
