/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.LearnSummary', {
    extend : 'Connector.app.view.LearnGrid',

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

    initComponent : function() {
        this.addEvents("learnGridResizeHeight");

        this.lockedViewConfig.emptyText = new Ext.XTemplate(
                '<div class="detail-empty-text">No available {itemPluralName} meet your selection criteria.</div>' +
                '<div class="detail-empty-subtext">Search returns exact match on text. Try adjusting your search.</div>' +
                '<tpl if="emptySearchSubtext"><div class="detail-empty-subtext">{emptySearchSubtext}</div></tpl>'
        ).apply({itemPluralName: this.itemPluralName, emptySearchSubtext: this.emptySearchSubtext});

        this.normalGridConfig.listeners = {
            itemmouseenter : function(view, record, item, index, evt) {
                if (record.data.data_availability || record.data.ni_data_availability || record.data.pub_available_data_count > 0) {
                    var checkmark = Ext.get(Ext.query(".detail-has-data", item)[0]),
                            id = Ext.id();
                    if (checkmark) {
                        checkmark.on('mouseenter', this.showDataAvailabilityTooltip, this, {
                            itemsWithDataAvailable: record.data.data_availability ? record.getData()[record.dataAvailabilityField] : record.getData()[record.ni_dataAvailabilityField],
                            itemsWithPubDataAvailable: record.data.publications,
                            id: id
                        });
                        checkmark.on('mouseleave', this.hideDataAvailabilityTooltip, this);
                        checkmark.on('click', this.hideDataAvailabilityTooltip, this);

                        //If moving the cursor reasonably quickly, then it's possible to cause the "mouseenter" event to
                        //fire before "itemmouseenter" fires.
                        var textRect = checkmark.dom.getBoundingClientRect();
                        var cursorX = evt.browserEvent.clientX;
                        var cursorY = evt.browserEvent.clientY;
                        if (textRect.top <= cursorY && cursorY <= textRect.bottom
                                && textRect.left <= cursorX && cursorX <= textRect.right) {
                            this.showDataAvailabilityTooltip(evt, checkmark.dom, {
                                itemsWithDataAvailable:  record.data.data_availability ? record.getData()[record.dataAvailabilityField] : record.getData()[record.ni_dataAvailabilityField],
                                itemsWithPubDataAvailable: record.data.publications,
                                id: id
                            });
                        }
                    }
                }
            },

            itemmouseleave : function(view, record, item) {
                if (record.data.data_availability) {
                    var checkmark = Ext.get(Ext.query(".detail-has-data", item)[0]);
                    if (checkmark) {
                        checkmark.un('mouseenter', this.showDataAvailabilityTooltip, this);
                        checkmark.un('mouseleave', this.hideDataAvailabilityTooltip, this);
                        checkmark.un('click', this.hideDataAvailabilityTooltip, this);
                        this.hideDataAvailabilityTooltip();
                    }
                }
            },

            scope: this
        };

        this.callParent(arguments);
    },

    setTitleColumnWidth : function () {
        var col = this.columns[0];
        col.setWidth(Math.max(this.getWidth() / 2, col.minWidth));
    },

    showDataAvailabilityTooltip : function(event, item, options) {
        var config = this.dataAvailabilityTooltipConfig();
        var labelField = config.labelField || 'data_label';

        var pubTitle = "Publications";
        var pubLabelField = "label";

        var dataAvailableListHTML = "<ul>";
        var records = options.itemsWithDataAvailable, accessible = [], nonAccessible = [];
        var pub_records = options.itemsWithPubDataAvailable, availablePubData = [];
        Ext.each(records, function(record){
            if (record.docType === "Non-Integrated Assay") {

                config.title = "Non-Integrated Assay";
                labelField = 'label';

                if (record.isLinkValid && record.hasPermission)
                    accessible.push(record);
                else
                    nonAccessible.push(record);
            }
            else
            {
                if (record.has_access)
                    accessible.push(record);
                else
                    nonAccessible.push(record);
            }
        });

        Ext.each(pub_records, function(pub_record){
            if (pub_record.available_data_count > 0) {
                availablePubData.push(pub_record);
            }
        });

        if (accessible.length > 0) {
            dataAvailableListHTML += '<p class="data-availability-tooltip-header">' + config.title + " with Data Accessible" + '</p>';
            dataAvailableListHTML += "<ul>";
            Ext.each(accessible, function(record){
                dataAvailableListHTML += "<li>" + record[labelField] + "</li>\n";
            });
            dataAvailableListHTML += "</ul>";
        }
        if (nonAccessible.length > 0) {
            if (accessible.length > 0)
                dataAvailableListHTML += '<br>';
            dataAvailableListHTML += '<p class="data-availability-tooltip-header">' + config.title + " without Data Accessible" + '</p>';
            dataAvailableListHTML += "<ul>";
            Ext.each(nonAccessible, function(record){
                dataAvailableListHTML += "<li>" + record[labelField] + "</li>\n";
            });
            dataAvailableListHTML += "</ul>";
        }

        if (availablePubData.length > 0 && (accessible.length > 0 || nonAccessible.length > 0)) {
            dataAvailableListHTML += "<br>";
        }

        if (availablePubData.length > 0) {
            dataAvailableListHTML += '<p class="data-availability-tooltip-header">' + pubTitle + " with Data Accessible" + '</p>';
            dataAvailableListHTML += "<ul>";
            Ext.each(availablePubData, function(record){
                dataAvailableListHTML += "<li>" + record[pubLabelField] + "</li>\n";
            });
            dataAvailableListHTML += "</ul>";
        }

        var itemWrapped = Ext.get(item);
        var verticalPosition = itemWrapped.getAnchorXY()[1];
        var viewHeight = itemWrapped.parent("#app-main").getHeight();
        var calloutHeight = 2 //borders
                            + 30 //content padding
                            + 19 //title line height
                            + 8 //title bottom padding
                            + (17 //line height for content <li> elements
                                * options.itemsWithDataAvailable.length);

        var verticalOffset = verticalPosition + calloutHeight > viewHeight ? calloutHeight - itemWrapped.getHeight() : 0;

        var calloutMgr = hopscotch.getCalloutManager(),
                _id = options.id + (options.itemsWithPubDataAvailable ? ("-pub-" + options.itemsWithPubDataAvailable.length) : ''),
                displayTooltip = setTimeout(function() {
                    calloutMgr.createCallout(Ext.apply({
                        id: _id,
                        xOffset: 10,
                        yOffset: -verticalOffset,
                        arrowOffset: verticalOffset,
                        showCloseButton: false,
                        target: item,
                        placement: 'right',
                        content: dataAvailableListHTML,
                        width: 220
                    }, {}));
                }, 200);

        this.on('hideTooltip', function() {
            clearTimeout(displayTooltip);
            calloutMgr.removeCallout(_id);
        }, this);
    },

    hideDataAvailabilityTooltip : function() {
        this.fireEvent('hideTooltip');
    }
});
