Ext.define('Connector.controller.Home', {

    extend : 'Connector.controller.AbstractViewController',

    stores : [],

    views : ['Home'],

    init : function() {

        this.control('grouplistview', {
            itemclick: function(v, grp) {
                var filters = grp.get('filters');
                if (Ext.isString(filters)) {
                    var strFilterArray = LABKEY.app.controller.Filter.filtersFromJSON(filters);
                    filters = [];
                    for (var f=0; f < strFilterArray.length; f++) {
                        filters.push(Ext.create('Connector.model.Filter', strFilterArray[f]));
                    }
                }
                else {
                    filters = filters.filters;
                }
//
                var pruned = this.getStateManager().pruneFilters(filters, this.getStateManager().getFilters());
                if (pruned.length > 0)
                    this.getStateManager().addFilters(pruned);
            }
        });

        this.callParent();
    },

    createView : function(xtype, config, context) {
        var v;

        if (xtype == 'home') {
            v = Ext.create('Connector.view.Home', {});
        }

        return v;
    },

    updateView : function(xtype, context) {}
});
