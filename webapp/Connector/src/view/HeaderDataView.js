Ext.define('Connector.view.HeaderDataView', {

    extend: 'Ext.view.View',

    alias: 'widget.headerdataview',

    itemSelector: 'h1.lhdv',

    selectedItemCls: 'active',

    loadMask: false,

    initComponent : function() {

        if (this.tabSelectEventName)
            this.addEvents(this.tabSelectEventName);

        this.callParent();
    },

    //
    // Select a dimension by keyFieldName value. If this method is called and a name is
    // not provided then the first valid tab will be selected.
    //
    selectTab : function(fieldValue, skipEvent) {
        var store = this.getStore();

        if (!Ext.isDefined(fieldValue)) {
            fieldValue = store.getAt(0).get(this.keyFieldName);
        }

        var idx = store.findExact(this.keyFieldName, fieldValue);
        if (idx >= 0) {
            var model = store.getAt(idx);
            if (!this.rendered) {
                this.on('afterrender', function() { this._select(model, skipEvent); }, this, {single: true});
            }
            else {
                this._select(model, skipEvent);
            }
        }
        else {
            console.warn('Unable to select tab:', fieldValue);
        }
    },

    _select : function(model, skipEvent) {
        this.getSelectionModel().select(model);
        if (this.tabSelectEventName && !skipEvent)
            this.fireEvent(this.tabSelectEventName, model);
    }
});