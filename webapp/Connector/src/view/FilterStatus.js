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
            this.getFilterPanel(),
            this.getSelectionPanel()
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

    getFilterPanel : function() {

        if (this.filterpanel) {
            return this.filterpanel;
        }

        //
        // If filters or selections are present then we show the buttons (== !hidden)
        //
        var hidden = !(this.filters && this.filters.length > 0) || !(this.selections && this.selections.length > 0);

        this.filterpanel = Ext.create('Connector.panel.FilterPanel', {
            title: 'Active filters',
            id: 'filter-panel',
            headerButtons: [
                { xtype: 'button', text: 'clear', ui: 'linked', cls: 'filter-hdr-btn filterclear' /* for tests */, itemId: 'clear', hidden: hidden},
                { xtype: 'button', text: 'save', ui: 'linked', cls: 'filter-hdr-btn filtersave' /* for tests */, itemId: 'savegroup', hidden: hidden}
            ],
            filters: this.filters
        });

        return this.filterpanel;
    },

    getSelectionPanel : function() {
        if (this.selectionpanel)
            return this.selectionpanel;

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

        var saveBtn = this.filterpanel.query('container > #savegroup')[0];
        var clrBtn = this.filterpanel.query('container > #clear')[0];

        if (filters.length == 0 && selections.length == 0) {
            saveBtn.hide();
            clrBtn.hide();
        }
        else {
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
