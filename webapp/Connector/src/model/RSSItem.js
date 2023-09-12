/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/* Models an RSS <item> element. See http://www.w3schools.com/rss/rss_item.asp */
Ext.define('Connector.model.RSSItem', {
    extend: 'Ext.data.Model',

    fields: [
        /* Required */
        {name: 'title'},
        {name: 'description'},
        {name: 'link'},

        /* Optional */
        {name: 'pubDate', type: 'date'},
        {name: 'guid'},
        {name: 'imageFile'} //Image file that is displayed as a thumbnail in the blog post. Location of these images should be set via module property 'BlogPost'.
    ],

    proxy: {
        type: 'ajax',
        url: LABKEY.ActionURL.buildURL('cds', 'news.api'),
        reader: {
            type: 'json',
            root: 'items'
        }
    }
});