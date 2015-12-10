/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.FilterStatus', {
    extend : 'Ext.panel.Panel',

    alias  : 'widget.filterstatus',

    plugins: ['messaging'],

    ui: 'custom',

    cls: 'filterstatus',

    initComponent : function() {
        this.items = [
            this.getFilterHeader(),
            this.getEmptyText(),
            this.getFilterContent()
        ];

        this.callParent();

        this.attachInternalListeners();
    },

    attachInternalListeners : function() {

        this.resizeTask = new Ext.util.DelayedTask(function() {
            this.resizeMessage();
        }, this);

        Ext.EventManager.onWindowResize(function() {
            this.resizeTask.delay(150);
        }, this);
    },

    getFilterHeader : function() {

        //
        // If filters or selections are present then we show the buttons (== !hidden)
        //
        var hidden = !(this.filters && this.filters.length > 0) || !(this.selections && this.selections.length > 0);

        return {
            xtype: 'container',
            itemId: 'filterheader',
            ui: 'custom',
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'box',
                cls: 'filterpanel-header',
                tpl: new Ext.XTemplate(
                    '<h2 class="filterheader-text section-title">{title:htmlEncode}</h2>'
                ),
                data: {
                    title: 'Active filters'
                }
            },{
                xtype: 'container',
                flex: 1
            },{
                xtype: 'button', 
                text: 'clear',
                ui: 'rounded-small',
                cls: 'filter-hdr-btn filterclear' /* for tests */,
                itemId: 'clear',
                hidden: hidden
            },{
                xtype: 'button', 
                text: 'save', 
                ui: 'rounded-inverted-accent-small', 
                cls: 'filter-hdr-btn filtersave' /* for tests */, 
                itemId: 'savegroup', hidden: hidden
            }]
        };
    },

    getEmptyText : function() {
        if (!this.emptyText) {
            this.emptyText = Ext.create('Ext.Component', {
                tpl: new Ext.XTemplate('<div class="emptytext">All subjects</div>'),
                data: {}
            });
        }
        return this.emptyText;
    },

    getFilterContent : function() {
        if (!this.filterContent) {
            this.filterContent = Ext.create('Ext.Container', {
                cls: 'filterstatus-content',
                hidden: !(this.filters && this.filters.length > 0) || !(this.selections && this.selections.length > 0),
                items: [
                    this.getFilterPanel(),
                    this.getSelectionPanel()
                ]
            });
        }

        return this.filterContent;
    },

    getFilterPanel : function() {
        if (this.filterpanel) {
            return this.filterpanel;
        }

        this.filterpanel = Ext.create('Connector.panel.FilterPanel', {
            id: 'filter-panel',
            filters: this.filters
        });

        return this.filterpanel;
    },

    getSelectionPanel : function() {
        if (this.selectionpanel) {
            return this.selectionpanel;
        }

        this.selectionpanel = Ext.create('Connector.panel.Selection', {
            id: 'selection-panel',
            filters: this.selections
        });

        return this.selectionpanel;
    },

    // This is called when the filter count changes, as well as when the filters change
    onFilterCount : function(filters) {
        if (this.filterpanel) {
            this.filterpanel.loadFilters(filters);
            this.checkButtons();
        }
    },

    //23658 - Don't remove undo message when applying filter removal to plot.
    onFilterChange : function(filters) {
        this.hideMessage(true);
        this.onFilterCount(filters)
    },

    onFilterRemove : function() {
        this.showUndoMessage();
    },

    showUndoMessage : function(msg) {
        var id = Ext.id();
        if (msg)
            this.showMessage(msg + ' <a id="' + id + '">Undo</a>', true, true);
        else
            this.showMessage('Filter removed. <a id="' + id + '">Undo</a>', true, true);

        var undo = Ext.get(id);
        if (undo) {
            undo.on('click', this.onUndo, this, {single: true});
        }
    },

    onSelectionChange : function(selections, opChange) {
        this.hideMessage(true);
        this.selections = selections;
        if (!opChange && this.selectionpanel) {
            this.selectionpanel.loadFilters(selections);

            // update the filter panel here
            var filterPanel = this.getFilterPanel();
            if (filterPanel) {
                filterPanel.onSelectionChange(selections);
                this.checkButtons();
            }
        }
    },

    checkButtons : function() {

        var filters = Connector.getState().getFilters();
        var selections = Connector.getState().getSelections();

        var filterHeader = this.getComponent('filterheader');
        var headerText = Ext.get(Ext.DomQuery.select('.filterheader-text')[0]);

        var saveBtn = filterHeader.query('#savegroup')[0];
        var clrBtn = filterHeader.query('#clear')[0];

        var filterContent = this.getFilterContent();
        var emptyText = this.getEmptyText();

        if (filters.length == 0 && selections.length == 0) {
            headerText.replaceCls('section-title-filtered', 'section-title');
            emptyText.show();
            filterContent.hide();
            saveBtn.hide();
            clrBtn.hide();
        }
        else {
            headerText.replaceCls('section-title', 'section-title-filtered');
            emptyText.hide();
            filterContent.show();
            saveBtn.show();
            clrBtn.show();
        }
    },

    onUndo : function() {
        this.fireEvent('requestundo');
        this.hideMessage(true);
    },

    onBeforeViewChange : function() {
        if (Connector.getState().hasSelections()) {
            this.undoMsg = "Selection applied as filter.";
            Connector.getState().moveSelectionToFilter();
        }
    },

    onAfterViewChange : function() {
        this.hideMessage(true);
        if (this.undoMsg) {
            this.showUndoMessage(this.undoMsg);
            delete this.undoMsg;
        }
    }
});
