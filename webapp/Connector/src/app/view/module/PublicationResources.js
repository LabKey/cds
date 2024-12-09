/*
 * Copyright (c) 2016-2024 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.PublicationResources', {

    xtype : 'app.module.publicationresources',

    extend : 'Connector.view.module.BaseModule',

    tpl : new Ext.XTemplate(
            '<tpl if="external_links.length &gt; 0">',
                '<h3>{title_publication_resources:htmlEncode}</h3>',
                '<tpl for="external_links">',
                    '<div class="item-row">',
                        'Search for publication data in <a href="{link_url}" target="_blank">{link_label:htmlEncode} <img src="' + LABKEY.contextPath + '/Connector/images/outsidelink.png' + '"/></a><br/>',
                    '</div>',
                '</tpl>',
            '</tpl>'
    ),

    initComponent : function() {
        var data = this.initialConfig.data.model.data;
        data['title_publication_resources'] = this.initialConfig.data.title;

        this.update(data);
    }
});
