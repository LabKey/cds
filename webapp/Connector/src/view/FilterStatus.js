Ext.define('Connector.view.FilterStatus', {
    extend : 'Ext.panel.Panel',

    requires : ['Connector.model.Detail', 'Connector.panel.Feedback'],

    alias  : 'widget.filterstatus',

    padding: '27 0 0 27',

    initComponent : function() {
        this.items = [
            this.getSelectionPanel(),
            this.getFilterPanel(),
            this.getDetailStatus()
        ];

        this.callParent();
    },

    getDetailStatus : function() {
        if (!this.detailstatus) {
            this.detailstatus = Ext.create('Connector.view.DetailStatus', {
                store : this.store
            });
        }

        return this.detailstatus;
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
            title : 'Active Filters',
            tbarButtons : [
                { text: 'save group', ui: 'rounded-inverted-accent', width: 87, itemId: 'savegroup', hidden: hidden }
//                ,{ text: 'save view',  ui: 'rounded-inverted-accent', width: 85, itemId: 'saveview' }
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
                { text: 'clear selection', itemId: 'sClear', ui : 'rounded-inverted-accent', width: 105}
//                { text: 'keep overlap', itemId: 'overlap', ui : 'rounded-inverted-accent', width: 85 },
//                { text: 'keep all', ui : 'rounded-inverted-accent', width: 56 },
//                { text: 'exclude', ui : 'rounded-inverted-accent', width: 56 }
//                ,{ text: 'save', ui : 'rounded-inverted-accent', width: 45 }
            ]
        });

        if (this.selections)
            this.selectionpanel.loadFilters(this.selections);

        return this.selectionpanel;
    },

    onFilterChange : function(filters) {
        if (this.detailstatus)
            this.detailstatus.filterTask.delay(100);
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
        if (this.detailstatus)
            this.detailstatus.filterTask.delay(100);
        if (!opChange && this.selectionpanel)
            this.selectionpanel.loadFilters(selections);
    }
});

Ext.define('Connector.view.DetailStatus', {

    extend : 'Ext.view.View',

    alias  : 'widget.detailstatus',

    trackOver : true,

    itemSelector: 'div.status-row',

    overItemCls: 'x-btn-rounded-inverted-accent-icon-small',

    initComponent : function() {
        this.filterTask  = new Ext.util.DelayedTask(this.filterChange, this);

        var loadUrl = LABKEY.contextPath + '/production/Connector/resources/images/grid/loading.gif';

        this.tpl = new Ext.XTemplate(
                '<tpl for=".">',
                '<tpl if="highlight != undefined && highlight == true">',
                '<div class="highlight-value">{count:this.commaFormat}<img id="statusloader" src="' + loadUrl +'" alt="loading" height="20" width="20" style="margin-left: 6px; visibility: hidden;"/></div>',
                '<div class="highlight-label">',
                '<span>{label}</span>',
                '</div>',
                '</tpl>',
                '<tpl if="highlight == undefined || !highlight">',
                '<div class="status-row" style="width: 120px;">',
                '<span class="x-btn-inner">{count:this.commaFormat}&nbsp;{label}</span>',
                '<span class="x-btn-icon"></span>',
                '</div>',
                '</tpl>',
                '</tpl>',
                {
                    commaFormat : function(value) {
                        return Ext.util.Format.number(value, '0,000');
                    }
                }
        );

        this.callParent();
    },

    filterChange : function() {
        this.showLoad();
        this.store.load();
    },

    showLoad : function() {
        var el = Ext.get('statusloader');
        if (el) {
            el.setStyle('visibility', 'visible');
        }
    },

    hideLoad : function() {
        var el = Ext.get('statusloader');
        if (el) {
            el.setStyle('visibility', 'hidden');
        }
    }
});
