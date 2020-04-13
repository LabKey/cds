/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.PublicationDetails', {

    xtype : 'app.module.publicationdetails',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
            '<tpl>',
            Connector.constant.Templates.module.title,

            '<tpl if="journal_short || date || volume">',
            '<div class="publication_item">',
            '<tpl if="journal_short">{journal_short:htmlEncode}. </tpl>',
            '<tpl if="date">{date:htmlEncode};</tpl>',
            '<tpl if="volume">{volume:htmlEncode}</tpl>',
            '<tpl if="issue">({issue:htmlEncode})</tpl>',
            '<tpl if="location">:{location:htmlEncode}</tpl>',
            '.',
            '</div>',
            '</tpl>',


            '<tpl if="pmid">',
            '<div class="publication_item">',
            '<span>PubMed ID: </span>',
            '<tpl if="link">',
            '<a href="{link:htmlEncode}" target="_blank">{pmid:htmlEncode}</a>',
            '<tpl else>',
            '{pmid:htmlEncode}',
            '</tpl>',
            '</div>',
            '</tpl>',

            '</tpl>'
    ),

    initComponent : function() {
        var data = this.initialConfig.data.model.data;
        console.log(data);
        data['title'] = this.initialConfig.data.title;
        this.update(data);
    }

});
