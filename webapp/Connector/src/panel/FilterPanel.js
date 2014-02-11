Ext.define('Connector.panel.FilterPanel', {

    extend: 'Ext.panel.Panel',

    alias: 'widget.filterpanel',

    ui: 'custom',

    preventHeader: true,

    cls: 'filterpanel',

    selectionMode: false,

    hideOnEmpty: false,

    headerButtons: [],

    filters: [],

    initComponent : function() {

        this.items = [this.initHeader()];

        this.dockedItems = [{
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            width: 230,
            items: this.tbarButtons
        }];

        this.callParent();

        if (Ext.isArray(this.filters)) {
            this.loadFilters(this.filters);
        }
    },

    initHeader : function() {

        // title
        var items = [{
            xtype: 'box',
            autoEl: {
                tag: 'h2',
                style: 'font-size: 17pt;',
                html: this.title
            }
        }];

        for (var i=0; i < this.headerButtons.length; i++) {
            items.push(this.headerButtons[i]);
        }

        return {
            xtype: 'container',
            ui: 'custom',
            style: 'margin-bottom: 10px;',
            layout: {
                type: 'hbox'
            },
            items: items
        };
    },

    createEmptyPanel : function() {
        return Ext.create('Ext.container.Container', {
            html : '<div class="emptytext">All subjects</div>'
        });
    },

    createHierarchyFilter : function(filterset) {
        var view = Ext.create('Connector.view.Selection', {
            cls: 'activefilter',
            store: {
                model: this.getModelClass(filterset),
                data: [filterset]
            }
        });
        return view;
    },

    getModelClass : function(filterset) {
        var model = 'Connector.model.Filter';
        if (filterset.isGroup()) {
            model = 'Connector.model.FilterGroup';
        }
        return model;
    },

    // entry point to load raw OLAP Filters
    loadFilters : function(filters) {
        this.displayFilters(filters);
    },

    displayFilters : function(filters) {
        this.removeAll();
        this.add(this.initHeader());
        var panels = [];

        for (var f=0; f < filters.length; f++) {
            // add filter ids
            filters[f].data.id = filters[f].id;
            panels.push(this.createHierarchyFilter(filters[f]));
        }

        if (panels.length > 0)
        {
            if (this.hideOnEmpty)
                this.show();
            this.add(panels);
        }
        else if (this.hideOnEmpty)
            this.hide();
        else
            this.add(this.createEmptyPanel());
    }
});

