Ext.define('Connector.component.News', {

    extend: 'Ext.view.View',

    alias: 'widget.cds-news',

    itemSelector: 'div.entry',

    loadMask: false,

    border: false,

    statics: {
        dateFormat: Ext.util.Format.dateRenderer('d M Y')
    },

    tpl: new Ext.XTemplate(
        '<h2 class="section-title bottom-spacer">News</h2>',
        '<tpl if="this.isEmpty(values)">',
            '<div class="grouplist-empty" style="font-size: 13pt; font-family: Arial;">Feeds not available</div>',
        '</tpl>',
        '<table style="font-size: 12px;">',
            '<tpl for=".">',
            '<tr class="entry" style="margin-top: 10px;">',
                '<td style="width: 110px; vertical-align: text-top; color: #a09c9c;">{pubDate:this.renderDate}</td>',
                '<td style="padding-right: 15px;">',
                    '<div><a href="{link}" target="_blank">{title}</a></div>',
                    '<div>{description}</div>',
                '</td>',
            '</tr>',
            '</tpl>',
        '</table>',
        {
            isEmpty : function(v) {
                return (!Ext.isArray(v) || v.length === 0);
            },
            renderDate : function(date) {
                return Connector.component.News.dateFormat(date);
            }
        }
    ),
    store: Ext.create('Ext.data.Store', {
        model: 'Connector.model.RSSItem',
        autoLoad: true
    })

});