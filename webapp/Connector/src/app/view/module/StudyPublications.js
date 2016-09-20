/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.module.StudyPublications', {

    xtype : 'app.module.studypublications',

    extend : 'Connector.view.module.BaseModule',

    plugins : ['documentvalidation'],

    tpl : new Ext.XTemplate(
            '<tpl if="publications && publications.length &gt; 0">',
                '<h3>{title_study_publications}</h3>',
                '<table class="learn-study-info">',
                    '<tpl for="publications">',
                        '<tr>',
                            '<tpl if="issue">',
                                '<td class="item-value">{authors:htmlEncode}.{title:htmlEncode}.{journal:htmlEncode}.{date:htmlEncode};{volume}({issue:htmlEncode}):{location:htmlEncode}.<a href="{link}" target="_blank">{pmid:htmlEncode} <img src="' + LABKEY.contextPath + '/Connector/images/outsidelink.png' + '"/></a></td>',
                            '<tpl else>',
                                '<td class="item-value">{authors:htmlEncode}.{title:htmlEncode}.{journal:htmlEncode}.{date:htmlEncode};{volume:htmlEncode}:{location:htmlEncode}.<a href="{link}" target="_blank">{pmid:htmlEncode} <img src="' + LABKEY.contextPath + '/Connector/images/outsidelink.png' + '"/></a></td>',
                            '</tpl>',
                        '</tr>',
                    '</tpl>',
                '</table>',
            '</tpl>'
    ),

    initComponent : function() {
        this.callParent();

        var data = this.initialConfig.data.model.data;
        data['title_study_publications'] = this.initialConfig.data.title;

        this.update(data);
    },

    hasContent : function() {
        var pubs = this.initialConfig.data.model.data.publications;
        if (pubs) {
            return pubs.length > 0;
        }
        return false;
    }
});
