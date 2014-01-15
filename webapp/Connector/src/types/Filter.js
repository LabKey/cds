Ext.define('Connector.types.Filter', {

    extend : 'Ext.Base',

    singleton : true,

    constructor : function() {

        Ext.data.Types.FILTER = {
            convert : function(val, data) {
                var fObj = Ext.create('Connector.model.Filter', {
                    x : val.x,
                    y : val.y
                });
                return fObj;
            },
            sortType : function(val) {
                return val.x;
            },
            type : 'filter'
        };
    }
});