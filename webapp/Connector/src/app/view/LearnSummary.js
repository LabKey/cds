/*
 * Copyright (c) 2016 LabKey Corporation
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
        overflowFadeOut : function() {
            return '<div class="learn-fadeout"></div>' +
                    '<div class="learn-fadeout-hover"></div>';
        }
    },

    initComponent : function() {
        this.addEvents("learnGridResizeHeight");

        this.lockedViewConfig.emptyText = new Ext.XTemplate(
                '<div class="detail-empty-text">No available {itemPluralName} meet your selection criteria.</div>'
        ).apply({itemPluralName: this.itemPluralName});

        this.normalGridConfig.listeners = {
            itemmouseenter : function(view, record, item, index, evt) {
                if (record.data.data_availability) {
                    var checkmark = Ext.get(Ext.query(".detail-has-data", item)[0]),
                            id = Ext.id();
                    if (checkmark) {
                        checkmark.on('mouseenter', this.showDataAvailabilityTooltip, this, {
                            itemsWithDataAvailable: record.getData()[record.dataAvailabilityField],
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
                                itemsWithDataAvailable: record.getData()[record.dataAvailabilityField],
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

        var dataAvailableListHTML = "<ul>";
        for (var itr = 0; itr < options.itemsWithDataAvailable.length; ++itr) {
            dataAvailableListHTML += "<li>" + options.itemsWithDataAvailable[itr][config.recordField] + "</li>\n";
        }
        dataAvailableListHTML += "</ul>";

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
                _id = options.id,
                displayTooltip = setTimeout(function() {
                    calloutMgr.createCallout(Ext.apply({
                        id: _id,
                        xOffset: 10,
                        yOffset: -verticalOffset,
                        arrowOffset: verticalOffset,
                        showCloseButton: false,
                        target: item,
                        placement: 'right',
                        title: config.title + " with Data Available",
                        content: dataAvailableListHTML,
                        width: 190
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
