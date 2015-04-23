/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.FilterStatus', {
    extend : 'Ext.panel.Panel',

    alias  : 'widget.filterstatus',

    plugins: ['messaging'],

    ui: 'custom',

    padding: '20 20 0 20',

    initComponent : function() {
        this.items = [
            this.getFilterPanel(),
            this.getSelectionPanel()
        ];

        this.callParent();
    },

    getFilterPanel : function() {

        if (this.filterpanel) {
            return this.filterpanel;
        }

        //
        // If filters are present then we show the buttons (== !hidden)
        //
        var hidden = !(this.filters && this.filters.length > 0);

        this.filterpanel = Ext.create('Connector.panel.FilterPanel', {
            title: 'Active filters',
            id: 'filter-panel',
            headerButtons: [
                { xtype: 'button', text: 'save', width: 40, style: 'margin-top: 6px;', ui: 'linked', cls: 'filtersave' /* for tests */, itemId: 'savegroup', hidden: hidden},
                { xtype: 'button', text: 'clear', width: 40, style: 'margin-top: 6px;', ui: 'linked', cls: 'filterclear' /* for tests */, itemId: 'clear', hidden: hidden}
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
            headerButtons : [
                { xtype: 'button', text: 'clear', width: 40, style: 'margin-top: 6px;', ui: 'linked', cls: 'selectionclear', itemId: 'sClear'}
            ],
            filters: this.selections
        });

        return this.selectionpanel;
    },

    onFilterChange : function(filters) {
        this.hideMessage(true);
        if (this.filterpanel) {
            this.filterpanel.loadFilters(filters);

            var saveBtn = this.filterpanel.query('container > #savegroup')[0];
            var clrBtn = this.filterpanel.query('container > #clear')[0];

            if (filters.length == 0) {
                saveBtn.hide();
                clrBtn.hide();
            }
            else {
                saveBtn.show();
                clrBtn.show();
            }
        }
    },

    onFilterRemove : function() {
        this.showUndoMessage();
    },

    showUndoMessage : function(msg) {
        var id = Ext.id();
        if(msg)
            this.showMessage(msg + ' <a id="' + id + '">Undo</a>', true, true);
        else
            this.showMessage('Filter removed. <a id="' + id + '">Undo</a>', true, true);

        var undo = Ext.get(id);
        if (undo) {
            undo.on('click', this.onUndo, this, {single: true});
        }
    },

    onSelectionChange : function(selections, opChange, callback) {
        this.hideMessage(true);
        this.selections = selections;
        if (!opChange && this.selectionpanel) {
            this.selectionpanel.loadFilters(selections);
        }

        if (callback && typeof callback == 'function')
            callback();
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
        if (this.undoMsg)
        {
            this.showUndoMessage(this.undoMsg);
            delete this.undoMsg;
        }
    }
});
