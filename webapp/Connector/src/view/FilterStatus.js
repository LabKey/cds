Ext.define('Connector.view.FilterStatus', {
    extend : 'Ext.panel.Panel',

    alias  : 'widget.filterstatus',

    ui: 'custom',

    padding: '27 0 0 27',

    initComponent : function() {
        this.items = [
            this.getSelectionPanel(),
            this.getFilterPanel()
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
            title : 'Active filters',
            tbarButtons : [
                { text: 'save group', ui: 'rounded-inverted-accent', width: 87, itemId: 'savegroup', hidden: hidden }
                ,{ text: 'clear filters',  ui: 'rounded-inverted-accent', width: 87, itemId: 'clear', hidden: hidden }
            ]
        });

        this.saveBtn = this.filterpanel.down('toolbar > #savegroup');
        this.clrBtn  = this.filterpanel.down('toolbar > #clear');

        if (this.filters) {
            this.filterpanel.loadFilters(this.filters);
        }

        return this.filterpanel;
    },

    getSelectionPanel : function() {
        if (this.selectionpanel)
            return this.selectionpanel;

        this.selectionpanel = Ext.create('Connector.panel.SelectionPanel', {
            title : 'Current Selection',
            tbarButtons : [
                { text: 'use as filter', itemId: 'overlap', ui : 'rounded-inverted-accent', width: 90 },
                { text: 'clear selection', itemId: 'sClear', ui : 'rounded-inverted-accent', width: 105 }
            ]
        });

        if (this.selections)
            this.selectionpanel.loadFilters(this.selections);

        return this.selectionpanel;
    },

    onFilterChange : function(filters) {
        if (this.filterpanel)
            this.filterpanel.loadFilters(filters);
        if (filters.length == 0) {
            this.saveBtn.hide();
            this.clrBtn.hide();
        }
        else {
            this.saveBtn.show();
            this.clrBtn.show();
        }
    },

    onSelectionChange : function(selections, opChange) {
        this.selections = selections;
        if (!opChange && this.selectionpanel)
            this.selectionpanel.loadFilters(selections);
    }
});
