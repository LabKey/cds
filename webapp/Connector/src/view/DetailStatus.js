/**
 * This class is meant to be a dumb view over a substatus model
 */
Ext.define('Connector.view.DetailStatus', {

    extend: 'Ext.view.View',

    alias: 'widget.detailstatus',

    trackOver: true,

    itemSelector: 'div.status-row',

    padding: '20 20 0 20',

    overItemCls: 'status-over',

    tpl: new Ext.XTemplate(
            '<ul class="detailstatus">',
                '<tpl for=".">',
                    '<div class="status-row">',
                        '<tpl if="highlight != undefined && highlight == true">',
                                '<li>',
                                      '<span class="statme hl-status-label">{label}</span>',
                                      '<span class="statme hl-status-count">{count:this.commaFormat}</span>',
                                '</li>',
                            '</div>',
                        '</tpl>',
                        '<tpl if="highlight == undefined || !highlight">',
                            '<li>',
                                '<span class="statme status-label">{label}</span>',
                                '<span class="statme status-count">{count:this.commaFormat}</span>',
                            '</li>',
                        '</tpl>',
                    '</div>',
                '</tpl>',
            '<ul>',
            {
                commaFormat : function(v) {
                    return Ext.util.Format.number(v, '0,000');
                }
            }
    ),

    initComponent : function() {
        this.filterTask  = new Ext.util.DelayedTask(this.filterChange, this);

        var loadUrl = LABKEY.contextPath + '/production/Connector/resources/images/grid/loading.gif';

        this.callParent();
    },

    onFilterChange : function() {
        this.filterTask.delay(100);
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