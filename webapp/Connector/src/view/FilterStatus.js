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
            headerButtons: [
                { xtype: 'button', text: 'save', cls: 'filtersave',  ui: 'rounded-inverted-accent', itemId: 'savegroup', style: 'margin: 4px 2px 0 35px;', hidden: hidden},
                { xtype: 'button', text: 'clear', cls: 'filterclear', ui: 'rounded-inverted-accent', itemId: 'clear', style: 'margin: 4px 2px 0 2px;', hidden: hidden}
            ],
            filters: this.filters
        });

        return this.filterpanel;
    },

    getSelectionPanel : function() {
        if (this.selectionpanel)
            return this.selectionpanel;

        this.selectionpanel = Ext.create('Connector.panel.Selection', {
            tbarButtons : [
                // 8pt font sizes
//                { text: 'use as filter', itemId: 'overlap', ui : 'rounded-inverted-accent', width: 85 },
//                { text: 'label as subgroup', itemId: 'subgroup', ui : 'rounded-inverted-accent', width: 123 },
//                { text: 'clear', itemId: 'sClear', ui : 'rounded-inverted-accent', width: 45 }
                // 7pt font sizes
                { text: 'use as filter', itemId: 'overlap', ui : 'rounded-inverted-accent', width: 80 },
                { text: 'label as subgroup', itemId: 'subgroup', ui : 'rounded-inverted-accent', width: 107 },
                { text: 'clear', cls: 'selectionclear', itemId: 'sClear', ui : 'rounded-inverted-accent', width: 45 }
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

    onFilterRemove : function(filters) {
        this.showUndoMessage();
    },

    showUndoMessage : function() {
        var id = Ext.id();
        this.showMessage('Filter removed. <a id="' + id + '">Undo</a>', true, true);
        var undo = Ext.get(id);
        if (undo) {
            undo.on('click', this.onUndo, this, {single: true});
        }
    },

    onSelectionChange : function(selections, opChange) {
        this.selections = selections;
        if (!opChange && this.selectionpanel)
            this.selectionpanel.loadFilters(selections);
    },

    onUndo : function() {
        this.fireEvent('requestundo');
        this.hideMessage(true);
    }
});
