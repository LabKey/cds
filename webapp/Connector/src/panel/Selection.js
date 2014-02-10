Ext.define('Connector.panel.Selection', {
    extend: 'Connector.panel.FilterPanel',

    alias: 'widget.selectionpanel',

    selectionMode: true,

    hideOnEmpty: true,

    cls: 'selectionpanel',

    padding: '20 0 0 0',

    title: 'Current Selection',

    initHeader : function() {

        // title
        var items = [{
            xtype: 'box',
            autoEl: {
                tag: 'div',
                cls: 'header',
                html: this.title
            }
        }];

        for (var i=0; i < this.headerButtons.length; i++) {
            items.push(this.headerButtons[i]);
        }

        return {
            xtype: 'container',
            layout: {
                type: 'hbox'
            },
            items: items
        };
    },

    createHierarchyFilter : function(filterset) {
        var view;
        if (filterset.isGroup()) {
            view = Ext.create('Connector.view.GroupSelection', {
                store: {
                    model: 'Connector.model.FilterGroup',
                    data: [filterset]
                }
            });
        }
        else if (filterset.isGrid()) {
            view = Ext.create('Connector.view.GridSelection', {
                store: {
                    model: 'Connector.model.Filter',
                    data: [filterset]
                }
            });
        }
        else {
            view = Ext.create('Connector.view.Selection', {
                store: {
                    model: 'Connector.model.Filter',
                    data: [filterset]
                }
            });
        }
        return view;
    },

    displayFilters : function(filters) {
        this.removeAll();
        this.add(this.initHeader());
        var panels = [];

        for (var f=0; f < filters.length; f++) {
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