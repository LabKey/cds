Ext.define('Connector.component.ActionTitle', {
    extend: 'Ext.Component',

    alias: 'widget.actiontitle',

    text: 'Action Title!',

    initComponent : function() {
        this.autoEl = {
            tag: 'div',
            cls: 'titlepanel',
            children: [{
                tag: 'span',
                html: this.text
            }]
        };
        this.callParent();
    }
});
